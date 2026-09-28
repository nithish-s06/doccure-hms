import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Bed {
  id: number;
  zone: string;
  zlabel: string;
  label: string;
  sev: string;
  empty: boolean;
  name?: string;
  mrn?: string;
  age?: number;
  gender?: string;
  blood?: string;
  diag?: string;
  los?: number;
  vent?: boolean;
  iso?: boolean;
  doc?: string;
  nurse?: string;
  av?: string;
  hr?: number;
  sys?: number;
  dia?: number;
  spo2?: number;
  temp?: number;
  rr?: number;
  stab?: number;
  alarm?: boolean;
  hist?: number[];
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ICU Monitoring Center
 * (icu-monitoring.html)". The overview widgets, vitals dashboard, bed
 * legend, floor map, ventilator panel and activity feed all ship as
 * static markup for the same frozen seed snapshot the source writes into
 * the page — this only wires the genuine follow-up interactions the
 * source keeps: focusing a different bed re-renders the Vital Signs
 * Dashboard, and full-screen toggles. The source's bed detail drawer and
 * its menu/modal system (#im-drawer / #im-menuhost / #im-modalhost) have
 * no corresponding host markup here, so a bed click and its row-action
 * menu surface their intent via a toast instead of opening a panel/form.
 */
@Component({
  imports: [],
  selector: 'app-icu-monitoring',
  styleUrl: './icu-monitoring.css',
  templateUrl: './icu-monitoring.html',
})
export class IcuMonitoring implements AfterViewInit {
  private readonly SEV: Record<string, string> = { red: 'Critical', orange: 'Serious', yellow: 'Observation', green: 'Stable', blue: 'Recovery', gray: 'Offline' };
  private readonly SEVC: Record<string, string> = { red: '#dc2626', orange: '#e06c1f', yellow: '#b7791f', green: '#15803d', blue: '#1d4ed8', gray: '#64748b' };

  private readonly BEDS: Bed[] = [
    { id: 0, zone: 'ICU-A', zlabel: 'ICU A', label: 'ICU-A-01', sev: 'red', empty: false, name: 'Rahul Sharma', mrn: 'MRN-40800', age: 54, gender: 'Female', blood: 'O+', diag: 'Acute MI', los: 3, vent: true, iso: false, doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', av: '#475569', hr: 122, sys: 141, dia: 54, spo2: 96, temp: 37.7, rr: 18, stab: 33, alarm: true, hist: [74, 98, 107, 99, 109, 78, 99, 105, 91, 78, 87, 106] },
    { id: 1, zone: 'ICU-A', zlabel: 'ICU A', label: 'ICU-A-02', sev: 'blue', empty: false, name: 'Anita Reddy', mrn: 'MRN-40801', age: 57, gender: 'Male', blood: 'A+', diag: 'Septic Shock', los: 16, vent: false, iso: false, doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', av: '#0f766e', hr: 97, sys: 145, dia: 71, spo2: 93, temp: 39.4, rr: 26, stab: 85, alarm: false, hist: [96, 64, 96, 109, 105, 61, 110, 64, 88, 87, 81, 60] },
    { id: 2, zone: 'ICU-A', zlabel: 'ICU A', label: 'ICU-A-03', sev: 'blue', empty: false, name: 'Vikram Nair', mrn: 'MRN-40802', age: 84, gender: 'Female', blood: 'B+', diag: 'ARDS', los: 3, vent: false, iso: false, doc: 'Dr. R. Nair', nurse: 'N. Sharma', av: '#1e40af', hr: 78, sys: 127, dia: 93, spo2: 97, temp: 36.2, rr: 24, stab: 88, alarm: false, hist: [61, 61, 85, 92, 91, 108, 78, 66, 76, 105, 61, 91] },
    { id: 3, zone: 'ICU-A', zlabel: 'ICU A', label: 'ICU-A-04', sev: 'red', empty: false, name: 'Priya Patel', mrn: 'MRN-40803', age: 64, gender: 'Male', blood: 'AB+', diag: 'Traumatic Brain Injury', los: 12, vent: false, iso: false, doc: 'Dr. L. Khan', nurse: 'N. Das', av: '#4338ca', hr: 78, sys: 101, dia: 59, spo2: 94, temp: 39.8, rr: 31, stab: 25, alarm: false, hist: [91, 91, 84, 105, 91, 87, 68, 75, 85, 83, 93, 88] },
    { id: 4, zone: 'ICU-A', zlabel: 'ICU A', label: 'ICU-A-05', sev: 'blue', empty: false, name: 'Suresh Gupta', mrn: 'MRN-40804', age: 69, gender: 'Female', blood: 'O-', diag: 'Post-CABG', los: 17, vent: true, iso: false, doc: 'Dr. P. Rao', nurse: 'N. Reddy', av: '#0e7490', hr: 138, sys: 114, dia: 55, spo2: 96, temp: 36.9, rr: 22, stab: 83, alarm: false, hist: [63, 60, 96, 78, 72, 103, 70, 104, 75, 98, 86, 97] },
    { id: 5, zone: 'ICU-B', zlabel: 'ICU B', label: 'ICU-B-01', sev: 'orange', empty: false, name: 'Meera Singh', mrn: 'MRN-40805', age: 26, gender: 'Male', blood: 'A-', diag: 'Ischemic Stroke', los: 2, vent: false, iso: false, doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', av: '#334155', hr: 75, sys: 104, dia: 89, spo2: 89, temp: 38.4, rr: 18, stab: 55, alarm: false, hist: [74, 60, 105, 93, 79, 62, 109, 109, 88, 85, 84, 86] },
    { id: 6, zone: 'ICU-B', zlabel: 'ICU B', label: 'ICU-B-02', sev: 'green', empty: false, name: 'Arjun Menon', mrn: 'MRN-40806', age: 31, gender: 'Female', blood: 'O+', diag: 'Multi-organ Failure', los: 8, vent: true, iso: false, doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', av: '#3f6212', hr: 102, sys: 96, dia: 74, spo2: 94, temp: 36.6, rr: 32, stab: 90, alarm: false, hist: [105, 61, 81, 63, 72, 75, 63, 73, 95, 89, 85, 85] },
    { id: 7, zone: 'ICU-B', zlabel: 'ICU B', label: 'ICU-B-03', sev: 'orange', empty: false, name: 'Kavya Das', mrn: 'MRN-40807', age: 65, gender: 'Male', blood: 'A+', diag: 'Severe Pneumonia', los: 10, vent: true, iso: false, doc: 'Dr. R. Nair', nurse: 'N. Sharma', av: '#7c2d12', hr: 104, sys: 141, dia: 65, spo2: 87, temp: 40, rr: 15, stab: 63, alarm: false, hist: [77, 61, 93, 70, 78, 69, 82, 98, 101, 83, 81, 69] },
    { id: 8, zone: 'ICU-B', zlabel: 'ICU B', label: 'ICU-B-04', sev: 'orange', empty: false, name: 'Deepak Joshi', mrn: 'MRN-40808', age: 39, gender: 'Female', blood: 'B+', diag: 'Diabetic Ketoacidosis', los: 10, vent: false, iso: false, doc: 'Dr. L. Khan', nurse: 'N. Das', av: '#475569', hr: 70, sys: 154, dia: 75, spo2: 87, temp: 36.5, rr: 22, stab: 48, alarm: false, hist: [71, 73, 92, 82, 92, 95, 93, 74, 95, 74, 93, 67] },
    { id: 9, zone: 'ICU-B', zlabel: 'ICU B', label: 'ICU-B-05', sev: 'gray', empty: true },
    { id: 10, zone: 'CCU', zlabel: 'CCU', label: 'CCU-01', sev: 'red', empty: false, name: 'Rohan Iyer', mrn: 'MRN-40810', age: 77, gender: 'Female', blood: 'O-', diag: 'Acute MI', los: 12, vent: false, iso: false, doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', av: '#1e40af', hr: 64, sys: 151, dia: 75, spo2: 91, temp: 40, rr: 26, stab: 31, alarm: false, hist: [78, 73, 60, 90, 61, 69, 104, 109, 60, 77, 96, 109] },
    { id: 11, zone: 'CCU', zlabel: 'CCU', label: 'CCU-02', sev: 'blue', empty: false, name: 'Sana Khan', mrn: 'MRN-40811', age: 65, gender: 'Male', blood: 'A-', diag: 'Septic Shock', los: 14, vent: false, iso: false, doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', av: '#4338ca', hr: 74, sys: 99, dia: 73, spo2: 88, temp: 37.2, rr: 25, stab: 83, alarm: false, hist: [60, 92, 82, 84, 76, 65, 70, 85, 104, 64, 99, 67] },
    { id: 12, zone: 'CCU', zlabel: 'CCU', label: 'CCU-03', sev: 'green', empty: false, name: 'Rahul Sharma', mrn: 'MRN-40812', age: 86, gender: 'Female', blood: 'O+', diag: 'ARDS', los: 17, vent: false, iso: false, doc: 'Dr. R. Nair', nurse: 'N. Sharma', av: '#0e7490', hr: 128, sys: 101, dia: 73, spo2: 97, temp: 38.1, rr: 31, stab: 87, alarm: false, hist: [67, 97, 102, 63, 105, 83, 79, 69, 73, 109, 73, 65] },
    { id: 13, zone: 'CCU', zlabel: 'CCU', label: 'CCU-04', sev: 'orange', empty: false, name: 'Anita Reddy', mrn: 'MRN-40813', age: 72, gender: 'Male', blood: 'A+', diag: 'Traumatic Brain Injury', los: 9, vent: true, iso: false, doc: 'Dr. L. Khan', nurse: 'N. Das', av: '#334155', hr: 104, sys: 111, dia: 63, spo2: 86, temp: 39.7, rr: 26, stab: 53, alarm: false, hist: [65, 91, 60, 100, 64, 81, 80, 77, 75, 110, 94, 66] },
    { id: 14, zone: 'NICU', zlabel: 'NICU', label: 'NICU-01', sev: 'blue', empty: false, name: 'Vikram Nair', mrn: 'MRN-40814', age: 76, gender: 'Female', blood: 'B+', diag: 'Post-CABG', los: 3, vent: true, iso: false, doc: 'Dr. P. Rao', nurse: 'N. Reddy', av: '#3f6212', hr: 81, sys: 126, dia: 55, spo2: 95, temp: 38.3, rr: 24, stab: 81, alarm: false, hist: [81, 92, 77, 106, 79, 78, 92, 89, 76, 85, 61, 72] },
    { id: 15, zone: 'NICU', zlabel: 'NICU', label: 'NICU-02', sev: 'gray', empty: true },
    { id: 16, zone: 'NICU', zlabel: 'NICU', label: 'NICU-03', sev: 'yellow', empty: false, name: 'Suresh Gupta', mrn: 'MRN-40816', age: 23, gender: 'Female', blood: 'O-', diag: 'Multi-organ Failure', los: 1, vent: true, iso: false, doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', av: '#475569', hr: 75, sys: 135, dia: 57, spo2: 99, temp: 38.6, rr: 20, stab: 66, alarm: false, hist: [78, 98, 79, 93, 63, 101, 95, 109, 78, 108, 86, 67] },
    { id: 17, zone: 'NICU', zlabel: 'NICU', label: 'NICU-04', sev: 'gray', empty: true },
    { id: 18, zone: 'PICU', zlabel: 'PICU', label: 'PICU-01', sev: 'yellow', empty: false, name: 'Arjun Menon', mrn: 'MRN-40818', age: 42, gender: 'Female', blood: 'O+', diag: 'Diabetic Ketoacidosis', los: 7, vent: true, iso: false, doc: 'Dr. L. Khan', nurse: 'N. Das', av: '#1e40af', hr: 70, sys: 91, dia: 96, spo2: 97, temp: 38.5, rr: 22, stab: 69, alarm: false, hist: [69, 69, 76, 92, 78, 61, 97, 106, 91, 108, 69, 109] },
    { id: 19, zone: 'PICU', zlabel: 'PICU', label: 'PICU-02', sev: 'yellow', empty: false, name: 'Kavya Das', mrn: 'MRN-40819', age: 83, gender: 'Male', blood: 'A+', diag: 'Cardiac Arrest', los: 7, vent: true, iso: false, doc: 'Dr. P. Rao', nurse: 'N. Reddy', av: '#4338ca', hr: 96, sys: 130, dia: 75, spo2: 89, temp: 38.7, rr: 26, stab: 78, alarm: false, hist: [88, 62, 92, 98, 100, 66, 110, 104, 100, 105, 66, 82] },
    { id: 20, zone: 'PICU', zlabel: 'PICU', label: 'PICU-03', sev: 'yellow', empty: false, name: 'Deepak Joshi', mrn: 'MRN-40820', age: 25, gender: 'Female', blood: 'B+', diag: 'Acute MI', los: 2, vent: true, iso: false, doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', av: '#0e7490', hr: 119, sys: 144, dia: 63, spo2: 97, temp: 38.7, rr: 22, stab: 71, alarm: false, hist: [82, 76, 65, 76, 97, 96, 65, 78, 76, 97, 63, 96] },
    { id: 21, zone: 'ISO', zlabel: 'Isolation ICU', label: 'ISO-01', sev: 'yellow', empty: false, name: 'Neha Verma', mrn: 'MRN-40821', age: 47, gender: 'Male', blood: 'AB+', diag: 'Septic Shock', los: 5, vent: true, iso: true, doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', av: '#334155', hr: 109, sys: 91, dia: 55, spo2: 87, temp: 37.1, rr: 26, stab: 66, alarm: false, hist: [90, 79, 89, 71, 103, 94, 87, 81, 101, 85, 93, 68] },
    { id: 22, zone: 'ISO', zlabel: 'Isolation ICU', label: 'ISO-02', sev: 'yellow', empty: false, name: 'Rohan Iyer', mrn: 'MRN-40822', age: 67, gender: 'Female', blood: 'O-', diag: 'ARDS', los: 14, vent: true, iso: true, doc: 'Dr. R. Nair', nurse: 'N. Sharma', av: '#3f6212', hr: 123, sys: 148, dia: 73, spo2: 95, temp: 38.8, rr: 30, stab: 80, alarm: false, hist: [98, 109, 88, 101, 93, 75, 66, 69, 94, 62, 110, 106] },
    { id: 23, zone: 'ISO', zlabel: 'Isolation ICU', label: 'ISO-03', sev: 'orange', empty: false, name: 'Sana Khan', mrn: 'MRN-40823', age: 21, gender: 'Male', blood: 'A-', diag: 'Traumatic Brain Injury', los: 6, vent: true, iso: true, doc: 'Dr. L. Khan', nurse: 'N. Das', av: '#7c2d12', hr: 103, sys: 110, dia: 86, spo2: 88, temp: 36.1, rr: 32, stab: 53, alarm: false, hist: [79, 81, 92, 96, 104, 87, 81, 63, 104, 96, 102, 79] },
  ];

  private focusId: number | null = null;
  private clockTimer: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const first = this.mon()[0];
    this.focusId = first ? first.id : null;

    this.wireEvents();

    setTimeout(() => {
      this.byId('im-skeleton')?.classList.add('hidden');
      this.byId('im-content')?.classList.remove('hidden');
      this.animateRings();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(msg: string): void {
    this.toastService.show(msg, 'info');
  }

  private mon(): Bed[] {
    return this.BEDS.filter((b) => !b.empty);
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  private animateRings(): void {
    this.document.querySelectorAll<HTMLElement>('.im-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  private clock(): void {
    const el = this.byId('im-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  /* ---------------- Vital Signs Dashboard ---------------- */

  private renderVitalsDash(): void {
    const b = this.BEDS.find((x) => x.id === this.focusId && !x.empty) || this.mon()[0];
    if (!b) return;
    const pt = this.byId('im-vs-pt');
    if (pt) pt.textContent = `${b.label} · ${b.name}`;

    const hist = b.hist || [];
    const cards: [string, string | number, string, string, string, number[]][] = [
      ['Heart Rate', b.hr!, 'bpm', '#dc2626', 'icon-heart-pulse', hist],
      ['Blood Pressure', `${b.sys}/${b.dia}`, 'mmHg', '#6d28d9', 'icon-activity', hist.map((v) => v + 30)],
      ['SpO₂', b.spo2!, '%', '#1d4ed8', 'icon-air-vent', hist.map((v) => 90 + (v % 9))],
      ['Temperature', b.temp!.toFixed(1), '°C', '#b45309', 'icon-thermometer', hist.map((v) => 36 + (v % 3))],
      ['Respiratory', b.rr!, '/min', '#15803d', 'icon-wind', hist.map((v) => 14 + (v % 16))],
      ['Pulse', b.hr!, 'bpm', '#0e7490', 'icon-heart', hist],
    ];
    const dash = this.byId('im-vitalsdash');
    if (dash) {
      dash.innerHTML = cards
        .map((c) => {
          const d = c[5];
          const mn = Math.min(...d);
          const mx = Math.max(...d);
          const rg = mx - mn || 1;
          const pts = d.map((v, i) => `${(i / (d.length - 1)) * 100},${28 - ((v - mn) / rg) * 26 - 1}`).join(' ');
          return `<div class="im-panel p-3">
            <div class="flex items-center justify-between mb-1"><span class="im-iconbadge w-7 h-7" style="color:${c[3]}"><i class="${c[4]} text-sm"></i></span><span class="text-[10px] im-mut uppercase">${c[2]}</span></div>
            <p class="text-xl font-bold tabular-nums" style="color:${c[3]}">${c[1]}</p><p class="text-[11px] im-mut mb-1.5">${c[0]}</p>
            <svg class="im-trend w-full h-8" viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${c[3]}" stroke-width="1.5"/></svg>
          </div>`;
        })
        .join('');
    }
  }

  /* ---------------- Floor (delete removes a bed) ---------------- */

  private readonly ZONES: [string, string, number][] = [['ICU-A', 'ICU A', 5], ['ICU-B', 'ICU B', 5], ['CCU', 'CCU', 4], ['NICU', 'NICU', 4], ['PICU', 'PICU', 3], ['ISO', 'Isolation ICU', 3]];

  private bedCard(b: Bed): string {
    const sc = this.SEVC[b.sev];
    if (b.empty) return `<div class="im-bed im-bed-empty sev-gray"><div class="flex items-center justify-between"><span class="text-xs font-bold im-mut">${b.label}</span><span class="im-npill">Empty</span></div><div class="flex items-center justify-center py-2 im-mut"><i class="icon-bed text-xl"></i></div></div>`;
    return `<div class="im-bed sev-${b.sev}" data-bed="${b.id}">
      <div class="flex items-center justify-between"><span class="text-xs font-bold im-head">${b.label}</span>${b.alarm ? '<span class="im-dot im-live" style="background:#dc2626"></span>' : `<span class="im-dot" style="background:${sc}"></span>`}</div>
      <p class="text-[11px] font-medium im-head truncate mt-1">${b.name}</p>
      <div class="flex items-center gap-1 mt-1 text-[10px]"><span style="color:#dc2626"><i class="icon-heart-pulse"></i> ${b.hr}</span>${b.vent ? '<span class="im-mut ml-1"><i class="icon-air-vent"></i></span>' : ''}${b.iso ? '<span class="im-mut ml-0.5"><i class="icon-shield"></i></span>' : ''}</div>
      <div class="im-stab mt-1.5"><span style="width:${b.stab}%;background:${sc}"></span></div>
    </div>`;
  }

  private renderFloor(): void {
    const el = this.byId('im-floor');
    if (!el) return;
    el.innerHTML = this.ZONES.map((z) => {
      const list = this.BEDS.filter((b) => b.zone === z[0]);
      const o = list.filter((b) => !b.empty).length;
      return `<div>
        <div class="flex items-center gap-2 mb-2"><span class="im-npill"><i class="icon-hospital text-[11px]"></i> ${z[1]}</span><span class="text-[11px] im-mut">${o}/${list.length} monitored</span><div class="flex-1 h-px" style="background:var(--im-border)"></div></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">${list.map((b) => this.bedCard(b)).join('')}</div>
      </div>`;
    }).join('');
  }

  private setFocus(id: number): void {
    this.focusId = id;
    this.renderVitalsDash();
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-fullscreen]')) {
        const el = this.document.documentElement as HTMLElement & { requestFullscreen?: () => void };
        if (!this.document.fullscreenElement) {
          el.requestFullscreen?.();
          this.toast('Full-screen monitoring');
        } else {
          (this.document as Document & { exitFullscreen?: () => void }).exitFullscreen?.();
        }
        return;
      }

      const t = target.closest('[data-bed],[data-menu-d],[data-action],[data-modal],[data-expfmt]') as HTMLElement | null;
      if (!t) return;

      if (t.dataset['bed'] !== undefined) {
        const id = +t.dataset['bed'];
        this.setFocus(id);
        const b = this.BEDS.find((x) => x.id === id);
        this.toast(`${b?.label} · ${b?.name} opened.`);
        return;
      }
      if (t.dataset['menuD'] !== undefined) {
        this.toast('Bed actions menu opened.');
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'] as string;
        const id = +(t.dataset['bid'] || -1);
        if (a === 'openmon' || a === 'view') {
          this.setFocus(id);
          this.toast('Loading patient...');
        } else if (a === 'delete') {
          const b = this.BEDS.find((x) => x.id === id);
          if (b) {
            b.empty = true;
            b.sev = 'gray';
          }
          this.renderFloor();
          this.animateRings();
          this.toast('Monitor removed');
        } else {
          const SIMPLE: Record<string, string> = { openmon: 'Opening monitor...', view: 'Loading patient...', lab: 'Lab ordered', radio: 'Radiology ordered', print: 'Printing report...', pdf: 'PDF downloaded', archive: 'Monitor archived', escalate: 'Escalate Alert opened.' };
          this.toast(SIMPLE[a] || 'Form opened.');
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.toast('Form opened.');
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast(`Exported: ${t.dataset['expfmt']}`);
        return;
      }
    });
  }
}
