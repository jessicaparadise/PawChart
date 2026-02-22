const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { hasPremiumAccess } = require('../middleware/requirePremium');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const APP_URL = process.env.APP_URL || 'https://pawchart.ai';

// POST /api/subscriptions/checkout — create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment processing not configured' });
  }
  if (!process.env.STRIPE_PRICE_ID) {
    return res.status(503).json({ error: 'Subscription price not configured' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/ai`,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/subscriptions/portal — open Stripe customer billing portal
router.post('/portal', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const db = getDb();
  const subscription = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(userId);

  if (!subscription?.stripe_customer_id) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${APP_URL}/ai`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: 'Failed to open billing portal' });
  }
});

// Stripe webhook handler — exported separately for raw body handling in server.js
async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Stripe webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getDb();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (!userId) return res.json({ received: true });

    const stripeSubId = session.subscription;
    const stripeCustomerId = session.customer;

    try {
      const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
      const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();

      const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id = ?').get(userId);
      if (existing) {
        db.prepare(`
          UPDATE subscriptions
          SET stripe_customer_id=?, stripe_subscription_id=?, stripe_session_id=?,
              status='active', current_period_end=?, updated_at=datetime('now')
          WHERE user_id=?
        `).run(stripeCustomerId, stripeSubId, session.id, periodEnd, userId);
      } else {
        db.prepare(`
          INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, stripe_session_id, status, current_period_end)
          VALUES (?, ?, ?, ?, ?, 'active', ?)
        `).run(uuidv4(), userId, stripeCustomerId, stripeSubId, session.id, periodEnd);
      }
    } catch (err) {
      console.error('Error processing checkout.session.completed:', err);
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object;
    const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString();
    const status = stripeSub.status === 'active' ? 'active' : 'inactive';

    db.prepare(`
      UPDATE subscriptions
      SET status=?, current_period_end=?, updated_at=datetime('now')
      WHERE stripe_subscription_id=?
    `).run(status, periodEnd, stripeSub.id);
  }

  res.json({ received: true });
}

module.exports = { router, webhookHandler };
