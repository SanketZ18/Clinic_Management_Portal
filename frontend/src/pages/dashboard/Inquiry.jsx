import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Calendar, Heart, Shield, Plus, Trash2, Printer, 
  PlusCircle, BookOpen, Layers, CheckCircle2, RefreshCw, MessageCircle, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  buildEmailLink,
  buildPrescriptionPdf,
  buildWhatsAppLink,
  savePdf,
  registerTodayPatient,
  trySharePdf,
} from '../../utils/clinicDocuments';

const initialFormState = {
  // Patient Info
  patientName: '',
  age: '',
  gender: 'Male',
  bloodGroup: '',
  visitType: 'New',
  phone: '',
  email: '',
  referredBy: '',
  nextVisitDate: '',
  
  // Case Taking
  chiefComplaint: '',
  presentHistory: '',
  pastHistory: '',
  familyHistory: '',
  
  // Physical Generals
  appetite: '',
  thirst: '',
  thermal: 'Ambithermal', // Hot / Chilly / Ambithermal
  sleep: '',
  stool: '',
  urine: '',
  perspiration: '',
  
  // Mental Generals
  mentalGenerals: '',
  
  // Modalities
  worse: '', // Aggravation
  better: '', // Amelioration
  
  // Characteristics & Miasm
  characteristics: '',
  miasm: 'Psora', // Psora / Sycosis / Syphilis / Mixed
  
  // Repertory Selection
  rubrics: [], // List of selected rubrics/symptoms
  
  // Prescription
  remedies: [
    { remedyName: '', potency: '30C', dose: '4 pills', frequency: 'Three times a day' }
  ],
  
  // Follow Up
  followUpDays: '7',
  doctorNotes: ''
};

