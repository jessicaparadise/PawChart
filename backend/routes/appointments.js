const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/', (req, res) => {
  const db = getDb();
  const appointments = db
    .prepare(`SELECT a.*, p.name as pet_name, p.species as pet_species
              FROM appointments a JOIN pets p ON a.pet_id = p.id
              ORDER BY a.date ASC, a.time ASC`)
    .all();
  res.json(appointments);
});

router.get('/upcoming', (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];
  const appointments = db
    .prepare(`SELECT a.*, p.name as pet_name, p.species as pet_species
              FROM appointments a JOIN pets p ON a.pet_id = p.id
              WHERE a.date >= ? AND a.status = 'scheduled'
              ORDER BY a.date ASC, a.time ASC
              LIMIT 10`)
    .all(today);
  res.json(appointments);
});

router.get('/pet/:petId', (req, res) => {
  const db = getDb();
  const records = db
    .prepare('SELECT * FROM appointments WHERE pet_id = ? ORDER BY date DESC')
    .all(req.params.petId);
  res.json(records);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { pet_id, title, appointment_type, date, time, vet_name, clinic_name, notes, status } = req.body;
  if (!pet_id || !title || !appointment_type || !date) {
    return res.status(400).json({ error: 'pet_id, title, appointment_type, and date are required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO appointments (id, pet_id, title, appointment_type, date, time, vet_name, clinic_name, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, pet_id, title, appointment_type, date, time || null, vet_name || null, clinic_name || null, notes || null, status || 'scheduled');

  res.status(201).json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Appointment not found' });

  const { title, appointment_type, date, time, vet_name, clinic_name, notes, status } = req.body;
  db.prepare(`
    UPDATE appointments SET
      title = ?, appointment_type = ?, date = ?, time = ?,
      vet_name = ?, clinic_name = ?, notes = ?, status = ?
    WHERE id = ?
  `).run(
    title || record.title,
    appointment_type || record.appointment_type,
    date || record.date,
    time !== undefined ? time : record.time,
    vet_name !== undefined ? vet_name : record.vet_name,
    clinic_name !== undefined ? clinic_name : record.clinic_name,
    notes !== undefined ? notes : record.notes,
    status || record.status,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Appointment not found' });
  db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Appointment deleted' });
});

module.exports = router;
