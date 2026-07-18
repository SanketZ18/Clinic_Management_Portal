import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Globe, Clock, Headphones } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div style={{ background: 'var(--bg-white)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar transparent={true} />

      <main style={{ flex: 1 }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#09111f',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'center',
            paddingTop: '72px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.07,
              backgroundImage: 'radial-gradient(circle, #60a5fa 1.5px, transparent 1.5px)',
              backgroundSize: '32px 32px',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              transform: 'translateY(-50%)',
              width: 350,
              height: 350,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: '30%',
              right: '10%',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 65%)',
              pointerEvents: 'none',
            }}
          />

          <div className="container" style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <div>
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(59,130,246,0.16)',
                    border: '1px solid rgba(96,165,250,0.38)',
                    borderRadius: '100px',
                    padding: '6px 16px',
                    fontSize: '0.78rem',
                    color: '#bfdbfe',
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Headphones size={13} />
                  We're here to help
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
                    lineHeight: 1.15,
                    marginBottom: '1.2rem',
                  }}
                >
                  Let's start a{' '}
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #60a5fa, #38bdf8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    conversation
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '1.05rem',
                    lineHeight: 1.75,
                    maxWidth: 440,
                  }}
                >
                  Have queries or feedback? Reach out to Dr. Salunkhe's team at Anubhuti Clinic and we will help you with the right contact details.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
              >
                {[
                  { icon: Phone, label: 'Call Us', value: '+91 99601 22746', color: 'rgba(59,130,246,0.16)', border: 'rgba(96,165,250,0.38)' },
                  { icon: Mail, label: 'Email', value: 'akaramsalunkhe@gmail.com', color: 'rgba(37,99,235,0.16)', border: 'rgba(96,165,250,0.38)' },
                  { icon: Clock, label: 'Response Time', value: 'Within 24 hrs', color: 'rgba(59,130,246,0.16)', border: 'rgba(96,165,250,0.38)' },
                  { icon: Globe, label: 'Website', value: 'https://drakaram.drxpro.in/', color: 'rgba(37,99,235,0.16)', border: 'rgba(96,165,250,0.38)' },
                ].map(({ icon: Icon, label, value, color, border }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.04, y: -3 }}
                    style={{
                      background: color,
                      border: `1px solid ${border}`,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Icon size={15} color="#bfdbfe" />
                      <span
                        style={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.3 }}>{value}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <div style={{ width: '100%', maxWidth: 820 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div className="section-label" style={{ margin: '0 auto' }}>
                    Clinic Coordinates
                  </div>
                  <h2 style={{ marginTop: '0.9rem' }}>Reach Dr. Salunkhe's Clinic</h2>
                  <p style={{ marginTop: '10px', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
                    Connect with us for homeopathic training, consultations, or queries regarding this platform.
                  </p>
                </div>

                <div className="card" style={{ display: 'grid', gap: '1.25rem', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: 'var(--primary-pale)', borderRadius: 10, color: 'var(--primary)' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Anubhuti Clinic Location</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
                        Katarkhatav Taluka, Khatav, Dist. Satara, PIN 415507, Maharashtra, India
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: 'var(--primary-pale)', borderRadius: 10, color: 'var(--primary)' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Call Us</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
                        <a href="tel:+919960122746" className="text-primary" style={{ fontWeight: 600 }}>
                          +91 99601 22746
                        </a>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: 'var(--primary-pale)', borderRadius: 10, color: 'var(--primary)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Support Email</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
                        <a href="mailto:akaramsalunkhe@gmail.com" className="text-primary" style={{ fontWeight: 600 }}>
                          akaramsalunkhe@gmail.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: 10, background: 'var(--primary-pale)', borderRadius: 10, color: 'var(--primary)' }}>
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem' }}>Website</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: 2 }}>
                        <a
                          href="https://drakaram.drxpro.in/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary"
                          style={{ fontWeight: 600 }}
                        >
                          https://drakaram.drxpro.in/
                        </a>
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Our team usually responds to emails within 24 business hours.
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
