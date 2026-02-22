import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { api } from '../../utils/api';

const FEATURES = [
  'AI chat about any pet\'s health records',
  'Smart affiliate product recommendations',
  'Telehealth referrals for urgent concerns',
  'Predictive health alerts on your dashboard',
];

export default function UpgradePrompt({ onNeedAccount }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubscribe() {
    if (!user) {
      onNeedAccount?.();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { url } = await api.createCheckout(user.id);
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="card text-center py-10 px-6">
      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
        ✨
      </div>
      <h2 className="text-xl font-bold text-gray-900">Unlock PawChart Premium</h2>
      <p className="text-gray-500 text-sm mt-2 mb-6">
        Get AI-powered insights, telehealth referrals, and smart product recommendations for your pets.
      </p>

      <ul className="text-left space-y-2 mb-8 max-w-xs mx-auto">
        {FEATURES.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="btn-primary px-8 py-3 text-base disabled:opacity-60"
        >
          {loading ? 'Redirecting to checkout…' : 'Subscribe for $4.99 / month'}
        </button>
        <p className="text-xs text-gray-400">Cancel anytime · Secure payment via Stripe</p>
      </div>

      {error && (
        <p className="mt-4 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}
