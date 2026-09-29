import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;
declare const HSStaticMethods: any;

interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  rr: number;
  temp: number;
  gcs: number;
}

interface Injury {
  region: string;
  text: string;
  sev: string;
}

interface Lab {
  name: string;
  value: string;
  flag: string;
}

interface Radiology {
  name: string;
  result: string;
  status: string;
}

interface Med {
  name: string;
  dose: string;
  time: string;
}

interface NoteEntry {
  who: string;
  role: string;
  time: string;
  text: string;
}

interface TimelineEntry {
  stage: string;
  time: string;
  text: string;
}

interface TraumaCase {
  id: string;
  name: string;
  age: number;
  gender: string;
  blood: string;
  type: string;
  severity: string;
  priority: string;
  regions: string[];
  region: string;
  team: string;
  doctor: string;
  location: string;
  status: string;
  arrival: string;
  since: number;
  iss: number;
  stage: number;
  mtp: boolean;
  vitals: Vitals;
  injuries: Injury[];
  labs: Lab[];
  radiology: Radiology[];
  meds: Med[];
  notes: NoteEntry[];
  timeline: TimelineEntry[];
}

interface TeamMember {
  name: string;
  role: string;
  status: string;
  tone: string;
  pager: string;
}

interface DeptItem {
  name: string;
  icon: string;
  count: number;
  tone: string;
}

interface HourlyItem {
  label: string;
  n: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "trauma-cases".
 * Flagship trauma operations board: hero status rail, ring-gauge KPI
 * widgets, overview analytics, kanban priority board (drag/drop) and the
 * enterprise case registry. The case drawer and activation/transfer/
 * status/surgery modals from the source page are not present in this
 * ported HTML, so their handlers are wired defensively (no-op when the
 * target elements are missing) — everything else is a faithful port.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-trauma-cases',
  styleUrl: './trauma-cases.css',
  templateUrl: './trauma-cases.html',
})
export class TraumaCases implements AfterViewInit {
  private readonly STAGES = [
    { key: 'arrival', label: 'Arrival', icon: 'icon-ambulance' },
    { key: 'assessment', label: 'Assessment', icon: 'icon-stethoscope' },
    { key: 'ct', label: 'CT Scan', icon: 'icon-scan' },
    { key: 'blood', label: 'Blood Test', icon: 'icon-droplet' },
    { key: 'surgery', label: 'Surgery', icon: 'icon-scissors' },
    { key: 'recovery', label: 'Recovery', icon: 'icon-heart-pulse' },
    { key: 'icu', label: 'ICU', icon: 'icon-bed' },
    { key: 'discharge', label: 'Discharge', icon: 'icon-check' },
  ];

  private readonly SEVERITY: Record<string, { tone: string; badge: string; pips: number; color: string }> = {
    Critical: { tone: 'tone-critical', badge: 'badge-red', pips: 4, color: 'var(--tc-critical)' },
    Major: { tone: 'tone-high', badge: 'badge-amber', pips: 3, color: 'var(--tc-high)' },
    Moderate: { tone: 'tone-medium', badge: 'badge-yellow', pips: 2, color: 'var(--tc-medium)' },
    Minor: { tone: 'tone-stable', badge: 'badge-green', pips: 1, color: 'var(--tc-stable)' },
  };

  private readonly PRIORITY: Record<string, { tone: string; label: string }> = {
    Critical: { tone: 'tone-critical', label: 'Critical' },
    High: { tone: 'tone-high', label: 'High' },
    Medium: { tone: 'tone-medium', label: 'Medium' },
    Stable: { tone: 'tone-stable', label: 'Stable' },
  };

  private readonly STATUS_BADGE: Record<string, string> = {
    'In Resus': 'badge-red',
    'In CT': 'badge-purple',
    'In OR': 'badge-amber',
    'ICU Admit': 'badge-blue',
    Observation: 'badge-green',
    Discharged: 'badge-gray',
  };

  private readonly FLAG: Record<string, { chip: string; icon: string; label: string }> = {
    high: { chip: 'badge-red', icon: 'icon-arrow-up', label: 'High' },
    low: { chip: 'badge-amber', icon: 'icon-arrow-down', label: 'Low' },
    normal: { chip: 'badge-green', icon: 'icon-check', label: 'Normal' },
  };

  private readonly RAD_STATUS: Record<string, string> = { Complete: 'badge-green', 'In Progress': 'badge-amber', Pending: 'badge-gray' };

  private readonly LEVEL: Record<string, { label: string; name: string; team: number; blood: boolean }> = {
    '1': { label: 'Level 1', name: 'Full team, immediate', team: 9, blood: true },
    '2': { label: 'Level 2', name: 'Modified team', team: 5, blood: false },
    '3': { label: 'Consult', name: 'Trauma surgery review', team: 2, blood: false },
  };

  private readonly BLOOD_ONEG = 4;

  private readonly BODY_PARTS = [
    { key: 'head', d: 'M30 4 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0', label: 'Head' },
    { key: 'chest', d: 'M20 15 h20 v18 h-20 z', label: 'Chest' },
    { key: 'abdomen', d: 'M21 34 h18 v16 h-18 z', label: 'Abdomen' },
    { key: 'pelvis', d: 'M22 51 h16 v11 h-16 z', label: 'Pelvis' },
    { key: 'armR', d: 'M12 16 h7 v34 h-7 z', label: 'Right Arm' },
    { key: 'armL', d: 'M41 16 h7 v34 h-7 z', label: 'Left Arm' },
    { key: 'legR', d: 'M22 63 h7 v42 h-7 z', label: 'Right Leg' },
    { key: 'legL', d: 'M31 63 h7 v42 h-7 z', label: 'Left Leg' },
  ];

  private readonly TEAM: TeamMember[] = [
    { name: 'Dr. Thomas Rivas', role: 'Lead Surgeon', status: 'In OR', tone: 'tone-high', pager: 'x2041' },
    { name: 'Dr. Yusuf Karim', role: 'Emergency Physician', status: 'Available', tone: 'tone-stable', pager: 'x2043' },
    { name: 'Kendra Vasquez, RN', role: 'Trauma Nurse', status: 'In Resus', tone: 'tone-critical', pager: 'x2045' },
    { name: 'Dr. Ingrid Solberg', role: 'Radiologist', status: 'Available', tone: 'tone-stable', pager: 'x2048' },
    { name: 'Dr. Simone Lattimore', role: 'Anesthetist', status: 'In OR', tone: 'tone-high', pager: 'x2044' },
    { name: 'Dr. Marissa Bloom', role: 'Trauma Surgeon', status: 'In Resus', tone: 'tone-critical', pager: 'x2042' },
  ];

  private readonly DEPARTMENTS: DeptItem[] = [
    { name: 'Orthopedics', icon: 'icon-bone', count: 14, tone: 'tone-info' },
    { name: 'General Surgery', icon: 'icon-scissors', count: 11, tone: 'tone-critical' },
    { name: 'Neurosurgery', icon: 'icon-brain', count: 7, tone: 'tone-purple' },
    { name: 'Thoracic', icon: 'icon-heart-pulse', count: 6, tone: 'tone-high' },
    { name: 'Plastics', icon: 'icon-hand', count: 4, tone: 'tone-medium' },
    { name: 'Vascular', icon: 'icon-activity', count: 3, tone: 'tone-stable' },
  ];

  private readonly HOURLY: HourlyItem[] = [
    { label: '00', n: 3 }, { label: '02', n: 2 }, { label: '04', n: 1 },
    { label: '06', n: 4 }, { label: '08', n: 9 }, { label: '10', n: 7 },
    { label: '12', n: 6 }, { label: '14', n: 5 }, { label: '16', n: 8 },
    { label: '18', n: 11 }, { label: '20', n: 7 }, { label: '22', n: 5 },
  ];

