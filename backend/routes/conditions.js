const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/pet/:petId', (req, res) => {
  const db = getDb();
  const records = db
    .prepare('SELECT * FROM health_conditions WHERE pet_id = ? ORDER BY diagnosed_date DESC')
    .all(req.params.petId);
  res.json(records);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { pet_id, condition_name, diagnosed_date, diagnosed_by, severity, status, treatment, notes } = req.body;
  if (!pet_id || !condition_name) {
    return res.status(400).json({ error: 'pet_id and condition_name are required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO health_conditions (id, pet_id, condition_name, diagnosed_date, diagnosed_by, severity, status, treatment, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, pet_id, condition_name, diagnosed_date || null, diagnosed_by || null, severity || null, status || 'active', treatment || null, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Health condition not found' });

  const { condition_name, diagnosed_date, diagnosed_by, severity, status, treatment, notes } = req.body;
  db.prepare(`
    UPDATE health_conditions SET
      condition_name = ?, diagnosed_date = ?, diagnosed_by = ?,
      severity = ?, status = ?, treatment = ?, notes = ?
    WHERE id = ?
  `).run(
    condition_name || record.condition_name,
    diagnosed_date !== undefined ? diagnosed_date : record.diagnosed_date,
    diagnosed_by !== undefined ? diagnosed_by : record.diagnosed_by,
    severity !== undefined ? severity : record.severity,
    status || record.status,
    treatment !== undefined ? treatment : record.treatment,
    notes !== undefined ? notes : record.notes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM health_conditions WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Health condition not found' });
  db.prepare('DELETE FROM health_conditions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Health condition deleted' });
});

module.exports = router;
