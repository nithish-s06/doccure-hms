import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface QueuePatient {
  tok: string; pt: string; ptc: string; ptphoto: string; dept: string; doc: string; docc: string;
  wait: number; appt: string; since: string; vtype: string; prio: string; status: string;
  age: number; ins: string; alert: string;
}
interface Kpi { l: string; v: string; ic: string; c: string; p: number; ch: string; spark: number[]; }

/**
 * Ported from tailwind/src/assets/js/script.js — "// waiting-room" IIFE.
 * Faithful port of search/filter/sort/view (board/grid/list), the Kanban
 * drag-and-drop board, the live-monitor timers/ETA, call-next, the row
 * action menu, the drawer, and the walk-in/assign/priority/transfer/
 * import/export/print/delete modals (legacy .wr-modal/.wr-drawer
 * class-toggle overlays, matching the source).
 */
@Component({
  imports: [],
  selector: 'app-waiting-room',
  styleUrl: './waiting-room.css',
  templateUrl: './waiting-room.html',
})
export class WaitingRoom implements AfterViewInit {
  private readonly STC: Record<string, string> = { Waiting: '#f59e0b', Called: '#0ea5e9', 'In Consultation': '#8b5cf6', Completed: '#10b981' };
  private readonly STIC: Record<string, string> = { Waiting: 'ti-hourglass', Called: 'ti-bell-ringing', 'In Consultation': 'ti-stethoscope', Completed: 'ti-circle-check' };
  private readonly PRIO: Record<string, string> = { Emergency: '#ef4444', High: '#f59e0b', Normal: '#10b981' };
  private readonly VTYPE: Record<string, string> = { 'Walk-in': '#0ea5e9', Scheduled: '#8b5cf6', Emergency: '#ef4444' };
  private readonly DOCPHOTO: Record<string, string> = {
    'Dr. Sarah Roberts': 'assets/img/doctor/doctor-01.jpg', 'Dr. Vikram Nair': 'assets/img/doctor/doctor-02.jpg', 'Dr. John Mathew': 'assets/img/doctor/doctor-08.jpg',
    'Dr. Meera Iyer': 'assets/img/doctor/doctor-04.jpg', 'Dr. Priya Sharma': 'assets/img/doctor/doctor-06.jpg', 'Dr. Deepak Nair': 'assets/img/doctor/doctor-09.jpg',
    'Dr. Rajesh Menon': 'assets/img/doctor/doctor-05.jpg', 'Dr. Karan Malhotra': 'assets/img/doctor/doctor-12.jpg', 'Dr. Fatima Sheikh': 'assets/img/doctor/doctor-11.jpg', 'Dr. Arjun Menon': 'assets/img/doctor/doctor-13.jpg',
  };

  private Q: QueuePatient[] = [
    { tok: 'A-104', pt: 'Ravi Kumar', ptc: '#0ea5e9', ptphoto: 'assets/img/avatar/avatar-01.jpg', dept: 'Cardiology', doc: 'Dr. Sarah Roberts', docc: '#ef4444', wait: 2, appt: '10:00 AM', since: '09:58', vtype: 'Scheduled', prio: 'High', status: 'In Consultation', age: 52, ins: 'Star Health', alert: 'Penicillin allergy' },
    { tok: 'A-105', pt: 'Anita Desai', ptc: '#8b5cf6', ptphoto: 'assets/img/avatar/avatar-03.jpg', dept: 'Neurology', doc: 'Dr. Vikram Nair', docc: '#8b5cf6', wait: 18, appt: '10:15 AM', since: '09:50', vtype: 'Scheduled', prio: 'Normal', status: 'Called', age: 34, ins: 'HDFC Ergo', alert: '' },
    { tok: 'E-012', pt: 'John Mathew', ptc: '#f43f5e', ptphoto: 'assets/img/avatar/avatar-07.jpg', dept: 'Emergency', doc: 'Dr. John Mathew', docc: '#f43f5e', wait: 1, appt: 'Walk-in', since: '10:12', vtype: 'Emergency', prio: 'Emergency', status: 'Waiting', age: 41, ins: 'Uninsured', alert: 'Chest pain — triage red' },
    { tok: 'A-106', pt: 'Mohammed Ali', ptc: '#10b981', ptphoto: 'assets/img/avatar/avatar-02.jpg', dept: 'Pediatrics', doc: 'Dr. Meera Iyer', docc: '#f59e0b', wait: 24, appt: 'Walk-in', since: '09:44', vtype: 'Walk-in', prio: 'Normal', status: 'Waiting', age: 6, ins: 'ICICI Lombard', alert: '' },
    { tok: 'A-107', pt: 'Priya Sharma', ptc: '#d946ef', ptphoto: 'assets/img/avatar/avatar-04.jpg', dept: 'Gynecology', doc: 'Dr. Priya Sharma', docc: '#d946ef', wait: 12, appt: '10:45 AM', since: '09:56', vtype: 'Scheduled', prio: 'Normal', status: 'Waiting', age: 29, ins: 'Star Health', alert: '' },
    { tok: 'A-108', pt: 'Deepak Nair', ptc: '#6366f1', ptphoto: 'assets/img/avatar/avatar-06.jpg', dept: 'Radiology', doc: 'Dr. Deepak Nair', docc: '#6366f1', wait: 32, appt: 'Walk-in', since: '09:36', vtype: 'Walk-in', prio: 'High', status: 'Waiting', age: 45, ins: 'Max Bupa', alert: 'Diabetic' },
    { tok: 'A-109', pt: 'Sunita Rao', ptc: '#14b8a6', ptphoto: 'assets/img/avatar/avatar-05.jpg', dept: 'Oncology', doc: 'Dr. Rajesh Menon', docc: '#ec4899', wait: 8, appt: '11:00 AM', since: '10:05', vtype: 'Scheduled', prio: 'High', status: 'Waiting', age: 58, ins: 'LIC Health', alert: 'On chemotherapy' },
    { tok: 'A-110', pt: 'Karan Malhotra', ptc: '#10b981', ptphoto: 'assets/img/avatar/avatar-11.jpg', dept: 'Dermatology', doc: 'Dr. Karan Malhotra', docc: '#10b981', wait: 15, appt: 'Walk-in', since: '09:53', vtype: 'Walk-in', prio: 'Normal', status: 'Waiting', age: 48, ins: 'HDFC Ergo', alert: '' },
    { tok: 'A-101', pt: 'Fatima Sheikh', ptc: '#a855f7', ptphoto: 'assets/img/avatar/avatar-09.jpg', dept: 'Psychiatry', doc: 'Dr. Fatima Sheikh', docc: '#a855f7', wait: 0, appt: '09:30 AM', since: '09:28', vtype: 'Scheduled', prio: 'Normal', status: 'Completed', age: 26, ins: 'Star Health', alert: '' },
    { tok: 'A-102', pt: 'Arjun Menon', ptc: '#0891b2', ptphoto: 'assets/img/avatar/avatar-12.jpg', dept: 'Nephrology', doc: 'Dr. Arjun Menon', docc: '#0891b2', wait: 0, appt: '09:40 AM', since: '09:38', vtype: 'Scheduled', prio: 'High', status: 'Completed', age: 60, ins: 'Max Bupa', alert: 'Dialysis patient' },
    { tok: 'A-103', pt: 'Meera Iyer', ptc: '#f59e0b', ptphoto: 'assets/img/avatar/avatar-10.jpg', dept: 'Radiology', doc: 'Dr. Deepak Nair', docc: '#6366f1', wait: 0, appt: '09:50 AM', since: '09:47', vtype: 'Scheduled', prio: 'Normal', status: 'Completed', age: 45, ins: 'ICICI Lombard', alert: '' },
    { tok: 'E-011', pt: 'Neha Kapoor', ptc: '#ec4899', ptphoto: 'assets/img/avatar/avatar-08.jpg', dept: 'Emergency', doc: 'Dr. John Mathew', docc: '#f43f5e', wait: 0, appt: 'Walk-in', since: '08:20', vtype: 'Emergency', prio: 'Emergency', status: 'Completed', age: 33, ins: 'Uninsured', alert: 'Recovered' },
  ];

