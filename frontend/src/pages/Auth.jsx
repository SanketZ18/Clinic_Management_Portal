import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Stethoscope,
  Lock,
  Mail,
  Phone,
  Award,
  FileText,
  User,
  Building,
  MapPin,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

import api from '../services/api';
import doctorImg from '../assets/images/image6.jpg';

const Auth = () => {
  const platformName = "Dr. Salunkhe's Digital Clinic Platform";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, doctor } = useAuth();
  
  const getModeFromParams = () => {
    const m = searchParams.get('mode');
    if (m === 'register') return 'register';
    if (m === 'forgot') return 'forgot';
    return 'login';
  };

  const [authMode, setAuthMode] = useState(getModeFromParams());
  const isLogin = authMode === 'login';
  const isRegister = authMode === 'register';
  const isForgot = authMode === 'forgot';

  const [loading, setLoading] = useState(false);
  const [showPaidInfo, setShowPaidInfo] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    qualification: '',
    clinicName: '',
    clinicAddress: '',
    phone: '',
    email: '',
    licenseNumber: '',
    password: '',
    confirmPassword: '',
  });

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotForm, setForgotForm] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [forgotStatusMsg, setForgotStatusMsg] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfNewPass, setShowConfNewPass] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const getDashboardPath = (doctorData) =>
    String(doctorData?.role || 'Doctor')
      .trim()
      .toLowerCase()
      .replace(/_/g, ' ')
      .includes('super admin')
      ? '/super-admin'
      : '/doctor';

  useEffect(() => {
    if (isAuthenticated) navigate(getDashboardPath(doctor));
  }, [doctor, isAuthenticated, navigate]);

  useEffect(() => {
    setAuthMode(getModeFromParams());
    setValidationErrors({});
    setTouchedFields({});
  }, [searchParams]);

  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  const validateField = (name, value, formState = registerForm) => {
    let error = '';
    const val = value ? String(value).trim() : '';
    switch (name) {
      case 'fullName':
        if (!val) error = 'Full name is required';
        else if (val.length < 2) error = 'Full name must be at least 2 characters';
        else if (val.length > 100) error = 'Full name cannot exceed 100 characters';
        break;
      case 'qualification':
        if (!val) error = 'Qualification is required';
        else if (val.length < 2) error = 'Qualification must be at least 2 characters (e.g. BHMS, MD)';
        break;
      case 'phone':
        if (!val) error = 'Phone number is required';
        else if (!/^[+]?[0-9]{10,15}$/.test(val)) error = 'Phone number must be 10-15 digits';
        break;
      case 'clinicName':
        if (!val) error = 'Clinic name is required';
        else if (val.length < 3) error = 'Clinic name must be at least 3 characters';
        break;
      case 'email':
        if (!val) error = 'Email address is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = 'Please enter a valid email address';
        break;
      case 'licenseNumber':
        if (!val) error = 'Medical license number is required';
        else if (val.length < 3) error = 'License number must be at least 3 characters';
        break;
      case 'clinicAddress':
        if (!val) error = 'Clinic address is required';
        else if (val.length < 5) error = 'Clinic address must be at least 5 characters';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(value)) {
          error = 'Must contain uppercase, lowercase letter & number';
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formState.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    return error;
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...registerForm, [name]: value };
    setRegisterForm(updatedForm);

    if (touchedFields[name] || validationErrors[name]) {
      const err = validateField(name, value, updatedForm);
      setValidationErrors((prev) => ({ ...prev, [name]: err }));

      if (name === 'password' && (touchedFields.confirmPassword || validationErrors.confirmPassword)) {
        const confErr = validateField('confirmPassword', updatedForm.confirmPassword, updatedForm);
        setValidationErrors((prev) => ({ ...prev, confirmPassword: confErr }));
      }
    }
  };

  const handleRegisterBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, registerForm);
    setValidationErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateRegister = () => {
    const errors = {};
    const fields = [
      'fullName',
      'qualification',
      'phone',
      'clinicName',
      'email',
      'licenseNumber',
      'clinicAddress',
      'password',
      'confirmPassword',
    ];
    const allTouched = {};
    fields.forEach((field) => {
      allTouched[field] = true;
      const err = validateField(field, registerForm[field], registerForm);
      if (err) errors[field] = err;
    });
    setTouchedFields(allTouched);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctorData = await login(loginForm);
      toast.success(`Welcome back to ${platformName}!`);
      navigate(getDashboardPath(doctorData));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) {
      toast.error('Please fix the errors below');
      return;
    }
    setLoading(true);
    try {
      const doctorData = await register(registerForm);
      toast.success('Registration successful! Please scan QR code & complete ₹500 payment.');
      navigate(
        `/payment?name=${encodeURIComponent(registerForm.fullName)}&email=${encodeURIComponent(registerForm.email)}&phone=${encodeURIComponent(registerForm.phone)}`
      );
    } catch (err) {
      if (err.response?.data?.data) setValidationErrors(err.response.data.data);
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const emailToUse = (forgotForm.email || loginForm.email || '').trim();
    if (!emailToUse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      toast.error('Please enter a valid registered email address');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email: emailToUse });
      const msg = res.data?.message || 'OTP sent successfully. Enter the OTP';
      setForgotForm((prev) => ({ ...prev, email: emailToUse }));
      setForgotStatusMsg(msg);
      setForgotStep(2);
      toast.success(msg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotForm.otp || forgotForm.otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/verify-otp', {
        email: forgotForm.email,
        otp: forgotForm.otp.trim(),
      });
      toast.success(res.data?.message || 'OTP verified successfully. You may now reset your password.');
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotForm.newPassword) {
      toast.error('Please enter your new password');
      return;
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (forgotForm.newPassword.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/.test(forgotForm.newPassword)) {
      toast.error('Password must contain uppercase, lowercase letter & number (min 8 chars)');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password/reset-password', {
        email: forgotForm.email,
        otp: forgotForm.otp.trim(),
        newPassword: forgotForm.newPassword,
        confirmPassword: forgotForm.confirmPassword,
      });
      toast.success(res.data?.message || 'Password reset successfully! Please log in with your new password.');
      setLoginForm({ email: forgotForm.email, password: '' });
      setAuthMode('login');
      navigate('/auth?mode=login');
      setForgotStep(1);
      setForgotForm({ email: '', otp: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    padding: '13px 15px',
    borderRadius: '14px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#cbd9ff'}`,
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    color: '#0f172a',
    fontSize: '0.92rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset',
  });

  const labelStyle = {
    display: 'block',
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#1d4ed8',
    marginBottom: '5px',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const errorStyle = {
    color: '#dc2626',
    fontSize: '0.72rem',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const registerFormLayout = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem',
  };

  const registerRowGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.8rem',
    alignItems: 'start',
  };

  const fullWidthField = { gridColumn: '1 / -1' };

  return (
    <div style={{ background: 'linear-gradient(180deg, #eef4ff 0%, #f8fbff 42%, #ffffff 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar transparent={false} />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.25rem', paddingTop: 'calc(72px + 2rem)' }}>
        <div style={{ width: '100%', maxWidth: isForgot ? 920 : (isLogin ? 980 : 1260) }}>
          {!isForgot && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Doctor Login', mode: 'login', active: isLogin },
                { label: 'Doctor Registration', mode: 'register', active: isRegister },
              ].map(({ label, mode, active }) => (
                <button
                  key={mode}
                  onClick={() => navigate(`/auth?mode=${mode}`)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '999px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    border: active ? 'none' : '1px solid rgba(148,163,184,0.28)',
                    background: active ? 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)' : 'rgba(255,255,255,0.8)',
                    color: active ? 'white' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 10px 24px rgba(29,78,216,0.24)' : '0 1px 4px rgba(15,23,42,0.05)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <motion.div
            key={authMode + (isForgot ? `-step${forgotStep}` : '')}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.88)',
              borderRadius: '26px',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexWrap: isRegister ? 'nowrap' : 'wrap',
              border: '1px solid rgba(148,163,184,0.18)',
              backdropFilter: 'blur(18px)',
              maxWidth: isRegister ? 1240 : 920,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                flex: isRegister ? '0 0 350px' : '0 0 340px',
                minHeight: isRegister ? 560 : 430,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #0f172a 0%, #1d4ed8 55%, #0ea5e9 100%)',
              }}
            >
              <img
                src={doctorImg}
                alt="Doctor"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.62 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(15,23,42,0.35) 0%, rgba(29,78,216,0.64) 50%, rgba(14,165,233,0.35) 100%)' }} />

              <div style={{ position: 'absolute', top: 28, left: 28, right: 28, zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.22)' }}>
                    <Stethoscope size={18} color="white" />
                  </div>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.84rem', fontFamily: 'var(--font-heading)', lineHeight: 1.05, maxWidth: 180, whiteSpace: 'nowrap' }}>
                    {platformName}
                  </span>
                </div>
                <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.15rem, 1.7vw, 1.45rem)', lineHeight: 1.25, fontWeight: 800, margin: 0 }}>
                  {isForgot
                    ? 'Reset your password securely in just a few steps.'
                    : isLogin
                    ? 'Protect your practice with cleaner records and faster follow-ups.'
                    : 'Join a brighter digital workflow for your clinic today.'}
                </h2>
              </div>

              {isForgot ? (
                <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 2, display: 'grid', gap: 8 }}>
                  {[
                    { icon: CheckCircle, text: `Step 1: Enter your registered email` },
                    { icon: CheckCircle, text: `Step 2: Verify the 6-digit OTP` },
                    { icon: CheckCircle, text: `Step 3: Set your new password` },
                  ].map(({ icon: Icon, text }, idx) => (
                    <div
                      key={text}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: forgotStep > idx ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        border: forgotStep === idx + 1 ? '1px solid rgba(255,255,255,0.45)' : '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Icon size={13} color={forgotStep > idx ? '#86efac' : '#bfdbfe'} />
                      <span style={{ color: 'rgba(255,255,255,0.96)', fontSize: '0.8rem', fontWeight: forgotStep === idx + 1 ? 700 : 600 }}>{text}</span>
                    </div>
                  ))}
                </div>
              ) : isLogin ? (
                <div style={{ position: 'absolute', bottom: 22, left: 18, right: 18, zIndex: 2 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <CheckCircle size={13} color="#bfdbfe" />
                    <span style={{ color: 'rgba(255,255,255,0.96)', fontSize: '0.8rem', fontWeight: 600 }}>
                      Fast login for returning doctors
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'absolute', bottom: 20, left: 16, right: 16, zIndex: 2, display: 'grid', gap: 8 }}>
                  {[
                    { icon: CheckCircle, text: '30+ Years of Care' },
                    { icon: CheckCircle, text: '5K+ Patients Helped' },
                    { icon: CheckCircle, text: '300+ Remedies Recorded' },
                  ].map(({ icon: Icon, text }) => (
                    <div
                      key={text}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Icon size={13} color="#bfdbfe" />
                      <span style={{ color: 'rgba(255,255,255,0.96)', fontSize: '0.8rem', fontWeight: 600 }}>{text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: isRegister ? '1 1 890px' : '1 1 420px', padding: isRegister ? '1.7rem 1.8rem' : '2.1rem 2.2rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                {isForgot
                  ? (forgotStep === 1 ? 'Forgot your password?' : forgotStep === 2 ? 'Verify your identity' : 'Set a new password')
                  : isLogin ? 'Welcome back' : 'Create your doctor account'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                {isForgot
                  ? (forgotStep === 1
                      ? 'Enter your registered email address. We will send a 6-digit OTP to reset your password.'
                      : forgotStep === 2
                      ? `OTP sent to ${forgotForm.email}. Enter the 6-digit code below.`
                      : 'OTP verified! Enter and confirm your new password.')
                  : isLogin ? `Sign in to ${platformName}.` : 'Fill in the details below to set up your clinic profile.'}
              </p>

              {isForgot ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 380 }}>
                  {/* STATUS BANNER - shown after OTP sent */}
                  {forgotStep >= 2 && forgotStatusMsg && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #86efac', borderRadius: '12px', padding: '12px 14px' }}>
                      <CheckCircle size={15} color="#16a34a" style={{ flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600, lineHeight: 1.4 }}>{forgotStatusMsg}</span>
                    </div>
                  )}

                  {/* STEP 1 — Email input */}
                  {forgotStep === 1 && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>Registered Email Address</label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type="email"
                            value={forgotForm.email}
                            onChange={(e) => setForgotForm((p) => ({ ...p, email: e.target.value }))}
                            style={{ ...inputStyle(false), paddingLeft: 36 }}
                            placeholder="Enter your registered email"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          boxShadow: '0 10px 24px rgba(29,78,216,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? 'Sending OTP...' : (<><ArrowRight size={16} /> Send OTP</>)}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/auth?mode=login')}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer', textAlign: 'center', padding: 0 }}
                      >
                        ← Back to Login
                      </button>
                    </form>
                  )}

                  {/* STEP 2 — OTP verification */}
                  {forgotStep === 2 && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>6-Digit OTP Code</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={forgotForm.otp}
                          onChange={(e) => setForgotForm((p) => ({ ...p, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                          style={{
                            ...inputStyle(false),
                            letterSpacing: '10px',
                            fontSize: '1.6rem',
                            fontWeight: 800,
                            textAlign: 'center',
                            fontFamily: 'monospace',
                          }}
                          placeholder="——————"
                          required
                        />
                        <p style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>OTP is valid for 10 minutes. Check your inbox.</p>
                      </div>
                      <button
                        type="submit"
                        disabled={loading || forgotForm.otp.length !== 6}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: (loading || forgotForm.otp.length !== 6) ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          boxShadow: '0 10px 24px rgba(29,78,216,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: (loading || forgotForm.otp.length !== 6) ? 0.6 : 1,
                        }}
                      >
                        {loading ? 'Verifying OTP...' : (<><CheckCircle size={16} /> Verify OTP</>)}
                      </button>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => { setForgotStep(1); setForgotForm((p) => ({ ...p, otp: '' })); }}
                          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                        >
                          ← Change Email
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Resend OTP
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3 — New password */}
                  {forgotStep === 3 && (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div>
                        <label style={labelStyle}>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={forgotForm.newPassword}
                            onChange={(e) => setForgotForm((p) => ({ ...p, newPassword: e.target.value }))}
                            style={{ ...inputStyle(false), paddingLeft: 36, paddingRight: 36 }}
                            placeholder="Enter new password (min 8 chars)"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                          >
                            {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                          <input
                            type={showConfNewPass ? 'text' : 'password'}
                            value={forgotForm.confirmPassword}
                            onChange={(e) => setForgotForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                            style={{ ...inputStyle(!!(forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword)), paddingLeft: 36, paddingRight: 36 }}
                            placeholder="Re-enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfNewPass(!showConfNewPass)}
                            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                          >
                            {showConfNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                        {forgotForm.confirmPassword && forgotForm.newPassword !== forgotForm.confirmPassword && (
                          <div style={errorStyle}><AlertCircle size={10} /> Passwords do not match</div>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '12px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          boxShadow: '0 10px 24px rgba(22,163,74,0.28)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? 'Resetting...' : (<><CheckCircle size={16} /> Reset Password</>)}
                      </button>
                    </form>
                  )}
                </div>
              ) : isLogin ? (
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', maxWidth: 380 }}>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="email"
                        name="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        style={{ ...inputStyle(false), paddingLeft: 36 }}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        style={{ ...inputStyle(false), paddingLeft: 36, paddingRight: 36 }}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                      >
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotForm((prev) => ({ ...prev, email: loginForm.email || prev.email }));
                          setAuthMode('forgot');
                          setForgotStep(1);
                          navigate('/auth?mode=forgot');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#1d4ed8',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: 4,
                      padding: '12px',
                      borderRadius: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 10px 24px rgba(29,78,216,0.28)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Logging in...' : (<><ArrowRight size={16} /> Login</>)}
                  </button>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/auth?mode=register')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', padding: 0 }}
                      >
                        Register as Doctor
                      </button>
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate(`/payment?mode=renew&email=${encodeURIComponent(loginForm.email)}`)}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '10px',
                        color: '#1d4ed8',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.78rem',
                        padding: '6px 14px',
                        marginTop: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Sparkles size={12} color="#2563eb" /> Renew Subscription Plan (₹500)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} noValidate style={registerFormLayout}>
                  <div style={{ ...fullWidthField, background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={14} color="#2563eb" />
                    <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>Get complete clinic management access for an initial fee of just ₹500.</span>
                    <button
                      type="button"
                      onClick={() => setShowPaidInfo(true)}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#2563eb', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Learn more
                    </button>
                  </div>

                  <div style={registerRowGrid}>
                    <div>
                      <label style={labelStyle}><User size={10} style={{ marginRight: 3 }} />Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={registerForm.fullName}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.fullName)}
                        placeholder="e.g. Dr. Ramesh Patil"
                      />
                      {validationErrors.fullName && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.fullName}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}><Award size={10} style={{ marginRight: 3 }} />Qualification *</label>
                      <input
                        type="text"
                        name="qualification"
                        value={registerForm.qualification}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.qualification)}
                        placeholder="e.g. B.H.M.S., M.D."
                      />
                      {validationErrors.qualification && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.qualification}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}><Phone size={10} style={{ marginRight: 3 }} />Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={registerForm.phone}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.phone)}
                        placeholder="e.g. 9876543210"
                      />
                      {validationErrors.phone && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.phone}</div>}
                    </div>
                  </div>

                  <div style={registerRowGrid}>
                    <div>
                      <label style={labelStyle}><Building size={10} style={{ marginRight: 3 }} />Clinic Name *</label>
                      <input
                        type="text"
                        name="clinicName"
                        value={registerForm.clinicName}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.clinicName)}
                        placeholder="e.g. Healing Touch Clinic"
                      />
                      {validationErrors.clinicName && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.clinicName}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}><Mail size={10} style={{ marginRight: 3 }} />Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.email)}
                        placeholder="doctor@example.com"
                      />
                      {validationErrors.email && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.email}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}><FileText size={10} style={{ marginRight: 3 }} />License No. *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={registerForm.licenseNumber}
                        onChange={handleRegisterChange}
                        onBlur={handleRegisterBlur}
                        style={inputStyle(validationErrors.licenseNumber)}
                        placeholder="e.g. REG-123456"
                      />
                      {validationErrors.licenseNumber && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.licenseNumber}</div>}
                    </div>
                  </div>

                  <div style={fullWidthField}>
                    <label style={labelStyle}><MapPin size={10} style={{ marginRight: 3 }} />Clinic Address *</label>
                    <input
                      type="text"
                      name="clinicAddress"
                      value={registerForm.clinicAddress}
                      onChange={handleRegisterChange}
                      onBlur={handleRegisterBlur}
                      style={inputStyle(validationErrors.clinicAddress)}
                      placeholder="Enter full clinic street address, city, pincode"
                    />
                    {validationErrors.clinicAddress && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.clinicAddress}</div>}
                  </div>

                  <div style={registerRowGrid}>
                    <div>
                      <label style={labelStyle}><Lock size={10} style={{ marginRight: 3 }} />Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPass ? 'text' : 'password'}
                          name="password"
                          value={registerForm.password}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          style={{ ...inputStyle(validationErrors.password), paddingRight: 36 }}
                          placeholder="Min 8 chars (A-Z, a-z, 0-9)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                        >
                          {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                      {validationErrors.password && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.password}</div>}
                    </div>

                    <div>
                      <label style={labelStyle}><Lock size={10} style={{ marginRight: 3 }} />Confirm Password *</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfPass ? 'text' : 'password'}
                          name="confirmPassword"
                          value={registerForm.confirmPassword}
                          onChange={handleRegisterChange}
                          onBlur={handleRegisterBlur}
                          style={{ ...inputStyle(validationErrors.confirmPassword), paddingRight: 36 }}
                          placeholder="Re-enter password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfPass(!showConfPass)}
                          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                        >
                          {showConfPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                      {validationErrors.confirmPassword && <div style={errorStyle}><AlertCircle size={10} />{validationErrors.confirmPassword}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          marginTop: 20,
                          padding: '12px 18px',
                          borderRadius: '14px',
                          border: 'none',
                          cursor: 'pointer',
                          background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          boxShadow: '0 10px 24px rgba(29,78,216,0.28)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          width: '100%',
                          opacity: loading ? 0.7 : 1,
                        }}
                      >
                        {loading ? 'Creating...' : (<><ArrowRight size={14} />Register as Doctor</>)}
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/auth?mode=login')}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}
                    >
                      Doctor Login
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showPaidInfo && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={() => setShowPaidInfo(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              style={{ background: 'white', borderRadius: '22px', padding: '2rem', maxWidth: 460, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb', marginBottom: '1rem' }}>
                <Sparkles size={22} />
                <h3 style={{ margin: 0, color: '#0f172a' }}>Platform Access & Fee</h3>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.7 }}>
                Start and manage your online clinic with our full-featured portal for an initial access fee of just ₹500.
              </p>
              <div style={{ background: '#eff6ff', borderLeft: '4px solid #2563eb', borderRadius: '0 14px 14px 0', padding: 16, marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1d4ed8', marginBottom: 8 }}>Rs. 500 - Initial Setup & Full Access</div>
                <ul style={{ fontSize: '0.86rem', color: '#64748b', paddingLeft: 16, listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li>Unlimited PDF prescriptions</li>
                  <li>Daily patient session logs & records</li>
                  <li>One-click day reports & summaries</li>
                  <li>Clinical research database access</li>
                  <li>Super Admin verification & support</li>
                </ul>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowPaidInfo(false)} className="btn btn-primary btn-sm">I Understand</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Auth;
