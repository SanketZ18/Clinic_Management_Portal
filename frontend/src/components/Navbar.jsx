import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Stethoscope, Menu, X } from 'lucide-react';
import logo from '../assets/images/logo.jpeg';

const Navbar = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(!transparent);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!transparent) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  // When transparent and not scrolled — white text on dark bg
  // When scrolled (or not transparent) — dark text on white bg
  const isLight = transparent && !scrolled;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="navbar-logo" style={{ color: isLight ? 'white' : 'var(--dark)' }}>
        <div className="logo-icon">
          <img
            src={logo}
            alt="Clinic Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        </div>
        <span style={{ whiteSpace: 'nowrap', fontSize: '0.88rem', lineHeight: 1, letterSpacing: '-0.01em' }}>
          Dr. Salunkhe's Digital Clinic Platform
        </span>
      </Link>

      <div className="navbar-links">
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`navbar-link ${isActive(path) ? 'active' : ''}`}
            style={{ color: isLight ? 'rgba(255,255,255,0.9)' : undefined }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="navbar-actions">
        <Link
          to="/auth?mode=login"
          className="btn btn-outline btn-sm"
          style={
            isLight
              ? { color: 'white', borderColor: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }
              : { color: '#0f172a', borderColor: '#0f172a', background: 'rgba(255,255,255,0.96)' }
          }
        >
          Doctor Login
        </Link>
        <Link
          to="/auth?mode=register"
          className="btn btn-primary btn-sm"
          style={{ background: '#0f172a', color: 'white' }}
        >
          Register Now
        </Link>
      </div>

      <button
        className="btn-icon"
        style={{ display: 'none' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </nav>
  );
};

export default Navbar;
