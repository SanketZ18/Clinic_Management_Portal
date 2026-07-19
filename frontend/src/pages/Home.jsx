import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Share2,
  BookOpen,
  Building2,
  ArrowRight,
  Stethoscope,
  Shield,
  Zap,
  Users,
  Award,
  Star,
  Play,
  MapPin,
  Phone,
  Mail,
  Quote,
  CheckCircle2,
  Bot,
  Lock,
  UserCog,
  ClipboardList,
  PenTool,
  BarChart3,
  Search as SearchIcon,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import heroBg from '../assets/images/image4.png';
import ctaBg from '../assets/images/image5.jpg';
import heroFloatImg from '../assets/images/image13.jpeg';

/* ─────────────────────────── DATA ─────────────────────────── */

const features = [
  {
    icon: FileText,
    title: 'Digital Prescription PDF',
    desc: 'Generate polished, branded PDF prescriptions with remedies, dosage, potency, and digital signature in one click.',
    category: 'Clinical',
  },
  {
    icon: Share2,
    title: 'Share via WhatsApp / Email',
    desc: 'Share the prescription instantly with the patient via WhatsApp or email directly after the consultation.',
    category: 'Clinical',
  },
  {
    icon: ClipboardList,
    title: 'Patient Session Log',
    desc: "Track all of today's patients in a structured daily register — organized and easy to review anytime.",
    category: 'Clinical',
  },
  {
    icon: BarChart3,
    title: 'Day Report (PDF)',
    desc: 'Download a full day-end PDF report with all patient records and consultation history.',
    category: 'Clinical',
  },
  {
    icon: Building2,
    title: 'Clinic Identity & Signature',
    desc: 'Clinic name, doctor details, qualification, and digital signature auto-appear on every prescription letterhead.',
    category: 'Clinical',
  },
  {
    icon: BookOpen,
    title: 'Research Feed',
    desc: 'Curated clinical insights, case studies, and medical research articles.',
    category: 'Knowledge',
  },
  {
    icon: Bot,
    title: 'Integrated Search Desk',
    desc: 'Search Google or ChatGPT directly from the dashboard with pre-loaded clinical prompts.',
    category: 'Knowledge',
  },
  {
    icon: Lock,
    title: 'Secure JWT Authentication',
    desc: 'Token-based login with role-based access control keeps your clinic data fully protected.',
    category: 'Platform',
  },

  {
    icon: PenTool,
    title: 'Profile & Subscription',
    desc: 'Doctors manage clinic profile, qualifications, digital signature, and subscription plan tier.',
    category: 'Platform',
  },
];

const categoryMeta = {
  Clinical:  { bg: 'rgba(37,99,235,0.08)',   text: '#2563eb', border: 'rgba(37,99,235,0.18)',  dot: '#2563eb' },
  Knowledge: { bg: 'rgba(14,165,233,0.08)',  text: '#0284c7', border: 'rgba(14,165,233,0.18)', dot: '#0ea5e9' },
  Platform:  { bg: 'rgba(124,58,237,0.08)',  text: '#7c3aed', border: 'rgba(124,58,237,0.18)', dot: '#7c3aed' },
};

const workflowSteps = [
  {
    num: '01',
    icon: UserCog,
    title: 'Register & Set Up',
    desc: 'Create your doctor account, upload your digital signature, and configure your full clinic identity.',
    color: '#2563eb',
    pale: 'rgba(37,99,235,0.08)',
  },
  {
    num: '02',
    icon: Stethoscope,
    title: 'Consult Patient',
    desc: 'Capture chief complaints, modalities, physical & mental generals using the structured scribe form.',
    color: '#0ea5e9',
    pale: 'rgba(14,165,233,0.08)',
  },
  {
    num: '03',
    icon: FileText,
    title: 'Generate Prescription',
    desc: 'One click creates a fully branded PDF prescription with remedies, dosage, potency, and your signature.',
    color: '#3b82f6',
    pale: 'rgba(59,130,246,0.08)',
  },
  {
    num: '04',
    icon: Share2,
    title: 'Share & Log',
    desc: 'Share via WhatsApp or email instantly, and the visit is logged automatically in your daily register.',
    color: '#1d4ed8',
    pale: 'rgba(29,78,216,0.08)',
  },
];

/* ──────────────── ANIMATION VARIANTS ──────────────── */
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

