import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, Search, Trash2, Calendar, FileDown, 
  Users, CheckCircle2, UserCheck, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  clearTodayPatientsForDoctor,
  getTodayPatientsForDoctor,
  removeTodayPatientForDoctor,
} from '../../utils/clinicDocuments';
import { useAuth } from '../../context/AuthContext';

const DailyRegister = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    other: 0
  });

  // Load today's patients from local storage
  const loadPatients = () => {
    const todayPatients = getTodayPatientsForDoctor(doctor);
    setPatients(todayPatients);
    calculateStats(todayPatients);
  };

  useEffect(() => {
    loadPatients();
  }, [doctor]);

  const calculateStats = (list) => {
    let male = 0;
    let female = 0;
    let other = 0;
    list.forEach(p => {
      if (p.gender === 'Male') male++;
      else if (p.gender === 'Female') female++;
      else other++;
    });
    setStats({
      total: list.length,
      male,
      female,
      other
    });
  };

  const deletePatient = (id) => {
    removeTodayPatientForDoctor(doctor, id);
    toast.success('Patient record removed from active register');
    loadPatients();
  };

  const clearRegister = () => {
    if (window.confirm("Are you sure you want to clear today's patient register? This will delete the local session log for today.")) {
      clearTodayPatientsForDoctor(doctor);
      toast.success("Today's register cleared!");
      loadPatients();
    }
  };

  // Filter patients by search query
  const filteredPatients = patients.filter(p => 
    p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.remedy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20 }}>
          <div style={{ padding: 12, background: 'var(--primary-pale)', borderRadius: 12, color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Patients Today</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20 }}>
          <div style={{ padding: 12, background: 'var(--primary-pale)', borderRadius: 12, color: 'var(--primary)' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Male / Female Visits</p>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {stats.male} M / {stats.female} F
            </h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20 }}>
          <div style={{ padding: 12, background: 'var(--accent-pale)', borderRadius: 12, color: 'var(--accent-dark)' }}>
            <Calendar size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Working Date</p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark)' }}>
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="card" style={{ padding: '24px' }}>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15, marginBottom: 20 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-full)', padding: '6px 14px', width: '100%', maxWidth: '350px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by name, remedy, symptom..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => navigate('/doctor/report')} 
              className="btn btn-primary btn-sm"
              disabled={patients.length === 0}
            >
              <FileDown size={14} /> Download Day Report
            </button>
            <button 
              onClick={clearRegister} 
              className="btn btn-danger btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
              disabled={patients.length === 0}
            >
              <Trash2 size={14} /> Clear Log
            </button>
          </div>

        </div>

        {/* Table representation */}
        <div className="register-table-wrapper">
          {filteredPatients.length === 0 ? (
            <div className="register-empty">
              <ClipboardList />
              <h3>No Patients Registered Today</h3>
              <p style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '0.85rem' }}>
                Open the Patient Inquiry tab to register, examine and scribe prescriptions for your clinical visits.
              </p>
            </div>
          ) : (
            <table className="register-table">
              <thead>
                <tr>
                  <th>Sr No.</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Chief Complaint</th>
                  <th>Prescribed Remedy</th>
                  <th>Follow-up</th>
                  <th>Registered At</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{index + 1}</td>
                    <td style={{ fontWeight: 600, color: 'var(--dark)' }}>{patient.patientName}</td>
                    <td>{patient.age} Yrs / {patient.gender}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {patient.chiefComplaint}
                    </td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                        {patient.remedy} {patient.potency !== 'N/A' && `(${patient.potency})`}
                      </span>
                    </td>
                    <td>{patient.followUp}</td>
                    <td>{new Date(patient.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => deletePatient(patient.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
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
      </div>

    </div>
  );
};

export default DailyRegister;
