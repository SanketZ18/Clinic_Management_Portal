import { jsPDF } from 'jspdf';

const A4 = {
  width: 210,
  height: 297,
};

const COLORS = {
  primary: [15, 46, 91],
  primaryDark: [10, 28, 64],
  primaryLight: [235, 243, 255],
  accent: [246, 160, 35],
  accentLight: [255, 244, 221],
  line: [203, 213, 225],
  text: [15, 23, 42],
  muted: [100, 116, 139],
  white: [255, 255, 255],
};

const DEFAULTS = {
  clinicName: 'Sample Homeopathy Clinic',
  doctorName: 'Dr. Sample Doctor',
  qualification: 'BHMS',
  licenseNumber: 'N/A',
  clinicAddress: 'Clinic address not available',
  phone: 'N/A',
  email: 'N/A',
};

const TODAY_PATIENTS_BASE_KEY = 'todayPatients';

const toText = (value, fallback = 'N/A') => {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
};

const fileSafe = (value) =>
  toText(value, 'document')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'document';

const getDoctorScopeSeed = (doctor) =>
  doctor?.doctorId || doctor?.email || doctor?.fullName || doctor?.id || 'guest';

export const getTodayPatientsStorageKey = (doctor) =>
  `${TODAY_PATIENTS_BASE_KEY}:${fileSafe(getDoctorScopeSeed(doctor))}`;

const readStoredPatients = (storageKey) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return [];

  try {
    const stored = window.sessionStorage.getItem(storageKey) || window.localStorage?.getItem(storageKey) || '[]';
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Could not read patient register:', error);
    return [];
  }
};

const writeStoredPatients = (storageKey, patients) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(patients));
  } catch (_) {}
};

const formatDate = (value = new Date(), options) =>
  new Intl.DateTimeFormat('en-IN', options).format(new Date(value));

const formatTime = (value = new Date()) =>
  new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