  private readonly CASES: TraumaCase[] = [
    {
      id: 'TR-2026-0418', name: 'Unknown Male', age: 40, gender: 'Male', blood: 'O−',
      type: 'MVC — Restrained Driver', severity: 'Critical', priority: 'Critical',
      regions: ['chest', 'abdomen', 'legL'], region: 'Chest, Abdomen, Left Leg',
      team: 'Alpha', doctor: 'Dr. Thomas Rivas', location: 'OR 3', status: 'In OR',
      arrival: '09:12 AM', since: 38, iss: 34, stage: 4, mtp: true,
      vitals: { hr: 138, bp: '82/48', spo2: 90, rr: 28, temp: 96.4, gcs: 8 },
      injuries: [
        { region: 'Abdomen', text: 'Grade IV splenic laceration', sev: 'Critical' },
        { region: 'Chest', text: 'Left hemothorax, 3 rib fractures', sev: 'Critical' },
        { region: 'Left Leg', text: 'Mid-shaft femur fracture', sev: 'Major' },
      ],
      labs: [
        { name: 'Hemoglobin', value: '7.2 g/dL', flag: 'low' },
        { name: 'Lactate', value: '4.8 mmol/L', flag: 'high' },
        { name: 'Base Deficit', value: '−8.1', flag: 'high' },
        { name: 'INR', value: '1.6', flag: 'high' },
        { name: 'Platelets', value: '142 K/µL', flag: 'low' },
      ],
      radiology: [
        { name: 'FAST — bedside', result: 'Positive, free fluid RUQ', status: 'Complete' },
        { name: 'CT Pan-Scan', result: 'Splenic laceration, hemothorax', status: 'Complete' },
        { name: 'Chest X-Ray', result: 'Confirms tube placement', status: 'Complete' },
      ],
      meds: [
        { name: 'Tranexamic Acid', dose: '1 g IV bolus', time: '09:18 AM' },
        { name: 'Packed RBC', dose: '4 units — MTP', time: '09:22 AM' },
        { name: 'Fentanyl', dose: '100 mcg IV', time: '09:26 AM' },
      ],
      notes: [
        { who: 'Dr. Thomas Rivas', role: 'Trauma Lead', time: '09:48 AM', text: 'FAST positive with persistent hypotension despite 2 units. To OR for exploratory laparotomy. Anticipate splenectomy.' },
        { who: 'Kendra Vasquez, RN', role: 'Trauma Nurse', time: '09:22 AM', text: 'MTP initiated, 4 units O-neg hung. Two large-bore IVs sited. Patient remains unresponsive, GCS 8.' },
      ],
      timeline: [
        { stage: 'arrival', time: '09:12 AM', text: 'EMS arrival, Level 1 activation, Resus Bay 1' },
        { stage: 'assessment', time: '09:16 AM', text: 'Primary survey, FAST positive, MTP initiated' },
        { stage: 'ct', time: '09:31 AM', text: 'CT pan-scan — splenic laceration confirmed' },
        { stage: 'blood', time: '09:22 AM', text: 'Type and cross, 4 units transfused' },
        { stage: 'surgery', time: '09:48 AM', text: 'To OR 3 — exploratory laparotomy in progress' },
      ],
    },
    {
      id: 'TR-2026-0417', name: 'Deshawn Pritchard', age: 23, gender: 'Male', blood: 'A+',
      type: 'GSW — Abdomen', severity: 'Critical', priority: 'Critical',
      regions: ['abdomen'], region: 'Abdomen',
      team: 'Bravo', doctor: 'Dr. Marissa Bloom', location: 'Resus Bay 2', status: 'In Resus',
      arrival: '09:29 AM', since: 21, iss: 27, stage: 3, mtp: true,
      vitals: { hr: 124, bp: '94/58', spo2: 94, rr: 24, temp: 97.8, gcs: 14 },
      injuries: [
        { region: 'Abdomen', text: 'Penetrating trauma, LUQ entry wound', sev: 'Critical' },
        { region: 'Abdomen', text: 'Suspected small bowel involvement', sev: 'Major' },
      ],
      labs: [
        { name: 'Hemoglobin', value: '9.8 g/dL', flag: 'low' },
        { name: 'Lactate', value: '3.1 mmol/L', flag: 'high' },
        { name: 'White Cell Count', value: '14.2 K/µL', flag: 'high' },
        { name: 'Type & Cross', value: 'A+ — 4 units held', flag: 'normal' },
      ],
      radiology: [
        { name: 'FAST — bedside', result: 'Positive, free fluid', status: 'Complete' },
        { name: 'CT Abdomen', result: 'Awaiting scanner', status: 'Pending' },
      ],
      meds: [
        { name: 'Cefazolin', dose: '2 g IV', time: '09:34 AM' },
        { name: 'Packed RBC', dose: '2 units O-neg', time: '09:33 AM' },
        { name: 'Tetanus Toxoid', dose: '0.5 mL IM', time: '09:36 AM' },
      ],
      notes: [
        { who: 'Dr. Marissa Bloom', role: 'Trauma Surgeon', time: '09:40 AM', text: 'FAST positive. Haemodynamically borderline but responding to blood. OR notified, likely laparotomy within the hour.' },
      ],
      timeline: [
        { stage: 'arrival', time: '09:29 AM', text: 'EMS arrival, Level 1 activation, Resus Bay 2' },
        { stage: 'assessment', time: '09:33 AM', text: 'Primary survey, two large-bore IVs, O-neg started' },
        { stage: 'blood', time: '09:36 AM', text: 'Type and cross complete — A+, 4 units held' },
      ],
    },
    {
      id: 'TR-2026-0416', name: 'Emmett Sandoval', age: 74, gender: 'Male', blood: 'B+',
      type: 'Fall — Ground Level', severity: 'Major', priority: 'High',
      regions: ['head', 'pelvis'], region: 'Head, Pelvis',
      team: 'Charlie', doctor: 'Dr. Yusuf Karim', location: 'CT Suite', status: 'In CT',
      arrival: '09:30 AM', since: 20, iss: 17, stage: 2, mtp: false,
      vitals: { hr: 92, bp: '148/82', spo2: 96, rr: 18, temp: 98.1, gcs: 15 },
      injuries: [
        { region: 'Pelvis', text: 'Right femoral neck fracture', sev: 'Major' },
        { region: 'Head', text: 'Occipital strike, on warfarin — bleed risk', sev: 'Major' },
      ],
      labs: [
        { name: 'INR', value: '3.4', flag: 'high' },
        { name: 'Hemoglobin', value: '11.9 g/dL', flag: 'low' },
        { name: 'Creatinine', value: '1.3 mg/dL', flag: 'normal' },
        { name: 'Platelets', value: '198 K/µL', flag: 'normal' },
      ],
      radiology: [
        { name: 'CT Head', result: 'In progress', status: 'In Progress' },
        { name: 'Pelvis X-Ray', result: 'Femoral neck fracture', status: 'Complete' },
      ],
      meds: [
        { name: 'Vitamin K', dose: '10 mg IV', time: '09:37 AM' },
        { name: 'Prothrombin Complex', dose: '2000 units IV', time: '09:39 AM' },
        { name: 'Morphine', dose: '4 mg IV', time: '09:35 AM' },
      ],
      notes: [
        { who: 'Dr. Yusuf Karim', role: 'Emergency Physician', time: '09:37 AM', text: 'INR 3.4 on warfarin with head strike. Reversal started before CT. Orthopaedics aware of hip fracture, will review post-scan.' },
      ],
      timeline: [
        { stage: 'arrival', time: '09:30 AM', text: 'EMS arrival, Level 2 activation, Resus Bay 3' },
        { stage: 'assessment', time: '09:35 AM', text: 'Secondary survey, reversal agent ordered' },
        { stage: 'ct', time: '09:44 AM', text: 'To CT — head and pelvis' },
      ],
    },
    {
      id: 'TR-2026-0415', name: 'Camila Restrepo', age: 31, gender: 'Female', blood: 'O+',
      type: 'Pedestrian Struck', severity: 'Major', priority: 'High',
      regions: ['chest', 'legR'], region: 'Chest, Right Leg',
      team: 'Bravo', doctor: 'Dr. Marissa Bloom', location: 'Surgical ICU', status: 'ICU Admit',
      arrival: '08:41 AM', since: 69, iss: 14, stage: 6, mtp: false,
      vitals: { hr: 96, bp: '118/72', spo2: 97, rr: 20, temp: 98.4, gcs: 14 },
      injuries: [
        { region: 'Right Leg', text: 'Tibial plateau fracture', sev: 'Major' },
        { region: 'Chest', text: 'Right pulmonary contusion', sev: 'Moderate' },
      ],
      labs: [
        { name: 'Hemoglobin', value: '12.4 g/dL', flag: 'normal' },
        { name: 'Lactate', value: '1.8 mmol/L', flag: 'normal' },
        { name: 'Troponin', value: '0.02 ng/mL', flag: 'normal' },
      ],
      radiology: [
        { name: 'CT Chest', result: 'Pulmonary contusion, no pneumothorax', status: 'Complete' },
        { name: 'CT Tib-Fib', result: 'Displaced plateau fracture', status: 'Complete' },
      ],
      meds: [
        { name: 'Ketorolac', dose: '30 mg IV', time: '08:58 AM' },
        { name: 'Cefazolin', dose: '2 g IV', time: '09:02 AM' },
      ],
      notes: [
        { who: 'Dr. Marissa Bloom', role: 'Trauma Surgeon', time: '09:25 AM', text: 'Stable for ICU admission for respiratory monitoring. Orthopaedics to fix plateau fracture on tomorrow\'s list.' },
      ],
      timeline: [
        { stage: 'arrival', time: '08:41 AM', text: 'EMS arrival, Level 2 activation, Resus Bay 4' },
        { stage: 'assessment', time: '08:47 AM', text: 'Primary and secondary survey complete' },
        { stage: 'ct', time: '08:52 AM', text: 'CT complete — contusion confirmed' },
        { stage: 'blood', time: '08:55 AM', text: 'Bloods unremarkable, no transfusion' },
        { stage: 'recovery', time: '09:10 AM', text: 'Stabilised in resus, respiratory monitoring' },
        { stage: 'icu', time: '09:25 AM', text: 'Admitted to Surgical ICU 204' },
      ],
    },
    {
      id: 'TR-2026-0414', name: 'Roland Beckett', age: 46, gender: 'Male', blood: 'AB+',
      type: 'Assault — Blunt', severity: 'Moderate', priority: 'Medium',
      regions: ['head'], region: 'Head, Face',
      team: 'Charlie', doctor: 'Dr. Yusuf Karim', location: 'Observation', status: 'Observation',
      arrival: '08:14 AM', since: 96, iss: 9, stage: 5, mtp: false,
      vitals: { hr: 82, bp: '132/84', spo2: 99, rr: 16, temp: 98.6, gcs: 15 },
      injuries: [
        { region: 'Head', text: 'Nasal bone fracture, displaced', sev: 'Moderate' },
        { region: 'Head', text: 'Left zygomatic arch fracture', sev: 'Moderate' },
      ],
      labs: [
        { name: 'Hemoglobin', value: '14.1 g/dL', flag: 'normal' },
        { name: 'Ethanol', value: '0.14 g/dL', flag: 'high' },
      ],
      radiology: [{ name: 'CT Maxillofacial', result: 'Nasal and zygomatic fractures', status: 'Complete' }],
      meds: [{ name: 'Ibuprofen', dose: '600 mg PO', time: '08:40 AM' }],
      notes: [
        { who: 'Dr. Yusuf Karim', role: 'Emergency Physician', time: '09:02 AM', text: 'Neurologically intact, GCS 15 throughout. To observation pending ENT review for nasal reduction.' },
      ],
      timeline: [
        { stage: 'arrival', time: '08:14 AM', text: 'Walk-in, trauma consult requested' },
        { stage: 'assessment', time: '08:22 AM', text: 'Secondary survey, GCS 15' },
        { stage: 'ct', time: '08:29 AM', text: 'Maxillofacial CT complete' },
        { stage: 'blood', time: '08:34 AM', text: 'Routine bloods, ethanol elevated' },
        { stage: 'recovery', time: '09:02 AM', text: 'To observation pending ENT' },
      ],
    },
    {
      id: 'TR-2026-0413', name: 'Harriet Nakashima', age: 59, gender: 'Female', blood: 'A−',
      type: 'MVC — Unrestrained', severity: 'Major', priority: 'High',
      regions: ['chest', 'abdomen'], region: 'Chest, Abdomen',
      team: 'Alpha', doctor: 'Dr. Thomas Rivas', location: 'OR 5', status: 'In OR',
      arrival: '07:52 AM', since: 118, iss: 21, stage: 4, mtp: false,
      vitals: { hr: 110, bp: '106/64', spo2: 93, rr: 26, temp: 97.2, gcs: 13 },
      injuries: [
        { region: 'Chest', text: 'Rib fractures 4–8, flail segment', sev: 'Critical' },
        { region: 'Abdomen', text: 'Grade II liver laceration', sev: 'Major' },
      ],
      labs: [
        { name: 'Hemoglobin', value: '10.6 g/dL', flag: 'low' },
        { name: 'Lactate', value: '2.6 mmol/L', flag: 'high' },
        { name: 'AST', value: '180 U/L', flag: 'high' },
      ],
      radiology: [
        { name: 'CT Chest/Abdo', result: 'Flail chest, liver laceration', status: 'Complete' },
        { name: 'Chest X-Ray', result: 'Post chest-tube, lung re-expanded', status: 'Complete' },
      ],
      meds: [
        { name: 'Fentanyl', dose: '75 mcg IV', time: '08:02 AM' },
        { name: 'Cefazolin', dose: '2 g IV', time: '08:40 AM' },
      ],
      notes: [
        { who: 'Dr. Thomas Rivas', role: 'Trauma Lead', time: '08:44 AM', text: 'Flail segment with poor respiratory mechanics. To OR 5 for rib fixation. Liver laceration managed non-operatively.' },
      ],
      timeline: [
        { stage: 'arrival', time: '07:52 AM', text: 'EMS arrival, Level 2 activation, Resus Bay 6' },
        { stage: 'assessment', time: '07:58 AM', text: 'Primary survey, flail segment identified' },
        { stage: 'ct', time: '08:20 AM', text: 'CT chest/abdomen complete' },
        { stage: 'blood', time: '08:12 AM', text: 'Bloods sent, no transfusion required' },
        { stage: 'surgery', time: '08:44 AM', text: 'To OR 5 — rib fixation in progress' },
      ],
    },
    {
      id: 'TR-2026-0412', name: 'Priya Raghunathan', age: 28, gender: 'Female', blood: 'B−',
      type: 'Fall — From Height', severity: 'Minor', priority: 'Stable',
      regions: ['armR'], region: 'Right Arm',
      team: 'Charlie', doctor: 'Dr. Yusuf Karim', location: 'Observation', status: 'Observation',
      arrival: '07:31 AM', since: 139, iss: 5, stage: 5, mtp: false,
      vitals: { hr: 74, bp: '116/70', spo2: 100, rr: 14, temp: 98.2, gcs: 15 },
      injuries: [{ region: 'Right Arm', text: 'Distal radius fracture, closed', sev: 'Minor' }],
      labs: [{ name: 'Hemoglobin', value: '13.2 g/dL', flag: 'normal' }],
      radiology: [{ name: 'Wrist X-Ray', result: 'Colles fracture, minimally displaced', status: 'Complete' }],
      meds: [{ name: 'Acetaminophen', dose: '1 g PO', time: '07:50 AM' }],
      notes: [
        { who: 'Dr. Yusuf Karim', role: 'Emergency Physician', time: '08:15 AM', text: 'Closed reduction and cast applied. Neurovascularly intact. For fracture clinic follow-up in one week.' },
      ],
      timeline: [
        { stage: 'arrival', time: '07:31 AM', text: 'Walk-in after fall from ladder' },
        { stage: 'assessment', time: '07:40 AM', text: 'Focused exam, neurovascularly intact' },
        { stage: 'ct', time: '07:48 AM', text: 'Wrist X-Ray — Colles fracture' },
        { stage: 'blood', time: '07:52 AM', text: 'Routine bloods, unremarkable' },
        { stage: 'recovery', time: '08:15 AM', text: 'Cast applied, to observation' },
      ],
    },
    {
      id: 'TR-2026-0411', name: 'Curtis Mbeki', age: 52, gender: 'Male', blood: 'O+',
      type: 'Industrial — Crush', severity: 'Moderate', priority: 'Medium',
      regions: ['armL'], region: 'Left Arm, Hand',
      team: 'Bravo', doctor: 'Dr. Marissa Bloom', location: 'Resus Bay 1', status: 'In Resus',
      arrival: '09:04 AM', since: 46, iss: 11, stage: 3, mtp: false,
      vitals: { hr: 88, bp: '128/78', spo2: 98, rr: 18, temp: 98.0, gcs: 15 },
      injuries: [
        { region: 'Left Arm', text: 'Crush injury, forearm compartment risk', sev: 'Major' },
        { region: 'Left Arm', text: '2nd–3rd metacarpal fractures', sev: 'Moderate' },
      ],
      labs: [
        { name: 'Creatine Kinase', value: '2400 U/L', flag: 'high' },
        { name: 'Potassium', value: '5.1 mmol/L', flag: 'high' },
        { name: 'Creatinine', value: '1.1 mg/dL', flag: 'normal' },
      ],
      radiology: [{ name: 'Forearm X-Ray', result: 'Metacarpal fractures, no radius involvement', status: 'Complete' }],
      meds: [
        { name: 'Normal Saline', dose: '1 L IV bolus', time: '09:10 AM' },
        { name: 'Morphine', dose: '5 mg IV', time: '09:08 AM' },
      ],
      notes: [
        { who: 'Dr. Marissa Bloom', role: 'Trauma Surgeon', time: '09:20 AM', text: 'CK rising, monitoring for rhabdomyolysis and compartment syndrome. Hourly neurovascular checks. Plastics consulted.' },
      ],
      timeline: [
        { stage: 'arrival', time: '09:04 AM', text: 'EMS arrival from worksite, Level 2 activation' },
        { stage: 'assessment', time: '09:08 AM', text: 'Compartment checks started, analgesia given' },
        { stage: 'blood', time: '09:16 AM', text: 'CK 2400 — rhabdomyolysis watch' },
      ],
    },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.updateAdvice();

    this.byId('search')?.addEventListener('input', () => this.renderGrid());
    this.byId('filter-severity')?.addEventListener('change', () => this.renderGrid());
    this.byId('filter-location')?.addEventListener('change', () => this.renderGrid());

    const board = this.byId('board');
    if (board) {
      board.addEventListener('click', (e: Event) => {
        const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
        if (t) this.openDrawer(t.dataset['open'] || '');
      });
      board.addEventListener('keydown', (e: Event) => {
        const ke = e as KeyboardEvent;
        if (ke.key !== 'Enter' && ke.key !== ' ') return;
        const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
        if (!t) return;
        ke.preventDefault();
        this.openDrawer(t.dataset['open'] || '');
      });
      board.addEventListener('dragstart', (e: Event) => {
        const de = e as DragEvent;
        const ticket = (e.target as HTMLElement).closest('.tc-ticket') as HTMLElement | null;
        if (!ticket) return;
        ticket.classList.add('is-dragging');
        if (de.dataTransfer) {
          de.dataTransfer.effectAllowed = 'move';
          de.dataTransfer.setData('text/plain', ticket.dataset['id'] || '');
        }
      });
      board.addEventListener('dragend', (e: Event) => {
        const ticket = (e.target as HTMLElement).closest('.tc-ticket') as HTMLElement | null;
        if (ticket) ticket.classList.remove('is-dragging');
        board.querySelectorAll('.tc-col-body.is-drop-target').forEach((el) => el.classList.remove('is-drop-target'));
      });
      board.addEventListener('dragover', (e: Event) => {
        const de = e as DragEvent;
        const body = (e.target as HTMLElement).closest('.tc-col-body') as HTMLElement | null;
        if (!body) return;
        de.preventDefault();
        if (de.dataTransfer) de.dataTransfer.dropEffect = 'move';
        body.classList.add('is-drop-target');
      });
      board.addEventListener('dragleave', (e: Event) => {
        const de = e as DragEvent;
        const body = (e.target as HTMLElement).closest('.tc-col-body') as HTMLElement | null;
        if (body && !body.contains(de.relatedTarget as Node)) body.classList.remove('is-drop-target');
      });
      board.addEventListener('drop', (e: Event) => {
        const de = e as DragEvent;
        const body = (e.target as HTMLElement).closest('.tc-col-body') as HTMLElement | null;
        if (!body) return;
        de.preventDefault();
        body.classList.remove('is-drop-target');
        const id = de.dataTransfer ? de.dataTransfer.getData('text/plain') : '';
        const priority = body.dataset['priority'];
        const c = this.CASES.find((x) => x.id === id);
        if (!c || !priority || c.priority === priority) return;
        c.priority = priority;
        this.renderAll();
        this.toastService.show(c.name + ' moved to ' + this.PRIORITY[priority].label + ' priority.', 'success');
      });
    }

    const gridBody = this.byId('grid-body');
    if (gridBody) {
      gridBody.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
        if (!btn) return;
        const id = btn.dataset['id'] || '';
        const c = this.CASES.find((x) => x.id === id);
        if (!c) return;
        const act = btn.dataset['act'];

        if (act === 'view') this.openDrawer(id);
        else if (act === 'update') this.openStatus(id);
        else if (act === 'transfer') this.openTransfer(id);
        else if (act === 'surgery') this.openSurgery(id);
        else if (act === 'icu') {
          c.status = 'ICU Admit';
          c.location = 'Surgical ICU';
          this.refreshGridRow(c);
          this.renderAll();
          this.toastService.show(c.name + ' admitted to Surgical ICU.', 'success');
        } else if (act === 'print') {
          this.toastService.show('Trauma report for ' + c.id + ' sent to the printer.', 'info');
          window.print();
        } else if (act === 'discharge') {
          this.confirmDelete(c.name + ' (' + c.id + ')', () => {
            c.status = 'Discharged';
            c.stage = 7;
            this.refreshGridRow(c);
            this.renderAll();
            this.toastService.show(c.id + ' discharged and sent to the registry.', 'success');
          });
        }
      });
    }

    this.byId('btn-new-case')?.addEventListener('click', () => {
      (this.byId('am-form') as HTMLFormElement | null)?.reset();
      const level = this.byId('am-level') as HTMLSelectElement | null;
      if (level) level.value = '1';
      this.updateAdvice();
      const modal = this.byId('activate-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.open(modal);
    });
    this.byId('btn-activate')?.addEventListener('click', () => {
      (this.byId('am-form') as HTMLFormElement | null)?.reset();
      const level = this.byId('am-level') as HTMLSelectElement | null;
      if (level) level.value = '1';
      this.updateAdvice();
      const modal = this.byId('activate-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.open(modal);
    });
    this.byId('btn-transfer')?.addEventListener('click', () => this.openTransfer(null));
    this.byId('btn-print')?.addEventListener('click', () => {
      this.toastService.show('Trauma report — ' + this.open().length + ' open cases — sent to the printer.', 'info');
      window.print();
    });

    this.byId('dw-close')?.addEventListener('click', () => this.closeDrawer());
    this.byId('dw-backdrop')?.addEventListener('click', () => this.closeDrawer());
    this.byId('dw-act-surgery')?.addEventListener('click', (e: Event) => {
      this.closeDrawer();
      this.openSurgery((e.currentTarget as HTMLElement).dataset['id'] || '');
    });
    this.byId('dw-act-transfer')?.addEventListener('click', (e: Event) => {
      this.closeDrawer();
      this.openTransfer((e.currentTarget as HTMLElement).dataset['id'] || '');
    });
    this.byId('dw-act-icu')?.addEventListener('click', (e: Event) => {
      const c = this.CASES.find((x) => x.id === (e.currentTarget as HTMLElement).dataset['id']);
      if (!c) return;
      c.status = 'ICU Admit';
      c.location = 'Surgical ICU';
      this.closeDrawer();
      this.refreshGridRow(c);
      this.renderAll();
      this.toastService.show(c.name + ' admitted to Surgical ICU.', 'success');
    });
    this.byId('dw-act-discharge')?.addEventListener('click', (e: Event) => {
      const c = this.CASES.find((x) => x.id === (e.currentTarget as HTMLElement).dataset['id']);
      if (!c) return;
      this.closeDrawer();
      this.confirmDelete(c.name + ' (' + c.id + ')', () => {
        c.status = 'Discharged';
        c.stage = 7;
        this.refreshGridRow(c);
        this.renderAll();
        this.toastService.show(c.id + ' discharged and sent to the registry.', 'success');
      });
    });

    this.byId('am-level')?.addEventListener('change', () => this.updateAdvice());
    this.byId('am-iss')?.addEventListener('input', () => this.updateAdvice());
    this.byId('am-save')?.addEventListener('click', () => {
      const patient = (this.byId('am-patient') as HTMLInputElement | null)?.value.trim();
      if (!patient) {
        this.toastService.show('Enter a patient name or description.', 'error');
        return;
      }
      const levelSel = (this.byId('am-level') as HTMLSelectElement | null)?.value ?? '1';
      const l = this.LEVEL[levelSel] || this.LEVEL['1'];
      const modal = this.byId('activate-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      const bay = (this.byId('am-bay') as HTMLSelectElement | null)?.value ?? '';
      this.toastService.show(l.label + ' activation sent — ' + l.team + ' staff paged to ' + bay + '.', 'error');
    });

    this.byId('tm-save')?.addEventListener('click', () => {
      const tmCase = (this.byId('tm-case') as HTMLSelectElement | null)?.value ?? '';
      const c = this.CASES.find((x) => x.id === tmCase);
      if (!c) {
        this.toastService.show('Select a case to transfer.', 'error');
        return;
      }
      c.location = (this.byId('tm-dest') as HTMLSelectElement | null)?.value ?? c.location;
      const modal = this.byId('transfer-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      this.refreshGridRow(c);
      this.renderAll();
      const mode = (this.byId('tm-mode') as HTMLSelectElement | null)?.value ?? '';
      this.toastService.show(c.name + ' transferring to ' + c.location + ' — ' + mode.split(' — ')[0] + '.', 'success');
    });

    this.byId('sm-save')?.addEventListener('click', (e: Event) => {
      const c = this.CASES.find((x) => x.id === (e.currentTarget as HTMLElement).dataset['id']);
      if (!c) return;
      c.status = (this.byId('sm-status') as HTMLSelectElement | null)?.value ?? c.status;
      c.location = (this.byId('sm-location') as HTMLSelectElement | null)?.value ?? c.location;
      const modal = this.byId('status-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      this.refreshGridRow(c);
      this.renderAll();
      this.toastService.show(c.id + ' updated — ' + c.status + ' at ' + c.location + '.', 'success');
    });

    this.byId('gm-save')?.addEventListener('click', (e: Event) => {
      const c = this.CASES.find((x) => x.id === (e.currentTarget as HTMLElement).dataset['id']);
      if (!c) return;
      const procedure = (this.byId('gm-procedure') as HTMLInputElement | null)?.value.trim();
      if (!procedure) {
        this.toastService.show('Enter the procedure before booking.', 'error');
        return;
      }
      c.status = 'In OR';
      const or = (this.byId('gm-or') as HTMLSelectElement | null)?.value ?? '';
      c.location = or.split(' — ')[0];
      const modal = this.byId('surgery-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      this.refreshGridRow(c);
      this.renderAll();
      this.toastService.show(procedure + ' booked in ' + c.location + ' for ' + c.name + '.', 'success');
    });

    this.initDeleteModal();
    this.closeOnBackdrop('del-modal');

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      this.closeDrawer();
      this.closeModal('del-modal');
    });
  }

  /* --- Derived ---------------------------------------------------------- */

  private open(): TraumaCase[] {
    return this.CASES.filter((c) => c.status !== 'Discharged');
  }

  private countBy(fn: (c: TraumaCase) => boolean): number {
    return this.open().filter(fn).length;
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }

  private initials(name: string): string {
    return name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  /* --- SVG primitives ---------------------------------------------------- */

  private ring(pct: number): string {
    const v = Math.max(0, Math.min(100, pct));
    return (
      '<svg class="tc-kpi-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
      '<circle class="tc-kpi-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3"></circle>' +
      '<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
      'stroke-dasharray="' + v + ' 100"></circle>' +
      '</svg>'
    );
  }

  private sparkline(series: number[]): string {
    if (!series || series.length < 2) return '';
    const W = 64;
    const H = 28;
    const max = Math.max.apply(null, series);
    const min = Math.min.apply(null, series);
    const span = max - min || 1;
    const step = W / (series.length - 1);
    const pts = series.map((v, i) => (i * step).toFixed(1) + ',' + (H - 2 - ((v - min) / span) * (H - 4)).toFixed(1));
    return (
      '<svg class="tc-kpi-spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<polygon points="0,' + H + ' ' + pts.join(' ') + ' ' + W + ',' + H + '" fill="currentColor" opacity="0.14"></polygon>' +
      '<polyline points="' + pts.join(' ') + '" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>' +
      '</svg>'
    );
  }

  /* --- Hero --------------------------------------------------------------- */

  private traumaLevel(): { cls: string; text: string } {
    const critical = this.countBy((c) => c.priority === 'Critical');
    if (this.open().length >= 12 || critical >= 4) return { cls: 'is-mass', text: 'Mass Casualty' };
    if (critical >= 2) return { cls: 'is-high', text: 'High Alert' };
    return { cls: 'is-normal', text: 'Normal' };
  }

  private renderHero(): void {
    const lv = this.traumaLevel();
    const levelEl = this.byId('tc-level');
    if (levelEl) levelEl.className = 'tc-level ' + lv.cls;
    const levelText = this.byId('tc-level-text');
    if (levelText) levelText.textContent = lv.text;

    const rail = [
      { label: 'Open Cases', value: this.open().length, icon: 'icon-folder-open' },
      { label: 'In Theatre', value: this.countBy((c) => c.status === 'In OR'), icon: 'icon-scissors' },
      { label: 'Massive Transfusion', value: this.countBy((c) => c.mtp), icon: 'icon-droplet' },
      { label: 'O− Units', value: this.BLOOD_ONEG, icon: 'icon-flask-conical' },
      { label: 'Team Ready', value: this.TEAM.filter((t) => t.status === 'Available').length + '/' + this.TEAM.length, icon: 'icon-users' },
    ];

    const heroRail = this.byId('hero-rail');
    if (heroRail) {
      heroRail.innerHTML = rail
        .map(
          (r) =>
            '<div class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">' +
            '<i class="' + r.icon + ' text-white/40 text-sm" aria-hidden="true"></i>' +
            '<div>' +
            '<dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">' + this.esc(r.label) + '</dt>' +
            '<dd class="text-sm font-extrabold text-white tabular-nums">' + this.esc(r.value) + '</dd>' +
            '</div></div>',
        )
        .join('');
    }
  }

  /* --- KPI widgets --------------------------------------------------------- */

  private renderKpis(): void {
    const critical = this.countBy((c) => c.priority === 'Critical');
    const major = this.countBy((c) => c.severity === 'Major');
    const minor = this.countBy((c) => c.severity === 'Minor' || c.severity === 'Moderate');
    const surgery = this.countBy((c) => c.status === 'In OR');
    const icu = this.countBy((c) => c.status === 'ICU Admit');
    const total = this.open().length;

    const cards = [
      { id: 'kpi-active', icon: 'icon-siren', label: 'Active Trauma Cases', value: total, tone: 'tone-critical', pct: Math.round((total / 12) * 100), chip: 'Live', chipIcon: 'icon-radio', spark: [4, 5, 5, 6, 7, 6, 8] },
      { id: 'kpi-critical', icon: 'icon-heart-pulse', label: 'Critical Patients', value: critical, tone: 'tone-critical', pct: Math.round((critical / total) * 100), chip: critical >= 2 ? 'Escalated' : 'Steady', chipIcon: 'icon-trending-up', spark: [1, 1, 2, 2, 1, 2, 2] },
      { id: 'kpi-major', icon: 'icon-bone', label: 'Major Trauma', value: major, tone: 'tone-high', pct: Math.round((major / total) * 100), chip: 'ISS 16+', chipIcon: 'icon-gauge', spark: [2, 3, 3, 2, 3, 3, 3] },
      { id: 'kpi-minor', icon: 'icon-bandage', label: 'Minor Trauma', value: minor, tone: 'tone-stable', pct: Math.round((minor / total) * 100), chip: 'Fast Track', chipIcon: 'icon-zap', spark: [4, 3, 3, 2, 3, 3, 3] },
      { id: 'kpi-surgery', icon: 'icon-scissors', label: 'Surgery Waiting', value: surgery, tone: 'tone-medium', pct: Math.round((surgery / total) * 100), chip: '2 OR open', chipIcon: 'icon-door-open', spark: [1, 1, 2, 2, 2, 1, 2] },
      { id: 'kpi-icu', icon: 'icon-bed', label: 'ICU Transfers', value: icu, tone: 'tone-info', pct: Math.round((icu / total) * 100), chip: '4 beds free', chipIcon: 'icon-check', spark: [0, 1, 1, 1, 2, 1, 1] },
    ];

    const kpiRow = this.byId('kpi-row');
    if (kpiRow) {
      kpiRow.innerHTML = cards
        .map(
          (c) =>
            '<article class="tc-kpi ' + c.tone + '">' +
            '<div class="tc-kpi-head">' +
            '<span class="tc-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
            '<div class="relative">' + this.ring(c.pct) +
            '<span class="tc-kpi-ring-label">' + c.pct + '%</span></div>' +
            '</div>' +
            '<p class="tc-kpi-value" id="' + c.id + '">' + c.value + '</p>' +
            '<p class="tc-kpi-label">' + this.esc(c.label) + '</p>' +
            '<div class="tc-kpi-foot">' +
            this.sparkline(c.spark) +
            '<span class="hms-chip"><i class="' + c.chipIcon + ' text-[9px]" aria-hidden="true"></i>' + this.esc(c.chip) + '</span>' +
            '</div></article>',
        )
        .join('');
    }
  }

  /* --- Overview ------------------------------------------------------------ */

  private renderSeverity(): void {
    const order = ['Critical', 'Major', 'Moderate', 'Minor'];
    const counts = order.map((s) => ({ name: s, n: this.countBy((c) => c.severity === s) }));
    const total = this.open().length;

    let offset = 0;
    const segs = counts
      .filter((c) => c.n > 0)
      .map((c) => {
        const pct = (c.n / total) * 100;
        const seg =
          '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="' + this.SEVERITY[c.name].color + '" ' +
          'stroke-width="4.5" stroke-dasharray="' + pct.toFixed(2) + ' ' + (100 - pct).toFixed(2) + '" ' +
          'stroke-dashoffset="' + (-offset).toFixed(2) + '"></circle>';
        offset += pct;
        return seg;
      })
      .join('');

    const donut = this.byId('sev-donut');
    if (donut) {
      donut.innerHTML =
        '<circle cx="21" cy="21" r="15.9155" fill="none" stroke="currentColor" stroke-width="4.5" class="text-gray-100 dark:text-slate-700"></circle>' + segs;
    }
    const total_el = this.byId('sev-total');
    if (total_el) total_el.textContent = String(total);

    const legend = this.byId('sev-legend');
    if (legend) {
      legend.innerHTML = counts
        .map((c) => {
          const pct = total ? Math.round((c.n / total) * 100) : 0;
          return (
            '<li class="' + this.SEVERITY[c.name].tone + ' flex items-center gap-2.5">' +
            '<span class="size-2.5 rounded-full shrink-0 bg-[var(--tc-accent)]" aria-hidden="true"></span>' +
            '<span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + c.name + '</span>' +
            '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + c.n + '</span>' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums w-8 text-right">' + pct + '%</span>' +
            '</li>'
          );
        })
        .join('');
    }
  }

  private renderDepartments(): void {
    const max = Math.max.apply(null, this.DEPARTMENTS.map((d) => d.count));
    const list = this.byId('dept-list');
    if (!list) return;
    list.innerHTML = this.DEPARTMENTS.map((d) => {
      const pct = Math.round((d.count / max) * 100);
      return (
        '<div class="tc-dept ' + d.tone + '">' +
        '<span class="hms-panel-icon"><i class="' + d.icon + '" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1">' +
        '<div class="flex items-center gap-2">' +
        '<p class="text-xs font-bold text-gray-900 mr-auto truncate">' + this.esc(d.name) + '</p>' +
        '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + d.count + '</span></div>' +
        '<svg class="mt-1.5 h-1.5 w-full text-[var(--tc-accent)]" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" ' +
        'aria-label="' + this.esc(d.name) + ': ' + d.count + ' cases">' +
        '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.14"></rect>' +
        '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect>' +
        '</svg></div></div>'
      );
    }).join('');
  }

  private renderHourly(): void {
    const W = 240;
    const H = 80;
    const n = this.HOURLY.length;
    const max = Math.max.apply(null, this.HOURLY.map((h) => h.n));
    const peak = this.HOURLY.find((h) => h.n === max)!;
    const slot = W / n;
    const bw = slot * 0.56;

    const chart = this.byId('hourly-chart');
    if (chart) {
      chart.innerHTML = this.HOURLY.map((h, i) => {
        const bh = Math.max(2, (h.n / max) * (H - 6));
        const x = i * slot + (slot - bw) / 2;
        return (
          '<rect class="tc-bar' + (h.n === max ? ' is-peak' : '') + '" x="' + x.toFixed(1) + '" y="' + (H - bh).toFixed(1) +
          '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="2">' +
          '<title>' + h.label + ':00 — ' + h.n + ' admissions</title></rect>'
        );
      }).join('');
    }

    const axis = this.byId('hourly-axis');
    if (axis) axis.innerHTML = this.HOURLY.map((h) => '<span>' + h.label + '</span>').join('');
    const totalEl = this.byId('hourly-total');
    if (totalEl) totalEl.textContent = String(this.HOURLY.reduce((s, h) => s + h.n, 0));
    const peakEl = this.byId('hourly-peak');
    if (peakEl) peakEl.textContent = 'Peak ' + peak.label + ':00';
  }

  /* --- Priority board ------------------------------------------------------- */

  private renderBoard(): void {
    const board = this.byId('board');
    if (!board) return;
    board.innerHTML = Object.keys(this.PRIORITY)
      .map((key) => {
        const p = this.PRIORITY[key];
        const items = this.open().filter((c) => c.priority === key);

        const tickets = items
          .map(
            (c) =>
              '<article class="tc-ticket" data-open="' + this.esc(c.id) + '" data-id="' + this.esc(c.id) + '" ' +
              'draggable="true" tabindex="0" role="button" ' +
              'aria-label="Open case ' + this.esc(c.id) + ' for ' + this.esc(c.name) + '. Draggable, drop on another column to change priority.">' +
              '<div class="flex items-start gap-2">' +
              '<i class="icon-grip-vertical tc-grip text-sm mt-0.5" aria-hidden="true"></i>' +
              '<div class="min-w-0 flex-1">' +
              '<div class="flex items-center gap-2">' +
              '<p class="text-xs font-bold text-gray-900 truncate mr-auto">' + this.esc(c.name) + '</p>' +
              '<span class="hms-chip">' + this.esc(c.blood) + '</span></div>' +
              '<p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">' + this.esc(c.type) + '</p>' +
              '<div class="mt-2 flex items-center gap-2 text-[10px] font-semibold text-gray-400">' +
              '<span class="inline-flex items-center gap-1 truncate">' +
              '<i class="icon-user-round text-[10px]" aria-hidden="true"></i>' + this.esc(c.doctor.replace('Dr. ', 'Dr ')) + '</span>' +
              '<span class="inline-flex items-center gap-1 ml-auto shrink-0">' +
              '<i class="icon-clock text-[10px]" aria-hidden="true"></i>' + c.since + 'm</span>' +
              '</div></div></div></article>',
          )
          .join('');

        return (
          '<div class="tc-col ' + p.tone + '" data-priority="' + key + '">' +
          '<div class="tc-col-head">' +
          '<span class="size-2 rounded-full bg-[var(--tc-accent)]" aria-hidden="true"></span>' +
          '<h3 class="tc-col-title">' + p.label + '</h3>' +
          '<span class="tc-col-count">' + items.length + '</span></div>' +
          '<div class="tc-col-body" data-priority="' + key + '">' + tickets +
          (items.length === 0 ? '<p class="tc-col-empty">Drop a case here</p>' : '') +
          '</div></div>'
        );
      })
      .join('');
  }

  /* --- Case registry --------------------------------------------------------- */

  private sevPips(severity: string): string {
    const s = this.SEVERITY[severity];
    let pips = '';
    for (let i = 0; i < 4; i++) pips += '<span class="tc-sev-pip' + (i < s.pips ? ' is-on' : '') + '"></span>';
    return '<span class="tc-sev ' + s.tone + '" title="' + severity + '">' + pips + '</span>';
  }

  private detailUrl(c: TraumaCase): string {
    const params = new URLSearchParams({
      id: c.id, patient: c.name, severity: c.severity, type: c.type, region: c.region,
      team: c.team, location: c.location, status: c.status,
    });
    return 'trauma-case-detail.html?' + params.toString();
  }

  private actionsMenu(id: string): string {
    const items = [
      { label: 'View', icon: 'icon-eye', act: 'view' },
      { label: 'Update', icon: 'icon-list-checks', act: 'update' },
      { label: 'Transfer', icon: 'icon-ambulance', act: 'transfer' },
      { label: 'Schedule Surgery', icon: 'icon-scissors', act: 'surgery' },
      { label: 'ICU', icon: 'icon-bed', act: 'icu' },
      { label: 'Print', icon: 'icon-printer', act: 'print' },
      { label: 'Discharge', icon: 'icon-check', act: 'discharge', danger: true },
    ];
    let html =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
      '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">' +
      '<i class="icon-ellipsis-vertical text-sm"></i></button>' +
      '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">';
    items.forEach((it) => {
      html +=
        '<button type="button" role="menuitem" data-act="' + it.act + '" data-id="' + id + '" ' +
        'class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
        (it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
        '"><i class="' + it.icon + ' text-sm"></i>' + it.label + '</button>';
    });
    html += '</div></div>';
    return html;
  }

  private rowHTML(c: TraumaCase): string {
    const s = this.SEVERITY[c.severity];
    return (
      '<tr class="hms-row ' + s.tone + '" data-row-id="' + this.esc(c.id) + '">' +
      '<td class="hms-cell"><a href="' + this.detailUrl(c) + '" class="font-mono text-[11px] font-bold text-primary hover:underline">' + this.esc(c.id) + '</a>' +
      '<p class="text-[10px] text-gray-400">' + this.esc(c.arrival) + '</p></td>' +
      '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
      '<span class="hms-member-avatar size-9!">' + this.esc(this.initials(c.name)) + '</span>' +
      '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + this.esc(c.name) + '</p>' +
      '<p class="text-[10px] text-gray-400">' + c.age + ' ' + this.esc(c.gender.charAt(0)) + ' · ' + this.esc(c.blood) + '</p></div></div></td>' +
      '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-40 truncate" title="' + this.esc(c.type) + '">' + this.esc(c.type) + '</p></td>' +
      '<td class="hms-cell">' + this.sevPips(c.severity) +
      '<p class="mt-1 text-[10px] font-bold text-gray-400">ISS ' + c.iss + '</p></td>' +
      '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-32 truncate" title="' + this.esc(c.region) + '">' + this.esc(c.region) + '</p></td>' +
      '<td class="hms-cell"><span class="hms-chip">Team ' + this.esc(c.team) + '</span>' +
      '<p class="mt-1 text-[10px] text-gray-400 truncate">' + this.esc(c.doctor) + '</p></td>' +
      '<td class="hms-cell"><span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">' +
      '<i class="icon-map-pin text-[11px] text-gray-400" aria-hidden="true"></i>' + this.esc(c.location) + '</span></td>' +
      '<td class="hms-cell">' + this.badge(this.STATUS_BADGE, c.status) + '</td>' +
      '<td class="hms-cell text-right">' + this.actionsMenu(c.id) + '</td></tr>'
    );
  }

  private badge(map: Record<string, string>, value: string): string {
    return '<span class="badge ' + (map[value] || 'badge-gray') + '">' + value + '</span>';
  }

  private refreshGridRow(c: TraumaCase): void {
    const gridBody = this.byId('grid-body');
    if (!gridBody) return;
    const el = gridBody.querySelector('[data-row-id="' + c.id + '"]');
    if (el) el.outerHTML = this.rowHTML(c);
  }

  private renderGrid(): void {
    const q = ((this.byId('search') as HTMLInputElement | null)?.value ?? '').trim().toLowerCase();
    const sev = (this.byId('filter-severity') as HTMLSelectElement | null)?.value ?? '';
    const loc = (this.byId('filter-location') as HTMLSelectElement | null)?.value ?? '';

    const matches = this.CASES.filter((c) => {
      const hit = !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.team.toLowerCase().includes(q);
      return hit && (!sev || c.severity === sev) && (!loc || c.location === loc);
    });

    const countEl = this.byId('grid-count');
    if (countEl) countEl.textContent = matches.length + (matches.length === 1 ? ' case' : ' cases');

    const visible = new Set(matches.map((c) => c.id));
    const tbody = this.byId('grid-body');
    if (!tbody) return;
    let anyVisible = false;
    tbody.querySelectorAll('[data-row-id]').forEach((tr) => {
      const el = tr as HTMLElement;
      const isVisible = visible.has(el.dataset['rowId'] || '');
      el.classList.toggle('hidden', !isVisible);
      if (isVisible) anyVisible = true;
    });

    let empty = this.document.getElementById('grid-empty-row');
    if (!anyVisible) {
      if (!empty) {
        tbody.insertAdjacentHTML(
          'beforeend',
          '<tr id="grid-empty-row"><td colspan="9" class="py-12 text-center">' +
            '<i class="icon-search-x text-3xl text-gray-300 dark:text-slate-600" aria-hidden="true"></i>' +
            '<p class="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">No cases match these filters</p>' +
            '<p class="text-xs text-gray-400">Try clearing the search, severity or location filter.</p></td></tr>',
        );
      }
    } else if (empty) {
      empty.remove();
    }

    if (typeof HSStaticMethods !== 'undefined') HSStaticMethods.autoInit();
  }

  /* --- Case drawer --------------------------------------------------------- */

  private vitalTile(label: string, value: number | string, unit: string, alert: boolean): string {
    return (
      '<div class="tc-vital' + (alert ? ' is-alert' : '') + '">' +
      '<p class="text-[9px] font-bold uppercase tracking-wider text-gray-400">' + label + '</p>' +
      '<p class="mt-0.5 text-base font-extrabold tabular-nums ' + (alert ? 'text-danger' : 'text-gray-900') + '">' +
      value + '<span class="ml-0.5 text-[10px] font-bold text-gray-400">' + unit + '</span></p></div>'
    );
  }

  private openDrawer(id: string): void {
    const drawer = this.byId('drawer');
    if (!drawer) return;
    const c = this.CASES.find((x) => x.id === id);
    if (!c) return;
    const s = this.SEVERITY[c.severity];

    const avatar = this.byId('dw-avatar');
    if (avatar) avatar.textContent = this.initials(c.name);
    const title = this.byId('dw-title');
    if (title) title.textContent = c.name;
    const sub = this.byId('dw-sub');
    if (sub) sub.textContent = c.id + ' · ' + c.age + ' yrs · ' + c.gender + ' · arrived ' + c.arrival;

    const chips = this.byId('dw-chips');
    if (chips) {
      chips.innerHTML =
        '<span class="hms-chip ' + s.tone + '">' + c.severity + '</span>' +
        '<span class="hms-chip tone-info">ISS ' + c.iss + '</span>' +
        '<span class="hms-chip tone-purple">' + this.esc(c.blood) + '</span>' +
        '<span class="hms-chip tone-stable">Team ' + this.esc(c.team) + '</span>' +
        (c.mtp ? '<span class="hms-chip tone-critical">MTP Active</span>' : '');
    }

    const sum: [string, string | number][] = [
      ['Trauma Type', c.type], ['Body Region', c.region], ['Assigned Doctor', c.doctor],
      ['Current Location', c.location], ['Status', c.status], ['Time Since Arrival', c.since + ' min'],
    ];
    const summary = this.byId('dw-summary');
    if (summary) {
      summary.innerHTML = sum
        .map(
          (r) =>
            '<div><dt class="text-[10px] font-bold uppercase tracking-wider text-gray-400">' + r[0] + '</dt>' +
            '<dd class="mt-0.5 text-xs font-bold text-gray-900">' + this.esc(r[1]) + '</dd></div>',
        )
        .join('');
    }

    const v = c.vitals;
    const vitals = this.byId('dw-vitals');
    if (vitals) {
      vitals.innerHTML =
        this.vitalTile('Heart Rate', v.hr, 'bpm', v.hr > 110 || v.hr < 50) +
        this.vitalTile('Blood Pressure', v.bp, 'mmHg', parseInt(v.bp, 10) < 100) +
        this.vitalTile('SpO2', v.spo2, '%', v.spo2 < 94) +
        this.vitalTile('Resp. Rate', v.rr, '/min', v.rr > 22 || v.rr < 10) +
        this.vitalTile('Temp', v.temp, '°F', v.temp < 97 || v.temp > 100.4) +
        this.vitalTile('GCS', v.gcs, '/15', v.gcs < 13);
    }

    const body = this.byId('dw-body');
    if (body) {
      body.innerHTML = this.BODY_PARTS.map((p) => {
        const hit = c.regions.indexOf(p.key) !== -1;
        return (
          '<path class="tc-body-part' + (hit ? ' is-hit' : '') + '" d="' + p.d + '" stroke-width="1" rx="2">' +
          '<title>' + p.label + (hit ? ' — injured' : '') + '</title></path>'
        );
      }).join('');
    }

    const injuries = this.byId('dw-injuries');
    if (injuries) {
      injuries.innerHTML = c.injuries
        .map(
          (i) =>
            '<li class="' + this.SEVERITY[i.sev].tone + ' rounded-xl border border-border-color dark:border-white/10 p-2.5">' +
            '<div class="flex items-center gap-2">' +
            '<span class="size-1.5 rounded-full bg-[var(--tc-accent)] shrink-0" aria-hidden="true"></span>' +
            '<p class="text-[10px] font-bold uppercase tracking-wide text-gray-400 mr-auto">' + this.esc(i.region) + '</p>' +
            '<span class="hms-chip">' + i.sev + '</span></div>' +
            '<p class="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(i.text) + '</p></li>',
        )
        .join('');
    }

    const labs = this.byId('dw-labs');
    if (labs) {
      labs.innerHTML = c.labs
        .map((l) => {
          const f = this.FLAG[l.flag];
          return (
            '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + this.esc(l.name) + '</p>' +
            '<p class="text-xs font-extrabold text-gray-900 tabular-nums">' + this.esc(l.value) + '</p>' +
            '<span class="badge ' + f.chip + '"><i class="' + f.icon + ' text-[9px]" aria-hidden="true"></i>' + f.label + '</span></li>'
          );
        })
        .join('');
    }

    const radiology = this.byId('dw-radiology');
    if (radiology) {
      radiology.innerHTML = c.radiology
        .map(
          (r) =>
            '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            '<i class="icon-scan text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
            '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + this.esc(r.name) + '</p>' +
            '<p class="text-[10px] text-gray-400 truncate">' + this.esc(r.result) + '</p></div>' +
            '<span class="badge ' + this.RAD_STATUS[r.status] + '">' + r.status + '</span></li>',
        )
        .join('');
    }

    const meds = this.byId('dw-meds');
    if (meds) {
      meds.innerHTML = c.meds
        .map(
          (m) =>
            '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            '<span class="grid size-7 shrink-0 place-items-center rounded-lg bg-purple/10 text-purple">' +
            '<i class="icon-pill text-[11px]" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + this.esc(m.name) + '</p>' +
            '<p class="text-[10px] text-gray-400">' + this.esc(m.dose) + '</p></div>' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + this.esc(m.time) + '</span></li>',
        )
        .join('');
    }

    const notes = this.byId('dw-notes');
    if (notes) {
      notes.innerHTML = c.notes
        .map(
          (n) =>
            '<article class="rounded-xl border border-border-color dark:border-white/10 p-3">' +
            '<div class="flex items-center gap-2">' +
            '<span class="hms-member-avatar tone-info size-7! text-[9px]!">' + this.esc(this.initials(n.who)) + '</span>' +
            '<div class="min-w-0 mr-auto"><p class="text-[11px] font-bold text-gray-900 truncate">' + this.esc(n.who) + '</p>' +
            '<p class="text-[9px] font-semibold text-gray-400">' + this.esc(n.role) + '</p></div>' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + this.esc(n.time) + '</span></div>' +
            '<p class="mt-2 text-xs text-gray-600 dark:text-gray-300">' + this.esc(n.text) + '</p></article>',
        )
        .join('');
    }

    const done: Record<string, TimelineEntry> = {};
    c.timeline.forEach((t) => (done[t.stage] = t));

    const timeline = this.byId('dw-timeline');
    if (timeline) {
      timeline.innerHTML = this.STAGES.map((st, i) => {
        const rec = done[st.key];
        const isCurrent = i === c.stage;
        const state = rec && !isCurrent ? 'is-done' : isCurrent ? 'is-current' : '';
        return (
          '<li class="hms-tl-item ' + state + '">' +
          '<span class="hms-tl-node"><i class="' + (rec && !isCurrent ? 'icon-check' : st.icon) + '" aria-hidden="true"></i></span>' +
          '<div class="min-w-0 flex-1 -mt-0.5">' +
          '<div class="flex items-center gap-2">' +
          '<p class="text-xs font-bold ' + (rec || isCurrent ? 'text-gray-900' : 'text-gray-400') + '">' + st.label + '</p>' +
          (rec ? '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + this.esc(rec.time) + '</span>' : '') +
          (isCurrent ? '<span class="hms-chip tone-critical">In progress</span>' : '') +
          '</div>' +
          '<p class="mt-0.5 text-[11px] ' + (rec ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-slate-600') + '">' +
          (rec ? this.esc(rec.text) : 'Not started') + '</p></div></li>'
        );
      }).join('');
    }

    ['dw-act-surgery', 'dw-act-icu', 'dw-act-transfer', 'dw-act-discharge'].forEach((b) => {
      const el = this.byId(b);
      if (el) el.dataset['id'] = c.id;
    });

    drawer.classList.add('is-open');
    this.document.body.style.overflow = 'hidden';
    this.byId('dw-close')?.focus();
  }

  private closeDrawer(): void {
    const drawer = this.byId('drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    this.document.body.style.overflow = '';
  }

  /* --- Modals ---------------------------------------------------------------- */

  private updateAdvice(): void {
    const levelEl = this.byId('am-level') as HTMLSelectElement | null;
    const box = this.byId('am-advice');
    const icon = this.byId('am-advice-icon');
    if (!levelEl || !box || !icon) return;

    const l = this.LEVEL[levelEl.value] || this.LEVEL['1'];
    const iss = parseFloat((this.byId('am-iss') as HTMLInputElement | null)?.value ?? '');

    box.classList.remove('border-danger', 'border-warning', 'border-border-color');
    icon.className = 'shrink-0';

    const bits = [l.team + '-member team paged'];
    if (l.blood) bits.push('2 units O-neg to the bay');
    if (!isNaN(iss) && iss >= 25) bits.push('ISS ' + iss + ' — notify OR and ICU now');
    else if (!isNaN(iss) && iss >= 16) bits.push('ISS ' + iss + ' — serious, expect admission');

    if (levelEl.value === '1') {
      box.classList.add('border-danger');
      icon.classList.add('icon-siren', 'text-danger');
    } else if (levelEl.value === '2') {
      box.classList.add('border-warning');
      icon.classList.add('icon-triangle-alert', 'text-warning');
    } else {
      box.classList.add('border-border-color');
      icon.classList.add('icon-info', 'text-info');
    }
    const text = this.byId('am-advice-text');
    if (text) text.textContent = l.label + ' — ' + l.name + '. ' + bits.join(' · ') + '.';
  }

  private openStatus(id: string): void {
    const modal = this.byId('status-modal');
    if (!modal) return;
    const c = this.CASES.find((x) => x.id === id);
    if (!c) return;
    const sub = this.byId('sm-sub');
    if (sub) sub.textContent = c.name + ' · ' + c.id;
    const status = this.byId('sm-status') as HTMLSelectElement | null;
    if (status) status.value = c.status;
    const location = this.byId('sm-location') as HTMLSelectElement | null;
    if (location) location.value = c.location;
    const notes = this.byId('sm-notes') as HTMLTextAreaElement | null;
    if (notes) notes.value = '';
    const save = this.byId('sm-save');
    if (save) save.dataset['id'] = c.id;
    if (typeof HSOverlay !== 'undefined') HSOverlay.open(modal);
  }

  private openSurgery(id: string): void {
    const modal = this.byId('surgery-modal');
    if (!modal) return;
    const c = this.CASES.find((x) => x.id === id);
    if (!c) return;
    const sub = this.byId('gm-sub');
    if (sub) sub.textContent = c.name + ' · ' + c.id + ' · ' + c.type;
    const procedure = this.byId('gm-procedure') as HTMLInputElement | null;
    if (procedure) procedure.value = '';
    const notes = this.byId('gm-notes') as HTMLTextAreaElement | null;
    if (notes) notes.value = '';
    const save = this.byId('gm-save');
    if (save) save.dataset['id'] = c.id;
    if (typeof HSOverlay !== 'undefined') HSOverlay.open(modal);
  }

  private openTransfer(id: string | null): void {
    const modal = this.byId('transfer-modal');
    if (!modal) return;
    const select = this.byId('tm-case');
    if (select) {
      select.innerHTML = this.open()
        .map((c) => '<option value="' + this.esc(c.id) + '"' + (c.id === id ? ' selected' : '') + '>' + this.esc(c.name) + ' (' + this.esc(c.id) + ')</option>')
        .join('');
    }
    const notes = this.byId('tm-notes') as HTMLTextAreaElement | null;
    if (notes) notes.value = '';
    if (typeof HSOverlay !== 'undefined') HSOverlay.open(modal);
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderSeverity();
    this.renderBoard();
    this.renderGrid();
  }

  /* --- Shared MC.* modal helpers (del-modal only; page has no static markup) --- */

  private delCallback: (() => void) | null = null;

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.close(el);
      return;
    }
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private confirmDelete(name: string, onConfirm: () => void): void {
    const nameEl = this.byId('del-name');
    if (nameEl) nameEl.textContent = name;
    this.delCallback = onConfirm;
    this.openModal('del-modal');
  }

  private initDeleteModal(): void {
    const btn = this.byId('del-confirm-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
        this.closeModal('del-modal');
      });
    }
    const cancel = this.byId('del-cancel-btn');
    if (cancel) cancel.addEventListener('click', () => this.closeModal('del-modal'));
  }

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    if (el) {
      el.addEventListener('mousedown', (e: Event) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
}
