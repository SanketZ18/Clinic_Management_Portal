import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import PaymentQR from './pages/PaymentQR';

// Dashboard pages
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import NewPatient from './pages/dashboard/NewPatient';
import DayReport from './pages/dashboard/DayReport';
import Research from './pages/dashboard/Research';
import Profile from './pages/dashboard/Profile';
import ManageDoctors from './pages/dashboard/ManageDoctors';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/payment" element={<PaymentQR />} />
          <Route path="/payment-qr" element={<PaymentQR />} />

          {/* Protected Dashboard Routes */}
          <Route path="/doctor" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="new-patient" element={<NewPatient />} />
            <Route path="logs" element={<DayReport />} />
            <Route path="research" element={<Research />} />
            <Route path="profile" element={<Profile />} />
            <Route path="inquiry" element={<Navigate to="/doctor/new-patient" replace />} />
            <Route path="register" element={<Navigate to="/doctor/logs" replace />} />
            <Route path="report" element={<Navigate to="/doctor/logs" replace />} />
          </Route>

          <Route path="/super-admin" element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="new-patient" element={<NewPatient />} />
            <Route path="logs" element={<DayReport />} />
            <Route path="research" element={<Research />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manage-doctors" element={<ManageDoctors />} />
            <Route path="inquiry" element={<Navigate to="/super-admin/new-patient" replace />} />
            <Route path="register" element={<Navigate to="/super-admin/logs" replace />} />
            <Route path="report" element={<Navigate to="/super-admin/logs" replace />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
