import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  rr: number;
  temp: number;
  avpu: string;
  o2: boolean;
}
interface Support {
  vent: boolean;
  vaso: boolean;
  crrt: boolean;
  sedation: boolean;
}
interface Infusion {
  drug: string;
  rate: string;
  tone: string;
}
interface LineItem {
  name: string;
  day: number;
  risk: boolean;
}
interface Lab {
  name: string;
  value: string;
  flag: 'high' | 'low' | 'normal';
}
interface Note {
  who: string;
  role: string;
  time: string;
  text: string;
}
interface TimelineItem {
  time: string;
  text: string;
  state: 'done' | 'current';
}
interface Patient {
  bed: string;
  name: string;
  age: number;
  gender: string;
  los: number;
  diagnosis: string;
  condition: 'Critical' | 'Guarded' | 'Improving';
  intensivist: string;
  admitted: string;
  vitals: Vitals;
  support: Support;
  sofa: number;
  rass: number;
  ventMode: string;
  infusions: Infusion[];
  lines: LineItem[];
  labs: Lab[];
  notes: Note[];
  timeline: TimelineItem[];
  steppedDown?: boolean;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "CRITICAL-CARE (critical-care.html)".
 */
@Component({
  imports: [],
  selector: 'app-critical-care',
  styleUrl: './critical-care.css',
  templateUrl: './critical-care.html',
})
export class CriticalCare implements AfterViewInit {
  private readonly CONDITION: Record<string, { badge: string; dot: string; accent: string; tone: string }> = {
    Critical: { badge: 'badge-red', dot: 'bg-danger', accent: '#ef4444', tone: 'tone-critical' },
    Guarded: { badge: 'badge-amber', dot: 'bg-warning', accent: '#eab308', tone: 'tone-high' },
    Improving: { badge: 'badge-green', dot: 'bg-success', accent: '#22c55e', tone: 'tone-stable' },
  };

  private readonly ORGANS: { key: 'vent' | 'vaso' | 'crrt' | 'sedation'; icon: string; label: string }[] = [
    { key: 'vent', icon: 'icon-wind', label: 'Ventilation' },
    { key: 'vaso', icon: 'icon-heart-pulse', label: 'Vasopressors' },
    { key: 'crrt', icon: 'icon-droplets', label: 'CRRT' },
    { key: 'sedation', icon: 'icon-pill', label: 'Sedation' },
  ];

  private readonly FLAG: Record<string, { chip: string; icon: string; label: string }> = {
    high: { chip: 'badge-red', icon: 'icon-arrow-up', label: 'High' },
    low: { chip: 'badge-amber', icon: 'icon-arrow-down', label: 'Low' },
    normal: { chip: 'badge-green', icon: 'icon-check', label: 'Normal' },
  };

  private readonly RASS_LABEL: Record<string, string> = {
    '4': 'Combative', '3': 'Very agitated', '2': 'Agitated', '1': 'Restless', '0': 'Alert and calm',
    '-1': 'Drowsy', '-2': 'Light sedation', '-3': 'Moderate sedation', '-4': 'Deep sedation', '-5': 'Unrousable',
  };

  private readonly WAVES: Record<string, string> = {
    ecg: '0,16 18,16 22,16 26,10 30,22 34,16 44,16 50,3 54,29 58,16 74,16 80,14 86,18 92,16 120,16',
    pleth: '0,24 8,20 14,8 20,5 26,9 32,14 38,17 44,19 50,21 56,23 62,24 70,24 78,20 84,8 90,5 96,9 102,15 110,21 120,24',
    resp: '0,16 10,10 20,6 30,10 40,16 50,22 60,26 70,22 80,16 90,10 100,6 110,10 120,16',
    flat: '0,16 30,16 60,16 90,16 120,16',
  };

  private readonly BAYS = ['ICU-01', 'ICU-02', 'ICU-03', 'ICU-04', 'ICU-05', 'ICU-06', 'HDU-01', 'HDU-02', 'HDU-03', 'HDU-04', 'HDU-05', 'HDU-06'];