const Inquiry = () => {
  const { doctor } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [newRubric, setNewRubric] = useState('');
  const lastRegisteredKeyRef = useRef('');
  const showPreview = false;

  // Load last draft case from sessionStorage if doctor is in-progress
  useEffect(() => {
    const savedDraft = sessionStorage.getItem('scribeDraftCase');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save draft on change
  const updateForm = (updates) => {
    const updated = { ...formData, ...updates };
    setFormData(updated);
    sessionStorage.setItem('scribeDraftCase', JSON.stringify(updated));
  };

  const handleFieldChange = (e) => {
    updateForm({ [e.target.name]: e.target.value });
  };

  // Remedies dynamic fields
  const handleRemedyChange = (index, field, value) => {
    const updatedRemedies = [...formData.remedies];
    updatedRemedies[index] = { ...updatedRemedies[index], [field]: value };
    updateForm({ remedies: updatedRemedies });
  };

  const addRemedy = () => {
    updateForm({
      remedies: [...formData.remedies, { remedyName: '', potency: '30C', dose: '4 pills', frequency: 'Three times a day' }]
    });
  };

  const removeRemedy = (index) => {
    if (formData.remedies.length === 1) return;
    const updatedRemedies = formData.remedies.filter((_, i) => i !== index);
    updateForm({ remedies: updatedRemedies });
  };

  // Rubrics/Symptoms tagging
  const addRubric = () => {
    if (!newRubric.trim()) return;
    if (formData.rubrics.includes(newRubric.trim())) {
      toast.error('Rubric already added');
      return;
    }
    updateForm({ rubrics: [...formData.rubrics, newRubric.trim()] });
    setNewRubric('');
  };

  const removeRubric = (rubric) => {
    updateForm({ rubrics: formData.rubrics.filter(r => r !== rubric) });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    sessionStorage.removeItem('scribeDraftCase');
    lastRegisteredKeyRef.current = '';
    toast.success('Form cleared!');
  };

  const buildPrescriptionArtifacts = (issuedAt = new Date()) => buildPrescriptionPdf({ doctor, formData, issuedAt });

  const registerPrescriptionInDayReport = (issuedAt) => {
    const prescriptionKey = [
      formData.patientName,
      formData.age,
      formData.gender,
      formData.bloodGroup,
      formData.phone,
      formData.visitType,
      formData.chiefComplaint,
      formData.diagnosis,
      formData.remedies
        .map((item) => [item.remedyName, item.potency, item.dose, item.frequency].join(':'))
        .join('|'),
      formData.followUpDays,
      formData.nextVisitDate,
    ]
      .map((value) => String(value || '').trim().toLowerCase())
      .join('|');

    if (lastRegisteredKeyRef.current === prescriptionKey) return;

    const record = registerTodayPatient({
      doctor,
      formData,
      issuedAt,
      source: 'prescription',
    });

    if (record) {
      lastRegisteredKeyRef.current = prescriptionKey;
    }
  };

  const downloadPrescriptionPdf = () => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient Name and Age are required to generate the prescription');
      return;
    }
    const issuedAt = new Date();
    const { doc, filename } = buildPrescriptionArtifacts(issuedAt);
    savePdf(doc, filename);
    registerPrescriptionInDayReport(issuedAt);
    toast.success('Prescription PDF downloaded');
  };

  const sharePrescription = async (channel) => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient Name and Age are required to generate the prescription');
      return;
    }

    const issuedAt = new Date();
    const { blob, filename, shareText } = buildPrescriptionArtifacts(issuedAt);
    const shareSubject = `Prescription for ${formData.patientName || 'Patient'}`;
    const shareBody = `${shareText}\n\nPDF downloaded on this device.`;

    try {
      const shared = await trySharePdf({
        blob,
        filename,
        title: shareSubject,
        text: shareText,
      });

      if (shared) {
        registerPrescriptionInDayReport(issuedAt);
        toast.success('Share sheet opened');
        return;
      }
    } catch (error) {
      console.warn('Native share not available:', error);
    }

    if (channel === 'whatsapp') {
      window.open(buildWhatsAppLink({ phone: formData.phone, message: shareBody }), '_blank', 'noopener,noreferrer');
      registerPrescriptionInDayReport(issuedAt);
      toast.success('WhatsApp message prepared');
      return;
    }

    window.open(
      buildEmailLink({
        to: formData.email,
        subject: shareSubject,
        body: shareBody,
      }),
      '_blank',
      'noopener,noreferrer'
    );
    registerPrescriptionInDayReport(issuedAt);
    toast.success('Email draft prepared');
  };

  // Add Patient to Local Daily Register
  const addToRegister = () => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient Name and Age are required to register');
      return;
    }

    registerTodayPatient({
      doctor,
      formData,
      issuedAt: new Date(),
      source: 'manual',
    });
    toast.success('Added to Daily Patient Register successfully!');
  };

  return (
    <div className="inquiry-container dashboard-page" style={{ maxWidth: 'none' }}>
      <div className="card" style={{ padding: '20px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="dashboard-panel-kicker">Patient inquiry</div>
          <h3 style={{ margin: '6px 0 4px', fontFamily: 'var(--font-heading)' }}>Scribe, assess, and prescribe in one flow</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 640 }}>
            Fill case details, select homeopathic rubrics, and generate a structured prescription without switching away from the page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={resetForm} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Clear Form
          </button>
          <button onClick={downloadPrescriptionPdf} className="btn btn-primary btn-sm">
            <Printer size={14} /> Download PDF
          </button>
          <button onClick={() => sharePrescription('whatsapp')} className="btn btn-accent btn-sm">
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button onClick={() => sharePrescription('email')} className="btn btn-ghost btn-sm">
            <Send size={14} /> Email
          </button>
          <button onClick={addToRegister} className="btn btn-accent btn-sm">
            <Plus size={14} /> Add to Register
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Section 1: Patient Details */}
        <section className="inquiry-section">
          <h3 className="inquiry-section-title">
            <span className="section-num">1</span> Patient Information
          </h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="patientName" 
                value={formData.patientName} 
                onChange={handleFieldChange}
                placeholder="Rahul Sharma" 
                className="form-input" 
                required 
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleFieldChange}
                  placeholder="32" 
                  className="form-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleFieldChange}
                  className="form-input form-select"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleFieldChange}
                className="form-input form-select"
              >
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleFieldChange}
                placeholder="9876543210" 
                className="form-input" 
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Visit Type</label>
                <select name="visitType" value={formData.visitType} onChange={handleFieldChange} className="form-input form-select">
                  <option>New</option>
                  <option>Follow-up</option>
                  <option>Regular</option>
                  <option>Emergency</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Next Visit Date</label>
                <input
                  type="date"
                  name="nextVisitDate"
                  value={formData.nextVisitDate}
                  onChange={handleFieldChange}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleFieldChange}
                placeholder="patient@example.com" 
                className="form-input" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Referred By</label>
              <input 
                type="text" 
                name="referredBy" 
                value={formData.referredBy} 
                onChange={handleFieldChange}
                placeholder="Dr. ..." 
                className="form-input" 
              />
            </div>
          </div>
        </section>

        {/* Section 2: Chief Complaint & History */}
        <section className="inquiry-section">
          <h3 className="inquiry-section-title">
            <span className="section-num">2</span> Case History & Complaints
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Chief Complaint / Symptoms *</label>
              <textarea 
                name="chiefComplaint" 
                value={formData.chiefComplaint} 
                onChange={handleFieldChange}
                placeholder="Describe current complaints in details, sensation, onset..." 
                className="form-input form-textarea"
              ></textarea>
            </div>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">History of Present Illness</label>
                <textarea 
                  name="presentHistory" 
                  value={formData.presentHistory} 
                  onChange={handleFieldChange}
                  placeholder="Since when, progression..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Past Medical History</label>
                <textarea 
                  name="pastHistory" 
                  value={formData.pastHistory} 
                  onChange={handleFieldChange}
                  placeholder="Past illnesses, operations, treatments..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Family Medical History</label>
                <textarea 
                  name="familyHistory" 
                  value={formData.familyHistory} 
                  onChange={handleFieldChange}
                  placeholder="Diabetes, blood pressure, tuberculosis..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Physical & Mental Generals */}
        <section className="inquiry-section">
          <h3 className="inquiry-section-title">
            <span className="section-num">3</span> Homeopathic Generals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Physical Generals */}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark)', marginBottom: 12 }}>
                Physical Generals
              </p>
              <div className="form-grid-3" style={{ marginBottom: 15 }}>
                <div className="form-group">
                  <label className="form-label">Appetite / Desires / Aversions</label>
                  <input 
                    type="text" 
                    name="appetite" 
                    value={formData.appetite} 
                    onChange={handleFieldChange}
                    placeholder="Desires sweet, aversion milk..." 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thirst</label>
                  <input 
                    type="text" 
                    name="thirst" 
                    value={formData.thirst} 
                    onChange={handleFieldChange}
                    placeholder="Large quantities at long intervals..." 
                    className="form-input" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thermal Reaction</label>
                  <select 
                    name="thermal" 
                    value={formData.thermal} 
                    onChange={handleFieldChange}
                    className="form-input form-select"
                  >
                    <option>Ambithermal</option>
                    <option>Chilly</option>
                    <option>Hot</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Sleep & Dreams</label>
                  <input type="text" name="sleep" value={formData.sleep} onChange={handleFieldChange} placeholder="Disturbed, sleeps on abdomen..." className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stool / Bowels</label>
                  <input type="text" name="stool" value={formData.stool} onChange={handleFieldChange} placeholder="Constipated, hard stool..." className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Urine</label>
                  <input type="text" name="urine" value={formData.urine} onChange={handleFieldChange} placeholder="Burning, frequent at night..." className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Perspiration</label>
                  <input type="text" name="perspiration" value={formData.perspiration} onChange={handleFieldChange} placeholder="Profuse on head, stains yellow..." className="form-input" />
                </div>
              </div>
            </div>

            {/* Mental Generals */}
            <div className="form-group">
              <label className="form-label">Mental Generals (Mind & Disposition)</label>
              <textarea 
                name="mentalGenerals" 
                value={formData.mentalGenerals} 
                onChange={handleFieldChange}
                placeholder="Anger expression, anxiety, fear of dark, console reaction..." 
                className="form-input form-textarea"
              ></textarea>
            </div>
          </div>
        </section>

        {/* Section 4: Modalities, Characteristics & Miasm */}
        <section className="inquiry-section">
          <h3 className="inquiry-section-title">
            <span className="section-num">4</span> Modalities, Characteristics & Miasmatic Analysis
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Aggravation (Worse From)</label>
                <textarea 
                  name="worse" 
                  value={formData.worse} 
                  onChange={handleFieldChange}
                  placeholder="Cold draft, damp weather, night..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Amelioration (Better From)</label>
                <textarea 
                  name="better" 
                  value={formData.better} 
                  onChange={handleFieldChange}
                  placeholder="Warm wraps, open air, hard pressure..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Characteristic Symptoms</label>
                <textarea 
                  name="characteristics" 
                  value={formData.characteristics} 
                  onChange={handleFieldChange}
                  placeholder="Peculiar, rare, striking symptoms..." 
                  className="form-input form-textarea"
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Dominant Miasm</label>
                <select 
                  name="miasm" 
                  value={formData.miasm} 
                  onChange={handleFieldChange}
                  className="form-input form-select"
                  style={{ height: 'fit-content' }}
                >
                  <option>Psora</option>
                  <option>Sycosis</option>
                  <option>Syphilis</option>
                  <option>Tubercular</option>
                  <option>Mixed Miasm</option>
                </select>
              </div>
            </div>

            {/* Repertorization Rubrics tagging */}
            <div className="form-group" style={{ marginTop: 10 }}>
              <label className="form-label">Repertorization (Symptom Rubrics)</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  value={newRubric} 
                  onChange={(e) => setNewRubric(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRubric())}
                  placeholder="Enter rubric (e.g. Mind - Consolation - Ameliorates)" 
                  className="form-input" 
                />
                <button type="button" onClick={addRubric} className="btn btn-primary btn-sm">
                  <Plus size={16} /> Add Rubric
                </button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {formData.rubrics.length === 0 ? (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No rubrics selected yet. Add rubrics above to repertorise.</span>
                ) : (
                  formData.rubrics.map(r => (
                    <span 
                      key={r} 
                      className="badge badge-green" 
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {r}
                      <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => removeRubric(r)} />
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Prescription & Remedy Selection */}
        <section className="inquiry-section" style={{ gridColumn: '1 / -1' }}>
          <h3 className="inquiry-section-title">
            <span className="section-num">5</span> Remedy Selection & Prescription
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {formData.remedies.map((remedy, idx) => (
              <div key={idx} style={{ 
                background: 'var(--bg)', 
                padding: '16px', 
                borderRadius: '12px', 
                border: '1.5px solid var(--border)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                    Remedy #{idx + 1}
                  </span>
                  {formData.remedies.length > 1 && (
                    <button type="button" onClick={() => removeRemedy(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="form-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Remedy Name</label>
                    <input 
                      type="text" 
                      value={remedy.remedyName} 
                      onChange={(e) => handleRemedyChange(idx, 'remedyName', e.target.value)}
                      placeholder="Lycopodium Clavatum" 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Potency</label>
                    <input 
                      type="text" 
                      value={remedy.potency} 
                      onChange={(e) => handleRemedyChange(idx, 'potency', e.target.value)}
                      placeholder="200C" 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dose</label>
                    <input 
                      type="text" 
                      value={remedy.dose} 
                      onChange={(e) => handleRemedyChange(idx, 'dose', e.target.value)}
                      placeholder="4 pills" 
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frequency / Instructions</label>
                    <input 
                      type="text" 
                      value={remedy.frequency} 
                      onChange={(e) => handleRemedyChange(idx, 'frequency', e.target.value)}
                      placeholder="Empty stomach in morning" 
                      className="form-input" 
                    />
                  </div>
                </div>
              </div>
            ))}

            <button type="button" onClick={addRemedy} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
              <PlusCircle size={14} /> Add Another Remedy
            </button>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Follow-up Days</label>
                <select name="followUpDays" value={formData.followUpDays} onChange={handleFieldChange} className="form-input form-select">
                  <option value="3">3 Days</option>
                  <option value="7">7 Days (1 Week)</option>
                  <option value="15">15 Days (2 Weeks)</option>
                  <option value="30">30 Days (1 Month)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Doctor Notes / Reminders</label>
                <input 
                  type="text" 
                  name="doctorNotes" 
                  value={formData.doctorNotes} 
                  onChange={handleFieldChange}
                  placeholder="Check vitals next visit" 
                  className="form-input" 
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── PRINT VIEW PREVIEW MODAL ── */}
      <AnimatePresence>
        {showPreview && (
          <div className="modal-overlay" onClick={() => setShowPreview(false)}>
            <motion.div 
              className="modal" 
              style={{ maxWidth: '850px', padding: '24px' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)' }}>Prescription PDF Letterhead</h3>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handlePrint} className="btn btn-primary btn-sm">
                    <Printer size={14} /> Print / Export PDF
                  </button>
                  <button onClick={() => setShowPreview(false)} className="btn btn-ghost btn-sm">
                    Close
                  </button>
                </div>
              </div>

              {/* PDF Container */}
              <div style={{ border: '1px solid #ddd', background: '#f5f5f5', padding: '20px', borderRadius: '12px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div ref={printRef} className="prescription-preview" style={{ width: '100%', margin: '0 auto', background: '#fff' }}>
                  
                  {/* Doctor/Clinic Header */}
                  <div className="rx-header">
                    <div>
                      <h2 className="rx-clinic-name">{doctor?.clinicName || 'Anubhuti Homoeopathy'}</h2>
                      <p className="rx-doctor-name">{doctor?.fullName || 'Dr. Akaram Salunkhe'}</p>
                      <p className="rx-clinic-details" style={{ fontWeight: 500 }}>
                        {doctor?.qualification || 'BHMS, MD (Hom)'}
                      </p>
                      <p className="rx-clinic-details">Reg. License: {doctor?.licenseNumber || 'MCH/00000'}</p>
                      <p className="rx-clinic-details" style={{ maxWidth: 450, marginTop: 4 }}>
                        📍 {doctor?.clinicAddress || 'Khatav, Satara, Maharashtra'}
                      </p>
                    </div>
                    <div className="rx-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff', fontSize: '1.25rem', fontWeight: 'bold', justifyContent: 'center' }}>
                        Rx
                      </div>
                      <p className="rx-clinic-details" style={{ marginTop: 8 }}>📞 {doctor?.phone || '9960122746'}</p>
                      <p className="rx-clinic-details">{doctor?.email || 'care@homeobeauty.com'}</p>
                    </div>
                  </div>

                  {/* Patient Info Box */}
                  <div className="rx-patient-info">
                    <div className="rx-patient-field">
                      <label>Patient Name</label>
                      <p>{formData.patientName || 'N/A'}</p>
                    </div>
                    <div className="rx-patient-field">
                      <label>Age / Gender</label>
                      <p>{formData.age || 'N/A'} Yrs / {formData.gender}</p>
                    </div>
                    <div className="rx-patient-field">
                      <label>Blood Group</label>
                      <p>{formData.bloodGroup || 'N/A'}</p>
                    </div>
                    <div className="rx-patient-field">
                      <label>Contact Phone</label>
                      <p>{formData.phone || 'N/A'}</p>
                    </div>
                    <div className="rx-patient-field">
                      <label>Date</label>
                      <p>{new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Case details on prescription */}
                  {formData.chiefComplaint && (
                    <div className="rx-section">
                      <p className="rx-section-title">Chief Complaint & Symptoms</p>
                      <p style={{ fontSize: '0.9rem', color: '#333', whiteSpace: 'pre-line', paddingLeft: 8 }}>
                        {formData.chiefComplaint}
                      </p>
                    </div>
                  )}

                  {formData.rubrics.length > 0 && (
                    <div className="rx-section">
                      <p className="rx-section-title">Rubrics Selection</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary-dark)', fontWeight: 500, paddingLeft: 8 }}>
                        {formData.rubrics.join(' | ')}
                      </p>
                    </div>
                  )}

                  {formData.miasm && (
                    <div className="rx-section">
                      <p className="rx-section-title">Analysis & Diagnosis</p>
                      <p style={{ fontSize: '0.85rem', color: '#555', paddingLeft: 8 }}>
                        <strong>Dominant Miasm:</strong> {formData.miasm} 
                        {formData.thermal && <> | <strong>Thermal:</strong> {formData.thermal}</>}
                      </p>
                    </div>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px dashed var(--primary)', margin: '15px 0' }} />

                  {/* Rx Symbol */}
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: 10 }}>
                    ℞ (Remedy Selection)
                  </div>

                  {/* Remedies */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
                    <div className="rx-medicine-head">
                      <span>Medicine</span>
                      <span>Potency</span>
                      <span>Dose</span>
                      <span>Instructions</span>
                    </div>
                    {formData.remedies.map((remedy, i) => (
                      <div key={i} className="rx-medicine">
                        <span className="rx-medicine-name">{remedy.remedyName || 'Remedy Name'}</span>
                        <span className="rx-medicine-potency">{remedy.potency}</span>
                        <span className="rx-medicine-dose">{remedy.dose}</span>
                        <span className="rx-medicine-frequency">{remedy.frequency}</span>
                      </div>
                    ))}
                  </div>

                  {/* Follow Up */}
                  <div className="rx-section">
                    <p style={{ fontSize: '0.9rem', color: '#333' }}>
                      <strong>Follow Up:</strong> Return in <strong>{formData.followUpDays} Days</strong>.
                    </p>
                  </div>

                  {/* Signature area */}
                  <div className="rx-footer">
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#888' }}>
                        * Homoeopathic medicines are gentle. Take pills on clean tongue.
                      </p>
                    </div>
                    <div className="rx-signature-area">
                      <div className="rx-signature-line">
                        {doctor?.signatureBase64 ? (
                          <img 
                            src={doctor.signatureBase64} 
                            alt="Doctor Signature" 
                            style={{ maxHeight: '60px', maxWidth: '150px', objectFit: 'contain' }} 
                          />
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#ccc', fontStyle: 'italic' }}>Signature upload required</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--dark)' }}>
                        {doctor?.fullName || 'Dr. Akaram Salunkhe'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#666' }}>Authorized Signature</p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inquiry;
