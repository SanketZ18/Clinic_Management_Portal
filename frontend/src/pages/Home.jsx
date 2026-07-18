import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
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
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import heroBg from '../assets/images/image4.png';
import philosophyBg from '../assets/images/image2.jpeg';
import ctaBg from '../assets/images/image5.jpg';
import heroFloatImg from '../assets/images/image13.jpeg';
import content1 from '../assets/images/Content/1.jpeg';
import content2 from '../assets/images/Content/2.jpeg';
import content3 from '../assets/images/Content/3.jpeg';
import content4 from '../assets/images/Content/4.jpeg';

const features = [
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    desc: 'Generate polished PDF prescriptions with your clinic identity, remedies, dosage, and signature in one click.',
  },
  {
    icon: Download,
    title: 'Patient Session Log',
    desc: "Track today's patients quickly and keep your daily register organized as you consult.",
  },
  {
    icon: Download,
    title: 'One-click Day Report',
    desc: 'Download a complete PDF report of the day with patient details and consultation history.',
  },
  {
    icon: Share2,
    title: 'Share Prescription',
    desc: 'Share the prescription instantly through WhatsApp or email after the consultation.',
  },
  {
    icon: BookOpen,
    title: 'Research Feed',
    desc: 'Read curated clinical insights, case studies, and homeopathic research content by Dr. Salunkhe.',
  },
  {
    icon: Building2,
    title: 'Clinic Identity',
    desc: 'Your clinic name, doctor details, and signature appear on every prescription you create.',
  },
];

const conditions = [
  'Acute Allergies',
  'Chronic Migraines',
  'Psoriasis',
  'Skin Care',
  'Hair Fall',
  'Digestive Issues',
  'Piles & Fissures',
  'Cardiovascular',
  'Nervous System',
  'Kidney & Urinary',
  'Male/Female Reproductive',
  'Sleep Disorders',
];

