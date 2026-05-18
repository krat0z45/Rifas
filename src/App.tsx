/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';

// Placeholder Pages
import PublicLanding from './pages/PublicLanding';
import PublicRaffleDetail from './pages/PublicRaffleDetail';
import PublicAbout from './pages/PublicAbout';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminRaffles from './pages/AdminRaffles';
import AdminReservations from './pages/AdminReservations';
import AdminSettings from './pages/AdminSettings';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      api.getMe().then(data => {
        setUser(data.user);
      }).catch(() => {
        setUser(null);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-950 text-white">Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/about" element={<PublicAbout />} />
        <Route path="/raffle/:raffleId" element={<PublicRaffleDetail />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/admin" element={user ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="raffles" element={<AdminRaffles />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
