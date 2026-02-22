const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { hasPremiumAccess, VIP_EMAILS } = require('../middleware/requirePremium');

// GET /api/users/:id — get user with current subscription status
router.get('/:id', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const subscription = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(user.id);

  res.json({
    ...user,
    isPremium: hasPremiumAccess(user, subscription),
    subscription: subscription || null,
  });
});

// POST /api/users — create or find user by email
router.post('/', (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.trim()) return res.status(400).json({ error: 'Email is required' });

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();

  let user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);

  if (!user) {
    const id = uuidv4();
    const isVip = VIP_EMAILS.includes(normalizedEmail) ? 1 : 0;
    db.prepare('INSERT INTO users (id, email, name, is_vip) VALUES (?, ?, ?, ?)')
      .run(id, normalizedEmail, name?.trim() || null, isVip);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  } else if (name && !user.name) {
    db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name.trim(), user.id);
    user = { ...user, name: name.trim() };
  }

  const subscription = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(user.id);

  res.json({
    ...user,
    isPremium: hasPremiumAccess(user, subscription),
    subscription: subscription || null,
  });
});

module.exports = router;
