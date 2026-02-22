import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { formatDate, getSpeciesEmoji, getAge, getSpeciesColor } from '../../utils/helpers';
import AddPetModal from './AddPetModal';
import VaccinationTracker from '../health/VaccinationTracker';
import WeightChart from '../health/WeightChart';
import MedicationList from '../medications/MedicationList';
import ConditionList from '../health/ConditionList';
import AppointmentList from '../appointments/AppointmentList';
import ConfirmDialog from '../ui/ConfirmDialog';
import PetAIChat from '../ai/PetAIChat';

const TABS = ['Overview', 'Vaccinations', 'Weight', 'Medications', 'Conditions', 'Appointments', 'Ask AI'];

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification, fetchPets } = useApp();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  async function loadPet() {
    setLoading(true);
    try {
      const data = await api.getPet(id);
      setPet(data);
    } catch (err) {
      showNotification('Failed to load pet: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPet(); }, [id]);

  async function handleDelete() {
    try {
      await api.deletePet(id);
      showNotification(`${pet.name} removed from your pets`);
      fetchPets();
      navigate('/pets');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-2xl" />
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  if (!pet) return (
    <div className="text-center py-20">
      <p className="text-xl">Pet not found</p>
      <Link to="/pets" className="btn-primary mt-4">Back to pets</Link>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link to="/pets" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Pets
      </Link>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-24 h-24 bg-gradient-to-br from-paw-100 to-paw-300 rounded-2xl flex items-center justify-center text-5xl shadow-sm">
            {getSpeciesEmoji(pet.species)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{pet.name}</h1>
              <span className={`badge ${getSpeciesColor(pet.species)}`}>{pet.species}</span>
              {pet.gender && <span className="badge bg-gray-100 text-gray-600">{pet.gender}</span>}
            </div>
            {pet.breed && <p className="text-gray-500 mt-1">{pet.breed}</p>}
            <div className="flex flex-wrap gap-4 mt-3">
              {pet.date_of_birth && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>🎂</span>
                  <span>{formatDate(pet.date_of_birth)} ({getAge(pet.date_of_birth)})</span>
                </div>
              )}
              {pet.color && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>🎨</span>
                  <span>{pet.color}</span>
                </div>
              )}
              {pet.microchip_id && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>💡</span>
                  <span>Chip: {pet.microchip_id}</span>
                </div>
              )}
            </div>
            {pet.notes && <p className="text-sm text-gray-400 mt-2 italic">{pet.notes}</p>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowEdit(true)} className="btn-secondary text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button onClick={() => setShowDelete(true)} className="btn-danger text-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center p-4">
          <p className="text-2xl font-bold text-paw-600">{pet.vaccinations?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Vaccinations</p>
        </div>
        <div className="card text-center p-4">
          <p className="text-2xl font-bold text-blue-600">{pet.appointments?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Appointments</p>
        </div>
        <div className="card text-center p-4">
          <p className="text-2xl font-bold text-green-600">{(pet.medications || []).filter(m => m.active).length}</p>
          <p className="text-xs text-gray-500 mt-1">Active Meds</p>
        </div>
        <div className="card text-center p-4">
          <p className="text-2xl font-bold text-amber-600">{pet.weightRecords?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Weight Records</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-paw-600 text-paw-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Appointments</h3>
              {(pet.appointments || []).slice(0, 3).length === 0 ? (
                <p className="text-sm text-gray-400">No appointments recorded</p>
              ) : (pet.appointments || []).slice(0, 3).map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(a.date)} {a.time && `· ${a.time}`}</p>
                  </div>
                  <span className={`ml-auto badge ${a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Active Medications</h3>
              {(pet.medications || []).filter(m => m.active).length === 0 ? (
                <p className="text-sm text-gray-400">No active medications</p>
              ) : (pet.medications || []).filter(m => m.active).map(m => (
                <div key={m.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xl">💊</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.dosage} · {m.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'Vaccinations' && <VaccinationTracker petId={id} initialData={pet.vaccinations} onUpdate={loadPet} />}
        {activeTab === 'Weight' && <WeightChart petId={id} initialData={pet.weightRecords} onUpdate={loadPet} />}
        {activeTab === 'Medications' && <MedicationList petId={id} initialData={pet.medications} onUpdate={loadPet} />}
        {activeTab === 'Conditions' && <ConditionList petId={id} initialData={pet.conditions} onUpdate={loadPet} />}
        {activeTab === 'Appointments' && <AppointmentList petId={id} initialData={pet.appointments} onUpdate={loadPet} />}
        {activeTab === 'Ask AI' && <PetAIChat petId={id} petName={pet.name} />}
      </div>

      <AddPetModal open={showEdit} onClose={() => setShowEdit(false)} pet={pet} onSaved={() => { loadPet(); fetchPets(); }} />
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Pet"
        message={`Are you sure you want to delete ${pet.name}? All health records will be permanently removed.`}
        confirmLabel="Delete Pet"
      />
    </div>
  );
}