  private PATIENTS: Patient[] = [
    {
      bed: 'ICU-01', name: 'Marcus Holloway', age: 58, gender: 'Male', los: 2,
      diagnosis: 'Post-op haemorrhagic shock, splenectomy', condition: 'Critical',
      intensivist: 'Dr. Naomi Adeyemi', admitted: 'From OR 3 · 11:40 AM, 15 Jul',
      vitals: { hr: 122, bp: '88/54', spo2: 91, rr: 26, temp: 96.4, avpu: 'P', o2: true },
      support: { vent: true, vaso: true, crrt: false, sedation: true },
      sofa: 12, rass: -4, ventMode: 'PRVC · FiO2 60% · PEEP 10',
      infusions: [
        { drug: 'Noradrenaline', rate: '0.28 mcg/kg/min', tone: 'tone-critical' },
        { drug: 'Propofol', rate: '180 mg/hr', tone: 'tone-purple' },
        { drug: 'Fentanyl', rate: '120 mcg/hr', tone: 'tone-purple' },
      ],
      lines: [
        { name: 'Right IJ central line', day: 2, risk: false },
        { name: 'Left radial arterial line', day: 2, risk: false },
        { name: 'Endotracheal tube 8.0', day: 2, risk: false },
        { name: 'Urinary catheter', day: 2, risk: false },
      ],
      labs: [
        { name: 'Lactate', value: '4.1 mmol/L', flag: 'high' },
        { name: 'Hemoglobin', value: '7.8 g/dL', flag: 'low' },
        { name: 'Creatinine', value: '1.9 mg/dL', flag: 'high' },
        { name: 'Platelets', value: '88 K/µL', flag: 'low' },
        { name: 'pH', value: '7.28', flag: 'low' },
      ],
      notes: [
        { who: 'Dr. Naomi Adeyemi', role: 'Intensivist', time: '09:10 AM', text: 'Remains vasopressor-dependent 36 hours post-splenectomy. Lactate not clearing. Repeat CT abdomen ordered to exclude ongoing bleeding.' },
      ],
      timeline: [
        { time: '15 Jul, 11:40', text: 'Admitted from OR 3 post-splenectomy', state: 'done' },
        { time: '15 Jul, 14:20', text: 'Noradrenaline started, MAP target 65', state: 'done' },
        { time: '16 Jul, 08:00', text: 'Failed sedation hold — agitated, resedated', state: 'done' },
        { time: '17 Jul, 09:10', text: 'Repeat CT abdomen ordered', state: 'current' },
      ],
    },
    {
      bed: 'ICU-02', name: 'Denise Okafor', age: 34, gender: 'Female', los: 1,
      diagnosis: 'Status asthmaticus, respiratory failure', condition: 'Guarded',
      intensivist: 'Dr. Rafael Contreras', admitted: 'From ED · 09:31 AM, 16 Jul',
      vitals: { hr: 104, bp: '126/78', spo2: 94, rr: 22, temp: 98.6, avpu: 'A', o2: true },
      support: { vent: true, vaso: false, crrt: false, sedation: true },
      sofa: 6, rass: -2, ventMode: 'PS 12/5 · FiO2 35%',
      infusions: [
        { drug: 'Propofol', rate: '90 mg/hr', tone: 'tone-purple' },
        { drug: 'Magnesium Sulfate', rate: '2 g over 20 min', tone: 'tone-info' },
        { drug: 'Salbutamol', rate: '10 mg/hr neb', tone: 'tone-info' },
      ],
      lines: [
        { name: 'Right subclavian central line', day: 1, risk: false },
        { name: 'Endotracheal tube 7.5', day: 1, risk: false },
      ],
      labs: [
        { name: 'pCO2', value: '48 mmHg', flag: 'high' },
        { name: 'pH', value: '7.34', flag: 'low' },
        { name: 'Potassium', value: '3.4 mmol/L', flag: 'low' },
        { name: 'Hemoglobin', value: '12.8 g/dL', flag: 'normal' },
      ],
      notes: [
        { who: 'Dr. Rafael Contreras', role: 'Intensivist', time: '08:40 AM', text: 'Airway pressures improving on pressure support. Tolerating weaning trial. Aiming for extubation this afternoon if ABG holds.' },
      ],
      timeline: [
        { time: '16 Jul, 09:31', text: 'Admitted from ED, intubated for fatigue', state: 'done' },
        { time: '16 Jul, 18:00', text: 'Peak pressures settling, steroids continued', state: 'done' },
        { time: '17 Jul, 08:40', text: 'Weaning trial — PS 12/5, tolerating', state: 'current' },
      ],
    },
    {
      bed: 'ICU-03', name: 'Arthur Delgado', age: 71, gender: 'Male', los: 1,
      diagnosis: 'Ischaemic stroke, post-thrombolysis', condition: 'Critical',
      intensivist: 'Dr. Naomi Adeyemi', admitted: 'From ED · 10:15 AM, 16 Jul',
      vitals: { hr: 88, bp: '168/92', spo2: 96, rr: 18, temp: 98.1, avpu: 'V', o2: true },
      support: { vent: false, vaso: false, crrt: false, sedation: false },
      sofa: 5, rass: -1, ventMode: '—',
      infusions: [
        { drug: 'Labetalol', rate: '2 mg/min', tone: 'tone-critical' },
        { drug: 'Normal Saline', rate: '80 mL/hr', tone: 'tone-info' },
      ],
      lines: [
        { name: 'Right radial arterial line', day: 1, risk: false },
        { name: 'Peripheral IV x2', day: 1, risk: false },
      ],
      labs: [
        { name: 'INR', value: '1.1', flag: 'normal' },
        { name: 'Glucose', value: '168 mg/dL', flag: 'high' },
        { name: 'Creatinine', value: '1.2 mg/dL', flag: 'normal' },
      ],
      notes: [
        { who: 'Dr. Naomi Adeyemi', role: 'Intensivist', time: '07:50 AM', text: 'Post-thrombolysis, no haemorrhagic conversion on repeat CT. BP tightly controlled on labetalol. Neuro obs hourly.' },
      ],
      timeline: [
        { time: '16 Jul, 10:15', text: 'Admitted post-thrombolysis for neuro obs', state: 'done' },
        { time: '16 Jul, 22:00', text: 'Repeat CT — no haemorrhagic conversion', state: 'done' },
        { time: '17 Jul, 07:50', text: 'Hourly neuro obs, BP target < 180', state: 'current' },
      ],
    },
    {
      bed: 'ICU-04', name: 'Yolanda Prescott', age: 55, gender: 'Female', los: 4,
      diagnosis: 'Septic shock, urinary source · AKI', condition: 'Critical',
      intensivist: 'Dr. Rafael Contreras', admitted: 'From ED · 06:20 AM, 13 Jul',
      vitals: { hr: 116, bp: '94/58', spo2: 93, rr: 24, temp: 101.8, avpu: 'V', o2: true },
      support: { vent: true, vaso: true, crrt: true, sedation: true },
      sofa: 14, rass: -3, ventMode: 'PRVC · FiO2 50% · PEEP 8',
      infusions: [
        { drug: 'Noradrenaline', rate: '0.18 mcg/kg/min', tone: 'tone-critical' },
        { drug: 'Vasopressin', rate: '0.03 units/min', tone: 'tone-critical' },
        { drug: 'Midazolam', rate: '6 mg/hr', tone: 'tone-purple' },
        { drug: 'Meropenem', rate: '1 g q8h', tone: 'tone-info' },
      ],
      lines: [
        { name: 'Right IJ vascath (CRRT)', day: 3, risk: false },
        { name: 'Left IJ central line', day: 4, risk: true },
        { name: 'Endotracheal tube 7.5', day: 4, risk: false },
        { name: 'Urinary catheter', day: 4, risk: true },
      ],
      labs: [
        { name: 'Lactate', value: '2.8 mmol/L', flag: 'high' },
        { name: 'Creatinine', value: '3.4 mg/dL', flag: 'high' },
        { name: 'White Cell Count', value: '22.1 K/µL', flag: 'high' },
        { name: 'CRP', value: '284 mg/L', flag: 'high' },
        { name: 'Potassium', value: '5.4 mmol/L', flag: 'high' },
      ],
      notes: [
        { who: 'Dr. Rafael Contreras', role: 'Intensivist', time: '09:05 AM', text: 'Day 4 septic shock. CRRT running for AKI and hyperkalaemia. Noradrenaline requirement slowly falling. Central line day 4 — review need for replacement.' },
      ],
      timeline: [
        { time: '13 Jul, 06:20', text: 'Admitted from ED, septic shock', state: 'done' },
        { time: '13 Jul, 09:00', text: 'Intubated, noradrenaline started', state: 'done' },
        { time: '14 Jul, 11:30', text: 'CRRT started for AKI and hyperkalaemia', state: 'done' },
        { time: '17 Jul, 09:05', text: 'Weaning vasopressors, CRRT continues', state: 'current' },
      ],
    },
    {
      bed: 'ICU-05', name: 'Harriet Nakashima', age: 59, gender: 'Female', los: 1,
      diagnosis: 'Flail chest, post rib fixation', condition: 'Guarded',
      intensivist: 'Dr. Naomi Adeyemi', admitted: 'From OR 5 · 10:50 AM, 16 Jul',
      vitals: { hr: 96, bp: '112/70', spo2: 95, rr: 20, temp: 98.9, avpu: 'A', o2: true },
      support: { vent: false, vaso: false, crrt: false, sedation: false },
      sofa: 4, rass: 0, ventMode: 'HFNC 40 L/min · FiO2 35%',
      infusions: [
        { drug: 'Fentanyl', rate: '50 mcg/hr', tone: 'tone-purple' },
        { drug: 'Ketamine', rate: '10 mg/hr', tone: 'tone-purple' },
      ],
      lines: [
        { name: 'Right chest drain', day: 1, risk: false },
        { name: 'Thoracic epidural', day: 1, risk: false },
        { name: 'Peripheral IV x2', day: 1, risk: false },
      ],
      labs: [
        { name: 'Hemoglobin', value: '10.2 g/dL', flag: 'low' },
        { name: 'pO2', value: '78 mmHg', flag: 'low' },
        { name: 'AST', value: '142 U/L', flag: 'high' },
      ],
      notes: [
        { who: 'Dr. Naomi Adeyemi', role: 'Intensivist', time: '08:20 AM', text: 'Extubated in theatre, on HFNC. Epidural providing good analgesia — key to avoiding reintubation. Physio 4-hourly.' },
      ],
      timeline: [
        { time: '16 Jul, 10:50', text: 'Admitted from OR 5 post rib fixation', state: 'done' },
        { time: '16 Jul, 16:00', text: 'Weaned to HFNC, epidural running', state: 'done' },
        { time: '17 Jul, 08:20', text: 'Chest physio 4-hourly, mobilising', state: 'current' },
      ],
    },
    {
      bed: 'HDU-01', name: 'Camila Restrepo', age: 31, gender: 'Female', los: 1,
      diagnosis: 'Pulmonary contusion, polytrauma', condition: 'Improving',
      intensivist: 'Dr. Rafael Contreras', admitted: 'From ED · 09:25 AM, 16 Jul',
      vitals: { hr: 84, bp: '118/74', spo2: 97, rr: 18, temp: 98.4, avpu: 'A', o2: false },
      support: { vent: false, vaso: false, crrt: false, sedation: false },
      sofa: 2, rass: 0, ventMode: 'Room air',
      infusions: [{ drug: 'Paracetamol', rate: '1 g q6h', tone: 'tone-info' }],
      lines: [{ name: 'Peripheral IV', day: 1, risk: false }],
      labs: [
        { name: 'Hemoglobin', value: '12.1 g/dL', flag: 'normal' },
        { name: 'Lactate', value: '1.4 mmol/L', flag: 'normal' },
      ],
      notes: [
        { who: 'Dr. Rafael Contreras', role: 'Intensivist', time: '08:05 AM', text: 'Off oxygen overnight, saturations maintained on room air. Suitable for step-down to surgical ward today.' },
      ],
      timeline: [
        { time: '16 Jul, 09:25', text: 'Admitted from ED for respiratory monitoring', state: 'done' },
        { time: '16 Jul, 20:00', text: 'Weaned off oxygen', state: 'done' },
        { time: '17 Jul, 08:05', text: 'For step-down to surgical ward', state: 'current' },
      ],
    },
    {
      bed: 'HDU-02', name: 'Curtis Mbeki', age: 52, gender: 'Male', los: 1,
      diagnosis: 'Rhabdomyolysis, crush injury', condition: 'Guarded',
      intensivist: 'Dr. Naomi Adeyemi', admitted: 'From ED · 10:30 AM, 16 Jul',
      vitals: { hr: 92, bp: '128/78', spo2: 98, rr: 18, temp: 98.0, avpu: 'A', o2: false },
      support: { vent: false, vaso: false, crrt: false, sedation: false },
      sofa: 3, rass: 0, ventMode: 'Room air',
      infusions: [
        { drug: 'Normal Saline', rate: '250 mL/hr', tone: 'tone-info' },
        { drug: 'Sodium Bicarbonate', rate: '50 mmol/L', tone: 'tone-info' },
      ],
      lines: [
        { name: 'Peripheral IV x2', day: 1, risk: false },
        { name: 'Urinary catheter', day: 1, risk: false },
      ],
      labs: [
        { name: 'Creatine Kinase', value: '18400 U/L', flag: 'high' },
        { name: 'Creatinine', value: '1.6 mg/dL', flag: 'high' },
        { name: 'Potassium', value: '5.0 mmol/L', flag: 'high' },
      ],
      notes: [
        { who: 'Dr. Naomi Adeyemi', role: 'Intensivist', time: '07:30 AM', text: 'CK peaked at 18400. Aggressive fluids with urine output target 200 mL/hr. Renal function holding — no CRRT needed so far.' },
      ],
      timeline: [
        { time: '16 Jul, 10:30', text: 'Admitted from ED, crush injury', state: 'done' },
        { time: '16 Jul, 12:00', text: 'Aggressive fluid resuscitation started', state: 'done' },
        { time: '17 Jul, 07:30', text: 'CK trending down, urine output adequate', state: 'current' },
      ],
    },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }

