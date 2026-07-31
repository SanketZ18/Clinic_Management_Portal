import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Clipboard,
  Calendar,
  ArrowLeft,
  RefreshCw,
  Filter,
  Search,
  Download,
  ChevronDown,
  User,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import {
  formatMedicineNamesSummary,
  getTodayPatientsForDoctor,
  buildDailyReportPdf,
  buildPatientHistoryPdf,
  savePdf,
  removeTodayPatientForDoctor,
  clearTodayPatientsForDoctor,
} from '../../utils/clinicDocuments';
import { getPatientsByDateRange, getPatientHistory, deletePatient, deletePatientsBulk } from '../../services/patientApi';

// ── Date Range Helpers ────────────────────────────────────────────────────────

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getPresetRange = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'today': {
      const d = toISODate(now);
      return { from: d, to: d, label: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) };
    }
    case 'week': {
      const day = now.getDay();
      const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return {
        from: toISODate(mon), to: toISODate(sun),
        label: `Week: ${mon.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${sun.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      };
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        from: toISODate(first), to: toISODate(last),
        label: now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      };
    }
    case 'year': {
      const first = new Date(now.getFullYear(), 0, 1);
      const last = new Date(now.getFullYear(), 11, 31);
      return {
        from: toISODate(first), to: toISODate(last),
        label: `Year: ${now.getFullYear()}`,
      };
    }
    default:
      return null;
  }
};

const FILTER_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];



// ── Main Component ────────────────────────────────────────────────────────────

const DayReport = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  // Filter state
  const [activePreset, setActivePreset] = useState('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [filterLabel, setFilterLabel] = useState('');

  // Patient list state
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Patient history PDF state
  const [historyName, setHistoryName] = useState('');
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [rowLoadingId, setRowLoadingId] = useState(null);

  // Live search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered patient visits list
  const filteredPatientsList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((p) => {
      const haystack = [
        p.patientName,
        p.age,
        p.gender,
        p.bloodGroup,
        p.phone,
        p.chiefComplaint,
        p.medicineNames,
        p.followUp,
        p.diagnosis,
        p.visitType
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [patients, searchQuery]);

  // ── Resolve date range from preset ───────────────────────────────────────

  const resolvedRange = useCallback(() => {
    if (activePreset === 'custom') {
      if (!customFrom || !customTo) return null;
      return {
        from: customFrom,
        to: customTo,
        label: `${new Date(customFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – ${new Date(customTo).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`,
      };
    }
    return getPresetRange(activePreset);
  }, [activePreset, customFrom, customTo]);

  // ── Load patients from API (with localStorage fallback) ───────────────────

  const loadPatients = useCallback(async () => {
    const range = resolvedRange();
    if (!range) return;

    setLoading(true);
    setFetchError(null);

    try {
      const apiPatients = await getPatientsByDateRange({ from: range.from, to: range.to });
      setFilterLabel(range.label);

      if (apiPatients && apiPatients.length > 0) {
        // Flatten: one row per prescription entry in the date range
        const rows = [];
        apiPatients.forEach((patient) => {
          (patient.prescriptions || []).forEach((rx) => {
            rows.push({
              id: `${patient.patientId}_${rx.visitDate}`,
              patientId: patient.patientId,
              patientName: patient.patientName,
              age: patient.age,
              gender: patient.gender,
              bloodGroup: patient.bloodGroup || 'N/A',
              phone: patient.phone,
              referredBy: patient.referredBy || '-',
              chiefComplaint: rx.chiefComplaint || 'N/A',
              remedies: rx.remedies || [],
              medicineNames: (rx.remedies || []).map((r) => r.remedyName).filter(Boolean).join('\n') || 'N/A',
              nextVisitDate: rx.nextVisitDate
                ? new Date(rx.nextVisitDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : null,
              followUp: rx.nextVisitDate
                ? new Date(rx.nextVisitDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : `${rx.followUpDays || '—'} days`,
              createdAt: rx.visitDate,
              diagnosis: rx.diagnosis,
              visitType: rx.visitType,
            });
          });
        });
        setPatients(rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        // Fallback to localStorage for today only
        if (activePreset === 'today') {
          const local = getTodayPatientsForDoctor(doctor).slice().reverse();
          setPatients(local);
        } else {
          setPatients([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch patients from API:', err);
      setFetchError('Could not load from database. Showing local session records.');
      // Fallback to localStorage
      if (activePreset === 'today') {
        const local = getTodayPatientsForDoctor(doctor).slice().reverse();
        setPatients(local);
      } else {
        setPatients([]);
      }
    } finally {
      setLoading(false);
    }
  }, [resolvedRange, doctor, activePreset]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  useEffect(() => {
    const handleUpdate = () => { if (activePreset === 'today') loadPatients(); };
    window.addEventListener('today-patients-updated', handleUpdate);
    return () => window.removeEventListener('today-patients-updated', handleUpdate);
  }, [activePreset, loadPatients]);

  // ── Download PDF (filtered) ───────────────────────────────────────────────

  const handleDownloadPdf = () => {
    if (filteredPatientsList.length === 0) {
      toast.error('No patient records found for the selected filter');
      return;
    }

    try {
      const presetObj = FILTER_PRESETS.find((p) => p.id === activePreset);
      const presetLabel = presetObj?.label || 'Report';
      const titleText = activePreset === 'today' ? 'DAY REPORT' : `${presetLabel.toUpperCase()} PATIENT REPORT`;

      const { doc, filename } = buildDailyReportPdf({
        doctor,
        patients: filteredPatientsList,
        reportDate: new Date(),
        periodLabel: filterLabel || presetLabel,
        title: titleText,
      });

      savePdf(doc, filename);
      toast.success(`PDF report downloaded (${filteredPatientsList.length} record${filteredPatientsList.length !== 1 ? 's' : ''})`);
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF report');
    }
  };

  // ── Delete Handlers ────────────────────────────────────────────────────────

  const handleDeleteIndividual = async (patientRecord) => {
    const name = patientRecord.patientName || 'this patient';
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE patient '${name}' from the database?`)) {
      return;
    }

    try {
      if (patientRecord.patientId) {
        await deletePatient(patientRecord.patientId);
      }
      if (doctor && (patientRecord.patientId || patientRecord.id)) {
        removeTodayPatientForDoctor(doctor, patientRecord.patientId || patientRecord.id);
      }
      toast.success(`Patient '${name}' deleted from database`);
      await loadPatients();
    } catch (err) {
      console.error('Individual deletion error:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete patient from database');
    }
  };

  const handleDeleteBulkFiltered = async () => {
    if (filteredPatientsList.length === 0) {
      toast.error('No patient records found in the current filter to delete');
      return;
    }

    const count = filteredPatientsList.length;
    const periodName = filterLabel || activePreset;
    if (!window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE all ${count} patient record(s) for period '${periodName}' from the database?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const patientIds = Array.from(
        new Set(filteredPatientsList.map((p) => p.patientId).filter(Boolean))
      );

      if (patientIds.length > 0) {
        await deletePatientsBulk(patientIds);
      }

      if (activePreset === 'today') {
        clearTodayPatientsForDoctor(doctor);
      }

      toast.success(`Successfully deleted ${count} patient record(s) from database`);
      await loadPatients();
    } catch (err) {
      console.error('Bulk deletion error:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete patients from database');
    }
  };

  // ── Patient History PDF ───────────────────────────────────────────────────

  const handleGenerateHistory = async () => {
    if (!historyName.trim() || !historyPhone.trim()) {
      toast.error('Please enter both patient name and mobile number');
      return;
    }
    setHistoryLoading(true);
    try {
      const historyData = await getPatientHistory({ patientName: historyName.trim(), phone: historyPhone.trim() });
      if (!historyData || !historyData.prescriptions?.length) {
        toast.error('No prescription history found for this patient');
        return;
      }
      const { doc, filename } = buildPatientHistoryPdf(doctor, historyData);
      savePdf(doc, filename);
      toast.success(`Patient history PDF generated (${historyData.totalVisits} visit${historyData.totalVisits !== 1 ? 's' : ''})`);
    } catch (err) {
      console.error('History PDF error:', err);
      toast.error(err?.response?.data?.message || 'No history found for this patient');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRowFollowUp = async (patientRecord) => {
    const name = patientRecord.patientName;
    const phone = patientRecord.phone;

    if (!name || !phone || phone === 'N/A' || phone === '-') {
      toast.error(`Mobile number or patient name missing for ${name || 'patient'}. Cannot fetch complete history.`);
      return;
    }

    const rowId = patientRecord.id || `${name}_${phone}`;
    setRowLoadingId(rowId);

    try {
      const historyData = await getPatientHistory({ patientName: name.trim(), phone: phone.trim() });
      if (!historyData || !historyData.prescriptions || historyData.prescriptions.length === 0) {
        toast.error(`No visit history found for patient ${name}`);
        return;
      }
      const { doc, filename } = buildPatientHistoryPdf(doctor, historyData);
      savePdf(doc, filename);
      toast.success(`Follow-up history PDF downloaded for ${name} (${historyData.totalVisits} visit${historyData.totalVisits !== 1 ? 's' : ''})`);
    } catch (err) {
      console.error('Row follow-up history PDF error:', err);
      toast.error(err?.response?.data?.message || `Failed to fetch history PDF for ${name}`);
    } finally {
      setRowLoadingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 'none' }}>

      {/* Top controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <button onClick={() => navigate('/doctor/register')} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Back to Register
        </button>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={loadPatients} className="btn btn-ghost btn-sm" disabled={loading}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Reload
          </button>
          <button
            onClick={handleDownloadPdf}
            className="btn btn-primary btn-sm"
            disabled={filteredPatientsList.length === 0 || loading}
          >
            <Download size={14} /> Download PDF Report
          </button>
          <button
            onClick={handleDeleteBulkFiltered}
            className="btn btn-danger btn-sm"
            disabled={filteredPatientsList.length === 0 || loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="Permanently delete all patient records in the selected filter from database"
          >
            <Trash2 size={14} /> Delete Filtered Patients
          </button>
        </div>
      </div>

      {/* ── Patient History PDF Section ──────────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <User size={18} color="var(--primary)" />
          <div>
            <div className="dashboard-panel-kicker" style={{ marginBottom: 0 }}>Patient History Report</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Generate full visit history PDF for a specific patient</h3>
          </div>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Enter the patient&apos;s name and mobile number to download a PDF containing all their prescription visits, sorted chronologically.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 220px', marginBottom: 0 }}>
            <label className="form-label">Patient Name *</label>
            <input
              type="text"
              value={historyName}
              onChange={(e) => setHistoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateHistory()}
              placeholder="Enter patient full name"
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label className="form-label">Mobile Number *</label>
            <input
              type="text"
              value={historyPhone}
              onChange={(e) => setHistoryPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateHistory()}
              placeholder="Enter mobile number"
              className="form-input"
            />
          </div>
          <button
            onClick={handleGenerateHistory}
            className="btn btn-primary btn-sm"
            disabled={historyLoading || !historyName.trim() || !historyPhone.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {historyLoading
              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
              : <><Download size={14} /> Generate History PDF</>}
          </button>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Filter size={16} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Filter Records</span>
          {filterLabel && (
            <span style={{
              marginLeft: 6, fontSize: '0.78rem', background: 'var(--primary-pale)',
              color: 'var(--primary)', padding: '2px 10px', borderRadius: '999px', fontWeight: 600,
            }}>{filterLabel}</span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {FILTER_PRESETS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => { setActivePreset(id); setSearchQuery(''); }}
                className={activePreset === id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                style={{ borderRadius: '999px' }}
              >
                {id === 'today' && <Calendar size={13} />}
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 14px', width: '100%', maxWidth: '300px' }}>
            <Search size={14} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search within these records..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.82rem' }}
            />
          </div>
        </div>

        <AnimatePresence>
          {activePreset === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}
            >
              <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="form-input"
                  max={customTo || undefined}
                />
              </div>
              <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="form-input"
                  min={customFrom || undefined}
                />
              </div>
              <button onClick={loadPatients} className="btn btn-primary btn-sm" disabled={!customFrom || !customTo || loading}>
                <Filter size={13} /> Apply Filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error / fallback notice */}
      {fetchError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '0.85rem', color: '#92400e' }}>
          <AlertCircle size={16} /> {fetchError}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '50px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading patient records…</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <Clipboard size={48} color="var(--border-mid)" style={{ margin: '0 auto 15px' }} />
          <h3>No Patient Records for this Period</h3>
          <p style={{ maxWidth: '420px', margin: '8px auto 0', fontSize: '0.88rem' }}>
            {activePreset === 'today'
              ? 'Open the Patient Inquiry tab to generate prescriptions and register patients.'
              : `No visits found for the selected ${activePreset === 'week' ? 'week' : activePreset === 'month' ? 'month' : activePreset === 'year' ? 'year' : 'date range'}.`}
          </p>
        </div>
      ) : (
        /* Report Container */
        <div style={{ border: '1px solid #ddd', background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
          <div
            ref={reportRef}
            style={{ background: '#fff', padding: '40px', borderRadius: '8px', minHeight: '800px', border: '1px solid #ddd', fontFamily: 'var(--font-body)' }}
          >
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px double var(--primary)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dark)', fontSize: '1.4rem' }}>
                  {doctor?.clinicName || 'Clinic'}
                </h2>
                <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {doctor?.fullName}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {doctor?.qualification} | License Reg: {doctor?.licenseNumber}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  📍 {doctor?.clinicAddress}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-green" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 5 }}>
                  SESSION LOG
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark)', marginTop: 8 }}>
                  Period: {filterLabel}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Patients: {filteredPatientsList.length}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
                <button
                  onClick={handleDownloadPdf}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', padding: '4px 12px' }}
                >
                  <Download size={13} /> Export PDF
                </button>
              </div>
            </div>

            {/* Patients Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                  {['Sr.', 'Patient Name', 'Age/Gender', 'Blood Group', 'Chief Complaint', 'Medicines', 'Follow-up', 'Date & Time', 'Action'].map((h) => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: h === 'Action' ? 'center' : 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatientsList.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredPatientsList.map((p, idx) => (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 1 ? '#fafafa' : '#fff' }}>
                      <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 600 }}>{p.patientName}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem' }}>{p.age} Yrs / {p.gender}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem' }}>{p.bloodGroup || 'N/A'}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.chiefComplaint}
                      </td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', fontWeight: 500, color: 'var(--primary)', whiteSpace: 'pre-line' }}>
                        {p.medicineNames || formatMedicineNamesSummary(p.remedies) || p.medicines || p.remedy || 'N/A'}
                      </td>
                      <td style={{ padding: '10px', fontSize: '0.85rem' }}>{p.followUp}</td>
                      <td style={{ padding: '10px', fontSize: '0.85rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <button
                            onClick={() => handleRowFollowUp(p)}
                            disabled={rowLoadingId === (p.id || `${p.patientName}_${p.phone}`)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1d4ed8',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: rowLoadingId === (p.id || `${p.patientName}_${p.phone}`) ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              transition: 'all 0.2s',
                            }}
                            title={`Generate and download entire visit history PDF for ${p.patientName}`}
                          >
                            {rowLoadingId === (p.id || `${p.patientName}_${p.phone}`) ? (
                              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <FileText size={13} />
                            )}
                            Follow Up
                          </button>
                          <button
                            onClick={() => handleDeleteIndividual(p)}
                            style={{
                              background: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#dc2626',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={`Permanently delete ${p.patientName} from database`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer / Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '40px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * This report is filtered for: <strong>{filterLabel}</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                * Generated by {doctor?.clinicName} Digital Clinic Platform.
                </p>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--dark)', height: '50px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                  {doctor?.signatureBase64 && (
                    <img
                      src={doctor.signatureBase64}
                      alt="Doctor Signature"
                      style={{ maxHeight: '50px', maxWidth: '140px', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{doctor?.fullName}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Doctor Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DayReport;
