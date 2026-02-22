import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';
import { api } from '../utils/api';
import { formatDate, getSpeciesEmoji, getAge, getVaccinationStatus, getAppointmentTypeLabel, getAppointmentTypeColor } from '../utils/helpers';
import { format, parseISO, isPast } from 'date-fns';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Parse markdown links for AI insight messages
function renderInsightMessage(text) {
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(<span key={lastIndex}>{text.slice(lastIndex, match.index)}</span>);
    const [, label, url] = match;
    const isVetster = url.includes('vetster.com');
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 text-xs font-medium underline ${isVetster ? 'text-green-700' : 'text-blue-700'}`}>
        {isVetster ? '📹' : '🛒'} {label}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(<span key="end">{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

function AIHealthInsights() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.aiInsights()
      .then(data => setInsights(data.insights || []))
      .catch(() => setInsights([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🤖</span>
          <h2 className="font-semibold text-gray-900">AI Health Insights</h2>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Premium</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (insights.length === 0) return null;

  const typeStyles = {
    alert: 'bg-red-50 border-red-200 text-red-800',
    recommendation: 'bg-blue-50 border-blue-200 text-blue-800',
    info: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  const typeIcons = { alert: '⚠️', recommendation: '💡', info: 'ℹ️' };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🤖</span>
        <h2 className="font-semibold text-gray-900">AI Health Insights</h2>
        <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full ml-1">Premium</span>
        <Link to="/ai" className="ml-auto text-xs text-paw-600 hover:text-paw-700 font-medium">Ask AI →</Link>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className={`rounded-xl border p-3 ${typeStyles[insight.type] || typeStyles.info}`}>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0">{typeIcons[insight.type] || 'ℹ️'}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {insight.petName && <span className="font-bold">{insight.petName}: </span>}
                  {insight.title}
                  {insight.urgent && <span className="ml-1 text-xs text-red-600 font-medium">· Urgent</span>}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed">{renderInsightMessage(insight.message)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { pets, upcomingAppointments, activeMedications, fetchPets, fetchUpcomingAppointments, fetchActiveMedications, petsLoading } = useApp();
  const { user } = useUser();

  useEffect(() => {
    fetchPets();
    fetchUpcomingAppointments();
    fetchActiveMedications();
  }, [fetchPets, fetchUpcomingAppointments, fetchActiveMedications]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pets" value={pets.length} color="bg-paw-100" icon="🐾" />
        <StatCard label="Upcoming Appointments" value={upcomingAppointments.length} color="bg-blue-100" icon="📅" />
        <StatCard label="Active Medications" value={activeMedications.length} color="bg-green-100" icon="💊" />
        <StatCard label="Pets Needing Attention" value={
          upcomingAppointments.filter(a => {
            const d = parseISO(a.date);
            const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
            return diff <= 7;
          }).length
        } color="bg-amber-100" icon="⚠️" />
      </div>

      {/* AI Health Insights — premium only */}
      {user?.isPremium && <AIHealthInsights />}

      {/* Upgrade nudge for free users with pets */}
      {!user?.isPremium && pets.length > 0 && (
        <div className="card bg-gradient-to-r from-paw-50 to-amber-50 border border-paw-200 flex items-center gap-4 flex-wrap">
          <div className="text-2xl">✨</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">Get AI health insights for your pets</p>
            <p className="text-xs text-gray-500 mt-0.5">Predictive alerts, product recommendations, and telehealth referrals.</p>
          </div>
          <Link to="/pricing" className="btn-primary text-sm flex-shrink-0">
            Upgrade for $4.99/mo
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet List */}
        <div className="lg:col-span-1 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">My Pets</h2>
            <Link to="/pets" className="text-xs text-paw-600 hover:text-paw-700 font-medium">View all →</Link>
          </div>
          {petsLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🐾</p>
              <p className="text-sm text-gray-500">No pets yet</p>
              <Link to="/pets" className="btn-primary mt-3 text-xs">Add a pet</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {pets.map(pet => (
                <Link
                  key={pet.id}
                  to={`/pets/${pet.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-paw-100 to-paw-200 rounded-full flex items-center justify-center text-lg">
                    {getSpeciesEmoji(pet.species)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{pet.name}</p>
                    <p className="text-xs text-gray-400 truncate">{pet.breed || pet.species} · {getAge(pet.date_of_birth)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-xs text-paw-600 hover:text-paw-700 font-medium">View all →</Link>
          </div>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm text-gray-500">No upcoming appointments</p>
              <Link to="/appointments" className="btn-primary mt-3 text-xs">Schedule appointment</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map(appt => {
                const apptDate = parseISO(appt.date);
                const daysUntil = Math.ceil((apptDate - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={appt.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">{appt.title}</p>
                        <span className={`badge ${getAppointmentTypeColor(appt.appointment_type)}`}>
                          {getAppointmentTypeLabel(appt.appointment_type)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getSpeciesEmoji(appt.pet_species)} {appt.pet_name} · {formatDate(appt.date)} {appt.time && `at ${appt.time}`}
                      </p>
                      {appt.vet_name && <p className="text-xs text-gray-400">{appt.vet_name}</p>}
                    </div>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0 ${
                      daysUntil <= 3 ? 'bg-red-100 text-red-700' :
                      daysUntil <= 7 ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Medications */}
      {activeMedications.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Medications</h2>
            <Link to="/medications" className="text-xs text-paw-600 hover:text-paw-700 font-medium">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeMedications.slice(0, 6).map(med => (
              <div key={med.id} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <span className="text-xl">💊</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{med.name}</p>
                  <p className="text-xs text-gray-500">{getSpeciesEmoji(med.pet_species)} {med.pet_name} · {med.frequency}</p>
                  <p className="text-xs text-gray-400">{med.dosage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
