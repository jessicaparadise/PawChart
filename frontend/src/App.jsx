import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PetList from './components/pets/PetList';
import PetProfile from './components/pets/PetProfile';
import AppointmentsPage from './components/appointments/AppointmentsPage';
import MedicationsPage from './components/medications/MedicationsPage';
import AIPage from './components/ai/AIPage';
import PricingPage from './components/subscription/PricingPage';
import SubscriptionSuccess from './components/subscription/SubscriptionSuccess';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pets" element={<PetList />} />
              <Route path="/pets/:id" element={<PetProfile />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/medications" element={<MedicationsPage />} />
              <Route path="/ai" element={<AIPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            </Routes>
          </Layout>
        </AppProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
