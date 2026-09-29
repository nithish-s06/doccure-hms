import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Session {
  id: string; pt: string; ptc: string; ptphoto: string; doc: string; docc: string; dept: string;
  day: number; time: string; startMin: number; dur: number; stype: string; status: string;
  prio: string; progress: number; age: number;
}

interface Doctor { name: string; dept: string; spec: string; c: string; today: number; avail: string; next: string; hours: number; load: number; photo: string; }
interface Activity { ic: string; c: string; t: string; s: string; tm: string; }
interface Kpi { l: string; v: string; ic: string; c: string; p: number; ch: string; spark: number[]; }

/**
 * Ported from tailwind/src/assets/js/script.js — "// scheduled-sessions" IIFE.
 * Faithful port of the search/filter/sort/view (calendar/grid/list), the
 * doctor board, today's timeline, the row action menu, the drawer, and the
 * schedule/assign/upload/cancel/import/export/print/delete modals (all
 * legacy .ss-modal/.ss-drawer class-toggle overlays, matching the source).
 */
@Component({
  imports: [],
  selector: 'app-scheduled-sessions',
  styleUrl: './scheduled-sessions.css',
  templateUrl: './scheduled-sessions.html',
})
export class ScheduledSessions implements AfterViewInit {
  private readonly STYPE: Record<string, { c: string; ic: string }> = {
    'In-person': { c: '#0ea5e9', ic: 'ti-user' },
    Video: { c: '#6366f1', ic: 'ti-video' },
    Therapy: { c: '#10b981', ic: 'ti-heart-handshake' },
    Procedure: { c: '#ec4899', ic: 'ti-medical-cross' },
  };
  private readonly STC: Record<string, string> = { Scheduled: '#0ea5e9', Live: '#10b981', Completed: '#8b5cf6', Cancelled: '#94a3b8' };
  private readonly PRIO: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  private SESS: Session[] = [
    { id: 'SS-3001', pt: 'Ravi Kumar', ptc: '#0ea5e9', ptphoto: 'assets/img/avatar/avatar-01.jpg', doc: 'Dr. Sarah Roberts', docc: '#ef4444', dept: 'Cardiology', day: 17, time: '09:00 AM', startMin: 540, dur: 30, stype: 'In-person', status: 'Completed', prio: 'High', progress: 100, age: 52 },
    { id: 'SS-3002', pt: 'Anita Desai', ptc: '#8b5cf6', ptphoto: 'assets/img/avatar/avatar-03.jpg', doc: 'Dr. Vikram Nair', docc: '#8b5cf6', dept: 'Neurology', day: 17, time: '09:45 AM', startMin: 585, dur: 45, stype: 'Video', status: 'Completed', prio: 'Medium', progress: 100, age: 34 },
    { id: 'SS-3003', pt: 'Mohammed Ali', ptc: '#10b981', ptphoto: 'assets/img/avatar/avatar-02.jpg', doc: 'Dr. Meera Iyer', docc: '#f59e0b', dept: 'Pediatrics', day: 17, time: '10:15 AM', startMin: 615, dur: 20, stype: 'In-person', status: 'Live', prio: 'High', progress: 60, age: 6 },
    { id: 'SS-3004', pt: 'Priya Sharma', ptc: '#d946ef', ptphoto: 'assets/img/avatar/avatar-04.jpg', doc: 'Dr. Sarah Roberts', docc: '#ef4444', dept: 'Gynecology', day: 17, time: '10:40 AM', startMin: 640, dur: 30, stype: 'In-person', status: 'Live', prio: 'Medium', progress: 35, age: 29 },
    { id: 'SS-3005', pt: 'Deepak Nair', ptc: '#6366f1', ptphoto: 'assets/img/avatar/avatar-06.jpg', doc: 'Dr. Fatima Sheikh', docc: '#a855f7', dept: 'Psychiatry', day: 17, time: '11:00 AM', startMin: 660, dur: 40, stype: 'Therapy', status: 'Live', prio: 'Low', progress: 15, age: 37 },
    { id: 'SS-3006', pt: 'Sunita Rao', ptc: '#14b8a6', ptphoto: 'assets/img/avatar/avatar-05.jpg', doc: 'Dr. Rajesh Menon', docc: '#ec4899', dept: 'Oncology', day: 17, time: '11:30 AM', startMin: 690, dur: 30, stype: 'Procedure', status: 'Scheduled', prio: 'High', progress: 0, age: 58 },
    { id: 'SS-3007', pt: 'John Mathew', ptc: '#f43f5e', ptphoto: 'assets/img/avatar/avatar-07.jpg', doc: 'Dr. John Mathew', docc: '#f43f5e', dept: 'Emergency', day: 17, time: '12:00 PM', startMin: 720, dur: 25, stype: 'In-person', status: 'Scheduled', prio: 'High', progress: 0, age: 41 },
    { id: 'SS-3008', pt: 'Karan Malhotra', ptc: '#10b981', ptphoto: 'assets/img/avatar/avatar-11.jpg', doc: 'Dr. Karan Malhotra', docc: '#10b981', dept: 'Dermatology', day: 17, time: '12:45 PM', startMin: 765, dur: 20, stype: 'Video', status: 'Scheduled', prio: 'Low', progress: 0, age: 48 },
    { id: 'SS-3009', pt: 'Neha Kapoor', ptc: '#ec4899', ptphoto: 'assets/img/avatar/avatar-08.jpg', doc: 'Dr. Sarah Roberts', docc: '#ef4444', dept: 'Cardiology', day: 17, time: '02:00 PM', startMin: 840, dur: 30, stype: 'In-person', status: 'Scheduled', prio: 'Medium', progress: 0, age: 33 },
    { id: 'SS-3010', pt: 'Arjun Menon', ptc: '#0891b2', ptphoto: 'assets/img/avatar/avatar-12.jpg', doc: 'Dr. Arjun Menon', docc: '#0891b2', dept: 'Nephrology', day: 17, time: '03:15 PM', startMin: 915, dur: 45, stype: 'Procedure', status: 'Scheduled', prio: 'High', progress: 0, age: 60 },
    { id: 'SS-3011', pt: 'Fatima Sheikh', ptc: '#a855f7', ptphoto: 'assets/img/avatar/avatar-09.jpg', doc: 'Dr. Sunita Rao', docc: '#14b8a6', dept: 'ENT', day: 18, time: '09:30 AM', startMin: 570, dur: 20, stype: 'In-person', status: 'Scheduled', prio: 'Low', progress: 0, age: 26 },
    { id: 'SS-3012', pt: 'Meera Iyer', ptc: '#f59e0b', ptphoto: 'assets/img/avatar/avatar-10.jpg', doc: 'Dr. Deepak Nair', docc: '#6366f1', dept: 'Radiology', day: 18, time: '11:00 AM', startMin: 660, dur: 30, stype: 'Procedure', status: 'Scheduled', prio: 'Medium', progress: 0, age: 45 },
    { id: 'SS-3013', pt: 'Rohan Verma', ptc: '#f97316', ptphoto: 'assets/img/avatar/avatar-13.jpg', doc: 'Dr. Vikram Nair', docc: '#8b5cf6', dept: 'Neurology', day: 16, time: '10:00 AM', startMin: 600, dur: 45, stype: 'Video', status: 'Cancelled', prio: 'Medium', progress: 0, age: 39 },
    { id: 'SS-3014', pt: 'Leela Menon', ptc: '#0d9488', ptphoto: 'assets/img/avatar/avatar-14.jpg', doc: 'Dr. Meera Iyer', docc: '#f59e0b', dept: 'Pediatrics', day: 22, time: '10:30 AM', startMin: 630, dur: 20, stype: 'In-person', status: 'Scheduled', prio: 'Low', progress: 0, age: 8 },
    { id: 'SS-3015', pt: 'Sam Wesley', ptc: '#7c3aed', ptphoto: 'assets/img/avatar/avatar-15.jpg', doc: 'Dr. Rajesh Menon', docc: '#ec4899', dept: 'Oncology', day: 24, time: '02:30 PM', startMin: 870, dur: 60, stype: 'Procedure', status: 'Scheduled', prio: 'High', progress: 0, age: 55 },
  ];

