import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Stethoscope,
  ClipboardList,
  FileText,
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Globe,
  Bot,
  Copy,
  CalendarDays,
  Users,
  Activity,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const quickActions = [
  {
    to: '/doctor/new-patient',
    icon: Stethoscope,
    title: 'New Patient',
    desc: 'Start a fresh prescription',
  },
  {
    to: '/doctor/logs',
    icon: ClipboardList,
    title: 'Patient Log',
    desc: "Track today's patients",
  },
  {
    to: '/doctor/research',
    icon: FileText,
    title: 'Research Feed',
    desc: 'Read clinical notes',
  },
];

const searchTips = [
  'miasm differential diagnosis',
  'homeopathic repertory for fever',
  'Lycopodium keynote symptoms',
  'acute cough remedy selection',
];

const workflowSteps = [
  {
    icon: Stethoscope,
    title: 'Consult',
    desc: 'Capture symptoms, modalities, and generals in one place.',
  },
  {
    icon: ClipboardList,
    title: 'Register',
    desc: "Keep today's visit log structured and easy to review.",
  },
  {
    icon: FileText,
    title: 'Print',
    desc: 'Generate a clean prescription preview and PDF output.',
  },
  {
    icon: BookOpen,
    title: 'Research',
    desc: 'Check the reference feed without leaving the dashboard.',
  },
];

const searchEngineLinks = {
  google: (query) => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  chatgpt: (query) => `https://chatgpt.com/?q=${encodeURIComponent(query)}`,
};

const DashboardHome = () => {
  const { doctor } = useAuth();
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('google');
  const isSuperAdmin = String(doctor?.role || 'Doctor')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .includes('super admin');

  const initials = doctor?.fullName
    ?.split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('') || 'DR';

  const todayLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const openSearch = (selectedEngine = engine) => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Type a search query first');
      return;
    }

    const url = searchEngineLinks[selectedEngine](trimmed);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyQuery = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error('Type a search query first');
      return;
    }

    try {
      await navigator.clipboard.writeText(trimmed);
      toast.success('Query copied to clipboard');
    } catch {
      toast.error('Clipboard access was blocked');
    }
  };

  const fillTip = (tip) => {
    setQuery(tip);
    toast.success('Search text inserted');
  };

const stats = [
    {
      icon: Users,
      label: "Today's focus",
      value: doctor?.clinicName || 'Clinic dashboard',
    },
    {
      icon: CalendarDays,
      label: 'Working date',
      value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      icon: Activity,
      label: 'Workflow',
      value: 'Scribe -> Register -> Report',
    },
    {
      icon: ShieldCheck,
      label: 'Plan',
      value: doctor?.subscriptionPlan || 'FREE',
    },
  ];

  return (
    <div className="dashboard-page dashboard-home">
      <motion.section
        className="dashboard-home-hero card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-home-hero-copy">
          <div className="dashboard-home-badge">
            <LayoutDashboard size={14} />
            {isSuperAdmin ? 'Super admin workspace' : 'Doctor workspace'}
          </div>
          <h2 className="dashboard-home-title">
            Welcome back, {doctor?.fullName || 'Doctor'}
          </h2>
          <p className="dashboard-home-subtitle">
            A balanced clinic dashboard for inquiry, register, reporting, and research. The layout is tuned to use the screen more efficiently, so the important work stays visible without feeling cramped.
          </p>

          <div className="dashboard-home-actions">
            {quickActions.map(({ to, icon: Icon, title }) => (
              <Link key={to} to={to} className="btn btn-primary btn-sm dashboard-home-action">
                <Icon size={14} />
                {title}
              </Link>
            ))}
            <Link to="/doctor/research" className="btn btn-ghost btn-sm dashboard-home-action">
              <Sparkles size={14} />
              Research
            </Link>
          </div>

          <div className="dashboard-home-identity">
            <div className="dashboard-home-avatar">{initials}</div>
            <div>
              <div className="dashboard-home-identity-name">{doctor?.clinicName || 'Clinic identity'}</div>
              <div className="dashboard-home-identity-meta">{todayLabel}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-home-hero-aside">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="dashboard-home-stat">
              <div className="dashboard-home-stat-icon">
                <Icon size={16} />
              </div>
              <div>
                <div className="dashboard-home-stat-label">{label}</div>
                <div className="dashboard-home-stat-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="dashboard-home-grid">
        <motion.section
          className="card dashboard-panel dashboard-search-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-kicker">Search desk</p>
              <h3 className="dashboard-panel-title">Google and ChatGPT from the dashboard</h3>
            </div>
            <div className="dashboard-panel-chip">
              <Globe size={14} />
              Browser search
            </div>
          </div>

          <div className="dashboard-search-switch">
            <button
              type="button"
              className={`dashboard-search-switch-btn ${engine === 'google' ? 'active' : ''}`}
              onClick={() => setEngine('google')}
            >
              <Globe size={14} />
              Google
            </button>
            <button
              type="button"
              className={`dashboard-search-switch-btn ${engine === 'chatgpt' ? 'active' : ''}`}
              onClick={() => setEngine('chatgpt')}
            >
              <Bot size={14} />
              ChatGPT
            </button>
          </div>

          <div className="dashboard-search-box">
            <Search size={16} color="var(--text-light)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  openSearch();
                }
              }}
              placeholder="Search a symptom, remedy, guideline, or clinical note..."
            />
            <button type="button" className="dashboard-search-submit" onClick={() => openSearch()}>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="dashboard-search-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openSearch('google')}>
              <Globe size={14} />
              Open Google
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openSearch('chatgpt')}>
              <Bot size={14} />
              Open ChatGPT
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyQuery}>
              <Copy size={14} />
              Copy text
            </button>
          </div>

          <div className="dashboard-search-tips">
            {searchTips.map((tip) => (
              <button key={tip} type="button" className="dashboard-search-tip" onClick={() => fillTip(tip)}>
                {tip}
              </button>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="card dashboard-panel dashboard-workflow-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-kicker">Workflow</p>
              <h3 className="dashboard-panel-title">Keep the next action obvious</h3>
            </div>
            <div className="dashboard-panel-chip">
              <Sparkles size={14} />
              Focused flow
            </div>
          </div>

          <div className="dashboard-workflow-list">
            {workflowSteps.map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="dashboard-workflow-item">
                <div className="dashboard-workflow-index">{String(index + 1).padStart(2, '0')}</div>
                <div className="dashboard-workflow-icon">
                  <Icon size={16} />
                </div>
                <div className="dashboard-workflow-copy">
                  <div className="dashboard-workflow-title">{title}</div>
                  <div className="dashboard-workflow-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="card dashboard-panel dashboard-quick-links"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="dashboard-panel-header">
            <div>
              <p className="dashboard-panel-kicker">Quick access</p>
              <h3 className="dashboard-panel-title">Jump to the main screens</h3>
            </div>
          </div>

          <div className="dashboard-quick-grid">
            {quickActions.map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to} className="dashboard-quick-link">
                <div className="dashboard-quick-link-icon">
                  <Icon size={16} />
                </div>
                <div className="dashboard-quick-link-copy">
                  <div className="dashboard-quick-link-title">{title}</div>
                  <div className="dashboard-quick-link-desc">{desc}</div>
                </div>
                <ChevronRight size={14} className="dashboard-quick-link-arrow" />
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default DashboardHome;
