import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDown, ArrowRight, BookOpen, CheckCircle2, ChevronDown, ClipboardList,
  Download, FileText, HelpCircle, Lightbulb, LockKeyhole, Search,
  ShieldCheck, Stethoscope, User, UserRoundPlus,
} from 'lucide-react';

const sections = [
  {
    id: 'overview', icon: BookOpen, title: 'Overview: your starting point',
    intro: 'The Overview is the home screen after login. It gives you shortcuts to the most common tasks and keeps the clinic workflow visible.',
    items: [
      ['Sidebar navigation', 'Use Overview, New Patient, Report Generation, Research Feed, My Profile, and User Guide to move between dashboard areas. The highlighted item shows your current screen.'],
      ['Manage Doctors (Super Admin)', 'Super Admins can review doctor accounts, approve or activate pending doctors, and manage dashboard access from this section.'],
      ['User Guide', 'Returns to this page whenever you need a reminder about the workflow or a button.'],
      ['Logout (top-right arrow)', 'Ends the current session and returns you to the login screen. Log out when you finish using a shared computer.'],
      ['New Patient', 'Opens the prescription screen so you can start a new consultation.'],
      ['Patient Log', 'Opens Report Generation, where you can review visits and create reports.'],
      ['Research Feed', 'Opens the clinical reading area with searchable articles and topic filters.'],
      ['Google / ChatGPT search', 'Type a question, choose an engine, and open the search in a new tab. Use Copy Query to copy the text without opening a search.'],
      ['Suggested prompts', 'Click a prompt to insert it into the search box; edit it before searching when needed.'],
    ],
  },
  {
    id: 'prescription', icon: Stethoscope, title: 'New Patient: create a prescription',
    intro: 'Use this screen during a consultation. Required fields are marked with an asterisk (*). A prescription is saved with the patient record when it is generated or shared.',
    steps: [
      'Search first if the patient has visited before. Enter the patient name and mobile number, then select Search Patient.',
      'When a match is found, select Auto-fill Form to bring the saved patient details into the form. If no match is found, continue as a new patient.',
      'Complete patient details, visit type, complaints, diagnosis, notes, remedy, potency, dosage, instructions, and follow-up days.',
      'Use Add remedy when more than one remedy is needed. Use the bin icon on a remedy row to remove an extra remedy.',
      'Choose the action that matches the next step: save to today’s list, download a PDF, send through WhatsApp, or prepare an email.',
    ],
    items: [
      ['Save to today’s list', 'Adds the visit to the current day register without creating a PDF.'],
      ['Download Prescription PDF', 'Creates a printable prescription using the clinic and signature details saved in My Profile.'],
      ['Send WhatsApp / Send Email', 'Creates a prescription PDF and opens the selected sharing or email flow. Confirm the recipient before sending.'],
      ['Clear Form', 'Resets the current form. Save anything important first because unsaved entries are removed.'],
      ['Search Patient', 'Looks up an existing patient using both name and mobile number.'],
      ['Auto-fill Form', 'Copies the matched patient information into the new visit form; review it before saving.'],
    ],
  },
  {
    id: 'reports', icon: ClipboardList, title: 'Report Generation: review and export records',
    intro: 'Reports are based on the selected date range. The list contains visit records for your account, and today’s list updates when a new visit is saved.',
    steps: [
      'Choose Today, This Week, This Month, This Year, or Custom Range. For Custom Range, select both dates and load the records.',
      'Use the search box to filter the visible list by patient details, complaint, diagnosis, remedy, phone, or visit type.',
      'Check the filtered list before exporting. The PDF includes only the records currently shown by the date filter and search.',
    ],
    items: [
      ['Reload', 'Fetches the latest records for the selected date range.'],
      ['Download PDF Report', 'Exports the currently filtered visit list as a clinic report. It is disabled when there are no records.'],
      ['Patient History PDF', 'Enter a patient name and mobile number to download all available visits for that patient in chronological order.'],
      ['History button on a row', 'Downloads the complete history for that specific patient, useful during follow-up consultations.'],
      ['Delete patient', 'Permanently removes that patient and their records after confirmation. Use only when deletion is intended.'],
      ['Delete Filtered Patients', 'Permanently removes all records in the current filter after confirmation. This cannot be undone.'],
    ],
  },
  {
    id: 'research', icon: BookOpen, title: 'Research Feed: find a reference quickly',
    intro: 'Research Feed contains the clinic’s curated clinical notes and remedy references. It is a reading and reference tool inside the dashboard.',
    items: [
      ['Topic filters', 'Choose All, Case Taking, Miasmatic Analysis, Remedy Profile, or Clinical Method to narrow the cards.'],
      ['Search research feed', 'Searches article titles and summaries as you type.'],
      ['Read Article', 'Opens the full article in a dialog. Select Close or click outside the dialog to return to the feed.'],
    ],
  },
  {
    id: 'profile', icon: User, title: 'My Profile: keep clinic details correct',
    intro: 'Information here appears on generated prescriptions and reports. Update it whenever your clinic or professional details change.',
    items: [
      ['Choose Image', 'Selects a PNG or JPEG signature image up to 500 KB. The image is only applied after saving the profile.'],
      ['Save Profile Details', 'Updates your name, qualification, clinic name/address, phone, license number, and prescription signature.'],
      ['Renew Plan', 'Opens the payment page for renewing a doctor plan when access is close to expiry or expired.'],
      ['Change Password', 'Verifies your current password, then saves the new password after both new-password fields match.'],
    ],
  },
];

