import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function SubscriptionSuccess() {
  const { refreshUser } = useUser();

  useEffect(() => {
    // Refresh subscription status after returning from Stripe
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="max-w-md mx-auto text-center py-20 space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto">
        🎉
      </div>
      <h1 className="text-2xl font-bold text-gray-900">You're Premium!</h1>
      <p className="text-gray-500">
        Welcome to PawChart Premium. AI insights and health alerts are now active for all your pets.
      </p>
      <Link to="/ai" className="btn-primary inline-block mt-4 px-8">
        Talk to PawChart AI →
      </Link>
    </div>
  );
}
