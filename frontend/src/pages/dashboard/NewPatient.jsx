import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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

const NewPatient = () => {
  const { doctor } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const lastRegisteredKeyRef = useRef('');

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
    toast.success('Form cleared');
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

  const downloadPrescriptionPdf = async () => {
    if (!formData.patientName || !formData.age) {
      toast.error('Patient name and age are required');
      return;
    }
    const issuedAt = new Date();
    const { doc, filename } = buildPrescriptionPdf({ doctor, formData, issuedAt });
    savePdf(doc, filename);
    registerPrescriptionInDayReport(issuedAt);
    toast.success('Prescription PDF downloaded');
    setFormData(initialFormState);
    sessionStorage.removeItem('scribeDraftCase');
    lastRegisteredKeyRef.current = '';
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
        setFormData(initialFormState);
        sessionStorage.removeItem('scribeDraftCase');
        lastRegisteredKeyRef.current = '';
        return;
      }
    } catch (error) {
      console.warn('Native share not available:', error);
    }

    if (channel === 'whatsapp') {
      window.open(buildWhatsAppLink({ phone: formData.phone, message: shareBody }), '_blank', 'noopener,noreferrer');
      registerPrescriptionInDayReport(issuedAt);
      toast.success('WhatsApp message prepared');
      setFormData(initialFormState);
      sessionStorage.removeItem('scribeDraftCase');
      lastRegisteredKeyRef.current = '';
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
    setFormData(initialFormState);
    sessionStorage.removeItem('scribeDraftCase');
    lastRegisteredKeyRef.current = '';
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
    toast.success('Saved to today\'s list');
  };

  const topStats = [
    { icon: Stethoscope, label: 'Doctor', value: doctor?.fullName || 'Doctor' },
    { icon: MapPin, label: 'Clinic', value: doctor?.clinicName || 'Clinic' },
    { icon: Shield, label: 'Plan', value: doctor?.subscriptionPlan || 'FREE' },
    { icon: CalendarDays, label: 'Today', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
  ];

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
            Temporary patient record used to generate the prescription PDF and optionally share it by WhatsApp or email.
            Patient details are stored only on this device.
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
