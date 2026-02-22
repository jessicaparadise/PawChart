const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

// GET all pets
router.get('/', (req, res) => {
  const db = getDb();
  const pets = db.prepare('SELECT * FROM pets ORDER BY name ASC').all();
  res.json(pets);
});

// GET single pet with full details
router.get('/:id', (req, res) => {
  const db = getDb();
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  const vaccinations = db
    .prepare('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY date_administered DESC')
    .all(req.params.id);
  const appointments = db
    .prepare('SELECT * FROM appointments WHERE pet_id = ? ORDER BY date DESC')
    .all(req.params.id);
  const weightRecords = db
    .prepare('SELECT * FROM weight_records WHERE pet_id = ? ORDER BY recorded_at ASC')
    .all(req.params.id);
  const medications = db
    .prepare('SELECT * FROM medications WHERE pet_id = ? ORDER BY start_date DESC')
    .all(req.params.id);
  const conditions = db
    .prepare('SELECT * FROM health_conditions WHERE pet_id = ? ORDER BY diagnosed_date DESC')
    .all(req.params.id);

  res.json({ ...pet, vaccinations, appointments, weightRecords, medications, conditions });
});

// POST create pet
router.post('/', (req, res) => {
  const db = getDb();
  const { name, species, breed, date_of_birth, gender, color, microchip_id, photo_url, notes } = req.body;

  if (!name || !species) {
    return res.status(400).json({ error: 'Name and species are required' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO pets (id, name, species, breed, date_of_birth, gender, color, microchip_id, photo_url, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, species, breed || null, date_of_birth || null, gender || null, color || null, microchip_id || null, photo_url || null, notes || null);

  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(id);
  res.status(201).json(pet);
});

// PUT update pet
router.put('/:id', (req, res) => {
  const db = getDb();
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  const { name, species, breed, date_of_birth, gender, color, microchip_id, photo_url, notes } = req.body;

  db.prepare(`
    UPDATE pets SET
      name = ?, species = ?, breed = ?, date_of_birth = ?, gender = ?,
      color = ?, microchip_id = ?, photo_url = ?, notes = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    name || pet.name,
    species || pet.species,
    breed !== undefined ? breed : pet.breed,
    date_of_birth !== undefined ? date_of_birth : pet.date_of_birth,
    gender !== undefined ? gender : pet.gender,
    color !== undefined ? color : pet.color,
    microchip_id !== undefined ? microchip_id : pet.microchip_id,
    photo_url !== undefined ? photo_url : pet.photo_url,
    notes !== undefined ? notes : pet.notes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id));
});

// DELETE pet
router.delete('/:id', (req, res) => {
  const db = getDb();
  const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(req.params.id);
  if (!pet) return res.status(404).json({ error: 'Pet not found' });

  db.prepare('DELETE FROM pets WHERE id = ?').run(req.params.id);
  res.json({ message: 'Pet deleted successfully' });
});

module.exports = router;
