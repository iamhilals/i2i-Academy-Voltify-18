import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/AuthLayout';
import DashboardLayout from './pages/DashboardLayout';
import ToastHost from './components/ToastHost';

// Hızlı açılış için sayfa bileşenlerini "Lazy Loading" ile yüklüyoruz (Route Code-Splitting)
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'));
const HomeDetail = lazy(() => import('./pages/HomeDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Automations = lazy(() => import('./pages/Automations'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Devices = lazy(() => import('./pages/Devices'));
const Billing = lazy(() => import('./pages/Billing'));
const Inbox = lazy(() => import('./pages/Inbox'));
const MetaHome = lazy(() => import('./pages/MetaHome'));
const Settings = lazy(() => import('./pages/Settings'));

// Yükleme esnasında gösterilecek yeşil dönen spinner
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="w-10 h-10 border-4 border-[#4C811F] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<AuthLayout mode="login" />} />
          <Route path="/register" element={<AuthLayout mode="register" />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<HomeDashboard />} />
            <Route path="home/:id" element={<HomeDetail />} />
            <Route path="meta-home" element={<MetaHome />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="automations" element={<Automations />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="devices" element={<Devices />} />
            <Route path="billing" element={<Billing />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;