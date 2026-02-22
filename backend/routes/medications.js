const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/pet/:petId', (req, res) => {
  const db = getDb();
  const records = db
    .prepare('SELECT * FROM medications WHERE pet_id = ? ORDER BY start_date DESC')
    .all(req.params.petId);
  res.json(records);
});

router.get('/active', (req, res) => {
  const db = getDb();
  const records = db
    .prepare(`SELECT m.*, p.name as pet_name, p.species as pet_species
              FROM medications m JOIN pets p ON m.pet_id = p.id
              WHERE m.active = 1 ORDER BY m.name ASC`)
    .all();
  res.json(records);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { pet_id, name, dosage, frequency, start_date, end_date, prescribed_by, purpose, active, notes } = req.body;
  if (!pet_id || !name || !dosage || !frequency || !start_date) {
    return res.status(400).json({ error: 'pet_id, name, dosage, frequency, and start_date are required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO medications (id, pet_id, name, dosage, frequency, start_date, end_date, prescribed_by, purpose, active, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, pet_id, name, dosage, frequency, start_date, end_date || null, prescribed_by || null, purpose || null, active !== undefined ? (active ? 1 : 0) : 1, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM medications WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Medication not found' });

  const { name, dosage, frequency, start_date, end_date, prescribed_by, purpose, active, notes } = req.body;
  db.prepare(`
    UPDATE medications SET
      name = ?, dosage = ?, frequency = ?, start_date = ?, end_date = ?,
      prescribed_by = ?, purpose = ?, active = ?, notes = ?
    WHERE id = ?
  `).run(
    name || record.name,
    dosage || record.dosage,
    frequency || record.frequency,
    start_date || record.start_date,
    end_date !== undefined ? end_date : record.end_date,
    prescribed_by !== undefined ? prescribed_by : record.prescribed_by,
    purpose !== undefined ? purpose : record.purpose,
    active !== undefined ? (active ? 1 : 0) : record.active,
    notes !== undefined ? notes : record.notes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM medications WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Medication not found' });
  db.prepare('DELETE FROM medications WHERE id = ?').run(req.params.id);
  res.json({ message: 'Medication deleted' });
});

module.exports = router;
