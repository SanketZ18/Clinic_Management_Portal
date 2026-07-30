import { motion } from 'framer-motion';
import { Shield, BookOpen, Award, Heart, CheckCircle2, Stethoscope, Quote, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const About = () => {
  return (
    <div style={{ background: 'var(--bg-white)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar transparent={true} />

      <main style={{ flex: 1 }}>

        {/* ── UNIQUE ABOUT HERO — Split diagonal with floating cards ── */}
        <section style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '72px',
          background: '#09111f',
        }}>
          {/* Deep navy left panel */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #0a1628 0%, #0d2240 50%, #0f2a4a 100%)',
          }} />

          {/* Diagonal right accent */}
          <div style={{
            position: 'absolute',
            right: 0, top: 0, bottom: 0,
            width: '45%',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(59,130,246,0.06) 100%)',
            clipPath: 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }} />

          {/* Glowing orbs */}
          <div style={{
            position: 'absolute', top: -60, left: '30%',
            width: 260, height: 260, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, right: '15%',
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Subtle grid lines */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.04,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }} />

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3rem', alignItems: 'center' }}>

              {/* Left: Text */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(59,130,246,0.16)',
                    border: '1px solid rgba(96,165,250,0.38)',
                    borderRadius: '100px',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    color: '#bfdbfe',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Sparkles size={13} />
                  Our Story & Mission
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    color: 'white',
                    fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: '1.2rem',
                  }}
                >
                  Digitising the art of{' '}
                  <span style={{
                    background: 'linear-gradient(135deg, #60a5fa, #38bdf8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>Homeopathic</span>{' '}
                  healing
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    color: 'rgba(255,255,255,0.65)',
                    maxWidth: 520,
                    fontSize: '1.05rem',
                    lineHeight: 1.75,
                  }}
                >
                  Empowering homeopathic practitioners with modern tools to practice with
                  structure, precision, and ease — inspired by Dr. Salunkhe's decades of clinical wisdom.
                </motion.p>
              </div>

              {/* Right: Floating stat cards */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {[
                  { num: '30+', label: 'Years', icon: Award },
                  { num: '5K+', label: 'Patients', icon: Heart },
                  { num: '300+', label: 'Remedies', icon: BookOpen },
                ].map(({ num, label, icon: Icon }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.04, x: 4 }}
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      padding: '14px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'default',
                      minWidth: '240px',
                    }}
                  >
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: '10px',
                      background: 'rgba(59,130,246,0.24)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={18} color="#bfdbfe" />
                    </div>
                    <div>
                      <div style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>{num}</div>
                      <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>{label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="section-label">Our Inspiration</div>
                <h2 style={{ marginBottom: '1.5rem' }}>Dr. Akaram Bapurao Salunkhe's Legacy</h2>
                <p style={{ marginBottom: '1rem' }}>
                  Dr. Salunkhe of <strong>Anubhuti Clinic</strong> is a renowned name in classical homeopathy. Over decades of clinical experience, he developed a unique, structured case-taking process that brings the scientific rigor of modern medicine (Allopathy) to the personalized philosophy of Homeopathy.
                </p>
                <p style={{ marginBottom: '1.5rem' }}>
                  His book, <em>"Practice Homoeopathy like Allopathy"</em>, outlines a logical, step-by-step methodology to analyze patient symptoms, evaluate physical/mental generals, identify dominant miasms, and select accurate remedies with correct potencies.
                </p>

                {/* Pull quote */}
                <div style={{
                  background: 'var(--primary-pale)',
                  borderLeft: '4px solid var(--primary)',
                  borderRadius: '0 12px 12px 0',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  marginTop: '1.5rem',
                }}>
                  <Quote size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: 'var(--primary)', fontStyle: 'italic', fontWeight: 600, margin: 0, lineHeight: 1.6 }}>
                    "Treat the patient, not the disease. Individualization is the soul of homeopathy."
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '1.5rem' }}>
                  <div style={{ textAlign: 'center', padding: '10px 15px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>30+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Years</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 15px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>5K+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patients</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px 15px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>300+</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Remedies</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ background: 'var(--bg)', borderRadius: '24px', padding: '2.5rem', border: '1px solid var(--border)' }}
              >
                <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>The Digital Scribe Platform</h3>
                <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  This platform digitizes Dr. Salunkhe's case-taking method so that doctors can:
                </p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    'Systematically capture chief complaints and history.',
                    'Analyze Physical & Mental generals easily.',
                    'Map characteristic symptoms and identify correct Miasms.',
                    'Use digital signature integration directly on letterheads.',
                    'Generate high-quality PDF prescriptions instantaneously.',
                    'Log sessions and download day-wise registers easily.'
                  ].map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Philosophy / Mission */}
        <section className="section" style={{ background: 'var(--bg)' }}>
          <div className="container">
            <div className="text-center" style={{ marginBottom: '3rem' }}>
              <div className="section-label">Core Values</div>
              <h2>Built for Clinics of All Specialties</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              {[
                { icon: Shield, title: 'Scalable Security', desc: 'Secure backend configuration utilizing state-of-the-art authentication filters.' },
                { icon: BookOpen, title: 'Educational Value', desc: 'Provides active research materials, case studies, and clinical wisdom for young practitioners.' },
                { icon: Award, title: 'Digital Excellence', desc: 'Allows simple transition from handwritten logs to digital dashboards in seconds.' },
                { icon: Heart, title: 'Patient-First Focus', desc: 'Enables quick prescription creation so you spend more time interacting with patients.' }
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="card"
                  style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--primary-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                    <Icon size={24} />
                  </div>
                  <h4 style={{ marginBottom: '8px' }}>{title}</h4>
                  <p style={{ fontSize: '0.85rem' }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
