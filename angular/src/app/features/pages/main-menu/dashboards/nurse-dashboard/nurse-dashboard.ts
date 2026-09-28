import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Vital {
  v: number | string;
  u: string;
  ok: boolean;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  bed: string;
  dx: string;
  risk: 'high' | 'medium' | 'low';
  doctor: string;
  allergies: string[];
  isolation: boolean;
  condition: string;
  vitals: Record<string, Vital>;
  taken: string;
  img: string;
}

interface Med {
  time: string;
  min: number;
  patient: string;
  bed: string;
  drug: string;
  status: 'upcoming' | 'done' | 'missed';
  priority: boolean;
  controlled: boolean;
  verify: string;
}

interface Bed {
  n: string;
  state: 'occupied' | 'available' | 'cleaning' | 'isolation' | 'emergency' | 'discharge';
  who?: string;
}

interface Task {
  id: string;
  patient: string;
  text: string;
  pri: 'High' | 'Medium' | 'Low';
  time: string;
  nurse: string;
  lane: string;
}

interface Lane {
  key: string;
  label: string;
  tone: string;
}

interface Alert {
  id: string;
  kind: string;
  code?: boolean;
  icon: string;
  tone: string;
  text: string;
  time: string;
}

interface InboxItem {
  id: string;
  kind: string;
  icon: string;
  tone: string;
  from: string;
  text: string;
  time: string;
}

interface CareItem {
  time: string;
  icon: string;
  tone: string;
  text: string;
}

interface PerfItem {
  label: string;
  val: number | string;
  max?: number;
  pct?: number;
  tone: string;
  icon: string;
  sub?: string;
  invert?: boolean;
}

interface HandoverItem {
  kind: string;
  tone: string;
  icon: string;
  items: string[];
}

interface ActivityItem {
  time: string;
  cat: string;
  icon: string;
  tone: string;
  text: string;
}

interface Step {
  name: string;
  time: string;
  min: number;
  icon: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "Dreams HMS — Nurse
 * Command Center (nurse-dashboard.html)". The hero, shift timeline,
 * patient workspace, vitals watch, medication rounds, ward map, kanban
 * board, alerts, doctor inbox, care timeline, performance gauges,
 * handover panels and activity feed ship as static markup matching this
 * seed data; this only wires the interactive bits (filters, tabs,
 * give/complete, drag-drop, dismiss/accept/ack handlers, hero quick
 * actions and the floating dock) so every widget stays correct after a
 * mutation.
 */
@Component({
  imports: [],
  selector: 'app-nurse-dashboard',
  styleUrl: './nurse-dashboard.css',
  templateUrl: './nurse-dashboard.html',
})
export class NurseDashboard implements AfterViewInit {
  private readonly NOW_MIN = 10 * 60 + 24;
  private readonly SHIFT_START = 7 * 60;
  private readonly SHIFT_END = 15 * 60;

  private readonly STEPS: Step[] = [
    { name: 'Shift Start', time: '7:00 AM', min: 420, icon: 'icon-sunrise' },
    { name: 'Medication Round', time: '8:00 AM', min: 480, icon: 'icon-pill' },
    { name: 'Vitals Check', time: '10:00 AM', min: 600, icon: 'icon-activity' },
    { name: 'Doctor Round', time: '11:30 AM', min: 690, icon: 'icon-stethoscope' },
    { name: 'Patient Care', time: '1:00 PM', min: 780, icon: 'icon-heart-handshake' },
    { name: 'Shift Handover', time: '2:45 PM', min: 885, icon: 'icon-arrow-left-right' },
  ];

  private readonly PATIENTS: Patient[] = [
    { id: 'p1', name: 'Harold Nakamura', age: 71, bed: '4B-01', dx: 'CHF exacerbation', risk: 'high', doctor: 'Dr. Chen', allergies: ['Penicillin'], isolation: false, condition: 'Fluid overload improving on IV furosemide; strict I/O charting.', vitals: { hr: { v: 96, u: 'bpm', ok: true }, bp: { v: '148/92', u: 'mmHg', ok: false }, temp: { v: 37.1, u: '°C', ok: true }, spo2: { v: 91, u: '%', ok: false }, rr: { v: 22, u: '/min', ok: false }, glu: { v: 6.4, u: 'mmol/L', ok: true } }, taken: '10:05 AM', img: 'assets/img/avatar/avatar-01.jpg' },
    { id: 'p2', name: 'Selma Björk', age: 58, bed: '4B-03', dx: 'Post-op cholecystectomy', risk: 'medium', doctor: 'Dr. Osei', allergies: [], isolation: false, condition: 'Day 1 post-op, pain 3/10, tolerating sips; mobilise this afternoon.', vitals: { hr: { v: 84, u: 'bpm', ok: true }, bp: { v: '122/78', u: 'mmHg', ok: true }, temp: { v: 37.6, u: '°C', ok: false }, spo2: { v: 97, u: '%', ok: true }, rr: { v: 16, u: '/min', ok: true }, glu: { v: 5.2, u: 'mmol/L', ok: true } }, taken: '9:48 AM', img: 'assets/img/avatar/avatar-08.jpg' },
    { id: 'p3', name: 'Dmitri Volkov', age: 44, bed: '4B-05', dx: 'Cellulitis, left leg', risk: 'low', doctor: 'Dr. Ferreira', allergies: ['Sulfa drugs'], isolation: false, condition: 'Erythema margin receding; afebrile 24h on IV flucloxacillin.', vitals: { hr: { v: 72, u: 'bpm', ok: true }, bp: { v: '118/74', u: 'mmHg', ok: true }, temp: { v: 36.8, u: '°C', ok: true }, spo2: { v: 99, u: '%', ok: true }, rr: { v: 14, u: '/min', ok: true }, glu: { v: 5.0, u: 'mmol/L', ok: true } }, taken: '9:30 AM', img: 'assets/img/avatar/avatar-06.jpg' },
    { id: 'p4', name: 'Rosa Delgado', age: 82, bed: '4B-07', dx: 'CAP + delirium', risk: 'high', doctor: 'Dr. Chen', allergies: ['Codeine', 'Latex'], isolation: true, condition: 'Droplet precautions. Intermittent confusion overnight — falls mat in place.', vitals: { hr: { v: 104, u: 'bpm', ok: false }, bp: { v: '104/62', u: 'mmHg', ok: true }, temp: { v: 38.4, u: '°C', ok: false }, spo2: { v: 93, u: '%', ok: false }, rr: { v: 24, u: '/min', ok: false }, glu: { v: 7.1, u: 'mmol/L', ok: true } }, taken: '10:12 AM', img: 'assets/img/avatar/avatar-09.jpg' },
  ];

