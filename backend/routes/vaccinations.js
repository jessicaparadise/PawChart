const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');

router.get('/pet/:petId', (req, res) => {
  const db = getDb();
  const records = db
    .prepare('SELECT * FROM vaccinations WHERE pet_id = ? ORDER BY date_administered DESC')
    .all(req.params.petId);
  res.json(records);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { pet_id, vaccine_name, date_administered, next_due_date, administered_by, batch_number, notes } = req.body;
  if (!pet_id || !vaccine_name || !date_administered) {
    return res.status(400).json({ error: 'pet_id, vaccine_name, and date_administered are required' });
  }
  const id = uuidv4();
  db.prepare(`
    INSERT INTO vaccinations (id, pet_id, vaccine_name, date_administered, next_due_date, administered_by, batch_number, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, pet_id, vaccine_name, date_administered, next_due_date || null, administered_by || null, batch_number || null, notes || null);

  res.status(201).json(db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(id));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Vaccination record not found' });

  const { vaccine_name, date_administered, next_due_date, administered_by, batch_number, notes } = req.body;
  db.prepare(`
    UPDATE vaccinations SET
      vaccine_name = ?, date_administered = ?, next_due_date = ?,
      administered_by = ?, batch_number = ?, notes = ?
    WHERE id = ?
  `).run(
    vaccine_name || record.vaccine_name,
    date_administered || record.date_administered,
    next_due_date !== undefined ? next_due_date : record.next_due_date,
    administered_by !== undefined ? administered_by : record.administered_by,
    batch_number !== undefined ? batch_number : record.batch_number,
    notes !== undefined ? notes : record.notes,
    req.params.id
  );

  res.json(db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM vaccinations WHERE id = ?').get(req.params.id);
  if (!record) return res.status(404).json({ error: 'Vaccination record not found' });
  db.prepare('DELETE FROM vaccinations WHERE id = ?').run(req.params.id);
  res.json({ message: 'Vaccination record deleted' });
});

module.exports = router;
