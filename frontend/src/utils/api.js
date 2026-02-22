const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Pets
  getPets: () => request('/pets'),
  getPet: (id) => request(`/pets/${id}`),
  createPet: (data) => request('/pets', { method: 'POST', body: data }),
  updatePet: (id, data) => request(`/pets/${id}`, { method: 'PUT', body: data }),
  deletePet: (id) => request(`/pets/${id}`, { method: 'DELETE' }),

  // Vaccinations
  getVaccinations: (petId) => request(`/vaccinations/pet/${petId}`),
  createVaccination: (data) => request('/vaccinations', { method: 'POST', body: data }),
  updateVaccination: (id, data) => request(`/vaccinations/${id}`, { method: 'PUT', body: data }),
  deleteVaccination: (id) => request(`/vaccinations/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: () => request('/appointments'),
  getUpcomingAppointments: () => request('/appointments/upcoming'),
  getPetAppointments: (petId) => request(`/appointments/pet/${petId}`),
  createAppointment: (data) => request('/appointments', { method: 'POST', body: data }),
  updateAppointment: (id, data) => request(`/appointments/${id}`, { method: 'PUT', body: data }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),

  // Weight
  getWeightRecords: (petId) => request(`/weight/pet/${petId}`),
  createWeightRecord: (data) => request('/weight', { method: 'POST', body: data }),
  deleteWeightRecord: (id) => request(`/weight/${id}`, { method: 'DELETE' }),

  // Medications
  getMedications: (petId) => request(`/medications/pet/${petId}`),
  getActiveMedications: () => request('/medications/active'),
  createMedication: (data) => request('/medications', { method: 'POST', body: data }),
  updateMedication: (id, data) => request(`/medications/${id}`, { method: 'PUT', body: data }),
  deleteMedication: (id) => request(`/medications/${id}`, { method: 'DELETE' }),

  // Conditions
  getConditions: (petId) => request(`/conditions/pet/${petId}`),
  createCondition: (data) => request('/conditions', { method: 'POST', body: data }),
  updateCondition: (id, data) => request(`/conditions/${id}`, { method: 'PUT', body: data }),
  deleteCondition: (id) => request(`/conditions/${id}`, { method: 'DELETE' }),
};
