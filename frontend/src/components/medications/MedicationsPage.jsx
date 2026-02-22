import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { getSpeciesEmoji, formatDate } from '../../utils/helpers';
import EmptyState from '../ui/EmptyState';
import Modal from '../ui/Modal';
import ConfirmDialog from '../ui/ConfirmDialog';

const INITIAL = { pet_id: '', name: '', dosage: '', frequency: '', start_date: '', end_date: '', prescribed_by: '', purpose: '', active: true, notes: '' };

function MedForm({ pets, med, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(med ? {
    pet_id: med.pet_id, name: med.name, dosage: med.dosage, frequency: med.frequency,
    start_date: med.start_date, end_date: med.end_date || '', prescribed_by: med.prescribed_by || '',
    purpose: med.purpose || '', active: !!med.active, notes: med.notes || '',
  } : INITIAL);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      if (med) {
        await api.updateMedication(med.id, payload);
        showNotification('Medication updated');
      } else {
        await api.createMedication(payload);
        showNotification('Medication added');
      }
      onSaved();
      onClose();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!med && (
        <div>
          <label className="label">Pet *</label>
          <select name="pet_id" value={form.pet_id} onChange={handleChange} required className="input-field">
            <option value="">Select a pet</option>
            {pets.map(p => <option key={p.id} value={p.id}>{getSpeciesEmoji(p.species)} {p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label">Medication Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="e.g. NexGard, Heartgard Plus" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Dosage *</label>
          <input name="dosage" value={form.dosage} onChange={handleChange} required className="input-field" placeholder="e.g. 68mg" />
        </div>
        <div>
          <label className="label">Frequency *</label>
          <input name="frequency" value={form.frequency} onChange={handleChange} required className="input-field" placeholder="e.g. Monthly" />
        </div>
        <div>
          <label className="label">Start Date *</label>
          <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Prescribed By</label>
          <input name="prescribed_by" value={form.prescribed_by} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Purpose</label>
          <input name="purpose" value={form.purpose} onChange={handleChange} className="input-field" placeholder="e.g. Flea prevention" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field resize-none" rows={2} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active2" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 text-paw-600 rounded" />
        <label htmlFor="active2" className="text-sm text-gray-700 font-medium">Currently active</label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : med ? 'Update' : 'Add Medication'}</button>
      </div>
    </form>
  );
}

export default function MedicationsPage() {
  const { pets, fetchPets, showNotification } = useApp();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchPets();
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const all = await api.getActiveMedications();
      // Load all pets' medications
      const petIds = [...new Set(all.map(m => m.pet_id))];
      let allMeds = [...all];
      // Actually get all medications for a full list
      const petMeds = await Promise.all(
        pets.map ? pets.map(p => api.getMedications(p.id)) : []
      );
      setMedications(all);
    } catch (err) {
      showNotification('Failed to load medications', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function reloadAll() {
    // Get all unique pets and their medications
    const petsData = await api.getPets();
    const allMeds = await Promise.all(petsData.map(p => api.getMedications(p.id)));
    const flat = allMeds.flat().map((m, i) => {
      const pet = petsData[Math.floor(i / 10)] || {};
      return m;
    });
    // Re-fetch from active endpoint for simplicity
    const active = await api.getActiveMedications();
    setMedications(active);
  }

  async function handleDelete(id) {
    try {
      await api.deleteMedication(id);
      showNotification('Medication deleted');
      loadAll();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  const grouped = medications.reduce((acc, m) => {
    const key = m.pet_name || 'Unknown';
    if (!acc[key]) acc[key] = { pet: { name: m.pet_name, species: m.pet_species }, meds: [] };
    acc[key].meds.push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-500 text-sm mt-1">Track active medications across all your pets</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medication
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-24 animate-pulse bg-gray-100" />)}
        </div>
      ) : medications.length === 0 ? (
        <EmptyState icon="💊" title="No active medications" description="Add medications to track dosages and schedules for your pets" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add First Medication</button>
        } />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([petName, { pet, meds }]) => (
            <div key={petName} className="card">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{getSpeciesEmoji(pet.species)}</span>
                <h2 className="font-semibold text-gray-900">{pet.name}</h2>
                <span className="badge bg-green-100 text-green-700 ml-auto">{meds.length} active</span>
              </div>
              <div className="space-y-3">
                {meds.map(m => (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                    <span className="text-xl">💊</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                      <p className="text-xs text-gray-600">{m.dosage} · {m.frequency}</p>
                      {m.purpose && <p className="text-xs text-gray-400 mt-0.5">Purpose: {m.purpose}</p>}
                      <p className="text-xs text-gray-400">Since {formatDate(m.start_date)}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditItem(m)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Medication" size="lg">
        <MedForm pets={pets} onSaved={loadAll} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Medication" size="lg">
        <MedForm pets={pets} med={editItem} onSaved={loadAll} onClose={() => setEditItem(null)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete Medication"
        message={`Remove "${deleteTarget?.name}" from medication records?`}
      />
    </div>
  );
}
