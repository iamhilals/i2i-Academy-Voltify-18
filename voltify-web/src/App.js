import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/AuthLayout';
import DashboardLayout from './pages/DashboardLayout';
import HomeDashboard from './pages/HomeDashboard';
import HomeDetail from './pages/HomeDetail';
import Analytics from './pages/Analytics';
import Automations from './pages/Automations';
import Statistics from './pages/Statistics';
import Devices from './pages/Devices';
import Billing from './pages/Billing';
import Inbox from './pages/Inbox';
import MetaHome from './pages/MetaHome';

function App() {
  return (
    <BrowserRouter>
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
          {/* Other dashboard routes can go here later (e.g., /community) */}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;