  private KPIS: Kpi[] = [
    { l: 'Patients Waiting', v: '6', ic: 'ti-hourglass', c: '#f59e0b', p: 60, ch: 'live', spark: [4, 5, 6, 5, 7, 6, 6] },
    { l: 'In Consultation', v: '1', ic: 'ti-stethoscope', c: '#8b5cf6', p: 20, ch: 'active', spark: [2, 1, 2, 1, 1, 1, 1] },
    { l: 'Avg Wait Time', v: '14m', ic: 'ti-clock-hour-4', c: '#0ea5e9', p: 47, ch: '-3m', spark: [18, 17, 16, 15, 15, 14, 14] },
    { l: 'Walk-in Patients', v: '4', ic: 'ti-walk', c: '#14b8a6', p: 44, ch: '+2', spark: [2, 2, 3, 3, 4, 4, 4] },
    { l: 'Scheduled', v: '5', ic: 'ti-calendar', c: '#6366f1', p: 55, ch: 'today', spark: [3, 4, 4, 5, 5, 5, 5] },
    { l: 'Emergency Queue', v: '1', ic: 'ti-urgent', c: '#ef4444', p: 18, ch: 'triage', spark: [0, 1, 1, 2, 1, 1, 1] },
  ];

  private readonly COLS: [string, string, number][] = [
    ['token', 'Token', 1], ['patient', 'Patient', 1], ['dept', 'Department', 1], ['doctor', 'Doctor', 1],
    ['since', 'Waiting Since', 1], ['wait', 'Wait', 1], ['vtype', 'Type', 1], ['prio', 'Priority', 1], ['status', 'Status', 1],
  ];
  private readonly STAGES = ['Waiting', 'Called', 'In Consultation', 'Completed'];
  private readonly DEPTS = [...new Set(this.Q.map((p) => p.dept))];
  private readonly DOCTORS = [...new Set(this.Q.map((p) => p.doc))];

  private state = {
    q: '', view: 'board', filters: { dept: '', doctor: '', status: '', vtype: '', prio: '', date: '', sort: 'wait' } as Record<string, string>,
    sel: {} as Record<string, boolean>, cols: {} as Record<string, boolean>,
  };
  private menuTok: string | null = null;
  private etaSec = 150;
  private doneCount = 48;
  private dragId: string | null = null;

  private readonly ACTIONS: { a?: string; n?: string; ic?: string; ok?: number; danger?: number; sep?: number }[] = [
    { a: 'view', n: 'View Patient', ic: 'ti-eye' }, { a: 'edit', n: 'Edit Details', ic: 'ti-edit' }, { a: 'call', n: 'Call Patient', ic: 'ti-bell-ringing', ok: 1 },
    { a: 'arrived', n: 'Mark Arrived', ic: 'ti-user-check' }, { a: 'start', n: 'Start Consultation', ic: 'ti-player-play' },
    { sep: 1 }, { a: 'assign', n: 'Assign Doctor', ic: 'ti-stethoscope' }, { a: 'queue', n: 'Change Queue', ic: 'ti-arrows-exchange' }, { a: 'prio', n: 'Change Priority', ic: 'ti-flag' }, { a: 'notify', n: 'Send Notification', ic: 'ti-bell' },
    { sep: 1 }, { a: 'slip', n: 'Print Queue Slip', ic: 'ti-printer' }, { a: 'pdf', n: 'Download PDF', ic: 'ti-file-download' }, { a: 'sms', n: 'Send SMS', ic: 'ti-message-2' }, { a: 'email', n: 'Send Email', ic: 'ti-mail' },
    { sep: 1 }, { a: 'remove', n: 'Remove from Queue', ic: 'ti-user-minus' }, { a: 'archive', n: 'Archive', ic: 'ti-archive' }, { a: 'delete', n: 'Delete', ic: 'ti-trash', danger: 1 },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.COLS.forEach((c) => (this.state.cols[c[0]] = true));
  }

