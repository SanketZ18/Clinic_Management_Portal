import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, Building, Award, Phone, Mail, FileText, Lock, 
  Upload, CheckCircle, AlertCircle, ShieldAlert 
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getSubscriptionInfo } from '../../utils/subscription';


const Profile = () => {
  const { doctor, updateDoctor, refreshProfile } = useAuth();
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    fullName: doctor?.fullName || '',
    qualification: doctor?.qualification || '',
    clinicName: doctor?.clinicName || '',
    clinicAddress: doctor?.clinicAddress || '',
    phone: doctor?.phone || '',
    licenseNumber: doctor?.licenseNumber || '',
    signatureBase64: doctor?.signatureBase64 || ''
  });
  
  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (!doctor) return;
    setProfileForm({
      fullName: doctor.fullName || '',
      qualification: doctor.qualification || '',
      clinicName: doctor.clinicName || '',
      clinicAddress: doctor.clinicAddress || '',
      phone: doctor.phone || '',
      licenseNumber: doctor.licenseNumber || '',
      signatureBase64: doctor.signatureBase64 || ''
    });
  }, [doctor]);

  const doctorInitials = doctor?.fullName
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('') || 'DR';

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Convert uploaded signature image to Base64
  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) { // limit 500KB
      toast.error('Signature file must be under 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, signatureBase64: reader.result }));
      toast.success('Signature image selected. Save profile to update.');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/doctor/profile', profileForm);
      updateDoctor(response.data.data);
      toast.success('Clinic profile details updated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update profile info';
      toast.error(errorMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/doctor/profile/password', passwordForm);
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to change password. Verify current password.';
      toast.error(errorMsg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="profile-grid dashboard-page">
      
      {/* Left side summary card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="profile-avatar-card">
          <div className="profile-avatar">
            {doctorInitials}
          </div>
          <h3 style={{ margin: '8px 0 2px' }}>{doctor?.fullName}</h3>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            {doctor?.qualification}
          </p>
          <span className="badge badge-gold" style={{ marginTop: 8 }}>
            Registered License: {doctor?.licenseNumber}
          </span>
          <div className="divider" style={{ margin: '15px 0' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', fontSize: '0.85rem' }}>
            <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Building size={14} color="var(--primary)" /> {doctor?.clinicName}
            </p>
            <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Mail size={14} color="var(--primary)" /> {doctor?.email}
            </p>
            <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Phone size={14} color="var(--primary)" /> {doctor?.phone}
            </p>
          </div>
        </div>

        {/* Subscription Info Widget */}
        {(() => {
          const isSuperAdmin = String(doctor?.role || '').toLowerCase().includes('super admin');
          const subInfo = getSubscriptionInfo(doctor);
          return (
            <div className="card" style={{ padding: 20 }}>
              <h4 style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <ShieldAlert size={16} color={isSuperAdmin ? 'var(--primary)' : subInfo.isWarning ? '#ef4444' : 'var(--primary)'} /> Subscription Status
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>
                {isSuperAdmin
                  ? 'Super Admin account has permanent lifetime platform access.'
                  : '1-Year Plan validity from registration date.'}
              </p>
              <div style={{ padding: 12, background: isSuperAdmin ? 'var(--primary-pale)' : subInfo.isWarning ? '#fef2f2' : 'var(--primary-pale)', borderRadius: 8, border: subInfo.isWarning && !isSuperAdmin ? '1px solid #fca5a5' : '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold' }}>
                  <span>Plan Duration:</span>
                  <span className="text-primary">{isSuperAdmin ? 'Lifetime Access (Super Admin)' : '365 Days Plan (₹500)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: 4 }}>
                  <span>Payment Status:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success, #16a34a)' }}>{isSuperAdmin ? 'N/A (Super Admin)' : '₹500 (PAID)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: 4 }}>
                  <span>Access Status:</span>
                  <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
                    {isSuperAdmin ? 'Lifetime Access Granted' : subInfo.isExpired ? 'EXPIRED' : `${subInfo.daysRemaining} Days Remaining`}
                  </span>
                </div>
              </div>
              {!isSuperAdmin && (
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    to="/payment-qr?mode=renew"
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '0.75rem', color: '#ef4444', border: '1px solid #fca5a5' }}
                  >
                    Renew Plan (₹500)
                  </Link>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Right side form cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Profile details form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dark)', fontFamily: 'var(--font-heading)' }}>
            <User size={20} color="var(--primary)" /> Clinic Profile Details
          </h3>
          
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Doctor Name *</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={profileForm.fullName} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input 
                  type="text" 
                  name="qualification" 
                  value={profileForm.qualification} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Clinic Name *</label>
                <input 
                  type="text" 
                  name="clinicName" 
                  value={profileForm.clinicName} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Medical License Number *</label>
                <input 
                  type="text" 
                  name="licenseNumber" 
                  value={profileForm.licenseNumber} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Clinic Address *</label>
                <input 
                  type="text" 
                  name="clinicAddress" 
                  value={profileForm.clinicAddress} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={profileForm.phone} 
                  onChange={handleProfileChange}
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            {/* Signature Uploader */}
            <div className="form-group">
              <label className="form-label">Authorized Signature Image (Used on prescriptions and day reports)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '15px', background: 'var(--bg)', borderRadius: '12px', border: '1.5px dashed var(--border-mid)' }}>
                <div style={{ width: '150px', height: '60px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {profileForm.signatureBase64 ? (
                    <img 
                      src={profileForm.signatureBase64} 
                      alt="Signature Preview" 
                      style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No signature</span>
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    id="sig-file" 
                    accept="image/png, image/jpeg, image/jpg" 
                    onChange={handleSignatureUpload}
                    style={{ display: 'none' }} 
                  />
                  <label htmlFor="sig-file" className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                    <Upload size={14} /> Choose Image
                  </label>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    PNG or JPEG with clear background. Max size 500KB.
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-sm ${savingProfile ? 'btn-loading' : ''}`}
              style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
            >
              {savingProfile ? 'Saving Details...' : 'Save Profile Details'}
            </button>
          </form>
        </div>

        {/* Change password form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8, color: 'var(--dark)', fontFamily: 'var(--font-heading)' }}>
            <Lock size={20} color="var(--primary)" /> Change Security Password
          </h3>
          
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input 
                type="password" 
                name="currentPassword" 
                value={passwordForm.currentPassword} 
                onChange={handlePasswordChange}
                placeholder="••••••••" 
                className="form-input" 
                required 
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input 
                  type="password" 
                  name="newPassword" 
                  value={passwordForm.newPassword} 
                  onChange={handlePasswordChange}
                  placeholder="••••••••" 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input 
                  type="password" 
                  name="confirmNewPassword" 
                  value={passwordForm.confirmNewPassword} 
                  onChange={handlePasswordChange}
                  placeholder="••••••••" 
                  className="form-input" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-sm ${savingPassword ? 'btn-loading' : ''}`}
              style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
            >
              {savingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