  private readonly RISK_META: Record<string, { label: string; tone: string }> = {
    high: { label: 'High Risk', tone: 'ns-rose' },
    medium: { label: 'Medium', tone: 'ns-amber' },
    low: { label: 'Stable', tone: 'ns-emerald' },
  };

  private MEDS: Med[] = [
    { time: '10:30 AM', min: 630, patient: 'Rosa Delgado', bed: '4B-07', drug: 'Ceftriaxone 1 g IV', status: 'upcoming', priority: true, controlled: false, verify: 'Pharmacy verified' },
    { time: '10:45 AM', min: 645, patient: 'Harold Nakamura', bed: '4B-01', drug: 'Furosemide 40 mg IV', status: 'upcoming', priority: true, controlled: false, verify: 'Pharmacy verified' },
    { time: '11:00 AM', min: 660, patient: 'Selma Björk', bed: '4B-03', drug: 'Oxycodone 5 mg PO', status: 'upcoming', priority: false, controlled: true, verify: 'Second signature required' },
    { time: '12:00 PM', min: 720, patient: 'Theo Lindqvist', bed: '4B-09', drug: 'Insulin glargine 18 u SC', status: 'upcoming', priority: false, controlled: false, verify: 'Pharmacy verified' },
    { time: '12:00 PM', min: 720, patient: 'Dmitri Volkov', bed: '4B-05', drug: 'Flucloxacillin 1 g IV', status: 'upcoming', priority: false, controlled: false, verify: 'Pharmacy verified' },
    { time: '8:00 AM', min: 480, patient: 'Harold Nakamura', bed: '4B-01', drug: 'Bisoprolol 5 mg PO', status: 'done', priority: false, controlled: false, verify: 'Double-checked' },
    { time: '8:05 AM', min: 485, patient: 'Rosa Delgado', bed: '4B-07', drug: 'Paracetamol 1 g PO', status: 'done', priority: false, controlled: false, verify: 'Double-checked' },
    { time: '8:15 AM', min: 495, patient: 'Margaret Whitfield', bed: '4B-11', drug: 'Enoxaparin 40 mg SC', status: 'done', priority: false, controlled: false, verify: 'Double-checked' },
    { time: '8:20 AM', min: 500, patient: 'Theo Lindqvist', bed: '4B-09', drug: 'Insulin aspart 6 u SC', status: 'done', priority: false, controlled: false, verify: 'Double-checked' },
    { time: '9:00 AM', min: 540, patient: 'Selma Björk', bed: '4B-03', drug: 'Ondansetron 4 mg IV', status: 'missed', priority: false, controlled: false, verify: 'Patient in imaging — rebook' },
  ];

  private readonly BEDS: Bed[] = [
    { n: '01', state: 'occupied', who: 'Harold Nakamura' }, { n: '02', state: 'available' },
    { n: '03', state: 'occupied', who: 'Selma Björk' }, { n: '04', state: 'cleaning' },
    { n: '05', state: 'occupied', who: 'Dmitri Volkov' }, { n: '06', state: 'available' },
    { n: '07', state: 'isolation', who: 'Rosa Delgado' }, { n: '08', state: 'emergency', who: 'Incoming — ED transfer' },
    { n: '09', state: 'occupied', who: 'Theo Lindqvist' }, { n: '10', state: 'cleaning' },
    { n: '11', state: 'discharge', who: 'Margaret Whitfield' }, { n: '12', state: 'available' },
  ];

  private readonly BED_META: Record<string, { label: string; cls: string; icon: string }> = {
    available: { label: 'Available', cls: 'is-available', icon: '' },
    occupied: { label: 'Occupied', cls: 'is-occupied', icon: '' },
    cleaning: { label: 'Cleaning', cls: 'is-cleaning', icon: 'icon-spray-can' },
    isolation: { label: 'Isolation', cls: 'is-isolation', icon: 'icon-shield-alert' },
    emergency: { label: 'Emergency', cls: 'is-emergency', icon: 'icon-siren' },
    discharge: { label: 'Discharge today', cls: 'is-discharge', icon: 'icon-log-out' },
  };

  private TASKS: Task[] = [
    { id: 't1', patient: 'Rosa Delgado', text: 'Repeat blood cultures before next dose', pri: 'High', time: '10:30 AM', nurse: 'Amara M.', lane: 'pending' },
    { id: 't2', patient: 'Harold Nakamura', text: 'Daily weight + strict fluid balance', pri: 'High', time: '11:00 AM', nurse: 'Amara M.', lane: 'pending' },
    { id: 't3', patient: 'Margaret Whitfield', text: 'Discharge checklist + TTO meds teaching', pri: 'Medium', time: '1:30 PM', nurse: 'Jonas P.', lane: 'pending' },
    { id: 't4', patient: 'Selma Björk', text: 'First mobilisation with physio', pri: 'Medium', time: 'In progress', nurse: 'Priya K.', lane: 'progress' },
    { id: 't5', patient: 'Theo Lindqvist', text: 'Step glucose checks to 4-hourly', pri: 'Low', time: 'In progress', nurse: 'Amara M.', lane: 'progress' },
    { id: 't6', patient: 'Dmitri Volkov', text: 'Mark cellulitis margin, photo for notes', pri: 'Low', time: '9:10 AM', nurse: 'Jonas P.', lane: 'done' },
    { id: 't7', patient: 'Rosa Delgado', text: 'Falls risk reassessment', pri: 'High', time: '8:40 AM', nurse: 'Amara M.', lane: 'done' },
    { id: 't8', patient: 'Harold Nakamura', text: '8 AM electrolytes — lab draw', pri: 'High', time: 'Due 8:00 AM', nurse: 'Priya K.', lane: 'delayed' },
  ];

  private readonly LANES: Lane[] = [
    { key: 'pending', label: 'Pending', tone: 'ns-amber' },
    { key: 'progress', label: 'In Progress', tone: 'ns-cyan' },
    { key: 'done', label: 'Completed', tone: 'ns-emerald' },
    { key: 'delayed', label: 'Delayed', tone: 'ns-rose' },
  ];

  private readonly PRI_TONE: Record<string, string> = { High: 'ns-rose', Medium: 'ns-amber', Low: 'ns-emerald' };

