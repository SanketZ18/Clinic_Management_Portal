import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Stethoscope, ClipboardList, BookOpen,
  User, LogOut, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import logo from '../assets/images/logo.jpeg';

const DashboardLayout = () => {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperAdminDashboard = location.pathname.startsWith('/super-admin');
  const basePath = isSuperAdminDashboard ? '/super-admin' : '/doctor';
  const navItems = [
    { to: basePath, icon: LayoutDashboard, label: 'Overview', desc: 'Dashboard' },
    { to: `${basePath}/new-patient`, icon: Stethoscope, label: 'New Patient', desc: 'Prescription Generation' },
    { to: `${basePath}/logs`, icon: ClipboardList, label: 'Report Generation', desc: 'Generate & export' },
    ...(isSuperAdminDashboard
      ? [{ to: `${basePath}/manage-doctors`, icon: Shield, label: 'Manage Doctors', desc: 'Access control' }]
      : []),
    { to: `${basePath}/research`, icon: BookOpen, label: 'Research Feed', desc: 'Clinical insights' },
    { to: `${basePath}/profile`, icon: User, label: 'My Profile', desc: 'Manage & update profile' },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
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
            <span className="badge badge-gold" style={{ fontSize: '0.62rem', padding: '4px 10px' }}>
              {isSuperAdminDashboard ? 'Super Admin' : `${doctor?.subscriptionPlan || 'FREE'} Plan`}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="sidebar-nav-label">Main Menu</p>
          {navItems.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <div>
                <div>{label}</div>
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
