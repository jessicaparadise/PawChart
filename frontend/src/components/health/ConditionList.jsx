import React, { useState } from 'react';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { formatDate, getSeverityColor, getConditionStatusColor } from '../../utils/helpers';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

const INITIAL = { condition_name: '', diagnosed_date: '', diagnosed_by: '', severity: 'mild', status: 'active', treatment: '', notes: '' };

function ConditionForm({ petId, condition, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState(condition ? {
    condition_name: condition.condition_name, diagnosed_date: condition.diagnosed_date || '',
    diagnosed_by: condition.diagnosed_by || '', severity: condition.severity || 'mild',
    status: condition.status || 'active', treatment: condition.treatment || '', notes: condition.notes || '',
  } : INITIAL);
  const [loading, setLoading] = useState(false);

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { pet_id: petId, ...form };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      if (condition) {
        await api.updateCondition(condition.id, payload);
        showNotification('Condition updated');
      } else {
        await api.createCondition(payload);
        showNotification('Health condition added');
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
        <label className="label">Condition Name *</label>
        <input name="condition_name" value={form.condition_name} onChange={handleChange} required className="input-field" placeholder="e.g. Seasonal Allergies" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Diagnosed Date</label>
          <input type="date" name="diagnosed_date" value={form.diagnosed_date} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label">Diagnosed By</label>
          <input name="diagnosed_by" value={form.diagnosed_by} onChange={handleChange} className="input-field" placeholder="Vet name" />
        </div>
        <div>
          <label className="label">Severity</label>
          <select name="severity" value={form.severity} onChange={handleChange} className="input-field">
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="active">Active</option>
            <option value="managed">Managed</option>
            <option value="resolved">Resolved</option>
            <option value="chronic">Chronic</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">Treatment</label>
        <textarea name="treatment" value={form.treatment} onChange={handleChange} className="input-field resize-none" rows={2} placeholder="Treatment plan..." />
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field resize-none" rows={2} />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : condition ? 'Update' : 'Add Condition'}</button>
      </div>
    </form>
  );
}

export default function ConditionList({ petId, initialData, onUpdate }) {
  const { showNotification } = useApp();
  const [records, setRecords] = useState(initialData || []);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function reload() {
    const data = await api.getConditions(petId);
    setRecords(data);
    onUpdate && onUpdate();
  }

  async function handleDelete(id) {
    try {
      await api.deleteCondition(id);
      showNotification('Condition deleted');
      reload();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Health Conditions</h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">+ Add Condition</button>
      </div>
      {records.length === 0 ? (
        <EmptyState icon="🩺" title="No health conditions recorded" description="Track diagnoses and ongoing health issues" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add Condition</button>
        } />
      ) : (
        <div className="space-y-3">
          {records.map(c => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🩺</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium text-gray-900">{c.condition_name}</p>
                    <span className={`badge ${getSeverityColor(c.severity)}`}>{c.severity}</span>
                    <span className={`badge ${getConditionStatusColor(c.status)}`}>{c.status}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                    {c.diagnosed_date && <span>Diagnosed: {formatDate(c.diagnosed_date)}</span>}
                    {c.diagnosed_by && <span>by {c.diagnosed_by}</span>}
                  </div>
                  {c.treatment && <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Treatment:</span> {c.treatment}</p>}
                  {c.notes && <p className="text-xs text-gray-400 mt-1 italic">{c.notes}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => setEditItem(c)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => setDeleteTarget(c)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Health Condition">
        <ConditionForm petId={petId} onSaved={reload} onClose={() => setShowAdd(false)} />
      </Modal>
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Health Condition">
        <ConditionForm petId={petId} condition={editItem} onSaved={reload} onClose={() => setEditItem(null)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete Condition"
        message={`Remove "${deleteTarget?.condition_name}" from health records?`}
      />
    </div>
  );
}
