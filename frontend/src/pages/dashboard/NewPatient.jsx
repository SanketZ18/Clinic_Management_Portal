import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDays,
  MapPin,
  Stethoscope,
  Plus,
  Trash2,
  Printer,
  MessageCircle,
  Send,
  Shield,
  Search,
  UserCheck,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
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
import { searchPatient, savePatientPrescription } from '../../services/patientApi';

const initialFormState = {
  patientName: '',
  age: '',
  gender: 'Male',
  bloodGroup: '',
  phone: '',
  email: '',
  address: '',
  visitType: 'New',
  referredBy: '',
  nextVisitDate: '',
  chiefComplaint: '',
  diagnosis: '',
  presentHistory: '',
  pastHistory: '',
  familyHistory: '',
  appetite: '',
  thirst: '',
  thermal: 'Ambithermal',
  sleep: '',
  stool: '',
  urine: '',
  perspiration: '',
  mentalGenerals: '',
  worse: '',
  better: '',
  characteristics: '',
  miasm: 'Psora',
  rubrics: [],
  remedies: [
    { remedyName: '', potency: '30C', dose: '4 pills', frequency: 'Three times a day' },
  ],
  followUpDays: '7',
  doctorNotes: '',
};

const quickFields = [
  { name: 'patientName', label: 'Full name', placeholder: 'Enter full name' },
  { name: 'age', label: 'Age', type: 'number', placeholder: 'Enter age' },
  { name: 'phone', label: 'Phone (WhatsApp)', placeholder: 'Enter mobile number' },
  { name: 'email', label: 'Email', placeholder: 'Enter email address (optional)' },
  { name: 'address', label: 'Address', placeholder: 'Enter address' },
  { name: 'referredBy', label: 'Referred by', placeholder: 'Enter referrer name (optional)' },
];

// Search status states
const SEARCH_STATUS = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
};

