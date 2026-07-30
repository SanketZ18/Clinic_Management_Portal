import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Stethoscope, ClipboardList, BookOpen,
  User, LogOut, Shield, AlertCircle, CircleHelp
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/images/logo.jpeg';
import api from '../services/api';
import { getSubscriptionInfo } from '../utils/subscription';

const DashboardLayout = () => {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdminDashboard = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminDashboard ? '/super-admin' : '/doctor';

  const [pendingDoctorsCount, setPendingDoctorsCount] = useState(0);
  const [hasViewedPending, setHasViewedPending] = useState(false);
  const manageDoctorsPath = `${basePath}/manage-doctors`;

  // Fetch pending doctors count for Super Admin notification dot
  useEffect(() => {
    if (!isSuperAdminDashboard) return;
    const fetchPending = async () => {
      try {
        const response = await api.get('/admin/doctors');
        const doctors = Array.isArray(response.data?.data) ? response.data.data : [];
        const pending = doctors.filter(d => {
          const role = String(d.role || '').toLowerCase();
          return !role.includes('super admin') && !d.isActive && !d.active;
        });
        setPendingDoctorsCount(pending.length);
      } catch (_) { }
    };
    fetchPending();
  }, [isSuperAdminDashboard]);

  // Clear notification dot when Super Admin views Manage Doctors
  useEffect(() => {
    if (location.pathname === manageDoctorsPath && pendingDoctorsCount > 0) {
      setHasViewedPending(true);
    }
  }, [location.pathname, manageDoctorsPath, pendingDoctorsCount]);

  const showNotificationDot = isSuperAdminDashboard && pendingDoctorsCount > 0 && !hasViewedPending;

  // Subscription info for non-super-admin doctors
  const subInfo = !isSuperAdminDashboard ? getSubscriptionInfo(doctor) : null;

  const navItems = [
    { to: basePath, icon: LayoutDashboard, label: 'Overview', desc: 'Dashboard' },
    { to: `${basePath}/new-patient`, icon: Stethoscope, label: 'New Patient', desc: 'Prescription Generation' },
    { to: `${basePath}/logs`, icon: ClipboardList, label: 'Report Generation', desc: 'Generate & export' },
    ...(isSuperAdminDashboard
      ? [{ to: manageDoctorsPath, icon: Shield, label: 'Manage Doctors', desc: 'Access control', hasDot: showNotificationDot }]
      : []),
    { to: `${basePath}/research`, icon: BookOpen, label: 'Research Feed', desc: 'Clinical insights' },
    { to: `${basePath}/profile`, icon: User, label: 'My Profile', desc: 'Manage & update profile' },
    { to: `${basePath}/guide`, icon: CircleHelp, label: 'User Guide', desc: 'Learn the workflow' },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/auth?mode=login', { replace: true });
  };

  const getPageTitle = () => {
    if (location.pathname === basePath) return 'Overview';
    if (location.pathname === `${basePath}/inquiry` || location.pathname === `${basePath}/new-patient`) return 'New Patient';
    if (location.pathname === `${basePath}/register` || location.pathname === `${basePath}/report` || location.pathname === `${basePath}/logs`) return 'Day Report';
    if (location.pathname === `${basePath}/manage-doctors`) return 'Manage Doctors';
    const item = navItems.find(n => n.to === location.pathname);
    return item ? item.label : 'Doctor Dashboard';
  };

  const initials = doctor?.fullName
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('') || 'DR';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div
              className="sidebar-logo-icon"
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden'
              }}
            >
              <img
                src={logo}
                alt="Clinic Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div className="sidebar-brand-copy">
              <div className="sidebar-brand-title">Dr. Salunkhe's</div>
              <div className="sidebar-brand-subtitle">
                {isSuperAdminDashboard ? 'Super Admin Dashboard' : 'Doctor Dashboard'}
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="sidebar-doctor-info">
          <div className="sidebar-doctor-row">
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <p className="sidebar-doctor-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doctor?.fullName || 'Doctor'}
              </p>
              <p className="sidebar-doctor-clinic" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doctor?.clinicName || 'Clinic'} / {doctor?.qualification || 'Qualification'}
              </p>
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            {isSuperAdminDashboard ? (
              <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '4px 10px' }}>
                Super Admin
              </span>
            ) : subInfo ? (
              <span
                className={subInfo.isWarning ? 'badge badge-red' : 'badge badge-gold'}
                style={{ fontSize: '0.62rem', padding: '4px 10px', color: subInfo.isWarning ? '#fff' : undefined }}
              >
                {subInfo.isExpired ? '⚠ Expired' : subInfo.isWarning ? `⚠ ${subInfo.daysRemaining}d left` : `${subInfo.daysRemaining} day's access Left`}
              </span>
            ) : (
              <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '4px 10px' }}>
                {doctor?.subscriptionPlan || 'PAID'} Plan
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label, desc, hasDot }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon size={18} />
                {hasDot && (
                  <span style={{
                    position: 'absolute',
                    top: -4,
                    right: -5,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '2px solid var(--sidebar-bg, #0f172a)',
                    boxShadow: '0 0 0 1px #ef4444',
                  }} />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {label}
                  {hasDot && (
                    <span style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '999px',
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      padding: '1px 5px',
                      lineHeight: 1.4,
                    }}>
                      {pendingDoctorsCount}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.65, marginTop: 1 }}>{desc}</div>
              </div>
            </NavLink>
          ))}
        </nav>

      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <h1 className="topbar-title">{getPageTitle()}</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>

          <div className="topbar-actions">
            {/* Subscription warning banner in topbar for doctors */}
            {!isSuperAdminDashboard && subInfo?.isWarning && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '10px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#dc2626',
              }}>
                <AlertCircle size={14} />
                {subInfo.isExpired ? 'Subscription Expired! Renew now.' : `⚠ ${subInfo.daysRemaining} days access remaining!`}
              </div>
            )}

            <div className="topbar-doctor-chip">
              <div className="topbar-doctor-avatar">{initials}</div>
              <div className="topbar-doctor-copy">
                <div className="topbar-doctor-name">{doctor?.fullName || 'Doctor'}</div>
                <div className="topbar-doctor-meta">
                  {isSuperAdminDashboard ? 'Super Admin Access' : doctor?.qualification || doctor?.licenseNumber || 'Active session'}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="topbar-logout-btn" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