  private avatarPhoto(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    return 'assets/img/avatar/avatar-' + String((hash % 30) + 1).padStart(2, '0') + '.jpg';
  }

  private active(): Patient[] {
    return this.PATIENTS.filter((p) => !p.steppedDown);
  }

  private news2(v: Vitals): number {
    let s = 0;
    if (v.rr <= 8) s += 3;
    else if (v.rr <= 11) s += 1;
    else if (v.rr <= 20) s += 0;
    else if (v.rr <= 24) s += 2;
    else s += 3;

    if (v.spo2 <= 91) s += 3;
    else if (v.spo2 <= 93) s += 2;
    else if (v.spo2 <= 95) s += 1;

    if (v.o2) s += 2;

    const sys = parseInt(v.bp, 10);
    if (sys <= 90) s += 3;
    else if (sys <= 100) s += 2;
    else if (sys <= 110) s += 1;
    else if (sys >= 220) s += 3;

    if (v.hr <= 40) s += 3;
    else if (v.hr <= 50) s += 1;
    else if (v.hr <= 90) s += 0;
    else if (v.hr <= 110) s += 1;
    else if (v.hr <= 130) s += 2;
    else s += 3;

    if (v.avpu && v.avpu !== 'A') s += 3;

    if (v.temp <= 95.0) s += 3;
    else if (v.temp <= 96.8) s += 1;
    else if (v.temp <= 100.4) s += 0;
    else if (v.temp <= 102.2) s += 1;
    else s += 2;

    return s;
  }

  private scoreOf(p: Patient): number {
    return this.news2(p.vitals);
  }

  private newsBand(score: number): { cls: string; label: string; tone: string } {
    if (score >= 7) return { cls: 'is-critical', label: 'Critical', tone: 'tone-critical' };
    if (score >= 5) return { cls: 'is-high', label: 'High', tone: 'tone-high' };
    if (score >= 3) return { cls: 'is-medium', label: 'Medium', tone: 'tone-medium' };
    return { cls: 'is-low', label: 'Low', tone: 'tone-stable' };
  }

  private wave(kind: string): string {
    return (
      '<svg class="cc-wave" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<polyline class="cc-wave-line" points="' + this.WAVES[kind] + '" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline></svg>'
    );
  }

  private unitStatus(): { cls: string; text: string } {
    const occ = this.active().length / this.BAYS.length;
    const critical = this.active().filter((p) => p.condition === 'Critical').length;
    if (occ >= 0.9 || critical >= 4) return { cls: 'is-critical', text: 'Critical Load' };
    if (occ >= 0.5 || critical >= 2) return { cls: 'is-strained', text: 'Strained' };
    return { cls: 'is-stable', text: 'Stable' };
  }

  private avg(fn: (p: Patient) => number): number {
    const list = this.active();
    return Math.round(list.reduce((s, p) => s + fn(p), 0) / list.length);
  }

  /* ---------------- render ---------------- */

