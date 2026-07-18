import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (role) => String(role || 'Doctor').trim().toLowerCase().replace(/[_\s]+/g, ' ');

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, doctor } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg"></div>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
          Loading your clinic...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth?mode=login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    const currentRole = normalizeRole(doctor?.role);
    const needsSuperAdmin = normalizeRole(requiredRole) === 'super admin';
    const hasAccess = needsSuperAdmin
      ? currentRole === 'super admin'
      : currentRole === normalizeRole(requiredRole);

    if (!hasAccess) {
      return <Navigate to="/doctor" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
