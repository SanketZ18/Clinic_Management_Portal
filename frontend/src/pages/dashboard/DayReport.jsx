import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FileText, Printer, Clipboard, Calendar, ArrowLeft, RefreshCw } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useNavigate } from 'react-router-dom';
import { formatMedicineNamesSummary, getTodayPatientsForDoctor } from '../../utils/clinicDocuments';

const DayReport = () => {
  const { doctor } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const reportRef = useRef(null);

  const loadPatients = () => {
    const todayPatients = getTodayPatientsForDoctor(doctor).slice().reverse();
    setPatients(todayPatients);
  };

  useEffect(() => {
    loadPatients();
  }, [doctor]);

  useEffect(() => {
    const handleUpdate = () => loadPatients();
    window.addEventListener('today-patients-updated', handleUpdate);
    return () => window.removeEventListener('today-patients-updated', handleUpdate);
  }, []);

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Daily_Report_${doctor?.clinicName || 'Clinic'}_${new Date().toLocaleDateString()}`
  });

  return (
    <div className="dashboard-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: 'none' }}>
      
      {/* Controls top */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/doctor/register')} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Back to Register
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={loadPatients} className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Reload Log
          </button>
          <button 
            onClick={handlePrint} 
            className="btn btn-primary btn-sm"
            disabled={patients.length === 0}
          >
            <Printer size={14} /> Print / Export PDF
          </button>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px 20px' }}>
          <Clipboard size={48} color="var(--border-mid)" style={{ margin: '0 auto 15px' }} />
          <h3>No Patient Records Available for Today</h3>
          <p style={{ maxWidth: '400px', margin: '8px auto 0', fontSize: '0.88rem' }}>
            Day report requires at least one registered patient session log for this doctor today. Please create one on the Patient Inquiry page first.
          </p>
        </div>
      ) : (
        /* Report Container with a frame to look like a sheet of paper */
        <div style={{ border: '1px solid #ddd', background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
          
          <div ref={reportRef} style={{ background: '#fff', padding: '40px', borderRadius: '8px', minHeight: '800px', border: '1px solid #ddd', fontFamily: 'var(--font-body)' }}>
            
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px double var(--primary)', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--dark)', fontSize: '1.4rem' }}>
                  {doctor?.clinicName || 'Anubhuti Homoeopathic Clinic'}
                </h2>
                <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {doctor?.fullName || 'Dr. Akaram Salunkhe'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {doctor?.qualification || 'BHMS, MD (Hom)'} | License Reg: {doctor?.licenseNumber || 'MCH/00000'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  📍 {doctor?.clinicAddress}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-green" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 5 }}>
                  DAILY SESSION LOG
                </span>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark)', marginTop: 8 }}>
                  Date: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Total Patients: {patients.length}
                </p>
              </div>
            </div>

            {/* Patients list table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--primary)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Sr.</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Patient Name</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Age/Gender</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Blood Group</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Chief Complaint</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Medicines</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Follow-up</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--dark)' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
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
                    <td style={{ padding: '10px', fontSize: '0.85rem', textAlign: 'right' }}>
                      {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer Summary / Signature */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #ccc', paddingTop: '15px', marginTop: '40px' }}>
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * This report is generated dynamically by Dr. Salunkhe's Digital Clinic Platform.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  * Patient details are preserved locally for session duration only.
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