  private renderHero(): void {
    const st = this.unitStatus();
    const status = this.byId('cc-status');
    if (status) status.className = 'cc-status ' + st.cls;
    const statusText = this.byId('cc-status-text');
    if (statusText) statusText.textContent = st.text;

    const vent = this.active().filter((p) => p.support.vent).length;
    const rail: { label: string; value: string | number; icon: string }[] = [
      { label: 'Occupied', value: this.active().length + '/' + this.BAYS.length, icon: 'icon-bed' },
      { label: 'Ventilated', value: vent, icon: 'icon-wind' },
      { label: 'Vasopressors', value: this.active().filter((p) => p.support.vaso).length, icon: 'icon-heart-pulse' },
      { label: 'CRRT', value: this.active().filter((p) => p.support.crrt).length, icon: 'icon-droplets' },
      { label: 'Nurse Ratio', value: '1:1', icon: 'icon-users' },
    ];

    const rail_el = this.byId('hero-rail');
    if (rail_el) {
      rail_el.innerHTML = rail
        .map(
          (r) =>
            '<div class="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">' +
            '<i class="' + r.icon + ' text-white/40 text-sm" aria-hidden="true"></i>' +
            '<div>' +
            '<dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">' + this.esc(r.label) + '</dt>' +
            '<dd class="text-sm font-extrabold text-white tabular-nums">' + this.esc(r.value) + '</dd></div></div>'
        )
        .join('');
    }
  }

  private renderMonitors(): void {
    const beds = this.active().length;
    const vent = this.active().filter((p) => p.support.vent).length;
    const vaso = this.active().filter((p) => p.support.vaso).length;
    const crrt = this.active().filter((p) => p.support.crrt).length;
    const deteriorating = this.active().filter((p) => this.scoreOf(p) >= 7).length;

    const mons: { id: string; label: string; icon: string; value: string | number; unit: string; meta: string; wave: string; varName: string; alarm: boolean }[] = [
      { id: 'mon-beds', label: 'Occupancy', icon: 'icon-bed', value: beds, unit: '/' + this.BAYS.length, meta: Math.round((beds / this.BAYS.length) * 100) + '% full', wave: 'flat', varName: '--cc-hr', alarm: false },
      { id: 'mon-hr', label: 'Mean HR', icon: 'icon-heart-pulse', value: this.avg((p) => p.vitals.hr), unit: 'bpm', meta: 'unit average', wave: 'ecg', varName: '--cc-hr', alarm: false },
      { id: 'mon-spo2', label: 'Mean SpO2', icon: 'icon-activity', value: this.avg((p) => p.vitals.spo2), unit: '%', meta: 'unit average', wave: 'pleth', varName: '--cc-spo2', alarm: this.avg((p) => p.vitals.spo2) < 94 },
      { id: 'mon-vent', label: 'Ventilated', icon: 'icon-wind', value: vent, unit: 'pts', meta: Math.round((vent / beds) * 100) + '% of unit', wave: 'resp', varName: '--cc-rr', alarm: false },
      { id: 'mon-support', label: 'Vaso / CRRT', icon: 'icon-droplets', value: vaso + ' / ' + crrt, unit: '', meta: 'organ support', wave: 'flat', varName: '--cc-support', alarm: false },
      { id: 'mon-news', label: 'NEWS2 ≥ 7', icon: 'icon-trending-up', value: deteriorating, unit: 'pts', meta: deteriorating ? 'escalation needed' : 'none rising', wave: 'ecg', varName: '--cc-score', alarm: deteriorating > 0 },
    ];

    const row = this.byId('mon-row');
    if (!row) return;
    row.innerHTML = mons
      .map(
        (m) =>
          '<article class="cc-mon' + (m.alarm ? ' is-alarm' : '') + '" data-accent="' + m.varName + '">' +
          '<div class="cc-mon-head">' +
          '<i class="' + m.icon + ' cc-mon-icon" aria-hidden="true"></i>' +
          '<span class="cc-mon-label">' + this.esc(m.label) + '</span>' +
          (m.alarm ? '<i class="icon-bell-ring cc-mon-icon ml-auto text-[11px]" aria-hidden="true"></i>' : '') +
          '</div>' +
          '<div class="cc-screen">' +
          '<div class="cc-readout">' +
          '<span class="cc-readout-value" id="' + m.id + '">' + this.esc(m.value) + '</span>' +
          (m.unit ? '<span class="cc-readout-unit">' + this.esc(m.unit) + '</span>' : '') +
          '</div>' +
          '<p class="cc-readout-meta">' + this.esc(m.meta) + '</p>' +
          this.wave(m.wave) +
          '</div></article>'
      )
      .join('');

    row.querySelectorAll<HTMLElement>('.cc-mon').forEach((el) => {
      const accent = el.dataset['accent'] || '';
      el.classList.add('accent-' + accent.replace('--cc-', ''));
    });
  }

  private renderOrgans(): void {
    const host = this.byId('organ-body');
    if (!host) return;
    host.innerHTML = this.active()
      .map((p) => {
        const cells = this.ORGANS.map((o) => {
          const on = p.support[o.key];
          return (
            '<td class="hms-cell text-center"><span class="cc-organ mx-auto' + (on ? ' is-on' : '') + '" ' +
            'title="' + this.esc(p.name) + ' — ' + o.label + (on ? ': active' : ': not required') + '">' +
            '<i class="' + o.icon + '" aria-hidden="true"></i>' +
            '<span class="sr-only">' + o.label + (on ? ' active' : ' not required') + '</span></span></td>'
          );
        }).join('');

        const sofaTone = p.sofa >= 12 ? 'tone-critical' : p.sofa >= 8 ? 'tone-high' : p.sofa >= 4 ? 'tone-medium' : 'tone-stable';

        return (
          '<tr class="hms-row" data-row-id="' + this.esc(p.bed) + '">' +
          '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
          '<span class="hms-member-avatar size-8! ' + this.CONDITION[p.condition].tone + '"><img src="' + this.avatarPhoto(p.name) + '" alt="" loading="lazy"></span>' +
          '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + this.esc(p.name) + '</p>' +
          '<p class="text-[10px] text-gray-400">' + this.esc(p.bed) + '</p></div></div></td>' +
          cells +
          '<td class="hms-cell"><span class="hms-chip ' + sofaTone + '">' + p.sofa + '</span></td></tr>'
        );
      })
      .join('');
  }

  private renderDeterioration(): void {
    const list = this.active()
      .map((p) => ({ p, score: this.scoreOf(p) }))
      .sort((a, b) => b.score - a.score);

    const rising = list.filter((x) => x.score >= 5).length;
    const cnt = this.byId('det-count');
    if (cnt) cnt.textContent = rising + ' rising';

    const host = this.byId('det-list');
    if (!host) return;
    host.innerHTML = list
      .map((x) => {
        const b = this.newsBand(x.score);
        const p = x.p;
        const v = p.vitals;
        return (
          '<li class="' + b.tone + ' rounded-xl border border-border-color dark:border-white/10 p-3 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors" data-row-id="' + this.esc(p.bed) + '">' +
          '<div class="flex items-center gap-2.5">' +
          '<span class="size-1.5 rounded-full bg-[var(--tc-accent)] shrink-0" aria-hidden="true"></span>' +
          '<button type="button" data-open="' + this.esc(p.bed) + '" class="text-xs font-bold text-gray-900 hover:text-primary transition-colors truncate mr-auto">' +
          this.esc(p.name) + '</button>' +
          '<span class="cc-news ' + b.cls + '">NEWS2 ' + x.score + '</span></div>' +
          '<p class="mt-1.5 text-[10px] font-semibold text-gray-400">' + this.esc(p.bed) + ' · ' + this.esc(p.diagnosis) + '</p>' +
          '<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-gray-500 dark:text-gray-400">' +
          '<span>HR ' + v.hr + '</span><span>BP ' + this.esc(v.bp) + '</span><span>SpO2 ' + v.spo2 + '%</span>' +
          '<span>RR ' + v.rr + '</span><span>Temp ' + v.temp + '°F</span>' +
          (x.score >= 7 ? '<span class="ml-auto font-extrabold text-danger">Rapid response</span>' : '') +
          '</div></li>'
        );
      })
      .join('');
  }

