import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';

export default function UserSetupModal({ open, onClose }) {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), name.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-paw-500 to-paw-700 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
            🐾
          </div>
          <h2 className="text-xl font-bold text-gray-900">Create your free account</h2>
          <p className="text-sm text-gray-500 mt-1">
            Store unlimited pet records for free. Unlock AI insights with premium.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Jessica"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-paw-400"
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-paw-400"
              autoComplete="email"
            />
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm disabled:opacity-60"
          >
            {loading ? 'Setting up…' : 'Get started for free'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          No credit card required. Upgrade anytime for AI features.
        </p>
      </div>
    </div>
  );
}