const NewPatient = () => {
  const { doctor } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const lastRegisteredKeyRef = useRef('');

  // Patient search state
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState(SEARCH_STATUS.IDLE);
  const [foundPatient, setFoundPatient] = useState(null);

  useEffect(() => {
    const savedDraft = sessionStorage.getItem('scribeDraftCase');
    if (savedDraft) {
      try {
        setFormData(JSON.parse(savedDraft));
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  const updateForm = (updates) => {
    const updated = { ...formData, ...updates };
    setFormData(updated);
    sessionStorage.setItem('scribeDraftCase', JSON.stringify(updated));
  };

  const handleFieldChange = (e) => {
    updateForm({ [e.target.name]: e.target.value });
  };

  const handleRemedyChange = (index, field, value) => {
    const updatedRemedies = [...formData.remedies];
    updatedRemedies[index] = { ...updatedRemedies[index], [field]: value };
    updateForm({ remedies: updatedRemedies });
  };

  const addRemedy = () => {
    updateForm({
      remedies: [...formData.remedies, { remedyName: '', potency: '30C', dose: '4 pills', frequency: 'Three times a day' }],
    });
  };

  const removeRemedy = (index) => {
    if (formData.remedies.length === 1) return;
    const updatedRemedies = formData.remedies.filter((_, i) => i !== index);
    updateForm({ remedies: updatedRemedies });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    sessionStorage.removeItem('scribeDraftCase');
    lastRegisteredKeyRef.current = '';
    setSearchStatus(SEARCH_STATUS.IDLE);
    setFoundPatient(null);
    setSearchName('');
    setSearchPhone('');
    toast.success('Form cleared');
  };

  // ── Patient Search & Auto-fill ──────────────────────────────────────────────

  const handleSearchPatient = useCallback(async () => {
    if (!searchName.trim() || !searchPhone.trim()) {
      toast.error('Please enter both patient name and mobile number to search');
      return;
    }

    setSearchStatus(SEARCH_STATUS.SEARCHING);
    setFoundPatient(null);

    try {
      const patient = await searchPatient({ patientName: searchName.trim(), phone: searchPhone.trim() });

      if (patient) {
        setFoundPatient(patient);
        setSearchStatus(SEARCH_STATUS.FOUND);
        toast.success(`Patient found: ${patient.patientName} (${patient.totalVisits} previous visit${patient.totalVisits !== 1 ? 's' : ''})`);
      } else {
        setSearchStatus(SEARCH_STATUS.NOT_FOUND);
      }
    } catch (err) {
      console.error('Patient search error:', err);
      setSearchStatus(SEARCH_STATUS.NOT_FOUND);
      toast.error('Search failed. Please try again.');
    }
  }, [searchName, searchPhone]);

  const handleAutoFill = () => {
    if (!foundPatient) return;
    updateForm({
      patientName: foundPatient.patientName || '',
      age: foundPatient.age || '',
      gender: foundPatient.gender || 'Male',
      bloodGroup: foundPatient.bloodGroup || '',
      phone: foundPatient.phone || '',
      email: foundPatient.email || '',
      address: foundPatient.address || '',
      referredBy: foundPatient.referredBy || '',
    });
    toast.success('Patient information auto-filled from records');
  };

  // ── Save to Database ────────────────────────────────────────────────────────

  const saveToDatabase = async () => {
    try {
      await savePatientPrescription(formData);
      toast.success('Patient record saved to database');
    } catch (err) {
      console.error('Failed to save patient to DB:', err);
      toast.error('Could not save to database — record saved locally only');
    }
  };

  // ── Prescription Artifacts ──────────────────────────────────────────────────

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

  const downloadPrescriptionPdf = async () => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient name and age are required');
      return;
    }
    const issuedAt = new Date();
    const { doc, filename } = buildPrescriptionPdf({ doctor, formData, issuedAt });
    savePdf(doc, filename);
    registerPrescriptionInDayReport(issuedAt);
    // Save to MongoDB
    await saveToDatabase();
    toast.success('Prescription PDF downloaded');
    setFormData(initialFormState);
    sessionStorage.removeItem('scribeDraftCase');
    lastRegisteredKeyRef.current = '';
    setSearchStatus(SEARCH_STATUS.IDLE);
    setFoundPatient(null);
    setSearchName('');
    setSearchPhone('');
  };

  const sharePrescription = async (channel) => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient name and age are required');
      return;
    }

    const issuedAt = new Date();
    const { blob, filename, shareText } = buildPrescriptionArtifacts(issuedAt);
    const shareSubject = `Prescription for ${formData.patientName || 'Patient'}`;
    const shareBody = `${shareText}\n\nPDF downloaded on this device.`;

    const resetAll = () => {
      setFormData(initialFormState);
      sessionStorage.removeItem('scribeDraftCase');
      lastRegisteredKeyRef.current = '';
      setSearchStatus(SEARCH_STATUS.IDLE);
      setFoundPatient(null);
      setSearchName('');
      setSearchPhone('');
    };

    try {
      const shared = await trySharePdf({
        blob,
        filename,
        title: shareSubject,
        text: shareText,
      });

      if (shared) {
        registerPrescriptionInDayReport(issuedAt);
        await saveToDatabase();
        toast.success('Share sheet opened');
        resetAll();
        return;
      }
    } catch (error) {
      console.warn('Native share not available:', error);
    }

    if (channel === 'whatsapp') {
      window.open(buildWhatsAppLink({ phone: formData.phone, message: shareBody }), '_blank', 'noopener,noreferrer');
      registerPrescriptionInDayReport(issuedAt);
      await saveToDatabase();
      toast.success('WhatsApp message prepared');
      resetAll();
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
    await saveToDatabase();
    toast.success('Email draft prepared');
    resetAll();
  };

  const saveToRegister = () => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient name and age are required');
      return;
    }
    registerTodayPatient({
      doctor,
      formData,
      issuedAt: new Date(),
      source: 'manual',
    });
    toast.success("Saved to today's list");
  };

  const topStats = [
    { icon: Stethoscope, label: 'Doctor', value: doctor?.fullName || 'Doctor' },
    { icon: MapPin, label: 'Clinic', value: doctor?.clinicName || 'Clinic' },
    { icon: Shield, label: 'Plan', value: doctor?.subscriptionPlan || 'FREE' },
    { icon: CalendarDays, label: 'Today', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
  ];

  // ── Search status UI helpers ────────────────────────────────────────────────
  const searchStatusConfig = {
    [SEARCH_STATUS.FOUND]: {
      color: 'var(--success, #16a34a)',
      bg: '#f0fdf4',
      border: '#bbf7d0',
      icon: <CheckCircle2 size={16} />,
      label: `Found: ${foundPatient?.patientName} — ${foundPatient?.totalVisits} previous visit(s)`,
    },
    [SEARCH_STATUS.NOT_FOUND]: {
      color: 'var(--primary)',
      bg: 'var(--primary-pale)',
      border: 'var(--primary-light)',
      icon: <UserPlus size={16} />,
      label: 'New patient — record will be created after generating the prescription',
    },
  };

  return (
    <div className="dashboard-page new-patient-page">
      <motion.section
        className="card new-patient-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="new-patient-hero-copy">
          <div className="dashboard-panel-kicker">New Prescription</div>
          <h2 className="new-patient-title">Create a fresh prescription for the next patient</h2>
          <p className="new-patient-subtitle">
            Search an existing patient to auto-fill their information, or fill in the form for a new patient.
            All records are saved to the database for report generation.
          </p>
          <div className="new-patient-actions">
            <button onClick={saveToRegister} className="btn btn-ghost btn-sm">
              <Plus size={14} /> Save to today's list
            </button>
            <button onClick={downloadPrescriptionPdf} className="btn btn-primary btn-sm">
              <Printer size={14} /> Download Prescription PDF
            </button>
            <button onClick={() => sharePrescription('whatsapp')} className="btn btn-accent btn-sm">
              <MessageCircle size={14} /> Send WhatsApp
            </button>
            <button onClick={() => sharePrescription('email')} className="btn btn-ghost btn-sm">
              <Send size={14} /> Send Email
            </button>
            <button onClick={resetForm} className="btn btn-danger btn-sm">
              <Trash2 size={14} /> Clear Form
            </button>
          </div>
        </div>

        <div className="new-patient-hero-side">
          {topStats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="new-patient-stat">
              <div className="new-patient-stat-icon">
                <Icon size={16} />
              </div>
              <div>
                <div className="new-patient-stat-label">{label}</div>
                <div className="new-patient-stat-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Patient Search Bar ──────────────────────────────────────────────── */}
      <motion.section
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{ padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Search size={18} color="var(--primary)" />
          <div>
            <div className="dashboard-panel-kicker" style={{ marginBottom: 0 }}>Patient Lookup</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Search existing patient to auto-fill</h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
            <label className="form-label">Patient Name *</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setSearchStatus(SEARCH_STATUS.IDLE); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
              placeholder="Enter patient full name"
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Mobile Number *</label>
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => { setSearchPhone(e.target.value); setSearchStatus(SEARCH_STATUS.IDLE); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
              placeholder="Enter mobile number"
              className="form-input"
            />
          </div>
          <div style={{ display: 'flex', gap: 8, paddingBottom: '1px' }}>
            <button
              onClick={handleSearchPatient}
              className="btn btn-primary btn-sm"
              disabled={searchStatus === SEARCH_STATUS.SEARCHING}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {searchStatus === SEARCH_STATUS.SEARCHING
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Searching...</>
                : <><Search size={14} /> Search Patient</>}
            </button>
            {searchStatus === SEARCH_STATUS.FOUND && (
              <button onClick={handleAutoFill} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                <UserCheck size={14} /> Auto-fill Form
              </button>
            )}
          </div>
        </div>

        {/* Search result indicator */}
        <AnimatePresence>
          {(searchStatus === SEARCH_STATUS.FOUND || searchStatus === SEARCH_STATUS.NOT_FOUND) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 12 }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 500,
                background: searchStatusConfig[searchStatus]?.bg,
                border: `1.5px solid ${searchStatusConfig[searchStatus]?.border}`,
                color: searchStatusConfig[searchStatus]?.color,
              }}>
                {searchStatusConfig[searchStatus]?.icon}
                <span>{searchStatusConfig[searchStatus]?.label}</span>
              </div>

              {searchStatus === SEARCH_STATUS.FOUND && foundPatient?.prescriptions?.length > 0 && (
                <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  <strong>Last visit:</strong>{' '}
                  {new Date(foundPatient.prescriptions.at(-1)?.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {foundPatient.prescriptions.at(-1)?.chiefComplaint && (
                    <> &nbsp;·&nbsp; <strong>Chief complaint:</strong> {foundPatient.prescriptions.at(-1).chiefComplaint}</>
                  )}
                  {foundPatient.prescriptions.at(-1)?.remedies?.length > 0 && (
                    <> &nbsp;·&nbsp; <strong>Last remedy:</strong> {foundPatient.prescriptions.at(-1).remedies[0].remedyName}</>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <div className="new-patient-grid">
        <section className="card new-patient-card">
          <div className="new-patient-card-head">
            <div>
              <div className="dashboard-panel-kicker">Patient details</div>
              <h3 className="new-patient-card-title">Core patient information</h3>
            </div>
            <div className="new-patient-required">* required</div>
          </div>
          <div className="new-patient-form-grid">
            {quickFields.map(({ name, label, type = 'text', placeholder }) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}{name === 'patientName' || name === 'age' ? ' *' : ''}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleFieldChange}
                  placeholder={placeholder}
                  className="form-input"
                  required={name === 'patientName' || name === 'age'}
                />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleFieldChange} className="form-input form-select">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleFieldChange} className="form-input form-select">
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
              <label className="form-label">Visit type</label>
              <select name="visitType" value={formData.visitType} onChange={handleFieldChange} className="form-input form-select">
                <option>New</option>
                <option>Follow-up</option>
                <option>Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Next visit date</label>
              <input type="date" name="nextVisitDate" value={formData.nextVisitDate} onChange={handleFieldChange} className="form-input" />
            </div>
          </div>
        </section>

        <section className="card new-patient-card">
          <div className="new-patient-card-head">
            <div>
              <div className="dashboard-panel-kicker">Clinical notes</div>
              <h3 className="new-patient-card-title">Complaint, Diagnosis & Notes</h3>
            </div>
          </div>
          <div className="new-patient-notes-grid">
            <div className="form-group">
              <label className="form-label">Chief complaints / symptoms *</label>
              <textarea
                name="chiefComplaint"
                value={formData.chiefComplaint}
                onChange={handleFieldChange}
                className="form-input form-textarea"
                placeholder="Enter chief complaints / symptoms..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Diagnosis / clinical impression</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleFieldChange}
                className="form-input form-textarea"
                placeholder="Enter diagnosis or clinical impression (optional)..."
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Doctor notes (Optional)</label>
              <textarea
                name="doctorNotes"
                value={formData.doctorNotes}
                onChange={handleFieldChange}
                className="form-input form-textarea"
                placeholder="Enter doctor's notes or extra instructions (optional)..."
                style={{ minHeight: '80px' }}
              />
            </div>
          </div>
        </section>

        <section className="card new-patient-card new-patient-card-wide">
          <div className="new-patient-card-head">
            <div>
              <div className="dashboard-panel-kicker">Rx - remedies</div>
              <h3 className="new-patient-card-title">Prescription generation</h3>
            </div>
            <button type="button" onClick={addRemedy} className="btn btn-ghost btn-sm">
              <Plus size={14} /> Add remedy
            </button>
          </div>
          <div className="new-patient-remedy-list">
            {formData.remedies.map((remedy, idx) => (
              <div className="new-patient-remedy-row" key={idx}>
                <div className="form-group">
                  <label className="form-label">Remedy name</label>
                  <input
                    type="text"
                    value={remedy.remedyName}
                    onChange={(e) => handleRemedyChange(idx, 'remedyName', e.target.value)}
                    placeholder="Enter remedy name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Potency</label>
                  <input
                    type="text"
                    value={remedy.potency}
                    onChange={(e) => handleRemedyChange(idx, 'potency', e.target.value)}
                    placeholder="Enter potency (e.g. 30C)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    value={remedy.dose}
                    onChange={(e) => handleRemedyChange(idx, 'dose', e.target.value)}
                    placeholder="Enter dosage (e.g. 4 pills)"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instructions</label>
                  <input
                    type="text"
                    value={remedy.frequency}
                    onChange={(e) => handleRemedyChange(idx, 'frequency', e.target.value)}
                    placeholder="Enter instructions (e.g. Three times a day)"
                    className="form-input"
                  />
                </div>
                {formData.remedies.length > 1 && (
                  <button type="button" onClick={() => removeRemedy(idx)} className="new-patient-remove-btn">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="new-patient-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', maxWidth: '300px' }}>
            <div className="form-group">
              <label className="form-label">Follow-up days</label>
              <select name="followUpDays" value={formData.followUpDays} onChange={handleFieldChange} className="form-input form-select">
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewPatient;