  private ALERTS: Alert[] = [
    { id: 'a1', kind: 'Code Blue', code: true, icon: 'icon-siren', tone: 'ns-rose', text: 'Ward 3A — resuscitation team responding. 4B on standby for overflow.', time: '10:18 AM' },
    { id: 'a2', kind: 'Critical Patient', icon: 'icon-heart-pulse', tone: 'ns-rose', text: 'Rosa Delgado (4B-07) — temp 38.4°C, RR 24. Sepsis screen started.', time: '10:12 AM' },
    { id: 'a3', kind: 'Fall Risk', icon: 'icon-person-standing', tone: 'ns-amber', text: 'Rosa Delgado attempted to stand unassisted overnight. Bed-exit alarm on.', time: '9:55 AM' },
    { id: 'a4', kind: 'Medication Delay', icon: 'icon-pill', tone: 'ns-amber', text: 'Ondansetron for Selma Björk missed — patient in imaging. Rebook now.', time: '9:20 AM' },
  ];

  private INBOX: InboxItem[] = [
    { id: 'r1', kind: 'New Order', icon: 'icon-file-plus', tone: 'ns-cyan', from: 'Dr. Chen', text: 'Increase furosemide to 40 mg BD for Harold Nakamura — recheck U&E at 4 PM.', time: '10:15 AM' },
    { id: 'r2', kind: 'Lab Request', icon: 'icon-flask-conical', tone: 'ns-violet', from: 'Dr. Chen', text: 'Blood cultures ×2 for Rosa Delgado before next antibiotic dose.', time: '10:10 AM' },
    { id: 'r3', kind: 'Pending Instruction', icon: 'icon-clock', tone: 'ns-amber', from: 'Dr. Osei', text: 'Confirm oral intake for Selma Björk before switching analgesia to PO.', time: '9:40 AM' },
  ];

  private readonly CARE: Record<string, CareItem[]> = {
    p1: [
      { time: '10:05 AM', icon: 'icon-activity', tone: 'ns-teal', text: 'Vitals recorded — BP 148/92, SpO₂ 91% on 2 L' },
      { time: '9:30 AM', icon: 'icon-droplets', tone: 'ns-cyan', text: 'Fluid balance updated — net −850 mL since midnight' },
      { time: '8:00 AM', icon: 'icon-pill', tone: 'ns-violet', text: 'Bisoprolol 5 mg given with obs check' },
      { time: '7:20 AM', icon: 'icon-clipboard-list', tone: 'ns-amber', text: 'Night shift notes reviewed at bedside handover' },
    ],
    p4: [
      { time: '10:12 AM', icon: 'icon-activity', tone: 'ns-rose', text: 'Vitals recorded — febrile 38.4°C, escalated to Dr. Chen' },
      { time: '9:55 AM', icon: 'icon-person-standing', tone: 'ns-amber', text: 'Fall-risk reassessed — bed-exit alarm activated' },
      { time: '8:45 AM', icon: 'icon-flask-conical', tone: 'ns-violet', text: 'Lab sample collected — FBC, CRP, lactate' },
      { time: '8:05 AM', icon: 'icon-pill', tone: 'ns-violet', text: 'Paracetamol 1 g given for pyrexia' },
      { time: '7:30 AM', icon: 'icon-utensils', tone: 'ns-emerald', text: 'Breakfast served — soft diet, 40% taken with assistance' },
    ],
    p2: [
      { time: '9:48 AM', icon: 'icon-activity', tone: 'ns-teal', text: 'Vitals recorded — low-grade temp 37.6°C, monitoring' },
      { time: '9:15 AM', icon: 'icon-stethoscope', tone: 'ns-cyan', text: 'Dr. Osei reviewed wound — dressing dry and intact' },
      { time: '8:30 AM', icon: 'icon-accessibility', tone: 'ns-emerald', text: 'Physiotherapy — sat out of bed 20 min, tolerated well' },
      { time: '7:45 AM', icon: 'icon-pen-line', tone: 'ns-amber', text: 'Shift note — pain 3/10 on movement, PRN charted' },
    ],
  };

  private readonly PERF: PerfItem[] = [
    { label: 'Patients Managed', val: 6, max: 6, tone: 'ns-teal', icon: 'icon-users' },
    { label: 'Tasks Completed', val: 9, max: 14, tone: 'ns-emerald', icon: 'icon-list-checks' },
    { label: 'Meds Given', val: 4, max: 10, tone: 'ns-violet', icon: 'icon-pill' },
    { label: 'Avg Response', val: '3.2m', pct: 82, tone: 'ns-cyan', icon: 'icon-timer', sub: 'target < 5m' },
    { label: 'Pending Tasks', val: 3, max: 14, tone: 'ns-amber', icon: 'icon-hourglass', invert: true },
    { label: 'Vitals On Time', val: '94%', pct: 94, tone: 'ns-rose', icon: 'icon-activity' },
  ];

  private readonly HANDOVER: HandoverItem[] = [
    { kind: 'Outgoing Notes', tone: 'ns-violet', icon: 'icon-log-out', items: ['Rosa Delgado sepsis screen in progress — cultures before 10:30 dose', 'Harold Nakamura on strict I/O; daily weight pending'] },
    { kind: 'Incoming Notes', tone: 'ns-cyan', icon: 'icon-log-in', items: ['Night shift reported Rosa confused ×2, settled with reorientation', "Theo's insulin infusion stopped 6 AM — watch pre-lunch glucose"] },
    { kind: 'Critical Patients', tone: 'ns-rose', icon: 'icon-heart-pulse', items: ['Rosa Delgado (4B-07) — febrile, delirium, isolation', 'Harold Nakamura (4B-01) — SpO₂ 91%, on diuresis'] },
    { kind: 'Special Instructions', tone: 'ns-amber', icon: 'icon-badge-alert', items: ['Controlled drug check due 2 PM — two signatures', 'PPE audit for isolation bay at 1 PM', 'Margaret Whitfield family collecting at 3 PM'] },
  ];

  private ACTIVITY: ActivityItem[] = [
    { time: '10:18 AM', cat: 'Alerts', icon: 'icon-siren', tone: 'ns-rose', text: 'Code Blue announced on 3A — 4B standby acknowledged' },
    { time: '10:15 AM', cat: 'Orders', icon: 'icon-file-plus', tone: 'ns-cyan', text: 'New order from Dr. Chen — furosemide increased for 4B-01' },
    { time: '10:12 AM', cat: 'Vitals', icon: 'icon-activity', tone: 'ns-teal', text: 'Vitals charted for Rosa Delgado — escalated for fever' },
    { time: '10:05 AM', cat: 'Vitals', icon: 'icon-activity', tone: 'ns-teal', text: 'Vitals charted for Harold Nakamura' },
    { time: '9:52 AM', cat: 'Labs', icon: 'icon-flask-conical', tone: 'ns-violet', text: 'Lab porter collected morning bloods (5 patients)' },
    { time: '9:45 AM', cat: 'Meds', icon: 'icon-pill', tone: 'ns-violet', text: 'Missed dose flagged — ondansetron for 4B-03 rebooked' },
    { time: '9:30 AM', cat: 'Transfers', icon: 'icon-bed', tone: 'ns-amber', text: 'Bed 4B-04 released to cleaning after transfer to 2C' },
    { time: '9:10 AM', cat: 'Discharges', icon: 'icon-log-out', tone: 'ns-emerald', text: 'Discharge started for Margaret Whitfield — TTOs to pharmacy' },
    { time: '8:20 AM', cat: 'Meds', icon: 'icon-pill', tone: 'ns-violet', text: 'Morning medication round completed — 4 of 4 given' },
    { time: '7:05 AM', cat: 'Orders', icon: 'icon-clipboard-list', tone: 'ns-cyan', text: 'Bedside handover completed — 6 patients accepted' },
  ];