const formatFollowUp = (formData) => {
  if (formData?.nextVisitDate) {
    return formatDate(formData.nextVisitDate, { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (formData?.followUpDays) {
    return `${toText(formData.followUpDays)} Days`;
  }

  return 'N/A';
};

const getPrimaryRemedy = (remedies) =>
  Array.isArray(remedies) ? remedies.find((item) => toText(item?.remedyName, '').trim()) : null;

const getPatientBloodGroup = (formData) => toText(formData?.bloodGroup, 'N/A');

const formatRemedySummary = (remedy) => {
  if (!remedy) return '';

  return [
    toText(remedy.remedyName, ''),
    remedy.potency && toText(remedy.potency, 'N/A') !== 'N/A' ? `(${toText(remedy.potency)})` : '',
    remedy.dose && toText(remedy.dose, 'N/A') !== 'N/A' ? toText(remedy.dose) : '',
    remedy.frequency && toText(remedy.frequency, 'N/A') !== 'N/A' ? toText(remedy.frequency) : '',
  ]
    .filter(Boolean)
    .join(' ');
};

export const formatMedicineNamesSummary = (remedies) => {
  if (!Array.isArray(remedies)) return 'N/A';

  const lines = remedies.map((remedy) => toText(remedy?.remedyName, '')).filter((line) => line.trim());
  return lines.length ? lines.join('\n') : 'N/A';
};

const formatMedicineDetailsSummary = (remedies) => {
  if (!Array.isArray(remedies)) return 'N/A';

  const lines = remedies.map((remedy) => formatRemedySummary(remedy)).filter((line) => line.trim());
  return lines.length ? lines.join('\n') : 'N/A';
};

const buildPrescriptionKey = (record) =>
  [
    record.patientName,
    record.age,
    record.gender,
    record.bloodGroup,
    record.phone,
    record.visitType,
    record.chiefComplaint,
    record.diagnosis,
    record.remedy,
    record.potency,
    record.dose,
    record.frequency,
    record.medicineNames,
    record.medicines,
    record.followUp,
    record.nextVisitDate,
  ]
    .map((value) => toText(value).toLowerCase())
    .join('|');

const buildTodayPatientRecord = ({ doctor, formData, issuedAt = new Date(), source = 'prescription' }) => {
  const now = new Date(issuedAt);
  const remedies = Array.isArray(formData?.remedies)
    ? formData.remedies
        .map((item) => ({
          remedyName: toText(item?.remedyName, ''),
          potency: toText(item?.potency, ''),
          dose: toText(item?.dose, ''),
          frequency: toText(item?.frequency, ''),
        }))
        .filter((item) => item.remedyName)
    : [];
  const primaryRemedy = getPrimaryRemedy(remedies);
  const medicineNames = formatMedicineNamesSummary(remedies);
  const medicineDetails = formatMedicineDetailsSummary(remedies);
  const doctorScopeKey = getDoctorScopeSeed(doctor);
  const record = {
    id: `${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`,
    dateString: now.toDateString(),
    patientName: toText(formData?.patientName, 'N/A'),
    age: toText(formData?.age, 'N/A'),
    gender: toText(formData?.gender, 'N/A'),
    bloodGroup: getPatientBloodGroup(formData),
    phone: toText(formData?.phone, 'N/A'),
    email: toText(formData?.email, 'N/A'),
    visitType: toText(formData?.visitType, 'New'),
    referredBy: toText(formData?.referredBy, 'N/A'),
    chiefComplaint: toText(formData?.chiefComplaint, 'Consultation'),
    diagnosis: toText(formData?.diagnosis, 'N/A'),
    remedy: toText(primaryRemedy?.remedyName || formData?.remedies?.[0]?.remedyName, 'N/A'),
    potency: toText(primaryRemedy?.potency || formData?.remedies?.[0]?.potency, 'N/A'),
    dose: toText(primaryRemedy?.dose || formData?.remedies?.[0]?.dose, 'N/A'),
    frequency: toText(primaryRemedy?.frequency || formData?.remedies?.[0]?.frequency, 'N/A'),
    remedies,
    medicineNames,
    medicineDetails,
    medicines: medicineNames,
    followUp: formatFollowUp(formData),
    nextVisitDate: toText(formData?.nextVisitDate ? formatDate(formData.nextVisitDate, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'),
    createdAt: now.toISOString(),
    prescriptionDate: now.toISOString(),
    doctorId: doctor?.doctorId || doctor?.id || '',
    doctorName: toText(doctor?.fullName || doctor?.doctorName, DEFAULTS.doctorName),
    clinicName: toText(doctor?.clinicName, DEFAULTS.clinicName),
    clinicAddress: toText(doctor?.clinicAddress, DEFAULTS.clinicAddress),
    doctorScopeKey: fileSafe(doctorScopeKey),
    source,
  };

  record.prescriptionKey = buildPrescriptionKey(record);
  return record;
};

export const registerTodayPatient = ({ doctor, formData, issuedAt = new Date(), source = 'prescription' }) => {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  try {
    const record = buildTodayPatientRecord({ doctor, formData, issuedAt, source });
    const storageKey = getTodayPatientsStorageKey(doctor);
    const existing = readStoredPatients(storageKey);
    const nextList = [
      record,
      ...existing.filter(
        (item) => !(item?.dateString === record.dateString && item?.prescriptionKey === record.prescriptionKey)
      ),
    ];

    writeStoredPatients(storageKey, nextList);
    window.dispatchEvent(new CustomEvent('today-patients-updated', { detail: { record, storageKey } }));
    return record;
  } catch (error) {
    console.error('Could not register prescription for day report:', error);
    return null;
  }
};

export const getTodayPatientsForDoctor = (doctor, { dateString = new Date().toDateString() } = {}) =>
  readStoredPatients(getTodayPatientsStorageKey(doctor)).filter((patient) => patient?.dateString === dateString);

export const setTodayPatientsForDoctor = (doctor, patients) =>
  writeStoredPatients(getTodayPatientsStorageKey(doctor), patients);

export const removeTodayPatientForDoctor = (doctor, patientId) => {
  const storageKey = getTodayPatientsStorageKey(doctor);
  const nextPatients = readStoredPatients(storageKey).filter((patient) => patient?.id !== patientId);
  writeStoredPatients(storageKey, nextPatients);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.dispatchEvent(new CustomEvent('today-patients-updated', { detail: { storageKey } }));
  }
  return nextPatients;
};

export const clearTodayPatientsForDoctor = (doctor, dateString = new Date().toDateString()) => {
  const storageKey = getTodayPatientsStorageKey(doctor);
  const nextPatients = readStoredPatients(storageKey).filter((patient) => patient?.dateString !== dateString);
  writeStoredPatients(storageKey, nextPatients);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.dispatchEvent(new CustomEvent('today-patients-updated', { detail: { storageKey } }));
  }
  return nextPatients;
};

const detectImageFormat = (imageData) => {
  if (typeof imageData !== 'string') return 'PNG';
  if (imageData.startsWith('data:image/jpeg')) return 'JPEG';
  if (imageData.startsWith('data:image/jpg')) return 'JPEG';
  if (imageData.startsWith('data:image/webp')) return 'WEBP';
  return 'PNG';
};

const addSectionTitle = (doc, title, x, y, width) => {
  doc.setFillColor(...COLORS.primaryLight);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, y, width, 8, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.primaryDark);
  doc.setFontSize(9.2);
  doc.text(title, x + 3, y + 5.3);
};

const addLabelValue = (doc, label, value, x, y, width, valueOptions = {}) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${label}:`, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const maxWidth = valueOptions.align === 'right' ? width : width - 18;
  const lines = doc.splitTextToSize(toText(value), maxWidth);
  if (valueOptions.align === 'right') {
    const textWidth = Math.min(doc.getTextWidth(lines[0] || ''), maxWidth);
    doc.text(lines, x + maxWidth - textWidth, y);
  } else {
    doc.text(lines, x + 18, y);
  }
  return y + Math.max(4.2, lines.length * 4.2);
};

const addSignatureArea = (doc, doctor, y, pageWidth = A4.width) => {
  const x = pageWidth - 68;
  const signatureWidth = 52;
  const signatureHeight = 20;

  doc.setDrawColor(...COLORS.line);
  doc.line(x, y + signatureHeight, x + signatureWidth, y + signatureHeight);

  if (doctor?.signatureBase64) {
    try {
      doc.addImage(
        doctor.signatureBase64,
        detectImageFormat(doctor.signatureBase64),
        x + 1,
        y,
        signatureWidth - 2,
        signatureHeight - 2,
        undefined,
        'FAST'
      );
    } catch (error) {
      // Keep the signature line if the image format cannot be embedded.
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.text);
  doc.text(toText(doctor?.fullName, DEFAULTS.doctorName), x + signatureWidth / 2, y + signatureHeight + 5, {
    align: 'center',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Authorized Signature', x + signatureWidth / 2, y + signatureHeight + 9, {
    align: 'center',
  });
};

const addClinicIdentityHeader = (doc, doctor) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(12, 12, 18, 18, 3, 3, 'F');

  doc.setFillColor(...COLORS.white);
  doc.rect(19.5, 15.5, 3, 11, 'F');
  doc.rect(15.5, 19.5, 11, 3, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.text(toText(doctor?.clinicName, DEFAULTS.clinicName), 33, 16.5);

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.text(toText(doctor?.doctorName || doctor?.fullName, DEFAULTS.doctorName), 33, 21.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `${toText(doctor?.qualification, DEFAULTS.qualification)} | Reg No: ${toText(doctor?.licenseNumber, DEFAULTS.licenseNumber)}`,
    33,
    25.2
  );

  doc.text(toText(doctor?.clinicAddress, DEFAULTS.clinicAddress), 33, 29);
  doc.text(
    `Phone: ${toText(doctor?.phone, DEFAULTS.phone)}  |  Email: ${toText(doctor?.email, DEFAULTS.email)}`,
    33,
    32.8
  );

  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.3);
  doc.line(12, 36.5, pageWidth - 12, 36.5);
};

const addReportHeader = (doc, doctor, title, subtitle, meta = {}) => {
  addClinicIdentityHeader(doc, doctor);

  const reportCardX = 142;
  const reportCardY = 11.5;
  const reportCardWidth = 56;
  const reportCardHeight = 21.5;

  doc.setFillColor(...COLORS.primaryDark);
  doc.roundedRect(reportCardX, reportCardY, reportCardWidth, reportCardHeight, 4, 4, 'F');

  doc.setFillColor(...COLORS.accent);
  doc.roundedRect(reportCardX + 4, reportCardY + 4, 20, 5.5, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.white);
  doc.text('SESSION SUMMARY', reportCardX + 14, reportCardY + 8.2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.2);
  doc.text(title, reportCardX + reportCardWidth - 4, reportCardY + 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.9);
  doc.text(subtitle, reportCardX + reportCardWidth - 4, reportCardY + 18.2, { align: 'right' });
  doc.text(`Date: ${meta.dateText || formatDate(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric' })}`, reportCardX + reportCardWidth - 4, reportCardY + 21.8, {
    align: 'right',
  });
};

const drawRoundedStat = (doc, x, y, width, label, value, accentColor) => {
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(x, y, width, 30, 5, 5, 'FD');

  doc.setFillColor(...accentColor);
  doc.roundedRect(x + 4, y + 4, 24, 8, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(...COLORS.white);
  doc.text(label, x + 16, y + 9.4, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.text);
  doc.text(toText(value, '0'), x + 6, y + 24);
};

const addFooter = (doc, doctor, y, note) => {
  doc.setDrawColor(...COLORS.line);
  doc.line(12, y, A4.width - 12, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  doc.setTextColor(...COLORS.muted);
  doc.text(note, 12, y + 5);

  addSignatureArea(doc, doctor, y + 2);
};

const addPrescriptionHeader = (doc, doctor) => {
  addClinicIdentityHeader(doc, doctor);
};

export const buildPrescriptionPdf = ({ doctor, formData, issuedAt = new Date() }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const clinic = {
    clinicName: doctor?.clinicName || DEFAULTS.clinicName,
    doctorName: doctor?.fullName || DEFAULTS.doctorName,
    fullName: doctor?.fullName || DEFAULTS.doctorName,
    qualification: doctor?.qualification || DEFAULTS.qualification,
    licenseNumber: doctor?.licenseNumber || DEFAULTS.licenseNumber,
    clinicAddress: doctor?.clinicAddress || DEFAULTS.clinicAddress,
    phone: doctor?.phone || DEFAULTS.phone,
    email: doctor?.email || DEFAULTS.email,
  };

  const patientName = toText(formData?.patientName, 'Patient');
  const filename = `Prescription_${fileSafe(patientName)}_${formatDate(issuedAt, { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\s/g, '_')}.pdf`;
  const remedies = Array.isArray(formData?.remedies)
    ? formData.remedies.filter((item) => toText(item?.remedyName, '').trim())
    : [];

  // Add the custom white header with logo, address, license, phone and email
  addPrescriptionHeader(doc, clinic);

  // Patient details block (starting at Y = 42)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  doc.text(`Patient: ${patientName}`, 12, 43);

  // Date on the right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  const dateStr = formatDate(issuedAt, { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Date: ${dateStr}`, 198, 43, { align: 'right' });

  // Age, Sex, Phone
  const ageSexPhone = `Age: ${toText(formData?.age)}  |  Gender: ${toText(formData?.gender)}  |  Phone: ${toText(formData?.phone)}`;
  doc.text(ageSexPhone, 12, 48);
  doc.text(`Blood Group: ${getPatientBloodGroup(formData)}`, 12, 52.2);

  // Follow-up on the right
  const nextVisitText = formData?.nextVisitDate
    ? formatDate(formData.nextVisitDate, { day: '2-digit', month: '2-digit', year: 'numeric' })
    : formData?.followUpDays
    ? `${formData.followUpDays} days`
    : 'N/A';
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent); // Orange/brown color
  doc.text(`Follow Up: ${nextVisitText}`, 198, 48, { align: 'right' });

  // Symptoms and Diagnosis light grey card block (Y = 56 to 74)
  doc.setFillColor(248, 250, 252); // slate 50 (very light grey)
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.2);
  doc.roundedRect(12, 56, 186, 18, 3, 3, 'FD');

  // Text inside the complaints/diagnosis box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.text);
  doc.text(`Complaints: ${toText(formData?.chiefComplaint)}`, 16, 61.5);

  doc.setFont('helvetica', 'bold');
  doc.text(`Diagnosis: ${toText(formData?.diagnosis)}`, 16, 68);

  // Rx Symbol
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.primaryLight);
  doc.text('Rx', 12, 83);

  // Table setup immediately below Rx symbol
  const tableTop = 88;
  const columns = [
    { label: 'Medicine', width: 62 },
    { label: 'Potency', width: 24 },
    { label: 'Dose', width: 28 },
    { label: 'Instructions', width: 72 },
  ];
  const startX = 12;
  const drawMedicineTableHeader = (headerY) => {
    const totalWidth = columns.reduce((sum, column) => sum + column.width, 0);
    let x = startX;

    doc.setFillColor(...COLORS.primaryDark);
    doc.rect(startX, headerY, totalWidth, 12.2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.rect(startX, headerY, totalWidth, 12.2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    columns.forEach((column, index) => {
      if (index > 0) {
        doc.line(x, headerY, x, headerY + 12.2);
      }
      doc.setTextColor(...COLORS.white);
      doc.text(column.label, x + column.width / 2, headerY + 7.7, { align: 'center' });
      x += column.width;
    });
  };

  const rowX = startX;
  let rowY = tableTop + 12.2;
  drawMedicineTableHeader(tableTop);

  const drawMedicineRow = (rowValues) => {
    const cellLines = rowValues.map((value, index) => doc.splitTextToSize(value, columns[index].width - 4));
    const rowHeight = Math.max(13, ...cellLines.map((lines) => lines.length * 5.2)) + 2;

    let cellX = rowX;
    doc.setDrawColor(...COLORS.line);
    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.1);
    cellLines.forEach((lines, cellIndex) => {
      const width = columns[cellIndex].width;
      doc.rect(cellX, rowY, width, rowHeight);
      doc.text(lines, cellX + 2, rowY + 5.8);
      cellX += width;
    });

    rowY += rowHeight;
  };

  if (remedies.length === 0) {
    doc.setTextColor(...COLORS.muted);
    doc.setFont('helvetica', 'italic');
    doc.text('No remedies added yet.', startX + 2, rowY + 6);
    rowY += 10;
  } else {
    remedies.forEach((remedy, index) => {
      const rowValues = [
        toText(remedy.remedyName, 'N/A'),
        toText(remedy.potency, 'N/A'),
        toText(remedy.dose, 'N/A'),
        toText(remedy.frequency, 'N/A'),
      ];

      if (rowY + 18 > 248) {
        doc.addPage();
        addPrescriptionHeader(doc, clinic);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...COLORS.text);
        doc.text(`Patient: ${patientName}`, 12, 43);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.muted);
        doc.text(`Date: ${dateStr}`, 198, 43, { align: 'right' });
        doc.text(ageSexPhone, 12, 48);
        doc.text(`Blood Group: ${getPatientBloodGroup(formData)}`, 12, 52.2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.accent);
        doc.text(`Follow Up: ${nextVisitText}`, 198, 48, { align: 'right' });
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(...COLORS.line);
        doc.setLineWidth(0.2);
        doc.roundedRect(12, 56, 186, 18, 3, 3, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...COLORS.text);
        doc.text(`Complaints: ${toText(formData?.chiefComplaint)}`, 16, 61.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`Diagnosis: ${toText(formData?.diagnosis)}`, 16, 68);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(...COLORS.primaryLight);
        doc.text('Rx', 12, 83);
        drawMedicineTableHeader(tableTop);
        rowY = tableTop + 12.2;
      }

      drawMedicineRow(rowValues);
    });
  }

  const noteY = Math.max(rowY + 8, 220);
  
  // Thin line separator above notes
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.2);
  doc.line(12, noteY, 198, noteY);

  let currentY = noteY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.text);
  doc.text('Notes:', 12, currentY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.muted);
  const noteLines = doc.splitTextToSize(formData.doctorNotes || 'No notes provided.', 170);
  doc.text(noteLines, 25, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Generated on ${formatDate(issuedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })} at ${formatTime(issuedAt)}`, 12, 262);
  doc.text(`${clinic.phone} | ${clinic.email}`, 12, 267);
  addSignatureArea(doc, doctor, 250);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.9);
  doc.text('Homoeopathic prescription - not a substitute for emergency care.', 12, 286);

  const blob = doc.output('blob');
  const shareText = [
    `${clinic.clinicName}`,
    `Doctor: ${clinic.doctorName}`,
    `Patient: ${patientName}`,
    `Age/Sex: ${toText(formData?.age)} / ${toText(formData?.gender)}`,
    `Blood Group: ${getPatientBloodGroup(formData)}`,
    `Complaint: ${toText(formData?.chiefComplaint)}`,
    `Diagnosis: ${toText(formData?.diagnosis)}`,
    `Rx: ${remedies.length ? remedies.map((item) => `${toText(item.remedyName)} ${toText(item.potency)} - ${toText(item.dose)} - ${toText(item.frequency)}`).join('; ') : 'N/A'}`,
    `Follow-up: ${toText(formData?.followUpDays, '7')} days`,
  ].join('\n');

  return { doc, blob, filename, shareText };
};

const REPORT_COLORS = {
  primary: [30, 94, 63],
  primaryDark: [20, 64, 43],
  primaryLight: [237, 245, 240],
  accent: [245, 158, 11],
  accentLight: [255, 247, 235],
  line: [216, 225, 218],
  text: [17, 24, 39],
  muted: [88, 101, 94],
  white: [255, 255, 255],
  soft: [248, 250, 248],
};

const drawReportHeader = (doc, clinic, title, subtitle, meta = {}) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerX = 12;
  const headerY = 12;
  const headerWidth = pageWidth - 24;
  const headerHeight = 31;
  const reportCardWidth = Math.min(72, headerWidth * 0.28);
  const reportCardX = headerX + headerWidth - reportCardWidth;

  doc.setFillColor(...REPORT_COLORS.primaryDark);
  doc.roundedRect(headerX, headerY, headerWidth, headerHeight, 5, 5, 'F');

  doc.setFillColor(...REPORT_COLORS.white);
  doc.roundedRect(headerX + 6, headerY + 6, 18, 18, 3, 3, 'F');
  doc.setFillColor(...REPORT_COLORS.primaryDark);
  doc.rect(headerX + 13, headerY + 9, 4, 12, 'F');
  doc.rect(headerX + 9, headerY + 13, 12, 4, 'F');

  doc.setTextColor(...REPORT_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.8);
  doc.text(toText(clinic?.clinicName, DEFAULTS.clinicName), headerX + 28, headerY + 11.5);

  doc.setFontSize(8.8);
  doc.setFont('helvetica', 'normal');
  doc.text(title, headerX + 28, headerY + 17.1);

  doc.setFontSize(7.4);
  doc.setTextColor(232, 241, 235);
  doc.text(toText(clinic?.clinicAddress, DEFAULTS.clinicAddress), headerX + 28, headerY + 22);

  doc.setTextColor(...REPORT_COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.2);
  doc.text(toText(clinic?.doctorName, DEFAULTS.doctorName), headerX + headerWidth - 6, headerY + 10.2, {
    align: 'right',
  });

  doc.setFontSize(7.8);
  doc.setFont('helvetica', 'normal');
  doc.text(toText(clinic?.qualification, DEFAULTS.qualification), headerX + headerWidth - 6, headerY + 15.2, {
    align: 'right',
  });
  doc.text(`Reg No: ${toText(clinic?.licenseNumber, DEFAULTS.licenseNumber)}`, headerX + headerWidth - 6, headerY + 19.8, {
    align: 'right',
  });
  doc.text(`Phone: ${toText(clinic?.phone, DEFAULTS.phone)}`, headerX + headerWidth - 6, headerY + 24.4, {
    align: 'right',
  });
  doc.text(`Date: ${meta.dateText || formatDate(new Date(), { day: '2-digit', month: '2-digit', year: 'numeric' })}`, headerX + headerWidth - 6, headerY + 29, {
    align: 'right',
  });
};

const drawReportSummary = (doc, reportDate, stats, periodText) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const summaryX = 12;
  const summaryY = 46;
  const summaryWidth = pageWidth - 24;
  const summaryHeight = 12.2;

  doc.setFillColor(...REPORT_COLORS.white);
  doc.setDrawColor(...REPORT_COLORS.line);
  doc.roundedRect(summaryX, summaryY, summaryWidth, summaryHeight, 4, 4, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.6);
  doc.setTextColor(...REPORT_COLORS.text);

  const periodDisplay = periodText ? `Period: ${periodText}` : `Generated: ${formatDate(reportDate, { day: '2-digit', month: 'numeric', year: 'numeric' })}`;
  const totalText = `Total patients: ${stats.total}`;
  const visitText = `New: ${stats.newCases}  •  Follow Up: ${stats.followUps}  •  Regular: ${stats.regularVisits}`;

  doc.text(periodDisplay, summaryX + 4, summaryY + 7.8);
  doc.text(totalText, summaryX + summaryWidth / 2, summaryY + 7.8, { align: 'center' });
  doc.text(visitText, summaryX + summaryWidth - 4, summaryY + 7.8, { align: 'right' });
};

const drawReportTableHeader = (doc, columns, headerY) => {
  const tableLeft = 8;
  let x = tableLeft;
  doc.setDrawColor(...REPORT_COLORS.line);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.9);

  columns.forEach((column) => {
    doc.setFillColor(...REPORT_COLORS.primary);
    doc.setTextColor(...REPORT_COLORS.white);
    doc.rect(x, headerY, column.width, 11.8, 'F');
    doc.rect(x, headerY, column.width, 11.8, 'S');
    doc.text(column.label, x + column.width / 2, headerY + 7.4, { align: 'center' });
    x += column.width;
  });
};

const drawReportRow = (doc, patient, rowIndex, rowY, columns, reportDate) => {
  const medicineNamesText = (() => {
    const storedNames = toText(patient.medicineNames, '').trim();
    if (storedNames && storedNames !== 'N/A') return storedNames;

    const derivedNames = formatMedicineNamesSummary(patient.remedies);
    if (derivedNames && derivedNames !== 'N/A') return derivedNames;

    return toText(patient.remedy || patient.medicines, '-');
  })();
  const cells = [
    String(rowIndex + 1),
    toText(patient.patientName, 'N/A'),
    toText(patient.age, '-'),
    toText(patient.gender, '-'),
    toText(patient.phone, 'N/A'),
    toText(patient.visitType, 'New'),
    toText(patient.referredBy, '-'),
    toText(patient.chiefComplaint, '-'),
    medicineNamesText,
    toText(patient.nextVisitDate, patient.followUp || '-'),
  ];

  const tableLeft = 8;
  const cellLines = cells.map((cell, index) => doc.splitTextToSize(cell, columns[index].width - 3));
  const rowHeight = Math.max(11.6, ...cellLines.map((lines) => lines.length * 4)) + 2;
  let x = tableLeft;

  doc.setDrawColor(...REPORT_COLORS.line);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.4);
  const fillColor = rowIndex % 2 === 0 ? REPORT_COLORS.white : REPORT_COLORS.soft;

  cellLines.forEach((lines, index) => {
    const width = columns[index].width;
    doc.setFillColor(...fillColor);
    doc.rect(x, rowY, width, rowHeight, 'FD');
    doc.setTextColor(...REPORT_COLORS.text);
    doc.text(lines, x + 1.2, rowY + 4.4);
    x += width;
  });

  return rowHeight;
};

const drawReportEmptyState = (doc, y) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...REPORT_COLORS.primaryLight);
  doc.setDrawColor(...REPORT_COLORS.line);
  doc.roundedRect(12, y, pageWidth - 24, 18, 4, 4, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.4);
  doc.setTextColor(...REPORT_COLORS.primaryDark);
  doc.text('No patient records found for this period.', pageWidth / 2, y + 11.2, { align: 'center' });
};

export const buildDailyReportPdf = ({ doctor, patients = [], reportDate = new Date(), periodLabel, title = 'PATIENT REPORT' }) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const clinic = {
    clinicName: doctor?.clinicName || DEFAULTS.clinicName,
    doctorName: doctor?.fullName || DEFAULTS.doctorName,
    fullName: doctor?.fullName || DEFAULTS.doctorName,
    qualification: doctor?.qualification || DEFAULTS.qualification,
    licenseNumber: doctor?.licenseNumber || DEFAULTS.licenseNumber,
    clinicAddress: doctor?.clinicAddress || DEFAULTS.clinicAddress,
    phone: doctor?.phone || DEFAULTS.phone,
    email: doctor?.email || DEFAULTS.email,
  };

  const safeDate = formatDate(reportDate, { day: '2-digit', month: 'short', year: 'numeric' });
  const periodText = periodLabel || safeDate;
  const filename = `Report_${fileSafe(clinic.clinicName)}_${fileSafe(periodText)}.pdf`;
  const total = patients.length;
  const newCases = patients.filter((patient) => toText(patient.visitType, 'New').toLowerCase() === 'new').length;
  const followUps = patients.filter((patient) => {
    const vt = toText(patient.visitType, '').toLowerCase();
    return vt.includes('follow');
  }).length;
  const regularVisits = patients.filter((patient) => toText(patient.visitType, '').toLowerCase() === 'regular').length;

  const columns = [
    { label: 'Sr No.', width: 10 },
    { label: 'Patient Name', width: 46 },
    { label: 'Age', width: 11 },
    { label: 'Gender', width: 14 },
    { label: 'Phone Number', width: 30 },
    { label: 'Visit Type', width: 20 },
    { label: 'Referred By', width: 28 },
    { label: 'Symptoms', width: 58 },
    { label: 'Medicines', width: 30 },
    { label: 'Next Visit', width: 34 },
  ];

  const startPage = () => {
    drawReportHeader(doc, clinic, title.toUpperCase(), `Period: ${periodText}`, {
      dateText: safeDate,
    });
    drawReportSummary(doc, reportDate, { total, newCases, followUps, regularVisits }, periodText);
    drawReportTableHeader(doc, columns, 60);
  };

  startPage();

  const tableStartY = 71.5;
  const contentBottom = pageHeight - 12;
  let y = tableStartY;

  if (patients.length === 0) {
    drawReportEmptyState(doc, 80);
    y = 104;
  } else {
    patients.forEach((patient, index) => {
      const medicineNamesText = (() => {
        const storedNames = toText(patient.medicineNames, '').trim();
        if (storedNames && storedNames !== 'N/A') return storedNames;

        const derivedNames = formatMedicineNamesSummary(patient.remedies);
        if (derivedNames && derivedNames !== 'N/A') return derivedNames;

        return toText(patient.remedy || patient.medicines, '-');
      })();
      const rowHeight = Math.max(
        12,
        ...[
          String(index + 1),
          toText(patient.patientName, 'N/A'),
          toText(patient.age, '-'),
          toText(patient.gender, '-'),
          toText(patient.phone, 'N/A'),
          toText(patient.visitType, 'New'),
          toText(patient.referredBy, '-'),
          toText(patient.chiefComplaint, '-'),
          medicineNamesText,
          toText(patient.nextVisitDate, patient.followUp || '-'),
        ].map((cell, cellIndex) => doc.splitTextToSize(cell, columns[cellIndex].width - 3).length * 4)
      ) + 2;

      if (y + rowHeight > contentBottom) {
        doc.addPage();
        startPage();
        y = tableStartY;
      }

      y += drawReportRow(doc, patient, index, y, columns, reportDate);
    });
  }

  const shareText = [
    `Patient report for ${clinic.clinicName}`,
    `Period: ${periodText}`,
    `Total patients: ${total}`,
    `New cases: ${newCases}`,
    `Follow-ups: ${followUps}`,
    `Regular visits: ${regularVisits}`,
  ].join('\n');

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(...REPORT_COLORS.muted);
    doc.text(`Page ${page} of ${totalPages}`, pageWidth - 12, pageHeight - 4, { align: 'right' });
  }

  const blob = doc.output('blob');

  return { doc, blob, filename, shareText };
};

export const savePdf = (doc, filename) => {
  doc.save(filename);
};

export const trySharePdf = async ({ blob, filename, title, text }) => {
  if (!blob) return false;
  if (navigator.canShare && navigator.share) {
    const file = new File([blob], filename, { type: 'application/pdf' });
    if (navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text,
        files: [file],
      });
      return true;
    }
  }
  return false;
};

export const buildWhatsAppLink = (input) => {
  if (typeof input === 'string') {
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(input)}`;
  }

  const phone = input?.phone ? String(input.phone).replace(/[^0-9]/g, '') : '';
  const message = input?.message || '';

  if (phone) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
};