const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const SquareClinicGallery = () => {
  const [hovered, setHovered] = useState(null);

  const galleryItems = [
    { src: content1, title: 'Clinical Case Mappings', desc: 'Symptom and analysis boards' },
    { src: content2, title: 'Cough and Cold Therapeutics', desc: 'Acute respiratory support' },
    { src: content3, title: 'Vascular and Cardiac Care', desc: 'Homeopathic cardiac support' },
    { src: content4, title: 'The Many Uses of Homoeopathy', desc: 'Holistic systems mapping' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        padding: '0 4rem 4rem 4rem',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {galleryItems.map((item, i) => (
        <motion.div
          key={item.title}
          onHoverStart={() => setHovered(i)}
          onHoverEnd={() => setHovered(null)}
          style={{
            background: 'rgba(255,255,255,0.92)',
            borderRadius: '22px',
            border: '1px solid rgba(148,163,184,0.18)',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
          animate={{
            y: hovered === i ? -12 : 0,
            scale: hovered === i ? 1.03 : 1,
            borderColor: hovered === i ? '#60a5fa' : 'rgba(148,163,184,0.18)',
            boxShadow: hovered === i
              ? '0 20px 40px rgba(37, 99, 235, 0.16)'
              : '0 16px 40px rgba(15, 23, 42, 0.08)',
          }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#f8fbff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(148,163,184,0.12)',
            }}
          >
            <motion.img
              src={item.src}
              alt={item.title}
              style={{ maxWidth: '96%', maxHeight: '96%', objectFit: 'contain' }}
              animate={{ scale: hovered === i ? 1.04 : 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }}>
            <h4 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
              {item.title}
            </h4>
            <p style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Home = () => {
  return (
    <div style={{ background: 'var(--bg-white)', overflowX: 'hidden' }}>
      <Navbar transparent={true} />

      <section className="hero" style={{ minHeight: '100vh', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
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
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(59,130,246,0.16)',
                  border: '1px solid rgba(96,165,250,0.45)',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  color: '#bfdbfe',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '1.15rem',
                }}
              >
                <Stethoscope size={14} />
                Dr. Salunkhe's Digital Clinic Platform
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{
                  color: 'white',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(2.25rem, 4.6vw, 4rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  marginBottom: '1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Practice Homeopathy,{' '}
                <span style={{ background: 'linear-gradient(135deg, #60a5fa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Centred Around
                </span>{' '}
                Every Patient
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: 'rgba(255,255,255,0.86)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '1.8rem', maxWidth: 560 }}
              >
                Register, track patients, and generate polished PDF prescriptions from one focused digital workspace built around Dr. Salunkhe's method.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2rem' }}
              >
                <Link to="/auth?mode=register" className="btn btn-primary btn-lg" style={{ boxShadow: '0 10px 26px rgba(29,78,216,0.35)' }}>
                  Register as Doctor <ArrowRight size={18} />
                </Link>
                <Link
                  to="/about"
                  className="btn btn-lg"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.28)',
                    backdropFilter: 'blur(8px)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Play size={16} fill="white" /> Watch Our Story
                </Link>
              </motion.div>

            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-end' }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  position: 'relative',
                  aspectRatio: '4/3',
                }}
              >
                <img src={heroFloatImg} alt="Clinic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 62%)' }} />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 14,
                    right: 14,
                    background: 'rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={16} color="white" fill="white" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>Dr. Salunkhe's Digital Clinic Platform</div>
                    <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.73rem' }}>Khatav, Satara - Est. 30+ yrs</div>
                  </div>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: 360 }}>
                {[
                  { icon: Shield, title: 'Years', val: '30+', color: '#2563eb' },
                  { icon: Users, title: 'Patients', val: '5K+', color: '#0ea5e9' },
                  { icon: Award, title: 'Remedies', val: '300+', color: '#3b82f6' },
                  { icon: FileText, title: 'PDF Ready', val: 'One Click', color: '#1d4ed8' },
                ].map(({ icon: Icon, title, val, color }) => (
                  <motion.div
                    key={title}
                    whileHover={{ y: -4 }}
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '14px',
                      padding: '12px 14px',
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

      <section style={{ background: 'linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)', padding: '5rem 0' }}>
        <div style={{ padding: '0 var(--space-xl)', marginBottom: '3.5rem' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center">
            <motion.div variants={itemVariants} className="section-label" style={{ color: '#2563eb', borderColor: 'rgba(37,99,235,0.18)', background: 'rgba(59,130,246,0.08)' }}>
              Power Clinic
            </motion.div>
            <motion.h2 variants={itemVariants} style={{ marginTop: '0.75rem', color: '#0f172a' }}>
              A glimpse into the digital clinic experience
            </motion.h2>
            <motion.p variants={itemVariants} style={{ maxWidth: 540, margin: '0.75rem auto 0', fontSize: '0.95rem', color: '#64748b' }}>
              Explore the consultation areas, remedy labs, and the structured healing environment behind the platform.
            </motion.p>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <SquareClinicGallery />
        </motion.div>
      </section>

      <section className="section" style={{ background: 'white' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center" style={{ marginBottom: '3rem' }}>
            <motion.div variants={itemVariants} className="section-label" style={{ color: '#2563eb', borderColor: 'rgba(37,99,235,0.18)', background: 'rgba(59,130,246,0.08)' }}>
              Natural Healing
            </motion.div>
            <motion.h2 variants={itemVariants} style={{ color: '#0f172a' }}>
              Homoeopathy takes care of <span className="text-primary">everything</span>
            </motion.h2>
            <motion.p variants={itemVariants} style={{ maxWidth: 600, margin: '1rem auto 0', color: '#64748b' }}>
              From acute allergies to chronic migraines - holistic healing that addresses the root cause.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}
          >
            {conditions.map((c) => (
              <motion.div
                key={c}
                variants={itemVariants}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#2563eb',
                  borderRadius: '999px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  border: '1px solid rgba(37,99,235,0.14)',
                  cursor: 'default',
                }}
                whileHover={{ scale: 1.05, background: 'linear-gradient(135deg, #1d4ed8, #38bdf8)', color: 'white' }}
              >
                {c}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '6rem 0',
          backgroundImage: `url(${philosophyBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '2.5rem',
                borderRadius: '28px',
                border: '1px solid rgba(147,197,253,0.45)',
                boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
                color: '#0f172a',
              }}
            >
              <div className="section-label" style={{ color: '#2563eb', borderColor: 'rgba(37,99,235,0.18)', background: 'rgba(59,130,246,0.08)' }}>
                Philosophy
              </div>
              <h2 style={{ color: '#0f172a', marginTop: '0.75rem', marginBottom: '1rem' }}>
                Gentle. Individualised. <span style={{ color: '#2563eb' }}>Effective.</span>
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: '2rem' }}>
                Homeopathy does not just treat symptoms - it treats the whole person.
                Every patient gets a unique remedy based on physical, mental, and emotional profile.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {[
                  { icon: Shield, label: 'Safe', desc: 'Gentle, no side effects' },
                  { icon: Users, label: 'Holistic', desc: 'Treats mind, body & soul' },
                  { icon: Award, label: 'Scientific', desc: 'Evidence-based case taking' },
                  { icon: Star, label: 'Personal', desc: 'Individualised treatment' },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #dbeafe, #eff6ff)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(96,165,250,0.22)' }}>
                      <Icon size={18} color="#2563eb" />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2, fontSize: '0.9rem' }}>{label}</p>
                      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '28px',
                  padding: '2.5rem',
                  border: '1px solid rgba(147,197,253,0.45)',
                  boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
                }}
              >
                <Stethoscope size={42} color="#2563eb" style={{ marginBottom: '1.25rem' }} />
                <h3 style={{ color: '#0f172a', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
                  Built on Dr. Salunkhe&apos;s Method
                </h3>
                <p style={{ color: '#475569', lineHeight: 1.8 }}>
                  Author of <em style={{ color: '#2563eb' }}>"Practice Homoeopathy like Allopathy"</em> - a proven systematic approach to case-taking, repertorisation, and individualized medicine selection.
                </p>
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {['Structured', 'Digital', 'Humane'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
                        border: '1px solid rgba(37,99,235,0.16)',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        color: '#2563eb',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="text-center" style={{ marginBottom: '3rem' }}>
            <motion.div variants={itemVariants} className="section-label">Platform Features</motion.div>
            <motion.h2 variants={itemVariants} style={{ color: '#0f172a' }}>
              Everything your clinic needs, <span className="text-primary">in one place</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="features-grid">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={itemVariants} className="feature-card">
                <div className="feature-icon">
                  <Icon size={24} />
                </div>
                <h4 className="feature-title">{title}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '6rem 0',
          backgroundImage: `url(${ctaBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.36) 0%, rgba(15,23,42,0.58) 100%)', zIndex: 0 }} />
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
            <p style={{ color: 'rgba(255,255,255,0.86)', maxWidth: 560, margin: '0 auto 2rem', fontSize: '1.02rem', lineHeight: 1.75 }}>
              Join hundreds of homeopathic doctors already using Dr. Salunkhe&apos;s Digital Clinic Platform. Register now - no credit card required.
            </p>
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
