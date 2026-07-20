import api from './api';

/**
 * Search for a patient by name + phone within the authenticated doctor's scope.
 * Returns the patient data object if found, or null if not found.
 *
 * @param {{ patientName: string, phone: string }} params
 * @returns {Promise<object|null>} patient data or null
 */
export const searchPatient = async ({ patientName, phone }) => {
  const response = await api.post('/patients/search', { patientName, phone });
  return response.data.data || null; // null if not found
};

/**
 * Save a new prescription for a patient.
 * Backend creates new patient OR appends a prescription to the existing patient record.
 *
 * @param {object} formData — all patient + prescription fields
 * @returns {Promise<object>} saved patient data
 */
export const savePatientPrescription = async (formData) => {
  const payload = {
    patientName: formData.patientName,
    age: formData.age,
    gender: formData.gender,
    bloodGroup: formData.bloodGroup,
    phone: formData.phone,
    email: formData.email,
    address: formData.address,
    referredBy: formData.referredBy,
    visitType: formData.visitType,
    chiefComplaint: formData.chiefComplaint,
    diagnosis: formData.diagnosis,
    presentHistory: formData.presentHistory,
    pastHistory: formData.pastHistory,
    familyHistory: formData.familyHistory,
    appetite: formData.appetite,
    thirst: formData.thirst,
    thermal: formData.thermal,
    sleep: formData.sleep,
    stool: formData.stool,
    urine: formData.urine,
    perspiration: formData.perspiration,
    mentalGenerals: formData.mentalGenerals,
    worse: formData.worse,
    better: formData.better,
    characteristics: formData.characteristics,
    miasm: formData.miasm,
    rubrics: formData.rubrics || [],
    remedies: (formData.remedies || []).filter((r) => r.remedyName?.trim()),
    followUpDays: formData.followUpDays,
    nextVisitDate: formData.nextVisitDate,
    doctorNotes: formData.doctorNotes,
  };
  const response = await api.post('/patients/save', payload);
  return response.data.data;
};

/**
 * Get all patients for the authenticated doctor.
 *
 * @returns {Promise<object[]>} list of patients
 */
export const getAllPatients = async () => {
  const response = await api.get('/patients');
  return response.data.data || [];
};

/**
 * Get patients filtered by a date range. Returns only visits in the range.
 *
 * @param {{ from: string, to: string }} params — ISO date strings: "2026-07-01"
 * @returns {Promise<object[]>} filtered patient records
 */
export const getPatientsByDateRange = async ({ from, to }) => {
  const response = await api.get('/patients/by-date-range', { params: { from, to } });
  return response.data.data || [];
};

/**
 * Get full visit history for a single patient.
 *
 * @param {{ patientName: string, phone: string }} params
 * @returns {Promise<object>} patient history with all prescriptions sorted oldest→newest
 */
export const getPatientHistory = async ({ patientName, phone }) => {
  const response = await api.get('/patients/history', { params: { patientName, phone } });
  return response.data.data;
};
