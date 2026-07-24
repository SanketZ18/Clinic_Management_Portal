import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
  Shield,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Trash2,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

const normalizeRole = (role) => String(role || 'Doctor').trim().toLowerCase().replace(/_/g, ' ');
const isSuperAdminRole = (role) => normalizeRole(role).includes('super admin');
const isDoctorAllowed = (item) => !!(item?.isActive ?? item?.active);
const isAccessAllowed = (item) => isSuperAdminRole(item?.role) || isDoctorAllowed(item);

const ManageDoctors = () => {
  const { doctor } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [savingDoctorId, setSavingDoctorId] = useState('');
  const [deletingDoctorId, setDeletingDoctorId] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isSuperAdmin = isSuperAdminRole(doctor?.role);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      console.error(error);
      toast.error('Could not load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadDoctors();
    }
  }, [isSuperAdmin]);

  const filteredDoctors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return doctors;

    return doctors.filter((item) => {
      const haystack = [
        item.fullName,
        item.qualification,
        item.clinicName,
        item.clinicAddress,
        item.phone,
        item.email,
        item.licenseNumber,
        item.role,
        item.subscriptionPlan,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [doctors, search]);

  const stats = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter((item) => isAccessAllowed(item)).length;
    const inactive = doctors.filter((item) => !isAccessAllowed(item)).length;
    const superAdmins = doctors.filter((item) => isSuperAdminRole(item.role)).length;

    return { total, active, inactive, superAdmins };
  }, [doctors]);

  const sendWhatsAppNotification = (item) => {
    if (!item?.phone) {
      toast.error('Doctor phone number not available');
      return;
    }
    const cleanPhone = item.phone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello Dr. ${item.fullName || ''},\n\nYour account access for Dr. Salunkhe's Digital Clinic Platform has been granted by the Super Admin!\n\nYou can now log in to your dashboard.\n\nThank you!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  };

  const updateAccess = async (item, nextIsActive) => {
    if (!item?.doctorId) return;
    if (item.doctorId === doctor?.doctorId) {
      toast.error('You cannot change access for your own account');
      return;
    }

    if (isSuperAdminRole(item.role)) {
      toast.error('Super admin access is always allowed');
      return;
    }

    setSavingDoctorId(item.doctorId);
    try {
      const response = await api.put(`/admin/doctors/${item.doctorId}/access`, {
        isActive: nextIsActive,
      });
      const updatedDoctor = response.data?.data;
      setDoctors((current) =>
        current.map((entry) => (entry.doctorId === updatedDoctor.doctorId ? updatedDoctor : entry))
      );
      if (isDoctorAllowed(updatedDoctor)) {
        toast.success('Doctor access allowed! Opening WhatsApp to notify doctor...');
        sendWhatsAppNotification(updatedDoctor);
      } else {
        toast.success('Doctor access declined');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Could not update access');
    } finally {
      setSavingDoctorId('');
    }
  };

  const deleteDoctor = async (item) => {
    if (!item?.doctorId) return;
    if (item.doctorId === doctor?.doctorId) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (isSuperAdminRole(item.role)) {
      toast.error('Super admin accounts cannot be deleted');
      return;
    }

    setDeletingDoctorId(item.doctorId);
    setConfirmDeleteId(null);
    try {
      await api.delete(`/admin/doctors/${item.doctorId}`);
      setDoctors((current) => current.filter((entry) => entry.doctorId !== item.doctorId));
      toast.success(`${item.fullName || 'Doctor'} has been deleted`);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Could not delete doctor');
    } finally {
      setDeletingDoctorId('');
    }
  };

  if (!isSuperAdmin) {
    return <Navigate to="/doctor" replace />;
  }

  return (
    <div className="dashboard-page manage-doctors-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <div className="dashboard-panel-kicker">Super admin control</div>
          <h2 className="new-patient-title" style={{ fontSize: '1.55rem', marginBottom: 6 }}>
            Manage doctor access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: 720 }}>
            Review every registered doctor, allow or decline access to the platform, and keep the clinic network under one secure admin view.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={loadDoctors} className="btn btn-ghost btn-sm" disabled={loading}>
            <RefreshCw size={14} /> Reload list
          </button>
        </div>
      </div>

      <div className="patient-log-stats-container">
        <div className="patient-log-stat-card">
          <span className="stat-badge stat-badge-total">TOTAL DOCTORS</span>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="patient-log-stat-card">
          <span className="stat-badge stat-badge-new">ALLOW</span>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="patient-log-stat-card">
          <span className="stat-badge stat-badge-follow">NOT ALLOWED</span>
          <div className="stat-value">{stats.inactive}</div>
        </div>
        <div className="patient-log-stat-card">
          <span className="stat-badge stat-badge-regular">SUPER ADMINS</span>
          <div className="stat-value">{stats.superAdmins}</div>
        </div>
      </div>

      <section className="card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <div className="patient-log-search" style={{ maxWidth: 520 }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, clinic, phone, role..."
            />
          </div>
          <div className="badge badge-gold" style={{ padding: '6px 12px' }}>
            <Shield size={14} /> Super admin only
          </div>
        </div>

        <div className="register-table-wrapper">
          {loading ? (
            <div className="register-empty" style={{ padding: '60px 20px' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 14px' }} />
              <h3>Loading doctors</h3>
              <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: '0.85rem' }}>
                Please wait while the system fetches the doctor registry.
              </p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="register-empty">
              <Users size={44} />
              <h3>No doctors found</h3>
              <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: '0.85rem' }}>
                Try a different search term or wait until more doctors register on the platform.
              </p>
            </div>
          ) : (
            <table className="register-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Clinic</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th style={{ textAlign: 'center' }}>Access Control</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((item) => {
                  const isSelf = item.doctorId === doctor?.doctorId;
                  const roleLabel = item.role || 'Doctor';
                  const accessAllowed = isAccessAllowed(item);
                  const isSuperAdminDoctor = isSuperAdminRole(item.role);
                  const joinedLabel = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
                  const lastLoginLabel = item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

                  return (
                    <tr key={item.doctorId || item.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <strong style={{ color: 'var(--dark)' }}>{item.fullName || 'Doctor'}</strong>
                          <span style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>{item.qualification || 'Qualification not set'}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontWeight: 600, color: 'var(--dark)' }}>{item.clinicName || 'Clinic not set'}</span>
                          <span style={{ fontSize: '0.77rem', color: 'var(--text-muted)', maxWidth: 250 }}>
                            {item.clinicAddress || 'Address not available'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
                          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Phone size={12} /> {item.phone || 'N/A'}</span>
                          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><Mail size={12} /> {item.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={roleLabel.toLowerCase().replace(/_/g, ' ').includes('super admin') ? 'badge badge-gold' : 'badge badge-green'}>
                          {roleLabel}
                        </span>
                      </td>
                      <td>
                        <span className={accessAllowed ? 'badge badge-green' : 'badge badge-red'}>
                          {accessAllowed ? 'Allow' : 'Declined'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <CalendarDays size={12} /> {joinedLabel}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                          <Clock3 size={12} /> {lastLoginLabel}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
                          {/* Allow */}
                          <button
                            type="button"
                            className={accessAllowed ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                            onClick={() => updateAccess(item, true)}
                            disabled={savingDoctorId === item.doctorId || isSelf || isSuperAdminDoctor}
                            title={isSuperAdminDoctor ? 'Super admin access is always allowed' : isSelf ? 'Your own account cannot be changed' : 'Allow access'}
                            style={{ padding: '6px 8px', minWidth: 'unset' }}
                          >
                            {savingDoctorId === item.doctorId ? (
                              <span className="spinner" style={{ width: 14, height: 14 }} />
                            ) : (
                              <UserCheck size={15} />
                            )}
                          </button>

                          {/* WhatsApp Notify */}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => sendWhatsAppNotification(item)}
                            title="Send WhatsApp message to doctor"
                            style={{ padding: '6px 8px', minWidth: 'unset', color: '#16a34a' }}
                          >
                            <Smartphone size={15} />
                          </button>

                          {/* Decline */}
                          <button
                            type="button"
                            className={!accessAllowed ? 'btn btn-danger btn-sm' : 'btn btn-ghost btn-sm'}
                            onClick={() => updateAccess(item, false)}
                            disabled={savingDoctorId === item.doctorId || isSelf || isSuperAdminDoctor}
                            title={isSuperAdminDoctor ? 'Super admin access is always allowed' : isSelf ? 'Your own account cannot be changed' : 'Decline access'}
                            style={{ padding: '6px 8px', minWidth: 'unset' }}
                          >
                            {savingDoctorId === item.doctorId ? (
                              <span className="spinner" style={{ width: 14, height: 14 }} />
                            ) : (
                              <UserX size={15} />
                            )}
                          </button>

                          {/* Delete */}
                          {confirmDeleteId === item.doctorId ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => deleteDoctor(item)}
                                disabled={deletingDoctorId === item.doctorId}
                                title="Confirm delete"
                                style={{ padding: '6px 8px', minWidth: 'unset', background: '#dc2626' }}
                              >
                                {deletingDoctorId === item.doctorId ? (
                                  <span className="spinner" style={{ width: 14, height: 14 }} />
                                ) : (
                                  <Trash2 size={15} />
                                )}
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setConfirmDeleteId(null)}
                                title="Cancel"
                                style={{ padding: '6px 8px', minWidth: 'unset', fontSize: '0.7rem' }}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setConfirmDeleteId(item.doctorId)}
                              disabled={isSelf || isSuperAdminDoctor || deletingDoctorId === item.doctorId}
                              title={isSuperAdminDoctor ? 'Super admin cannot be deleted' : isSelf ? 'Cannot delete your own account' : 'Delete doctor'}
                              style={{ padding: '6px 8px', minWidth: 'unset', color: 'var(--danger, #dc2626)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManageDoctors;
