import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import AppointmentList from './AppointmentList';

export default function AppointmentsPage() {
  const { pets, fetchPets } = useApp();

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage vet visits and medical appointments for all pets</p>
      </div>
      <AppointmentList pets={pets} />
    </div>
  );
}