const UserGuide = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/doctor';
  const [openSections, setOpenSections] = useState(() => new Set(['prescription']));

  const toggleSection = (id) => {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="dashboard-page user-guide-page">
      <motion.section className="user-guide-hero" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="user-guide-hero-copy">
          <span className="user-guide-eyebrow"><HelpCircle size={15} /> Doctor dashboard help centre</span>
          <h2>Use the clinic system with confidence</h2>
          <p>Follow the simple flow below to record a consultation, generate a prescription, and keep patient reports organised.</p>
          <Link to={`${basePath}/new-patient`} className="btn btn-primary btn-sm"><Stethoscope size={15} /> Start a prescription <ArrowRight size={14} /></Link>
        </div>
        <div className="user-guide-hero-mark"><ShieldCheck size={46} /><span>Private clinic workspace</span></div>
      </motion.section>

      <section className="user-guide-system-flow" aria-labelledby="system-flow-title">
        <div className="user-guide-system-heading">
          <span className="user-guide-flow-kicker"><Lightbulb size={15} /> Start here</span>
          <h3 id="system-flow-title">How the clinic system works</h3>
          <p>Follow this order for almost every patient visit.</p>
        </div>
        <div className="user-guide-system-steps">
          {[
            [1, UserRoundPlus, 'Patient', 'Find or add'],
            [2, FileText, 'Consultation', 'Enter details'],
            [3, CheckCircle2, 'Prescription', 'Save or share'],
            [4, ClipboardList, 'Records', 'Review reports'],
            [5, Search, 'Follow-up', 'Use history'],
          ].map(([number, Icon, title, caption]) => (
            <div className="user-guide-system-step" key={number}>
              <span>{number}</span><Icon size={18} /><strong>{title}</strong><small>{caption}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="user-guide-day-flow" aria-labelledby="day-flow-title">
        <div className="user-guide-day-flow-heading">
          <div><span className="user-guide-flow-kicker"><Lightbulb size={15} /> Recommended day flow</span><h3 id="day-flow-title">One visit, from start to finish</h3></div>
          <p>Complete each step in order. You can return to the previous step whenever you need to correct something.</p>
        </div>
        <div className="user-guide-waterfall">
          {[
            [1, UserRoundPlus, 'Open New Patient', 'Start a new consultation from the dashboard. Search by patient name and mobile number first.'],
            [2, FileText, 'Check or enter patient details', 'Auto-fill an existing patient, or enter the details as a new patient. Then record the complaint, diagnosis, notes, remedy, dosage, and follow-up.'],
            [3, CheckCircle2, 'Save the visit', 'Save to today’s list so the visit is stored in the day register. Add another remedy if the prescription needs more than one.'],
            [4, Download, 'Give the prescription to the patient', 'Download a PDF, or send it through WhatsApp or email. Verify the patient name and mobile number before sharing.'],
            [5, ClipboardList, 'Review the day and plan follow-up', 'Open Report Generation to check visits, download a report, or open a patient’s complete history for the next consultation.'],
          ].map(([number, Icon, title, description], index, flow) => (
            <div className="user-guide-waterfall-step" key={number}>
              <div className="user-guide-waterfall-marker"><span>{number}</span>{index < flow.length - 1 && <ArrowDown size={16} />}</div>
              <div><strong><Icon size={15} /> {title}</strong><p>{description}</p></div>
            </div>
          ))}
        </div>
      </section>

      <div className="user-guide-note"><LockKeyhole size={17} /><span><strong>Privacy reminder:</strong> Always verify the patient name and mobile number before auto-filling, exporting, or sharing a prescription.</span></div>

      <div className="user-guide-layout">
        <aside className="user-guide-contents card">
          <div className="user-guide-card-heading"><BookOpen size={17} /> On this page</div>
          {sections.map(({ id, title }) => <button key={id} onClick={() => { setOpenSections(new Set([id])); document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="user-guide-jump">{title}<ArrowRight size={13} /></button>)}
        </aside>
        <div className="user-guide-sections">
          {sections.map(({ id, icon: Icon, title, intro, steps, items }) => {
            const isOpen = openSections.has(id);
            return <section className={`user-guide-section card ${isOpen ? 'is-open' : ''}`} id={`guide-${id}`} key={id}>
              <button className="user-guide-section-toggle" onClick={() => toggleSection(id)} aria-expanded={isOpen}>
                <span className="user-guide-section-icon"><Icon size={19} /></span><span><small>Dashboard area</small><strong>{title}</strong></span><ChevronDown size={19} className="user-guide-chevron" />
              </button>
              {isOpen && <div className="user-guide-section-body"><p className="user-guide-intro">{intro}</p>{steps && <ol className="user-guide-steps">{steps.map((step, index) => <li key={index}>{step}</li>)}</ol>}<div className="user-guide-actions">{items.map(([label, explanation]) => <div className="user-guide-action" key={label}><div><strong>{label}</strong><p>{explanation}</p></div></div>)}</div></div>}
            </section>;
          })}
        </div>
      </div>

      <section className="user-guide-footer card"><div className="user-guide-footer-icon"><Search size={21} /></div><div><h3>Need a quick answer?</h3><p>Use the sidebar to return to the relevant screen. Your dashboard keeps the main workflow one click away.</p></div><Link to={basePath} className="btn btn-ghost btn-sm">Back to Overview</Link></section>
    </div>
  );
};

export default UserGuide;
