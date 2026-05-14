import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApiKey from './pages/ApiKey';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import AiStudio from './pages/AiStudio';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivity from './pages/admin/AdminActivity';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminPayments from './pages/admin/AdminPayments';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminObservability from './pages/admin/AdminObservability';
import AdminMemory from './pages/admin/AdminMemory';

export default function App() {
  const { token } = useAuth();

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*"      element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/api-key" element={<ApiKey />}    />
        <Route path="/billing" element={<Billing />}   />
        <Route path="/ai-studio" element={<AiStudio />} />
        <Route path="/admin" element={<Admin />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="observability" element={<AdminObservability />} />
          <Route path="memory" element={<AdminMemory />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Route>
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
