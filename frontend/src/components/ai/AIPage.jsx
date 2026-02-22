import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useUser } from '../../context/UserContext';
import { getSpeciesEmoji } from '../../utils/helpers';
import PetAIChat from './PetAIChat';
import UpgradePrompt from '../subscription/UpgradePrompt';
import UserSetupModal from '../auth/UserSetupModal';
import { api } from '../../utils/api';

export default function AIPage() {
  const { pets, fetchPets, petsLoading } = useApp();
  const { user, userLoading } = useUser();
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (pets.length === 0) fetchPets();
  }, []);

  useEffect(() => {
    if (pets.length === 1 && !selectedPetId) setSelectedPetId(pets[0].id);
  }, [pets]);

  const selectedPet = pets.find(p => p.id === selectedPetId);

  async function handleManageBilling() {
    if (!user) return;
    try {
      const { url } = await api.openBillingPortal(user.id);
      window.location.href = url;
    } catch (err) {
      alert(err.message);
    }
  }

  if (userLoading) {
    return <div className="max-w-3xl mx-auto"><div className="h-32 card animate-pulse" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your pet's health records, medications, vaccinations, and more.
          </p>
        </div>
        {user?.isPremium && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
              ✨ Premium
            </span>
            {user.subscription?.stripe_subscription_id && (
              <button onClick={handleManageBilling}
                className="text-xs text-gray-400 hover:text-gray-600 underline">
                Manage billing
              </button>
            )}
          </div>
        )}
      </div>

      {!user ? (
        <>
          <div className="card text-center py-10">
            <p className="text-3xl mb-3">🔐</p>
            <h3 className="font-semibold text-gray-900 mb-1">Create a free account to continue</h3>
            <p className="text-sm text-gray-500 mb-4">AI features require an account. Free to sign up.</p>
            <button onClick={() => setShowSetup(true)} className="btn-primary">Get started free</button>
          </div>
          <UserSetupModal open={showSetup} onClose={() => setShowSetup(false)} />
        </>
      ) : !user.isPremium ? (
        <UpgradePrompt onNeedAccount={() => setShowSetup(true)} />
      ) : (
        <>
          {/* Pet selector */}
          {pets.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {pets.map(pet => (
                <button key={pet.id} onClick={() => setSelectedPetId(pet.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    selectedPetId === pet.id
                      ? 'border-paw-500 bg-paw-50 text-paw-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-paw-300 hover:bg-paw-50'
                  }`}>
                  <span>{getSpeciesEmoji(pet.species)}</span>
                  {pet.name}
                </button>
              ))}
            </div>
          )}

          {petsLoading ? (
            <div className="card animate-pulse h-64" />
          ) : pets.length === 0 ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">🐾</p>
              <p className="text-gray-600 font-medium">No pets added yet</p>
              <Link to="/pets" className="btn-primary inline-block mt-4">Add your first pet</Link>
            </div>
          ) : !selectedPetId ? (
            <div className="card text-center py-16">
              <p className="text-4xl mb-3">🤖</p>
              <p className="text-gray-600 font-medium">Select a pet above to start chatting</p>
            </div>
          ) : (
            <PetAIChat petId={selectedPetId} petName={selectedPet?.name} />
          )}
        </>
      )}
    </div>
  );
}