  private renderBeds(): void {
    const host = this.byId('bed-board');
    if (!host) return;
    host.innerHTML = this.BAYS.map((bay) => {
      const p = this.active().find((x) => x.bed === bay);
      if (!p) {
        return (
          '<article class="cc-bay is-empty" data-row-id="' + this.esc(bay) + '">' +
          '<div class="flex items-center justify-between gap-2">' +
          '<p class="text-xs font-extrabold text-gray-400">' + this.esc(bay) + '</p>' +
          '<i class="icon-plus text-gray-300 dark:text-slate-600 text-sm" aria-hidden="true"></i></div>' +
          '<p class="mt-6 text-[10px] font-bold uppercase tracking-wide text-gray-300 dark:text-slate-600">Open</p></article>'
        );
      }

      const score = this.scoreOf(p);
      const b = this.newsBand(score);
      const supports = this.ORGANS.filter((o) => p.support[o.key]);

      return (
        '<article class="cc-bay ' + this.CONDITION[p.condition].tone + '" data-row-id="' + this.esc(p.bed) + '" data-open="' + this.esc(p.bed) + '" tabindex="0" role="button" ' +
        'aria-label="Open ' + this.esc(p.name) + ' in ' + this.esc(bay) + '">' +
        '<div class="flex items-center justify-between gap-2">' +
        '<p class="text-xs font-extrabold text-gray-900">' + this.esc(bay) + '</p>' +
        '<span class="cc-news ' + b.cls + '">' + score + '</span></div>' +
        '<p class="mt-2 text-[11px] font-bold text-gray-900 truncate">' + this.esc(p.name) + '</p>' +
        '<p class="text-[9px] text-gray-400 truncate">' + this.esc(p.diagnosis) + '</p>' +
        '<div class="mt-2 flex items-center gap-1">' +
        supports.map((o) => '<i class="' + o.icon + ' text-[10px] text-[var(--tc-accent)]" title="' + o.label + '" aria-hidden="true"></i>').join('') +
        (supports.length ? '' : '<span class="text-[9px] font-bold text-gray-300 dark:text-slate-600">No support</span>') +
        '<span class="ml-auto text-[9px] font-bold text-gray-400">D' + p.los + '</span>' +
        '</div></article>'
      );
    }).join('');
  }

  private renderGrid(): void {
    const searchEl = this.byId('search') as HTMLInputElement | null;
    const condEl = this.byId('filter-condition') as HTMLSelectElement | null;
    const supEl = this.byId('filter-support') as HTMLSelectElement | null;
    if (!searchEl || !condEl || !supEl) return;

    const q = searchEl.value.trim().toLowerCase();
    const cond = condEl.value;
    const sup = supEl.value as 'vent' | 'vaso' | 'crrt' | 'none' | '';

    const rows = this.active()
      .filter((p) => {
        const hit = !q || p.name.toLowerCase().includes(q) || p.bed.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
        const okCond = !cond || p.condition === cond;
        const anySupport = p.support.vent || p.support.vaso || p.support.crrt;
        const okSup = !sup || (sup === 'none' ? !anySupport : p.support[sup]);
        return hit && okCond && okSup;
      })
      .sort((a, b) => this.scoreOf(b) - this.scoreOf(a));

    const cnt = this.byId('grid-count');
    if (cnt) cnt.textContent = rows.length + (rows.length === 1 ? ' patient' : ' patients');

    const body = this.byId('grid-body');
    if (!body) return;

    if (!rows.length) {
      body.innerHTML =
        '<tr><td colspan="9" class="py-12 text-center">' +
        '<i class="icon-search-x text-3xl text-gray-300 dark:text-slate-600" aria-hidden="true"></i>' +
        '<p class="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">No patients match these filters</p>' +
        '<p class="text-xs text-gray-400">Try clearing the search, condition or support filter.</p></td></tr>';
      return;
    }

    body.innerHTML = rows
      .map((p) => {
        const score = this.scoreOf(p);
        const b = this.newsBand(score);
        const c = this.CONDITION[p.condition];
        const supports = this.ORGANS.filter((o) => p.support[o.key]);
        const badgeCls = { Critical: 'badge-red', Guarded: 'badge-amber', Improving: 'badge-green' }[p.condition];

        return (
          '<tr class="hms-row ' + c.tone + '" data-row-id="' + this.esc(p.bed) + '">' +
          '<td class="hms-cell"><a class="font-mono text-[11px] font-bold text-primary hover:underline" href="critical-care-detail.html">' + this.esc(p.bed) + '</a></td>' +
          '<td class="hms-cell"><div class="flex items-center gap-2.5">' +
          '<span class="hms-member-avatar size-9!"><img src="' + this.avatarPhoto(p.name) + '" alt="" loading="lazy"></span>' +
          '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' + this.esc(p.name) + '</p>' +
          '<p class="text-[10px] text-gray-400">' + p.age + ' ' + this.esc(p.gender.charAt(0)) + '</p></div></div></td>' +
          '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 max-w-48 truncate" title="' + this.esc(p.diagnosis) + '">' + this.esc(p.diagnosis) + '</p></td>' +
          '<td class="hms-cell"><span class="cc-news ' + b.cls + '">' + score + '</span>' +
          '<p class="mt-1 text-[9px] font-bold text-gray-400">' + b.label + '</p></td>' +
          '<td class="hms-cell"><div class="flex items-center gap-1">' +
          (supports.length
            ? supports.map((o) => '<span class="cc-organ is-on size-6! text-[9px]!" title="' + o.label + '"><i class="' + o.icon + '" aria-hidden="true"></i></span>').join('')
            : '<span class="text-[10px] font-bold text-gray-300 dark:text-slate-600">None</span>') +
          '</div></td>' +
          '<td class="hms-cell"><p class="text-xs text-gray-600 dark:text-gray-300 truncate">' + this.esc(p.intensivist) + '</p></td>' +
          '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">D' + p.los + '</span></td>' +
          '<td class="hms-cell"><span class="badge ' + badgeCls + '">' + p.condition + '</span></td>' +
          '<td class="hms-cell text-right"><div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
          '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><i class="icon-ellipsis-vertical text-sm"></i></button>' +
          '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">' +
          '<button type="button" role="menuitem" data-act="view" data-id="' + this.esc(p.bed) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"><i class="icon-eye text-sm"></i>View</button>' +
          '<button type="button" role="menuitem" data-act="note" data-id="' + this.esc(p.bed) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"><i class="icon-pen-line text-sm"></i>Add Note</button>' +
          '<button type="button" role="menuitem" data-act="rapid" data-id="' + this.esc(p.bed) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-danger hover:bg-danger/10"><i class="icon-siren text-sm"></i>Rapid Response</button>' +
          '<button type="button" role="menuitem" data-act="step" data-id="' + this.esc(p.bed) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"><i class="icon-arrow-down text-sm"></i>Step Down</button>' +
          '</div></div></td></tr>'
        );
      })
      .join('');

    const hs = (window as any).HSStaticMethods;
    if (hs) hs.autoInit();
  }

