import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [activeMedications, setActiveMedications] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const fetchPets = useCallback(async () => {
    setPetsLoading(true);
    try {
      const data = await api.getPets();
      setPets(data);
    } catch (err) {
      showNotification('Failed to load pets: ' + err.message, 'error');
    } finally {
      setPetsLoading(false);
    }
  }, [showNotification]);

  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      const data = await api.getUpcomingAppointments();
      setUpcomingAppointments(data);
    } catch (err) {
      console.error('Failed to load upcoming appointments:', err);
    }
  }, []);

  const fetchActiveMedications = useCallback(async () => {
    try {
      const data = await api.getActiveMedications();
      setActiveMedications(data);
    } catch (err) {
      console.error('Failed to load active medications:', err);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      pets, setPets, petsLoading,
      upcomingAppointments, setUpcomingAppointments,
      activeMedications, setActiveMedications,
      fetchPets, fetchUpcomingAppointments, fetchActiveMedications,
      notification, showNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
