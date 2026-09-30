import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

interface Consultation {
  id: string; pt: string; ptc: string; doc: string; docc: string; dept: string; time: string;
  ctype: string; dur: string; status: string; prio: string; room: string; symptom: string; age: number;
}
interface Doctor { name: string; dept: string; spec: string; c: string; online: number; current: string; next: string; slots: number; rating: number; }
interface Activity { ic: string; c: string; t: string; s: string; tm: string; }
interface Kpi { l: string; v: string; ic: string; c: string; p: number; ch: string; spark: number[]; }


@Component({
  imports: [RouterLink],
  selector: 'app-telemedicine',
  styleUrl: './telemedicine.css',
  templateUrl: './telemedicine.html',
})
export class Telemedicine implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly CTYPE: Record<string, { c: string; ic: string }> = {
    Video: { c: '#6366f1', ic: 'ti-video' },
    Audio: { c: '#0ea5e9', ic: 'ti-phone' },
    Chat: { c: '#10b981', ic: 'ti-message' },
  };
  private readonly STC: Record<string, string> = { Live: '#ef4444', Waiting: '#f59e0b', Scheduled: '#0ea5e9', Completed: '#10b981', Cancelled: '#94a3b8' };
  private readonly PRIO: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  private CONS: Consultation[] = [
    { id: 'VC-9001', pt: 'Ravi Kumar', ptc: '#0ea5e9', doc: 'Dr. Sarah Roberts', docc: '#ef4444', dept: 'Cardiology', time: '10:00 AM', ctype: 'Video', dur: '18 min', status: 'Live', prio: 'High', room: 'Room-A1', symptom: 'Chest tightness, breathlessness', age: 52 },
    { id: 'VC-9002', pt: 'Anita Desai', ptc: '#8b5cf6', doc: 'Dr. Vikram Nair', docc: '#8b5cf6', dept: 'Neurology', time: '10:15 AM', ctype: 'Video', dur: '12 min', status: 'Live', prio: 'Medium', room: 'Room-A2', symptom: 'Recurring migraines', age: 34 },
    { id: 'VC-9003', pt: 'Mohammed Ali', ptc: '#10b981', doc: 'Dr. Meera Iyer', docc: '#f59e0b', dept: 'Pediatrics', time: '10:30 AM', ctype: 'Audio', dur: '—', status: 'Waiting', prio: 'High', room: 'Room-B1', symptom: 'Child fever & rash', age: 6 },
    { id: 'VC-9004', pt: 'Priya Sharma', ptc: '#d946ef', doc: 'Dr. Priya Sharma', docc: '#d946ef', dept: 'Gynecology', time: '10:45 AM', ctype: 'Video', dur: '—', status: 'Waiting', prio: 'Medium', room: 'Room-B2', symptom: 'Routine prenatal check', age: 29 },
    { id: 'VC-9005', pt: 'John Mathew', ptc: '#f43f5e', doc: 'Dr. Karan Malhotra', docc: '#10b981', dept: 'Dermatology', time: '11:00 AM', ctype: 'Video', dur: '—', status: 'Scheduled', prio: 'Low', room: 'Room-C1', symptom: 'Skin allergy follow-up', age: 41 },
    { id: 'VC-9006', pt: 'Sunita Rao', ptc: '#14b8a6', doc: 'Dr. Rajesh Menon', docc: '#ec4899', dept: 'Oncology', time: '11:15 AM', ctype: 'Video', dur: '—', status: 'Scheduled', prio: 'High', room: 'Room-C2', symptom: 'Chemo review', age: 58 },
    { id: 'VC-9007', pt: 'Deepak Nair', ptc: '#6366f1', doc: 'Dr. Fatima Sheikh', docc: '#a855f7', dept: 'Psychiatry', time: '09:00 AM', ctype: 'Video', dur: '40 min', status: 'Completed', prio: 'Medium', room: 'Room-A1', symptom: 'Anxiety management', age: 37 },
    { id: 'VC-9008', pt: 'Meera Iyer', ptc: '#f59e0b', doc: 'Dr. Deepak Nair', docc: '#6366f1', dept: 'Radiology', time: '09:20 AM', ctype: 'Audio', dur: '15 min', status: 'Completed', prio: 'Low', room: 'Room-B1', symptom: 'Report discussion', age: 45 },
    { id: 'VC-9009', pt: 'Arjun Menon', ptc: '#0891b2', doc: 'Dr. Arjun Menon', docc: '#0891b2', dept: 'Nephrology', time: '09:40 AM', ctype: 'Video', dur: '25 min', status: 'Completed', prio: 'Medium', room: 'Room-C1', symptom: 'Dialysis planning', age: 60 },
    { id: 'VC-9010', pt: 'Fatima Sheikh', ptc: '#a855f7', doc: 'Dr. Sunita Rao', docc: '#14b8a6', dept: 'ENT', time: '11:30 AM', ctype: 'Chat', dur: '—', status: 'Scheduled', prio: 'Low', room: 'Room-C3', symptom: 'Ear pain query', age: 26 },
    { id: 'VC-9011', pt: 'Karan Malhotra', ptc: '#10b981', doc: 'Dr. Anita Desai', docc: '#0ea5e9', dept: 'Orthopedics', time: '08:30 AM', ctype: 'Video', dur: '—', status: 'Cancelled', prio: 'Low', room: 'Room-A3', symptom: 'Knee pain', age: 48 },
    { id: 'VC-9012', pt: 'Neha Kapoor', ptc: '#ec4899', doc: 'Dr. Sarah Roberts', docc: '#ef4444', dept: 'Cardiology', time: '11:45 AM', ctype: 'Video', dur: '—', status: 'Waiting', prio: 'Medium', room: 'Room-A1', symptom: 'Palpitations', age: 33 },
  ];

  private readonly DOCS: Doctor[] = [
    { name: 'Dr. Sarah Roberts', dept: 'Cardiology', spec: 'Interventional', c: '#ef4444', online: 1, current: 'VC-9001', next: '11:45 AM', slots: 3, rating: 4.9 },
    { name: 'Dr. Vikram Nair', dept: 'Neurology', spec: 'Stroke Care', c: '#8b5cf6', online: 1, current: 'VC-9002', next: '12:00 PM', slots: 2, rating: 4.8 },
    { name: 'Dr. Meera Iyer', dept: 'Pediatrics', spec: 'Neonatology', c: '#f59e0b', online: 1, current: '', next: '10:30 AM', slots: 5, rating: 4.9 },
    { name: 'Dr. Karan Malhotra', dept: 'Dermatology', spec: 'Cosmetic', c: '#10b981', online: 1, current: '', next: '11:00 AM', slots: 6, rating: 4.7 },
    { name: 'Dr. Fatima Sheikh', dept: 'Psychiatry', spec: 'Behavioral', c: '#a855f7', online: 0, current: '', next: '02:00 PM', slots: 4, rating: 4.8 },
    { name: 'Dr. Rajesh Menon', dept: 'Oncology', spec: 'Medical Onc', c: '#ec4899', online: 1, current: '', next: '11:15 AM', slots: 1, rating: 4.6 },
  ];

  private readonly ACTIVITY: Activity[] = [
    { ic: 'ti-video', c: '#6366f1', t: 'Video consult started — VC-9001', s: 'Dr. Sarah Roberts · Ravi Kumar', tm: '2m ago' },
    { ic: 'ti-calendar-plus', c: '#0ea5e9', t: 'New appointment booked', s: 'Neha Kapoor · Cardiology', tm: '14m ago' },
    { ic: 'ti-circle-check', c: '#10b981', t: 'Session completed — VC-9007', s: '40 min · Psychiatry', tm: '35m ago' },
    { ic: 'ti-repeat', c: '#8b5cf6', t: 'Follow-up booked', s: 'Deepak Nair · in 7 days', tm: '1h ago' },
    { ic: 'ti-prescription', c: '#ec4899', t: 'Prescription generated', s: 'VC-9009 · Dr. Arjun Menon', tm: '2h ago' },
    { ic: 'ti-user-check', c: '#f59e0b', t: 'Dr. Meera Iyer came online', s: 'Pediatrics', tm: '3h ago' },
  ];

  private KPIS: Kpi[] = [
    { l: 'Active Video Consults', v: '6', ic: 'ti-video', c: '#6366f1', p: 60, ch: 'live', spark: [3, 4, 5, 4, 6, 5, 6] },
    { l: 'Scheduled', v: '14', ic: 'ti-calendar-clock', c: '#0ea5e9', p: 70, ch: '+3', spark: [8, 10, 11, 12, 13, 13, 14] },
    { l: 'Doctors Online', v: '18', ic: 'ti-user-check', c: '#10b981', p: 75, ch: 'of 24', spark: [12, 14, 15, 16, 17, 18, 18] },
    { l: 'Waiting Patients', v: '4', ic: 'ti-hourglass', c: '#f59e0b', p: 33, ch: 'avg 6m', spark: [2, 3, 4, 3, 5, 4, 4] },
    { l: 'Completed Today', v: '128', ic: 'ti-circle-check', c: '#059669', p: 85, ch: '+12%', spark: [80, 95, 100, 110, 118, 124, 128] },
    { l: 'Avg. Consult Time', v: '22m', ic: 'ti-clock-hour-4', c: '#ec4899', p: 55, ch: '-2m', spark: [26, 25, 24, 23, 22, 22, 22] },
  ];

  private readonly COLS: [string, string, number][] = [
    ['id', 'ID', 1], ['patient', 'Patient', 1], ['doctor', 'Doctor', 1], ['dept', 'Department', 1],
    ['date', 'Appointment', 1], ['ctype', 'Type', 1], ['dur', 'Duration', 1], ['status', 'Status', 1],
  ];
  private readonly DEPTS = [...new Set(this.CONS.map((c) => c.dept))];
  private readonly DOCTORS = this.DOCS.map((d) => d.name);

  private state = {
    q: '', view: 'grid', filters: { doctor: '', dept: '', ctype: '', status: '', prio: '', date: '', sort: 'time' } as Record<string, string>,
    sel: {} as Record<string, boolean>, cols: {} as Record<string, boolean>,
  };
  private menuCon: string | null = null;

  private readonly ACTIONS: { a?: string; n?: string; ic?: string; video?: number; danger?: number; sep?: number }[] = [
    { a: 'view', n: 'View Consultation', ic: 'ti-eye' }, { a: 'join', n: 'Join Consultation', ic: 'ti-video', video: 1 }, { a: 'edit', n: 'Edit Appointment', ic: 'ti-edit' },
    { a: 'reschedule', n: 'Reschedule', ic: 'ti-calendar' }, { a: 'assign', n: 'Assign Doctor', ic: 'ti-user-plus' },
    { sep: 1 }, { a: 'start', n: 'Start Consultation', ic: 'ti-player-play' }, { a: 'end', n: 'End Consultation', ic: 'ti-player-stop' },
    { a: 'notes', n: 'Add Clinical Notes', ic: 'ti-notes' }, { a: 'rx', n: 'Generate Prescription', ic: 'ti-prescription' }, { a: 'upload', n: 'Upload Documents', ic: 'ti-upload' },
    { sep: 1 }, { a: 'print', n: 'Print Summary', ic: 'ti-printer' }, { a: 'pdf', n: 'Download PDF', ic: 'ti-file-download' }, { a: 'email', n: 'Send Email', ic: 'ti-mail' }, { a: 'sms', n: 'Send SMS', ic: 'ti-message-2' },
    { sep: 1 }, { a: 'archive', n: 'Archive', ic: 'ti-archive' }, { a: 'delete', n: 'Delete', ic: 'ti-trash', danger: 1 },
  ];

  private vcTimer: ReturnType<typeof setInterval> | null = null;
  private vcSec = 0;
  private vcState = { cam: 1, mic: 1, share: 0, record: 0, chat: 1 };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.COLS.forEach((c) => (this.state.cols[c[0]] = true));
  }

  ngAfterViewInit(): void {
    this.wireEvents();
    this.byId('tm-skeleton');
    setTimeout(() => {
      this.byId('tm-skeleton')?.classList.add('hidden');
      this.byId('tm-content')?.classList.remove('hidden');
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
  private ini(n: string): string {
    return n.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  private toast(message: string): void { this.toastService.show(message, 'success'); }
  private detailUrl(c: Consultation): string {
    return 'telemedicine-session-detail.html?' + new URLSearchParams({ id: c.id, patient: c.pt, doctor: c.doc, status: c.status }).toString();
  }

  /* ---------------- Sparkline / KPIs / widgets ---------------- */

  private spark(data: number[], c: string): string {
    const w = 90, h = 26, max = Math.max(...data), min = Math.min(...data), rng = max - min || 1;
    const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 4) - 2).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/><polyline fill="${this.mix(c, 14)}" stroke="none" points="0,${h} ${pts.join(' ')} ${w},${h}"/></svg>`;
  }

  private renderKPIs(): void {
    const wrap = this.byId('tm-kpis');
    if (wrap) {
      wrap.innerHTML = this.KPIS.map(
        (k) =>
          `<div class="tm-kpi" style="--kc:${k.c}"><div class="flex items-start justify-between mb-2"><div class="tm-kpi-ic" style="background:${this.mix(k.c)};color:${k.c}"><i class="ti ${k.ic} text-lg"></i></div><svg viewBox="0 0 36 36" class="tm-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="${k.c}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${k.p}"/></svg></div><div class="tm-kpi-v">${this.esc(k.v)}</div><div class="flex items-center justify-between mt-1"><span class="text-xs tm-muted font-semibold">${this.esc(k.l)}</span><span class="tm-chip" style="background:${this.mix(k.c)};color:${k.c}">${this.esc(k.ch)}</span></div><div class="mt-2 opacity-90">${this.spark(k.spark, k.c)}</div></div>`
      ).join('');
    }
  }

  private renderWidgets(): void {
    const hrs = ['9a', '10a', '11a', '12p', '1p', '2p', '3p'], data = [14, 22, 26, 18, 20, 24, 16], max = Math.max(...data);
    const w = 280, h = 90, pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 10) - 4).toFixed(1)}`);
    const trend = this.byId('tm-w-trend');
    if (trend) trend.innerHTML = `<svg viewBox="0 0 ${w} ${h}" class="w-full" style="height:100px" preserveAspectRatio="none"><defs><linearGradient id="tmg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${this.mix('#6366f1', 35)}"/><stop offset="100%" stop-color="${this.mix('#6366f1', 2)}"/></linearGradient></defs><polyline fill="url(#tmg)" stroke="none" points="0,${h} ${pts.join(' ')} ${w},${h}"/><polyline fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(' ')}"/></svg><div class="flex justify-between mt-1">${hrs.map((x) => `<span class="text-[10px] tm-muted font-semibold">${x}</span>`).join('')}</div>`;

    const online = this.DOCS.filter((d) => d.online).length;
    const avail = this.byId('tm-w-avail');
    if (avail) avail.innerHTML = `<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="tm-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#10b981" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:${Math.round((online / this.DOCS.length) * 100)}"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">${online}/${this.DOCS.length}</div><div class="text-xs tm-muted font-semibold">Doctors online</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#ef4444"></span><span class="tm-muted">In consult</span><b class="text-[var(--color-gray-900)] ml-auto">${this.DOCS.filter((d) => d.current).length}</b></div><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#10b981"></span><span class="tm-muted">Available</span><b class="text-[var(--color-gray-900)] ml-auto">${this.DOCS.filter((d) => d.online && !d.current).length}</b></div></div></div></div>`;

    const sc: Record<string, number> = {};
    this.CONS.forEach((c) => (sc[c.status] = (sc[c.status] || 0) + 1));
    const entries = Object.keys(sc).map((k) => ({ k, n: sc[k], c: this.STC[k] }));
    const tot = this.CONS.length;
    let off = 0, seg = '';
    entries.forEach((x) => { const f = (x.n / tot) * 100; seg += `<circle cx="18" cy="18" r="15.9155" fill="none" stroke="${x.c}" stroke-width="4.4" stroke-dasharray="${f} ${100 - f}" stroke-dashoffset="${-off}"/>`; off += f; });
    const statusEl = this.byId('tm-w-status'); if (statusEl) statusEl.innerHTML = seg + '<circle cx="18" cy="18" r="10" fill="var(--color-white)"/>';
    const legend = this.byId('tm-w-status-legend');
    if (legend) legend.innerHTML = entries.map((x) => `<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full flex-none" style="background:${x.c}"></span><span class="font-semibold text-[var(--color-gray-900)] flex-1">${this.esc(x.k)}</span><span class="tm-muted font-bold">${x.n}</span></div>`).join('');

    const success = this.byId('tm-w-success');
    if (success) success.innerHTML = '<div class="flex items-center gap-4"><svg viewBox="0 0 36 36" class="tm-ring w-24 h-24 flex-none"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.6"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="#6366f1" stroke-width="3.6" stroke-linecap="round" pathLength="100" style="--p:94"/></svg><div><div class="text-2xl font-extrabold text-[var(--color-gray-900)]">94%</div><div class="text-xs tm-muted font-semibold">Success rate</div><div class="mt-2 text-xs space-y-1"><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#10b981"></span><span class="tm-muted">Successful</span><b class="text-[var(--color-gray-900)] ml-auto">120</b></div><div class="flex items-center gap-2"><span class="tm-dotstat" style="background:#ef4444"></span><span class="tm-muted">Dropped</span><b class="text-[var(--color-gray-900)] ml-auto">8</b></div></div></div></div>';

    const dur = [18, 22, 26, 20, 24, 21, 19], maxDur = Math.max(...dur), dl = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const durEl = this.byId('tm-w-duration');
    if (durEl) durEl.innerHTML = dur.map((v, i) => `<div class="flex-1 flex flex-col items-center gap-1 h-full justify-end"><span class="text-[10px] font-bold tm-muted">${v}</span><div class="w-full rounded-t-md" style="height:${Math.round((v / maxDur) * 100)}%;background:linear-gradient(180deg,#6366f1,#0ea5e9)"></div><span class="text-[10px] tm-muted font-semibold">${dl[i]}</span></div>`).join('');

    const stars = [72, 18, 6, 3, 1];
    const sat = this.byId('tm-w-sat');
    if (sat) sat.innerHTML = '<div class="flex items-center gap-3 mb-3"><div class="text-3xl font-extrabold text-[var(--color-gray-900)]">4.8</div><div><div class="text-amber-400 text-sm"><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star"></i><i class="ti ti-star-half"></i></div><div class="text-[11px] tm-muted">2,140 ratings</div></div></div>' + [5, 4, 3, 2, 1].map((s, i) => `<div class="flex items-center gap-2 mb-1"><span class="text-xs font-bold tm-muted w-3">${s}</span><i class="ti ti-star text-amber-400 text-xs"></i><div class="tm-bar flex-1"><span style="width:${stars[i]}%;background:#f59e0b"></span></div><span class="text-xs tm-muted w-8 text-right">${stars[i]}%</span></div>`).join('');
  }

  /* ---------------- Filter ---------------- */

  private filtered(): Consultation[] {
    const f = this.state.filters, q = this.state.q.toLowerCase();
    const arr = this.CONS.filter((c) => {
      if (q && `${c.id} ${c.pt} ${c.doc} ${c.dept}`.toLowerCase().indexOf(q) < 0) return false;
      if (f['doctor'] && c.doc !== f['doctor']) return false;
      if (f['dept'] && c.dept !== f['dept']) return false;
      if (f['ctype'] && c.ctype !== f['ctype']) return false;
      if (f['status'] && c.status !== f['status']) return false;
      if (f['prio'] && c.prio !== f['prio']) return false;
      return true;
    });
    const so: Record<string, number> = { Live: 0, Waiting: 1, Scheduled: 2, Completed: 3, Cancelled: 4 };
    const po: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    arr.sort((a, b) => {
      if (f['sort'] === 'status') return so[a.status] - so[b.status];
      if (f['sort'] === 'prio') return po[a.prio] - po[b.prio];
      if (f['sort'] === 'name') return a.pt.localeCompare(b.pt);
      return a.time.localeCompare(b.time);
    });
    return arr;
  }

  /* ---------------- Grid / list / calendar ---------------- */

  private gridHTML(c: Consultation): string {
    const sc = this.STC[c.status];
    const ct = this.CTYPE[c.ctype] || { c: '#94a3b8', ic: 'ti-video' };
    return (
      `<div class="tm-ccard" style="--cc:${c.ptc}"><div class="p-4">` +
      `<div class="flex items-center justify-between mb-3"><span class="text-xs font-bold text-[var(--color-primary)]">${this.esc(c.id)}</span><div class="flex items-center gap-1.5"><span class="tm-tag" style="background:${this.mix(this.PRIO[c.prio])};color:${this.PRIO[c.prio]}"><i class="ti ti-flag-3" style="font-size:.58rem"></i>${this.esc(c.prio)}</span><button class="tm-btn tm-btn-soft !p-1.5" data-menu="${c.id}"><i class="ti ti-dots-vertical"></i></button></div></div>` +
      `<div class="flex items-center gap-2"><div class="flex -space-x-2"><div class="tm-av" style="background:linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 60)})">${this.esc(this.ini(c.pt))}</div><div class="tm-av" style="background:linear-gradient(135deg,${c.docc},${this.mix(c.docc, 60)})">${this.esc(this.ini(c.doc))}</div></div>` +
      `<div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(c.pt)}</div><div class="text-xs tm-muted truncate">with ${this.esc(c.doc.replace('Dr. ', 'Dr '))}</div></div>` +
      (c.status === 'Live'
        ? `<span class="tm-tag" style="background:${this.mix('#ef4444')};color:#dc2626"><span class="tm-live"></span>LIVE</span>`
        : `<span class="tm-tag" style="background:${this.mix(sc)};color:${sc}"><span class="tm-dotstat" style="background:${sc}"></span>${this.esc(c.status)}</span>`) +
      '</div>' +
      `<div class="grid grid-cols-2 gap-2 mt-3 text-xs"><div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-clock"></i> ${this.esc(c.time)}</div><div class="flex items-center gap-1.5 tm-muted"><i class="ti ${ct.ic}" style="color:${ct.c}"></i> ${this.esc(c.ctype)}</div><div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-building-hospital"></i> ${this.esc(c.dept)}</div><div class="flex items-center gap-1.5 tm-muted"><i class="ti ti-door"></i> ${this.esc(c.room)}</div></div>` +
      `<div class="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border-color)]">` +
      (c.status === 'Live' || c.status === 'Waiting' || c.status === 'Scheduled'
        ? `<button class="tm-btn tm-btn-video flex-1 !py-1.5 text-xs" data-join="${c.id}"><i class="ti ti-video"></i> ${c.status === 'Live' ? 'Join' : 'Start'}</button>`
        : `<a class="tm-btn tm-btn-soft flex-1 !py-1.5 text-xs" href="${this.detailUrl(c)}"><i class="ti ti-eye"></i> View</a>`) +
      `<button class="tm-btn tm-btn-soft !p-2" data-open="${c.id}"><i class="ti ti-info-circle"></i></button>` +
      '</div></div></div>'
    );
  }

  private td(col: string, html: string): string { return `<td class="${this.state.cols[col] ? '' : 'tm-hidecol'}">${html}</td>`; }

  private renderList(arr: Consultation[]): void {
    const wrap = this.byId('tm-tbody');
    if (wrap) {
      wrap.innerHTML = arr
        .map((c) => {
          const sc = this.STC[c.status];
          const ct = this.CTYPE[c.ctype] || { c: '#94a3b8', ic: '' };
          return (
            `<tr data-row="${c.id}"><td><input type="checkbox" class="tm-cb tm-rowcb" data-id="${c.id}"${this.state.sel[c.id] ? ' checked' : ''}></td>` +
            this.td('id', `<a class="font-bold text-[var(--color-primary)] hover:underline" href="${this.detailUrl(c)}">${this.esc(c.id)}</a>`) +
            this.td('patient', `<div class="flex items-center gap-2.5"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 60)})">${this.esc(this.ini(c.pt))}</div><span class="font-bold text-[var(--color-gray-900)]">${this.esc(c.pt)}</span></div>`) +
            this.td('doctor', `<span class="tm-muted">${this.esc(c.doc)}</span>`) +
            this.td('dept', `<span class="tm-muted">${this.esc(c.dept)}</span>`) +
            this.td('date', `<span class="tm-muted whitespace-nowrap">${this.esc(c.time)}</span>`) +
            this.td('ctype', `<span class="tm-tag" style="background:${this.mix(ct.c)};color:${ct.c}">${this.esc(c.ctype)}</span>`) +
            this.td('dur', `<span class="tm-muted">${this.esc(c.dur)}</span>`) +
            this.td('status', c.status === 'Live' ? `<span class="tm-tag" style="background:${this.mix('#ef4444')};color:#dc2626"><span class="tm-live"></span>LIVE</span>` : `<span class="tm-tag" style="background:${this.mix(sc)};color:${sc}"><span class="tm-dotstat" style="background:${sc}"></span>${this.esc(c.status)}</span>`) +
            `<td><button class="tm-btn tm-btn-soft !p-1.5" data-menu="${c.id}"><i class="ti ti-dots-vertical"></i></button></td></tr>`
          );
        })
        .join('');
    }
    this.qsa('#tm-tabletag th[data-col]').forEach((th) => th.classList.toggle('tm-hidecol', !this.state.cols[th.getAttribute('data-col') || '']));
    this.syncSelAll();
  }

  private renderCalendar(arr: Consultation[]): void {
    const wrap = this.byId('tm-calendar');
    if (!wrap) return;
    wrap.innerHTML = [...arr]
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((c) => {
        const sc = this.STC[c.status];
        const ct = this.CTYPE[c.ctype] || { c: '#94a3b8', ic: 'ti-video' };
        const [tt, ap] = c.time.split(' ');
        return `<div class="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-color)] hover:border-[var(--color-primary)] transition cursor-pointer" data-open="${c.id}"><div class="text-center flex-none w-16"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(tt)}</div><div class="text-[10px] tm-muted font-semibold">${this.esc(ap || '')}</div></div><div class="w-1 h-10 rounded-full" style="background:${ct.c}"></div><div class="flex -space-x-2 flex-none"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 60)})">${this.esc(this.ini(c.pt))}</div><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,${c.docc},${this.mix(c.docc, 60)})">${this.esc(this.ini(c.doc))}</div></div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(c.pt)} · ${this.esc(c.dept)}</div><div class="text-xs tm-muted truncate">${this.esc(c.doc)} · ${this.esc(c.ctype)}</div></div>${c.status === 'Live' ? `<span class="tm-tag" style="background:${this.mix('#ef4444')};color:#dc2626"><span class="tm-live"></span>LIVE</span>` : `<span class="tm-tag" style="background:${this.mix(sc)};color:${sc}">${this.esc(c.status)}</span>`}</div>`;
      })
      .join('');
  }

  /* ---------------- Boards ---------------- */

  private renderBoards(): void {
    const wait = this.CONS.filter((c) => c.status === 'Waiting');
    const n = this.byId('tm-wait-n'); if (n) n.textContent = `${wait.length} waiting`;
    const waitEl = this.byId('tm-waiting');
    if (waitEl) {
      waitEl.innerHTML =
        wait
          .map((c, i) => {
            const mins = [6, 4, 9, 3][i % 4];
            return `<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 60)})">${this.esc(this.ini(c.pt))}</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(c.pt)}</div><div class="text-[11px] tm-muted truncate">${this.esc(c.time)} · ${this.esc(c.dept)}</div></div><div class="text-right flex-none"><span class="tm-tag" style="background:${this.mix(this.PRIO[c.prio])};color:${this.PRIO[c.prio]}">${mins}m</span><button class="tm-btn tm-btn-video !p-1.5 mt-1 block ml-auto" data-join="${c.id}"><i class="ti ti-video text-xs"></i></button></div></div>`;
          })
          .join('') || '<p class="text-sm tm-muted text-center py-3">No patients waiting.</p>';
    }
    const act = this.byId('tm-activity');
    if (act) {
      act.innerHTML = this.ACTIVITY.map(
        (a, i) =>
          `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:${this.mix(a.c)};color:${a.c}"><i class="ti ${a.ic} text-sm"></i></div>${i < this.ACTIVITY.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="min-w-0 pb-3"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(a.t)}</div><div class="text-[11px] tm-muted">${this.esc(a.s)}</div><div class="text-[10px] tm-muted mt-.5">${this.esc(a.tm)}</div></div></div>`
      ).join('');
    }
  }

  /* ---------------- Render dispatch ---------------- */

  private render(): void {
    const arr = this.filtered();
    ['grid', 'list', 'calendar'].forEach((v) => this.byId(`tm-view-${v}`)?.classList.toggle('hidden', this.state.view !== v));
    this.byId('tm-empty')?.classList.toggle('hidden', arr.length > 0);
    if (this.state.view === 'grid') { const g = this.byId('tm-grid'); if (g) g.innerHTML = arr.map((c) => this.gridHTML(c)).join(''); }
    else if (this.state.view === 'list') this.renderList(arr);
    else this.renderCalendar(arr);
  }

  private refreshAll(): void {
    this.render();
    this.renderKPIs();
    this.renderWidgets();
    this.renderBoards();
    this.animateRings();
  }

  private animateRings(): void {
    this.qsa('.tm-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }

  /* ---------------- Body scroll lock ---------------- */

  private syncBodyLock(): void {
    this.document.body.style.overflow = this.qs('.tm-drawer.open') || this.qs('.tm-modal.open') || this.byId('tm-vc')?.classList.contains('open') ? 'hidden' : '';
  }

  /* ---------------- Video workspace ---------------- */

  private openVC(cons?: Consultation): void {
    const c = cons || this.CONS.find((x) => x.status === 'Live') || this.CONS[0];
    const title = this.byId('tm-vc-title'); if (title) title.textContent = `${c.ctype || 'Video'} Consultation · ${c.id}`;
    const sub = this.byId('tm-vc-sub'); if (sub) sub.textContent = `${c.dept} · ${c.room}`;
    const docName = this.byId('tm-vc-doctorname'); if (docName) docName.innerHTML = `<i class="ti ti-stethoscope"></i> ${this.esc(c.doc)}`;
    const ptLabel = this.byId('tm-vc-patientlabel'); if (ptLabel) ptLabel.innerHTML = `<i class="ti ti-user"></i> ${this.esc(c.pt)}`;
    const bigav = this.byId('tm-vc-bigav');
    if (bigav) { bigav.textContent = this.ini(c.pt); bigav.style.background = `linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 60)})`; }
    this.vcSec = 0;
    this.vcState = { cam: 1, mic: 1, share: 0, record: 0, chat: 1 };
    this.syncVCctrls();
    this.byId('tm-vc')?.classList.add('open');
    this.syncBodyLock();
    if (this.vcTimer) clearInterval(this.vcTimer);
    this.vcTimer = setInterval(() => {
      this.vcSec++;
      const m = Math.floor(this.vcSec / 60), s = this.vcSec % 60;
      const timer = this.byId('tm-vc-timer');
      if (timer) timer.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }, 1000);
    const net = this.byId('tm-vc-net');
    if (net) net.innerHTML = [8, 11, 14, 17].map((h, i) => `<span style="height:${h}px;background:${i < 3 ? '#34d399' : '#94a3b8'}"></span>`).join('');
  }

  private closeVC(): void {
    this.byId('tm-vc')?.classList.remove('open');
    this.syncBodyLock();
    if (this.vcTimer) { clearInterval(this.vcTimer); this.vcTimer = null; }
  }

  private syncVCctrls(): void {
    this.qsa('[data-vcctrl]').forEach((b) => {
      const k = b.getAttribute('data-vcctrl');
      const ic = b.querySelector('i');
      if (k === 'cam') { b.classList.toggle('off', !this.vcState.cam); if (ic) ic.className = `ti ${this.vcState.cam ? 'ti-video' : 'ti-video-off'}`; }
      if (k === 'mic') { b.classList.toggle('off', !this.vcState.mic); if (ic) ic.className = `ti ${this.vcState.mic ? 'ti-microphone' : 'ti-microphone-off'}`; }
      if (k === 'share') b.classList.toggle('off', !!this.vcState.share);
      if (k === 'record') b.classList.toggle('off', !!this.vcState.record);
    });
    const camoff = this.byId('tm-vc-camoff'); if (camoff) camoff.style.display = this.vcState.cam ? 'none' : 'flex';
    const pip = this.byId('tm-vc-pip'); if (pip) pip.style.display = this.vcState.cam ? 'flex' : 'none';
    const sharing = this.byId('tm-vc-sharing'); if (sharing) sharing.style.display = this.vcState.share ? 'inline-flex' : 'none';
    this.byId('tm-vc-side')?.classList.toggle('show', !!this.vcState.chat);
    this.byId('tm-vc-mainwrap')?.classList.toggle('with-side', !!this.vcState.chat);
  }

  private sendMsg(): void {
    const inp = this.byId('tm-vc-msgin') as HTMLInputElement | null;
    if (!inp || !inp.value.trim()) return;
    const panel = this.byId('tm-vc-chatpanel');
    if (panel) {
      const d = this.document.createElement('div');
      d.className = 'tm-chatmsg';
      d.style.cssText = 'background:#6366f1;color:#fff;margin-left:auto';
      d.textContent = inp.value;
      panel.appendChild(d);
      panel.scrollTop = panel.scrollHeight;
    }
    inp.value = '';
  }

  private wireVC(): void {
    this.qsa('[data-vcctrl]').forEach((b) => b.addEventListener('click', () => {
      const k = b.getAttribute('data-vcctrl');
      if (k === 'end') { this.closeVC(); this.toast('Consultation ended'); return; }
      if (k === 'cam') this.vcState.cam ^= 1;
      if (k === 'mic') { this.vcState.mic ^= 1; this.toast(this.vcState.mic ? 'Microphone on' : 'Microphone muted'); }
      if (k === 'share') { this.vcState.share ^= 1; this.toast(this.vcState.share ? 'Screen sharing started' : 'Screen sharing stopped'); }
      if (k === 'record') { this.vcState.record ^= 1; this.toast(this.vcState.record ? 'Recording started' : 'Recording stopped'); }
      if (k === 'chat') this.vcState.chat ^= 1;
      if (k === 'speaker') this.toast('Speaker settings');
      if (k === 'invite') this.toast('Invite link copied');
      this.syncVCctrls();
    }));
    this.byId('tm-vc-min')?.addEventListener('click', () => { this.closeVC(); this.toast('Consultation minimized'); });
    this.qsa('.tm-vc-tab').forEach((t) => t.addEventListener('click', () => {
      const k = t.getAttribute('data-vctab');
      this.qsa('.tm-vc-tab').forEach((x) => { const on = x === t; x.style.borderBottom = on ? '2px solid #6366f1' : 'none'; x.style.color = on ? '#fff' : 'rgba(255,255,255,.5)'; });
      this.byId('tm-vc-chatpanel')?.classList.toggle('hidden', k !== 'chat');
      this.byId('tm-vc-chatinput')?.classList.toggle('hidden', k !== 'chat');
      this.byId('tm-vc-notespanel')?.classList.toggle('hidden', k !== 'notes');
    }));
    this.byId('tm-vc-send')?.addEventListener('click', () => this.sendMsg());
    this.byId('tm-vc-msgin')?.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') this.sendMsg(); });
  }

  /* ---------------- Action menu ---------------- */

  private openMenu(id: string, x: number, y: number): void {
    this.menuCon = id;
    const m = this.byId('tm-menu');
    if (!m) return;
    m.innerHTML = this.ACTIONS.map((a) => (a.sep ? '<div class="tm-sep"></div>' : `<div class="tm-mi${a.danger ? ' danger' : a.video ? ' video' : ''}" data-act="${a.a}"><i class="ti ${a.ic}"></i>${this.esc(a.n)}</div>`)).join('');
    m.classList.add('open');
    const h = Math.min(m.scrollHeight, window.innerHeight * 0.7);
    m.style.left = Math.max(8, Math.min(x, window.innerWidth - 214)) + 'px';
    m.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
  }
  private closeMenu(): void { this.byId('tm-menu')?.classList.remove('open'); this.menuCon = null; }
  private doAction(act: string): void {
    const c = this.CONS.find((x) => x.id === this.menuCon);
    if (act === 'view') { this.closeMenu(); this.openDrawer(this.menuCon || ''); return; }
    if (act === 'join' || act === 'start') { this.closeMenu(); this.openVC(c); return; }
    if (act === 'edit' || act === 'reschedule') { this.closeMenu(); this.openModal('edit', c); return; }
    if (act === 'assign') { this.closeMenu(); this.openModal('assign', c); return; }
    if (act === 'upload') { this.closeMenu(); this.openModal('upload', c); return; }
    if (act === 'delete') { this.closeMenu(); this.openModal('delete', c); return; }
    const msgs: Record<string, string> = { end: 'Consultation ended', notes: 'Clinical notes added', rx: 'Prescription generated', print: 'Summary printed', pdf: 'PDF downloaded', email: 'Email sent', sms: 'SMS sent', archive: 'Consultation archived' };
    this.toast((msgs[act] || 'Action') + (c ? ` — ${c.id}` : ''));
    this.closeMenu();
  }

  /* ---------------- Drawer ---------------- */

  private openDrawer(id: string): void {
    const c = this.CONS.find((x) => x.id === id);
    if (!c) return;
    const prev = [{ d: 'Jun 28', s: 'Follow-up · resolved' }, { d: 'May 12', s: 'Initial consult' }];
    const tl = [
      { n: 'Appointment booked', tm: 'Today, 08:30', done: 1 },
      { n: 'Doctor assigned', tm: 'Today, 08:35', done: 1 },
      { n: 'Patient checked in', tm: `Today, ${c.time}`, done: 1 },
      { n: c.status === 'Live' ? 'Consultation started' : 'Waiting room', tm: c.status === 'Live' ? 'Now' : '—', done: c.status === 'Live' || c.status === 'Completed' ? 1 : 0 },
    ];
    const body = this.byId('tm-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,${c.ptc},${this.mix(c.ptc, 55)})">` +
        `<div class="flex items-center justify-between"><button class="tm-btn tm-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="tm-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)">${c.status === 'Live' ? '<span class="tm-live"></span>LIVE' : `<span class="tm-dotstat" style="background:#fff"></span>${this.esc(c.status)}`}</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-extrabold">${this.esc(this.ini(c.pt))}</div><div><h2 class="text-xl font-extrabold">${this.esc(c.pt)}</h2><p class="text-white/80 text-sm">${this.esc(c.age)} yrs · ${this.esc(c.dept)}</p><p class="text-white/70 text-xs mt-.5">${this.esc(c.id)} · ${this.esc(c.room)}</p></div></div>` +
        '</div>' +
        '<div class="p-5 space-y-5">' +
        (c.status === 'Live' || c.status === 'Waiting' || c.status === 'Scheduled'
          ? `<button class="tm-btn tm-btn-video w-full" data-join="${c.id}"><i class="ti ti-video"></i> ${c.status === 'Live' ? 'Join Live Consultation' : 'Start Consultation'}</button>`
          : '') +
        `<div class="grid grid-cols-2 gap-2.5"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs tm-muted font-semibold mb-1">Doctor</div><div class="flex items-center gap-2"><div class="tm-av tm-av-sm" style="background:linear-gradient(135deg,${c.docc},${this.mix(c.docc, 60)})">${this.esc(this.ini(c.doc))}</div><span class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(c.doc.replace('Dr. ', 'Dr '))}</span></div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-xs tm-muted font-semibold mb-1">Appointment</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(c.time)}</div><div class="text-[11px] tm-muted">${this.esc(c.ctype)} · ${this.esc(c.dur)}</div></div></div>` +
        `<div><div class="text-xs tm-muted font-semibold mb-1.5">Current Symptoms</div><p class="text-sm tm-muted p-3 rounded-lg bg-[var(--color-gray-100)]">${this.esc(c.symptom)}</p></div>` +
        '<div><div class="text-xs tm-muted font-semibold mb-1.5">Medical History</div><div class="flex flex-wrap gap-1.5"><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Hypertension</span><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Allergy: Penicillin</span><span class="tm-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)">Non-smoker</span></div></div>' +
        '<div><div class="text-xs tm-muted font-semibold mb-2">Uploaded Documents</div><div class="space-y-1.5"><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">lab-report.pdf</span><button class="tm-btn tm-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div><div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-photo text-sky-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">xray-chest.jpg</span><button class="tm-btn tm-btn-soft !p-1.5" data-toast="Downloading"><i class="ti ti-download"></i></button></div></div></div>' +
        `<div><div class="text-xs tm-muted font-semibold mb-2">Previous Consultations</div><div class="space-y-1.5">${prev.map((p) => `<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-history tm-muted"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1">${this.esc(p.s)}</span><span class="text-[11px] tm-muted">${this.esc(p.d)}</span></div>`).join('')}</div></div>` +
        `<div><div class="text-xs tm-muted font-semibold mb-2">Timeline</div><div class="space-y-2.5">${tl
          .map((h, i) => `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:${this.mix(h.done ? '#10b981' : '#94a3b8')};color:${h.done ? '#10b981' : '#94a3b8'}"><i class="ti ${h.done ? 'ti-check' : 'ti-clock'} text-xs"></i></div>${i < tl.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(h.n)}</div><div class="text-[11px] tm-muted">${this.esc(h.tm)}</div></div></div>`)
          .join('')}</div></div>` +
        '<div class="grid grid-cols-2 gap-2 pt-1"><button class="tm-btn tm-btn-soft" data-toast="Prescription generated"><i class="ti ti-prescription"></i> Prescribe</button><button class="tm-btn tm-btn-soft" data-modal="edit"><i class="ti ti-edit"></i> Edit</button><button class="tm-btn tm-btn-soft" data-toast="Summary printed"><i class="ti ti-printer"></i> Print</button><button class="tm-btn tm-btn-soft" data-toast="Email sent"><i class="ti ti-mail"></i> Email</button></div>' +
        '</div>';
    }
    this.byId('tm-drawer')?.classList.add('open');
    this.syncBodyLock();
  }

  /* ---------------- Modals ---------------- */

  private fld(label: string, inner: string): string { return `<div><label class="tm-lbl">${label}</label>${inner}</div>`; }
  private selDoc(v?: string): string { return `<select class="tm-inp">${this.DOCTORS.map((d) => `<option${v === d ? ' selected' : ''}>${this.esc(d)}</option>`).join('')}</select>`; }

  private readonly MODALS: Record<string, { t: string; ic: string; danger?: number; cta: string; body: (c?: Consultation) => string }> = {
    schedule: {
      t: 'Schedule Consultation', ic: 'ti-calendar-plus', cta: 'Schedule Consultation',
      body: () =>
        `<div class="space-y-3">${this.fld('Patient', '<input class="tm-inp" placeholder="Patient name">')}${this.fld('Doctor', this.selDoc())}<div class="grid grid-cols-2 gap-3">${this.fld('Date', '<input type="text" placeholder="dd-mm-yyyy" class="tm-inp" data-provider="flatpickr" data-date-format="d-m-Y">')}${this.fld('Time', '<input type="text" placeholder="--:-- --" class="tm-inp" data-provider="timepickr" data-default-time="10:00">')}</div><div class="grid grid-cols-2 gap-3">${this.fld('Type', '<select class="tm-inp"><option>Video</option><option>Audio</option><option>Chat</option></select>')}${this.fld('Priority', '<select class="tm-inp"><option>Low</option><option>Medium</option><option>High</option></select>')}</div>${this.fld('Reason / Symptoms', '<textarea class="tm-inp" rows="2"></textarea>')}</div>`,
    },
    edit: {
      t: 'Edit Appointment', ic: 'ti-edit', cta: 'Save Changes',
      body: (c) =>
        `<div class="space-y-3">${this.fld('Patient', `<input class="tm-inp" value="${c ? this.esc(c.pt) : ''}">`)}${this.fld('Doctor', this.selDoc(c?.doc))}<div class="grid grid-cols-2 gap-3">${this.fld('Time', '<input type="text" placeholder="--:-- --" class="tm-inp" data-provider="timepickr" data-default-time="10:00">')}${this.fld('Type', '<select class="tm-inp"><option>Video</option><option>Audio</option><option>Chat</option></select>')}</div>${this.fld('Status', '<select class="tm-inp"><option>Scheduled</option><option>Waiting</option><option>Live</option><option>Completed</option><option>Cancelled</option></select>')}</div>`,
    },
    assign: {
      t: 'Assign Doctor', ic: 'ti-user-plus', cta: 'Assign Doctor',
      body: (c) => `<div class="space-y-3">${this.fld('Consultation', `<input class="tm-inp" value="${c ? this.esc(c.id + ' — ' + c.pt) : ''}" readonly>`)}${this.fld('Assign To', this.selDoc())}${this.fld('Note', '<input class="tm-inp" placeholder="Optional">')}</div>`,
    },
    invite: {
      t: 'Invite Patient', ic: 'ti-user-plus', cta: 'Send Invite',
      body: () =>
        `<div class="space-y-3">${this.fld('Patient Name', '<input class="tm-inp" placeholder="Full name">')}<div class="grid grid-cols-2 gap-3">${this.fld('Email', '<input class="tm-inp" type="email" placeholder="email@example.com">')}${this.fld('Mobile', '<input class="tm-inp" placeholder="+91...">')}</div>${this.fld('Consultation Link', '<div class="flex gap-2"><input class="tm-inp" value="https://dreamshms.care/vc/9013" readonly><button class="tm-btn tm-btn-soft" data-toast="Link copied"><i class="ti ti-copy"></i></button></div>')}${this.fld('Send Via', '<select class="tm-inp"><option>Email + SMS</option><option>Email only</option><option>SMS only</option></select>')}</div>`,
    },
    upload: {
      t: 'Upload Documents', ic: 'ti-upload', cta: 'Upload',
      body: () => '<div class="space-y-3"><div class="tm-drop" id="tm-dropzone"><i class="ti ti-cloud-upload text-3xl tm-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop reports, images or PDFs</p><p class="text-xs tm-muted">or click to browse</p><input type="file" class="hidden" id="tm-file"></div><div class="text-xs tm-muted" id="tm-upload-sum"></div></div>',
    },
    import: {
      t: 'Import Appointments', ic: 'ti-upload', cta: 'Start Import',
      body: () =>
        `<div class="space-y-3"><div class="tm-drop" id="tm-dropzone"><i class="ti ti-cloud-upload text-3xl tm-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Appointment Import</p><p class="text-xs tm-muted">or click to browse files</p><input type="file" class="hidden" id="tm-file"></div><button class="tm-btn tm-btn-soft w-full" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button><div class="p-3 rounded-lg" style="background:${this.mix('#6366f1', 8)}"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs tm-muted" id="tm-import-sum">No file selected yet.</div></div></div>`,
    },
    export: {
      t: 'Export Consultations', ic: 'ti-download', cta: 'Export Now',
      body: () => {
        const opts: [string, string][] = [['CSV', 'ti-file-text'], ['Excel', 'ti-file-spreadsheet'], ['PDF', 'ti-file-typography'], ['Print', 'ti-printer']];
        return `<div class="space-y-4"><div><div class="tm-lbl">Format</div><div class="grid grid-cols-2 gap-2">${opts.map((o, i) => `<button class="tm-btn tm-btn-soft justify-start tm-expfmt${i === 0 ? ' !border-[var(--color-primary)]' : ''}" data-fmt="${o[0]}"><i class="ti ${o[1]}"></i> ${o[0]}</button>`).join('')}</div></div><div><div class="tm-lbl">Scope</div><select class="tm-inp"><option>Consultation Report</option><option>Department Report</option><option>Selected Records</option><option>All Records</option></select></div></div>`;
      },
    },
    print: {
      t: 'Print Report', ic: 'ti-printer', cta: 'Print',
      body: () => `<div class="space-y-3">${this.fld('Report', "<select class=\"tm-inp\"><option>Today's consultations</option><option>By doctor</option><option>By department</option></select>")}${this.fld('Include', '<select class="tm-inp"><option>All fields</option><option>Summary only</option></select>')}</div>`,
    },
    delete: {
      t: 'Delete Confirmation', ic: 'ti-trash', danger: 1, cta: 'Delete',
      body: (c) => `<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete ${c ? this.esc(c.id) : 'selected consultations'}?</p><p class="text-sm tm-muted mt-1">This consultation record will be permanently removed.</p></div>`,
    },
  };

  private openModal(key: string, c?: Consultation): void {
    const m = this.MODALS[key];
    if (!m) return;
    const danger = m.danger;
    const dialog = this.byId('tm-dialog');
    if (dialog) {
      dialog.innerHTML = `<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti ${m.ic}" style="color:${danger ? '#ef4444' : 'var(--color-primary)'}"></i> ${this.esc(m.t)}</h3><button class="tm-btn tm-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>${m.body(c)}<div class="flex justify-end gap-2 mt-5"><button class="tm-btn tm-btn-soft" data-close>Cancel</button><button class="tm-btn ${danger ? 'tm-btn-soft !bg-rose-500 !text-white' : 'tm-btn-primary'}" id="tm-modal-ok"><i class="ti ${danger ? 'ti-trash' : 'ti-check'}"></i> ${this.esc(m.cta)}</button></div></div>`;
    }
    this.byId('tm-modal')?.classList.add('open');
    this.syncBodyLock();

    this.byId('tm-modal-ok')?.addEventListener('click', () => {
      this.byId('tm-modal')?.classList.remove('open');
      this.syncBodyLock();
      if (key === 'delete' && c) { const i = this.CONS.indexOf(c); if (i >= 0) this.CONS.splice(i, 1); this.refreshAll(); }
      this.toast(`${m.t} completed`);
    });

    const dz = this.byId('tm-dropzone');
    if (dz) {
      dz.addEventListener('click', () => (this.byId('tm-file') as HTMLInputElement | null)?.click());
      const fi = this.byId('tm-file') as HTMLInputElement | null;
      fi?.addEventListener('change', () => {
        if (fi.files?.[0]) {
          const el = this.byId('tm-import-sum') || this.byId('tm-upload-sum');
          if (el) el.innerHTML = `<b class="text-[var(--color-gray-900)]">${this.esc(fi.files[0].name)}</b> ready${this.byId('tm-import-sum') ? ' · 20 rows · 0 errors' : ''}`;
        }
      });
      ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    }
    this.qsa('.tm-expfmt').forEach((b) => b.addEventListener('click', () => { this.qsa('.tm-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]')); b.classList.add('!border-[var(--color-primary)]'); }));
  }

  /* ---------------- Selection / bulk ---------------- */

  private selCount(): number { return Object.keys(this.state.sel).filter((k) => this.state.sel[k]).length; }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('tm-bulk-n'); if (el) el.textContent = String(n);
    this.byId('tm-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('tm-selall') as HTMLInputElement | null;
    if (!sa) return;
    const vis = this.filtered();
    sa.checked = vis.length > 0 && vis.every((c) => this.state.sel[c.id]);
  }
  private updateFilterCount(): void {
    const n = Object.keys(this.state.filters).filter((k) => k !== 'sort' && this.state.filters[k]).length;
    const el = this.byId('tm-filter-n');
    if (el) { el.textContent = String(n); el.classList.toggle('hidden', n === 0); }
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.wireVC();

    (this.byId('tm-search') as HTMLInputElement | null)?.addEventListener('input', (e) => { this.state.q = (e.target as HTMLInputElement).value; this.render(); });
    this.byId('tm-filter-toggle')?.addEventListener('click', () => this.byId('tm-filters')?.classList.toggle('hidden'));
    this.byId('tm-cols-toggle')?.addEventListener('click', () => this.byId('tm-cols')?.classList.toggle('hidden'));
    this.byId('tm-view')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') || 'grid';
      this.qsa('.tm-segb', this.byId('tm-view') as HTMLElement).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.qsa('[data-f]').forEach((sel) => sel.addEventListener('change', () => {
      this.state.filters[sel.getAttribute('data-f') || ''] = (sel as HTMLSelectElement).value;
      this.updateFilterCount();
      this.render();
    }));
    this.byId('tm-clear')?.addEventListener('click', () => {
      Object.keys(this.state.filters).forEach((k) => { if (k !== 'sort') this.state.filters[k] = ''; });
      this.qsa('[data-f]').forEach((s) => { if (s.getAttribute('data-f') !== 'sort') (s as HTMLSelectElement).value = ''; });
      this.updateFilterCount();
      this.render();
      this.toast('Filters cleared');
    });

    this.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-startvc]')) { this.openVC(); return; }
      const jn = target.closest('[data-join]') as HTMLElement | null;
      if (jn) { this.openVC(this.CONS.find((x) => x.id === jn.getAttribute('data-join'))); return; }
      const mo = target.closest('[data-modal]') as HTMLElement | null;
      if (mo) { this.openModal(mo.getAttribute('data-modal') || ''); return; }
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) { this.openDrawer(op.getAttribute('data-open') || ''); return; }
      const mb = target.closest('[data-menu]') as HTMLElement | null;
      if (mb) { const rc = mb.getBoundingClientRect(); this.openMenu(mb.getAttribute('data-menu') || '', rc.right - 212, rc.bottom + 4); e.stopPropagation(); return; }
      const ai = target.closest('[data-act]') as HTMLElement | null;
      if (ai) { this.doAction(ai.getAttribute('data-act') || ''); return; }
      const tt = target.closest('[data-toast]') as HTMLElement | null;
      if (tt) { this.toast(tt.getAttribute('data-toast') || ''); return; }
      if (target.closest('[data-refresh]')) {
        const upd = this.byId('tm-h-updated'); if (upd) upd.textContent = 'just now';
        this.refreshAll();
        this.toast('Consultations refreshed');
        return;
      }
      const rcb = target.closest('.tm-rowcb') as HTMLInputElement | null;
      if (rcb) { this.state.sel[rcb.getAttribute('data-id') || ''] = rcb.checked; this.syncBulk(); this.syncSelAll(); return; }
      const cl = target.closest('[data-close]') as HTMLElement | null;
      if (cl) { cl.closest('.tm-drawer,.tm-modal')?.classList.remove('open'); this.syncBodyLock(); return; }
      if (!target.closest('#tm-menu')) this.closeMenu();
    });

    this.document.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        this.closeMenu();
        this.qsa('.tm-drawer.open,.tm-modal.open').forEach((m) => m.classList.remove('open'));
        this.syncBodyLock();
        if (this.byId('tm-vc')?.classList.contains('open')) this.closeVC();
      }
    });
    window.addEventListener('scroll', () => this.closeMenu(), true);
    this.document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.id === 'tm-selall') {
        const vis = this.filtered();
        vis.forEach((c) => (this.state.sel[c.id] = (target as HTMLInputElement).checked));
        this.render();
        this.syncBulk();
      }
      if (target.classList.contains('tm-colcb')) {
        this.state.cols[target.getAttribute('data-col') || ''] = (target as HTMLInputElement).checked;
        this.render();
      }
    });

    this.byId('tm-bulk-x')?.addEventListener('click', () => { this.state.sel = {}; this.render(); this.syncBulk(); });
    this.qsa('[data-bulk]').forEach((b) => b.addEventListener('click', () => {
      const act = b.getAttribute('data-bulk') || '';
      const n = this.selCount();
      const ids = Object.keys(this.state.sel).filter((k) => this.state.sel[k]);
      if (act === 'delete') {
        ids.forEach((id) => { const i = this.CONS.findIndex((c) => c.id === id); if (i >= 0) this.CONS.splice(i, 1); });
        this.state.sel = {};
        this.refreshAll();
        this.syncBulk();
        this.toast(`${n} consultation${n > 1 ? 's' : ''} deleted`);
        return;
      }
      if (act === 'status') {
        ids.forEach((id) => { const c = this.CONS.find((x) => x.id === id); if (c && c.status !== 'Live') c.status = 'Completed'; });
        this.render();
        this.toast(`${n} marked completed`);
        return;
      }
      const names: Record<string, string> = { assign: 'Doctor assigned to', reschedule: 'Rescheduled', notify: 'Notifications sent to', export: 'Exported' };
      this.toast(`${names[act] || 'Updated'} ${n} consultation${n > 1 ? 's' : ''}`);
    }));
  }
}