export const buildEmailLink = ({ to, subject, body }) =>
  `mailto:${to || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const buildPatientHistoryPdf = (doctor, historyData) => {
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

  drawHeader();

  const bandHeight = 30;
  doc.setFillColor(...COLORS.primaryLight);
  doc.setDrawColor(...COLORS.line);
  doc.roundedRect(margin, y, contentWidth, bandHeight, 3, 3, 'FD');

  const halfW = contentWidth / 2;
  const lx = margin + 5;
  const lv = margin + 32;
  const rx = margin + halfW + 5;
  const rv = margin + halfW + 28;
  const rowH = 6.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...COLORS.muted);
  doc.text('Name:',       lx, y + rowH);
  doc.text('Age/Gender:', lx, y + rowH * 2);
  doc.text('Blood Group:',lx, y + rowH * 3);
  doc.text('Phone:',      lx, y + rowH * 4);
  doc.text('Email:',      rx, y + rowH);
  doc.text('Address:',    rx, y + rowH * 2);

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

  const visits = historyData.prescriptions || [];
  visits.forEach((visit, idx) => {
    checkPage(50);

    doc.setFillColor(...COLORS.primaryDark);
    doc.roundedRect(margin, y, contentWidth, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...COLORS.white);
    const visitDateStr = visit.visitDate
      ? new Date(visit.visitDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'N/A';
    doc.text(`VISIT ${idx + 1}  —  ${visitDateStr}  (${text(visit.visitType, 'Consultation')})`, margin + 3, y + 6);
    y += 12;

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

    if (visit.remedies && visit.remedies.length > 0) {
      checkPage(30);
      const colWidths = [10, contentWidth * 0.35, contentWidth * 0.18, contentWidth * 0.18, contentWidth * 0.22];
      const colX = [margin, margin + colWidths[0], margin + colWidths[0] + colWidths[1],
        margin + colWidths[0] + colWidths[1] + colWidths[2],
        margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]];
      const headers = ['#', 'Remedy Name', 'Potency', 'Dose', 'Instructions'];

      doc.setFillColor(...COLORS.accent);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...COLORS.white);
      headers.forEach((h, i) => doc.text(h, colX[i] + 2, y + 4.8));
      y += 7;

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

    if (idx < visits.length - 1) {
      checkPage(8);
      doc.setDrawColor(...COLORS.line); doc.setLineWidth(0.4);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin, y, margin + contentWidth, y);
      doc.setLineDashPattern([], 0);
      y += 8;
    }
  });

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
    } catch (_) {}
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
