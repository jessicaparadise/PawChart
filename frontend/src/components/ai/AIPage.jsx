import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getSpeciesEmoji } from '../../utils/helpers';
import PetAIChat from './PetAIChat';

export default function AIPage() {
  const { pets, fetchPets, petsLoading } = useApp();
  const [selectedPetId, setSelectedPetId] = useState(null);

  useEffect(() => {
    if (pets.length === 0) fetchPets();
  }, []);

  useEffect(() => {
    // Auto-select first pet if only one exists
    if (pets.length === 1 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  const selectedPet = pets.find(p => p.id === selectedPetId);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Health Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions about your pet's health records, medications, vaccinations, and more.
        </p>
      </div>

      {/* Pet selector */}
      {pets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {pets.map(pet => (
            <button
              key={pet.id}
              onClick={() => setSelectedPetId(pet.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                selectedPetId === pet.id
                  ? 'border-paw-500 bg-paw-50 text-paw-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-paw-300 hover:bg-paw-50'
              }`}
            >
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
          <p className="text-sm text-gray-400 mt-1">Add a pet first to start chatting with the AI assistant.</p>
        </div>
      ) : !selectedPetId ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🤖</p>
          <p className="text-gray-600 font-medium">Select a pet to get started</p>
          <p className="text-sm text-gray-400 mt-1">Choose one of your pets above to chat about their health.</p>
        </div>
      ) : (
        <PetAIChat petId={selectedPetId} petName={selectedPet?.name} />
      )}
    </div>
  );
}
