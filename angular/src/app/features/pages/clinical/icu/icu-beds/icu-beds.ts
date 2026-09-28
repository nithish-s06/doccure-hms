import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Bed {
  id: number;
  zone: string;
  zlabel: string;
  label: string;
  status: string;
  type: string;
  iso: boolean;
  clean: number;
  maint: boolean;
  doc: string;
  nurse: string;
  av: string;
  name?: string;
  mrn?: string;
  age?: number;
  gender?: string;
  blood?: string;
  diag?: string;
  los?: number;
  vent?: boolean;
  crit?: boolean;
  hr?: number;
  spo2?: number;
  stab?: number;
  disc?: string;
  resFor?: string;
  resEta?: string;
}

interface CleanTask {
  id: number;
  bed: string;
  col: string;
  staff: string;
  eta: string;
  prio: string;
  check: string;
}

interface Transfer {
  pt: string;
  from: string;
  to: string;
  doc: string;
  prio: string;
  eta: string;
  type: string;
  av: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ICU Bed Command Center (icu-beds.html)".
 * The hero stats, zone tabs/legend, bed floor map, bed workspace, status
 * matrix, cleaning kanban, transfers, equipment/care-team panels, timeline
 * and activity feed are all frozen static markup already baked into
 * icu-beds.html (per the source's own comments), so this component only
 * ports the genuine follow-up interactions: zone/status/search filters, bed
 * selection, drag-drop kanban, transfer tabs, capacity ribbon filter, the
 * row menu, and the allocate/reserve/release/transfer/etc. modals + bulk bar.
 */
@Component({
  imports: [],
  selector: 'app-icu-beds',
  styleUrl: './icu-beds.css',
  templateUrl: './icu-beds.html',
})
export class IcuBeds implements AfterViewInit {
  private readonly STC: Record<string, string> = { occupied: 'red', available: 'green', reserved: 'blue', cleaning: 'yellow', maintenance: 'orange', inactive: 'gray' };
  private readonly STLABEL: Record<string, string> = { occupied: 'Occupied', available: 'Available', reserved: 'Reserved', cleaning: 'Cleaning', maintenance: 'Maintenance', inactive: 'Inactive' };
  private readonly BC: Record<string, string> = { green: '#16a34a', blue: '#2563eb', yellow: '#ca8a04', orange: '#ea580c', red: '#dc2626', gray: '#64748b' };
  private readonly DOCS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy'];
  private readonly HK = ['H. Kumar', 'H. Bibi', 'H. Raju', 'H. Sunita'];
  private readonly DIAG = ['Acute MI', 'Septic Shock', 'ARDS', 'TBI', 'Post-CABG', 'Ischemic Stroke', 'Severe Pneumonia', 'DKA', 'Cardiac Arrest', 'GI Bleed'];
  private readonly NAMES = ['Rahul Sharma', 'Anita Reddy', 'Vikram Nair', 'Priya Patel', 'Suresh Gupta', 'Meera Singh', 'Arjun Menon', 'Kavya Das', 'Deepak Joshi', 'Neha Verma', 'Rohan Iyer', 'Sana Khan'];
  private readonly BLOOD = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'];
  private readonly BEDTYPES = ['Standard ICU', 'High-Dependency', 'Ventilator Bed', 'Isolation', 'Cardiac', 'Neonatal'];
  private readonly ZONES: [string, string, number][] = [
    ['ICU-A', 'ICU A', 6],
    ['ICU-B', 'ICU B', 6],
    ['CCU', 'CCU', 5],
    ['NICU', 'NICU', 4],
    ['PICU', 'PICU', 4],
    ['ISO', 'Isolation ICU', 4],
  ];

  // Frozen static seed data (one snapshot of what the old Math.random()-driven
  // mkBed()/ZONES.forEach() loop used to generate randomly on every page load).
  private BEDS: Bed[] = [{"id":0,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-01","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#475569","name":"Rahul Sharma","mrn":"MRN-30500","age":30,"gender":"Female","blood":"O+","diag":"Acute MI","los":12,"vent":true,"crit":true,"hr":102,"spo2":88,"stab":36,"disc":"Jul 28"},{"id":1,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-02","status":"maintenance","type":"High-Dependency","iso":false,"clean":100,"maint":true,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#0f766e"},{"id":2,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-03","status":"available","type":"Ventilator Bed","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#1e40af"},{"id":3,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-04","status":"available","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#4338ca"},{"id":4,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#0e7490","name":"Suresh Gupta","mrn":"MRN-30504","age":31,"gender":"Female","blood":"O-","diag":"Post-CABG","los":1,"vent":true,"crit":false,"hr":108,"spo2":92,"stab":81,"disc":"Jul 22"},{"id":5,"zone":"ICU-A","zlabel":"ICU A","label":"ICU-A-06","status":"cleaning","type":"Neonatal","iso":false,"clean":27,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#334155"},{"id":6,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-01","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#3f6212","name":"Arjun Menon","mrn":"MRN-30506","age":48,"gender":"Female","blood":"O+","diag":"Severe Pneumonia","los":8,"vent":true,"crit":false,"hr":92,"spo2":96,"stab":75,"disc":"Jul 28"},{"id":7,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-02","status":"available","type":"High-Dependency","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#7c2d12"},{"id":8,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-03","status":"occupied","type":"Ventilator Bed","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#475569","name":"Deepak Joshi","mrn":"MRN-30508","age":35,"gender":"Female","blood":"B+","diag":"Cardiac Arrest","los":6,"vent":true,"crit":false,"hr":62,"spo2":98,"stab":96,"disc":"Jul 26"},{"id":9,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-04","status":"occupied","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#0f766e","name":"Neha Verma","mrn":"MRN-30509","age":54,"gender":"Male","blood":"AB+","diag":"GI Bleed","los":16,"vent":true,"crit":true,"hr":69,"spo2":97,"stab":38,"disc":"Jul 27"},{"id":10,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#1e40af","name":"Rohan Iyer","mrn":"MRN-30510","age":80,"gender":"Female","blood":"O-","diag":"Acute MI","los":17,"vent":false,"crit":true,"hr":81,"spo2":97,"stab":38,"disc":"Jul 28"},{"id":11,"zone":"ICU-B","zlabel":"ICU B","label":"ICU-B-06","status":"reserved","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#4338ca","resFor":"Vikram Nair","resEta":"4h"},{"id":12,"zone":"CCU","zlabel":"CCU","label":"CCU-01","status":"available","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#0e7490"},{"id":13,"zone":"CCU","zlabel":"CCU","label":"CCU-02","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#334155","name":"Anita Reddy","mrn":"MRN-30513","age":54,"gender":"Male","blood":"A+","diag":"TBI","los":15,"vent":true,"crit":false,"hr":82,"spo2":88,"stab":87,"disc":"Jul 24"},{"id":14,"zone":"CCU","zlabel":"CCU","label":"CCU-03","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#3f6212","name":"Vikram Nair","mrn":"MRN-30514","age":77,"gender":"Female","blood":"B+","diag":"Post-CABG","los":17,"vent":true,"crit":true,"hr":124,"spo2":89,"stab":33,"disc":"Jul 24"},{"id":15,"zone":"CCU","zlabel":"CCU","label":"CCU-04","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#7c2d12","name":"Priya Patel","mrn":"MRN-30515","age":41,"gender":"Male","blood":"AB+","diag":"Ischemic Stroke","los":17,"vent":true,"crit":true,"hr":105,"spo2":99,"stab":40,"disc":"Jul 22"},{"id":16,"zone":"CCU","zlabel":"CCU","label":"CCU-05","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#475569","name":"Suresh Gupta","mrn":"MRN-30516","age":34,"gender":"Female","blood":"O-","diag":"Severe Pneumonia","los":14,"vent":false,"crit":true,"hr":99,"spo2":90,"stab":37,"disc":"Jul 21"},{"id":17,"zone":"NICU","zlabel":"NICU","label":"NICU-01","status":"occupied","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#0f766e","name":"Meera Singh","mrn":"MRN-30517","age":33,"gender":"Male","blood":"A-","diag":"DKA","los":15,"vent":false,"crit":false,"hr":77,"spo2":99,"stab":84,"disc":"Jul 21"},{"id":18,"zone":"NICU","zlabel":"NICU","label":"NICU-02","status":"maintenance","type":"Neonatal","iso":false,"clean":100,"maint":true,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#1e40af"},{"id":19,"zone":"NICU","zlabel":"NICU","label":"NICU-03","status":"occupied","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#4338ca","name":"Kavya Das","mrn":"MRN-30519","age":39,"gender":"Male","blood":"A+","diag":"GI Bleed","los":12,"vent":false,"crit":false,"hr":93,"spo2":95,"stab":72,"disc":"Jul 20"},{"id":20,"zone":"NICU","zlabel":"NICU","label":"NICU-04","status":"available","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0e7490"},{"id":21,"zone":"PICU","zlabel":"PICU","label":"PICU-01","status":"reserved","type":"Isolation","iso":false,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#334155","resFor":"Rahul Sharma","resEta":"2h"},{"id":22,"zone":"PICU","zlabel":"PICU","label":"PICU-02","status":"occupied","type":"Cardiac","iso":false,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#3f6212","name":"Rohan Iyer","mrn":"MRN-30522","age":30,"gender":"Female","blood":"O-","diag":"ARDS","los":9,"vent":true,"crit":false,"hr":110,"spo2":91,"stab":92,"disc":"Jul 23"},{"id":23,"zone":"PICU","zlabel":"PICU","label":"PICU-03","status":"available","type":"Neonatal","iso":false,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#7c2d12"},{"id":24,"zone":"PICU","zlabel":"PICU","label":"PICU-04","status":"occupied","type":"Standard ICU","iso":false,"clean":100,"maint":false,"doc":"Dr. P. Rao","nurse":"N. Reddy","av":"#475569","name":"Rahul Sharma","mrn":"MRN-30524","age":82,"gender":"Female","blood":"O+","diag":"Post-CABG","los":5,"vent":true,"crit":true,"hr":75,"spo2":98,"stab":24,"disc":"Jul 25"},{"id":25,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-01","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. A. Mehta","nurse":"N. Fernandes","av":"#0f766e","name":"Anita Reddy","mrn":"MRN-30525","age":74,"gender":"Male","blood":"A+","diag":"Ischemic Stroke","los":4,"vent":true,"crit":false,"hr":126,"spo2":93,"stab":71,"disc":"Jul 24"},{"id":26,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-02","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. S. Kapoor","nurse":"N. Pillai","av":"#1e40af","name":"Vikram Nair","mrn":"MRN-30526","age":46,"gender":"Female","blood":"B+","diag":"Severe Pneumonia","los":5,"vent":true,"crit":true,"hr":70,"spo2":88,"stab":29,"disc":"Jul 22"},{"id":27,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-03","status":"occupied","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. R. Nair","nurse":"N. Sharma","av":"#4338ca","name":"Priya Patel","mrn":"MRN-30527","age":44,"gender":"Male","blood":"AB+","diag":"DKA","los":11,"vent":true,"crit":false,"hr":99,"spo2":93,"stab":92,"disc":"Jul 23"},{"id":28,"zone":"ISO","zlabel":"Isolation ICU","label":"ISO-04","status":"reserved","type":"Isolation","iso":true,"clean":100,"maint":false,"doc":"Dr. L. Khan","nurse":"N. Das","av":"#0e7490","resFor":"Kavya Das","resEta":"2h"}];

  private seq = 29;
  private activeId = 0;
  private readonly sel = new Set<number>();

  private zoneFilter = 'ALL';
  private bedQ = '';
  private statusFilter = '';

  private readonly KCOLS: [string, string][] = [
    ['Pending Cleaning', '#f59e0b'],
    ['Cleaning', '#0ea5e9'],
    ['Inspection', '#a855f7'],
    ['Ready', '#22c55e'],
  ];
  private CTASKS: CleanTask[] = [
    { id: 1, bed: 'ICU-A-04', col: 'Pending Cleaning', staff: 'H. Kumar', eta: '15m', prio: 'High', check: '3/6' },
    { id: 2, bed: 'ICU-B-02', col: 'Cleaning', staff: 'H. Bibi', eta: '8m', prio: 'Critical', check: '4/6' },
    { id: 3, bed: 'CCU-03', col: 'Cleaning', staff: 'H. Raju', eta: '12m', prio: 'Medium', check: '2/6' },
    { id: 4, bed: 'ICU-A-01', col: 'Inspection', staff: 'Supervisor', eta: '5m', prio: 'High', check: '6/6' },
    { id: 5, bed: 'NICU-02', col: 'Pending Cleaning', staff: 'H. Sunita', eta: '20m', prio: 'Low', check: '0/6' },
    { id: 6, bed: 'PICU-01', col: 'Ready', staff: 'H. Kumar', eta: '—', prio: 'Low', check: '6/6' },
    { id: 7, bed: 'ISO-02', col: 'Cleaning', staff: 'H. Bibi', eta: '25m', prio: 'Critical', check: '1/6' },
  ];
  private readonly prioC: Record<string, string> = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' };
  private dragId: number | null = null;

  private readonly TRANSFERS: Transfer[] = [
    { pt: 'Rahul Sharma', from: 'ER', to: 'ICU-A-05', doc: 'Dr. Mehta', prio: 'Critical', eta: '10m', type: 'Incoming', av: '#ef4444' },
    { pt: 'Anita Reddy', from: 'ICU-B-02', to: 'General Ward', doc: 'Dr. Kapoor', prio: 'Medium', eta: '30m', type: 'Outgoing', av: '#a855f7' },
    { pt: 'Vikram Nair', from: 'PICU-03', to: 'ICU-A-04', doc: 'Dr. Nair', prio: 'High', eta: '15m', type: 'Incoming', av: '#0ea5e9' },
    { pt: 'Priya Patel', from: 'ICU-A-01', to: 'Isolation ICU', doc: 'Dr. Khan', prio: 'Critical', eta: '5m', type: 'Emergency', av: '#f97316' },
    { pt: 'Suresh Gupta', from: 'CCU-02', to: 'Cardiac Step-down', doc: 'Dr. Rao', prio: 'Low', eta: '—', type: 'Completed', av: '#22c55e' },
    { pt: 'Meera Singh', from: 'ICU-B-04', to: 'ICU-A-06', doc: 'Dr. Mehta', prio: 'Medium', eta: '20m', type: 'Outgoing', av: '#ec4899' },
  ];
  private trTab = 'All';
  private readonly trTypeC: Record<string, string> = { Incoming: '#22c55e', Outgoing: '#0ea5e9', Emergency: '#ef4444', Completed: '#64748b' };

  private readonly TLINE: [string, string, string, string, string, string][] = [
    ['Bed Allocated', 'Day 1 · 02:14', 'Charge Nurse', 'Assigned to R. Sharma', 'icon-bed', '#6366f1'],
    ['Patient Admitted', 'Day 1 · 02:20', 'Dr. Mehta', 'From ER · Acute MI', 'icon-user-plus', '#0ea5e9'],
    ['Equipment Assigned', 'Day 1 · 02:35', 'RT Thomas', 'Ventilator VENT-04', 'icon-cpu', '#a855f7'],
    ['Cleaning Started', 'Day 3 · 10:00', 'H. Kumar', 'Post-procedure clean', 'icon-spray-can', '#eab308'],
    ['Cleaning Completed', 'Day 3 · 10:48', 'H. Kumar', 'Turnover 48 min', 'icon-check', '#22c55e'],
    ['Maintenance', 'Day 4 · 09:00', 'Bio-medical', 'Monitor calibration', 'icon-wrench', '#f97316'],
    ['Patient Transfer', 'Day 5 · 14:20', 'Dr. Kapoor', '→ ICU-A-06', 'icon-arrow-left-right', '#ec4899'],
  ];

  private readonly ALERTS: [string, string, string, string][] = [
    ['avail', '#16a34a', 'Bed ICU-A12 Available', 'icon-bed'],
    ['crit', '#dc2626', 'ICU-B07 Critical Occupancy', 'icon-alert-triangle'],
    ['clean', '#ca8a04', 'Bed Cleaning Completed — CCU-03', 'icon-spray-can'],
    ['avail', '#2563eb', 'Patient Transfer Scheduled — PICU-03', 'icon-arrow-left-right'],
    ['clean', '#ea580c', 'Isolation Bed Reserved — ISO-02', 'icon-shield'],
    ['crit', '#dc2626', 'Emergency bed requested — ICU-A', 'icon-ambulance'],
  ];
  private capF = 'all';

  private readonly ACTIONS: [string, string, string][] = [
    ['View Bed', 'icon-eye', 'view'],
    ['Allocate Bed', 'icon-bed', 'allocate'],
    ['Reserve Bed', 'icon-bookmark', 'reserve'],
    ['Release Bed', 'icon-bed', 'release'],
    ['Transfer Patient', 'icon-arrow-left-right', 'transfer'],
    ['Assign Doctor', 'icon-stethoscope', 'doctor'],
    ['Assign Nurse', 'icon-user-check', 'nurse'],
    ['Assign Equipment', 'icon-cpu', 'equipment'],
    ['Mark Cleaning', 'icon-spray-can', 'cleaning'],
    ['Mark Maintenance', 'icon-wrench', 'maintenance'],
    ['View History', 'icon-history', 'history'],
    ['Print Details', 'icon-printer', 'print'],
    ['Download PDF', 'icon-file-down', 'pdf'],
    ['Archive', 'icon-archive', 'archive'],
    ['Delete', 'icon-trash-2', 'delete'],
  ];

  private readonly SIMPLE: Record<string, string> = { pdf: 'PDF downloaded', print: 'Printing bed details...', archive: 'Bed archived' };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.activeId = this.BEDS.find((b) => b.status === 'occupied')?.id ?? this.BEDS[0].id;
  }

  ngAfterViewInit(): void {
    this.wireEvents();

    setTimeout(() => {
      this.byId('ib-skeleton')?.classList.add('hidden');
      this.byId('ib-content')?.classList.remove('hidden');
      this.animateRings();
      this.clock();
      setInterval(() => this.clock(), 1000);
    }, 1500);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private toast(msg: string, icon?: string): void {
    this.toastService.show(msg, 'success');
  }

  private statusColor(b: Bed): string {
    return this.BC[this.STC[b.status]];
  }

  private count(st: string): number {
    return this.BEDS.filter((b) => b.status === st).length;
  }

  /* ---------------- render: hero / zones / floor ---------------- */

  private renderHero(): void {
    const total = this.BEDS.length,
      occ = this.count('occupied'),
      avail = this.count('available'),
      res = this.count('reserved'),
      cln = this.count('cleaning'),
      iso = this.BEDS.filter((b) => b.iso).length;
    const occrate = this.byId('ib-h-occrate');
    if (occrate) occrate.textContent = Math.round((occ / total) * 100) + '%';
    const s: [string, number, string][] = [
      ['Total ICU Beds', total, '#818cf8'],
      ['Occupied', occ, '#f87171'],
      ['Available', avail, '#34d399'],
      ['Reserved', res, '#60a5fa'],
      ['Cleaning', cln, '#fcd34d'],
      ['Isolation', iso, '#5eead4'],
    ];
    const el = this.byId('ib-herostats');
    if (el) el.innerHTML = s.map((x) => `<div class="ib-hstat"><p class="text-[11px] text-slate-300">${x[0]}</p><p class="text-xl font-bold" style="color:${x[2]}">${x[1]}</p></div>`).join('');
  }

  private renderZoneTabs(): void {
    const zt = this.byId('ib-zonetabs');
    if (zt) zt.innerHTML = `<button data-zone="ALL" class="${this.zoneFilter === 'ALL' ? 'on' : ''}">All</button>` + this.ZONES.map((z) => `<button data-zone="${z[0]}" class="${this.zoneFilter === z[0] ? 'on' : ''}">${z[1]}</button>`).join('');
    const lg = this.byId('ib-bedlegend');
    if (lg) lg.innerHTML = Object.keys(this.STLABEL).map((k) => `<span class="flex items-center gap-1 ib-mut"><span class="ib-dot" style="background:${this.BC[this.STC[k]]}"></span>${this.STLABEL[k]}</span>`).join('');
  }

  private bedCard(b: Bed): string {
    const bc = this.statusColor(b),
      scls = 'bs-' + this.STC[b.status];
    if (b.status !== 'occupied') {
      const icon = ({ available: 'icon-bed', reserved: 'icon-bookmark', cleaning: 'icon-spray-can', maintenance: 'icon-wrench', inactive: 'icon-bed' } as Record<string, string>)[b.status];
      const extra =
        b.status === 'reserved'
          ? `<p class="text-[10px] ib-mut mt-1">Reserved for ${b.resFor} · ETA ${b.resEta}</p>`
          : b.status === 'cleaning'
          ? `<div class="ib-stab mt-2"><span style="width:${b.clean}%;background:${bc}"></span></div><p class="text-[10px] ib-mut mt-1">Turnover ${b.clean}%</p>`
          : b.status === 'maintenance'
          ? `<p class="text-[10px] ib-mut mt-1">Bio-medical servicing</p>`
          : b.status === 'inactive'
          ? `<p class="text-[10px] ib-mut mt-1">Out of service</p>`
          : `<p class="text-[10px] ib-mut mt-1">Ready for allocation</p>`;
      return `<div class="ib-bed ${scls} ${b.id === this.activeId ? 'sel' : ''}" data-bed="${b.id}">
                <div class="flex items-center justify-between mb-1"><label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${b.id}" ${this.sel.has(b.id) ? 'checked' : ''} class="accent-[var(--ib-c)]"><span class="text-xs font-bold ib-head">${b.label}</span></label><span class="ib-chip stat">${this.STLABEL[b.status]}</span></div>
                <div class="flex flex-col items-center justify-center py-2 text-center"><i class="${icon} text-2xl" style="color:${bc}"></i><p class="text-[11px] ib-mut mt-1">${b.type}</p></div>
                ${extra}
                <div class="flex items-center justify-between mt-2 text-[10px] ib-mut"><span>${b.iso ? '<i class="icon-shield"></i> Iso' : '<i class="icon-bed"></i> ' + b.zlabel}</span><button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ib-hover)] flex items-center justify-center"><i class="icon-more-vertical"></i></button></div>
            </div>`;
    }
    const ini = (b.name || '').split(' ').map((n) => n[0]).join('');
    return `<div class="ib-bed ${scls} ${b.id === this.activeId ? 'sel' : ''}" data-bed="${b.id}">
            <div class="flex items-center justify-between mb-1.5"><label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${b.id}" ${this.sel.has(b.id) ? 'checked' : ''} class="accent-[var(--ib-c)]"><span class="text-xs font-bold ib-head">${b.label}</span></label><span class="ib-chip stat">${b.crit ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}Occupied</span></div>
            <div class="flex items-center gap-2">
                <span class="rounded-lg flex items-center justify-center text-white font-bold flex-none" style="width:36px;height:36px;background:${b.av};font-size:12px">${ini}</span>
                <div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head truncate">${b.name}</p><p class="text-[10px] ib-mut">${b.mrn} · ${b.age}y · ${(b.gender || '')[0]} · Day ${b.los}</p></div>
                <button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ib-hover)] flex items-center justify-center ib-mut"><i class="icon-more-vertical text-sm"></i></button>
            </div>
            <p class="text-[11px] ib-mut mt-1.5 truncate">${b.diag} · ${b.type}</p>
            <div class="flex items-center gap-1.5 mt-1.5 text-[10px] flex-wrap">
                <span class="ib-chip" style="background:color-mix(in srgb,${b.crit ? '#ef4444' : '#22c55e'} 13%,transparent);color:${b.crit ? '#dc2626' : '#16a34a'}"><span class="ib-monidot ib-live" style="background:${b.crit ? '#ef4444' : '#22c55e'}"></span> ${b.hr} · ${b.spo2}%</span>
                ${b.vent ? '<span class="ib-chip" style="background:color-mix(in srgb,#a855f7 15%,transparent);color:#9333ea"><i class="icon-wind"></i> Vent</span>' : ''}
                ${b.iso ? '<span class="ib-chip" style="background:color-mix(in srgb,#14b8a6 15%,transparent);color:#0d9488"><i class="icon-shield"></i> Iso</span>' : ''}
            </div>
            <div class="prev mt-1.5 pt-1.5 border-t" style="border-color:var(--ib-border)"><p class="text-[10px] ib-mut"><i class="icon-stethoscope"></i> ${b.doc}</p><p class="text-[10px] ib-mut"><i class="icon-user-check"></i> ${b.nurse} · Disc. ${b.disc}</p></div>
        </div>`;
  }

  private renderFloor(): void {
    const zones = this.zoneFilter === 'ALL' ? this.ZONES : this.ZONES.filter((z) => z[0] === this.zoneFilter);
    const el = this.byId('ib-floor');
    if (!el) return;
    el.innerHTML =
      zones
        .map((z) => {
          let list = this.BEDS.filter((b) => b.zone === z[0]);
          if (this.statusFilter) list = list.filter((b) => b.status === this.statusFilter);
          if (this.bedQ) {
            const q = this.bedQ.toLowerCase();
            list = list.filter((b) => b.label.toLowerCase().includes(q) || (b.name && b.name.toLowerCase().includes(q)) || (b.mrn && b.mrn.toLowerCase().includes(q)) || b.type.toLowerCase().includes(q));
          }
          if (!list.length) return '';
          const o = list.filter((b) => b.status === 'occupied').length;
          return `<div>
                    <div class="flex items-center gap-2 mb-2"><span class="ib-chip" style="background:color-mix(in srgb,#6366f1 14%,transparent);color:#4f46e5"><i class="icon-hospital"></i> ${z[1]}</span><span class="text-[11px] ib-mut">${o}/${list.length} occupied</span><div class="flex-1 h-px" style="background:var(--ib-border)"></div></div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((b) => this.bedCard(b)).join('')}</div>
                </div>`;
        })
        .join('') || `<p class="text-sm ib-mut text-center py-6">No beds match your filter.</p>`;
  }

  /* ---------------- render: workspace ---------------- */

  private renderWorkspace(): void {
    const b = this.BEDS.find((x) => x.id === this.activeId) || this.BEDS[0];
    this.activeId = b.id;
    const bc = this.statusColor(b);
    const box = (t: string, ic: string, body: string) => `<div class="ib-panel p-3"><p class="text-[11px] font-bold ib-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} text-indigo-500"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-0.5"><span class="ib-mut">${k}</span><span class="font-medium ib-head">${v}</span></div>`;
    const occ = b.status === 'occupied';
    const ws = this.byId('ib-workspace');
    if (ws) {
      ws.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <span class="rounded-xl flex items-center justify-center flex-none" style="width:48px;height:48px;background:color-mix(in srgb,${bc} 16%,transparent);color:${bc}"><i class="icon-bed text-2xl"></i></span>
                        <div><p class="text-lg font-bold ib-head">${b.label}</p><p class="text-[11px] ib-mut">${b.zlabel} · ${b.type}${b.iso ? ' · Isolation' : ''}</p></div>
                    </div>
                    <div class="flex items-center gap-2"><span class="ib-chip" style="background:color-mix(in srgb,${bc} 16%,transparent);color:${bc}">${this.STLABEL[b.status]}</span><button data-menu="${b.id}" class="w-8 h-8 rounded-lg border flex items-center justify-center ib-mut" style="border-color:var(--ib-border)"><i class="icon-more-vertical"></i></button></div>
                </div>
                <div class="grid sm:grid-cols-2 gap-3">
                    ${box('Bed Information', 'icon-info', row('Bed No', b.label) + row('Zone', b.zlabel) + row('Type', b.type) + row('Isolation', b.iso ? 'Yes' : 'No') + row('Status', this.STLABEL[b.status]))}
                    ${
                      occ
                        ? box('Patient Information', 'icon-user', row('Name', b.name || '') + row('MRN', b.mrn || '') + row('Age / Sex', b.age + 'y / ' + b.gender) + row('Blood', b.blood || '') + row('Diagnosis', b.diag || ''))
                        : box('Current Occupancy', 'icon-user-x', '<p class="text-xs ib-mut">' + (b.status === 'reserved' ? 'Reserved for ' + b.resFor + ' (ETA ' + b.resEta + ')' : 'No patient assigned — bed ' + this.STLABEL[b.status].toLowerCase() + '.') + '</p>')
                    }
                    ${box('Admission & Discharge', 'icon-calendar', occ ? row('Admitted', 'Day ' + b.los) + row('Expected Discharge', b.disc || '') + row('Consultant', b.doc) : row('Last Occupied', '2 days ago') + row('Avg Turnover', '48 min'))}
                    ${box('Cleaning Schedule', 'icon-spray-can', row('Status', b.status === 'cleaning' ? 'In progress (' + b.clean + '%)' : 'Completed') + row('Last Clean', 'Today 06:20') + row('Next Due', 'On discharge'))}
                    ${box('Maintenance History', 'icon-wrench', row('Status', b.maint ? 'Under service' : 'Operational') + row('Last Service', 'Jul 12') + row('Next Check', 'Aug 12'))}
                    ${box('Assigned Equipment', 'icon-cpu', '<div class="flex flex-wrap gap-1">' + ['Ventilator', 'ECG Monitor', 'Infusion Pump'].map((e) => `<span class="ib-chip" style="background:color-mix(in srgb,#0ea5e9 12%,transparent);color:#0284c7">${e}</span>`).join('') + '</div>')}
                    ${box('Assigned Staff', 'icon-users', row('Doctor', b.doc) + row('Nurse', b.nurse) + row('Housekeeping', this.HK[b.id % this.HK.length]))}
                    ${box('Transfer History', 'icon-arrow-left-right', (occ ? ['Admitted from ER', 'Moved from ICU-B-02'] : ['Discharged to General', 'Deep clean completed']).map((x) => `<div class="flex items-center gap-2 text-xs py-0.5"><i class="icon-dot text-indigo-500"></i> ${x}</div>`).join(''))}
                </div>
                ${box('Bed Notes', 'icon-sticky-note', '<p class="text-xs ib-mut">' + (occ ? (b.crit ? 'Critical patient — 1:1 nursing, continuous monitoring.' : 'Stable. Standard monitoring, review on next round.') : 'Bed prepared per ICU protocol. Ready as scheduled.') + '</p>')}
                <div class="flex flex-wrap gap-2 mt-3">
                    ${
                      occ
                        ? '<button data-modal="release" class="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--ib-c)] text-white hover:opacity-90"><i class="icon-bed"></i> Release</button><button data-modal="transfer" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-arrow-left-right"></i> Transfer</button>'
                        : '<button data-modal="allocate" class="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--ib-c)] text-white hover:opacity-90"><i class="icon-bed"></i> Allocate</button><button data-modal="reserve" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-bookmark"></i> Reserve</button>'
                    }
                    <button data-modal="equipment" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-cpu"></i> Equipment</button>
                    <button data-modal="cleaning" class="text-xs font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)"><i class="icon-spray-can"></i> Cleaning</button>
                </div>`;
    }
    this.renderTimeline();
  }

  /* ---------------- render: matrix ---------------- */

  private ring(p: number, color: string, label: string, val: number): string {
    return `<div class="ib-panel p-3 flex flex-col items-center text-center">
            <div class="relative w-16 h-16"><svg viewBox="0 0 36 36" class="ib-ring w-16 h-16"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ib-track)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-sm font-bold" style="color:${color}">${val}</span></div>
            <p class="text-[11px] font-semibold ib-head mt-1.5">${label}</p></div>`;
  }

  private renderMatrix(): void {
    const total = this.BEDS.length;
    const m: [string, number, string, string][] = [
      ['occupied', this.count('occupied'), '#ef4444', 'Occupied'],
      ['available', this.count('available'), '#22c55e', 'Available'],
      ['reserved', this.count('reserved'), '#3b82f6', 'Reserved'],
      ['cleaning', this.count('cleaning'), '#eab308', 'Cleaning'],
      ['maintenance', this.count('maintenance'), '#f97316', 'Maintenance'],
      ['isolation', this.BEDS.filter((b) => b.iso).length, '#14b8a6', 'Isolation'],
    ];
    const el = this.byId('ib-matrix');
    if (el) el.innerHTML = m.map((x) => this.ring(Math.round((x[1] / total) * 100), x[2], x[3], x[1])).join('');
  }

  /* ---------------- render: kanban ---------------- */

  private renderKanban(): void {
    const el = this.byId('ib-kanban');
    if (!el) return;
    el.innerHTML = this.KCOLS.map((c) => {
      const list = this.CTASKS.filter((t) => t.col === c[0]);
      return `<div class="ib-kcol p-2.5" data-kcol="${c[0]}">
                <div class="flex items-center justify-between mb-2 px-1"><span class="text-sm font-bold ib-head flex items-center gap-1.5"><span class="ib-dot" style="background:${c[1]}"></span> ${c[0]}</span><span class="ib-chip" style="background:color-mix(in srgb,${c[1]} 15%,transparent);color:${c[1]}">${list.length}</span></div>
                <div class="space-y-2 min-h-[40px]" data-kbody="${c[0]}">
                ${
                  list
                    .map(
                      (t) => `<div class="ib-ktask" draggable="true" data-task="${t.id}" style="border-left:3px solid ${this.prioC[t.prio]}">
                    <div class="flex items-center justify-between"><span class="text-sm font-bold ib-head"><i class="icon-bed text-sm" style="color:${this.prioC[t.prio]}"></i> ${t.bed}</span><span class="ib-chip" style="background:color-mix(in srgb,${this.prioC[t.prio]} 13%,transparent);color:${this.prioC[t.prio]}">${t.prio}</span></div>
                    <div class="flex items-center justify-between text-[10px] ib-mut mt-1.5"><span><i class="icon-user"></i> ${t.staff}</span><span><i class="icon-clock"></i> ETA ${t.eta}</span></div>
                    <div class="flex items-center justify-between mt-1"><span class="text-[10px] ib-mut"><i class="icon-list-checks"></i> Checklist ${t.check}</span><i class="icon-grip-vertical ib-mut text-xs"></i></div>
                </div>`
                    )
                    .join('') || `<p class="text-[11px] ib-mut text-center py-2">Drop beds here</p>`
                }
                </div></div>`;
    }).join('');
  }

  /* ---------------- render: transfers ---------------- */

  private renderTransfers(): void {
    const list = this.TRANSFERS.filter((t) => this.trTab === 'All' || t.type === this.trTab);
    const el = this.byId('ib-transfers');
    if (!el) return;
    el.innerHTML =
      list
        .map(
          (t) => `<div class="ib-panel p-3" style="border-left:3px solid ${this.trTypeC[t.type]}">
            <div class="flex items-center gap-2 mb-2"><span class="rounded-lg flex items-center justify-center text-white font-bold flex-none" style="width:34px;height:34px;background:${t.av};font-size:11px">${t.pt.split(' ').map((n) => n[0]).join('')}</span><div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head truncate">${t.pt}</p><p class="text-[10px] ib-mut">${t.doc}</p></div><span class="ib-chip" style="background:color-mix(in srgb,${this.trTypeC[t.type]} 14%,transparent);color:${this.trTypeC[t.type]}">${t.type}</span></div>
            <div class="flex items-center gap-1.5 text-[11px] ib-head"><span class="ib-chip" style="background:var(--ib-hover)">${t.from}</span><i class="icon-arrow-right ib-mut"></i><span class="ib-chip" style="background:var(--ib-hover)">${t.to}</span></div>
            <div class="flex items-center justify-between mt-2 text-[11px]"><span class="ib-chip" style="background:color-mix(in srgb,${this.prioC[t.prio]} 13%,transparent);color:${this.prioC[t.prio]}">${t.prio}</span><span class="ib-mut"><i class="icon-clock"></i> ETA ${t.eta}</span></div>
        </div>`
        )
        .join('') || `<p class="text-sm ib-mut col-span-3 text-center py-4">No transfers in this category.</p>`;
  }

  /* ---------------- render: timeline ---------------- */

  private renderTimeline(): void {
    const b = this.BEDS.find((x) => x.id === this.activeId);
    const bedEl = this.byId('ib-tl-bed');
    if (bedEl) bedEl.textContent = b ? b.label : '—';
    const el = this.byId('ib-timeline');
    if (el) el.innerHTML = this.TLINE.map((t) => `<div class="ib-tl-item" style="--tc:${t[5]}"><div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-semibold ib-head flex items-center gap-1.5"><i class="${t[4]}" style="color:${t[5]}"></i> ${t[0]}</p><p class="text-[11px] ib-mut mt-0.5">${t[3]}</p><p class="text-[10px] ib-mut">${t[2]}</p></div><span class="text-[11px] ib-mut whitespace-nowrap">${t[1]}</span></div></div>`).join('');
  }

  /* ---------------- render: capacity ribbon ---------------- */

  private renderRibbon(): void {
    let list = this.ALERTS.filter((a) => this.capF === 'all' || a[0] === this.capF);
    if (!list.length) list = [['avail', '#16a34a', 'No items in this category', 'icon-check']];
    const one = list.map((a) => `<span class="ib-alert" style="background:color-mix(in srgb,${a[1]} 13%,transparent);color:${a[1]};border-color:color-mix(in srgb,${a[1]} 35%,transparent)"><i class="${a[3]}"></i> ${a[2]}</span>`).join('');
    const el = this.byId('ib-ribbon');
    if (el) el.innerHTML = one + one;
  }

  /* ---------------- menu / modals ---------------- */

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.byId('ib-menuhost');
    if (!host) return;
    host.innerHTML = `<div class="ib-menu" id="ib-openmenu">${this.ACTIONS.map((a) => `<button data-action="${a[2]}" data-bid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`;
    const m = this.byId('ib-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('ib-menuhost');
    if (host) host.innerHTML = '';
  }

  private fld(l: string, el: string): string {
    return `<div><label class="text-[11px] font-semibold ib-mut">${l}</label>${el}</div>`;
  }
  private inp(ph?: string): string {
    return `<input class="ib-in mt-1" placeholder="${ph || ''}">`;
  }
  private selE(o: string[]): string {
    return `<select class="ib-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
  }
  private drop(t: string): string {
    return `<div class="ib-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ib-hover)]"><i class="icon-cloud-upload text-3xl ib-mut"></i><p class="text-sm font-semibold mt-1 ib-head">${t}</p></div>`;
  }
  private chk(items: string[]): string {
    return `<div class="space-y-1.5">${items.map((x) => `<label class="flex items-center gap-2 text-sm ib-head"><input type="checkbox" class="accent-[var(--ib-c)]" checked> ${x}</label>`).join('')}</div>`;
  }

  private bedOpts(): string[] {
    return this.BEDS.map((b) => b.label + ' · ' + this.STLABEL[b.status]);
  }

  private modals(): Record<string, { t: string; ic: string; body: string; cta: string }> {
    const bedOpts = this.bedOpts();
    return {
      allocate: { t: 'Allocate Bed', ic: 'icon-bed', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Patient / MRN', this.inp('Search patient...'))}${this.fld('Bed', this.selE(bedOpts))}${this.fld('Bed Type', this.selE(this.BEDTYPES))}${this.fld('Admission Type', this.selE(['General', 'Emergency', 'Transfer']))}${this.fld('Doctor', this.selE(this.DOCS))}${this.fld('Nurse', this.selE(this.NURSES))}</div>`, cta: 'Allocate Bed' },
      reserve: { t: 'Reserve Bed', ic: 'icon-bookmark', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Reserve For', this.inp('Patient name'))}${this.fld('Expected Arrival', this.selE(['Within 1h', '1–3h', '3–6h', 'Today']))}${this.fld('Reason', this.selE(['Scheduled Admission', 'Post-Op', 'Transfer In', 'Emergency Hold']))}</div>`, cta: 'Reserve Bed' },
      release: { t: 'Release Bed', ic: 'icon-bed', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Reason', this.selE(['Discharge', 'Transfer Out', 'Deceased', 'Bed Swap']))}${this.fld('Next Status', this.selE(['Cleaning', 'Available', 'Maintenance']))}${this.fld('Housekeeping', this.selE(this.HK))}</div>`, cta: 'Release Bed' },
      transfer: { t: 'Transfer Patient', ic: 'icon-arrow-left-right', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Patient', this.inp('Search...'))}${this.fld('From Bed', this.selE(bedOpts))}${this.fld('To Bed', this.selE(bedOpts))}${this.fld('Priority', this.selE(['Critical', 'High', 'Medium', 'Low']))}${this.fld('Reason', this.selE(['Escalation', 'Step-down', 'Isolation', 'Specialty']))}${this.fld('ETA', this.selE(['Immediate', '15 min', '30 min', '1h']))}</div>`, cta: 'Confirm Transfer' },
      emergency: {
        t: 'Emergency Bed Allocation',
        ic: 'icon-alert-triangle',
        body: `<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#ef4444 12%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#ef4444 35%,transparent)"><i class="icon-alert-triangle"></i> System will auto-select the nearest available critical-care bed</div><div class="grid sm:grid-cols-2 gap-3">${this.fld('Patient / Unknown', this.inp('Name or "Unknown"'))}${this.fld('Presenting', this.selE(['Cardiac Arrest', 'Trauma', 'Respiratory Failure', 'Sepsis']))}${this.fld('Preferred Zone', this.selE(['Auto', 'ICU-A', 'ICU-B', 'CCU']))}${this.fld('Ventilator', this.selE(['Required', 'Not required']))}</div>`,
        cta: 'Allocate Emergency Bed',
      },
      doctor: { t: 'Assign Doctor', ic: 'icon-stethoscope', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Doctor', this.selE(this.DOCS))}${this.fld('Role', this.selE(['Intensivist', 'Consultant', 'Resident']))}${this.fld('Shift', this.selE(['Day', 'Night']))}</div>`, cta: 'Assign Doctor' },
      nurse: { t: 'Assign Nurse', ic: 'icon-user-check', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Nurse', this.selE(this.NURSES))}${this.fld('Shift', this.selE(['Day', 'Night']))}${this.fld('Ratio', this.selE(['1:1', '1:2']))}</div>`, cta: 'Assign Nurse' },
      equipment: { t: 'Assign Equipment', ic: 'icon-cpu', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Equipment', this.selE(['Ventilator', 'ECG Monitor', 'Infusion Pump', 'Defibrillator', 'Oxygen', 'Syringe Pump', 'Portable Monitor']))}${this.fld('Equipment ID', this.inp('e.g. VENT-04'))}${this.fld('Duration', this.selE(['Continuous', 'Procedure only', 'Standby']))}</div>`, cta: 'Assign Equipment' },
      cleaning: { t: 'Cleaning Checklist', ic: 'icon-spray-can', body: `<div class="grid sm:grid-cols-2 gap-3 mb-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Assign Staff', this.selE(this.HK))}</div><p class="text-[11px] font-semibold ib-mut uppercase mb-2">Turnover checklist</p>${this.chk(['Linen change', 'Surface disinfection', 'Equipment wipe-down', 'Waste disposal', 'Floor mopping', 'Final inspection'])}`, cta: 'Start Cleaning' },
      maintenance: { t: 'Maintenance Request', ic: 'icon-wrench', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Bed', this.selE(bedOpts))}${this.fld('Issue', this.selE(['Bed frame', 'Electrical', 'Monitor', 'Oxygen port', 'Call system', 'Other']))}${this.fld('Priority', this.selE(['Low', 'Medium', 'High', 'Urgent']))}${this.fld('Assign To', this.selE(['Bio-medical', 'Facilities', 'Electrical']))}</div><div class="mt-3">${this.fld('Description', `<textarea class="ib-in mt-1" rows="2" placeholder="Describe issue..."></textarea>`)}</div>`, cta: 'Submit Request' },
      import: { t: 'Import Beds', ic: 'icon-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Bed Master'].map((f) => `<span class="ib-chip" style="background:color-mix(in srgb,var(--ib-c) 14%,transparent);color:var(--ib-c)">${f}</span>`).join('')}</div>${this.drop('Drop CSV / Excel / Bed Master file')}<button class="text-xs font-semibold text-[var(--ib-c)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#22c55e 12%,transparent);color:#16a34a;border:1px solid color-mix(in srgb,#22c55e 30%,transparent)"><i class="icon-circle-check"></i> Validation passed · 29 beds · 0 errors</div>`, cta: 'Import Beds' },
      export: { t: 'Export Bed Report', ic: 'icon-download', body: `<p class="text-xs ib-mut mb-2">Choose format & scope</p><div class="grid grid-cols-2 gap-2">${['CSV', 'Excel', 'PDF', 'Print', 'Occupancy Report', 'Capacity Report', 'Cleaning Report', 'Equipment Report'].map((f) => `<button data-expfmt="${f}" class="text-xs font-semibold border rounded-lg px-3 py-2 hover:bg-[var(--ib-hover)] ib-head" style="border-color:var(--ib-border)">${f}</button>`).join('')}</div>`, cta: 'Export' },
      history: { t: 'Bed History', ic: 'icon-history', body: `<div class="ib-tl">${this.TLINE.slice(0, 6).map((t) => `<div class="ib-tl-item" style="--tc:${t[5]}"><p class="text-sm font-semibold ib-head"><i class="${t[4]}" style="color:${t[5]}"></i> ${t[0]}</p><p class="text-[11px] ib-mut">${t[3]} · ${t[1]}</p></div>`).join('')}</div>`, cta: 'Close' },
    };
  }

  private statusFromAction(a: string): string | undefined {
    return ({ allocate: 'occupied', reserve: 'reserved', release: 'available', cleaning: 'cleaning', maintenance: 'maintenance' } as Record<string, string>)[a];
  }

  private openModal(key: string): void {
    const m = this.modals()[key];
    if (!m) return;
    const host = this.byId('ib-modalhost');
    if (!host) return;
    host.innerHTML = `<div class="ib-modal-wrap open"><div class="ib-modal-bg" data-close></div><div class="ib-modal"><div class="ib-modal-head"><span class="ib-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ib-head leading-tight">${m.t}</h3><p class="text-[11px] ib-mut">Review the details and confirm.</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ib-hover)] flex items-center justify-center ib-mut"><i class="icon-x"></i></button></div><div class="ib-modal-body">${m.body}</div><div class="ib-modal-foot"><button data-close class="ib-btn ib-btn-ghost">Cancel</button><button data-modalok="${key}" class="ib-btn ib-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div></div></div>`;
    this.document.body.style.overflow = 'hidden';
  }

  private openDelete(msg: string, onOk: () => void): void {
    const host = this.byId('ib-modalhost');
    if (!host) return;
    host.innerHTML = `<div class="ib-modal-wrap open"><div class="ib-modal-bg" data-close></div><div class="ib-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#ef4444 15%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ib-head">Confirm</h3><p class="text-xs ib-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border ib-head hover:bg-[var(--ib-hover)]" style="border-color:var(--ib-border)">Cancel</button><button id="ib-delok" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-400">Delete</button></div></div></div></div>`;
    this.document.body.style.overflow = 'hidden';
    const ok = this.byId('ib-delok');
    if (ok) ok.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('ib-modalhost');
    if (host) host.innerHTML = '';
    this.document.body.style.overflow = '';
  }

  private updateBulk(): void {
    const cnt = this.byId('ib-selcount');
    if (cnt) cnt.textContent = String(this.sel.size);
    this.qsa<HTMLElement>('.ib-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private refreshOps(): void {
    this.renderHero();
    this.renderFloor();
    this.renderMatrix();
    this.renderWorkspace();
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('dragstart', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) {
        this.dragId = +(t.dataset['task'] || 0);
        t.classList.add('drag');
      }
    });
    this.document.addEventListener('dragend', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) t.classList.remove('drag');
      this.qsa<HTMLElement>('.ib-kcol').forEach((c) => c.classList.remove('over'));
    });
    this.document.addEventListener('dragover', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c) {
        e.preventDefault();
        this.qsa<HTMLElement>('.ib-kcol').forEach((x) => x.classList.toggle('over', x === c));
      }
    });
    this.document.addEventListener('drop', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c && this.dragId != null) {
        e.preventDefault();
        const t = this.CTASKS.find((x) => x.id === this.dragId);
        if (t) {
          t.col = c.dataset['kcol'] || t.col;
          this.renderKanban();
          this.toast(t.bed + ' → ' + t.col, 'icon-spray-can');
        }
        this.dragId = null;
      }
    });

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-zone]')) {
        this.zoneFilter = (target.closest('[data-zone]') as HTMLElement).dataset['zone'] || 'ALL';
        this.renderZoneTabs();
        this.renderFloor();
        return;
      }
      if (target.closest('[data-cap]')) {
        const b = target.closest('[data-cap]') as HTMLElement;
        this.capF = b.dataset['cap'] || 'all';
        this.qsa<HTMLElement>('#ib-capfilter button').forEach((x) => x.classList.toggle('on', x === b));
        this.renderRibbon();
        return;
      }
      if (target.closest('[data-trtab]')) {
        const b = target.closest('[data-trtab]') as HTMLElement;
        this.trTab = b.dataset['trtab'] || 'All';
        this.qsa<HTMLElement>('#ib-transtabs button').forEach((x) => x.classList.toggle('on', x === b));
        this.renderTransfers();
        return;
      }
      const t = target.closest('[data-bed],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-dismiss-alerts],[data-bulk],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.ib-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['bed'] !== undefined) {
        this.activeId = +t.dataset['bed'];
        this.renderFloor();
        this.renderWorkspace();
        this.byId('ib-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        const r = t.getBoundingClientRect();
        this.openMenu(+t.dataset['menu'], r.left - 190, r.bottom + 4);
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'],
          id = +(t.dataset['bid'] || 0);
        this.closeMenu();
        this.activeId = id;
        if (a === 'view') {
          this.renderFloor();
          this.renderWorkspace();
          this.byId('ib-workspace')?.scrollIntoView({ behavior: 'smooth' });
        } else if (['allocate', 'reserve', 'release', 'cleaning', 'maintenance'].includes(a || '')) {
          const b = this.BEDS.find((x) => x.id === id);
          if (b) {
            b.status = this.statusFromAction(a || '') || b.status;
            if (a === 'allocate' && !b.name) {
              b.name = this.NAMES[id % this.NAMES.length];
              b.mrn = 'MRN-' + (30500 + id);
              b.age = this.rnd(20, 80);
              b.gender = id % 2 ? 'Male' : 'Female';
              b.blood = this.BLOOD[id % this.BLOOD.length];
              b.diag = this.DIAG[id % this.DIAG.length];
              b.los = 1;
              b.hr = this.rnd(60, 120);
              b.spo2 = this.rnd(90, 99);
              b.crit = false;
              b.vent = false;
              b.disc = 'Jul ' + this.rnd(22, 28);
            }
          }
          this.refreshOps();
          if (b) this.toast('Bed ' + this.STLABEL[b.status].toLowerCase(), 'icon-bed');
        } else if (this.modals()[a || '']) {
          this.openModal(a || '');
        } else if (a === 'delete') {
          this.openDelete('Remove this bed from the floor plan?', () => {
            this.BEDS = this.BEDS.filter((x) => x.id !== id);
            this.sel.delete(id);
            if (this.activeId === id) this.activeId = this.BEDS[0]?.id;
            this.refreshOps();
            this.toast('Bed removed', 'icon-trash-2');
          });
        } else if (this.SIMPLE[a || '']) {
          this.toast(this.SIMPLE[a || '']);
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal'] || '');
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        const k = t.dataset['modalok'] || '';
        if (k === 'history') {
          this.closeModal();
          return;
        }
        const st = this.statusFromAction(k);
        if (st) {
          const b = this.BEDS.find((x) => x.id === this.activeId);
          if (b) {
            b.status = st;
            this.refreshOps();
          }
        }
        const m = this.modals()[k];
        this.toast((m?.cta || '') + ' — done', 'icon-check');
        this.closeModal();
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast('Exported: ' + t.dataset['expfmt'], 'icon-download');
        this.closeModal();
        return;
      }
      if (t.dataset['close'] !== undefined) {
        this.closeModal();
        return;
      }
      if (t.dataset['dismissAlerts'] !== undefined) {
        const rw = this.byId('ib-ribbonwrap');
        if (rw) rw.style.display = 'none';
        this.toast('Capacity feed dismissed', 'icon-bell-off');
        return;
      }
      if (t.dataset['bulk'] !== undefined) {
        const bk = t.dataset['bulk'];
        if (bk === 'delete') {
          this.openDelete(`Delete ${this.sel.size} selected bed(s)?`, () => {
            this.BEDS = this.BEDS.filter((b) => !this.sel.has(b.id));
            this.sel.clear();
            this.refreshOps();
            this.updateBulk();
            this.toast('Beds removed', 'icon-trash-2');
          });
        } else {
          const st = this.statusFromAction(bk || '');
          if (st) {
            this.BEDS.forEach((b) => {
              if (this.sel.has(b.id)) b.status = st;
            });
            this.refreshOps();
          }
          this.toast(
            (
              ({ allocate: 'Allocated', reserve: 'Reserved', release: 'Released', cleaning: 'Marked cleaning', maintenance: 'Marked maintenance', staff: 'Staff assigned', export: 'Exported', print: 'Printing' } as Record<string, string>)[bk || '']
            ) +
              ' · ' +
              this.sel.size +
              ' beds'
          );
          if (!['staff', 'export', 'print'].includes(bk || '')) {
            this.sel.clear();
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
        target.checked ? this.sel.add(id) : this.sel.delete(id);
        this.updateBulk();
        return;
      }
      if (target.id === 'ib-statusfilter') {
        this.statusFilter = target.value;
        this.renderFloor();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'ib-bedsearch') {
        this.bedQ = target.value;
        this.renderFloor();
      }
    });
  }

  private animateRings(): void {
    this.qsa<HTMLElement>('.ib-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  private clock(): void {
    const el = this.byId('ib-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }
}
