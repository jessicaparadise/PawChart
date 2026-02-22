import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PetList from './components/pets/PetList';
import PetProfile from './components/pets/PetProfile';
import AppointmentsPage from './components/appointments/AppointmentsPage';
import MedicationsPage from './components/medications/MedicationsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pets" element={<PetList />} />
            <Route path="/pets/:id" element={<PetProfile />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/medications" element={<MedicationsPage />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
