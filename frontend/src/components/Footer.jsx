import { Link } from 'react-router-dom';
import { MapPin, Phone, Globe, Mail, Heart } from 'lucide-react';
import logo from '../assets/images/logo.jpeg';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
              <span style={{ maxWidth: 240, lineHeight: 1.1, display: 'inline-block' }}>
                Dr. Salunkhe's Digital Clinic Platform
              </span>
            </div>
            <p className="footer-desc">
              Practice Homeopathy like Allopathy — structured, digital, humane.
              Built around Dr. Akaram Salunkhe's proven case-taking method.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>

              <span className="badge badge-gold">Secure & Private</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="footer-col-title">Quick Links</p>
            <div className="footer-links">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Platform' },
                { to: '/contact', label: 'Contact' },
                { to: '/auth?mode=register', label: 'Doctor Registration' },
                { to: '/auth?mode=login', label: 'Doctor Login' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="footer-link">{label}</Link>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="footer-col-title">Features</p>
            <div className="footer-links">
              {[
                'Digital Prescriptions',
                'Daily Patient Register',
                'One-click Day Report',
                'Research Feed',
                'Clinic Profile',
                'PDF Download',
              ].map((f) => (
                <span key={f} className="footer-link" style={{ cursor: 'default' }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="footer-col-title">Contact Clinic</p>
            <div className="footer-contact-item">
              <MapPin size={16} />
              <span>Katarkhatav Taluka, Khatav, Dist. Satara, PIN 415507, Maharashtra, India</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} />
              <a href="tel:+919960122746" className="footer-link">+91 99601 22746</a>
            </div>
            <div className="footer-contact-item">
              <Globe size={16} />
              <a href="https://drakaram.drxpro.in/" target="_blank" rel="noopener noreferrer" className="footer-link">
                www.drakaram.drxpro.in
              </a>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} />
              <a href="mailto:akaramsalunkhe@gmail.com" className="footer-link">akaramsalunkhe@gmail.com</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Dr. Salunkhe's Digital Clinic Platform. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Built with <Heart size={14} color="var(--secondary)" fill="var(--secondary)" /> for Homeopathic Doctors | System Developed By Sanket Zagade.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