  private renderAll(): void {
    this.renderHero();
    this.renderMonitors();
    this.renderOrgans();
    this.renderDeterioration();
    this.renderBeds();
    this.renderGrid();
  }

  /* ---------------- drawer ---------------- */

  private rassScale(value: number): string {
    let steps = '';
    for (let i = 4; i >= -5; i--) steps += '<span class="cc-rass-step' + (i === value ? ' is-on' : '') + '" title="RASS ' + i + '"></span>';
    return steps;
  }

  private telemetryTile(label: string, value: string | number, unit: string, alarm: boolean, varName: string): string {
    return (
      '<div class="cc-screen accent-' + varName + '">' +
      '<p class="relative text-[9px] font-extrabold uppercase tracking-wider text-white/40">' + label + '</p>' +
      '<div class="cc-readout mt-0.5"><span class="cc-readout-value text-[1.3rem]!">' + value + '</span>' +
      '<span class="cc-readout-unit">' + unit + '</span></div>' +
      (alarm ? '<p class="cc-readout-meta text-danger!">Out of range</p>' : '<p class="cc-readout-meta">In range</p>') +
      '</div>'
    );
  }

  private drawerHost(): HTMLElement {
    let host = this.byId('cc-drawer');
    if (!host) {
      host = this.document.createElement('div');
      host.id = 'cc-drawer';
      host.className = 'cc-drawer-host';
      host.innerHTML =
        '<div class="cc-drawer-backdrop" data-cc-close></div>' +
        '<aside class="cc-drawer-panel">' +
        '<div class="cc-drawer-head">' +
        '<span id="cc-dw-avatar" class="relative inline-block size-10 rounded-full overflow-hidden bg-gray-100"></span>' +
        '<div class="min-w-0 flex-1"><p id="cc-dw-title" class="text-sm font-bold text-gray-900"></p><p id="cc-dw-sub" class="text-[11px] text-gray-400"></p></div>' +
        '<button type="button" id="cc-dw-close" class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center"><i class="icon-x"></i></button>' +
        '</div>' +
        '<div class="cc-drawer-body p-4 space-y-3">' +
        '<div id="cc-dw-chips" class="flex flex-wrap gap-1.5"></div>' +
        '<div id="cc-dw-telemetry" class="grid grid-cols-2 gap-2"></div>' +
        '<div id="cc-dw-organ" class="space-y-1.5"></div>' +
        '<div id="cc-dw-sedation"></div>' +
        '<ul id="cc-dw-infusions" class="space-y-1.5"></ul>' +
        '<ul id="cc-dw-lines" class="space-y-1.5"></ul>' +
        '<ul id="cc-dw-labs" class="space-y-1.5"></ul>' +
        '<div id="cc-dw-notes" class="space-y-2"></div>' +
        '<ul id="cc-dw-timeline" class="space-y-2"></ul>' +
        '<div class="grid grid-cols-2 gap-2">' +
        '<button type="button" id="cc-dw-act-escalate" class="btn btn-outline-danger btn-sm">Escalate</button>' +
        '<button type="button" id="cc-dw-act-wean" class="btn btn-outline-primary btn-sm">Wean</button>' +
        '<button type="button" id="cc-dw-act-note" class="btn btn-outline-secondary btn-sm">Add Note</button>' +
        '<button type="button" id="cc-dw-act-stepdown" class="btn btn-outline-success btn-sm">Step Down</button>' +
        '</div>' +
        '</div>' +
        '</aside>';
      this.document.body.appendChild(host);

      this.byId('cc-dw-close')?.addEventListener('click', () => this.closeDrawer());
      host.querySelector('[data-cc-close]')?.addEventListener('click', () => this.closeDrawer());
      this.byId('cc-dw-act-escalate')?.addEventListener('click', () => {
        const bed = (this.byId('cc-dw-act-escalate') as HTMLElement).dataset['bed'];
        this.closeDrawer();
        this.openRapid(bed || null);
      });
      this.byId('cc-dw-act-note')?.addEventListener('click', () => {
        const bed = (this.byId('cc-dw-act-note') as HTMLElement).dataset['bed'];
        this.closeDrawer();
        if (bed) this.openNote(bed);
      });
      this.byId('cc-dw-act-stepdown')?.addEventListener('click', () => {
        const bed = (this.byId('cc-dw-act-stepdown') as HTMLElement).dataset['bed'];
        this.closeDrawer();
        if (bed) this.openStep(bed);
      });
      this.byId('cc-dw-act-wean')?.addEventListener('click', () => {
        const bed = (this.byId('cc-dw-act-wean') as HTMLElement).dataset['bed'];
        const p = this.active().find((x) => x.bed === bed);
        if (!p) return;
        if (!p.support.vent) {
          this.toastService.show(p.name + ' is not ventilated.', 'error');
          return;
        }
        p.support.vent = false;
        p.ventMode = 'HFNC 40 L/min · FiO2 35%';
        this.closeDrawer();
        this.renderAll();
        this.toastService.show(p.name + ' weaned to high-flow nasal cannula.', 'success');
      });
    }
    return host;
  }

