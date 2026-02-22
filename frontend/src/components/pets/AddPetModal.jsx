import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';

const SPECIES_OPTIONS = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Fish', 'Hamster', 'Guinea Pig', 'Turtle', 'Snake', 'Lizard', 'Other'];

const INITIAL_FORM = {
  name: '', species: 'Dog', breed: '', date_of_birth: '', gender: '',
  color: '', microchip_id: '', notes: '',
};

export default function AddPetModal({ open, onClose, onSaved, pet }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(pet ? {
    name: pet.name || '', species: pet.species || 'Dog', breed: pet.breed || '',
    date_of_birth: pet.date_of_birth || '', gender: pet.gender || '',
    color: pet.color || '', microchip_id: pet.microchip_id || '', notes: pet.notes || '',
  } : INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.species) {
      showNotification('Name and species are required', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      if (pet) {
        await api.updatePet(pet.id, payload);
        showNotification(`${form.name}'s profile updated!`);
      } else {
        await api.createPet(payload);
        showNotification(`${form.name} added to your family!`);
      }
      onSaved && onSaved();
      onClose();
      if (!pet) setForm(INITIAL_FORM);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={pet ? 'Edit Pet Profile' : 'Add New Pet'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="Pet's name" />
          </div>
          <div>
            <label className="label">Species *</label>
            <select name="species" value={form.species} onChange={handleChange} required className="input-field">
              {SPECIES_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Breed</label>
            <input name="breed" value={form.breed} onChange={handleChange} className="input-field" placeholder="Breed (optional)" />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div>
            <label className="label">Color / Markings</label>
            <input name="color" value={form.color} onChange={handleChange} className="input-field" placeholder="e.g. Golden, Black & White" />
          </div>
          <div>
            <label className="label">Microchip ID</label>
            <input name="microchip_id" value={form.microchip_id} onChange={handleChange} className="input-field" placeholder="Chip number" />
          </div>
          <div className="col-span-2">
            <label className="label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : pet ? 'Save Changes' : 'Add Pet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
