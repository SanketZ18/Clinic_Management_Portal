import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Book, Sparkles, Filter, Award, ChevronRight } from 'lucide-react';

const articles = [
  {
    id: 1,
    tag: 'Case Taking',
    title: 'Individualization: The Core of Homeopathic Practice',
    excerpt: "Understanding the difference between common disease symptoms and individualizing patient characteristics is the foundation of selecting the correct simillimum.",
    author: "Dr. Akaram Salunkhe",
    readTime: "5 mins read",
    content: "In classical homeopathy, we do not prescribe for the disease name; we prescribe for the patient who is sick. This article details the methodology to filter out common diagnostic symptoms (like joint pain, swelling) and focus on specific modalities (worse from cold draft, better from hard pressure) and mental attributes."
  },
  {
    id: 2,
    tag: 'Miasmatic Analysis',
    title: 'De-mystifying the Psora Miasm in Chronic Illnesses',
    excerpt: "Psora represents the primary underlying susceptibility to disease. Learn how to identify psoric expressions in physical generals and skin manifestations.",
    author: "Dr. Akaram Salunkhe",
    readTime: "8 mins read",
    content: "Psora manifests as hypersensitivity, irritation, functional disturbances, and dry skin eruptions. By classifying symptoms under the correct miasmatic umbrella, you can select remedies that provide root-cause healing instead of palliative relief."
  },
  {
    id: 3,
    tag: 'Remedy Profile',
    title: 'Lycopodium Clavatum: Keynotes and Mind Attributes',
    excerpt: "Deep dive into Lycopodium - from its right-sided physical modalities to its characteristic lack of self-confidence masked by an authoritarian ego.",
    author: "Anubhuti Research Desk",
    readTime: "6 mins read",
    content: "Lycopodium patients present a fascinating dichotomy: they fear new responsibilities, display anticipatory anxiety, yet perform excellently and behave authoritatively. Physically, they exhibit gas, bloating, and aggravation from 4 PM to 8 PM."
  },
  {
    id: 4,
    tag: 'Clinical Method',
    title: 'Structuring Case Logs: Moving from Paper to Digital',
    excerpt: "How structured electronic logs improve homeopathic audits, enable day-to-day symptom correlation, and assist in long-term case reviews.",
    author: "Anubhuti Research Desk",
    readTime: "4 mins read",
    content: "Electronic records allow you to search historical remedies, check follow-up intervals, and audit prescription success rates. Emphasizing structure protects patient safety and aligns homeopathy with modern health standards."
  }
];

const Research = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  const tags = ['All', 'Case Taking', 'Miasmatic Analysis', 'Remedy Profile', 'Clinical Method'];

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || art.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Intro section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Curated clinical insights, notes on miasms, and keynote remedy profiles by Dr. Akaram Salunkhe.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tags.map(t => (
            <button 
              key={t} 
              onClick={() => setSelectedTag(t)}
              className={`btn btn-sm ${selectedTag === t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 14px', width: '100%', maxWidth: '280px' }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search research feed..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="research-grid">
        {filteredArticles.map(art => (
          <div key={art.id} className="research-card">
            <div className="research-card-img" style={{ position: 'relative' }}>
              <BookOpen size={48} color="rgba(255,255,255,0.4)" />
              <div style={{ position: 'absolute', bottom: 12, left: 12 }}>
                <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{art.readTime}</span>
              </div>
            </div>
            <div className="research-card-body">
              <span className="research-card-tag">{art.tag}</span>
              <h3 className="research-card-title">{art.title}</h3>
              <p className="research-card-excerpt" style={{ fontSize: '0.85rem', marginBottom: 15 }}>
                {art.excerpt}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  By {art.author}
                </span>
                <button 
                  onClick={() => setActiveArticle(art)}
                  className="btn btn-ghost btn-sm" 
                  style={{ padding: '4px 10px', fontSize: '0.78rem', gap: 2 }}
                >
                  Read Article <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {activeArticle && (
          <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
            <motion.div 
              className="modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 15 }}>
                <span className="badge badge-green">{activeArticle.tag}</span>
                <button onClick={() => setActiveArticle(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 10px' }}>
                  Close
                </button>
              </div>

              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dark)', marginBottom: 8 }}>
                {activeArticle.title}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 15 }}>
                Authored by <strong>{activeArticle.author}</strong> | {activeArticle.readTime}
              </p>

              <div style={{ fontSize: '0.95rem', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {activeArticle.content}
                <br /><br />
                <em>Disclaimer: The research articles provided on this platform are for training and clinical assistance purposes only. Always apply classical homeopathic principles and repertorial judgment for final remedy selection.</em>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Research;