  private readonly DOCS: Doctor[] = [
    { name: 'Dr. Sarah Roberts', dept: 'Cardiology', spec: 'Interventional', c: '#ef4444', today: 4, avail: 'In session', next: '02:00 PM', hours: 6.5, load: 88, photo: 'assets/img/doctor/doctor-01.jpg' },
    { name: 'Dr. Vikram Nair', dept: 'Neurology', spec: 'Stroke Care', c: '#8b5cf6', today: 3, avail: 'Available', next: '—', hours: 4, load: 60, photo: 'assets/img/doctor/doctor-02.jpg' },
    { name: 'Dr. Meera Iyer', dept: 'Pediatrics', spec: 'Neonatology', c: '#f59e0b', today: 5, avail: 'In session', next: '10:30 AM', hours: 5.5, load: 74, photo: 'assets/img/doctor/doctor-04.jpg' },
    { name: 'Dr. Rajesh Menon', dept: 'Oncology', spec: 'Medical Onc', c: '#ec4899', today: 3, avail: 'Available', next: '11:30 AM', hours: 5, load: 82, photo: 'assets/img/doctor/doctor-05.jpg' },
    { name: 'Dr. Fatima Sheikh', dept: 'Psychiatry', spec: 'Behavioral', c: '#a855f7', today: 2, avail: 'In session', next: '—', hours: 3.5, load: 48, photo: 'assets/img/doctor/doctor-11.jpg' },
    { name: 'Dr. John Mathew', dept: 'Emergency', spec: 'Emergency Med', c: '#f43f5e', today: 4, avail: 'Available', next: '12:00 PM', hours: 7, load: 94, photo: 'assets/img/doctor/doctor-08.jpg' },
  ];

  private readonly ACTIVITY: Activity[] = [
    { ic: 'ti-calendar-plus', c: '#6366f1', t: 'New session scheduled — SS-3015', s: 'Sam Wesley · Oncology · Jul 24', tm: '6m ago' },
    { ic: 'ti-player-play', c: '#10b981', t: 'Session started — SS-3003', s: 'Dr. Meera Iyer · Pediatrics', tm: '14m ago' },
    { ic: 'ti-circle-check', c: '#8b5cf6', t: 'Session completed — SS-3002', s: '45 min · Neurology', tm: '32m ago' },
    { ic: 'ti-ban', c: '#ef4444', t: 'Session cancelled — SS-3013', s: 'Rohan Verma · patient request', tm: '1h ago' },
    { ic: 'ti-stethoscope', c: '#0ea5e9', t: 'Doctor assigned to SS-3009', s: 'Dr. Sarah Roberts', tm: '2h ago' },
    { ic: 'ti-calendar-cog', c: '#f59e0b', t: 'Session rescheduled — SS-3012', s: 'Jul 18 · 11:00 AM', tm: '3h ago' },
  ];

  private KPIS: Kpi[] = [
    { l: 'Total Scheduled', v: '246', ic: 'ti-calendar', c: '#6366f1', p: 80, ch: '+8%', spark: [190, 205, 215, 225, 235, 242, 246] },
    { l: "Today's Sessions", v: '18', ic: 'ti-calendar-event', c: '#0ea5e9', p: 60, ch: '+3', spark: [12, 14, 15, 16, 17, 18, 18] },
    { l: 'Live Sessions', v: '3', ic: 'ti-player-play', c: '#10b981', p: 30, ch: 'now', spark: [1, 2, 2, 3, 2, 3, 3] },
    { l: 'Upcoming', v: '9', ic: 'ti-calendar-clock', c: '#ec4899', p: 50, ch: 'today', spark: [6, 7, 8, 8, 9, 9, 9] },
    { l: 'Completed', v: '192', ic: 'ti-circle-check', c: '#8b5cf6', p: 88, ch: '+6%', spark: [150, 160, 170, 178, 185, 190, 192] },
    { l: 'Cancelled', v: '14', ic: 'ti-ban', c: '#ef4444', p: 18, ch: '-2', spark: [18, 17, 16, 15, 15, 14, 14] },
  ];

  private readonly DEPTS = [...new Set(this.SESS.map((s) => s.dept))];
  private readonly DOCTORS = this.DOCS.map((d) => d.name);
  private readonly COLS: [string, string, number][] = [
    ['id', 'ID', 1], ['patient', 'Patient', 1], ['doctor', 'Doctor', 1], ['dept', 'Department', 1],
    ['date', 'Date', 1], ['time', 'Time', 1], ['dur', 'Duration', 1], ['stype', 'Type', 1], ['status', 'Status', 1],
  ];

  private state = {
    q: '', view: 'calendar', filters: { dept: '', doctor: '', stype: '', status: '', prio: '', date: '', sort: 'time' } as Record<string, string>,
    sel: {} as Record<string, boolean>, cols: {} as Record<string, boolean>, calMonth: 6, calYear: 2026, selDay: null as number | null,
  };
  private readonly TODAY = 17;
  private _tick = 0;
  private menuSess: string | null = null;

  private readonly ACTIONS: { a?: string; n?: string; ic?: string; ok?: number; danger?: number; sep?: number }[] = [
    { a: 'view', n: 'View Session', ic: 'ti-eye' }, { a: 'edit', n: 'Edit Session', ic: 'ti-edit' },
    { a: 'start', n: 'Start Session', ic: 'ti-player-play', ok: 1 }, { a: 'complete', n: 'Complete Session', ic: 'ti-check' },
    { a: 'reschedule', n: 'Reschedule', ic: 'ti-calendar' }, { a: 'cancel', n: 'Cancel Session', ic: 'ti-ban', danger: 1 },
    { sep: 1 }, { a: 'assign', n: 'Assign Doctor', ic: 'ti-stethoscope' }, { a: 'slot', n: 'Change Time Slot', ic: 'ti-clock-edit' },
    { a: 'patient', n: 'View Patient', ic: 'ti-user' }, { a: 'mh', n: 'View Medical History', ic: 'ti-history' }, { a: 'upload', n: 'Upload Documents', ic: 'ti-upload' },
    { sep: 1 }, { a: 'print', n: 'Print Schedule', ic: 'ti-printer' }, { a: 'pdf', n: 'Download PDF', ic: 'ti-file-download' },
    { a: 'remind', n: 'Send Reminder', ic: 'ti-bell' }, { a: 'email', n: 'Send Email', ic: 'ti-mail' },
    { sep: 1 }, { a: 'archive', n: 'Archive', ic: 'ti-archive' }, { a: 'delete', n: 'Delete', ic: 'ti-trash', danger: 1 },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.COLS.forEach((c) => (this.state.cols[c[0]] = true));
  }

