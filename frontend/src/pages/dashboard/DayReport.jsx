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
    default:
      return null;
  }
};

const FILTER_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom Range' },
];

// ── Patient History PDF Builder ───────────────────────────────────────────────

const buildPatientHistoryPdf = (doctor, historyData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pw - margin * 2;
  let y = margin;

  const COLORS = {
    primary: [15, 46, 91],
    primaryDark: [10, 28, 64],
    primaryLight: [235, 243, 255],
    accent: [246, 160, 35],
    line: [203, 213, 225],
    text: [15, 23, 42],
    muted: [100, 116, 139],
    white: [255, 255, 255],
    rowAlt: [248, 250, 252],
  };

  const text = (v, fallback = 'N/A') => {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    return s || fallback;
  };

  const checkPage = (needed = 10) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  };

  const drawHeader = () => {
    // Clinic name block
    doc.setFillColor(...COLORS.primary);
    doc.roundedRect(margin, y, 18, 18, 3, 3, 'F');
    doc.setFillColor(...COLORS.white);
    doc.rect(margin + 7.5, y + 3.5, 3, 11, 'F');
    doc.rect(margin + 3.5, y + 7.5, 11, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.primary);
    doc.text(text(doctor?.clinicName, 'Clinic'), margin + 21, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    doc.text(text(doctor?.fullName, 'Doctor'), margin + 21, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${text(doctor?.qualification)} | Reg: ${text(doctor?.licenseNumber)}`, margin + 21, y + 15.2);
    doc.text(text(doctor?.clinicAddress, ''), margin + 21, y + 18.5);

    // Report badge
    doc.setFillColor(...COLORS.primaryDark);
    doc.roundedRect(pw - margin - 54, y, 54, 20, 4, 4, 'F');
    doc.setFillColor(...COLORS.accent);
    doc.roundedRect(pw - margin - 50, y + 3, 22, 5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.white);
    doc.text('PATIENT HISTORY', pw - margin - 39, y + 6.8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(text(historyData.patientName), pw - margin - 2, y + 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(`Total Visits: ${historyData.totalVisits}`, pw - margin - 2, y + 17.5, { align: 'right' });

    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 22, pw - margin, y + 22);
    y += 27;
  };

  // --- First page header ---
  drawHeader();

  // --- Patient demographic band ---
  const bandHeight = 30;
  doc.setFillColor(...COLORS.primaryLight);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(margin, y, contentWidth, bandHeight, 3, 3, 'FD');

  // Column split: left half and right half
  const halfW = contentWidth / 2;
  const lx = margin + 5;        // left column label x
  const lv = margin + 32;       // left column value x
  const rx = margin + halfW + 5;  // right column label x
  const rv = margin + halfW + 28; // right column value x
  const rowH = 6.5;

  // Labels (bold, muted)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Name:',       lx, y + rowH);
  doc.text('Age/Gender:', lx, y + rowH * 2);
  doc.text('Blood Group:',lx, y + rowH * 3);
  doc.text('Phone:',      lx, y + rowH * 4);
  doc.text('Email:',      rx, y + rowH);
  doc.text('Address:',    rx, y + rowH * 2);

  // Values (normal, text colour)
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  doc.text(text(historyData.patientName),                    lv, y + rowH);
  doc.text(`${text(historyData.age)} yrs / ${text(historyData.gender)}`, lv, y + rowH * 2);
  doc.text(text(historyData.bloodGroup),                     lv, y + rowH * 3);
  doc.text(text(historyData.phone),                          lv, y + rowH * 4);
  doc.text(text(historyData.email),                          rv, y + rowH);
  const addrLines = doc.splitTextToSize(text(historyData.address, '—'), halfW - rv + margin + halfW - 6);
  doc.text(addrLines,                                        rv, y + rowH * 2);

  y += bandHeight + 5;

  // --- Visits ---
  const visits = historyData.prescriptions || [];
  visits.forEach((visit, idx) => {
    checkPage(50);

    // Visit header bar
    doc.setFillColor(...COLORS.primaryDark);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...COLORS.white);
    const visitDateStr = visit.visitDate
      ? new Date(visit.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'N/A';
    doc.text(`VISIT ${idx + 1}  —  ${visitDateStr}  (${text(visit.visitType, 'Consultation')})`, margin + 3, y + 6);
    y += 12;

    // Clinical details
    const clinicalRows = [
      ['Chief Complaint', visit.chiefComplaint],
      ['Diagnosis', visit.diagnosis],
      ['Doctor Notes', visit.doctorNotes],
    ].filter(([, v]) => v && v.trim());

    clinicalRows.forEach(([label, value]) => {
      checkPage(8);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.muted);
      doc.text(`${label}:`, margin + 2, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(...COLORS.text);
      const lines = doc.splitTextToSize(text(value), contentWidth - 35);
      doc.text(lines, margin + 30, y);
      y += Math.max(5.5, lines.length * 4.5);
    });

    y += 2;

    // Remedies table
    if (visit.remedies && visit.remedies.length > 0) {
      checkPage(30);
      const colWidths = [10, contentWidth * 0.35, contentWidth * 0.18, contentWidth * 0.18, contentWidth * 0.22];
      const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]];
      const headers = ['#', 'Remedy Name', 'Potency', 'Dose', 'Instructions'];

      // Table header
      doc.setFillColor(...COLORS.accent);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.white);
      headers.forEach((h, i) => doc.text(h, colX[i] + 2, y + 4.8));
      y += 7;

      // Table rows
      visit.remedies.forEach((remedy, rIdx) => {
        checkPage(8);
        if (rIdx % 2 === 1) { doc.setFillColor(...COLORS.rowAlt); doc.rect(margin, y, contentWidth, 7, 'F'); }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.text);
        const rowData = [String(rIdx + 1), text(remedy.remedyName), text(remedy.potency), text(remedy.dose), text(remedy.frequency)];
        rowData.forEach((cell, i) => {
          const cellLines = doc.splitTextToSize(cell, colWidths[i] - 4);
          doc.text(cellLines, colX[i] + 2, y + 4.8);
        });
        doc.setDrawColor(...COLORS.line); doc.setLineWidth(0.1);
        doc.line(margin, y + 7, margin + contentWidth, y + 7);
        y += 7;
      });
    }

    // Follow-up
    checkPage(10);
    y += 3;
    doc.setFillColor(...COLORS.primaryLight);
    doc.roundedRect(margin, y, contentWidth, 7, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.primaryDark);
    const followUpText = visit.nextVisitDate
      ? `Next Visit: ${visit.nextVisitDate}  |  Follow-up: ${text(visit.followUpDays)} days`
      : `Follow-up: ${text(visit.followUpDays)} days`;
    doc.text(followUpText, margin + 4, y + 4.8);
    y += 10;

    // Separator between visits
    if (idx < visits.length - 1) {
      checkPage(8);
      doc.setDrawColor(...COLORS.line); doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin, y, margin + contentWidth, y);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
  });

  // Signature
  checkPage(30);
  y += 10;
  doc.setDrawColor(...COLORS.line); doc.line(margin, y, margin + contentWidth, y);
  y += 5;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(...COLORS.muted);
  doc.text('* This patient history report is generated by the clinic management system and is confidential.', margin, y);

  const sigX = pw - margin - 55;
  const sigY = y - 20;
  if (doctor?.signatureBase64) {
    try {
      const fmt = doctor.signatureBase64.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG';
      doc.addImage(doctor.signatureBase64, fmt, sigX, sigY, 48, 16, undefined, 'FAST');
    } catch (_) { /* ignore signature render errors */ }
  }
  doc.setDrawColor(...COLORS.primaryDark); doc.line(sigX, sigY + 18, sigX + 48, sigY + 18);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.text);
  doc.text(text(doctor?.fullName, 'Doctor'), sigX + 24, sigY + 22, { align: 'center' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5); doc.setTextColor(...COLORS.muted);
  doc.text('Authorized Signature', sigX + 24, sigY + 26, { align: 'center' });

  const patientSafe = text(historyData.patientName, 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const phoneSafe = text(historyData.phone, '').replace(/\D/g, '');
  const filename = `Patient_${patientSafe}_${phoneSafe}_History.pdf`;

  return { doc, filename };
};

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
              chiefComplaint: rx.chiefComplaint || 'N/A',
              remedies: rx.remedies || [],
              medicineNames: (rx.remedies || []).map((r) => r.remedyName).filter(Boolean).join('\n') || 'N/A',
              followUp: rx.nextVisitDate ? new Date(rx.nextVisitDate).toLocaleDateString('en-IN') : `${rx.followUpDays || '—'} days`,
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
              : `No visits found for the selected ${activePreset === 'week' ? 'week' : activePreset === 'month' ? 'month' : 'date range'}.`}
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
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteIndividual(p)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={`Permanently delete ${p.patientName} from database`}
                        >
                          <Trash2 size={14} />
                        </button>
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
