const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/pet/:petId', (req, res) => {
  const db = getDb();
  const records = db
    .prepare('SELECT * FROM weight_records WHERE pet_id = ? ORDER BY recorded_at ASC')
    .all(req.params.petId);
  res.json(records);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { pet_id, weight, unit, recorded_at, notes } = req.body;
  if (!pet_id || weight === undefined || !recorded_at) {
    return res.status(400).json({ error: 'pet_id, weight, and recorded_at are required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO weight_records (id, pet_id, weight, unit, recorded_at, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, pet_id, weight, unit || 'kg', recorded_at, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM weight_records WHERE id = ?').get(id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM weight_records WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Weight record not found' });
  db.prepare('DELETE FROM weight_records WHERE id = ?').run(req.params.id);
  res.json({ message: 'Weight record deleted' });
});

module.exports = router;
