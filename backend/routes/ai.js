const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { getDb } = require('../db/database');
const { requirePremium } = require('../middleware/requirePremium');

const client = new Anthropic();

function calculateAge(dateOfBirth) {
  const birth = new Date(dateOfBirth);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) years--;
  if (years === 0) {
    const m = (now.getMonth() + 12 - birth.getMonth()) % 12;
    return `${m} month(s) old`;
  }
  return `${years} year(s) old`;
}

function getVaccineStatus(nextDueDate) {
  if (!nextDueDate) return 'no due date';
  const daysUntil = Math.ceil((new Date(nextDueDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'OVERDUE';
  if (daysUntil <= 30) return 'due soon';
  return 'up to date';
}

function buildPetContext(pet) {
  const db = getDb();
  const lines = [];

  lines.push('**Pet Profile:**');
  lines.push(`- Name: ${pet.name}`);
  lines.push(`- Species: ${pet.species}`);
  if (pet.breed) lines.push(`- Breed: ${pet.breed}`);
  if (pet.date_of_birth) lines.push(`- Age: ${calculateAge(pet.date_of_birth)} (born ${pet.date_of_birth})`);
  if (pet.gender) lines.push(`- Gender: ${pet.gender}`);
  if (pet.color) lines.push(`- Color: ${pet.color}`);
  if (pet.notes) lines.push(`- Notes: ${pet.notes}`);

  const vaccinations = db.prepare('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY date_administered DESC').all(pet.id);
  if (vaccinations.length > 0) {
    lines.push(`\n**Vaccinations (${vaccinations.length} total):**`);
    vaccinations.forEach(v => {
      const status = getVaccineStatus(v.next_due_date);
      lines.push(`- ${v.vaccine_name}: administered ${v.date_administered}${v.next_due_date ? `, next due ${v.next_due_date} [${status}]` : ''}`);
    });
  } else {
    lines.push('\n**Vaccinations:** None recorded');
  }

  const medications = db.prepare('SELECT * FROM medications WHERE pet_id = ?').all(pet.id);
  const activeMeds = medications.filter(m => m.active);
  if (activeMeds.length > 0) {
    lines.push('\n**Active Medications:**');
    activeMeds.forEach(m => {
      lines.push(`- ${m.name}: ${m.dosage}, ${m.frequency}${m.purpose ? ` (for: ${m.purpose})` : ''}${m.prescribed_by ? ` — prescribed by ${m.prescribed_by}` : ''}`);
    });
  } else {
    lines.push('\n**Active Medications:** None');
  }

  const appointments = db.prepare('SELECT * FROM appointments WHERE pet_id = ? ORDER BY date DESC LIMIT 5').all(pet.id);
  if (appointments.length > 0) {
    lines.push('\n**Recent/Upcoming Appointments:**');
    appointments.forEach(a => {
      lines.push(`- ${a.title}${a.appointment_type ? ` (${a.appointment_type})` : ''}: ${a.date}${a.time ? ` at ${a.time}` : ''} — ${a.status}${a.vet_name ? ` with ${a.vet_name}` : ''}${a.clinic_name ? ` at ${a.clinic_name}` : ''}`);
    });
  } else {
    lines.push('\n**Appointments:** None recorded');
  }

  const conditions = db.prepare('SELECT * FROM health_conditions WHERE pet_id = ?').all(pet.id);
  if (conditions.length > 0) {
    lines.push('\n**Health Conditions:**');
    conditions.forEach(c => {
      lines.push(`- ${c.condition_name}${c.severity ? ` (${c.severity} severity)` : ''}: ${c.status}${c.treatment ? ` — Treatment: ${c.treatment}` : ''}${c.diagnosed_by ? ` — Diagnosed by: ${c.diagnosed_by}` : ''}`);
    });
  } else {
    lines.push('\n**Health Conditions:** None recorded');
  }

  const weights = db.prepare('SELECT * FROM weight_records WHERE pet_id = ? ORDER BY recorded_at DESC LIMIT 5').all(pet.id);
  if (weights.length > 0) {
    lines.push('\n**Recent Weight Records (newest first):**');
    weights.forEach(w => {
      lines.push(`- ${w.weight} ${w.unit} on ${w.recorded_at}${w.notes ? ` (${w.notes})` : ''}`);
    });
  } else {
    lines.push('\n**Weight Records:** None recorded');
  }

  return lines.join('\n');
}

const AFFILIATE_INSTRUCTIONS = `
When recommending specific products (supplements, foods, toys, medications), include a purchase link:
- Chewy: [Product Name on Chewy](https://www.chewy.com/s?query=SEARCH+TERMS&ref=pawchart-ref)
- Amazon: [Product Name on Amazon](https://www.amazon.com/s?k=SEARCH+TERMS&tag=pawchart-20)
Replace SEARCH+TERMS with actual product search terms (use + for spaces).

When you detect a health concern that may need prompt attention, include this exact link once:
[Book a Virtual Vet Visit →](https://www.vetster.com/?utm_source=pawchart)`;

// POST /api/ai/chat — premium-gated chat
router.post('/chat', requirePremium, async (req, res) => {
  const { petId, message, history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    let systemPrompt = `You are PawChart AI, a knowledgeable and friendly pet health assistant built into the PawChart app. You help pet parents understand their pet's health records, interpret medical information, and answer general pet care questions.

Guidelines:
- Be warm, empathetic, and supportive
- Give clear, concise, and helpful answers
- Reference specific health data from the pet's records when relevant
- For any serious medical concerns, always recommend consulting a licensed veterinarian
- Use the pet's name when referring to them
- Today's date is ${new Date().toISOString().split('T')[0]}
${AFFILIATE_INSTRUCTIONS}`;

    if (petId) {
      const db = getDb();
      const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId);
      if (pet) {
        const context = buildPetContext(pet);
        systemPrompt += `\n\nYou are currently helping with health information for:\n\n${context}\n\nUse this data to give personalized, accurate answers.`;
      }
    }

    const messages = [
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message.trim() },
    ];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Failed to get AI response. Please try again.' });
  }
});

// POST /api/ai/insights — predictive health alerts for all pets (premium)
router.post('/insights', requirePremium, async (req, res) => {
  try {
    const db = getDb();
    const pets = db.prepare('SELECT * FROM pets').all();

    if (pets.length === 0) return res.json({ insights: [] });

    let context = 'Health data for all pets:\n\n';
    for (const pet of pets) {
      context += buildPetContext(pet) + '\n\n---\n\n';
    }

    const systemPrompt = `You are PawChart AI, a proactive pet health analyst. Analyze the provided health data and identify the most important insights and alerts for pet parents.
${AFFILIATE_INSTRUCTIONS}

Return ONLY a valid JSON array (no markdown wrapper, no explanation). Each element:
{
  "petName": "string",
  "type": "alert" | "recommendation" | "info",
  "title": "string (8 words max)",
  "message": "string (2-3 sentences; may include markdown-style links)",
  "urgent": true | false
}

Limit to 3–6 total insights. Prioritize: overdue vaccinations, concerning weight trends, medication reminders, upcoming vet needs, preventive care with product suggestions.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: context }],
    });

    let insights = [];
    try {
      const text = response.content[0].text.trim();
      // Strip markdown code fences if the model wraps anyway
      const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
      insights = JSON.parse(clean);
    } catch {
      insights = [];
    }

    res.json({ insights });
  } catch (err) {
    console.error('AI insights error:', err);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

module.exports = router;
