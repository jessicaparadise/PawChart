import React, { useState } from 'react';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

const INITIAL = { name: '', dosage: '', frequency: '', start_date: '', end_date: '', prescribed_by: '', purpose: '', active: true, notes: '' };

function MedForm({ petId, med, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(med ? {
    name: med.name, dosage: med.dosage, frequency: med.frequency,
    start_date: med.start_date, end_date: med.end_date || '',
    prescribed_by: med.prescribed_by || '', purpose: med.purpose || '',
    active: !!med.active, notes: med.notes || '',
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
      const payload = { pet_id: petId, ...form };
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
      <div>
        <label className="label">Medication Name *</label>
        <input name="name" value={form.name} onChange={handleChange} required className="input-field" placeholder="e.g. NexGard, Heartgard Plus" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Dosage *</label>
          <input name="dosage" value={form.dosage} onChange={handleChange} required className="input-field" placeholder="e.g. 68mg, 1 tablet" />
        </div>
        <div>
          <label className="label">Frequency *</label>
          <input name="frequency" value={form.frequency} onChange={handleChange} required className="input-field" placeholder="e.g. Daily, Monthly" />
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
          <input name="prescribed_by" value={form.prescribed_by} onChange={handleChange} className="input-field" placeholder="Veterinarian" />
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
        <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 text-paw-600 rounded" />
        <label htmlFor="active" className="text-sm text-gray-700 font-medium">Currently active medication</label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : med ? 'Update' : 'Add Medication'}</button>
      </div>
    </form>
  );
}

export default function MedicationList({ petId, initialData, onUpdate }) {
  const { showNotification } = useApp();
  const [records, setRecords] = useState(initialData || []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showInactive, setShowInactive] = useState(false);

  async function reload() {
    const data = await api.getMedications(petId);
    setRecords(data);
    onUpdate && onUpdate();
  }

  async function handleDelete(id) {
    try {
      await api.deleteMedication(id);
      showNotification('Medication deleted');
      reload();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  const active = records.filter(r => r.active);
  const inactive = records.filter(r => !r.active);

  function MedCard({ med }) {
    return (
      <div className={`card p-4 ${!med.active ? 'opacity-70' : ''}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${med.active ? 'bg-green-100' : 'bg-gray-100'}`}>💊</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-medium text-gray-900">{med.name}</p>
              <span className={`badge ${med.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {med.active ? 'Active' : 'Completed'}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
              <span className="font-medium text-gray-700">{med.dosage}</span>
              <span>·</span>
              <span>{med.frequency}</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400 mt-1 flex-wrap">
              <span>Started: {formatDate(med.start_date)}</span>
              {med.end_date && <span>Ended: {formatDate(med.end_date)}</span>}
              {med.prescribed_by && <span>by {med.prescribed_by}</span>}
            </div>
            {med.purpose && <p className="text-xs text-gray-500 mt-1">Purpose: {med.purpose}</p>}
            {med.notes && <p className="text-xs text-gray-400 mt-1 italic">{med.notes}</p>}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setEditItem(med)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => setDeleteTarget(med)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Medications</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">+ Add Medication</button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="💊" title="No medications recorded" description="Track current and past medications for this pet" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add Medication</button>
        } />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Active ({active.length})</p>
              <div className="space-y-3">{active.map(m => <MedCard key={m.id} med={m} />)}</div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <button
                onClick={() => setShowInactive(s => !s)}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1 hover:text-gray-600"
              >
                Past Medications ({inactive.length}) {showInactive ? '▲' : '▼'}
              </button>
              {showInactive && (
                <div className="space-y-3">{inactive.map(m => <MedCard key={m.id} med={m} />)}</div>
              )}
            </div>
          )}
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Medication" size="lg">
        <MedForm petId={petId} onSaved={reload} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Medication" size="lg">
        <MedForm petId={petId} med={editItem} onSaved={reload} onClose={() => setEditItem(null)} />
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
