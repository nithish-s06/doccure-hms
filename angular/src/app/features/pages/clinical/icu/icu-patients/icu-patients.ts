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
  spo2?: number;
  stab?: number;
  trend?: string;
}

interface Task {
  id: number;
  t: string;
  type: string;
  col: string;
  who: string;
  prio: string;
  ic: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ICU Patient Operations
 * (icu-patients.html)". This page's containers (#ip-floor, #ip-zonetabs,
 * #ip-acuity, #ip-meds, #ip-kanban, #ip-orders, #ip-team, #ip-activities,
 * #ip-ribbon, etc.) ship empty in the ported HTML, so the full render
 * engine — acuity board, zone-filtered bed floor plan, medication list,
 * Kanban task board (with drag-and-drop), doctor orders, care team,
 * activity feed and the alert ribbon — is reimplemented here as component
 * methods against seed data generated the same way the source does. The
 * source's row-action kebab menu and its modal system (#ip-menuhost /
 * #ip-modalhost) have no corresponding host markup in this page, so those
 * actions surface their intent via a toast instead of opening a menu/form.
 */
@Component({
  imports: [],
  selector: 'app-icu-patients',
  styleUrl: './icu-patients.css',
  templateUrl: './icu-patients.html',
})
export class IcuPatients implements AfterViewInit {
  private readonly SEV: Record<string, string> = { red: 'Critical', orange: 'Serious', yellow: 'Observation', green: 'Stable', blue: 'Recovery', gray: 'Available' };
  private readonly SEVC: Record<string, string> = { red: '#dc2626', orange: '#e06c1f', yellow: '#b7791f', green: '#15803d', blue: '#1d4ed8', gray: '#64748b' };
  private readonly DOCS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy'];
  private readonly DIAG = ['Acute MI', 'Septic Shock', 'ARDS', 'Traumatic Brain Injury', 'Post-CABG', 'Ischemic Stroke', 'Multi-organ Failure', 'Severe Pneumonia', 'Diabetic Ketoacidosis', 'Cardiac Arrest', 'GI Bleed', 'Status Epilepticus'];
  private readonly NAMES = ['Rahul Sharma', 'Anita Reddy', 'Vikram Nair', 'Priya Patel', 'Suresh Gupta', 'Meera Singh', 'Arjun Menon', 'Kavya Das', 'Deepak Joshi', 'Neha Verma', 'Rohan Iyer', 'Sana Khan', 'Manoj Rao', 'Divya Menon'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly BLOOD = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'];
  private readonly ZONES: [string, string, number][] = [['ICU-A', 'ICU A', 6], ['ICU-B', 'ICU B', 5], ['CCU', 'CCU', 5], ['NICU', 'NICU', 4], ['PICU', 'PICU', 4], ['ISO', 'Isolation ICU', 4]];
  private readonly MEDS = [
    { drug: 'Noradrenaline', cat: 'Infusion', status: 'Running', time: 'Continuous', doc: 'Dr. Mehta', nurse: 'N. Das', prio: 'Critical' },
    { drug: 'Piperacillin-Tazobactam', cat: 'Antibiotics', status: 'Upcoming', time: '14:00', doc: 'Dr. Kapoor', nurse: 'N. Pillai', prio: 'High' },
    { drug: 'Propofol', cat: 'Sedation', status: 'Running', time: 'Continuous', doc: 'Dr. Nair', nurse: 'N. Sharma', prio: 'High' },
    { drug: 'Insulin (sliding scale)', cat: 'IV Fluids', status: 'Upcoming', time: '13:30', doc: 'Dr. Rao', nurse: 'N. Reddy', prio: 'Medium' },
    { drug: 'Pantoprazole', cat: 'IV', status: 'Completed', time: '08:00', doc: 'Dr. Mehta', nurse: 'N. Fernandes', prio: 'Low' },
    { drug: 'Enteral Feed', cat: 'Nutrition', status: 'Running', time: 'Continuous', doc: 'Dietitian', nurse: 'N. Das', prio: 'Medium' },
    { drug: 'Furosemide', cat: 'IV', status: 'Missed', time: '11:00', doc: 'Dr. Khan', nurse: 'N. Pillai', prio: 'High' },
    { drug: 'Heparin', cat: 'Infusion', status: 'Running', time: 'Continuous', doc: 'Dr. Kapoor', nurse: 'N. Sharma', prio: 'High' },
    { drug: 'Paracetamol', cat: 'IV', status: 'Completed', time: '10:00', doc: 'Dr. Nair', nurse: 'N. Reddy', prio: 'Low' },
  ];
  private readonly medStatusC: Record<string, string> = { Running: '#15803d', Upcoming: '#1d4ed8', Completed: '#64748b', Missed: '#dc2626' };
  private readonly prioC: Record<string, string> = { Critical: '#dc2626', High: '#e06c1f', Medium: '#b7791f', Low: '#15803d' };
  private readonly KCOLS: [string, string][] = [['Pending', '#b7791f'], ['In Progress', '#1d4ed8'], ['Awaiting Review', '#6d28d9'], ['Completed', '#15803d']];
  private readonly ORDERS: [string, string, string, string, string, number, string][] = [
    ['Medication Order', 'Vancomycin 1g IV q12h', 'Dr. Mehta', 'Active', 'Critical', 70, 'icon-syringe'],
    ['Laboratory Order', 'ABG + Lactate q4h', 'Dr. Kapoor', 'In Progress', 'High', 45, 'icon-flask-conical'],
    ['Radiology Order', 'Portable Chest X-Ray', 'Dr. Nair', 'Pending', 'Medium', 10, 'icon-radiation'],
    ['Procedure Request', 'Bronchoscopy', 'Dr. Khan', 'Scheduled', 'High', 30, 'icon-slice'],
    ['Consultation', 'Nephrology review', 'Dr. Rao', 'Active', 'Medium', 60, 'icon-users'],
    ['Diet Order', 'Enteral feed 40ml/hr', 'Dietitian', 'Active', 'Low', 90, 'icon-salad'],
  ];
  private readonly ordStatC: Record<string, string> = { Active: '#15803d', 'In Progress': '#1d4ed8', Pending: '#b7791f', Scheduled: '#6d28d9' };
  private readonly ACTS: [string, string, string, string][] = [
    ['Patient Admitted', 'ICU-A-05 · Septic Shock', 'icon-user-plus', '#1d4ed8'],
    ['Medication Administered', 'Noradrenaline · ICU-A-03', 'icon-syringe', '#be185d'],
    ['Doctor Round Completed', 'Dr. Mehta · 6 patients', 'icon-stethoscope', '#15803d'],
    ['Ventilator Assigned', 'VENT-04 → ICU-B-02', 'icon-air-vent', '#6d28d9'],
    ['Lab Result Received', 'ABG · ICU-A-03', 'icon-flask-conical', '#b45309'],
    ['Radiology Completed', 'CXR · ICU-B-01', 'icon-radiation', '#0e7490'],
    ['Patient Stabilized', 'ICU-A-06 · improving', 'icon-heart-pulse', '#15803d'],
    ['Ward Transfer Requested', 'ICU-B-04 → General', 'icon-log-out', '#334155'],
  ];
  private readonly ALERTS: [string, string, string, string][] = [
    ['high', '#dc2626', 'Oxygen Level Critical — ICU-A-03', 'icon-alert-triangle'],
    ['med', '#e06c1f', 'High Blood Pressure — ICU-B-02', 'icon-activity'],
    ['high', '#dc2626', 'Ventilator Alarm — ICU-A-01', 'icon-siren'],
    ['med', '#b7791f', 'Medication Due — CCU-02', 'icon-syringe'],
    ['ok', '#15803d', 'Patient Stabilized — ICU-A-06', 'icon-heart-pulse'],
    ['high', '#dc2626', 'Code Blue — NICU-02', 'icon-alert-triangle'],
  ];
  private readonly SIMPLE: Record<string, string> = { monitor: 'Opening monitoring...', lab: 'Lab ordered', radio: 'Radiology ordered', print: 'Printing summary...', pdf: 'PDF downloaded', archive: 'Record archived' };
  private readonly MODAL_TITLES: Record<string, string> = {
    admit: 'Admit Patient', emergency: 'Emergency Admission', assignbed: 'Allocate Bed', transfer: 'Transfer Patient',
    ward: 'Transfer to Ward', doctor: 'Assign Doctor', nurse: 'Assign Nurse', medication: 'Medication Order',
    note: 'Clinical Note', orders: 'Doctor Orders', procedure: 'Schedule Procedure', import: 'Import Patients', export: 'Export Report',
  };

  private BEDS: Bed[] = [];
  private seq = 0;
  private activeId: number | null = null;
  private sel = new Set<number>();
  private zoneFilter = 'ALL';
  private bedQ = '';
  private medTab = 'All';
  private alertSev = 'all';
  private TASKS: Task[] = [
    { id: 1, t: 'Doctor Round — ICU-A', type: 'Doctor Round', col: 'Pending', who: 'Dr. Mehta', prio: 'High', ic: 'icon-stethoscope' },
    { id: 2, t: '08:00 Medication pass', type: 'Medication', col: 'In Progress', who: 'N. Das', prio: 'Critical', ic: 'icon-syringe' },
    { id: 3, t: 'ABG — Bed 3', type: 'Laboratory', col: 'Pending', who: 'Lab', prio: 'High', ic: 'icon-flask-conical' },
    { id: 4, t: 'Portable CXR — Bed 5', type: 'Radiology', col: 'Awaiting Review', who: 'Dr. Kapoor', prio: 'Medium', ic: 'icon-radiation' },
    { id: 5, t: 'Central line insertion', type: 'Procedure', col: 'In Progress', who: 'Dr. Nair', prio: 'High', ic: 'icon-slice' },
    { id: 6, t: 'Neuro assessment', type: 'Assessment', col: 'Pending', who: 'N. Pillai', prio: 'Medium', ic: 'icon-brain' },
    { id: 7, t: 'Chest physiotherapy', type: 'Physiotherapy', col: 'Completed', who: 'PT Team', prio: 'Low', ic: 'icon-person-standing' },
    { id: 8, t: 'Nutrition review', type: 'Nutrition Review', col: 'Awaiting Review', who: 'Dietitian', prio: 'Low', ic: 'icon-salad' },
    { id: 9, t: 'Vasopressor titration', type: 'Medication', col: 'In Progress', who: 'N. Sharma', prio: 'Critical', ic: 'icon-syringe' },
  ];
  private dragId: number | null = null;
  private clockTimer: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.ZONES.forEach((z) => {
      for (let i = 0; i < z[2]; i++) this.BEDS.push(this.mkBed(z[0], z[1], i));
    });
    const first = this.occ()[0];
    this.activeId = first ? first.id : null;

    this.wireEvents();

    setTimeout(() => {
      this.byId('ip-skeleton')?.classList.add('hidden');
      this.byId('ip-content')?.classList.remove('hidden');
      this.renderAcuity();
      this.renderZoneTabs();
      this.renderFloor();
      this.renderMeds();
      this.renderKanban();
      this.renderOrders();
      this.renderTeam();
      this.renderActs();
      this.renderRibbon();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private toast(msg: string): void {
    this.toastService.show(msg, 'info');
  }

  private occ(): Bed[] {
    return this.BEDS.filter((b) => !b.empty);
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  private trendIco(t?: string): string {
    return t === 'up' ? '<i class="icon-trending-up" style="color:#15803d"></i>' : t === 'down' ? '<i class="icon-trending-down" style="color:#dc2626"></i>' : '<i class="icon-minus ip-mut"></i>';
  }

  private mkBed(zone: string, zlabel: string, i: number): Bed {
    const empty = Math.random() < 0.16;
    const sevs = ['red', 'orange', 'orange', 'yellow', 'yellow', 'green', 'blue'];
    const sev = empty ? 'gray' : sevs[this.rnd(0, sevs.length - 1)];
    const id = this.seq++;
    const b: Bed = { id, zone, zlabel, label: zone + '-' + String(i + 1).padStart(2, '0'), sev, empty };
    if (!empty) {
      b.name = this.NAMES[id % this.NAMES.length];
      b.mrn = 'MRN-' + (20400 + id);
      b.age = this.rnd(18, 86);
      b.gender = id % 2 ? 'Male' : 'Female';
      b.blood = this.BLOOD[id % this.BLOOD.length];
      b.diag = this.DIAG[id % this.DIAG.length];
      b.los = this.rnd(1, 19);
      b.vent = Math.random() < 0.58;
      b.iso = zone === 'ISO' || Math.random() < 0.12;
      b.doc = this.DOCS[id % this.DOCS.length];
      b.nurse = this.NURSES[id % this.NURSES.length];
      b.av = this.AVC[id % this.AVC.length];
      b.hr = this.rnd(58, 138);
      b.spo2 = this.rnd(86, 99);
      b.stab = sev === 'red' ? this.rnd(20, 42) : sev === 'orange' ? this.rnd(45, 64) : sev === 'yellow' ? this.rnd(65, 80) : sev === 'blue' ? this.rnd(80, 90) : this.rnd(84, 98);
      b.trend = ['up', 'flat', 'down'][this.rnd(0, 2)];
    }
    return b;
  }

  /* ---------------- Acuity board ---------------- */

  private renderAcuity(): void {
    const el = this.byId('ip-acuity');
    if (!el) return;
    const order = ['red', 'orange', 'yellow', 'green', 'blue'];
    el.innerHTML = order
      .map((k) => {
        const list = this.occ().filter((b) => b.sev === k);
        const docs = new Set(list.map((b) => b.doc)).size;
        const prog = k === 'red' ? 28 : k === 'orange' ? 52 : k === 'yellow' ? 68 : k === 'green' ? 84 : 92;
        return `<div class="ip-acuity sev-${k}" data-acuity="${k}">
          <div class="flex items-center justify-between"><span class="ip-chip" style="background:color-mix(in srgb,${this.SEVC[k]} 14%,transparent);color:${this.SEVC[k]}">${this.SEV[k]}</span>${k === 'red' ? `<span class="ip-dot ip-live" style="background:${this.SEVC[k]}"></span>` : ''}</div>
          <p class="text-3xl font-bold ip-head mt-2 tabular-nums">${list.length}</p><p class="text-[11px] ip-mut">patients · ${docs} doctors</p>
          <div class="ip-stab mt-2"><span style="width:${prog}%;background:${this.SEVC[k]}"></span></div>
          <p class="text-[10px] ip-mut mt-1">Treatment progress ${prog}%</p>
        </div>`;
      })
      .join('');
  }

  /* ---------------- Bed workspace ---------------- */

  private renderZoneTabs(): void {
    const tabs = this.byId('ip-zonetabs');
    if (tabs) {
      tabs.innerHTML =
        `<button data-zone="ALL" class="${this.zoneFilter === 'ALL' ? 'on' : ''}">All</button>` +
        this.ZONES.map((z) => `<button data-zone="${z[0]}" class="${this.zoneFilter === z[0] ? 'on' : ''}">${z[1]}</button>`).join('');
    }
    const legend = this.byId('ip-bedlegend');
    if (legend) {
      legend.innerHTML = Object.keys(this.SEV)
        .map((k) => `<span class="flex items-center gap-1.5 ip-mut"><span class="ip-dot" style="background:${this.SEVC[k]}"></span>${this.SEV[k]}</span>`)
        .join('');
    }
  }

  private miniEcg(seed: number, color: string): string {
    const pts: string[] = [];
    for (let i = 0; i < 40; i++) {
      const x = (i / 39) * 100;
      let y = 12;
      const ph = (i + seed) % 12;
      if (ph === 4) y = 3;
      else if (ph === 5) y = 21;
      else if (ph === 6) y = 8;
      else y = 12 + Math.sin(i + seed) * 1.2;
      pts.push(x.toFixed(1) + ',' + y.toFixed(1));
    }
    return `<svg class="ip-ecg w-full h-4" viewBox="0 0 100 24" style="color:${color}"><polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
  }

  private bedTile(b: Bed): string {
    if (b.empty) {
      return `<div class="ip-bed ip-bed-empty sev-gray" data-modal="assignbed">
        <div class="flex items-center justify-between"><span class="text-xs font-bold ip-mut">${b.label}</span><span class="ip-chip risk">Available</span></div>
        <div class="flex flex-col items-center justify-center py-4 ip-mut"><i class="icon-bed text-2xl"></i><p class="text-[11px] mt-1">Assign patient</p></div></div>`;
    }
    return `<div class="ip-bed sev-${b.sev} ${b.id === this.activeId ? 'sel' : ''}" data-bed="${b.id}">
      <div class="flex items-center justify-between mb-1.5">
        <label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${b.id}" ${this.sel.has(b.id) ? 'checked' : ''} class="accent-[var(--ip-c)]"><span class="text-xs font-bold ip-head">${b.label}</span></label>
        <span class="ip-chip risk">${b.sev === 'red' ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}${this.SEV[b.sev]}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="ip-avatar flex-none" style="width:36px;height:36px;background:${b.av};font-size:12px">${this.initials(b.name!)}</span>
        <div class="min-w-0 flex-1"><p class="text-sm font-semibold ip-head truncate">${b.name}</p><p class="text-[10px] ip-mut">${b.mrn} · ${b.age}y · Day ${b.los}</p></div>
        <button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ip-hover)] flex items-center justify-center ip-mut"><i class="icon-more-vertical text-sm"></i></button>
      </div>
      <p class="text-[11px] ip-mut mt-1.5 truncate">${b.diag}</p>
      <div class="mt-1.5">${this.miniEcg(b.id, this.SEVC[b.sev])}</div>
      <div class="flex items-center gap-1.5 mt-1 text-[10px] flex-wrap">
        <span class="ip-chip" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626"><i class="icon-heart-pulse text-[10px]"></i> ${b.hr}</span>
        <span class="ip-chip" style="background:color-mix(in srgb,#1d4ed8 11%,transparent);color:#1d4ed8"><i class="icon-activity text-[10px]"></i> ${b.spo2}%</span>
        ${b.vent ? '<span class="ip-npill"><i class="icon-air-vent text-[10px]"></i> Vent</span>' : ''}
        ${b.iso ? '<span class="ip-npill"><i class="icon-shield text-[10px]"></i> Iso</span>' : ''}
      </div>
      <div class="flex items-center justify-between mt-1.5"><div class="ip-stab flex-1 mr-2"><span style="width:${b.stab}%;background:${this.SEVC[b.sev]}"></span></div><span class="text-[10px] font-bold flex items-center gap-0.5" style="color:${this.SEVC[b.sev]}">${b.stab}% ${this.trendIco(b.trend)}</span></div>
      <div class="prev mt-1.5 pt-1.5 border-t" style="border-color:var(--ip-border)"><p class="text-[10px] ip-mut flex items-center gap-1"><i class="icon-stethoscope text-[10px]"></i> ${b.doc} · <i class="icon-user-check text-[10px]"></i> ${b.nurse}</p></div>
    </div>`;
  }

  private renderFloor(): void {
    const el = this.byId('ip-floor');
    if (!el) return;
    const zones = this.zoneFilter === 'ALL' ? this.ZONES : this.ZONES.filter((z) => z[0] === this.zoneFilter);
    el.innerHTML =
      zones
        .map((z) => {
          let list = this.BEDS.filter((b) => b.zone === z[0]);
          if (this.bedQ) {
            const q = this.bedQ.toLowerCase();
            list = list.filter((b) => b.empty || b.name!.toLowerCase().includes(q) || b.mrn!.toLowerCase().includes(q) || b.diag!.toLowerCase().includes(q) || b.label.toLowerCase().includes(q));
          }
          if (!list.length) return '';
          const o = list.filter((b) => !b.empty).length;
          return `<div>
            <div class="flex items-center gap-2 mb-2"><span class="ip-npill"><i class="icon-hospital text-[11px]"></i> ${z[1]}</span><span class="text-[11px] ip-mut">${o}/${list.length} occupied</span><div class="flex-1 h-px" style="background:var(--ip-border)"></div></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((b) => this.bedTile(b)).join('')}</div>
          </div>`;
        })
        .join('') || `<p class="text-sm ip-mut text-center py-6">No beds match your filter.</p>`;
  }

  /* ---------------- Medication ---------------- */

  private renderMeds(): void {
    const el = this.byId('ip-meds');
    if (!el) return;
    const list = this.MEDS.filter((m) => this.medTab === 'All' || m.status === this.medTab);
    el.innerHTML =
      list
        .map(
          (m) => `<div class="ip-panel p-3" style="border-left:3px solid ${this.medStatusC[m.status]}">
        <div class="flex items-center justify-between mb-1"><span class="text-sm font-bold ip-head">${m.drug}</span><span class="ip-chip" style="background:color-mix(in srgb,${this.medStatusC[m.status]} 13%,transparent);color:${this.medStatusC[m.status]}">${m.status}</span></div>
        <p class="text-[11px] ip-mut mb-2"><span class="ip-npill mr-1">${m.cat}</span> ${m.time}</p>
        <div class="flex items-center justify-between text-[11px]"><span class="ip-mut flex items-center gap-1"><i class="icon-stethoscope text-[11px]"></i> ${m.doc}</span><span class="ip-chip" style="background:color-mix(in srgb,${this.prioC[m.prio]} 12%,transparent);color:${this.prioC[m.prio]}">${m.prio}</span></div>
        <div class="flex items-center justify-between text-[11px] mt-1"><span class="ip-mut flex items-center gap-1"><i class="icon-user-check text-[11px]"></i> ${m.nurse}</span>${m.status === 'Upcoming' ? '<button data-med-admin class="font-semibold text-[color:var(--ip-accent)] hover:underline">Administer</button>' : m.status === 'Missed' ? '<button data-med-admin class="font-semibold text-rose-600 hover:underline">Reschedule</button>' : ''}</div>
      </div>`
        )
        .join('') || `<p class="text-sm ip-mut col-span-3 text-center py-4">No medications in this category.</p>`;
  }

  /* ---------------- Kanban ---------------- */

  private renderKanban(): void {
    const el = this.byId('ip-kanban');
    if (!el) return;
    el.innerHTML = this.KCOLS.map((c) => {
      const list = this.TASKS.filter((t) => t.col === c[0]);
      return `<div class="ip-kcol p-2.5" data-kcol="${c[0]}">
        <div class="flex items-center justify-between mb-2 px-1"><span class="text-sm font-bold ip-head flex items-center gap-1.5"><span class="ip-dot" style="background:${c[1]}"></span> ${c[0]}</span><span class="ip-npill">${list.length}</span></div>
        <div class="space-y-2 min-h-[40px]" data-kbody="${c[0]}">
        ${list
          .map(
            (t) => `<div class="ip-ktask" draggable="true" data-task="${t.id}" style="border-left:3px solid ${this.prioC[t.prio]}">
          <div class="flex items-start gap-2"><span class="ip-iconbadge w-7 h-7 flex-none" style="color:${this.prioC[t.prio]}"><i class="${t.ic} text-sm"></i></span>
          <div class="min-w-0 flex-1"><p class="text-xs font-semibold ip-head leading-tight">${t.t}</p><p class="text-[10px] ip-mut mt-0.5">${t.type} · ${t.who}</p></div></div>
          <div class="flex items-center justify-between mt-1.5"><span class="ip-chip" style="background:color-mix(in srgb,${this.prioC[t.prio]} 12%,transparent);color:${this.prioC[t.prio]}">${t.prio}</span><i class="icon-grip-vertical ip-mut text-xs"></i></div>
        </div>`
          )
          .join('') || `<p class="text-[11px] ip-mut text-center py-2">Drop tasks here</p>`}
        </div></div>`;
    }).join('');
  }

  /* ---------------- Doctor orders ---------------- */

  private renderOrders(): void {
    const el = this.byId('ip-orders');
    if (!el) return;
    el.innerHTML = this.ORDERS.map(
      (o) => `<div class="ip-panel p-3">
      <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold ip-head flex items-center gap-1.5"><i class="${o[6]}" style="color:${this.prioC[o[4]]}"></i> ${o[0]}</span><span class="ip-chip" style="background:color-mix(in srgb,${this.ordStatC[o[3]]} 13%,transparent);color:${this.ordStatC[o[3]]}">${o[3]}</span></div>
      <p class="text-[11px] ip-mut mb-2">${o[1]} · ${o[2]}</p>
      <div class="flex items-center gap-2"><div class="ip-stab flex-1"><span style="width:${o[5]}%;background:${this.ordStatC[o[3]]}"></span></div><span class="text-[10px] ip-mut">${o[5]}%</span><span class="ip-chip" style="background:color-mix(in srgb,${this.prioC[o[4]]} 12%,transparent);color:${this.prioC[o[4]]}">${o[4]}</span></div>
    </div>`
    ).join('');
  }

  /* ---------------- Care team ---------------- */

  private renderTeam(): void {
    const el = this.byId('ip-team');
    if (!el) return;
    const docs: [string, string, string, number, string, string][] = [
      ['Dr. A. Mehta', 'Intensivist', 'Day', 3, '11:30', 'Available'],
      ['Dr. S. Kapoor', 'Cardiac ICU', 'Day', 2, '12:00', 'In Round'],
    ];
    const nurses: [string, number, number, number, string][] = [
      ['N. Fernandes', 6, 4, 2, 'Day'],
      ['N. Das', 5, 5, 3, 'Day'],
    ];
    const rt: [string, number, string, string][] = [
      ['R. Thomas', 5, 'Day', 'Available'],
      ['S. Abraham', 4, 'Night', 'On Call'],
    ];
    const av = (nm: string, i: number) => `<span class="ip-avatar flex-none" style="width:36px;height:36px;background:${this.AVC[i % this.AVC.length]};font-size:12px">${this.initials(nm)}</span>`;
    el.innerHTML = `
      <div><p class="text-[11px] font-bold ip-mut uppercase tracking-wide mb-2">Doctors</p><div class="grid sm:grid-cols-2 gap-2">
      ${docs.map((x, i) => `<div class="ip-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ip-head truncate">${x[0]}</p><p class="text-[10px] ip-mut">${x[1]} · ${x[2]}</p></div><span class="ip-chip" style="background:color-mix(in srgb,${x[5] === 'Available' ? '#15803d' : '#b7791f'} 13%,transparent);color:${x[5] === 'Available' ? '#15803d' : '#b7791f'}">${x[5]}</span></div><div class="flex justify-between text-[10px] ip-mut mt-2"><span>${x[3]} critical</span><span>Next round ${x[4]}</span></div></div>`).join('')}
      </div></div>
      <div><p class="text-[11px] font-bold ip-mut uppercase tracking-wide mb-2">Nurses</p><div class="grid sm:grid-cols-2 gap-2">
      ${nurses.map((x, i) => `<div class="ip-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i + 2)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ip-head truncate">${x[0]}</p><p class="text-[10px] ip-mut">${x[1]} beds · ${x[4]}</p></div></div><div class="flex justify-between text-[10px] mt-2"><span class="ip-mut">${x[2]} patients</span><span style="color:#b7791f">${x[3]} meds due</span></div></div>`).join('')}
      </div></div>
      <div><p class="text-[11px] font-bold ip-mut uppercase tracking-wide mb-2">Respiratory Therapists</p><div class="grid sm:grid-cols-2 gap-2">
      ${rt.map((x, i) => `<div class="ip-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i + 4)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ip-head truncate">${x[0]}</p><p class="text-[10px] ip-mut">${x[1]} ventilators · ${x[2]}</p></div><span class="ip-chip" style="background:color-mix(in srgb,${x[3] === 'Available' ? '#15803d' : '#b7791f'} 13%,transparent);color:${x[3] === 'Available' ? '#15803d' : '#b7791f'}">${x[3]}</span></div></div>`).join('')}
      </div></div>`;
  }

  /* ---------------- Activities / ribbon ---------------- */

  private renderActs(): void {
    const el = this.byId('ip-activities');
    if (!el) return;
    el.innerHTML = this.ACTS.map(
      (a) => `<div class="flex items-center gap-3 ip-panel px-3 py-2"><span class="ip-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span><div class="min-w-0 flex-1"><p class="text-sm font-semibold ip-head">${a[0]}</p><p class="text-[11px] ip-mut truncate">${a[1]}</p></div><span class="text-[10px] ip-mut">${this.rnd(1, 58)}m</span></div>`
    ).join('');
  }

