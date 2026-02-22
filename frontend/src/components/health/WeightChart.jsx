import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { api } from '../../utils/api';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import ConfirmDialog from '../ui/ConfirmDialog';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function AddWeightForm({ petId, onSaved, onClose }) {
  const { showNotification } = useApp();
  const [form, setForm] = useState({ weight: '', unit: 'kg', recorded_at: new Date().toISOString().split('T')[0], notes: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.weight || !form.recorded_at) {
      showNotification('Weight and date are required', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.createWeightRecord({ pet_id: petId, weight: parseFloat(form.weight), unit: form.unit, recorded_at: form.recorded_at, notes: form.notes || null });
      showNotification('Weight record added');
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Weight *</label>
          <input type="number" step="0.01" name="weight" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} required className="input-field" placeholder="0.00" />
        </div>
        <div>
          <label className="label">Unit</label>
          <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="input-field">
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
            <option value="g">g</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Date *</label>
          <input type="date" value={form.recorded_at} onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))} required className="input-field" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input-field" placeholder="Optional notes" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Record'}</button>
      </div>
    </form>
  );
}

export default function WeightChart({ petId, initialData, onUpdate }) {
  const { showNotification } = useApp();
  const [records, setRecords] = useState(initialData || []);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function reload() {
    const data = await api.getWeightRecords(petId);
    setRecords(data);
    onUpdate && onUpdate();
  }

  async function handleDelete(id) {
    try {
      await api.deleteWeightRecord(id);
      showNotification('Weight record deleted');
      reload();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }

  const latestWeight = records.length > 0 ? records[records.length - 1] : null;

  const chartData = {
    labels: records.map(r => formatDate(r.recorded_at)),
    datasets: [{
      label: `Weight (${latestWeight?.unit || 'kg'})`,
      data: records.map(r => r.weight),
      fill: true,
      borderColor: '#d946ef',
      backgroundColor: 'rgba(217, 70, 239, 0.08)',
      pointBackgroundColor: '#d946ef',
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.3,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.parsed.y} ${latestWeight?.unit || 'kg'}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 6 },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900">Weight History</h3>
          {latestWeight && (
            <span className="badge bg-paw-100 text-paw-700">
              Latest: {latestWeight.weight} {latestWeight.unit}
            </span>
          )}
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs">+ Log Weight</button>
      </div>

      {records.length === 0 ? (
        <EmptyState icon="⚖️" title="No weight records" description="Track your pet's weight over time to monitor their health" action={
          <button onClick={() => setShowAdd(true)} className="btn-primary">Log First Weight</button>
        } />
      ) : (
        <>
          {records.length >= 2 && (
            <div className="card p-4">
              <div style={{ height: 220 }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          )}
          <div className="space-y-2">
            {[...records].reverse().map(r => (
              <div key={r.id} className="card p-3 flex items-center gap-3">
                <span className="text-xl">⚖️</span>
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">{r.weight} {r.unit}</span>
                  <span className="text-gray-400 text-xs ml-3">{formatDate(r.recorded_at)}</span>
                  {r.notes && <span className="text-xs text-gray-400 ml-2 italic">· {r.notes}</span>}
                </div>
                <button onClick={() => setDeleteTarget(r)} className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Log Weight">
        <AddWeightForm petId={petId} onSaved={reload} onClose={() => setShowAdd(false)} />
      </Modal>
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget?.id)}
        title="Delete Weight Record"
        message="Remove this weight record?"
      />
    </div>
  );
}
