import React, { useState } from 'react';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { formatDate, getVaccinationStatus } from '../../utils/helpers';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

function AddVaccForm({ petId, vacc, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(vacc ? {
    vaccine_name: vacc.vaccine_name, date_administered: vacc.date_administered,
    next_due_date: vacc.next_due_date || '', administered_by: vacc.administered_by || '',
    batch_number: vacc.batch_number || '', notes: vacc.notes || '',
  } : { vaccine_name: '', date_administered: '', next_due_date: '', administered_by: '', batch_number: '', notes: '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { pet_id: petId, ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      if (vacc) {
        await api.updateVaccination(vacc.id, payload);
        showNotification('Vaccination updated');
      } else {
        await api.createVaccination(payload);
        showNotification('Vaccination recorded');
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
        <label className="label">Vaccine Name *</label>
        <input name="vaccine_name" value={form.vaccine_name} onChange={handleChange} required className="input-field" placeholder="e.g. Rabies, DHPP" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date Administered *</label>
          <input type="date" name="date_administered" value={form.date_administered} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="label">Next Due Date</label>
          <input type="date" name="next_due_date" value={form.next_due_date} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Administered By</label>
          <input name="administered_by" value={form.administered_by} onChange={handleChange} className="input-field" placeholder="Veterinarian name" />
        </div>
        <div>
          <label className="label">Batch Number</label>
          <input name="batch_number" value={form.batch_number} onChange={handleChange} className="input-field" placeholder="Optional" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field resize-none" rows={2} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : vacc ? 'Update' : 'Add Record'}</button>
      </div>
    </form>
  );
}

export default function VaccinationTracker({ petId, initialData, onUpdate }) {
  const { showNotification } = useApp();
  const [records, setRecords] = useState(initialData || []);
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function reload() {
    const data = await api.getVaccinations(petId);
    setRecords(data);
    onUpdate && onUpdate();
  }

  async function handleDelete(id) {
    try {
      await api.deleteVaccination(id);
      showNotification('Vaccination record deleted');
      reload();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Vaccination Records</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">
          + Add Vaccination
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="💉" title="No vaccinations recorded" description="Add vaccination records to track immunization history" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add Vaccination</button>
        } />
      ) : (
        <div className="space-y-3">
          {records.map(v => {
            const status = getVaccinationStatus(v.next_due_date);
            return (
              <div key={v.id} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">💉</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{v.vaccine_name}</p>
                    <span className={`badge ${status.color}`}>{status.label}</span>
                  </div>
                  <div className="flex gap-4 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">Given: {formatDate(v.date_administered)}</span>
                    {v.next_due_date && <span className="text-xs text-gray-500">Next due: {formatDate(v.next_due_date)}</span>}
                    {v.administered_by && <span className="text-xs text-gray-400">by {v.administered_by}</span>}
                  </div>
                  {v.notes && <p className="text-xs text-gray-400 mt-1 italic">{v.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditRecord(v)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(v)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Vaccination Record">
        <AddVaccForm petId={petId} onSaved={reload} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editRecord} onClose={() => setEditRecord(null)} title="Edit Vaccination Record">
        <AddVaccForm petId={petId} vacc={editRecord} onSaved={reload} onClose={() => setEditRecord(null)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete Vaccination Record"
        message={`Remove vaccination record for "${deleteTarget?.vaccine_name}"?`}
        confirmLabel="Delete"
      />
    </div>
  );
}
