import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  ClipboardList,
  Download,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  buildDailyReportPdf,
  clearTodayPatientsForDoctor,
  formatMedicineNamesSummary,
  getTodayPatientsForDoctor,
  removeTodayPatientForDoctor,
  savePdf,
} from '../../utils/clinicDocuments';

const emptyStats = {
  total: 0,
  newCases: 0,
  followUps: 0,
  regularVisits: 0,
};

const normalizeVisitType = (value = '') => {
  const text = String(value).trim().toLowerCase();
  if (!text) return 'new';
  if (text === 'follow up' || text === 'followup') return 'follow-up';
  return text;
};

const PatientLog = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(emptyStats);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadPatients = () => {
    const todayPatients = getTodayPatientsForDoctor(doctor).slice().reverse();
    setPatients(todayPatients);

    const nextStats = todayPatients.reduce(
      (acc, patient) => {
        const visitType = (patient.visitType || 'New').toLowerCase();
        acc.total += 1;
        if (visitType === 'new') acc.newCases += 1;
        else if (visitType === 'follow-up') acc.followUps += 1;
        else if (visitType === 'regular') acc.regularVisits += 1;
        return acc;
      },
      { ...emptyStats }
    );

    setStats(nextStats);
  };

  useEffect(() => {
    loadPatients();
  }, [doctor]);

  useEffect(() => {
    const handleUpdate = () => loadPatients();
    window.addEventListener('today-patients-updated', handleUpdate);
    return () => window.removeEventListener('today-patients-updated', handleUpdate);
  }, []);

  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filteredByVisit = activeFilter === 'all'
      ? patients
      : patients.filter((patient) => normalizeVisitType(patient.visitType) === activeFilter);

    if (!query) return filteredByVisit;

    return filteredByVisit.filter((patient) => {
      const haystack = [
        patient.patientName,
        patient.age,
        patient.gender,
        patient.bloodGroup,
        patient.phone,
        patient.visitType,
        patient.referredBy,
        patient.chiefComplaint,
        patient.medicineNames,
        patient.medicines,
        patient.remedy,
        patient.nextVisitDate,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [patients, searchQuery, activeFilter]);

  const deletePatient = (id) => {
    removeTodayPatientForDoctor(doctor, id);
    toast.success('Patient record removed');
    loadPatients();
  };

  const clearRegister = () => {
    if (!window.confirm("Clear today's patient register?")) return;
    clearTodayPatientsForDoctor(doctor);
    toast.success("Today's register cleared");
    loadPatients();
  };

  const downloadDailyReport = () => {
    if (patients.length === 0) {
      toast.error('Register at least one patient before downloading the report');
      return;
    }

    const { doc, filename } = buildDailyReportPdf({
      doctor,
      patients,
      reportDate: new Date(),
    });

    savePdf(doc, filename);
    toast.success('Day report downloaded');
  };

  return (
    <div className="dashboard-page patient-log-page day-report-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* Header section matching the design */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #eaeae6', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--dark)', fontWeight: '700' }}>Day Report</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Compiled from this doctor&apos;s prescriptions for today. Not saved to any server — download the PDF to your machine.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={loadPatients} className="btn btn-ghost btn-sm" style={{ padding: '8px 16px', borderRadius: '9999px' }}>
            <RefreshCw size={14} /> Reload
          </button>
          <button onClick={downloadDailyReport} className="day-report-download-btn" disabled={patients.length === 0}>
            <Download size={14} /> Download PDF Report
          </button>
          <button onClick={clearRegister} className="btn btn-danger btn-sm" style={{ borderRadius: '9999px' }} disabled={patients.length === 0}>
            <Trash2 size={14} /> Clear log
          </button>
        </div>
      </div>

      {/* Stats container */}
      <div className="patient-log-stats-container">
        <button
          type="button"
          className="patient-log-stat-card patient-log-stat-card-button"
          onClick={() => setActiveFilter('all')}
          aria-pressed={activeFilter === 'all'}
          data-active={activeFilter === 'all'}
        >
          <span className="stat-badge stat-badge-total">TOTAL PATIENTS</span>
          <div className="stat-value">{stats.total}</div>
        </button>
        <button
          type="button"
          className="patient-log-stat-card patient-log-stat-card-button"
          onClick={() => setActiveFilter('new')}
          aria-pressed={activeFilter === 'new'}
          data-active={activeFilter === 'new'}
        >
          <span className="stat-badge stat-badge-new">NEW CASES</span>
          <div className="stat-value">{stats.newCases}</div>
        </button>
        <button
          type="button"
          className="patient-log-stat-card patient-log-stat-card-button"
          onClick={() => setActiveFilter('follow-up')}
          aria-pressed={activeFilter === 'follow-up'}
          data-active={activeFilter === 'follow-up'}
        >
          <span className="stat-badge stat-badge-follow">FOLLOW UPS</span>
          <div className="stat-value">{stats.followUps}</div>
        </button>
        <button
          type="button"
          className="patient-log-stat-card patient-log-stat-card-button"
          onClick={() => setActiveFilter('regular')}
          aria-pressed={activeFilter === 'regular'}
          data-active={activeFilter === 'regular'}
        >
          <span className="stat-badge stat-badge-regular">REGULAR VISITS</span>
          <div className="stat-value">{stats.regularVisits}</div>
        </button>
      </div>

      {/* Table section (Full width) */}
      <section className="card patient-log-table-card" style={{ width: '100%' }}>
        <div className="patient-log-controls">
          <div className="patient-log-search">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search patient, medicines, complaint..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {activeFilter !== 'all' && (
            <button type="button" onClick={() => setActiveFilter('all')} className="btn btn-ghost btn-sm">
              Clear filter
            </button>
          )}
          <button onClick={() => navigate('/doctor/new-patient')} className="btn btn-ghost btn-sm">
            <ArrowRight size={14} /> New patient
          </button>
        </div>

        <div className="register-table-wrapper">
          {filteredPatients.length === 0 ? (
            <div className="register-empty">
              <ClipboardList />
              <h3>No patients registered today</h3>
              <p style={{ maxWidth: 420, margin: '8px auto 0', fontSize: '0.85rem' }}>
                Register the first case of the day to unlock the report download.
              </p>
            </div>
          ) : (
            <table className="register-table day-report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient</th>
                  <th>Age/Sex</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Visit</th>
                  <th>Referred By</th>
                  <th>Symptoms</th>
                  <th>Medicines</th>
                  <th>Next Visit</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{index + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--dark)' }}>{patient.patientName}</td>
                    <td>{patient.age} / {patient.gender}</td>
                    <td>{patient.bloodGroup || 'N/A'}</td>
                    <td>{patient.phone || 'N/A'}</td>
                    <td>
                      <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                        {patient.visitType || 'New'}
                      </span>
                    </td>
                    <td>{patient.referredBy || '-'}</td>
                    <td style={{ maxWidth: 210, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {patient.chiefComplaint || '-'}
                    </td>
                    <td style={{ whiteSpace: 'pre-line', color: 'var(--dark)', fontWeight: 500 }}>
                      {patient.medicineNames || formatMedicineNamesSummary(patient.remedies) || patient.medicines || patient.remedy || '-'}
                    </td>
                    <td>{patient.nextVisitDate || patient.followUp || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => deletePatient(patient.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)' }}
                        title="Remove patient log"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientLog;