  private readonly VITAL_DEFS = [
    { k: 'hr', label: 'Heart Rate', icon: 'icon-heart-pulse', color: 'var(--ns-rose)', spark: [72, 78, 84, 80, 88, 92, 96] },
    { k: 'bp', label: 'Blood Pressure', icon: 'icon-gauge', color: 'var(--ns-violet)', spark: [70, 72, 68, 74, 76, 75, 78] },
    { k: 'temp', label: 'Temperature', icon: 'icon-thermometer', color: 'var(--ns-amber)', spark: [50, 52, 55, 54, 58, 60, 57] },
    { k: 'spo2', label: 'SpO₂', icon: 'icon-wind', color: 'var(--ns-cyan)', spark: [88, 86, 84, 85, 82, 80, 78] },
    { k: 'rr', label: 'Respiration', icon: 'icon-waves', color: 'var(--ns-teal)', spark: [40, 42, 45, 44, 48, 50, 52] },
    { k: 'glu', label: 'Blood Sugar', icon: 'icon-droplet', color: 'var(--ns-emerald)', spark: [60, 58, 55, 52, 50, 48, 46] },
  ];

  private readonly MED_TABS = [
    { key: 'upcoming', label: 'Upcoming', tone: 'ns-cyan' },
    { key: 'done', label: 'Completed', tone: 'ns-emerald' },
    { key: 'missed', label: 'Missed', tone: 'ns-rose' },
  ];

  private riskFilter = 'all';
  private medTab = 'upcoming';
  private actFilter = 'All';

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    // NOTE: the patient selector options, shift steps, patient workspace,
    // vitals, medication rounds, ward map, kanban board, alerts, doctor
    // inbox, care timeline, performance gauges, handover panels and
    // activity feed are pre-rendered as static HTML directly in the page.
    // The render*() methods below are kept and still run on demand from
    // the event handlers (filters, tabs, give/complete, drag-drop, etc.)
    // to keep every widget fully interactive after the initial paint.
    this.renderHero();

    this.byId('vitals-sel')?.addEventListener('change', () => this.renderVitals());

    this.document.querySelectorAll('[data-risk]').forEach((b) =>
      b.addEventListener('click', () => {
        this.riskFilter = (b as HTMLElement).dataset['risk'] || 'all';
        this.document.querySelectorAll('[data-risk]').forEach((x) => {
          const el = x as HTMLElement;
          const on = el.dataset['risk'] === this.riskFilter;
          el.setAttribute('aria-pressed', String(on));
          el.classList.toggle('opacity-50', !on);
        });
        this.renderPatients();
      })
    );