/* ══════════════════════════ HOME PAGE ══════════════════════════ */
const Home = () => {
  return (
    <div style={{ background: 'var(--bg-white)', overflowX: 'hidden' }}>
      <Navbar transparent={true} />

      {/* ── SECTION 1 : HERO ─────────────────────────────────────── */}
      <section className="hero" style={{ minHeight: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(135deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.3) 40%, rgba(14,165,233,0.18) 100%)',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '72px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2.5rem', alignItems: 'center', minHeight: 'calc(100vh - 72px)' }}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.68)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '2.8rem',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
                maxWidth: '620px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.45)',
                  borderRadius: '999px', padding: '6px 16px', color: '#bfdbfe',
                  fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em',
                  textTransform: 'uppercase', marginBottom: '1.15rem',
                }}
              >
                <Stethoscope size={14} />
                Smart Clinic Management Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
                style={{
                  color: 'white', fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.25rem, 4.6vw, 4rem)', fontWeight: 900,
                  lineHeight: 1.08, marginBottom: '1rem', letterSpacing: '-0.02em',
                }}
              >
                Empower Your Practice,{' '}
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Centred Around
                </span>{' '}
                Every Patient
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: 'rgba(255,255,255,0.86)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.8rem', maxWidth: 560 }}
              >
                Register, track patients, and generate polished PDF prescriptions from one focused digital workspace built to streamline clinic operations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}
              >
                <Link to="/auth?mode=register" className="btn btn-primary btn-lg" style={{ boxShadow: '0 10px 26px rgba(29,78,216,0.35)' }}>
                  Register as Doctor <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)', color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Play size={16} fill="white" /> Our Story
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  width: '100%', maxWidth: 360, borderRadius: '24px', overflow: 'hidden',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)',
                  position: 'relative', aspectRatio: '4/3',
                }}
              >
                <img src={heroFloatImg} alt="Clinic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 62%)' }} />
                <div
                  style={{
                    position: 'absolute', bottom: 14, left: 14, right: 14,
                    background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)',
                    borderRadius: '14px', padding: '10px 14px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={16} color="white" fill="white" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Smart Clinic Management Platform</div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.73rem' }}>Empowering clinical practices worldwide</div>
                  </div>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
                {[
                  { icon: Shield,   title: 'Years',    val: '30+',      color: '#2563eb' },
                  { icon: Users,    title: 'Patients', val: '5K+',      color: '#0ea5e9' },
                  { icon: Award,    title: 'Remedies', val: '300+',     color: '#3b82f6' },
                  { icon: FileText, title: 'PDF Ready',val: 'One Click',color: '#1d4ed8' },
                ].map(({ icon: Icon, title, val, color }) => (
                  <motion.div
                    key={title}
                    whileHover={{ y: -4 }}
                    style={{
                      background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                      borderRadius: '14px', padding: '12px 14px',
                      border: '1px solid rgba(255,255,255,0.16)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: '8px', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                      <Icon size={14} color="white" />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.7rem', marginBottom: 2 }}>{title}</div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.92rem', fontFamily: 'var(--font-heading)' }}>{val}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>



      {/* ── SECTION 4 : PLATFORM FEATURES ───────────────────────── */}
      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center" style={{ marginBottom: '3rem' }}>
            <motion.div variants={itemVariants} className="section-label" style={{ color: '#2563eb', borderColor: 'rgba(37,99,235,0.18)', background: 'rgba(59,130,246,0.08)' }}>
              Platform Features
            </motion.div>
            <motion.h2 variants={itemVariants} style={{ color: '#0f172a', marginTop: '0.75rem' }}>
              Everything your clinic needs,{' '}
              <span style={{ color: '#2563eb' }}>in one place</span>
            </motion.h2>
            <motion.p variants={itemVariants} style={{ maxWidth: 560, margin: '0.75rem auto 0', fontSize: '0.95rem', color: '#64748b' }}>
              A complete digital toolkit built to streamline your clinic workflow — from consultation to prescription to research.
            </motion.p>

            {/* Category legend */}
            <motion.div variants={itemVariants} style={{ display: 'inline-flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.25rem' }}>
              {Object.entries(categoryMeta).map(([cat, meta]) => (
                <span
                  key={cat}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: '999px',
                    background: meta.bg, color: meta.text,
                    border: `1px solid ${meta.border}`,
                    fontSize: '0.78rem', fontWeight: 700,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.dot, display: 'inline-block' }} />
                  {cat}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem' }}
          >
            {features.map(({ icon: Icon, title, desc, category }) => {
              const meta = categoryMeta[category];
              return (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  whileHover={{ y: -6, boxShadow: '0 24px 48px rgba(15,23,42,0.1)' }}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid rgba(147,197,253,0.28)',
                    boxShadow: '0 4px 20px rgba(15,23,42,0.05)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    transition: 'box-shadow 0.25s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div
                      style={{
                        width: 48, height: 48, borderRadius: '14px',
                        background: meta.bg, border: `1px solid ${meta.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={meta.text} />
                    </div>
                    <span
                      style={{
                        padding: '3px 10px', borderRadius: '999px',
                        background: meta.bg, color: meta.text,
                        border: `1px solid ${meta.border}`,
                        fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                      }}
                    >
                      {category}
                    </span>
                  </div>
                  <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{title}</h4>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 5 : HOW IT WORKS ─────────────────────────────── */}
      <section className="section" style={{ background: 'linear-gradient(180deg, #f0f6ff 0%, #e8f2ff 100%)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center" style={{ marginBottom: '3.5rem' }}>
            <motion.div variants={itemVariants} className="section-label" style={{ color: '#2563eb', borderColor: 'rgba(37,99,235,0.18)', background: 'rgba(59,130,246,0.08)' }}>
              Workflow
            </motion.div>
            <motion.h2 variants={itemVariants} style={{ color: '#0f172a', marginTop: '0.75rem' }}>
              From consultation to prescription —{' '}
              <span style={{ color: '#2563eb' }}>in 4 steps</span>
            </motion.h2>
            <motion.p variants={itemVariants} style={{ maxWidth: 520, margin: '0.75rem auto 0', fontSize: '0.95rem', color: '#64748b' }}>
              A focused, distraction-free workflow that saves time and lets you focus on what matters most — your patient.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative' }}
          >
            {workflowSteps.map(({ num, icon: Icon, title, desc, color, pale }, i) => (
              <motion.div
                key={num}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                style={{
                  background: 'white',
                  borderRadius: '22px',
                  border: '1px solid rgba(147,197,253,0.32)',
                  boxShadow: '0 8px 30px rgba(15,23,42,0.06)',
                  padding: '2rem 1.75rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Background step number watermark */}
                <div
                  style={{
                    position: 'absolute', top: -12, right: 12,
                    fontSize: '5rem', fontWeight: 900, color: pale === 'rgba(37,99,235,0.08)' ? 'rgba(37,99,235,0.06)' : pale.replace('0.08', '0.07'),
                    fontFamily: 'var(--font-heading)', lineHeight: 1, userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {num}
                </div>

                <div
                  style={{
                    width: 52, height: 52, borderRadius: '16px',
                    background: pale, border: `1.5px solid ${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Icon size={24} color={color} />
                </div>

                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: '8px',
                    background: color, color: 'white',
                    fontSize: '0.72rem', fontWeight: 800,
                    marginBottom: '0.75rem',
                  }}
                >
                  {i + 1}
                </div>

                <h4 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.6rem' }}>{title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="text-center" style={{ marginTop: '2.5rem' }}
          >
            <Link to="/auth?mode=register" className="btn btn-primary btn-lg" style={{ boxShadow: '0 10px 26px rgba(29,78,216,0.28)' }}>
              Start Using the Platform <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>



      {/* ── SECTION 7 : CTA ──────────────────────────────────────── */}
      <section
        style={{
          position: 'relative', overflow: 'hidden', padding: '6rem 0',
          backgroundImage: `url(${ctaBg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.36) 0%, rgba(15,23,42,0.62) 100%)', zIndex: 0 }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              padding: '3.5rem 2.5rem',
              borderRadius: '28px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.16)', border: '1px solid rgba(96,165,250,0.38)', borderRadius: '999px', padding: '6px 16px', color: '#bfdbfe', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Zap size={14} /> Start Today
            </div>
            <h2 style={{ color: 'white', marginBottom: '1rem', fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontFamily: 'var(--font-heading)' }}>
              Ready to run your clinic <span style={{ color: '#60a5fa' }}>digitally?</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.82)', maxWidth: 540, margin: '0 auto 1.5rem', fontSize: '1rem', lineHeight: 1.75 }}>
              Join medical practitioners already using the Smart Clinic Management Platform. Register now — no credit card required.
            </p>

            {/* Contact info strip */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
              {[
                { icon: MapPin, text: 'Khatav, Satara, Maharashtra' },
                { icon: Phone,  text: '+91 99601 22746',          href: 'tel:+919960122746' },
                { icon: Mail,   text: 'akaramsalunkhe@gmail.com', href: 'mailto:akaramsalunkhe@gmail.com' },
              ].map(({ icon: Icon, text, href }) => (
                href ? (
                  <a key={text} href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#bfdbfe', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none' }}>
                    <Icon size={14} /> {text}
                  </a>
                ) : (
                  <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#bfdbfe', fontSize: '0.85rem', fontWeight: 500 }}>
                    <Icon size={14} /> {text}
                  </span>
                )
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/auth?mode=register" className="btn btn-primary btn-lg">Register as Doctor <ArrowRight size={18} /></Link>
              <Link to="/contact" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
                Contact Clinic
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