  ngAfterViewInit(): void {
    this.wireEvents();
    setInterval(() => this.tickLive(), 3000);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private qs(sel: string, root: ParentNode = this.document): HTMLElement | null {
    return root.querySelector(sel);
  }
  private qsa(sel: string, root: ParentNode = this.document): HTMLElement[] {
    return Array.from(root.querySelectorAll(sel));
  }
  private esc(s: unknown): string {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }
  private mix(c: string, p = 15): string {
    return `color-mix(in srgb,${c} ${p}%,transparent)`;
  }
  private docPhoto(name: string): string {
    return this.DOCS.find((x) => x.name === name)?.photo ?? 'assets/img/doctor/doctor-02.jpg';
  }
  private detailUrl(id: string): string {
    return 'scheduled-session-detail.html?' + new URLSearchParams({ id }).toString();
  }
  private toast(message: string): void {
    this.toastService.show(message, 'success');
  }

  /* ---------------- Sparkline / KPIs / widgets ---------------- */

  private spark(data: number[], c: string): string {
    const w = 90, h = 26, max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
    const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 4) - 2).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/><polyline fill="${this.mix(c, 14)}" stroke="none" points="0,${h} ${pts.join(' ')} ${w},${h}"/></svg>`;
  }

  private renderKPIs(): void {
    this.KPIS[2].v = String(this.SESS.filter((s) => s.status === 'Live').length);
    this.KPIS[1].v = String(this.SESS.filter((s) => s.day === this.TODAY).length);
    const wrap = this.byId('ss-kpis');
    if (wrap) {
      wrap.innerHTML = this.KPIS.map(
        (k) =>
          `<div class="ss-kpi" style="--kc:${k.c}"><div class="flex items-start justify-between mb-2"><div class="ss-kpi-ic" style="background:${this.mix(k.c)};color:${k.c}"><i class="ti ${k.ic} text-lg"></i></div><svg viewBox="0 0 36 36" class="ss-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="${k.c}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${k.p}"/></svg></div><div class="ss-kpi-v">${this.esc(k.v)}</div><div class="flex items-center justify-between mt-1"><span class="text-xs ss-muted font-semibold">${this.esc(k.l)}</span><span class="ss-chip" style="background:${this.mix(k.c)};color:${k.c}">${this.esc(k.ch)}</span></div><div class="mt-2 opacity-90">${this.spark(k.spark, k.c)}</div></div>`
      ).join('');
    }
    const today = this.byId('ss-h-today'); if (today) today.textContent = this.KPIS[1].v;
    const live = this.byId('ss-h-live'); if (live) live.textContent = this.KPIS[2].v;
    const done = this.byId('ss-h-completed'); if (done) done.textContent = this.KPIS[4].v;
  }

  /* ---------------- Filtering / sorting ---------------- */

  private filtered(): Session[] {
    const f = this.state.filters, q = this.state.q.toLowerCase();
    const arr = this.SESS.filter((s) => {
      if (q && `${s.id} ${s.pt} ${s.doc} ${s.dept}`.toLowerCase().indexOf(q) < 0) return false;
      if (f['dept'] && s.dept !== f['dept']) return false;
      if (f['doctor'] && s.doc !== f['doctor']) return false;
      if (f['stype'] && s.stype !== f['stype']) return false;
      if (f['status'] && s.status !== f['status']) return false;
      if (f['prio'] && s.prio !== f['prio']) return false;
      if (this.state.selDay && s.day !== this.state.selDay) return false;
      return true;
    });
    const po: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    arr.sort((a, b) => {
      if (f['sort'] === 'dur') return b.dur - a.dur;
      if (f['sort'] === 'prio') return po[a.prio] - po[b.prio];
      if (f['sort'] === 'name') return a.pt.localeCompare(b.pt);
      return a.startMin - b.startMin;
    });
    return arr;
  }

  private countdown(s: Session): { t: string; c: string } {
    if (s.status === 'Completed') return { t: 'Completed', c: '#8b5cf6' };
    if (s.status === 'Cancelled') return { t: 'Cancelled', c: '#94a3b8' };
    if (s.status === 'Live') return { t: 'In progress', c: '#10b981' };
    if (s.day !== this.TODAY) return { t: `On Jul ${s.day}`, c: '#0ea5e9' };
    const nowMin = 10 * 60 + 25 + this._tick;
    const diff = s.startMin - nowMin;
    if (diff <= 0) return { t: 'Starting now', c: '#f59e0b' };
    const h = Math.floor(diff / 60), m = diff % 60;
    return { t: `in ${h > 0 ? h + 'h ' : ''}${m}m`, c: '#0ea5e9' };
  }

  /* ---------------- Grid / list / timeline / boards ---------------- */

  private gridHTML(s: Session): string {
    const t = this.STYPE[s.stype] || { c: '#94a3b8', ic: 'ti-user' };
    const sc = this.STC[s.status];
    const cd = this.countdown(s);
    return (
      `<div class="ss-surface p-4" style="border-left:3px solid ${this.PRIO[s.prio]}">` +
      `<div class="flex items-center justify-between mb-3"><a class="text-xs font-bold text-[var(--color-primary)]" href="${this.detailUrl(s.id)}">${this.esc(s.id)}</a><div class="flex items-center gap-1.5"><span class="ss-tag" style="background:${this.mix(this.PRIO[s.prio])};color:${this.PRIO[s.prio]}"><i class="ti ti-flag-3" style="font-size:.56rem"></i>${this.esc(s.prio)}</span><button class="ss-btn ss-btn-soft !p-1.5" data-menu="${s.id}"><i class="ti ti-dots-vertical"></i></button></div></div>` +
      `<div class="flex items-center gap-2"><div class="flex -space-x-2"><img class="ss-av" src="${s.ptphoto}" alt="${this.esc(s.pt)}"><img class="ss-av" src="${this.docPhoto(s.doc)}" alt="${this.esc(s.doc)}"></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(s.pt)}</div><div class="text-xs ss-muted truncate">${this.esc(s.doc.replace('Dr. ', 'Dr '))} · ${this.esc(s.dept)}</div></div></div>` +
      `<div class="grid grid-cols-2 gap-2 mt-3 text-xs"><div class="flex items-center gap-1.5 ss-muted"><i class="ti ti-clock"></i> ${this.esc(s.time)}</div><div class="flex items-center gap-1.5 ss-muted"><i class="ti ${t.ic}" style="color:${t.c}"></i> ${this.esc(s.stype)}</div><div class="flex items-center gap-1.5 ss-muted"><i class="ti ti-hourglass"></i> ${s.dur} min</div><div class="flex items-center gap-1.5" style="color:${cd.c}"><i class="ti ti-clock-play"></i> ${this.esc(cd.t)}</div></div>` +
      (s.status === 'Live'
        ? `<div class="mt-2.5"><div class="flex items-center justify-between mb-1"><span class="text-[10px] ss-muted font-semibold">Progress</span><span class="text-[10px] font-bold text-emerald-600">${s.progress}%</span></div><div class="ss-bar"><span style="width:${s.progress}%;background:linear-gradient(90deg,#10b981,#059669)"></span></div></div>`
        : '') +
      `<div class="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-color)]"><span class="ss-tag" style="background:${this.mix(sc)};color:${sc}"><span class="ss-dotstat" style="background:${sc}"></span>${this.esc(s.status)}</span>` +
      (s.status === 'Scheduled'
        ? `<button class="ss-btn ss-btn-primary flex-1 !py-1.5 text-xs" data-start="${s.id}"><i class="ti ti-player-play"></i> Start</button>`
        : s.status === 'Live'
        ? `<button class="ss-btn ss-btn-indigo flex-1 !py-1.5 text-xs" data-complete="${s.id}"><i class="ti ti-check"></i> Complete</button>`
        : `<a class="ss-btn ss-btn-soft flex-1 !py-1.5 text-xs" href="${this.detailUrl(s.id)}"><i class="ti ti-eye"></i> View</a>`) +
      '</div></div>'
    );
  }

  private td(col: string, html: string): string {
    return `<td class="${this.state.cols[col] ? '' : 'ss-hidecol'}">${html}</td>`;
  }

  private renderList(arr: Session[]): void {
    const wrap = this.byId('ss-tbody');
    if (wrap) {
      wrap.innerHTML = arr
        .map((s) => {
          const t = this.STYPE[s.stype] || { c: '#94a3b8', ic: '' };
          const sc = this.STC[s.status];
          return (
            `<tr data-row="${s.id}"><td><input type="checkbox" class="ss-cb ss-rowcb" data-id="${s.id}"${this.state.sel[s.id] ? ' checked' : ''}></td>` +
            this.td('id', `<a class="font-bold text-[var(--color-primary)]" href="${this.detailUrl(s.id)}">${this.esc(s.id)}</a>`) +
            this.td('patient', `<div class="flex items-center gap-2.5"><img class="ss-av ss-av-sm" src="${s.ptphoto}" alt="${this.esc(s.pt)}"><span class="font-bold text-[var(--color-gray-900)]">${this.esc(s.pt)}</span></div>`) +
            this.td('doctor', `<span class="ss-muted">${this.esc(s.doc)}</span>`) +
            this.td('dept', `<span class="ss-muted">${this.esc(s.dept)}</span>`) +
            this.td('date', `<span class="ss-muted whitespace-nowrap">Jul ${s.day}</span>`) +
            this.td('time', `<span class="ss-muted whitespace-nowrap">${this.esc(s.time)}</span>`) +
            this.td('dur', `<span class="ss-muted">${s.dur}m</span>`) +
            this.td('stype', `<span class="ss-tag" style="background:${this.mix(t.c)};color:${t.c}">${this.esc(s.stype)}</span>`) +
            this.td('status', `<span class="ss-tag" style="background:${this.mix(sc)};color:${sc}"><span class="ss-dotstat" style="background:${sc}"></span>${this.esc(s.status)}</span>`) +
            `<td><button class="ss-btn ss-btn-soft !p-1.5" data-menu="${s.id}"><i class="ti ti-dots-vertical"></i></button></td></tr>`
          );
        })
        .join('');
    }
    this.qsa('#ss-tabletag th[data-col]').forEach((th) => th.classList.toggle('ss-hidecol', !this.state.cols[th.getAttribute('data-col') || '']));
    this.syncSelAll();
  }

  private renderTimeline(): void {
    const arr = this.SESS.filter((s) => s.day === this.TODAY && s.status !== 'Cancelled').sort((a, b) => a.startMin - b.startMin);
    const wrap = this.byId('ss-timeline');
    if (!wrap) return;
    wrap.innerHTML = arr
      .map((s) => {
        const sc = this.STC[s.status];
        const [tt, ap] = s.time.split(' ');
        return (
          `<div class="ss-tl-card" style="border-left:3px solid ${sc}" data-open="${s.id}"><div class="ss-tl-time"><div class="text-xs font-extrabold text-[var(--color-gray-900)]">${this.esc(tt)}</div><div class="text-[10px] ss-muted font-semibold">${this.esc(ap)}</div></div>` +
          `<div class="flex-1 min-w-0"><div class="flex items-center gap-2"><img class="ss-av ss-av-sm" src="${s.ptphoto}" alt="${this.esc(s.pt)}"><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(s.pt)}</div><div class="text-[10px] ss-muted truncate">${this.esc(s.doc.replace('Dr. ', 'Dr '))} · ${this.esc(s.dept)}</div></div></div>` +
          (s.status === 'Live' ? `<div class="mt-2"><div class="ss-bar !h-1.5"><span style="width:${s.progress}%;background:#10b981"></span></div></div>` : '') +
          `</div><span class="ss-tag self-start flex-none" style="background:${this.mix(sc)};color:${sc}">${s.status === 'Live' ? '<span class="ss-liveblink"></span>' : ''}${this.esc(s.status)}</span></div>`
        );
      })
      .join('');
  }

  private renderBoards(): void {
    const board = this.byId('ss-docboard');
    if (board) {
      board.innerHTML = this.DOCS.map((d) => {
        const av = d.avail === 'Available' ? '#10b981' : '#f59e0b';
        const col = d.load >= 85 ? '#ef4444' : d.load >= 70 ? '#f59e0b' : '#10b981';
        return (
          `<div class="p-3.5 rounded-xl border border-[var(--color-border-color)]"><div class="flex items-center gap-2.5"><div class="relative flex-none"><img class="ss-av" style="width:2.6rem;height:2.6rem" src="${d.photo}" alt="${this.esc(d.name)}"><span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--color-white)]" style="background:${av}"></span></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(d.name)}</div><div class="text-[11px] ss-muted truncate">${this.esc(d.dept)} · ${this.esc(d.spec)}</div></div><span class="ss-tag" style="background:${this.mix(av)};color:${av}">${this.esc(d.avail)}</span></div>` +
          `<div class="grid grid-cols-3 gap-1.5 mt-3 text-center"><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${d.today}</div><div class="text-[9px] ss-muted font-semibold">Sessions</div></div><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${d.hours}h</div><div class="text-[9px] ss-muted font-semibold">Hours</div></div><div class="p-1.5 rounded-lg bg-[var(--color-gray-100)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(d.next)}</div><div class="text-[9px] ss-muted font-semibold">Next</div></div></div>` +
          `<div class="mt-2.5"><div class="flex items-center justify-between mb-1"><span class="text-[10px] ss-muted font-semibold">Workload</span><span class="text-[10px] font-bold" style="color:${col}">${d.load}%</span></div><div class="ss-bar"><span style="width:${d.load}%;background:linear-gradient(90deg,${col},${this.mix(col, 60)})"></span></div></div></div>`
        );
      }).join('');
    }
    const act = this.byId('ss-activity');
    if (act) {
      act.innerHTML = this.ACTIVITY.map(
        (a, i) =>
          `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:${this.mix(a.c)};color:${a.c}"><i class="ti ${a.ic} text-sm"></i></div>${i < this.ACTIVITY.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="min-w-0 pb-3"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(a.t)}</div><div class="text-[11px] ss-muted">${this.esc(a.s)}</div><div class="text-[10px] ss-muted mt-.5">${this.esc(a.tm)}</div></div></div>`
      ).join('');
    }
  }

  /* ---------------- Calendar ---------------- */

  private readonly DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private readonly MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly DIM = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  private firstDow(y: number, m: number): number {
    const anchors: Record<string, number> = { '2026-6': 3 };
    const key = `${y}-${m}`;
    if (anchors[key] != null) return anchors[key];
    const base = 3;
    let days = 0;
    const ym = 2026 * 12 + 6, cur = y * 12 + m;
    const step = cur > ym ? 1 : -1;
    for (let i = ym; i !== cur; i += step) {
      const mm = ((i % 12) + 12) % 12, yy = Math.floor(i / 12);
      const dd = this.DIM[mm] + (mm === 1 && yy % 4 === 0 ? 1 : 0);
      days += step > 0 ? dd : -this.DIM[((cur % 12) + 12) % 12];
    }
    return ((base + days) % 7 + 7) % 7;
  }

  private renderCalendar(): void {
    const y = this.state.calYear, m = this.state.calMonth;
    const title = this.byId('ss-cal-title'); if (title) title.textContent = `${this.MONTHS[m]} ${y}`;
    const start = this.firstDow(y, m), dim = this.DIM[m] + (m === 1 && y % 4 === 0 ? 1 : 0);
    const prevDim = this.DIM[(m + 11) % 12];
    let cells = '';
    for (let i = 0; i < 42; i++) {
      let dayNum: number, other = false, realDay: number | null = null;
      if (i < start) { dayNum = prevDim - start + 1 + i; other = true; }
      else if (i >= start + dim) { dayNum = i - start - dim + 1; other = true; }
      else { dayNum = i - start + 1; realDay = dayNum; }
      const isToday = !other && m === 6 && y === 2026 && dayNum === this.TODAY;
      const evs = !other && m === 6 && y === 2026 ? this.SESS.filter((s) => s.day === dayNum) : [];
      const evHtml = evs.slice(0, 3).map((s) => {
        const t = this.STYPE[s.stype] || { c: '#94a3b8' };
        return `<div class="ss-cal-ev" style="background:${this.mix(t.c, 18)};color:${t.c}" data-open="${s.id}" onclick="event.stopPropagation()"><span class="w-1.5 h-1.5 rounded-full flex-none" style="background:${t.c}"></span>${this.esc(s.time.replace(' ', ''))} ${this.esc(s.pt.split(' ')[0])}</div>`;
      }).join('');
      const more = evs.length > 3 ? `<div class="text-[9px] ss-muted font-bold mt-.5">+${evs.length - 3} more</div>` : '';
      const sel = this.state.selDay === realDay && realDay;
      cells += `<div class="ss-cal-cell${other ? ' other' : ''}${isToday ? ' today' : ''}" ${realDay ? `data-day="${realDay}"` : ''} style="${sel ? 'border-color:var(--color-primary)' : ''}"><div class="flex items-center justify-between"><span class="ss-cal-daynum${isToday ? ' text-[var(--color-primary)]' : ''}">${dayNum}</span>${evs.length ? `<span class="text-[9px] font-bold ss-muted">${evs.length}</span>` : ''}</div>${evHtml}${more}</div>`;
    }
    const cal = this.byId('ss-calendar'); if (cal) cal.innerHTML = cells;
  }

  private renderCalHead(): void {
    const head = this.byId('ss-cal-head');
    if (head) head.innerHTML = this.DOW.map((d) => `<div class="ss-cal-hd">${d}</div>`).join('');
  }

  /* ---------------- Render dispatch ---------------- */

  private render(): void {
    const arr = this.filtered();
    ['calendar', 'grid', 'list'].forEach((v) => this.byId(`ss-view-${v}`)?.classList.toggle('hidden', this.state.view !== v));
    const showEmpty = arr.length === 0 && this.state.view !== 'calendar';
    this.byId('ss-empty')?.classList.toggle('hidden', !showEmpty);
    if (this.state.view === 'calendar') this.renderCalendar();
    else if (this.state.view === 'grid') { const g = this.byId('ss-grid'); if (g) g.innerHTML = arr.map((s) => this.gridHTML(s)).join(''); }
    else this.renderList(arr);
  }

  private refreshAll(): void {
    this.render();
    this.renderKPIs();
    this.renderTimeline();
    this.animateRings();
  }

  private animateRings(): void {
    this.qsa('.ss-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }

  private tickLive(): void {
    this._tick++;
    const live = this.SESS.filter((s) => s.status === 'Live' && s.progress < 100);
    let changed = false;
    live.forEach((s) => { if (s.progress < 98) { s.progress = Math.min(98, s.progress + 1); changed = true; } });
    if (changed) {
      if (this.state.view === 'grid') { const g = this.byId('ss-grid'); if (g) g.innerHTML = this.filtered().map((s) => this.gridHTML(s)).join(''); }
      this.renderTimeline();
    }
  }

  /* ---------------- Action menu ---------------- */

  private openMenu(id: string, x: number, y: number): void {
    this.menuSess = id;
    const m = this.byId('ss-menu');
    if (!m) return;
    m.innerHTML = this.ACTIONS.map((a) =>
      a.sep ? '<div class="ss-sep"></div>' : `<div class="ss-mi${a.danger ? ' danger' : a.ok ? ' ok' : ''}" data-act="${a.a}"><i class="ti ${a.ic}"></i>${this.esc(a.n)}</div>`
    ).join('');
    m.classList.add('open');
    const h = Math.min(m.scrollHeight, window.innerHeight * 0.7);
    m.style.left = Math.max(8, Math.min(x, window.innerWidth - 218)) + 'px';
    m.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
  }
  private closeMenu(): void {
    this.byId('ss-menu')?.classList.remove('open');
    this.menuSess = null;
  }
  private doAction(act: string): void {
    const s = this.SESS.find((x) => x.id === this.menuSess);
    if (act === 'view') { this.closeMenu(); window.location.href = this.detailUrl(this.menuSess || ''); return; }
    if (act === 'edit' || act === 'slot' || act === 'reschedule') { this.closeMenu(); this.openModal('schedule', s); return; }
    if (act === 'assign') { this.closeMenu(); this.openModal('assign', s); return; }
    if (act === 'upload') { this.closeMenu(); this.openModal('upload', s); return; }
    if (act === 'cancel' || act === 'delete') { this.closeMenu(); this.openModal(act === 'cancel' ? 'cancel' : 'delete', s); return; }
    if (act === 'start' && s) { s.status = 'Live'; s.progress = 5; this.refreshAll(); this.toast(`Session started — ${s.id}`); this.closeMenu(); return; }
    if (act === 'complete' && s) { s.status = 'Completed'; s.progress = 100; this.refreshAll(); this.toast(`Session completed — ${s.id}`); this.closeMenu(); return; }
    const msgs: Record<string, string> = { patient: 'Opening patient', mh: 'Opening medical history', print: 'Schedule printed', pdf: 'PDF downloaded', remind: 'Reminder sent', email: 'Email sent', archive: 'Session archived' };
    this.toast((msgs[act] || 'Action') + (s ? ` — ${s.id}` : ''));
    this.closeMenu();
  }

  /* ---------------- Body scroll lock / drawer ---------------- */

  private syncBodyLock(): void {
    this.document.body.style.overflow = this.qs('.ss-drawer.open') || this.qs('.ss-modal.open') ? 'hidden' : '';
  }

  private openDrawer(id: string): void {
    const s = this.SESS.find((x) => x.id === id);
    if (!s) return;
    const t = this.STYPE[s.stype] || { c: '#94a3b8', ic: 'ti-user' };
    const cd = this.countdown(s);
    const tl = [
      { n: 'Session scheduled', tm: `Jul ${s.day - 1}`, done: 1 },
      { n: 'Doctor assigned', tm: `Jul ${s.day - 1}`, done: 1 },
      { n: 'Reminder sent', tm: `Jul ${s.day} 08:00`, done: 1 },
      { n: s.status === 'Scheduled' ? 'Awaiting start' : 'Session started', tm: s.status === 'Scheduled' ? cd.t : s.time, done: s.status !== 'Scheduled' ? 1 : 0 },
      { n: 'Completed', tm: s.status === 'Completed' ? 'Done' : 'Pending', done: s.status === 'Completed' ? 1 : 0 },
    ];
    const body = this.byId('ss-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,${s.ptc},${this.mix(s.ptc, 55)})">` +
        `<div class="flex items-center justify-between"><button class="ss-btn ss-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="ss-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)">${s.status === 'Live' ? '<span class="ss-liveblink"></span>' : '<span class="ss-dotstat" style="background:#fff"></span>'}${this.esc(s.status)}</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><img class="w-16 h-16 rounded-2xl object-cover border border-white/30" src="${s.ptphoto}" alt="${this.esc(s.pt)}"><div><h2 class="text-xl font-extrabold">${this.esc(s.pt)}</h2><p class="text-white/80 text-sm">${this.esc(s.age)} yrs · ${this.esc(s.dept)}</p><p class="text-white/70 text-xs mt-.5">${this.esc(s.id)} · Jul ${s.day} · ${this.esc(s.time)}</p></div></div>` +
        '</div>' +
        '<div class="p-5 space-y-5">' +
        (s.status === 'Scheduled'
          ? `<button class="ss-btn ss-btn-primary w-full" data-start="${s.id}"><i class="ti ti-player-play"></i> Start Session (${this.esc(cd.t)})</button>`
          : s.status === 'Live'
          ? `<button class="ss-btn ss-btn-indigo w-full" data-complete="${s.id}"><i class="ti ti-check"></i> Complete Session</button>`
          : '') +
        `<div class="grid grid-cols-3 gap-2 text-center"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">${s.dur}m</div><div class="text-[10px] ss-muted font-semibold">Duration</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(s.time)}</div><div class="text-[10px] ss-muted font-semibold">Start</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold" style="color:${this.PRIO[s.prio]}">${this.esc(s.prio)}</div><div class="text-[10px] ss-muted font-semibold">Priority</div></div></div>` +
        `<div class="grid grid-cols-2 gap-2.5"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs ss-muted font-semibold mb-1">Doctor</div><div class="flex items-center gap-2"><img class="ss-av ss-av-sm" src="${this.docPhoto(s.doc)}" alt="${this.esc(s.doc)}"><span class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(s.doc.replace('Dr. ', 'Dr '))}</span></div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs ss-muted font-semibold mb-1">Session Type</div><div class="text-sm font-bold text-[var(--color-gray-900)]"><i class="ti ${t.ic}" style="color:${t.c}"></i> ${this.esc(s.stype)}</div></div></div>` +
        (s.status === 'Live'
          ? `<div><div class="flex items-center justify-between mb-1"><span class="text-xs ss-muted font-semibold">Session Progress</span><span class="text-xs font-bold text-emerald-600">${s.progress}%</span></div><div class="ss-bar"><span style="width:${s.progress}%;background:linear-gradient(90deg,#10b981,#059669)"></span></div></div>`
          : '') +
        `<div><div class="text-xs ss-muted font-semibold mb-1.5">Medical Notes</div><textarea class="ss-inp" rows="2" placeholder="Add notes...">Routine ${this.esc(s.stype.toLowerCase())} session. Review prior reports.</textarea></div>` +
        '<div><div class="text-xs ss-muted font-semibold mb-2">Uploaded Documents</div><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">referral-note.pdf</span><button class="ss-btn ss-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div></div>' +
        `<div><div class="text-xs ss-muted font-semibold mb-2">Previous Sessions</div><div class="space-y-1.5"><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-history ss-muted"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">${this.esc(s.dept)} · completed</span><span class="text-[11px] ss-muted">Jun 20</span></div></div></div>` +
        `<div><div class="text-xs ss-muted font-semibold mb-2">Timeline</div><div class="space-y-2.5">${tl
          .map(
            (h, i) =>
              `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:${this.mix(h.done ? '#10b981' : '#94a3b8')};color:${h.done ? '#10b981' : '#94a3b8'}"><i class="ti ${h.done ? 'ti-check' : 'ti-clock'} text-xs"></i></div>${i < tl.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(h.n)}</div><div class="text-[11px] ss-muted">${this.esc(h.tm)}</div></div></div>`
          )
          .join('')}</div></div>` +
        '<div class="grid grid-cols-2 gap-2 pt-1"><button class="ss-btn ss-btn-soft" data-modal="schedule"><i class="ti ti-calendar"></i> Reschedule</button><button class="ss-btn ss-btn-soft" data-modal="assign"><i class="ti ti-stethoscope"></i> Assign</button><button class="ss-btn ss-btn-soft" data-toast="Reminder sent"><i class="ti ti-bell"></i> Remind</button><button class="ss-btn ss-btn-soft" data-toast="Schedule printed"><i class="ti ti-printer"></i> Print</button></div>' +
        '</div>';
    }
    this.byId('ss-drawer')?.classList.add('open');
    this.syncBodyLock();
  }

  /* ---------------- Modals ---------------- */

  private fld(label: string, inner: string): string {
    return `<div><label class="ss-lbl">${label}</label>${inner}</div>`;
  }
  private selDoc(v?: string): string {
    return `<select class="ss-inp">${this.DOCTORS.map((d) => `<option${v === d ? ' selected' : ''}>${this.esc(d)}</option>`).join('')}</select>`;
  }

  private readonly MODALS: Record<string, { t: string; ic: string; danger?: number; cta: string; body: (s?: Session) => string }> = {
    schedule: {
      t: 'Schedule Session', ic: 'ti-calendar-plus', cta: 'Save Session',
      body: (s) =>
        `<div class="space-y-3">${this.fld('Patient', `<input class="ss-inp" placeholder="Patient name" value="${s ? this.esc(s.pt) : ''}">`)}${this.fld('Doctor', this.selDoc(s?.doc))}<div class="grid grid-cols-2 gap-3">${this.fld('Department', `<select class="ss-inp">${this.DEPTS.map((d) => `<option${s && s.dept === d ? ' selected' : ''}>${this.esc(d)}</option>`).join('')}</select>`)}${this.fld('Session Type', `<select class="ss-inp">${Object.keys(this.STYPE).map((x) => `<option${s && s.stype === x ? ' selected' : ''}>${this.esc(x)}</option>`).join('')}</select>`)}</div><div class="grid grid-cols-3 gap-3">${this.fld('Date', '<input type="text" placeholder="dd-mm-yyyy" class="ss-inp" data-provider="flatpickr" data-date-format="d-m-Y">')}${this.fld('Time', '<input type="text" placeholder="--:-- --" class="ss-inp" data-provider="timepickr" data-default-time="10:00">')}${this.fld('Duration', `<input class="ss-inp" type="number" value="${s ? s.dur : 30}">`)}</div>${this.fld('Priority', '<select class="ss-inp"><option>Low</option><option>Medium</option><option>High</option></select>')}</div>`,
    },
    assign: {
      t: 'Assign Doctor', ic: 'ti-stethoscope', cta: 'Assign Doctor',
      body: (s) => `<div class="space-y-3">${this.fld('Session', `<input class="ss-inp" value="${s ? this.esc(s.id + ' — ' + s.pt) : ''}" readonly>`)}${this.fld('Assign To', this.selDoc(s?.doc))}${this.fld('Note', '<input class="ss-inp" placeholder="Optional">')}</div>`,
    },
    upload: {
      t: 'Upload Documents', ic: 'ti-upload', cta: 'Upload',
      body: () => '<div class="space-y-3"><div class="ss-drop" id="ss-dropzone"><i class="ti ti-cloud-upload text-3xl ss-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop reports or PDFs</p><input type="file" class="hidden" id="ss-file"></div><div class="text-xs ss-muted" id="ss-upload-sum"></div></div>',
    },
    cancel: {
      t: 'Cancel Session', ic: 'ti-ban', danger: 1, cta: 'Cancel Session',
      body: (s) =>
        `<div class="space-y-3"><div class="text-center py-1"><div class="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-ban text-xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Cancel ${s ? this.esc(s.id) : 'session'}?</p></div>${this.fld('Reason', '<select class="ss-inp"><option>Patient request</option><option>Doctor unavailable</option><option>Emergency</option><option>No-show</option></select>')}<label class="flex items-center gap-2 text-sm font-semibold text-[var(--color-gray-700)]"><input type="checkbox" class="ss-cb" checked> Notify patient</label></div>`,
    },
    import: {
      t: 'Import Session Schedule', ic: 'ti-upload', cta: 'Start Import',
      body: () =>
        `<div class="space-y-3"><div class="ss-drop" id="ss-dropzone"><i class="ti ti-cloud-upload text-3xl ss-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Session Schedule</p><p class="text-xs ss-muted">or click to browse files</p><input type="file" class="hidden" id="ss-file"></div><button class="ss-btn ss-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:${this.mix('#6366f1', 8)}"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs ss-muted" id="ss-import-sum">No file selected yet.</div></div></div>`,
    },
    export: {
      t: 'Export Schedule', ic: 'ti-download', cta: 'Export Now',
      body: () => {
        const opts: [string, string][] = [['CSV', 'ti-file-text'], ['Excel', 'ti-file-spreadsheet'], ['PDF', 'ti-file-typography'], ['Print', 'ti-printer']];
        return `<div class="space-y-4"><div><div class="ss-lbl">Format</div><div class="grid grid-cols-2 gap-2">${opts.map((o, i) => `<button class="ss-btn ss-btn-soft justify-start ss-expfmt${i === 0 ? ' !border-[var(--color-primary)]' : ''}" data-fmt="${o[0]}"><i class="ti ${o[1]}"></i> ${o[0]}</button>`).join('')}</div></div><div><div class="ss-lbl">Scope</div><select class="ss-inp"><option>Daily Schedule</option><option>Department Schedule</option><option>Doctor Schedule</option><option>Selected Records</option><option>All Records</option></select></div></div>`;
      },
    },
    print: {
      t: 'Print Schedule', ic: 'ti-printer', cta: 'Print',
      body: () => `<div class="space-y-3">${this.fld('Schedule', "<select class=\"ss-inp\"><option>Today's schedule</option><option>Weekly</option><option>By doctor</option><option>By department</option></select>")}${this.fld('Include', '<select class="ss-inp"><option>All details</option><option>Times only</option></select>')}</div>`,
    },
    delete: {
      t: 'Delete Confirmation', ic: 'ti-trash', danger: 1, cta: 'Delete',
      body: (s) => `<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete ${s ? this.esc(s.id) : 'selected sessions'}?</p><p class="text-sm ss-muted mt-1">This session record will be permanently removed.</p></div>`,
    },
  };

  private openModal(key: string, s?: Session): void {
    const m = this.MODALS[key];
    if (!m) return;
    const danger = m.danger;
    const dialog = this.byId('ss-dialog');
    if (dialog) {
      dialog.innerHTML = `<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti ${m.ic}" style="color:${danger ? '#ef4444' : 'var(--color-primary)'}"></i> ${this.esc(m.t)}</h3><button class="ss-btn ss-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>${m.body(s)}<div class="flex justify-end gap-2 mt-5"><button class="ss-btn ss-btn-soft" data-close>Cancel</button><button class="ss-btn ${danger ? 'ss-btn-soft !bg-rose-500 !text-white' : 'ss-btn-primary'}" id="ss-modal-ok"><i class="ti ti-check"></i> ${this.esc(m.cta)}</button></div></div>`;
    }
    this.byId('ss-modal')?.classList.add('open');
    this.syncBodyLock();

    this.byId('ss-modal-ok')?.addEventListener('click', () => {
      this.byId('ss-modal')?.classList.remove('open');
      this.syncBodyLock();
      if (key === 'delete' && s) { const i = this.SESS.indexOf(s); if (i >= 0) this.SESS.splice(i, 1); this.refreshAll(); }
      if (key === 'cancel' && s) { s.status = 'Cancelled'; this.refreshAll(); }
      this.toast(`${m.t} completed`);
    });

    const dz = this.byId('ss-dropzone');
    if (dz) {
      dz.addEventListener('click', () => (this.byId('ss-file') as HTMLInputElement | null)?.click());
      const fi = this.byId('ss-file') as HTMLInputElement | null;
      fi?.addEventListener('change', () => {
        if (fi.files?.[0]) {
          const el = this.byId('ss-import-sum') || this.byId('ss-upload-sum');
          if (el) el.innerHTML = `<b class="text-[var(--color-gray-900)]">${this.esc(fi.files[0].name)}</b> ready${this.byId('ss-import-sum') ? ' · 22 rows · 0 errors' : ''}`;
        }
      });
      ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    }
    this.qsa('.ss-expfmt').forEach((b) => b.addEventListener('click', () => { this.qsa('.ss-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]')); b.classList.add('!border-[var(--color-primary)]'); }));
  }

  /* ---------------- Selection / bulk ---------------- */

  private selCount(): number {
    return Object.keys(this.state.sel).filter((k) => this.state.sel[k]).length;
  }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('ss-bulk-n'); if (el) el.textContent = String(n);
    this.byId('ss-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('ss-selall') as HTMLInputElement | null;
    if (!sa) return;
    const vis = this.filtered();
    sa.checked = vis.length > 0 && vis.every((s) => this.state.sel[s.id]);
  }
  private updateFilterCount(): void {
    const n = Object.keys(this.state.filters).filter((k) => k !== 'sort' && this.state.filters[k]).length + (this.state.selDay ? 1 : 0);
    const el = this.byId('ss-filter-n');
    if (el) { el.textContent = String(n); el.classList.toggle('hidden', n === 0); }
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    (this.byId('ss-search') as HTMLInputElement | null)?.addEventListener('input', (e) => { this.state.q = (e.target as HTMLInputElement).value; this.render(); });
    this.byId('ss-filter-toggle')?.addEventListener('click', () => this.byId('ss-filters')?.classList.toggle('hidden'));
    this.byId('ss-cols-toggle')?.addEventListener('click', () => this.byId('ss-cols')?.classList.toggle('hidden'));
    this.byId('ss-view')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') || 'grid';
      this.qsa('.ss-segb', this.byId('ss-view') as HTMLElement).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.qsa('[data-f]').forEach((sel) => sel.addEventListener('change', () => {
      this.state.filters[sel.getAttribute('data-f') || ''] = (sel as HTMLSelectElement).value;
      this.updateFilterCount();
      this.render();
    }));
    this.byId('ss-clear')?.addEventListener('click', () => {
      Object.keys(this.state.filters).forEach((k) => { if (k !== 'sort') this.state.filters[k] = ''; });
      this.state.selDay = null;
      this.qsa('[data-f]').forEach((s) => { if (s.getAttribute('data-f') !== 'sort') (s as HTMLSelectElement).value = ''; });
      this.updateFilterCount();
      this.render();
      this.toast('Filters cleared');
    });

    this.byId('ss-cal-prev')?.addEventListener('click', () => { this.state.calMonth--; if (this.state.calMonth < 0) { this.state.calMonth = 11; this.state.calYear--; } this.renderCalendar(); });
    this.byId('ss-cal-next')?.addEventListener('click', () => { this.state.calMonth++; if (this.state.calMonth > 11) { this.state.calMonth = 0; this.state.calYear++; } this.renderCalendar(); });
    this.byId('ss-cal-today')?.addEventListener('click', () => { this.state.calMonth = 6; this.state.calYear = 2026; this.state.selDay = null; this.updateFilterCount(); this.renderCalendar(); });

    this.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const day = target.closest('[data-day]') as HTMLElement | null;
      if (day && target.closest('#ss-calendar')) {
        const d = Number(day.getAttribute('data-day'));
        this.state.selDay = this.state.selDay === d ? null : d;
        this.updateFilterCount();
        this.renderCalendar();
        if (this.state.selDay) {
          this.state.view = 'grid';
          this.qsa('.ss-segb', this.byId('ss-view') as HTMLElement).forEach((x) => x.classList.toggle('active', x.getAttribute('data-v') === 'grid'));
          this.render();
          this.toast(`Showing Jul ${d}`);
        }
        return;
      }
      if (target.closest('[data-startfirst]')) {
        const first = this.SESS.find((s) => s.status === 'Scheduled' && s.day === this.TODAY);
        if (first) { first.status = 'Live'; first.progress = 5; this.refreshAll(); this.toast(`Session started — ${first.id}`); }
        else this.toast('No scheduled sessions to start');
        return;
      }
      const st = target.closest('[data-start]') as HTMLElement | null;
      if (st) {
        const s2 = this.SESS.find((x) => x.id === st.getAttribute('data-start'));
        if (s2) { s2.status = 'Live'; s2.progress = 5; if (this.byId('ss-drawer')?.classList.contains('open')) { this.byId('ss-drawer')?.classList.remove('open'); this.syncBodyLock(); } this.refreshAll(); this.toast(`Session started — ${s2.id}`); }
        return;
      }
      const cp = target.closest('[data-complete]') as HTMLElement | null;
      if (cp) {
        const s3 = this.SESS.find((x) => x.id === cp.getAttribute('data-complete'));
        if (s3) { s3.status = 'Completed'; s3.progress = 100; if (this.byId('ss-drawer')?.classList.contains('open')) { this.byId('ss-drawer')?.classList.remove('open'); this.syncBodyLock(); } this.refreshAll(); this.toast(`Session completed — ${s3.id}`); }
        return;
      }
      const mo = target.closest('[data-modal]') as HTMLElement | null;
      if (mo) { this.openModal(mo.getAttribute('data-modal') || ''); return; }
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) { this.openDrawer(op.getAttribute('data-open') || ''); return; }
      const mb = target.closest('[data-menu]') as HTMLElement | null;
      if (mb) { const rc = mb.getBoundingClientRect(); this.openMenu(mb.getAttribute('data-menu') || '', rc.right - 218, rc.bottom + 4); e.stopPropagation(); return; }
      const ai = target.closest('[data-act]') as HTMLElement | null;
      if (ai) { this.doAction(ai.getAttribute('data-act') || ''); return; }
      const tt = target.closest('[data-toast]') as HTMLElement | null;
      if (tt) { this.toast(tt.getAttribute('data-toast') || ''); return; }
      if (target.closest('[data-refresh]')) {
        const upd = this.byId('ss-h-updated'); if (upd) upd.textContent = 'just now';
        this.refreshAll();
        this.toast('Sessions refreshed');
        return;
      }
      const rcb = target.closest('.ss-rowcb') as HTMLInputElement | null;
      if (rcb) { this.state.sel[rcb.getAttribute('data-id') || ''] = rcb.checked; this.syncBulk(); this.syncSelAll(); return; }
      const cl = target.closest('[data-close]') as HTMLElement | null;
      if (cl) { cl.closest('.ss-drawer,.ss-modal')?.classList.remove('open'); this.syncBodyLock(); return; }
      if (!target.closest('#ss-menu')) this.closeMenu();
    });

    this.document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        this.closeMenu();
        this.qsa('.ss-drawer.open,.ss-modal.open').forEach((m) => m.classList.remove('open'));
        this.syncBodyLock();
      }
    });
    window.addEventListener('scroll', () => this.closeMenu(), true);
    this.document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'ss-selall') {
        const vis = this.filtered();
        vis.forEach((s) => (this.state.sel[s.id] = (target as HTMLInputElement).checked));
        this.render();
        this.syncBulk();
      }
      if (target.classList.contains('ss-colcb')) {
        this.state.cols[target.getAttribute('data-col') || ''] = (target as HTMLInputElement).checked;
        this.render();
      }
    });

    this.byId('ss-bulk-x')?.addEventListener('click', () => { this.state.sel = {}; this.render(); this.syncBulk(); });
    this.qsa('[data-bulk]').forEach((b) => b.addEventListener('click', () => {
      const act = b.getAttribute('data-bulk') || '';
      const n = this.selCount();
      const ids = Object.keys(this.state.sel).filter((k) => this.state.sel[k]);
      if (act === 'delete') {
        ids.forEach((id) => { const i = this.SESS.findIndex((s) => s.id === id); if (i >= 0) this.SESS.splice(i, 1); });
        this.state.sel = {};
        this.refreshAll();
        this.syncBulk();
        this.toast(`${n} session${n > 1 ? 's' : ''} deleted`);
        return;
      }
      if (act === 'cancel') {
        ids.forEach((id) => { const s = this.SESS.find((x) => x.id === id); if (s) s.status = 'Cancelled'; });
        this.refreshAll();
        this.toast(`${n} session${n > 1 ? 's' : ''} cancelled`);
        return;
      }
      if (act === 'status') {
        ids.forEach((id) => { const s = this.SESS.find((x) => x.id === id); if (s && s.status === 'Scheduled') s.status = 'Completed'; });
        this.render();
        this.renderKPIs();
        this.toast(`${n} marked completed`);
        return;
      }
      const names: Record<string, string> = { assign: 'Doctor assigned to', reschedule: 'Rescheduled', remind: 'Reminders sent for', export: 'Exported' };
      this.toast(`${names[act] || 'Updated'} ${n} session${n > 1 ? 's' : ''}`);
    }));

    // Initial reveal — KPIs, widgets, calendar head/grid, doctor board, and
    // today's timeline already ship as static markup matching this seed
    // data; these calls just keep them in sync for later interactions.
    this.renderCalHead();
    setTimeout(() => {
      this.byId('ss-skeleton')?.classList.add('hidden');
      this.byId('ss-content')?.classList.remove('hidden');
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }
}
