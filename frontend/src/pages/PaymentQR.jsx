import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  CheckCircle,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Copy,
  ExternalLink,
  Info
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

import qrCodeImg from '../assets/images/qr-code.png';
import doctorImg from '../assets/images/image6.jpg';

const PaymentQR = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const platformName = "Dr. Salunkhe's Digital Clinic Platform";
  const mode = searchParams.get('mode') || 'registration';
  const doctorName = searchParams.get('name') || 'Doctor';
  const doctorPhone = searchParams.get('phone') || '';
  const doctorEmail = searchParams.get('email') || '';

  const isRenewal = mode === 'renew';

  const adminWhatsAppNumber = '919960122746';
  const displayPhone = '+91 99601 22746';

  const defaultMsg = encodeURIComponent(
    isRenewal
      ? `Hello Management Team / Super Admin,\n\nI want to renew my 1-Year Subscription Plan (₹500) on ${platformName}.\n\n` +
        `Doctor Name: ${doctorName}\n` +
        (doctorEmail ? `Email: ${doctorEmail}\n` : '') +
        (doctorPhone ? `Phone: ${doctorPhone}\n` : '') +
        `\nPlease verify my payment screenshot and renew my 365-day access to my dashboard. Thank you!`
      : `Hello Management Team / Super Admin,\n\nI have registered on ${platformName} and completed the payment of ₹500.\n\n` +
        `Doctor Name: ${doctorName}\n` +
        (doctorEmail ? `Email: ${doctorEmail}\n` : '') +
        (doctorPhone ? `Phone: ${doctorPhone}\n` : '') +
        `\nPlease verify my payment screenshot and grant access to my dashboard. Thank you!`
  );

  const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${defaultMsg}`;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div style={{ background: 'linear-gradient(180deg, #eef4ff 0%, #f8fbff 42%, #ffffff 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar transparent={false} />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.25rem', paddingTop: 'calc(72px + 2rem)' }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: 'rgba(255,255,255,0.92)',
              borderRadius: '30px',
              boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
              overflow: 'hidden',
              display: 'flex',
              flexWrap: 'wrap',
              border: '1px solid rgba(148,163,184,0.18)',
              backdropFilter: 'blur(18px)',
              maxWidth: 1080,
              margin: '0 auto',
            }}
          >
            {/* Left Brand Panel */}
            <div
              style={{
                flex: '0 0 360px',
                minHeight: 580,
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #0f172a 0%, #1d4ed8 55%, #0ea5e9 100%)',
              }}
            >
              <img
                src={doctorImg}
                alt="Doctor"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.58 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(15,23,42,0.4) 0%, rgba(29,78,216,0.68) 50%, rgba(14,165,233,0.4) 100%)' }} />

              <div style={{ position: 'absolute', top: 28, left: 28, right: 28, zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '12px', background: 'rgba(255,255,255,0.16)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.22)' }}>
                    <Stethoscope size={18} color="white" />
                  </div>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: '0.84rem', fontFamily: 'var(--font-heading)', lineHeight: 1.05, maxWidth: 180, whiteSpace: 'nowrap' }}>
                    {platformName}
                  </span>
                </div>
                <h2 style={{ color: 'white', fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 2vw, 1.65rem)', lineHeight: 1.25, fontWeight: 800, margin: 0 }}>
                  Complete your registration & unlock full clinic management.
                </h2>
              </div>

              <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20, zIndex: 2, display: 'grid', gap: 10 }}>
                {[
                  { icon: ShieldCheck, text: 'Instant Verification after Payment' },
                  { icon: CheckCircle, text: 'Full Access to Patient Logs & PDF Prescriptions' },
                  { icon: Smartphone, text: 'Super Admin Support via WhatsApp' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '14px',
                      padding: '10px 14px',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Icon size={16} color="#bfdbfe" />
                    <span style={{ color: 'rgba(255,255,255,0.96)', fontSize: '0.82rem', fontWeight: 600 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Payment Content Panel */}
            <div style={{ flex: '1 1 520px', padding: '2.2rem 2.4rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)', display: 'flex', flexDirection: 'column' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: '999px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
                    <QrCode size={13} /> Step 2: Payment & Verification
                  </div>
                  <h3 style={{ color: '#0f172a', fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                    Scan & Pay Registration Fee
                  </h3>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '8px 16px', borderRadius: '16px', color: 'white', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 8px 20px rgba(16,185,129,0.28)' }}>
                  ₹500 <span style={{ fontSize: '0.75rem', fontWeight: 500, opacity: 0.9 }}>/ initial setup</span>
                </div>
              </div>

              {/* Supported Payment Providers Badges */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Accepted Payment Apps (Scan with any UPI App)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {/* Google Pay */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '5px 12px', fontWeight: 700, fontSize: '0.82rem', color: '#1f2937', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ color: '#4285F4', fontWeight: 900 }}>G</span>
                    <span style={{ color: '#EA4335', fontWeight: 900 }}>o</span>
                    <span style={{ color: '#FBBC05', fontWeight: 900 }}>o</span>
                    <span style={{ color: '#4285F4', fontWeight: 900 }}>g</span>
                    <span style={{ color: '#34A853', fontWeight: 900 }}>l</span>
                    <span style={{ color: '#EA4335', fontWeight: 900 }}>e</span> Pay
                  </div>

                  {/* PhonePe */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '5px 12px', fontWeight: 700, fontSize: '0.82rem', color: '#5f259f', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <span style={{ background: '#5f259f', color: 'white', borderRadius: '4px', padding: '1px 5px', fontSize: '0.7rem', fontWeight: 900 }}>पे</span> PhonePe
                  </div>

                  {/* Paytm */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '5px 12px', fontWeight: 700, fontSize: '0.82rem', color: '#002e6e', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    Paytm <span style={{ color: '#00baf2', fontWeight: 900 }}>UPI</span>
                  </div>

                  {/* BHIM UPI */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '5px 12px', fontWeight: 700, fontSize: '0.82rem', color: '#ea580c', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    BHIM <span style={{ color: '#16a34a', fontWeight: 900 }}>UPI</span>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: QR Code + Screenshot Instructions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 230px) 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                
                {/* QR Code Container */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    position: 'relative',
                    padding: '14px',
                    background: 'white',
                    borderRadius: '22px',
                    border: '2px solid #3b82f6',
                    boxShadow: '0 12px 36px rgba(37,99,235,0.18)',
                    display: 'inline-block',
                  }}>
                    <img
                      src={qrCodeImg}
                      alt="Payment QR Code"
                      style={{ width: '100%', height: 'auto', maxHeight: 200, objectFit: 'contain', borderRadius: '12px' }}
                    />
                    <div style={{ marginTop: 8, fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', background: '#eff6ff', borderRadius: '8px', padding: '4px 8px' }}>
                      Scan & Pay ₹500
                    </div>
                  </div>
                </div>

                {/* Instructions & Screenshot Sharing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#fffbe0', border: '1px solid #fde047', borderRadius: '16px', padding: '14px', fontSize: '0.85rem', color: '#854d0e', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, color: '#a16207', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Info size={16} /> Important Next Step:
                    </div>
                    Scan the QR code, complete the payment of <strong>₹500</strong>, and send the payment screenshot to our <strong>Management Team / Super Admin</strong> on WhatsApp to grant instant access.
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                      Management Team WhatsApp
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532d' }}>
                        {displayPhone}
                      </span>
                      <button
                        onClick={() => copyToClipboard(displayPhone, 'WhatsApp number')}
                        style={{ background: 'white', border: '1px solid #86efac', borderRadius: '8px', padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700, color: '#15803d', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '14px 20px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    boxShadow: '0 10px 24px rgba(37,211,102,0.32)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    textDecoration: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                >
                  <Smartphone size={20} />
                  Send Payment Screenshot on WhatsApp
                  <ExternalLink size={16} />
                </a>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Already paid & sent screenshot?
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/auth?mode=login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Go to Doctor Login <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentQR;