  private renderRibbon(): void {
    const el = this.byId('ip-ribbon');
    if (!el) return;
    let list = this.ALERTS.filter((a) => this.alertSev === 'all' || a[0] === this.alertSev);
    if (!list.length) list = [['ok', '#15803d', 'No alerts in this category', 'icon-check']];
    const one = list.map((a) => `<span class="ip-alert" style="background:color-mix(in srgb,${a[1]} 11%,transparent);color:${a[1]};border-color:color-mix(in srgb,${a[1]} 30%,transparent)"><i class="${a[3]} text-[13px]"></i> ${a[2]}</span>`).join('');
    el.innerHTML = one + one;
  }

  /* ---------------- Bulk ---------------- */

  private updateBulk(): void {
    const count = this.byId('ip-selcount');
    if (count) count.textContent = String(this.sel.size);
    this.document.querySelectorAll('.ip-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private clock(): void {
    const el = this.byId('ip-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-zone]')) {
        this.zoneFilter = (target.closest('[data-zone]') as HTMLElement).dataset['zone'] || 'ALL';
        this.renderZoneTabs();
        this.renderFloor();
        return;
      }
      if (target.closest('[data-sev]')) {
        const b = target.closest('[data-sev]') as HTMLElement;
        this.alertSev = b.dataset['sev'] || 'all';
        this.document.querySelectorAll('#ip-alertfilter button').forEach((x) => x.classList.toggle('on', x === b));
        this.renderRibbon();
        return;
      }
      if (target.closest('[data-medtab]')) {
        const b = target.closest('[data-medtab]') as HTMLElement;
        this.medTab = b.dataset['medtab'] || 'All';
        this.document.querySelectorAll('#ip-medtabs button').forEach((x) => x.classList.toggle('on', x === b));
        this.renderMeds();
        return;
      }
      if (target.closest('[data-acuity]')) {
        const k = (target.closest('[data-acuity]') as HTMLElement).dataset['acuity'];
        const first = this.occ().find((b) => b.sev === k);
        if (first) {
          this.activeId = first.id;
          this.renderFloor();
        }
        return;
      }
      if (target.closest('[data-med-admin]')) {
        this.toast('Medication updated');
        return;
      }

      const t = target.closest('[data-bed],[data-menu],[data-action],[data-modal],[data-dismiss-alerts],[data-bulk]') as HTMLElement | null;
      if (!t) return;
      if (t.dataset['bed'] !== undefined) {
        this.activeId = +t.dataset['bed'];
        this.renderFloor();
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        this.toast('Bed actions menu opened.');
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'] as string;
        const id = +(t.dataset['bid'] || -1);
        this.activeId = id;
        if (a === 'view') {
          this.renderFloor();
        } else if (a === 'delete') {
          const b = this.BEDS.find((x) => x.id === id);
          if (b) {
            b.empty = true;
            b.sev = 'gray';
          }
          this.renderFloor();
          this.renderAcuity();
          this.toast('Record removed');
        } else if (this.MODAL_TITLES[a]) {
          this.toast(`${this.MODAL_TITLES[a]} opened.`);
        } else if (this.SIMPLE[a]) {
          this.toast(this.SIMPLE[a]);
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.toast(`${this.MODAL_TITLES[t.dataset['modal']] || 'Form'} opened.`);
        return;
      }
      if (t.dataset['dismissAlerts'] !== undefined) {
        const wrap = this.byId('ip-ribbonwrap');
        if (wrap) wrap.style.display = 'none';
        this.toast('Alerts dismissed');
        return;
      }
      if (t.dataset['bulk'] !== undefined) {
        const bk = t.dataset['bulk'];
        if (bk === 'delete') {
          this.BEDS.forEach((b) => {
            if (this.sel.has(b.id)) {
              b.empty = true;
              b.sev = 'gray';
            }
          });
          this.sel.clear();
          this.renderFloor();
          this.renderAcuity();
          this.updateBulk();
          this.toast('Records removed');
        } else {
          const labels: Record<string, string> = { doctor: 'Doctor assigned', nurse: 'Nurse assigned', transfer: 'Transfers initiated', status: 'Status updated', print: 'Printing', export: 'Exported', archive: 'Archived' };
          this.toast(`${labels[bk!] || 'Updated'} · ${this.sel.size} patients`);
          if (bk === 'archive') {
            this.sel.clear();
            this.renderFloor();
            this.updateBulk();
          }
        }
        return;
      }
    });

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.dataset && target.dataset['sel'] !== undefined) {
        const id = +target.dataset['sel'];
        if (target.checked) this.sel.add(id);
        else this.sel.delete(id);
        this.updateBulk();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'ip-bedsearch') {
        this.bedQ = target.value;
        this.renderFloor();
      }
    });

    // Kanban drag-and-drop
    this.document.addEventListener('dragstart', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) {
        this.dragId = +(t.dataset['task'] || -1);
        t.classList.add('drag');
      }
    });
    this.document.addEventListener('dragend', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) t.classList.remove('drag');
      this.document.querySelectorAll('.ip-kcol').forEach((c) => c.classList.remove('over'));
    });
    this.document.addEventListener('dragover', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c) {
        e.preventDefault();
        this.document.querySelectorAll('.ip-kcol').forEach((x) => x.classList.toggle('over', x === c));
      }
    });
    this.document.addEventListener('drop', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c && this.dragId != null) {
        e.preventDefault();
        const task = this.TASKS.find((x) => x.id === this.dragId);
        if (task) {
          task.col = c.dataset['kcol'] || task.col;
          this.renderKanban();
          this.toast(`Task → ${task.col}`);
        }
        this.dragId = null;
      }
    });
  }
}