  private openDrawer(bed: string): void {
    const p = this.active().find((x) => x.bed === bed);
    if (!p) return;
    const score = this.scoreOf(p);
    const b = this.newsBand(score);
    const v = p.vitals;
    this.drawerHost();

    const avatar = this.byId('cc-dw-avatar');
    if (avatar) avatar.innerHTML = '<img class="absolute inset-0 size-full object-cover" src="' + this.avatarPhoto(p.name) + '" alt="" loading="lazy">';
    const title = this.byId('cc-dw-title');
    if (title) title.textContent = p.name;
    const sub = this.byId('cc-dw-sub');
    if (sub) sub.textContent = p.bed + ' · ' + p.age + ' yrs · ' + p.gender + ' · Day ' + p.los;

    const chips = this.byId('cc-dw-chips');
    if (chips) {
      chips.innerHTML =
        '<span class="hms-chip ' + this.CONDITION[p.condition].tone + '">' + p.condition + '</span>' +
        '<span class="hms-chip ' + b.tone + '">NEWS2 ' + score + '</span>' +
        '<span class="hms-chip tone-purple">SOFA ' + p.sofa + '</span>' +
        '<span class="hms-chip tone-info">' + this.esc(p.diagnosis) + '</span>';
    }

    const telemetry = this.byId('cc-dw-telemetry');
    if (telemetry) {
      telemetry.innerHTML =
        this.telemetryTile('Heart Rate', v.hr, 'bpm', v.hr > 90 || v.hr < 51, 'hr') +
        this.telemetryTile('SpO2', v.spo2, '%', v.spo2 < 94, 'spo2') +
        this.telemetryTile('Blood Pressure', v.bp, 'mmHg', parseInt(v.bp, 10) <= 110, 'bp') +
        this.telemetryTile('Resp. Rate', v.rr, '/min', v.rr > 20 || v.rr < 12, 'rr');
    }

    const organ = this.byId('cc-dw-organ');
    if (organ) {
      organ.innerHTML = this.ORGANS.map((o) => {
        const on = p.support[o.key];
        const detail = o.key === 'vent' ? p.ventMode : on ? 'Active' : 'Not required';
        return (
          '<div class="flex items-center gap-2.5 rounded-xl border border-border-color dark:border-white/10 px-3 py-2.5 ' + (on ? 'tone-critical' : 'tone-stable') + '">' +
          '<span class="cc-organ' + (on ? ' is-on' : '') + '"><i class="' + o.icon + '" aria-hidden="true"></i></span>' +
          '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + o.label + '</p>' +
          '<p class="text-[10px] text-gray-400 truncate">' + this.esc(detail) + '</p></div>' +
          '<span class="badge ' + (on ? 'badge-red' : 'badge-gray') + '">' + (on ? 'Active' : 'Off') + '</span></div>'
        );
      }).join('');
    }

    const sedation = this.byId('cc-dw-sedation');
    if (sedation) {
      const avpuLabel = ({ A: 'Alert', V: 'Voice', P: 'Pain', U: 'Unresponsive' } as Record<string, string>)[v.avpu] || v.avpu;
      sedation.innerHTML =
        '<div class="flex items-center gap-3">' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">RASS ' + (p.rass > 0 ? '+' : '') + p.rass + '</p>' +
        '<p class="text-[10px] text-gray-400">' + this.RASS_LABEL[String(p.rass)] + '</p></div>' +
        '<div class="cc-rass" role="img" aria-label="Richmond Agitation-Sedation Scale: ' + p.rass + '">' + this.rassScale(p.rass) + '</div></div>' +
        '<p class="mt-2.5 text-[10px] text-gray-400">AVPU: <span class="font-bold text-gray-600 dark:text-gray-300">' + avpuLabel + '</span></p>';
    }

    const infusions = this.byId('cc-dw-infusions');
    if (infusions) {
      infusions.innerHTML = p.infusions
        .map(
          (i) =>
            '<li class="' + i.tone + ' flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            '<span class="grid size-7 shrink-0 place-items-center rounded-lg bg-[color-mix(in_oklab,var(--tc-accent)_14%,transparent)] text-[var(--tc-accent)]">' +
            '<i class="icon-syringe text-[11px]" aria-hidden="true"></i></span>' +
            '<p class="text-xs font-bold text-gray-900 mr-auto">' + this.esc(i.drug) + '</p>' +
            '<span class="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 tabular-nums">' + this.esc(i.rate) + '</span></li>'
        )
        .join('');
    }

    const lines = this.byId('cc-dw-lines');
    if (lines) {
      lines.innerHTML = p.lines
        .map(
          (l) =>
            '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            '<i class="icon-cable text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
            '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + this.esc(l.name) + '</p>' +
            '<span class="badge ' + (l.risk ? 'badge-amber' : 'badge-gray') + '">Day ' + l.day + '</span>' +
            (l.risk ? '<span class="hms-chip tone-high"><i class="icon-triangle-alert text-[9px]" aria-hidden="true"></i>Review</span>' : '') +
            '</li>'
        )
        .join('');
    }

    const labs = this.byId('cc-dw-labs');
    if (labs) {
      labs.innerHTML = p.labs
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

    const notes = this.byId('cc-dw-notes');
    if (notes) {
      notes.innerHTML = p.notes
        .map(
          (n) =>
            '<article class="rounded-xl border border-border-color dark:border-white/10 p-3">' +
            '<div class="flex items-center gap-2">' +
            '<span class="hms-member-avatar tone-info size-7!"><img src="' + this.avatarPhoto(n.who) + '" alt="" loading="lazy"></span>' +
            '<div class="min-w-0 mr-auto"><p class="text-[11px] font-bold text-gray-900 truncate">' + this.esc(n.who) + '</p>' +
            '<p class="text-[9px] font-semibold text-gray-400">' + this.esc(n.role) + '</p></div>' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + this.esc(n.time) + '</span></div>' +
            '<p class="mt-2 text-xs text-gray-600 dark:text-gray-300">' + this.esc(n.text) + '</p></article>'
        )
        .join('');
    }

    const timeline = this.byId('cc-dw-timeline');
    if (timeline) {
      timeline.innerHTML = p.timeline
        .map((t) => {
          const state = t.state === 'done' ? 'is-done' : t.state === 'current' ? 'is-current' : '';
          return (
            '<li class="hms-tl-item ' + state + '">' +
            '<span class="hms-tl-node"><i class="' + (t.state === 'done' ? 'icon-check' : 'icon-activity') + '" aria-hidden="true"></i></span>' +
            '<div class="min-w-0 flex-1 -mt-0.5">' +
            '<div class="flex items-center gap-2">' +
            '<span class="text-[10px] font-bold text-gray-400 tabular-nums">' + this.esc(t.time) + '</span>' +
            (t.state === 'current' ? '<span class="hms-chip tone-critical">Now</span>' : '') +
            '</div>' +
            '<p class="mt-0.5 text-xs text-gray-600 dark:text-gray-300">' + this.esc(t.text) + '</p></div></li>'
          );
        })
        .join('');
    }

    ['cc-dw-act-escalate', 'cc-dw-act-wean', 'cc-dw-act-note', 'cc-dw-act-stepdown'].forEach((id) => {
      const el = this.byId(id);
      if (el) el.dataset['bed'] = p.bed;
    });

    this.byId('cc-drawer')?.classList.add('is-open');
    this.document.body.style.overflow = 'hidden';
    this.byId('cc-dw-close')?.focus();
  }

  private closeDrawer(): void {
    this.byId('cc-drawer')?.classList.remove('is-open');
    this.document.body.style.overflow = '';
  }

  /* ---------------- modals ---------------- */

  private modalHost(): HTMLElement {
    let host = this.byId('cc-modalhost');
    if (!host) {
      host = this.document.createElement('div');
      host.id = 'cc-modalhost';
      this.document.body.appendChild(host);
    }
    return host;
  }

  private closeModal(): void {
    const host = this.byId('cc-modalhost');
    if (host) host.innerHTML = '';
    if (!this.byId('cc-drawer')?.classList.contains('is-open')) this.document.body.style.overflow = '';
  }

  private openNote(bed: string): void {
    const p = this.active().find((x) => x.bed === bed);
    if (!p) return;
    const host = this.modalHost();
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">Add Note</h3><p class="text-[11px] text-gray-400">' + this.esc(p.name) + ' · ' + this.esc(p.bed) + '</p>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3 space-y-2">' +
      '<select id="cc-nt-type" class="form-select"><option>Progress note</option><option>Nursing note</option><option>Ward round note</option></select>' +
      '<textarea id="cc-nt-body" class="form-control" rows="4" placeholder="Write the note..."></textarea>' +
      '</div>' +
      '<div class="cc-modal-foot p-3 flex justify-end gap-2"><button type="button" data-cc-close class="btn btn-outline-secondary">Cancel</button><button type="button" id="cc-nt-save" class="btn btn-primary">Save Note</button></div>' +
      '</div></div>';

    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
    this.byId('cc-nt-save')?.addEventListener('click', () => {
      const body = (this.byId('cc-nt-body') as HTMLTextAreaElement).value.trim();
      if (!body) {
        this.toastService.show('Write the note before saving.', 'error');
        return;
      }
      const type = (this.byId('cc-nt-type') as HTMLSelectElement).value;
      p.notes.unshift({ who: 'Dr. Naomi Adeyemi', role: 'Intensivist', time: '09:42 AM', text: type + ': ' + body });
      this.closeModal();
      this.toastService.show('Note added to ' + p.name + "'s record.", 'success');
    });
  }

  private openStep(bed: string): void {
    const p = this.active().find((x) => x.bed === bed);
    if (!p) return;
    const score = this.scoreOf(p);
    const supports = this.ORGANS.filter((o) => o.key !== 'sedation' && p.support[o.key]);
    const reasons: string[] = [];
    if (score >= 5) reasons.push('NEWS2 is ' + score + ', which is still in the ' + this.newsBand(score).label.toLowerCase() + ' band');
    if (supports.length) reasons.push('still receiving ' + supports.map((o) => o.label.toLowerCase()).join(' and '));
    const warning = reasons.length ? 'This patient ' + reasons.join(', and is ') + '. Confirm with the consultant before stepping down.' : '';

    const host = this.modalHost();
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">Step Down</h3><p class="text-[11px] text-gray-400">' + this.esc(p.name) + ' · ' + this.esc(p.bed) + ' · NEWS2 ' + score + '</p>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3 space-y-2">' +
      (warning ? '<div id="cc-st-warning" class="rounded-lg p-2.5 text-xs bg-warning/10 text-warning">' + this.esc(warning) + '</div>' : '') +
      '<select id="cc-st-dest" class="form-select"><option>Surgical Ward</option><option>Medical Ward</option><option>HDU</option></select>' +
      '<textarea id="cc-st-notes" class="form-control" rows="3" placeholder="Step-down notes..."></textarea>' +
      '</div>' +
      '<div class="cc-modal-foot p-3 flex justify-end gap-2"><button type="button" data-cc-close class="btn btn-outline-secondary">Cancel</button><button type="button" id="cc-st-save" class="btn btn-primary">Confirm Step Down</button></div>' +
      '</div></div>';

    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
    this.byId('cc-st-save')?.addEventListener('click', () => {
      p.steppedDown = true;
      const dest = (this.byId('cc-st-dest') as HTMLSelectElement).value;
      this.closeModal();
      this.renderAll();
      this.toastService.show(p.name + ' stepped down to ' + dest + '. ' + p.bed + ' now open.', 'success');
    });
  }

  private openRapid(bed: string | null): void {
    const host = this.modalHost();
    const options = this.active()
      .map((p) => '<option value="' + this.esc(p.bed) + '"' + (p.bed === bed ? ' selected' : '') + '>' + this.esc(p.name) + ' (' + this.esc(p.bed) + ')</option>')
      .join('');
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">Rapid Response</h3>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3 space-y-2">' +
      '<select id="cc-rr-patient" class="form-select">' + options + '</select>' +
      '<textarea id="cc-rr-notes" class="form-control" rows="3" placeholder="Reason for rapid response..."></textarea>' +
      '</div>' +
      '<div class="cc-modal-foot p-3 flex justify-end gap-2"><button type="button" data-cc-close class="btn btn-outline-secondary">Cancel</button><button type="button" id="cc-rr-send" class="btn btn-danger">Call Rapid Response</button></div>' +
      '</div></div>';

    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
    this.byId('cc-rr-send')?.addEventListener('click', () => {
      const selected = (this.byId('cc-rr-patient') as HTMLSelectElement | null)?.value;
      const p = this.active().find((x) => x.bed === selected);
      this.closeModal();
      this.toastService.show('Rapid response called' + (p ? ' for ' + p.name + ' (' + p.bed + ')' : '') + ' — team en route.', 'error');
    });
  }

  private openAdmit(): void {
    const host = this.modalHost();
    const bedOpts = this.BAYS.filter((bay) => !this.active().some((p) => p.bed === bay))
      .map((bay) => '<option>' + this.esc(bay) + '</option>')
      .join('');
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">Admit to ICU</h3>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3 space-y-2">' +
      '<select id="cc-ad-bed" class="form-select"><option value="">Select a bed</option>' + bedOpts + '</select>' +
      '<input id="cc-ad-patient" class="form-control" placeholder="Patient name">' +
      '<input id="cc-ad-diagnosis" class="form-control" placeholder="Primary diagnosis">' +
      '</div>' +
      '<div class="cc-modal-foot p-3 flex justify-end gap-2"><button type="button" data-cc-close class="btn btn-outline-secondary">Cancel</button><button type="button" id="cc-ad-save" class="btn btn-primary">Admit Patient</button></div>' +
      '</div></div>';

    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
    this.byId('cc-ad-save')?.addEventListener('click', () => {
      const bedVal = (this.byId('cc-ad-bed') as HTMLSelectElement).value;
      const nameVal = (this.byId('cc-ad-patient') as HTMLInputElement).value.trim();
      const diagVal = (this.byId('cc-ad-diagnosis') as HTMLInputElement).value.trim();
      if (!bedVal) {
        this.toastService.show('No critical care bed is available.', 'error');
        return;
      }
      if (!nameVal) {
        this.toastService.show('Enter the patient name.', 'error');
        return;
      }
      if (!diagVal) {
        this.toastService.show('Enter a primary diagnosis.', 'error');
        return;
      }
      this.closeModal();
      this.toastService.show(nameVal + ' admitted to ' + bedVal + '.', 'success');
    });
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.byId('search')?.addEventListener('input', () => this.renderGrid());
    this.byId('filter-condition')?.addEventListener('change', () => this.renderGrid());
    this.byId('filter-support')?.addEventListener('change', () => this.renderGrid());

    const delegateOpen = (containerId: string) => {
      this.byId(containerId)?.addEventListener('click', (e: Event) => {
        const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
        if (t) this.openDrawer(t.dataset['open']!);
      });
    };
    delegateOpen('bed-board');
    delegateOpen('det-list');

    this.byId('bed-board')?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      const t = (ke.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
      if (!t) return;
      ke.preventDefault();
      this.openDrawer(t.dataset['open']!);
    });

    this.byId('grid-body')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const bed = btn.dataset['id']!;
      const act = btn.dataset['act'];
      if (act === 'view') this.openDrawer(bed);
      else if (act === 'note') this.openNote(bed);
      else if (act === 'rapid') this.openRapid(bed);
      else if (act === 'step') this.openStep(bed);
    });

    this.byId('btn-admit')?.addEventListener('click', () => this.openAdmit());
    this.byId('btn-rapid')?.addEventListener('click', () => this.openRapid(null));
    this.byId('btn-rounds')?.addEventListener('click', () => {
      this.toastService.show('Ward round started — ' + this.active().length + ' patients on the list.', 'info');
    });
    this.byId('btn-handover')?.addEventListener('click', () => {
      this.toastService.show('Handover sheet for ' + this.active().length + ' patients sent to the printer.', 'info');
      window.print();
    });

    this.document.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Escape') return;
      this.closeDrawer();
      this.closeModal();
    });
  }
}
