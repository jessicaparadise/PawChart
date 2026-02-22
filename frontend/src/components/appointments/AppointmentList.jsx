import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../utils/api';
import { formatDate, getSpeciesEmoji, getAppointmentTypeColor, getAppointmentTypeLabel } from '../../utils/helpers';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

const APPT_TYPES = ['checkup', 'vaccination', 'dental', 'surgery', 'followup', 'emergency', 'grooming', 'other'];
const INITIAL = { pet_id: '', title: '', appointment_type: 'checkup', date: '', time: '', vet_name: '', clinic_name: '', notes: '', status: 'scheduled' };

function ApptForm({ petId, pets, appt, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(appt ? {
    pet_id: appt.pet_id, title: appt.title, appointment_type: appt.appointment_type,
    date: appt.date, time: appt.time || '', vet_name: appt.vet_name || '',
    clinic_name: appt.clinic_name || '', notes: appt.notes || '', status: appt.status,
  } : { ...INITIAL, pet_id: petId || '' });
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      if (appt) {
        await api.updateAppointment(appt.id, payload);
        showNotification('Appointment updated');
      } else {
        await api.createAppointment(payload);
        showNotification('Appointment scheduled');
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
      {!petId && pets && (
        <div>
          <label className="label">Pet *</label>
          <select name="pet_id" value={form.pet_id} onChange={handleChange} required className="input-field">
            <option value="">Select a pet</option>
            {pets.map(p => <option key={p.id} value={p.id}>{getSpeciesEmoji(p.species)} {p.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="label">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="e.g. Annual Wellness Exam" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Type *</label>
          <select name="appointment_type" value={form.appointment_type} onChange={handleChange} className="input-field">
            {APPT_TYPES.map(t => <option key={t} value={t}>{getAppointmentTypeLabel(t)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="label">Time</label>
          <input type="time" name="time" value={form.time} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Veterinarian</label>
          <input name="vet_name" value={form.vet_name} onChange={handleChange} className="input-field" placeholder="Dr. Name" />
        </div>
        <div>
          <label className="label">Clinic Name</label>
          <input name="clinic_name" value={form.clinic_name} onChange={handleChange} className="input-field" placeholder="Clinic name" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field resize-none" rows={2} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : appt ? 'Update' : 'Schedule'}</button>
      </div>
    </form>
  );
}

export default function AppointmentList({ petId, pets, initialData, onUpdate }) {
  const { showNotification } = useApp();
  const [records, setRecords] = useState(initialData || []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  async function reload() {
    const data = petId ? await api.getPetAppointments(petId) : await api.getAppointments();
    setRecords(data);
    onUpdate && onUpdate();
  }

  useEffect(() => {
    if (!initialData) reload();
  }, [petId]);

  async function handleDelete(id) {
    try {
      await api.deleteAppointment(id);
      showNotification('Appointment deleted');
      reload();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter);

  const statusColor = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    rescheduled: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {['all', 'scheduled', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                filter === f ? 'bg-paw-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">+ Schedule Appointment</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments" description="Schedule vet visits and track medical appointments" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Schedule Appointment</button>
        } />
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className={`card p-4 ${a.status === 'cancelled' ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">📅</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <span className={`badge ${getAppointmentTypeColor(a.appointment_type)}`}>{getAppointmentTypeLabel(a.appointment_type)}</span>
                    <span className={`badge ${statusColor[a.status] || 'bg-gray-100 text-gray-600'}`}>{a.status}</span>
                  </div>
                  {a.pet_name && (
                    <p className="text-xs text-gray-500">{getSpeciesEmoji(a.pet_species)} {a.pet_name}</p>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                    <span>📆 {formatDate(a.date)} {a.time && `at ${a.time}`}</span>
                    {a.vet_name && <span>👩‍⚕️ {a.vet_name}</span>}
                    {a.clinic_name && <span>🏥 {a.clinic_name}</span>}
                  </div>
                  {a.notes && <p className="text-xs text-gray-400 mt-1 italic">{a.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditItem(a)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(a)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Schedule Appointment" size="lg">
        <ApptForm petId={petId} pets={pets} onSaved={reload} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Appointment" size="lg">
        <ApptForm petId={petId} pets={pets} appt={editItem} onSaved={reload} onClose={() => setEditItem(null)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete Appointment"
        message={`Remove appointment "${deleteTarget?.title}"?`}
      />
    </div>
  );
}