  ngAfterViewInit(): void {
    this.wireEvents();
    setInterval(() => this.tick(), 1000);
    setTimeout(() => {
      this.byId('wr-skeleton')?.classList.add('hidden');
      this.byId('wr-content')?.classList.remove('hidden');
      this.render(true);
      this.updateMonitor();
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }

  private byId(id: string): HTMLElement | null { return this.document.getElementById(id); }
  private qs(sel: string, root: ParentNode = this.document): HTMLElement | null { return root.querySelector(sel); }
  private qsa(sel: string, root: ParentNode = this.document): HTMLElement[] { return Array.from(root.querySelectorAll(sel)); }
  private esc(s: unknown): string {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }
  private mix(c: string, p = 15): string { return `color-mix(in srgb,${c} ${p}%,transparent)`; }
  private toast(message: string): void { this.toastService.show(message, 'success'); }
  private tokColor(t: string): string { return t.charAt(0) === 'E' ? '#ef4444' : '#0ea5e9'; }
  private docPhoto(name: string): string { return this.DOCPHOTO[name] || 'assets/img/doctor/doctor-02.jpg'; }
  private detailUrl(p: QueuePatient): string {
    return 'waiting-room-detail.html?' + new URLSearchParams({ token: p.tok, patient: p.pt, dept: p.dept, status: p.status }).toString();
  }

  /* ---------------- Sparkline / KPIs / widgets ---------------- */

  private spark(data: number[], c: string): string {
    const w = 90, h = 26, max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
    const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 4) - 2).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/><polyline fill="${this.mix(c, 14)}" stroke="none" points="0,${h} ${pts.join(' ')} ${w},${h}"/></svg>`;
  }

  private renderKPIs(): void {
    this.KPIS[0].v = String(this.Q.filter((p) => p.status === 'Waiting').length);
    this.KPIS[1].v = String(this.Q.filter((p) => p.status === 'In Consultation').length);
    this.KPIS[5].v = String(this.Q.filter((p) => p.prio === 'Emergency' && p.status !== 'Completed').length);
    const wrap = this.byId('wr-kpis');
    if (wrap) {
      wrap.innerHTML = this.KPIS.map(
        (k) =>
          `<div class="wr-kpi" style="--kc:${k.c}"><div class="flex items-start justify-between mb-2"><div class="wr-kpi-ic" style="background:${this.mix(k.c)};color:${k.c}"><i class="ti ${k.ic} text-lg"></i></div><svg viewBox="0 0 36 36" class="wr-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="${k.c}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${k.p}"/></svg></div><div class="wr-kpi-v">${this.esc(k.v)}</div><div class="flex items-center justify-between mt-1"><span class="text-xs wr-muted font-semibold">${this.esc(k.l)}</span><span class="wr-chip" style="background:${this.mix(k.c)};color:${k.c}">${this.esc(k.ch)}</span></div><div class="mt-2 opacity-90">${this.spark(k.spark, k.c)}</div></div>`
      ).join('');
    }
  }

  private renderWidgets(): void {
    const sc: Record<string, number> = {};
    this.Q.forEach((p) => (sc[p.status] = (sc[p.status] || 0) + 1));
    const entries = this.STAGES.filter((k) => sc[k]).map((k) => ({ k, n: sc[k], c: this.STC[k] }));
    const tot = this.Q.length;
    let off = 0, seg = '';
    entries.forEach((x) => { const f = (x.n / tot) * 100; seg += `<circle cx="18" cy="18" r="15.9155" fill="none" stroke="${x.c}" stroke-width="4.4" stroke-dasharray="${f} ${100 - f}" stroke-dashoffset="${-off}"/>`; off += f; });
    const statusEl = this.byId('wr-w-status'); if (statusEl) statusEl.innerHTML = seg + '<circle cx="18" cy="18" r="10" fill="var(--color-white)"/>';
    const legend = this.byId('wr-w-status-legend');
    if (legend) legend.innerHTML = entries.map((x) => `<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full flex-none" style="background:${x.c}"></span><span class="font-semibold text-[var(--color-gray-900)] flex-1">${this.esc(x.k)}</span><span class="wr-muted font-bold">${x.n}</span></div>`).join('');

    const t = [8, 12, 18, 14, 22, 16, 10], maxT = Math.max(...t), tl = ['8a', '9a', '10a', '11a', '12p', '1p', '2p'];
    const timeEl = this.byId('wr-w-time');
    if (timeEl) timeEl.innerHTML = t.map((v, i) => `<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end"><span class="text-[10px] font-bold wr-muted">${v}</span><div class="w-full rounded-t-md" style="height:${Math.round((v / maxT) * 100)}%;background:linear-gradient(180deg,#0ea5e9,#6366f1)"></div><span class="text-[10px] wr-muted font-semibold">${tl[i]}</span></div>`).join('');

    const perf = this.byId('wr-w-perf');
    if (perf) perf.innerHTML = '<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="wr-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#14b8a6" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:87"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">87%</div><div class="text-xs wr-muted font-semibold">On-time rate</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="wr-dotstat" style="background:#10b981"></span><span class="wr-muted">Within SLA</span><b class="text-[var(--color-gray-900)] ml-auto">42</b></div><div class="flex items-center gap-2"><span class="wr-dotstat" style="background:#ef4444"></span><span class="wr-muted">Delayed</span><b class="text-[var(--color-gray-900)] ml-auto">6</b></div></div></div></div>';

    const a = [6, 10, 14, 9, 12, 7, 4], maxA = Math.max(...a), al = ['8a', '9a', '10a', '11a', '12p', '1p', '2p'];
    const arrEl = this.byId('wr-w-arrival');
    if (arrEl) arrEl.innerHTML = a.map((v, i) => `<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end"><span class="text-[10px] font-bold wr-muted">${v}</span><div class="w-full rounded-t-md" style="height:${Math.round((v / maxA) * 100)}%;background:linear-gradient(180deg,#14b8a6,#0d9488)"></div><span class="text-[10px] wr-muted font-semibold">${al[i]}</span></div>`).join('');
  }

  /* ---------------- Filter ---------------- */

  private filtered(): QueuePatient[] {
    const f = this.state.filters, q = this.state.q.toLowerCase();
    const arr = this.Q.filter((p) => {
      if (q && `${p.tok} ${p.pt} ${p.doc} ${p.dept}`.toLowerCase().indexOf(q) < 0) return false;
      if (f['dept'] && p.dept !== f['dept']) return false;
      if (f['doctor'] && p.doc !== f['doctor']) return false;
      if (f['status'] && p.status !== f['status']) return false;
      if (f['vtype'] && p.vtype !== f['vtype']) return false;
      if (f['prio'] && p.prio !== f['prio']) return false;
      return true;
    });
    const po: Record<string, number> = { Emergency: 0, High: 1, Normal: 2 };
    arr.sort((a, b) => {
      if (f['sort'] === 'token') return a.tok.localeCompare(b.tok);
      if (f['sort'] === 'prio') return po[a.prio] - po[b.prio];
      if (f['sort'] === 'name') return a.pt.localeCompare(b.pt);
      return b.wait - a.wait;
    });
    return arr;
  }

  /* ---------------- Board (Kanban) ---------------- */

  private kcardHTML(p: QueuePatient): string {
    return (
      `<div class="wr-kcard" draggable="true" data-id="${p.tok}" style="--kc:${this.PRIO[p.prio]}" data-open="${p.tok}">` +
      `<div class="flex items-center justify-between mb-2"><span class="wr-token" style="background:${this.mix(this.tokColor(p.tok))};color:${this.tokColor(p.tok)}">${this.esc(p.tok)}</span><div class="flex items-center gap-1"><span class="wr-tag" style="background:${this.mix(this.PRIO[p.prio])};color:${this.PRIO[p.prio]}"><i class="ti ti-flag-3" style="font-size:.56rem"></i>${this.esc(p.prio)}</span><button class="wr-btn wr-btn-soft !p-1" data-menu="${p.tok}" onclick="event.stopPropagation()"><i class="ti ti-dots-vertical"></i></button></div></div>` +
      `<div class="flex items-center gap-2"><img class="wr-av wr-av-sm" src="${p.ptphoto}" alt="${this.esc(p.pt)}"><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(p.pt)}</div><div class="text-[10px] wr-muted truncate">${this.esc(p.dept)}</div></div></div>` +
      `<div class="text-[11px] wr-muted mt-2 truncate"><i class="ti ti-stethoscope"></i> ${this.esc(p.doc.replace('Dr. ', 'Dr '))}</div>` +
      `<div class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-color)]"><span class="text-[11px] font-semibold ${p.wait > 20 ? 'text-rose-500' : 'wr-muted'}"><i class="ti ti-clock"></i> ${p.status === 'Completed' ? 'Done' : p.wait + 'm'}</span><span class="text-[10px] wr-muted">${this.esc(p.appt)}</span></div>` +
      '</div>'
    );
  }

  private renderBoard(arr: QueuePatient[]): void {
    const wrap = this.byId('wr-kanban');
    if (wrap) {
      wrap.innerHTML = this.STAGES.map((st) => {
        const items = arr.filter((p) => p.status === st);
        const c = this.STC[st];
        return `<div class="wr-kcol" data-col="${st}"><div class="wr-khd"><i class="ti ${this.STIC[st]}" style="color:${c}"></i><span class="text-[var(--color-gray-900)]">${this.esc(st)}</span><span class="wr-tag ml-auto" style="background:${this.mix(c)};color:${c}">${items.length}</span></div><div class="wr-kbody" data-col="${st}">${items.map((p) => this.kcardHTML(p)).join('') || '<div class="text-[11px] wr-muted text-center py-4">Empty</div>'}</div></div>`;
      }).join('');
    }
    this.wireDnD();
  }

  private wireDnD(): void {
    this.qsa('.wr-kcard').forEach((card) => {
      card.addEventListener('dragstart', () => { this.dragId = card.getAttribute('data-id'); card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); this.qsa('.wr-kcol').forEach((c) => c.classList.remove('drop')); });
    });
    this.qsa('.wr-kcol').forEach((col) => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drop'); });
      col.addEventListener('dragleave', () => col.classList.remove('drop'));
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drop');
        const st = col.getAttribute('data-col');
        const p = this.Q.find((x) => x.tok === this.dragId);
        if (p && st && p.status !== st) {
          p.status = st;
          this.render();
          this.toast(`${p.tok} moved to ${st}`);
        }
      });
    });
  }

  /* ---------------- Grid / list ---------------- */

  private gridHTML(p: QueuePatient): string {
    const sc = this.STC[p.status];
    const vt = this.VTYPE[p.vtype] || '#94a3b8';
    return (
      `<div class="wr-surface p-4" style="border-left:3px solid ${this.PRIO[p.prio]}">` +
      `<div class="flex items-center justify-between mb-3"><span class="wr-token" style="background:${this.mix(this.tokColor(p.tok))};color:${this.tokColor(p.tok)}">${this.esc(p.tok)}</span><div class="flex items-center gap-1.5"><span class="wr-tag" style="background:${this.mix(sc)};color:${sc}"><span class="wr-dotstat" style="background:${sc}"></span>${this.esc(p.status)}</span><button class="wr-btn wr-btn-soft !p-1.5" data-menu="${p.tok}"><i class="ti ti-dots-vertical"></i></button></div></div>` +
      `<div class="flex items-center gap-2.5"><img class="wr-av" src="${p.ptphoto}" alt="${this.esc(p.pt)}"><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(p.pt)}</div><div class="text-xs wr-muted truncate">${this.esc(p.dept)} · ${this.esc(p.doc.replace('Dr. ', 'Dr '))}</div></div></div>` +
      `<div class="grid grid-cols-2 gap-2 mt-3 text-xs"><div class="flex items-center gap-1.5 wr-muted"><i class="ti ti-clock"></i> ${p.status === 'Completed' ? 'Done' : `Waited ${p.wait}m`}</div><div class="flex items-center gap-1.5 wr-muted"><i class="ti ti-calendar"></i> ${this.esc(p.appt)}</div><div class="flex items-center gap-1.5"><span class="wr-tag" style="background:${this.mix(vt)};color:${vt}">${this.esc(p.vtype)}</span></div><div class="flex items-center gap-1.5"><span class="wr-tag" style="background:${this.mix(this.PRIO[p.prio])};color:${this.PRIO[p.prio]}">${this.esc(p.prio)}</span></div></div>` +
      `<div class="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-color)]">` +
      (p.status === 'Waiting'
        ? `<button class="wr-btn wr-btn-teal flex-1 !py-1.5 text-xs" data-call="${p.tok}"><i class="ti ti-bell-ringing"></i> Call</button>`
        : p.status === 'Called'
        ? `<button class="wr-btn wr-btn-primary flex-1 !py-1.5 text-xs" data-start="${p.tok}"><i class="ti ti-player-play"></i> Start</button>`
        : `<a class="wr-btn wr-btn-soft flex-1 !py-1.5 text-xs" href="${this.detailUrl(p)}"><i class="ti ti-eye"></i> View</a>`) +
      `<button class="wr-btn wr-btn-soft !p-2" data-open="${p.tok}"><i class="ti ti-info-circle"></i></button></div>` +
      '</div>'
    );
  }

  private td(col: string, html: string): string { return `<td class="${this.state.cols[col] ? '' : 'wr-hidecol'}">${html}</td>`; }

  private renderList(arr: QueuePatient[]): void {
    const wrap = this.byId('wr-tbody');
    if (wrap) {
      wrap.innerHTML = arr
        .map((p) => {
          const sc = this.STC[p.status];
          const vt = this.VTYPE[p.vtype] || '#94a3b8';
          return (
            `<tr data-row="${p.tok}"><td><input type="checkbox" class="wr-cb wr-rowcb" data-id="${p.tok}"${this.state.sel[p.tok] ? ' checked' : ''}></td>` +
            this.td('token', `<a class="wr-token" href="${this.detailUrl(p)}" style="background:${this.mix(this.tokColor(p.tok))};color:${this.tokColor(p.tok)}">${this.esc(p.tok)}</a>`) +
            this.td('patient', `<div class="flex items-center gap-2.5"><img class="wr-av wr-av-sm" src="${p.ptphoto}" alt="${this.esc(p.pt)}"><span class="font-bold text-[var(--color-gray-900)]">${this.esc(p.pt)}</span></div>`) +
            this.td('dept', `<span class="wr-muted">${this.esc(p.dept)}</span>`) +
            this.td('doctor', `<span class="wr-muted">${this.esc(p.doc)}</span>`) +
            this.td('since', `<span class="wr-muted">${this.esc(p.since)}</span>`) +
            this.td('wait', `<span class="font-bold ${p.wait > 20 ? 'text-rose-500' : 'text-[var(--color-gray-900)]'}">${p.status === 'Completed' ? '—' : p.wait + 'm'}</span>`) +
            this.td('vtype', `<span class="wr-tag" style="background:${this.mix(vt)};color:${vt}">${this.esc(p.vtype)}</span>`) +
            this.td('prio', `<span class="wr-tag" style="background:${this.mix(this.PRIO[p.prio])};color:${this.PRIO[p.prio]}">${this.esc(p.prio)}</span>`) +
            this.td('status', `<span class="wr-tag" style="background:${this.mix(sc)};color:${sc}"><span class="wr-dotstat" style="background:${sc}"></span>${this.esc(p.status)}</span>`) +
            `<td><button class="wr-btn wr-btn-soft !p-1.5" data-menu="${p.tok}"><i class="ti ti-dots-vertical"></i></button></td></tr>`
          );
        })
        .join('');
    }
    this.qsa('#wr-tabletag th[data-col]').forEach((th) => th.classList.toggle('wr-hidecol', !this.state.cols[th.getAttribute('data-col') || '']));
    this.syncSelAll();
  }

  /* ---------------- Render dispatch ---------------- */

  private render(skipBoard = false): void {
    const arr = this.filtered();
    ['board', 'grid', 'list'].forEach((v) => this.byId(`wr-view-${v}`)?.classList.toggle('hidden', this.state.view !== v));
    this.byId('wr-empty')?.classList.toggle('hidden', arr.length > 0);
    if (this.state.view === 'board') { if (!skipBoard) this.renderBoard(arr); else this.wireDnD(); }
    else if (this.state.view === 'grid') { const g = this.byId('wr-grid'); if (g) g.innerHTML = arr.map((p) => this.gridHTML(p)).join(''); }
    else this.renderList(arr);
    const waiting = this.byId('wr-h-waiting'); if (waiting) waiting.textContent = String(this.Q.filter((p) => p.status === 'Waiting').length);
  }

  private refreshAll(): void {
    this.render();
    this.renderKPIs();
    this.renderWidgets();
    this.updateMonitor();
    this.animateRings();
  }

  private animateRings(): void {
    this.qsa('.wr-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }

  /* ---------------- Live monitor / timers ---------------- */

  private fmt(s: number): string {
    const m = Math.floor(s / 60), r = s % 60;
    return `${m < 10 ? '0' : ''}${m}:${r < 10 ? '0' : ''}${r}`;
  }

  private updateMonitor(): void {
    const cur = this.Q.find((p) => p.status === 'In Consultation') || this.Q.find((p) => p.status === 'Called');
    const waitingList = this.Q.filter((p) => p.status === 'Waiting');
    const next = this.Q.find((p) => p.status === 'Called') || waitingList[0];
    if (cur) {
      const c1 = this.byId('wr-mon-current'); if (c1) c1.textContent = cur.tok;
      const c2 = this.byId('wr-mon-currentname'); if (c2) c2.textContent = `${cur.pt} · ${cur.dept}`;
      const c3 = this.byId('wr-h-serving'); if (c3) c3.textContent = cur.tok;
    }
    if (next) {
      const n1 = this.byId('wr-mon-next'); if (n1) n1.textContent = next.tok;
      const n2 = this.byId('wr-mon-nextname'); if (n2) n2.textContent = `${next.pt} · ${next.dept}`;
    }
    const remaining = waitingList.length + this.Q.filter((p) => p.status === 'Called').length;
    const rem = this.byId('wr-mon-remaining'); if (rem) rem.textContent = String(remaining);
    const done = this.byId('wr-mon-done'); if (done) done.textContent = String(this.doneCount);
    const total = this.doneCount + remaining;
    const pct = Math.round((this.doneCount / (total || 1)) * 100);
    const prog = this.byId('wr-mon-progress'); if (prog) prog.style.width = `${pct}%`;
    const progTxt = this.byId('wr-mon-progresstxt'); if (progTxt) progTxt.textContent = `${pct}%`;
    const compl = this.byId('wr-h-completed'); if (compl) compl.textContent = String(this.doneCount);
  }

  private tick(): void {
    this.etaSec--;
    if (this.etaSec < 0) this.etaSec = 180 + Math.floor(60 * 0.5);
    const eta = this.byId('wr-mon-eta'); if (eta) eta.textContent = this.fmt(this.etaSec);
    if (this.etaSec % 20 === 0) {
      this.Q.forEach((p) => { if (p.status === 'Waiting') p.wait++; });
      if (this.state.view !== 'list') {
        if (this.state.view === 'board') this.renderBoard(this.filtered());
        else if (this.state.view === 'grid') { const g = this.byId('wr-grid'); if (g) g.innerHTML = this.filtered().map((p) => this.gridHTML(p)).join(''); }
      }
    }
  }

  /* ---------------- Call next ---------------- */

  private callNext(): void {
    const po: Record<string, number> = { Emergency: 0, High: 1, Normal: 2 };
    const next = this.Q.filter((p) => p.status === 'Waiting').sort((a, b) => (po[a.prio] !== po[b.prio] ? po[a.prio] - po[b.prio] : b.wait - a.wait))[0];
    if (!next) { this.toast('No patients waiting'); return; }
    const cur = this.Q.find((p) => p.status === 'In Consultation');
    if (cur) { cur.status = 'Completed'; cur.wait = 0; this.doneCount++; }
    const called = this.Q.find((p) => p.status === 'Called');
    if (called) called.status = 'In Consultation';
    next.status = 'Called';
    this.refreshAll();
    this.toast(`Now calling ${next.tok} — ${next.pt}`);
  }

  /* ---------------- Action menu ---------------- */

  private openMenu(id: string, x: number, y: number): void {
    this.menuTok = id;
    const m = this.byId('wr-menu');
    if (!m) return;
    m.innerHTML = this.ACTIONS.map((a) => (a.sep ? '<div class="wr-sep"></div>' : `<div class="wr-mi${a.danger ? ' danger' : a.ok ? ' ok' : ''}" data-act="${a.a}"><i class="ti ${a.ic}"></i>${this.esc(a.n)}</div>`)).join('');
    m.classList.add('open');
    const h = Math.min(m.scrollHeight, window.innerHeight * 0.7);
    m.style.left = Math.max(8, Math.min(x, window.innerWidth - 216)) + 'px';
    m.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
  }
  private closeMenu(): void { this.byId('wr-menu')?.classList.remove('open'); this.menuTok = null; }
  private doAction(act: string): void {
    const p = this.Q.find((x) => x.tok === this.menuTok);
    const name = p ? p.pt : 'patient';
    if (act === 'view') { this.closeMenu(); this.openDrawer(this.menuTok || ''); return; }
    if (act === 'edit') { this.closeMenu(); this.openModal('walkin', p); return; }
    if (act === 'assign') { this.closeMenu(); this.openModal('assign', p); return; }
    if (act === 'prio') { this.closeMenu(); this.openModal('prio', p); return; }
    if (act === 'queue') { this.closeMenu(); this.openModal('transfer', p); return; }
    if (act === 'delete' || act === 'remove') { this.closeMenu(); this.openModal('delete', p); return; }
    if (act === 'call' && p) { p.status = 'Called'; this.refreshAll(); this.toast(`${p.tok} called`); this.closeMenu(); return; }
    if (act === 'start' && p) { p.status = 'In Consultation'; this.refreshAll(); this.toast(`Consultation started — ${p.tok}`); this.closeMenu(); return; }
    if (act === 'arrived' && p) { this.toast(`${name} marked arrived`); this.closeMenu(); return; }
    const msgs: Record<string, string> = { notify: 'Notification sent', slip: 'Queue slip printed', pdf: 'PDF downloaded', sms: 'SMS sent', email: 'Email sent', archive: 'Patient archived' };
    this.toast(`${msgs[act] || 'Action'} — ${name}`);
    this.closeMenu();
  }

  /* ---------------- Body scroll lock / drawer ---------------- */

  private syncBodyLock(): void {
    this.document.body.style.overflow = this.qs('.wr-drawer.open') || this.qs('.wr-modal.open') ? 'hidden' : '';
  }

  private openDrawer(id: string): void {
    const p = this.Q.find((x) => x.tok === id);
    if (!p) return;
    const tl = [
      { n: 'Arrived / checked in', tm: p.since, done: 1 },
      { n: 'Added to queue', tm: p.since, done: 1 },
      { n: `Token issued ${p.tok}`, tm: p.since, done: 1 },
      { n: p.status === 'Waiting' ? 'Waiting in room' : 'Called to consultation', tm: p.status === 'Waiting' ? `Now (${p.wait}m)` : p.appt, done: p.status !== 'Waiting' ? 1 : 0 },
      { n: 'Consultation', tm: p.status === 'In Consultation' ? 'In progress' : p.status === 'Completed' ? 'Done' : 'Pending', done: p.status === 'In Consultation' || p.status === 'Completed' ? 1 : 0 },
    ];
    const body = this.byId('wr-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,${p.ptc},${this.mix(p.ptc, 55)})">` +
        `<div class="flex items-center justify-between"><button class="wr-btn wr-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="wr-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><span class="wr-dotstat" style="background:#fff"></span>${this.esc(p.status)}</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><img class="w-16 h-16 rounded-2xl object-cover border border-white/30" src="${p.ptphoto}" alt="${this.esc(p.pt)}"><div><h2 class="text-xl font-extrabold">${this.esc(p.pt)}</h2><p class="text-white/80 text-sm">${this.esc(p.age)} yrs · ${this.esc(p.dept)}</p><div class="mt-1 inline-flex items-center gap-1.5 bg-white/15 px-2 py-.5 rounded-lg text-xs font-bold"><i class="ti ti-ticket"></i> Token ${this.esc(p.tok)}</div></div></div>` +
        '</div>' +
        '<div class="p-5 space-y-5">' +
        (p.alert
          ? `<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:${this.mix('#ef4444', 8)};border:1px solid ${this.mix('#ef4444', 22)}"><i class="ti ti-alert-triangle text-rose-500 text-lg"></i><div><div class="text-xs wr-muted font-semibold">Medical Alert</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(p.alert)}</div></div></div>`
          : '') +
        `<div class="grid grid-cols-3 gap-2 text-center"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-lg font-extrabold ${p.wait > 20 ? 'text-rose-500' : 'text-[var(--color-gray-900)]'}">${p.status === 'Completed' ? '—' : p.wait + 'm'}</div><div class="text-[10px] wr-muted font-semibold">Waited</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(p.appt)}</div><div class="text-[10px] wr-muted font-semibold">Appointment</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(p.since)}</div><div class="text-[10px] wr-muted font-semibold">Since</div></div></div>` +
        `<div class="grid grid-cols-2 gap-2.5"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs wr-muted font-semibold mb-1">Assigned Doctor</div><div class="flex items-center gap-2"><img class="wr-av wr-av-sm" src="${this.docPhoto(p.doc)}" alt="${this.esc(p.doc)}"><span class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(p.doc.replace('Dr. ', 'Dr '))}</span></div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs wr-muted font-semibold mb-1">Insurance</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(p.ins)}</div><span class="wr-tag mt-1" style="background:${this.mix(p.ins === 'Uninsured' ? '#ef4444' : '#10b981')};color:${p.ins === 'Uninsured' ? '#ef4444' : '#059669'}">${p.ins === 'Uninsured' ? 'Not covered' : 'Verified'}</span></div></div>` +
        `<div class="flex items-center gap-2 flex-wrap"><span class="wr-tag" style="background:${this.mix(this.VTYPE[p.vtype] || '#94a3b8')};color:${this.VTYPE[p.vtype] || '#94a3b8'}">${this.esc(p.vtype)}</span><span class="wr-tag" style="background:${this.mix(this.PRIO[p.prio])};color:${this.PRIO[p.prio]}">${this.esc(p.prio)} priority</span></div>` +
        `<div><div class="text-xs wr-muted font-semibold mb-2">Waiting Timeline</div><div class="space-y-2.5">${tl
          .map((h, i) => `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:${this.mix(h.done ? '#10b981' : '#94a3b8')};color:${h.done ? '#10b981' : '#94a3b8'}"><i class="ti ${h.done ? 'ti-check' : 'ti-clock'} text-xs"></i></div>${i < tl.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(h.n)}</div><div class="text-[11px] wr-muted">${this.esc(h.tm)}</div></div></div>`)
          .join('')}</div></div>` +
        `<div><div class="text-xs wr-muted font-semibold mb-1.5">Previous Visits</div><div class="space-y-1.5"><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-history wr-muted"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">Last visit · ${this.esc(p.dept)}</span><span class="text-[11px] wr-muted">Jun 12</span></div></div></div>` +
        '<div><div class="text-xs wr-muted font-semibold mb-1.5">Notes</div><textarea class="wr-inp" rows="2" placeholder="Add a note...">Patient prefers morning slots.</textarea></div>' +
        `<div class="grid grid-cols-2 gap-2 pt-1">${p.status === 'Waiting' ? `<button class="wr-btn wr-btn-teal" data-call="${p.tok}"><i class="ti ti-bell-ringing"></i> Call</button>` : `<button class="wr-btn wr-btn-primary" data-start="${p.tok}"><i class="ti ti-player-play"></i> Start</button>`}<button class="wr-btn wr-btn-soft" data-modal="assign"><i class="ti ti-stethoscope"></i> Assign</button><button class="wr-btn wr-btn-soft" data-toast="Queue slip printed"><i class="ti ti-printer"></i> Slip</button><button class="wr-btn wr-btn-soft" data-toast="SMS sent"><i class="ti ti-message-2"></i> SMS</button></div>` +
        '</div>';
    }
    this.byId('wr-drawer')?.classList.add('open');
    this.syncBodyLock();
  }

  /* ---------------- Modals ---------------- */

  private fld(label: string, inner: string): string { return `<div><label class="wr-lbl">${label}</label>${inner}</div>`; }
  private selDoc(v?: string): string { return `<select class="wr-inp">${this.DOCTORS.map((d) => `<option${v === d ? ' selected' : ''}>${this.esc(d)}</option>`).join('')}</select>`; }

  private readonly MODALS: Record<string, { t: string; ic: string; danger?: number; cta: string; body: (p?: QueuePatient) => string }> = {
    walkin: {
      t: 'Walk-in Patient', ic: 'ti-user-plus', cta: 'Add to Queue',
      body: (p) =>
        `<div class="space-y-3">${this.fld('Patient Name', `<input class="wr-inp" placeholder="Full name" value="${p ? this.esc(p.pt) : ''}">`)}<div class="grid grid-cols-2 gap-3">${this.fld('Department', `<select class="wr-inp">${this.DEPTS.map((d) => `<option${p && p.dept === d ? ' selected' : ''}>${this.esc(d)}</option>`).join('')}</select>`)}${this.fld('Doctor', this.selDoc(p?.doc))}</div><div class="grid grid-cols-3 gap-3">${this.fld('Visit Type', '<select class="wr-inp"><option>Walk-in</option><option>Scheduled</option><option>Emergency</option></select>')}${this.fld('Priority', '<select class="wr-inp"><option>Normal</option><option>High</option><option>Emergency</option></select>')}${this.fld('Age', `<input class="wr-inp" type="number" value="${p ? p.age : ''}">`)}</div>${this.fld('Insurance', '<input class="wr-inp" placeholder="Insurance provider">')}</div>`,
    },
    assign: {
      t: 'Assign Doctor', ic: 'ti-stethoscope', cta: 'Assign Doctor',
      body: (p) => `<div class="space-y-3">${this.fld('Patient', `<input class="wr-inp" value="${p ? this.esc(p.tok + ' — ' + p.pt) : ''}" readonly>`)}${this.fld('Assign To', this.selDoc(p?.doc))}${this.fld('Note', '<input class="wr-inp" placeholder="Optional">')}</div>`,
    },
    prio: {
      t: 'Change Priority', ic: 'ti-flag', cta: 'Update Priority',
      body: (p) =>
        `<div class="space-y-3">${this.fld('Patient', `<input class="wr-inp" value="${p ? this.esc(p.pt) : ''}" readonly>`)}${this.fld('Priority Level', `<select class="wr-inp"><option${p && p.prio === 'Normal' ? ' selected' : ''}>Normal</option><option${p && p.prio === 'High' ? ' selected' : ''}>High</option><option${p && p.prio === 'Emergency' ? ' selected' : ''}>Emergency</option></select>`)}${this.fld('Reason', '<input class="wr-inp" placeholder="Reason for change">')}</div>`,
    },
    transfer: {
      t: 'Transfer Queue', ic: 'ti-arrows-exchange', cta: 'Transfer',
      body: (p) => `<div class="space-y-3">${this.fld('Patient', `<input class="wr-inp" value="${p ? this.esc(p.pt) : ''}" readonly>`)}<div class="grid grid-cols-2 gap-3">${this.fld('To Department', `<select class="wr-inp">${this.DEPTS.map((d) => `<option>${this.esc(d)}</option>`).join('')}</select>`)}${this.fld('Queue Position', '<select class="wr-inp"><option>Keep position</option><option>Move to front</option><option>Move to back</option></select>')}</div></div>`,
    },
    import: {
      t: 'Import Queue', ic: 'ti-upload', cta: 'Start Import',
      body: () =>
        `<div class="space-y-3"><div class="wr-drop" id="wr-dropzone"><i class="ti ti-cloud-upload text-3xl wr-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Queue Import</p><p class="text-xs wr-muted">or click to browse files</p><input type="file" class="hidden" id="wr-file"></div><button class="wr-btn wr-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:${this.mix('#14b8a6', 8)}"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs wr-muted" id="wr-import-sum">No file selected yet.</div></div></div>`,
    },
    export: {
      t: 'Export Queue', ic: 'ti-download', cta: 'Export Now',
      body: () => {
        const opts: [string, string][] = [['CSV', 'ti-file-text'], ['Excel', 'ti-file-spreadsheet'], ['PDF', 'ti-file-typography'], ['Print', 'ti-printer']];
        return `<div class="space-y-4"><div><div class="wr-lbl">Format</div><div class="grid grid-cols-2 gap-2">${opts.map((o, i) => `<button class="wr-btn wr-btn-soft justify-start wr-expfmt${i === 0 ? ' !border-[var(--color-primary)]' : ''}" data-fmt="${o[0]}"><i class="ti ${o[1]}"></i> ${o[0]}</button>`).join('')}</div></div><div><div class="wr-lbl">Scope</div><select class="wr-inp"><option>Queue Report</option><option>Department Report</option><option>Selected Records</option><option>All Records</option></select></div></div>`;
      },
    },
    print: {
      t: 'Print Queue', ic: 'ti-printer', cta: 'Print',
      body: () => `<div class="space-y-3">${this.fld('Report', '<select class="wr-inp"><option>Full queue board</option><option>Waiting only</option><option>By department</option></select>')}${this.fld('Include', '<select class="wr-inp"><option>All details</option><option>Tokens only</option></select>')}</div>`,
    },
    delete: {
      t: 'Remove from Queue', ic: 'ti-user-minus', danger: 1, cta: 'Remove',
      body: (p) => `<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Remove ${p ? this.esc(p.tok + ' — ' + p.pt) : 'selected patients'}?</p><p class="text-sm wr-muted mt-1">This patient will be removed from the waiting queue.</p></div>`,
    },
  };

  private openModal(key: string, p?: QueuePatient): void {
    const m = this.MODALS[key];
    if (!m) return;
    const danger = m.danger;
    const dialog = this.byId('wr-dialog');
    if (dialog) {
      dialog.innerHTML = `<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti ${m.ic}" style="color:${danger ? '#ef4444' : 'var(--color-primary)'}"></i> ${this.esc(m.t)}</h3><button class="wr-btn wr-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>${m.body(p)}<div class="flex justify-end gap-2 mt-5"><button class="wr-btn wr-btn-soft" data-close>Cancel</button><button class="wr-btn ${danger ? 'wr-btn-soft !bg-rose-500 !text-white' : 'wr-btn-primary'}" id="wr-modal-ok"><i class="ti ${danger ? 'ti-user-minus' : 'ti-check'}"></i> ${this.esc(m.cta)}</button></div></div>`;
    }
    this.byId('wr-modal')?.classList.add('open');
    this.syncBodyLock();

    this.byId('wr-modal-ok')?.addEventListener('click', () => {
      this.byId('wr-modal')?.classList.remove('open');
      this.syncBodyLock();
      if (key === 'delete' && p) { const i = this.Q.indexOf(p); if (i >= 0) this.Q.splice(i, 1); this.refreshAll(); }
      this.toast(`${m.t} completed`);
    });

    const dz = this.byId('wr-dropzone');
    if (dz) {
      dz.addEventListener('click', () => (this.byId('wr-file') as HTMLInputElement | null)?.click());
      const fi = this.byId('wr-file') as HTMLInputElement | null;
      fi?.addEventListener('change', () => {
        if (fi.files?.[0]) {
          const el = this.byId('wr-import-sum');
          if (el) el.innerHTML = `<b class="text-[var(--color-gray-900)]">${this.esc(fi.files[0].name)}</b> ready · 16 rows · 0 errors`;
        }
      });
      ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    }
    this.qsa('.wr-expfmt').forEach((b) => b.addEventListener('click', () => { this.qsa('.wr-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]')); b.classList.add('!border-[var(--color-primary)]'); }));
  }

  /* ---------------- Selection / bulk ---------------- */

  private selCount(): number { return Object.keys(this.state.sel).filter((k) => this.state.sel[k]).length; }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('wr-bulk-n'); if (el) el.textContent = String(n);
    this.byId('wr-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('wr-selall') as HTMLInputElement | null;
    if (!sa) return;
    const vis = this.filtered();
    sa.checked = vis.length > 0 && vis.every((p) => this.state.sel[p.tok]);
  }
  private updateFilterCount(): void {
    const n = Object.keys(this.state.filters).filter((k) => k !== 'sort' && this.state.filters[k]).length;
    const el = this.byId('wr-filter-n');
    if (el) { el.textContent = String(n); el.classList.toggle('hidden', n === 0); }
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.qsa('[data-f="dept"]').forEach((s) => (s.innerHTML = '<option value="">All</option>' + this.DEPTS.map((d) => `<option>${this.esc(d)}</option>`).join('')));
    this.qsa('[data-f="doctor"]').forEach((s) => (s.innerHTML = '<option value="">All</option>' + this.DOCTORS.map((d) => `<option>${this.esc(d)}</option>`).join('')));
    const colsList = this.byId('wr-cols-list');
    if (colsList) colsList.innerHTML = this.COLS.map((c) => `<label class="flex items-center gap-2 text-xs font-semibold text-[var(--color-gray-700)] cursor-pointer"><input type="checkbox" class="wr-cb wr-colcb" data-col="${c[0]}" checked> ${this.esc(c[1])}</label>`).join('');

    (this.byId('wr-search') as HTMLInputElement | null)?.addEventListener('input', (e) => { this.state.q = (e.target as HTMLInputElement).value; this.render(); });
    this.byId('wr-filter-toggle')?.addEventListener('click', () => this.byId('wr-filters')?.classList.toggle('hidden'));
    this.byId('wr-cols-toggle')?.addEventListener('click', () => this.byId('wr-cols')?.classList.toggle('hidden'));
    this.byId('wr-view')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') || 'board';
      this.qsa('.wr-segb', this.byId('wr-view') as HTMLElement).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.qsa('[data-f]').forEach((sel) => sel.addEventListener('change', () => {
      this.state.filters[sel.getAttribute('data-f') || ''] = (sel as HTMLSelectElement).value;
      this.updateFilterCount();
      this.render();
    }));
    this.byId('wr-clear')?.addEventListener('click', () => {
      Object.keys(this.state.filters).forEach((k) => { if (k !== 'sort') this.state.filters[k] = ''; });
      this.qsa('[data-f]').forEach((s) => { if (s.getAttribute('data-f') !== 'sort') (s as HTMLSelectElement).value = ''; });
      this.updateFilterCount();
      this.render();
      this.toast('Filters cleared');
    });

    this.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-callnext]')) { this.callNext(); return; }
      const cl2 = target.closest('[data-call]') as HTMLElement | null;
      if (cl2) { const p = this.Q.find((x) => x.tok === cl2.getAttribute('data-call')); if (p) { p.status = 'Called'; this.refreshAll(); this.toast(`${p.tok} called`); } return; }
      const st = target.closest('[data-start]') as HTMLElement | null;
      if (st) {
        const p2 = this.Q.find((x) => x.tok === st.getAttribute('data-start'));
        if (p2) { p2.status = 'In Consultation'; if (this.byId('wr-drawer')?.classList.contains('open')) { this.byId('wr-drawer')?.classList.remove('open'); this.syncBodyLock(); } this.refreshAll(); this.toast(`Consultation started — ${p2.tok}`); }
        return;
      }
      const mo = target.closest('[data-modal]') as HTMLElement | null;
      if (mo) { this.openModal(mo.getAttribute('data-modal') || ''); return; }
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) { this.openDrawer(op.getAttribute('data-open') || ''); return; }
      const mb = target.closest('[data-menu]') as HTMLElement | null;
      if (mb) { const rc = mb.getBoundingClientRect(); this.openMenu(mb.getAttribute('data-menu') || '', rc.right - 216, rc.bottom + 4); e.stopPropagation(); return; }
      const ai = target.closest('[data-act]') as HTMLElement | null;
      if (ai) { this.doAction(ai.getAttribute('data-act') || ''); return; }
      const tt = target.closest('[data-toast]') as HTMLElement | null;
      if (tt) { this.toast(tt.getAttribute('data-toast') || ''); return; }
      if (target.closest('[data-refresh]')) {
        const upd = this.byId('wr-h-updated'); if (upd) upd.textContent = 'just now';
        this.refreshAll();
        this.toast('Queue refreshed');
        return;
      }
      const rcb = target.closest('.wr-rowcb') as HTMLInputElement | null;
      if (rcb) { this.state.sel[rcb.getAttribute('data-id') || ''] = rcb.checked; this.syncBulk(); this.syncSelAll(); return; }
      const cl = target.closest('[data-close]') as HTMLElement | null;
      if (cl) { cl.closest('.wr-drawer,.wr-modal')?.classList.remove('open'); this.syncBodyLock(); return; }
      if (!target.closest('#wr-menu')) this.closeMenu();
    });

    this.document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        this.closeMenu();
        this.qsa('.wr-drawer.open,.wr-modal.open').forEach((m) => m.classList.remove('open'));
        this.syncBodyLock();
      }
    });
    window.addEventListener('scroll', () => this.closeMenu(), true);
    this.document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'wr-selall') {
        const vis = this.filtered();
        vis.forEach((p) => (this.state.sel[p.tok] = (target as HTMLInputElement).checked));
        this.render();
        this.syncBulk();
      }
      if (target.classList.contains('wr-colcb')) {
        this.state.cols[target.getAttribute('data-col') || ''] = (target as HTMLInputElement).checked;
        this.render();
      }
    });

    this.byId('wr-bulk-x')?.addEventListener('click', () => { this.state.sel = {}; this.render(); this.syncBulk(); });
    this.qsa('[data-bulk]').forEach((b) => b.addEventListener('click', () => {
      const act = b.getAttribute('data-bulk') || '';
      const n = this.selCount();
      const ids = Object.keys(this.state.sel).filter((k) => this.state.sel[k]);
      if (act === 'delete') {
        ids.forEach((id) => { const i = this.Q.findIndex((p) => p.tok === id); if (i >= 0) this.Q.splice(i, 1); });
        this.state.sel = {};
        this.refreshAll();
        this.syncBulk();
        this.toast(`${n} removed from queue`);
        return;
      }
      if (act === 'call') {
        ids.forEach((id) => { const p = this.Q.find((x) => x.tok === id); if (p && p.status === 'Waiting') p.status = 'Called'; });
        this.refreshAll();
        this.toast(`${n} patient${n > 1 ? 's' : ''} called`);
        return;
      }
      const names: Record<string, string> = { assign: 'Doctor assigned to', prio: 'Priority changed for', print: 'Queue slips printed for', export: 'Exported' };
      this.toast(`${names[act] || 'Updated'} ${n} patient${n > 1 ? 's' : ''}`);
    }));
  }
}
