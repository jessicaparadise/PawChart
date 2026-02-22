import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getSpeciesEmoji, getAge, getSpeciesColor } from '../../utils/helpers';
import AddPetModal from './AddPetModal';
import EmptyState from '../ui/EmptyState';

export default function PetList() {
  const { pets, fetchPets, petsLoading } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const filtered = pets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.species.toLowerCase().includes(search.toLowerCase()) ||
    (p.breed || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-500 text-sm mt-1">{pets.length} pet{pets.length !== 1 ? 's' : ''} in your family</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Pet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search pets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-9"
        />
      </div>

      {/* Grid */}
      {petsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🐾"
          title={search ? 'No pets match your search' : 'No pets yet'}
          description={search ? 'Try a different name or species' : 'Add your first pet to get started tracking their health'}
          action={!search && (
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              Add your first pet
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(pet => (
            <Link
              key={pet.id}
              to={`/pets/${pet.id}`}
              className="card hover:shadow-md hover:border-paw-200 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-paw-100 to-paw-200 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:from-paw-200 group-hover:to-paw-300 transition-all">
                  {getSpeciesEmoji(pet.species)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                    <span className={`badge ${getSpeciesColor(pet.species)}`}>{pet.species}</span>
                  </div>
                  {pet.breed && <p className="text-sm text-gray-500 mt-0.5 truncate">{pet.breed}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {pet.date_of_birth && (
                      <span className="text-xs text-gray-400">🎂 {getAge(pet.date_of_birth)}</span>
                    )}
                    {pet.gender && (
                      <span className="text-xs text-gray-400">{pet.gender === 'Male' ? '♂' : '♀'} {pet.gender}</span>
                    )}
                  </div>
                </div>
              </div>
              {pet.notes && (
                <p className="mt-3 text-xs text-gray-400 line-clamp-2 border-t border-gray-50 pt-3">{pet.notes}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      <AddPetModal open={showAdd} onClose={() => setShowAdd(false)} onSaved={fetchPets} />
    </div>
  );
}
