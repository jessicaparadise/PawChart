const { getDb } = require('../db/database');

// Earl and any other VIP emails get lifetime premium access
// Set EARL_VIP_EMAIL env var; comma-separated for multiple
const VIP_EMAILS = (process.env.EARL_VIP_EMAIL || 'earl@pawchart.ai')
  .toLowerCase()
  .split(',')
  .map(e => e.trim());

function hasPremiumAccess(user, subscription) {
  if (user.is_vip) return true;
  if (VIP_EMAILS.includes(user.email.toLowerCase())) return true;
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  if (subscription.current_period_end && new Date(subscription.current_period_end) < new Date()) return false;
  return true;
}

function requirePremium(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
  }

  const subscription = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(userId);

  if (!hasPremiumAccess(user, subscription)) {
    return res.status(402).json({ error: 'Premium subscription required', code: 'PREMIUM_REQUIRED' });
  }

  req.user = user;
  next();
}

module.exports = { requirePremium, hasPremiumAccess, VIP_EMAILS };
