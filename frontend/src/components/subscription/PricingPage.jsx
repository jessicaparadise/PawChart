import React from 'react';
import { Link } from 'react-router-dom';
import UpgradePrompt from './UpgradePrompt';
import UserSetupModal from '../auth/UserSetupModal';
import { useUser } from '../../context/UserContext';
import { useState } from 'react';

export default function PricingPage() {
  const { user } = useUser();
  const [showSetup, setShowSetup] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plans & Pricing</h1>
        <p className="text-sm text-gray-500 mt-1">Everything your pets need, with AI when they need it most.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free */}
        <div className="card border-2 border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Free</p>
          <p className="text-3xl font-bold text-gray-900">$0</p>
          <p className="text-sm text-gray-500 mb-4">Forever free</p>
          <ul className="space-y-2 text-sm text-gray-600">
            {['Unlimited pet profiles', 'Vaccination tracking', 'Appointment scheduling', 'Medication & weight logs', 'Health condition records'].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>{f}
              </li>
            ))}
          </ul>
          {!user ? (
            <button onClick={() => setShowSetup(true)} className="btn-secondary w-full mt-6 text-sm">
              Get started free
            </button>
          ) : (
            <div className="mt-6 text-center text-xs text-gray-400 font-medium py-2 bg-gray-50 rounded-xl">
              Your current plan
            </div>
          )}
        </div>

        {/* Premium */}
        <div className="card border-2 border-paw-500 relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-paw-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Popular
          </div>
          <p className="text-xs font-semibold text-paw-600 uppercase tracking-wide mb-1">Premium</p>
          <p className="text-3xl font-bold text-gray-900">$4.99</p>
          <p className="text-sm text-gray-500 mb-4">per month</p>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              'Everything in Free',
              'AI chat for any pet\'s records',
              'Predictive health alerts',
              'Smart product recommendations',
              'Telehealth referrals',
            ].map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-paw-600">✓</span>{f}
              </li>
            ))}
          </ul>
          {user?.isPremium ? (
            <div className="mt-6 text-center text-xs text-paw-700 font-medium py-2 bg-paw-50 rounded-xl">
              ✓ Active — <Link to="/ai" className="underline">Go to AI</Link>
            </div>
          ) : (
            <UpgradePrompt onNeedAccount={() => setShowSetup(true)} />
          )}
        </div>
      </div>

      <UserSetupModal open={showSetup} onClose={() => setShowSetup(false)} />
    </div>
  );
}
