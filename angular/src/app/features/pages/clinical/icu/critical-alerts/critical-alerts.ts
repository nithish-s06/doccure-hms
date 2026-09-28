import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Alert {
  id: number;
  code: string;
  sev: string;
  type: string;
  name: string;
  mrn: string;
  dept: string;
  ward: string;
  bed: string;
  doc: string;
  nurse: string;
  state: string;
  pinned: boolean;
  triggered: string;
  sla: number;
  av: string;
  col: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "CRITICAL-ALERTS
 * (critical-alerts.html)". The overview widgets, severity-grouped Alert
 * Wall, workflow Kanban and activity feed all ship as static markup for
 * the same frozen ALERTS snapshot the source writes into the page, so
 * they are reproduced here as seed data and rebuilt by the same render
 * functions whenever an action mutates them (pin, quick Ack/Escalate/
 * Resolve, Kanban drag, search/department filter, bulk actions). Hero
 * counts, ring animation and the live clock/SLA countdown are wired as
 * in the source. The source's alert detail drawer and its menu/modal
 * system (#ca-drawer / #ca-menuhost / #ca-modalhost) have no
 * corresponding host markup in this page, so opening an alert or its
 * row-action menu surfaces its intent via a toast instead of a panel/form.
 */
@Component({
  imports: [],
  selector: 'app-critical-alerts',
  styleUrl: './critical-alerts.css',
  templateUrl: './critical-alerts.html',
})
export class CriticalAlerts implements AfterViewInit {
  private readonly SEVS: [string, string, string][] = [['crit', 'Critical', '#dc2626'], ['high', 'High', '#e06c1f'], ['med', 'Medium', '#b7791f'], ['info', 'Information', '#1d4ed8'], ['res', 'Resolved', '#15803d']];
  private readonly SEVC: Record<string, string> = { crit: '#dc2626', high: '#e06c1f', med: '#b7791f', info: '#1d4ed8', res: '#15803d' };
  private readonly SEVLABEL: Record<string, string> = { crit: 'Critical', high: 'High', med: 'Medium', info: 'Information', res: 'Resolved' };
  private readonly KCOLS: [string, string][] = [['New', '#dc2626'], ['Acknowledged', '#e06c1f'], ['In Progress', '#1d4ed8'], ['Escalated', '#b7791f'], ['Resolved', '#15803d']];
  private readonly ACTS: [string, string, string, string][] = [
    ['Alert Triggered', 'Cardiac arrest · ICU-A-01', 'icon-siren', '#dc2626'],
    ['Code Blue Activated', 'NICU-02 · team dispatched', 'icon-alert-octagon', '#1d4ed8'],
    ['Doctor Assigned', 'Dr. Mehta → ALT-7203', 'icon-stethoscope', '#0e7490'],
    ['Nurse Responded', 'N. Das · 41s', 'icon-user-check', '#15803d'],
    ['Patient Stabilized', 'ICU-A-01 · ROSC', 'icon-heart', '#15803d'],
    ['Alert Escalated', 'ALT-7208 → Consultant', 'icon-trending-up', '#e06c1f'],
    ['Alert Resolved', 'ALT-7191 closed', 'icon-circle-check', '#15803d'],
    ['Incident Closed', 'INC-3320 documented', 'icon-file-check', '#64748b'],
  ];
  private readonly MODAL_TITLES: Record<string, string> = {
    create: 'Create Alert', codeblue: 'Trigger Code Blue', broadcast: 'Emergency Broadcast', escalate: 'Escalate Alert', resolve: 'Resolve Alert',
    doctor: 'Assign Doctor', nurse: 'Assign Nurse', note: 'Clinical Notes', incident: 'Incident Details', settings: 'Alert Settings', import: 'Import', export: 'Export',
  };
  private readonly SIMPLE: Record<string, string> = { patient: 'Loading patient...', notify: 'Team notified', progress: 'Marked in progress', print: 'Printing incident...', pdf: 'PDF downloaded', archive: 'Alert archived' };

  private ALERTS: Alert[] = [
    { id: 0, code: 'ALT-7200', sev: 'res', type: 'Cardiac Arrest', name: 'Rahul Sharma', mrn: 'MRN-50900', dept: 'ICU', ward: 'ICU-A', bed: 'ICU-10', doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', state: 'Resolved', pinned: false, triggered: '12m ago', sla: 849, av: '#475569', col: 'Resolved' },
    { id: 1, code: 'ALT-7201', sev: 'info', type: 'Oxygen Desaturation', name: 'Anita Reddy', mrn: 'MRN-50901', dept: 'Emergency', ward: 'Emergency', bed: 'EME-05', doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', state: 'In Progress', pinned: false, triggered: '42m ago', sla: 610, av: '#0f766e', col: 'In Progress' },
    { id: 2, code: 'ALT-7202', sev: 'res', type: 'Ventilator Failure', name: 'Vikram Nair', mrn: 'MRN-50902', dept: 'CCU', ward: 'CCU', bed: 'CCU-08', doc: 'Dr. R. Nair', nurse: 'N. Sharma', state: 'Resolved', pinned: false, triggered: '27m ago', sla: 693, av: '#1e40af', col: 'Resolved' },
    { id: 3, code: 'ALT-7203', sev: 'res', type: 'Sepsis Alert', name: 'Priya Patel', mrn: 'MRN-50903', dept: 'NICU', ward: 'NICU', bed: 'NIC-08', doc: 'Dr. L. Khan', nurse: 'N. Das', state: 'Resolved', pinned: false, triggered: '2m ago', sla: 794, av: '#4338ca', col: 'Resolved' },
    { id: 4, code: 'ALT-7204', sev: 'high', type: 'Fall Detected', name: 'Suresh Gupta', mrn: 'MRN-50904', dept: 'PICU', ward: 'PICU', bed: 'PIC-11', doc: 'Dr. P. Rao', nurse: 'N. Reddy', state: 'Escalated', pinned: false, triggered: '2m ago', sla: 307, av: '#0e7490', col: 'Escalated' },
    { id: 5, code: 'ALT-7205', sev: 'crit', type: 'Hemorrhage', name: 'Meera Singh', mrn: 'MRN-50905', dept: 'General Ward', ward: 'General Ward', bed: 'GEN-01', doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', state: 'Escalated', pinned: false, triggered: '24m ago', sla: 69, av: '#334155', col: 'Escalated' },
    { id: 6, code: 'ALT-7206', sev: 'res', type: 'Anaphylaxis', name: 'Arjun Menon', mrn: 'MRN-50906', dept: 'Operating Theatre', ward: 'Operating Theatre', bed: 'OPE-12', doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', state: 'Resolved', pinned: false, triggered: '27m ago', sla: 545, av: '#3f6212', col: 'Resolved' },
    { id: 7, code: 'ALT-7207', sev: 'info', type: 'Arrhythmia', name: 'Kavya Das', mrn: 'MRN-50907', dept: 'Recovery Room', ward: 'Recovery Room', bed: 'REC-10', doc: 'Dr. R. Nair', nurse: 'N. Sharma', state: 'Acknowledged', pinned: false, triggered: '2m ago', sla: 608, av: '#7c2d12', col: 'Acknowledged' },
    { id: 8, code: 'ALT-7208', sev: 'med', type: 'BP Critical', name: 'Deepak Joshi', mrn: 'MRN-50908', dept: 'ICU', ward: 'ICU-A', bed: 'ICU-09', doc: 'Dr. L. Khan', nurse: 'N. Das', state: 'Acknowledged', pinned: false, triggered: '4m ago', sla: 764, av: '#475569', col: 'Acknowledged' },
    { id: 9, code: 'ALT-7209', sev: 'info', type: 'Stroke Alert', name: 'Neha Verma', mrn: 'MRN-50909', dept: 'Emergency', ward: 'Emergency', bed: 'EME-01', doc: 'Dr. P. Rao', nurse: 'N. Reddy', state: 'New', pinned: false, triggered: '20m ago', sla: 609, av: '#0f766e', col: 'New' },
    { id: 10, code: 'ALT-7210', sev: 'med', type: 'Seizure', name: 'Rohan Iyer', mrn: 'MRN-50910', dept: 'CCU', ward: 'CCU', bed: 'CCU-08', doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', state: 'New', pinned: false, triggered: '43m ago', sla: 520, av: '#1e40af', col: 'New' },
    { id: 11, code: 'ALT-7211', sev: 'info', type: 'Medication Reaction', name: 'Sana Khan', mrn: 'MRN-50911', dept: 'NICU', ward: 'NICU', bed: 'NIC-10', doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', state: 'In Progress', pinned: false, triggered: '4m ago', sla: 404, av: '#4338ca', col: 'In Progress' },
    { id: 12, code: 'ALT-7212', sev: 'crit', type: 'Cardiac Arrest', name: 'Manoj Rao', mrn: 'MRN-50912', dept: 'PICU', ward: 'PICU', bed: 'PIC-01', doc: 'Dr. R. Nair', nurse: 'N. Sharma', state: 'Escalated', pinned: false, triggered: '57m ago', sla: 36, av: '#0e7490', col: 'Escalated' },
    { id: 13, code: 'ALT-7213', sev: 'med', type: 'Oxygen Desaturation', name: 'Divya Menon', mrn: 'MRN-50913', dept: 'General Ward', ward: 'General Ward', bed: 'GEN-07', doc: 'Dr. L. Khan', nurse: 'N. Das', state: 'New', pinned: false, triggered: '25m ago', sla: 344, av: '#334155', col: 'New' },
    { id: 14, code: 'ALT-7214', sev: 'high', type: 'Ventilator Failure', name: 'Rahul Sharma', mrn: 'MRN-50914', dept: 'Operating Theatre', ward: 'Operating Theatre', bed: 'OPE-02', doc: 'Dr. P. Rao', nurse: 'N. Reddy', state: 'In Progress', pinned: false, triggered: '58m ago', sla: 285, av: '#3f6212', col: 'In Progress' },
    { id: 15, code: 'ALT-7215', sev: 'high', type: 'Sepsis Alert', name: 'Anita Reddy', mrn: 'MRN-50915', dept: 'Recovery Room', ward: 'Recovery Room', bed: 'REC-07', doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', state: 'In Progress', pinned: false, triggered: '51m ago', sla: 181, av: '#7c2d12', col: 'In Progress' },
    { id: 16, code: 'ALT-7216', sev: 'info', type: 'Fall Detected', name: 'Vikram Nair', mrn: 'MRN-50916', dept: 'ICU', ward: 'ICU-A', bed: 'ICU-10', doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', state: 'Acknowledged', pinned: false, triggered: '7m ago', sla: 482, av: '#475569', col: 'Acknowledged' },
    { id: 17, code: 'ALT-7217', sev: 'med', type: 'Hemorrhage', name: 'Priya Patel', mrn: 'MRN-50917', dept: 'Emergency', ward: 'Emergency', bed: 'EME-04', doc: 'Dr. R. Nair', nurse: 'N. Sharma', state: 'Escalated', pinned: false, triggered: '29m ago', sla: 378, av: '#0f766e', col: 'Escalated' },
    { id: 18, code: 'ALT-7218', sev: 'crit', type: 'Anaphylaxis', name: 'Suresh Gupta', mrn: 'MRN-50918', dept: 'CCU', ward: 'CCU', bed: 'CCU-06', doc: 'Dr. L. Khan', nurse: 'N. Das', state: 'In Progress', pinned: false, triggered: '45m ago', sla: 179, av: '#1e40af', col: 'In Progress' },
    { id: 19, code: 'ALT-7219', sev: 'med', type: 'Arrhythmia', name: 'Meera Singh', mrn: 'MRN-50919', dept: 'NICU', ward: 'NICU', bed: 'NIC-11', doc: 'Dr. P. Rao', nurse: 'N. Reddy', state: 'In Progress', pinned: false, triggered: '55m ago', sla: 523, av: '#4338ca', col: 'In Progress' },
    { id: 20, code: 'ALT-7220', sev: 'high', type: 'BP Critical', name: 'Arjun Menon', mrn: 'MRN-50920', dept: 'PICU', ward: 'PICU', bed: 'PIC-07', doc: 'Dr. A. Mehta', nurse: 'N. Fernandes', state: 'New', pinned: false, triggered: '22m ago', sla: 354, av: '#0e7490', col: 'New' },
    { id: 21, code: 'ALT-7221', sev: 'high', type: 'Stroke Alert', name: 'Kavya Das', mrn: 'MRN-50921', dept: 'General Ward', ward: 'General Ward', bed: 'GEN-11', doc: 'Dr. S. Kapoor', nurse: 'N. Pillai', state: 'Acknowledged', pinned: false, triggered: '52m ago', sla: 396, av: '#334155', col: 'Acknowledged' },
  ];

  private sel = new Set<number>();
  private wallQ = '';
  private wallDept = '';
  private dragId: number | null = null;
  private clockTimer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();

    setTimeout(() => {
      this.byId('ca-skeleton')?.classList.add('hidden');
      this.byId('ca-content')?.classList.remove('hidden');
      this.updateCounts();
      this.animateRings();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
      this.countdownTimer = setInterval(() => this.tickCountdown(), 2000);
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(msg: string): void {
    this.toastService.show(msg, 'info');
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  private active(): Alert[] {
    return this.ALERTS.filter((a) => a.sev !== 'res');
  }

  private fmtCd(s: number): string {
    if (s <= 0) return 'SLA breached';
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return (m > 0 ? m + 'm ' : '') + String(ss).padStart(2, '0') + 's';
  }

  /* ---------------- Hero counts ---------------- */

  private updateCounts(): void {
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('ca-h-active', this.active().length);
    set('ca-h-high', this.ALERTS.filter((a) => a.sev === 'high').length);
    set('ca-h-crit', this.ALERTS.filter((a) => a.sev === 'crit').length);
    set('ca-h-esc', this.ALERTS.filter((a) => a.state === 'Escalated').length);
    set('ca-h-code', this.ALERTS.filter((a) => a.type === 'Cardiac Arrest' && a.sev === 'crit').length);
  }

  /* ---------------- Overview widgets ---------------- */

  private trendSvg(data: number[], color: string): string {
    const w = 54, h = 18;
    const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * h}`).join(' ');
    return `<svg class="ca-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }

  private renderOverview(): void {
    const el = this.byId('ca-overview');
    if (!el) return;
    const c = (s: string) => this.ALERTS.filter((a) => a.sev === s).length;
    const activeLen = this.active().length;
    const W: [string, number, number, string, string, number[]][] = [
      ['Active Alerts', activeLen, 72, '#0d9488', 'icon-bell-ring', [14, 16, 15, 18, 17, activeLen]],
      ['Critical', c('crit'), 30, '#dc2626', 'icon-alert-triangle', [7, 6, 8, 7, 6, c('crit')]],
      ['Warning', c('high') + c('med'), 58, '#e06c1f', 'icon-alert-octagon', [10, 11, 9, 12, 11, c('high') + c('med')]],
      ['Information', c('info'), 40, '#1d4ed8', 'icon-info', [5, 6, 5, 7, 6, c('info')]],
      ['Resolved', c('res'), 88, '#15803d', 'icon-circle-check', [30, 34, 36, 39, 40, 42]],
      ['Avg Response', 3.2, 64, '#7c3aed', 'icon-timer', [4.1, 3.8, 3.6, 3.4, 3.3, 3.2]],
    ];
    el.innerHTML = W.map(
      (w, i) => `
      <div class="ca-card p-3.5">
        <div class="flex items-start justify-between">
          <span class="ca-iconbadge w-9 h-9" style="color:${w[3]}"><i class="${w[4]}"></i></span>
          <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="ca-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ca-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${w[3]}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${w[2]}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${w[3]}">${w[2]}%</span></div>
        </div>
        <p class="text-2xl font-bold ca-head mt-2 tabular-nums">${w[1]}${i === 5 ? '<span class="text-sm ca-mut"> min</span>' : ''}</p>
        <div class="flex items-center justify-between mt-1"><p class="text-[11px] ca-mut">${w[0]}</p>${this.trendSvg(w[5], w[3])}</div>
      </div>`
    ).join('');
  }

  private animateRings(): void {
    this.document.querySelectorAll<HTMLElement>('.ca-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  /* ---------------- Alert Wall ---------------- */

  private alertCard(a: Alert): string {
    const sc = this.SEVC[a.sev];
    return `<div class="ca-alert sev-${a.sev} ${a.pinned ? 'pinned' : ''}" data-alert="${a.id}">
      <div class="flex items-center gap-2 mb-1.5">
        <label onclick="event.stopPropagation()" class="flex items-center"><input type="checkbox" data-sel="${a.id}" ${this.sel.has(a.id) ? 'checked' : ''} class="accent-[var(--ca-c)]"></label>
        <span class="text-[11px] font-bold ca-mut">${a.code}</span>
        <span class="sevpill ca-chip ml-auto">${a.sev === 'crit' ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}${this.SEVLABEL[a.sev]}</span>
        <button data-pin="${a.id}" onclick="event.stopPropagation()" class="w-5 h-5 rounded hover:bg-[var(--ca-hover)] flex items-center justify-center"><i class="icon-pin text-[12px] ${a.pinned ? '' : 'ca-mut'}" style="${a.pinned ? 'color:' + sc : ''}"></i></button>
      </div>
      <div class="flex items-center gap-2">
        <span class="ca-avatar flex-none" style="width:30px;height:30px;background:${a.av};font-size:11px">${this.initials(a.name)}</span>
        <div class="min-w-0 flex-1"><p class="text-sm font-semibold ca-head truncate leading-tight">${a.name}</p><p class="text-[10px] ca-mut">${a.mrn} · ${a.bed}</p></div>
        <button data-menu="${a.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ca-hover)] flex items-center justify-center ca-mut"><i class="icon-more-vertical text-sm"></i></button>
      </div>
      <p class="text-xs font-medium ca-head mt-1.5">${a.type}</p>
      <p class="text-[10px] ca-mut">${a.dept} · ${a.ward}</p>
      <div class="flex items-center justify-between mt-2 text-[10px]">
        <span class="ca-mut"><i class="icon-stethoscope text-[10px]"></i> ${a.doc.split('. ')[1] || a.doc}</span>
        ${a.sev === 'res' ? '<span class="ca-npill">Closed</span>' : `<span class="font-bold ca-cd" data-cd="${a.id}" style="color:${a.sla < 60 ? '#dc2626' : sc}"><i class="icon-clock text-[10px]"></i> ${this.fmtCd(a.sla)}</span>`}
      </div>
      <div class="flex flex-wrap gap-1 mt-2">
        ${a.sev !== 'res' ? `<button data-quick-ack="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-check text-[10px]"></i> Ack</button><button data-quick-esc="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-trending-up text-[10px]"></i> Escalate</button><button data-quick-res="${a.id}" onclick="event.stopPropagation()" class="ca-npill hover:bg-[var(--ca-hover)]"><i class="icon-circle-check text-[10px]"></i> Resolve</button>` : '<span class="ca-npill"><i class="icon-check text-[10px]"></i> Resolved</span>'}
      </div>
    </div>`;
  }

  private renderWall(): void {
    const el = this.byId('ca-wall');
    if (!el) return;
    let list = this.ALERTS;
    if (this.wallDept) list = list.filter((a) => a.dept === this.wallDept);
    if (this.wallQ) {
      const q = this.wallQ.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.mrn.toLowerCase().includes(q));
    }
    el.innerHTML = this.SEVS.map((s) => {
      const items = list.filter((a) => a.sev === s[0]).sort((x, y) => Number(y.pinned) - Number(x.pinned));
      return `<div class="ca-sevcol sev-${s[0]}">
        <div class="flex items-center justify-between mb-2 cursor-pointer" data-sevtoggle><span class="text-sm font-bold ca-head flex items-center gap-1.5"><span class="ca-dot" style="background:${s[2]}"></span> ${s[1]}</span><span class="flex items-center gap-1.5"><span class="ca-chip" style="background:color-mix(in srgb,${s[2]} 14%,transparent);color:${s[2]}">${items.length}</span><i class="icon-chevron-down text-xs ca-mut ca-caret transition-transform"></i></span></div>
        <div class="ca-sevbody space-y-2.5">${items.map((a) => this.alertCard(a)).join('') || '<p class="text-[11px] ca-mut text-center py-3 ca-panel rounded-lg">No alerts</p>'}</div>
      </div>`;
    }).join('');
  }

  private tickCountdown(): void {
    this.ALERTS.forEach((a) => {
      if (a.sev !== 'res' && a.sla > 0) a.sla = Math.max(0, a.sla - 2);
    });
    this.document.querySelectorAll<HTMLElement>('.ca-cd').forEach((el) => {
      const a = this.ALERTS.find((x) => x.id === +(el.dataset['cd'] || -1));
      if (a) {
        el.innerHTML = `<i class="icon-clock text-[10px]"></i> ${this.fmtCd(a.sla)}`;
        el.style.color = a.sla < 60 ? '#dc2626' : this.SEVC[a.sev];
      }
    });
  }

  /* ---------------- Workflow Kanban ---------------- */

  private renderKanban(): void {
    const el = this.byId('ca-kanban');
    if (!el) return;
    el.innerHTML = this.KCOLS.map((c) => {
      const items = this.ALERTS.filter((a) => a.col === c[0]).slice(0, 6);
      return `<div class="ca-kcol p-2.5" data-kcol="${c[0]}">
        <div class="flex items-center justify-between mb-2 px-1"><span class="text-sm font-bold ca-head flex items-center gap-1.5"><span class="ca-dot" style="background:${c[1]}"></span> ${c[0]}</span><span class="ca-npill">${this.ALERTS.filter((a) => a.col === c[0]).length}</span></div>
        <div class="space-y-2 min-h-[40px]" data-kbody="${c[0]}">
        ${items
          .map(
            (a) => `<div class="ca-ktask" draggable="true" data-task="${a.id}" style="border-left:3px solid ${this.SEVC[a.sev]}">
          <div class="flex items-center justify-between"><span class="text-[11px] font-bold ca-mut">${a.code}</span><span class="ca-chip" style="background:color-mix(in srgb,${this.SEVC[a.sev]} 12%,transparent);color:${this.SEVC[a.sev]}">${this.SEVLABEL[a.sev]}</span></div>
          <p class="text-xs font-semibold ca-head mt-1 leading-tight">${a.type}</p>
          <p class="text-[10px] ca-mut mt-0.5">${a.name} · ${a.bed}</p>
          <div class="flex items-center justify-between text-[10px] ca-mut mt-1.5"><span><i class="icon-user-check"></i> ${a.nurse.split(' ')[1] || a.nurse}</span>${a.sev !== 'res' ? `<span style="color:${a.sla < 60 ? '#dc2626' : this.SEVC[a.sev]}"><i class="icon-clock"></i> ${this.fmtCd(a.sla)}</span>` : '<i class="icon-grip-vertical"></i>'}</div>
        </div>`
          )
          .join('') || '<p class="text-[11px] ca-mut text-center py-2">Drop here</p>'}
        </div></div>`;
    }).join('');
  }

  /* ---------------- Activity ---------------- */

  private renderActivity(): void {
    const el = this.byId('ca-activity');
    if (!el) return;
    el.innerHTML = this.ACTS.map(
      (a) => `<div class="ca-panel p-3 flex items-start gap-2.5"><span class="ca-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span><div class="min-w-0"><p class="text-sm font-semibold ca-head">${a[0]}</p><p class="text-[11px] ca-mut truncate">${a[1]}</p><p class="text-[10px] ca-mut mt-0.5">${this.rnd(1, 58)}m ago</p></div></div>`
    ).join('');
  }

  /* ---------------- Helpers ---------------- */

  private updateBulk(): void {
    const count = this.byId('ca-selcount');
    if (count) count.textContent = String(this.sel.size);
    this.document.querySelectorAll('.ca-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private resolveAlert(id: number): void {
    const a = this.ALERTS.find((x) => x.id === id);
    if (a) {
      a.sev = 'res';
      a.state = 'Resolved';
      a.col = 'Resolved';
    }
    this.refreshAll();
    this.toast('Alert resolved');
  }

  private ackAlert(id: number): void {
    const a = this.ALERTS.find((x) => x.id === id);
    if (a && a.state === 'New') {
      a.state = 'Acknowledged';
      a.col = 'Acknowledged';
    }
    this.refreshAll();
    this.toast('Alert acknowledged');
  }

  private refreshAll(): void {
    this.renderOverview();
    this.renderWall();
    this.renderKanban();
    this.updateCounts();
    this.animateRings();
  }

  private clock(): void {
    const el = this.byId('ca-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      if (target.closest('[data-sevtoggle]')) {
        target.closest('.ca-sevcol')?.classList.toggle('collapsed');
        return;
      }
      if (target.closest('[data-collapse-all]')) {
        const cols = this.document.querySelectorAll('.ca-sevcol');
        const any = this.document.querySelectorAll('.ca-sevcol.collapsed').length === 0;
        cols.forEach((c) => c.classList.toggle('collapsed', any));
        return;
      }
      if (target.closest('[data-pin]')) {
        const a = this.ALERTS.find((x) => x.id === +((target.closest('[data-pin]') as HTMLElement).dataset['pin'] || -1));
        if (a) {
          a.pinned = !a.pinned;
          this.renderWall();
        }
        return;
      }
      if (target.closest('[data-quick-ack]')) {
        this.ackAlert(+((target.closest('[data-quick-ack]') as HTMLElement).dataset['quickAck'] || -1));
        return;
      }
      if (target.closest('[data-quick-esc]')) {
        const a = this.ALERTS.find((x) => x.id === +((target.closest('[data-quick-esc]') as HTMLElement).dataset['quickEsc'] || -1));
        if (a) {
          a.state = 'Escalated';
          a.col = 'Escalated';
        }
        this.refreshAll();
        this.toast('Alert escalated');
        return;
      }
      if (target.closest('[data-quick-res]')) {
        this.resolveAlert(+((target.closest('[data-quick-res]') as HTMLElement).dataset['quickRes'] || -1));
        return;
      }
      if (target.closest('[data-dept-card]')) {
        const d = (target.closest('[data-dept-card]') as HTMLElement).dataset['deptCard'] || '';
        this.wallDept = d;
        const sel = this.byId('ca-walldept') as HTMLSelectElement | null;
        if (sel) sel.value = d;
        this.renderWall();
        this.byId('ca-wall')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.toast(`Filtered: ${d}`);
        return;
      }

      const t = target.closest('[data-alert],[data-menu],[data-action],[data-modal],[data-bulk],[data-expfmt]') as HTMLElement | null;
      if (!t) return;

      if (t.dataset['alert'] !== undefined) {
        const a = this.ALERTS.find((x) => x.id === +t.dataset['alert']!);
        this.toast(`${a?.code} — ${a?.type} for ${a?.name} opened.`);
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        this.toast('Alert actions menu opened.');
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'] as string;
        const id = +(t.dataset['aid'] || -1);
        if (a === 'view') {
          const al = this.ALERTS.find((x) => x.id === id);
          this.toast(`${al?.code} opened.`);
        } else if (a === 'ack') this.ackAlert(id);
        else if (a === 'resolve') this.resolveAlert(id);
        else if (a === 'escalate') {
          const al = this.ALERTS.find((x) => x.id === id);
          if (al) {
            al.state = 'Escalated';
            al.col = 'Escalated';
          }
          this.refreshAll();
          this.toast('Alert escalated');
        } else if (a === 'delete') {
          this.ALERTS = this.ALERTS.filter((x) => x.id !== id);
          this.sel.delete(id);
          this.refreshAll();
          this.toast('Alert deleted');
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
      if (t.dataset['expfmt'] !== undefined) {
        this.toast(`Exported: ${t.dataset['expfmt']}`);
        return;
      }
      if (t.dataset['bulk'] !== undefined) {
        const bk = t.dataset['bulk'];
        if (bk === 'delete') {
          this.ALERTS = this.ALERTS.filter((a) => !this.sel.has(a.id));
          this.sel.clear();
          this.refreshAll();
          this.updateBulk();
          this.toast('Alerts deleted');
        } else if (bk === 'resolve') {
          this.ALERTS.forEach((a) => {
            if (this.sel.has(a.id)) {
              a.sev = 'res';
              a.state = 'Resolved';
              a.col = 'Resolved';
            }
          });
          this.sel.clear();
          this.refreshAll();
          this.updateBulk();
          this.toast('Alerts resolved');
        } else {
          const labels: Record<string, string> = { ack: 'Acknowledged', escalate: 'Escalated', staff: 'Staff assigned', export: 'Exported', print: 'Printing', archive: 'Archived' };
          this.toast(`${labels[bk!] || 'Updated'} · ${this.sel.size} alerts`);
          if (bk === 'archive') {
            this.sel.clear();
            this.refreshAll();
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
        return;
      }
      if (target.id === 'ca-walldept') {
        this.wallDept = target.value;
        this.renderWall();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'ca-wallsearch') {
        this.wallQ = target.value;
        this.renderWall();
      }
    });

    // Workflow Kanban drag-and-drop
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
      this.document.querySelectorAll('.ca-kcol').forEach((c) => c.classList.remove('over'));
    });
    this.document.addEventListener('dragover', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c) {
        e.preventDefault();
        this.document.querySelectorAll('.ca-kcol').forEach((x) => x.classList.toggle('over', x === c));
      }
    });
    this.document.addEventListener('drop', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c && this.dragId != null) {
        e.preventDefault();
        const a = this.ALERTS.find((x) => x.id === this.dragId);
        if (a) {
          a.col = c.dataset['kcol'] || a.col;
          a.state = a.col;
          if (a.col === 'Resolved') a.sev = 'res';
          this.renderKanban();
          this.renderWall();
          this.updateCounts();
          this.toast(`${a.code} → ${a.col}`);
        }
        this.dragId = null;
      }
    });
  }
}