    this.byId('patients')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const name = this.pName(btn.dataset['p']);
      const act = btn.dataset['act'] || '';
      const msgs: Record<string, string> = {
        view: `Opening chart for ${name}.`,
        vitals: `Vitals entry opened for ${name}.`,
        med: `eMAR opened — scan wristband for ${name}.`,
        call: `Paging assigned doctor for ${name}.`,
        note: `Nursing note started for ${name}.`,
      };
      this.toast(msgs[act] || '', act === 'call' ? 'info' : 'success');
    });

    this.byId('med-tabs')?.addEventListener('click', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-tab]') as HTMLElement | null;
      if (!t) return;
      this.medTab = t.dataset['tab'] || 'upcoming';
      this.renderMeds();
    });
    this.byId('meds')?.addEventListener('click', (e: Event) => {
      const g = (e.target as HTMLElement).closest('[data-give]') as HTMLElement | null;
      if (!g) return;
      const m = this.MEDS[parseInt(g.dataset['give'] || '-1', 10)];
      if (!m) return;
      if (m.controlled) this.toast(`Controlled drug — second nurse signature requested for ${m.patient}.`, 'info');
      m.status = 'done';
      m.verify = 'Double-checked';
      this.renderMeds();
      this.renderHero();
      this.toast(`${m.drug} recorded as given to ${m.patient}.`, 'success');
    });

    this.byId('kanban')?.addEventListener('click', (e: Event) => {
      const d = (e.target as HTMLElement).closest('[data-done]') as HTMLElement | null;
      if (!d) return;
      const t = this.TASKS.find((x) => x.id === d.dataset['done']);
      if (!t) return;
      t.lane = 'done';
      this.renderKanban();
      this.toast(`Task completed — ${t.text}`, 'success');
    });

    this.wireKanbanDrag();

    this.byId('alerts')?.addEventListener('click', (e: Event) => {
      const a = (e.target as HTMLElement).closest('[data-ack]') as HTMLElement | null;
      if (!a) return;
      this.ALERTS = this.ALERTS.filter((x) => x.id !== a.dataset['ack']);
      this.renderAlerts();
      this.renderHero();
    });
    this.byId('btn-ack-all')?.addEventListener('click', () => {
      if (!this.ALERTS.length) {
        this.toast('No alerts to acknowledge.', 'info');
        return;
      }
      this.ALERTS = [];
      this.renderAlerts();
      this.renderHero();
      this.toast('All ward alerts acknowledged.', 'success');
    });

    this.byId('inbox')?.addEventListener('click', (e: Event) => {
      const a = (e.target as HTMLElement).closest('[data-accept]') as HTMLElement | null;
      if (!a) return;
      const r = this.INBOX.find((x) => x.id === a.dataset['accept']);
      if (!r) return;
      this.INBOX = this.INBOX.filter((x) => x.id !== r.id);
      this.renderInbox();
      this.toast(`${r.kind} from ${r.from} accepted and added to tasks.`, 'success');
    });

    this.byId('act-filters')?.addEventListener('click', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-cat]') as HTMLElement | null;
      if (!c) return;
      this.actFilter = c.dataset['cat'] || 'All';
      this.renderActivity();
    });

    this.byId('btn-vitals')?.addEventListener('click', () => this.toast('Vitals entry opened — select a patient from the workspace.', 'info'));
    this.byId('btn-meds')?.addEventListener('click', () => this.toast('Medication round view pinned — 5 doses remaining.', 'info'));
    this.byId('btn-handover')?.addEventListener('click', () => this.toast('Handover sheet compiled from today\'s notes.', 'success'));
    this.byId('btn-print')?.addEventListener('click', () => this.toast('Handover sheet sent to the ward printer.', 'success'));

    this.wireDock();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private escapeHtml(value: string | number | null | undefined): string {
    return String(value ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
    );
  }

  private toast(message: string, tone: 'success' | 'info' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  private initials(n: string): string {
    return n
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  private pName(id: string | undefined): string {
    return this.PATIENTS.find((p) => p.id === id)?.name || '';
  }

  private fmtLeft(mins: number): string {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return (h ? h + 'h ' : '') + m + 'm';
  }

  /* ---------------- Hero ---------------- */

  private renderHero(): void {
    const factBeds = this.byId('fact-beds');
    if (factBeds) factBeds.textContent = this.BEDS.filter((b) => b.state !== 'available').length + ' of ' + this.BEDS.length;
    const factMeds = this.byId('fact-meds');
    if (factMeds) factMeds.textContent = this.MEDS.filter((m) => m.status === 'upcoming' && m.min <= this.NOW_MIN + 60).length + ' due';
    const factRisk = this.byId('fact-risk');
    if (factRisk) factRisk.textContent = this.PATIENTS.filter((p) => p.risk === 'high').length + ' watch';

    const pct = Math.min(1, Math.max(0, (this.NOW_MIN - this.SHIFT_START) / (this.SHIFT_END - this.SHIFT_START)));
    const C = 2 * Math.PI * 52;
    const fill = this.byId('count-fill');
    if (fill) {
      fill.setAttribute('stroke-dasharray', C.toFixed(1));
      fill.setAttribute('stroke-dashoffset', (C * (1 - pct)).toFixed(1));
    }
    const countLeft = this.byId('count-left');
    if (countLeft) countLeft.textContent = this.fmtLeft(this.SHIFT_END - this.NOW_MIN);

    const strip = this.byId('code-strip');
    if (!strip) return;
    const code = this.ALERTS.find((a) => a.code);
    if (code) {
      strip.classList.add('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
        `<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Emergency status — ${this.escapeHtml(code.kind)}</p>` +
        `<p class="mt-0.5 text-xs font-medium text-white/70">${this.escapeHtml(code.text)}</p></div>` +
        '<button type="button" id="btn-standby" class="ns-action shrink-0"><i class="icon-check" aria-hidden="true"></i>Acknowledge</button>';
      this.byId('btn-standby')?.addEventListener('click', () => {
        this.ALERTS = this.ALERTS.filter((a) => !a.code);
        this.renderHero();
        this.renderAlerts();
        this.toast('Code Blue standby acknowledged for Ward 4B.', 'success');
      });
    } else {
      strip.classList.remove('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Emergency status — all clear</p>' +
        '<p class="mt-0.5 text-xs font-medium text-white/70">No active codes on Ward 4B. Crash trolley checked 7:10 AM · next check 7:00 PM.</p></div>';
    }
  }

  /* ---------------- Shift timeline ---------------- */

  private renderSteps(): void {
    const wrap = this.byId('steps');
    if (!wrap) return;
    let current = 0;
    this.STEPS.forEach((s, i) => {
      if (s.min <= this.NOW_MIN) current = i;
    });
    wrap.innerHTML = this.STEPS.map((s, i) => {
      const state = i < current ? 'is-done' : i === current ? 'is-now' : '';
      return (
        `<li class="ns-step ${state}">` +
        `<span class="ns-step-node"><i class="${s.icon}" aria-hidden="true"></i></span>` +
        `<div><p class="ns-step-name">${this.escapeHtml(s.name)}</p><p class="ns-step-time">${this.escapeHtml(s.time)}</p></div>` +
        (i === current ? '<span class="ns-chip ns-cyan">Now</span>' : '') +
        '</li>'
      );
    }).join('');
    const chip = this.byId('steps-chip');
    if (chip) chip.textContent = this.STEPS[current].name + ' in progress';
  }

  /* ---------------- Patients ---------------- */

  private renderPatients(): void {
    const wrap = this.byId('patients');
    if (!wrap) return;
    const list = this.PATIENTS.filter((p) => this.riskFilter === 'all' || p.risk === this.riskFilter);
    wrap.innerHTML =
      list
        .map((p) => {
          const r = this.RISK_META[p.risk];
          const abn = Object.values(p.vitals).filter((v) => !v.ok).length;
          return (
            `<article class="ns-pt risk-${p.risk}">` +
            '<div class="flex items-start gap-3">' +
            `<span class="ns-pt-avatar">${p.img ? `<img src="${this.escapeHtml(p.img)}" alt="${this.escapeHtml(p.name)}">` : this.escapeHtml(this.initials(p.name))}</span>` +
            '<div class="min-w-0 flex-1">' +
            `<div class="flex items-center gap-2"><h3 class="truncate text-[13px] font-extrabold text-gray-900">${this.escapeHtml(p.name)}</h3><span class="ns-pt-bed"><i class="icon-bed text-[10px]" aria-hidden="true"></i>${this.escapeHtml(p.bed)}</span></div>` +
            `<p class="mt-0.5 text-[11px] font-semibold text-gray-500">${p.age} yrs · ${this.escapeHtml(p.dx)} · ${this.escapeHtml(p.doctor)}</p>` +
            '<div class="mt-1.5 flex flex-wrap gap-1">' +
            `<span class="ns-pt-tag ${r.tone} ns-chip">${r.label}</span>` +
            (p.isolation ? '<span class="ns-pt-tag ns-violet ns-chip"><i class="icon-shield-alert text-[9px]" aria-hidden="true"></i>Isolation</span>' : '') +
            (p.allergies.length ? `<span class="ns-pt-tag ns-rose ns-chip"><i class="icon-triangle-alert text-[9px]" aria-hidden="true"></i>${this.escapeHtml(p.allergies.join(', '))}</span>` : '<span class="ns-pt-tag ns-emerald ns-chip">No allergies</span>') +
            (abn ? `<span class="ns-pt-tag ns-rose ns-chip">${abn} abnormal vitals</span>` : '') +
            '</div>' +
            `<p class="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">${this.escapeHtml(p.condition)}</p>` +
            '</div></div>' +
            `<div class="ns-pt-actions" role="group" aria-label="Actions for ${this.escapeHtml(p.name)}">` +
            `<button type="button" class="ns-pt-btn" data-act="view" data-p="${p.id}" title="View patient" aria-label="View patient"><i class="icon-eye" aria-hidden="true"></i></button>` +
            `<button type="button" class="ns-pt-btn" data-act="vitals" data-p="${p.id}" title="Record vitals" aria-label="Record vitals"><i class="icon-activity" aria-hidden="true"></i></button>` +
            `<button type="button" class="ns-pt-btn" data-act="med" data-p="${p.id}" title="Administer medicine" aria-label="Administer medicine"><i class="icon-pill" aria-hidden="true"></i></button>` +
            `<button type="button" class="ns-pt-btn" data-act="call" data-p="${p.id}" title="Call doctor" aria-label="Call doctor"><i class="icon-phone" aria-hidden="true"></i></button>` +
            `<button type="button" class="ns-pt-btn" data-act="note" data-p="${p.id}" title="Add nursing note" aria-label="Add nursing note"><i class="icon-pen-line" aria-hidden="true"></i></button>` +
            `<span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">Obs ${this.escapeHtml(p.taken)}</span>` +
            '</div></article>'
          );
        })
        .join('') || '<p class="col-span-full py-6 text-center text-xs font-semibold text-gray-400">No patients match this filter.</p>';
  }

  /* ---------------- Vitals ---------------- */

  private sparkPath(pts: number[]): string {
    const w = 64;
    const h = 22;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = max - min || 1;
    return pts
      .map((p, i) => (i ? 'L' : 'M') + ((i / (pts.length - 1)) * w).toFixed(1) + ' ' + (h - ((p - min) / span) * (h - 4) - 2).toFixed(1))
      .join(' ');
  }

  private renderVitals(): void {
    const sel = this.byId('vitals-sel') as HTMLSelectElement | null;
    const p = this.PATIENTS.find((x) => x.id === sel?.value) || this.PATIENTS[0];
    const wrap = this.byId('vitals');
    if (wrap) {
      wrap.innerHTML = this.VITAL_DEFS.map((d) => {
        const v = p.vitals[d.k];
        return (
          `<div class="ns-vital${v.ok ? '' : ' is-abnormal'}" style="--ns-v:${d.color}">` +
          `<div class="flex items-center justify-between"><span class="ns-vital-icon"><i class="${d.icon}" aria-hidden="true"></i></span>` +
          (v.ok ? '' : '<span class="ns-chip ns-rose text-[9px]">Abnormal</span>') +
          '</div>' +
          `<p class="mt-2 ns-vital-val">${this.escapeHtml(v.v)} <span class="text-[10px] font-bold text-gray-400">${this.escapeHtml(v.u)}</span></p>` +
          `<div class="mt-1 flex items-end justify-between"><p class="text-[10px] font-bold text-gray-400">${d.label}</p>` +
          `<svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true"><path class="ns-spark" d="${this.sparkPath(d.spark)}"/></svg></div>` +
          '</div>'
        );
      }).join('');
    }
    const abn = Object.values(p.vitals).filter((v) => !v.ok).length;
    const chip = this.byId('vitals-chip');
    if (chip) chip.textContent = abn ? abn + ' flagged' : 'All normal';
    const when = this.byId('vitals-when');
    if (when) when.textContent = p.taken + ' · ' + p.name.split(' ')[0];
  }

  /* ---------------- Medications ---------------- */

  private renderMeds(): void {
    const tabs = this.byId('med-tabs');
    if (tabs) {
      tabs.innerHTML = this.MED_TABS.map((t) => {
        const n = this.MEDS.filter((m) => m.status === t.key).length;
        return `<button type="button" role="tab" aria-selected="${this.medTab === t.key}" data-tab="${t.key}" class="ns-chip ${t.tone} cursor-pointer${this.medTab === t.key ? '' : ' opacity-50'}">${t.label} · ${n}</button>`;
      }).join('');
    }

    const wrap = this.byId('meds');
    if (wrap) {
      const list = this.MEDS.filter((m) => m.status === this.medTab).sort((a, b) => a.min - b.min);
      wrap.innerHTML =
        list
          .map((m) => {
            const due = m.status === 'upcoming' && m.min - this.NOW_MIN <= 30;
            const tone = m.status === 'missed' ? 'ns-rose' : m.controlled ? 'ns-violet' : m.priority ? 'ns-amber' : 'ns-teal';
            return (
              `<div class="ns-med ${tone}${due ? ' is-due' : ''}">` +
              `<span class="ns-med-dot"><i class="${m.status === 'done' ? 'icon-check' : m.status === 'missed' ? 'icon-x' : 'icon-clock'}" aria-hidden="true"></i></span>` +
              '<div class="ns-med-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
              `<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">${this.escapeHtml(m.time)}</p>` +
              (m.priority ? '<span class="ns-chip ns-amber text-[9px]"><i class="icon-zap text-[9px]" aria-hidden="true"></i>High priority</span>' : '') +
              (m.controlled ? '<span class="ns-cd"><i class="icon-lock text-[9px]" aria-hidden="true"></i>Controlled</span>' : '') +
              (m.status === 'upcoming' ? `<button type="button" data-give="${this.MEDS.indexOf(m)}" class="ml-auto rounded-lg bg-teal-500/10 px-2 py-1 text-[10px] font-extrabold text-teal-600 transition-colors hover:bg-teal-500/20 dark:text-teal-300">Give now</button>` : '') +
              '</div>' +
              `<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">${this.escapeHtml(m.drug)}</p>` +
              `<p class="mt-0.5 text-[11px] font-semibold text-gray-500">${this.escapeHtml(m.patient)} · ${this.escapeHtml(m.bed)}</p>` +
              `<p class="mt-1 text-[10px] font-semibold text-gray-400"><i class="icon-badge-check text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(m.verify)}</p>` +
              '</div></div>'
            );
          })
          .join('') || '<p class="py-6 text-center text-xs font-semibold text-gray-400">Nothing here — round is clear.</p>';
    }

    const statsWrap = this.byId('med-stats');
    if (statsWrap) {
      const stats = [
        { label: 'Given', n: this.MEDS.filter((m) => m.status === 'done').length, tone: 'ns-emerald', icon: 'icon-check' },
        { label: 'Due < 1 hr', n: this.MEDS.filter((m) => m.status === 'upcoming' && m.min <= this.NOW_MIN + 60).length, tone: 'ns-amber', icon: 'icon-clock' },
        { label: 'Missed', n: this.MEDS.filter((m) => m.status === 'missed').length, tone: 'ns-rose', icon: 'icon-x' },
        { label: 'Controlled', n: this.MEDS.filter((m) => m.controlled && m.status !== 'done').length, tone: 'ns-violet', icon: 'icon-lock' },
      ];
      statsWrap.innerHTML = stats
        .map(
          (s) =>
            `<div class="ns-panel ${s.tone} !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="ns-panel-icon !size-8 text-xs"><i class="${s.icon}" aria-hidden="true"></i></span><div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">${s.n}</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">${s.label}</p></div></div>`
        )
        .join('');
    }
  }

  /* ---------------- Ward map ---------------- */

  private renderWard(): void {
    const wrap = this.byId('ward');
    if (wrap) {
      wrap.innerHTML = this.BEDS.map((b) => {
        const m = this.BED_META[b.state];
        return `<div class="ns-bed ${m.cls}" title="${this.escapeHtml('Bed ' + b.n + ' — ' + m.label + (b.who ? ' · ' + b.who : ''))}">${b.n}${m.icon ? `<span class="ns-bed-flag"><i class="${m.icon}" aria-hidden="true"></i></span>` : ''}</div>`;
      }).join('');
    }
    const legend = this.byId('ward-legend');
    if (legend) {
      legend.innerHTML = Object.values(this.BED_META)
        .map((m) => `<span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><span class="ns-bed ${m.cls} !aspect-auto !size-3 !rounded"></span>${m.label}</span>`)
        .join('');
    }
    const occ = this.BEDS.filter((b) => b.state !== 'available' && b.state !== 'cleaning').length;
    const chip = this.byId('ward-chip');
    if (chip) chip.textContent = Math.round((occ / this.BEDS.length) * 100) + '% occupied';
    const summary = this.byId('ward-summary');
    if (summary) {
      const sum = [
        { label: 'Free now', n: this.BEDS.filter((b) => b.state === 'available').length, tone: 'text-emerald-500' },
        { label: 'Turning over', n: this.BEDS.filter((b) => b.state === 'cleaning').length, tone: 'text-amber-500' },
        { label: 'Leaving today', n: this.BEDS.filter((b) => b.state === 'discharge').length, tone: 'text-gray-400' },
      ];
      summary.innerHTML = sum
        .map((s) => `<div class="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-white/5"><p class="text-lg font-extrabold tabular-nums ${s.tone}">${s.n}</p><p class="text-[10px] font-bold text-gray-400">${s.label}</p></div>`)
        .join('');
    }
  }

  /* ---------------- Kanban ---------------- */

  private renderKanban(): void {
    const wrap = this.byId('kanban');
    if (wrap) {
      wrap.innerHTML = this.LANES.map((l) => {
        const items = this.TASKS.filter((t) => t.lane === l.key);
        return (
          `<div class="ns-lane ${l.tone}"><div class="mb-2 flex items-center justify-between px-1">` +
          `<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${l.label}</p><span class="ns-chip ${l.tone}">${items.length}</span></div>` +
          `<div class="ns-lane-items" data-lane="${l.key}">` +
          (items
            .map(
              (t) =>
                `<div class="ns-task" draggable="true" data-task="${t.id}"><div class="flex items-center gap-1.5">` +
                `<span class="ns-chip ${this.PRI_TONE[t.pri]} text-[9px]">${t.pri}</span>` +
                `<span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(t.time)}</span></div>` +
                `<p class="mt-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">${this.escapeHtml(t.text)}</p>` +
                `<div class="mt-1.5 flex items-center justify-between"><p class="text-[10px] font-semibold text-gray-500"><i class="icon-user text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(t.patient)}</p>` +
                `<span class="text-[10px] font-bold text-gray-400">${this.escapeHtml(t.nurse)}</span></div>` +
                (t.lane !== 'done' ? `<button type="button" data-done="${t.id}" class="mt-2 w-full rounded-lg bg-emerald-500/10 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Mark complete</button>` : '') +
                '</div>'
            )
            .join('') || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
          '</div></div>'
        );
      }).join('');
    }
    const open = this.TASKS.filter((t) => t.lane !== 'done').length;
    const chip = this.byId('tasks-chip');
    if (chip) chip.textContent = open + ' open · ' + this.TASKS.filter((t) => t.lane === 'delayed').length + ' delayed';
  }

  private wireKanbanDrag(): void {
    const kanban = this.byId('kanban');
    if (!kanban) return;

    kanban.addEventListener('dragstart', (e: Event) => {
      const de = e as DragEvent;
      const card = (de.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (!card) return;
      if (de.dataTransfer) {
        de.dataTransfer.effectAllowed = 'move';
        de.dataTransfer.setData('text/plain', card.dataset['task'] || '');
      }
      card.classList.add('is-dragging');
    });
    kanban.addEventListener('dragend', (e: Event) => {
      const card = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      card?.classList.remove('is-dragging');
    });
    kanban.addEventListener('dragover', (e: Event) => {
      const de = e as DragEvent;
      const zone = (de.target as HTMLElement).closest('.ns-lane-items') as HTMLElement | null;
      if (!zone) return;
      de.preventDefault();
      if (de.dataTransfer) de.dataTransfer.dropEffect = 'move';
      zone.classList.add('is-over');
    });
    kanban.addEventListener('dragleave', (e: Event) => {
      const de = e as DragEvent;
      const zone = (de.target as HTMLElement).closest('.ns-lane-items') as HTMLElement | null;
      if (zone && !zone.contains(de.relatedTarget as Node | null)) zone.classList.remove('is-over');
    });
    kanban.addEventListener('drop', (e: Event) => {
      const de = e as DragEvent;
      const zone = (de.target as HTMLElement).closest('.ns-lane-items') as HTMLElement | null;
      if (!zone) return;
      de.preventDefault();
      zone.classList.remove('is-over');
      const id = de.dataTransfer?.getData('text/plain') || '';
      const t = this.TASKS.find((x) => x.id === id);
      const lane = zone.dataset['lane'] || '';
      if (!t || t.lane === lane) return;
      t.lane = lane;
      this.renderKanban();
      const laneLabel = this.LANES.find((l) => l.key === t.lane)?.label || t.lane;
      this.toast(`Moved to ${laneLabel} — ${t.text}`, 'info');
    });
  }

  /* ---------------- Alerts ---------------- */

  private renderAlerts(): void {
    const wrap = this.byId('alerts');
    if (!wrap) return;
    wrap.innerHTML =
      this.ALERTS.map(
        (a) =>
          `<div class="ns-alert ${a.tone}${a.code ? ' is-code' : ''}">` +
          `<span class="ns-panel-icon !size-8 shrink-0 text-xs"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">${this.escapeHtml(a.kind)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(a.time)}</span></div>` +
          `<p class="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500">${this.escapeHtml(a.text)}</p></div>` +
          `<button type="button" data-ack="${a.id}" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Acknowledge alert"><i class="icon-check text-xs" aria-hidden="true"></i></button>` +
          '</div>'
      ).join('') ||
      '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-shield-check" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">All alerts acknowledged</p><p class="text-[10px] text-gray-400">Ward 4B is quiet — nice work.</p></div>';
  }

  /* ---------------- Doctor inbox ---------------- */

  private renderInbox(): void {
    const wrap = this.byId('inbox');
    if (wrap) {
      wrap.innerHTML =
        this.INBOX.map(
          (r) =>
            `<div class="ns-alert ${r.tone}"><span class="ns-panel-icon !size-8 shrink-0 text-xs"><i class="${r.icon}" aria-hidden="true"></i></span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="ns-chip ${r.tone} text-[9px]">${this.escapeHtml(r.kind)}</span><p class="text-[11px] font-extrabold text-gray-900">${this.escapeHtml(r.from)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(r.time)}</span></div>` +
            `<p class="mt-1 text-[11px] leading-relaxed text-gray-500">${this.escapeHtml(r.text)}</p>` +
            `<button type="button" data-accept="${r.id}" class="mt-1.5 text-[10px] font-extrabold text-primary hover:underline">Accept &amp; action</button></div></div>`
        ).join('') || '<p class="py-8 text-center text-xs font-semibold text-gray-400">Inbox zero — no pending requests.</p>';
    }
    const chip = this.byId('inbox-chip');
    if (chip) chip.textContent = this.INBOX.length + ' pending';
  }

  /* ---------------- Care timeline ---------------- */

  private renderCare(): void {
    const wrap = this.byId('care');
    if (!wrap) return;
    const list = this.CARE['p4'] || [];
    wrap.innerHTML = list
      .map(
        (c) =>
          `<div class="ns-tl ${c.tone}"><span class="ns-tl-icon"><i class="${c.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1 pb-1"><p class="text-[10px] font-bold text-gray-400 tabular-nums">${this.escapeHtml(c.time)}</p>` +
          `<p class="mt-0.5 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">${this.escapeHtml(c.text)}</p></div></div>`
      )
      .join('');
  }

  /* ---------------- Performance ---------------- */

  private renderPerf(): void {
    const wrap = this.byId('perf');
    if (wrap) {
      wrap.innerHTML = this.PERF.map((g) => {
        const pct = g.pct != null ? g.pct : Math.round((Number(g.val) / (g.max as number)) * 100);
        const shown = g.invert ? 100 - pct : pct;
        const C = 2 * Math.PI * 26;
        return (
          `<div class="ns-gauge ${g.tone} flex-col gap-1.5 rounded-2xl border border-border-color p-3 dark:border-white/10">` +
          '<div class="relative"><svg class="ns-gauge-ring" viewBox="0 0 64 64"><circle class="ns-gauge-track" cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5"/>' +
          `<circle class="ns-gauge-fill" cx="32" cy="32" r="26" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - shown / 100)).toFixed(1)}"/></svg>` +
          `<span class="ns-gauge-label">${this.escapeHtml(g.max != null ? g.val + '/' + g.max : g.val)}</span></div>` +
          `<p class="text-center text-[10px] font-extrabold text-gray-500">${g.label}${g.sub ? `<br><span class="font-semibold text-gray-400">${g.sub}</span>` : ''}</p></div>`
        );
      }).join('');
    }
    const satVal = this.byId('sat-val');
    if (satVal) satVal.textContent = '4.6 / 5';
    requestAnimationFrame(() => {
      const bar = this.byId('sat-bar');
      if (bar) bar.style.width = '92%';
    });
  }

  /* ---------------- Handover ---------------- */

  private renderHandover(): void {
    const wrap = this.byId('handover');
    if (!wrap) return;
    wrap.innerHTML = this.HANDOVER.map(
      (h) =>
        `<div class="ns-hand ${h.tone}"><div class="flex items-center gap-2"><span class="ns-panel-icon !size-7 text-[11px]"><i class="${h.icon}" aria-hidden="true"></i></span>` +
        `<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${h.kind}</p><span class="ml-auto ns-chip ${h.tone}">${h.items.length}</span></div>` +
        `<ul class="mt-2.5 space-y-1.5">${h.items.map((t) => `<li class="flex gap-2 text-[11px] font-semibold leading-relaxed text-gray-600 dark:text-gray-300"><i class="icon-corner-down-right mt-0.5 shrink-0 text-[10px] text-gray-300" aria-hidden="true"></i>${this.escapeHtml(t)}</li>`).join('')}</ul></div>`
    ).join('');
  }

  /* ---------------- Activity feed ---------------- */

  private renderActivity(): void {
    const filters = this.byId('act-filters');
    if (filters) {
      const cats = ['All', ...new Set(this.ACTIVITY.map((a) => a.cat))];
      filters.innerHTML = cats
        .map((c) => `<button type="button" data-cat="${c}" aria-pressed="${this.actFilter === c}" class="ns-chip ns-cyan cursor-pointer${this.actFilter === c ? '' : ' opacity-50'}">${c}</button>`)
        .join('');
    }
    const wrap = this.byId('activity');
    if (!wrap) return;
    wrap.innerHTML = this.ACTIVITY.filter((a) => this.actFilter === 'All' || a.cat === this.actFilter)
      .map(
        (a) =>
          `<div class="ns-tl ${a.tone}"><span class="ns-tl-icon"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="ns-chip ${a.tone} text-[9px]">${a.cat}</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(a.time)}</span></div>` +
          `<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">${this.escapeHtml(a.text)}</p></div></div>`
      )
      .join('');
  }

  /* ---------------- Floating dock ---------------- */

  private wireDock(): void {
    const fab = this.byId('dock-fab');
    const menu = this.byId('dock-menu');
    if (!fab || !menu) return;

    fab.addEventListener('click', () => {
      const open = menu.classList.toggle('is-closed');
      fab.classList.toggle('is-open', !open);
      fab.setAttribute('aria-expanded', String(!open));
    });

    menu.addEventListener('click', (e: Event) => {
      const item = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!item) return;
      menu.classList.add('is-closed');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      const act = item.dataset['act'] || '';
      this.toast(act + (act === 'Emergency Call' ? ' — rapid response paged.' : ' opened.'), act === 'Emergency Call' ? 'error' : 'success');
    });

    this.document.addEventListener('click', (e: Event) => {
      if ((e.target as HTMLElement).closest('.ns-dock')) return;
      menu.classList.add('is-closed');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
    });
  }
}
