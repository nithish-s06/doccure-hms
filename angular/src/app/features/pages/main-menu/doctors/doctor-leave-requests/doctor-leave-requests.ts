import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface LeaveType {
  c: string;
  ic: string;
}

interface LeaveRequest {
  id: string;
  name: string;
  dept: string;
  spec: string;
  c: string;
  photo: string;
  type: string;
  start: string;
  end: string;
  days: number;
  reason: string;
  cov: string;
  covDoc: string;
  status: string;
  prio: string;
  docs: number;
}

interface PoolDoc {
  name: string;
  dept: string;
  c: string;
  free: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "doctor-leave-requests".
 * KPIs, widgets, coverage tools, replacement-doctor pool and the default
 * (unfiltered, List view) request table ship as static markup matching this
 * seed data; this wires search/filter/sort/view changes, the kanban drag &
 * drop, action menu, drawer, modals, selection/bulk actions and the reveal.
 */
@Component({
  imports: [],
  selector: 'app-doctor-leave-requests',
  styleUrl: './doctor-leave-requests.css',
  templateUrl: './doctor-leave-requests.html',
})
export class DoctorLeaveRequests implements AfterViewInit {
  private readonly TYPES: Record<string, LeaveType> = {
    'Annual Leave': { c: '#0ea5e9', ic: 'ti-beach' },
    'Sick Leave': { c: '#ef4444', ic: 'ti-vaccine' },
    Conference: { c: '#8b5cf6', ic: 'ti-presentation' },
    Maternity: { c: '#ec4899', ic: 'ti-baby-carriage' },
    Emergency: { c: '#f43f5e', ic: 'ti-urgent' },
    Casual: { c: '#10b981', ic: 'ti-coffee' },
  };
  private readonly STAGES = ['Pending', 'Under Review', 'Approved', 'Rejected'];
  private readonly STAGEC: Record<string, string> = { Pending: '#f59e0b', 'Under Review': '#0ea5e9', Approved: '#10b981', Rejected: '#ef4444' };
  private readonly STAGEIC: Record<string, string> = { Pending: 'ti-clock', 'Under Review': 'ti-eye', Approved: 'ti-circle-check', Rejected: 'ti-circle-x' };
  private readonly PRIO: Record<string, string> = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

  private REQ: LeaveRequest[] = [
    { id: 'LR-2041', name: 'Dr. John Mathew', dept: 'Emergency', spec: 'Emergency Medicine', c: '#f43f5e', photo: 'assets/img/doctor/doctor-06.jpg', type: 'Sick Leave', start: 'Jul 17', end: 'Jul 19', days: 3, reason: 'Recovering from viral fever, advised bed rest by physician.', cov: 'Assigned', covDoc: 'Dr. G. Nair', status: 'Approved', prio: 'High', docs: 2 },
    { id: 'LR-2042', name: 'Dr. Sarah Roberts', dept: 'Cardiology', spec: 'Interventional Cardiology', c: '#ef4444', photo: 'assets/img/doctor/doctor-01.jpg', type: 'Conference', start: 'Jul 21', end: 'Jul 24', days: 4, reason: 'Speaker at International Cardiology Summit 2026, Mumbai.', cov: 'Assigned', covDoc: 'Dr. A. Khan', status: 'Under Review', prio: 'Medium', docs: 3 },
    { id: 'LR-2043', name: 'Dr. Meera Iyer', dept: 'Pediatrics', spec: 'Neonatology', c: '#f59e0b', photo: 'assets/img/doctor/doctor-04.jpg', type: 'Maternity', start: 'Aug 01', end: 'Oct 30', days: 90, reason: 'Maternity leave as per hospital policy.', cov: 'Pending', covDoc: '', status: 'Under Review', prio: 'High', docs: 4 },
    { id: 'LR-2044', name: 'Dr. Karan Malhotra', dept: 'Dermatology', spec: 'Cosmetic Dermatology', c: '#10b981', photo: 'assets/img/doctor/doctor-10.jpg', type: 'Annual Leave', start: 'Jul 28', end: 'Aug 04', days: 7, reason: 'Family vacation, planned well in advance.', cov: 'Not Required', covDoc: '', status: 'Pending', prio: 'Low', docs: 1 },
    { id: 'LR-2045', name: 'Dr. Vikram Nair', dept: 'Neurology', spec: 'Stroke & Neuro', c: '#8b5cf6', photo: 'assets/img/doctor/doctor-02.jpg', type: 'Casual', start: 'Jul 20', end: 'Jul 20', days: 1, reason: 'Personal work at home.', cov: 'Pending', covDoc: '', status: 'Pending', prio: 'Low', docs: 0 },
    { id: 'LR-2046', name: 'Dr. Anita Desai', dept: 'Orthopedics', spec: 'Joint Replacement', c: '#0ea5e9', photo: 'assets/img/doctor/doctor-03.jpg', type: 'Emergency', start: 'Jul 18', end: 'Jul 22', days: 5, reason: 'Family medical emergency, needs to travel urgently.', cov: 'Assigned', covDoc: 'Dr. K. Singh', status: 'Pending', prio: 'High', docs: 1 },
    { id: 'LR-2047', name: 'Dr. Priya Sharma', dept: 'Gynecology', spec: 'Obstetrics', c: '#d946ef', photo: 'assets/img/doctor/doctor-07.jpg', type: 'Annual Leave', start: 'Aug 10', end: 'Aug 16', days: 7, reason: 'Annual planned leave.', cov: 'Pending', covDoc: '', status: 'Under Review', prio: 'Medium', docs: 1 },
    { id: 'LR-2048', name: 'Dr. Deepak Nair', dept: 'Radiology', spec: 'Diagnostic Imaging', c: '#6366f1', photo: 'assets/img/doctor/doctor-08.jpg', type: 'Sick Leave', start: 'Jul 16', end: 'Jul 17', days: 2, reason: 'Migraine, unable to attend duty.', cov: 'Assigned', covDoc: 'Dr. M. Iyer', status: 'Approved', prio: 'Medium', docs: 1 },
    { id: 'LR-2049', name: 'Dr. Rajesh Menon', dept: 'Oncology', spec: 'Medical Oncology', c: '#ec4899', photo: 'assets/img/doctor/doctor-05.jpg', type: 'Conference', start: 'Aug 05', end: 'Aug 08', days: 4, reason: 'Attending oncology research workshop.', cov: 'Pending', covDoc: '', status: 'Rejected', prio: 'Low', docs: 2 },
    { id: 'LR-2050', name: 'Dr. Sunita Rao', dept: 'ENT', spec: 'Otolaryngology', c: '#14b8a6', photo: 'assets/img/doctor/doctor-09.jpg', type: 'Casual', start: 'Jul 25', end: 'Jul 26', days: 2, reason: 'Personal.', cov: 'Not Required', covDoc: '', status: 'Rejected', prio: 'Low', docs: 0 },
    { id: 'LR-2051', name: 'Dr. Arjun Menon', dept: 'Nephrology', spec: 'Dialysis & Transplant', c: '#0891b2', photo: 'assets/img/doctor/doctor-11.jpg', type: 'Annual Leave', start: 'Aug 12', end: 'Aug 20', days: 9, reason: 'Vacation abroad.', cov: 'Pending', covDoc: '', status: 'Pending', prio: 'Medium', docs: 1 },
    { id: 'LR-2052', name: 'Dr. Fatima Sheikh', dept: 'Psychiatry', spec: 'Behavioral Health', c: '#a855f7', photo: 'assets/img/doctor/doctor-12.jpg', type: 'Conference', start: 'Jul 29', end: 'Jul 31', days: 3, reason: 'Mental health conference, presenting a paper.', cov: 'Assigned', covDoc: 'Dr. N. Roy', status: 'Approved', prio: 'Medium', docs: 2 },
  ];

  private readonly POOL: PoolDoc[] = [
    { name: 'Dr. Gopal Nair', dept: 'Emergency', c: '#f43f5e', free: 5 },
    { name: 'Dr. Ayesha Khan', dept: 'Cardiology', c: '#ef4444', free: 3 },
    { name: 'Dr. Kiran Singh', dept: 'Orthopedics', c: '#0ea5e9', free: 6 },
    { name: 'Dr. Manoj Iyer', dept: 'Radiology', c: '#6366f1', free: 8 },
  ];

  private state = {
    q: '',
    view: 'list' as 'board' | 'list' | 'calendar',
    filters: { dept: '', spec: '', type: '', status: '', cov: '', prio: '', date: '', sort: 'date' } as Record<string, string>,
    sel: {} as Record<string, boolean>,
  };

  private menuReq: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
    this.wireBulk();
    setTimeout(() => {
      this.byId('lv-skeleton')?.classList.add('hidden');
      this.byId('lv-content')?.classList.remove('hidden');
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qs(sel: string, root?: ParentNode): HTMLElement | null {
    return (root || this.document).querySelector(sel);
  }

  private qsa(sel: string, root?: ParentNode): HTMLElement[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(sel));
  }

  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }

  private mix(c: string, p = 15): string {
    return `color-mix(in srgb,${c} ${p}%,transparent)`;
  }

  private ini(n: string): string {
    return n
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private detailUrl(r: LeaveRequest): string {
    return 'doctor-leave-request-detail.html?' + new URLSearchParams({ id: r.id, name: r.name, dept: r.dept, status: r.status }).toString();
  }

  private toast(msg: string): void {
    this.toastService.show(msg, 'success');
  }

  /* ================= FILTER ================= */
  private filtered(): LeaveRequest[] {
    const f = this.state.filters;
    const q = this.state.q.toLowerCase();
    const arr = this.REQ.filter((r) => {
      if (q && (r.name + ' ' + r.id + ' ' + r.dept + ' ' + r.type).toLowerCase().indexOf(q) < 0) return false;
      if (f['dept'] && r.dept !== f['dept']) return false;
      if (f['spec'] && r.spec !== f['spec']) return false;
      if (f['type'] && r.type !== f['type']) return false;
      if (f['status'] && r.status !== f['status']) return false;
      if (f['cov'] && r.cov !== f['cov']) return false;
      if (f['prio'] && r.prio !== f['prio']) return false;
      return true;
    });
    const po: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    arr.sort((a, b) => {
      if (f['sort'] === 'duration') return b.days - a.days;
      if (f['sort'] === 'priority') return po[a.prio] - po[b.prio];
      if (f['sort'] === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
    return arr;
  }

  /* ================= KANBAN ================= */
  private kcardHTML(r: LeaveRequest): string {
    const t = this.TYPES[r.type] || { c: '#94a3b8', ic: 'ti-calendar' };
    return (
      `<div class="lv-kcard" draggable="true" data-id="${r.id}" style="--kc:${r.c}">` +
      `<div class="flex items-start gap-2"><div class="lv-av" style="overflow:hidden;padding:0"><img src="${this.esc(r.photo)}" alt="${this.esc(r.name)}" class="w-full h-full object-cover"></div>` +
      `<div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(r.name.replace('Dr. ', 'Dr '))}</div><div class="text-[10px] lv-muted truncate">${this.esc(r.dept)} · <a href="${this.detailUrl(r)}" class="hover:underline">${this.esc(r.id)}</a></div></div>` +
      `<span class="lv-tag flex-none" style="background:${this.mix(this.PRIO[r.prio])};color:${this.PRIO[r.prio]}"><i class="ti ti-flag-3" style="font-size:.6rem"></i>${this.esc(r.prio)}</span></div>` +
      `<div class="flex items-center gap-1.5 mt-2"><span class="lv-tag" style="background:${this.mix(t.c)};color:${t.c}"><i class="ti ${t.ic}" style="font-size:.62rem"></i>${this.esc(r.type)}</span><span class="lv-tag" style="background:var(--color-gray-100);color:var(--color-gray-600)"><i class="ti ti-calendar" style="font-size:.62rem"></i>${r.days}d</span></div>` +
      `<p class="text-[11px] lv-muted mt-2 line-clamp-2" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${this.esc(r.reason)}</p>` +
      `<div class="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border-color)]"><span class="lv-tag" style="background:${this.mix(r.cov === 'Assigned' ? '#10b981' : r.cov === 'Pending' ? '#f59e0b' : '#94a3b8')};color:${r.cov === 'Assigned' ? '#059669' : r.cov === 'Pending' ? '#d97706' : '#64748b'}"><i class="ti ti-user-shield" style="font-size:.62rem"></i>${this.esc(r.cov)}</span>` +
      `<div class="flex items-center gap-1"><button class="lv-btn lv-btn-soft !p-1.5" data-open="${r.id}" title="View"><i class="ti ti-eye"></i></button><button class="lv-btn lv-btn-soft !p-1.5" data-menu="${r.id}"><i class="ti ti-dots-vertical"></i></button></div></div>` +
      `</div>`
    );
  }

  private renderKanban(arr: LeaveRequest[]): void {
    const el = this.byId('lv-kanban');
    if (!el) return;
    el.innerHTML = this.STAGES.map((st) => {
      const items = arr.filter((r) => r.status === st);
      const c = this.STAGEC[st];
      return (
        `<div class="lv-kcol" data-col="${st}"><div class="lv-khd"><span class="w-2.5 h-2.5 rounded-full" style="background:${c}"></span><span class="text-[var(--color-gray-900)]">${this.esc(st)}</span><span class="lv-tag ml-auto" style="background:${this.mix(c)};color:${c}">${items.length}</span></div>` +
        `<div class="lv-kbody" data-col="${st}">${items.map((r) => this.kcardHTML(r)).join('') || '<div class="text-[11px] lv-muted text-center py-4">Drop requests here</div>'}</div></div>`
      );
    }).join('');
    this.wireDnD();
  }

  private wireDnD(): void {
    let dragId: string | null = null;
    this.qsa('.lv-kcard').forEach((card) => {
      card.addEventListener('dragstart', () => {
        dragId = card.getAttribute('data-id');
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.qsa('.lv-kcol').forEach((c) => c.classList.remove('drop'));
      });
    });
    this.qsa('.lv-kcol').forEach((col) => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drop');
      });
      col.addEventListener('dragleave', () => col.classList.remove('drop'));
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drop');
        const st = col.getAttribute('data-col');
        const r = this.REQ.find((x) => x.id === dragId);
        if (r && st && r.status !== st) {
          r.status = st;
          this.renderKanban(this.filtered());
          this.animateRings();
        }
      });
    });
  }

  /* ================= LIST ================= */
  private renderList(arr: LeaveRequest[]): void {
    const tbody = this.byId('lv-tbody');
    if (!tbody) return;
    tbody.innerHTML = arr
      .map((r) => {
        const t = this.TYPES[r.type] || { c: '#94a3b8', ic: '' };
        const sc = this.STAGEC[r.status];
        return (
          `<tr data-row="${r.id}">` +
          `<td><input type="checkbox" class="lv-cb lv-rowcb" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}></td>` +
          `<td class="font-bold text-[var(--color-primary)]">${this.esc(r.id)}</td>` +
          `<td><div class="flex items-center gap-2.5"><div class="lv-av" style="width:2.1rem;height:2.1rem;overflow:hidden;padding:0"><img src="${this.esc(r.photo)}" alt="${this.esc(r.name)}" class="w-full h-full object-cover"></div><div><div class="font-bold text-[var(--color-gray-900)]">${this.esc(r.name)}</div><div class="text-xs lv-muted">${this.esc(r.spec)}</div></div></div></td>` +
          `<td class="lv-muted">${this.esc(r.dept)}</td>` +
          `<td><span class="lv-tag" style="background:${this.mix(t.c)};color:${t.c}">${this.esc(r.type)}</span></td>` +
          `<td class="lv-muted whitespace-nowrap">${this.esc(r.start)}</td><td class="lv-muted whitespace-nowrap">${this.esc(r.end)}</td>` +
          `<td class="font-bold text-[var(--color-gray-900)]">${r.days}d</td>` +
          `<td><span class="lv-tag" style="background:${this.mix(r.cov === 'Assigned' ? '#10b981' : r.cov === 'Pending' ? '#f59e0b' : '#94a3b8')};color:${r.cov === 'Assigned' ? '#059669' : r.cov === 'Pending' ? '#d97706' : '#64748b'}">${this.esc(r.cov)}</span></td>` +
          `<td><span class="lv-tag" style="background:${this.mix(sc)};color:${sc}"><span class="lv-dotstat" style="background:${sc}"></span>${this.esc(r.status)}</span></td>` +
          `<td><button class="lv-btn lv-btn-soft !p-1.5" data-menu="${r.id}"><i class="ti ti-dots-vertical"></i></button></td>` +
          `</tr>`
        );
      })
      .join('');
    this.syncSelAll();
  }

  /* ================= CALENDAR ================= */
  private renderCalendar(arr: LeaveRequest[]): void {
    const todayIdx = 3;
    const week = [13, 14, 15, 16, 17, 18, 19];
    const html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      .map((day, di) => {
        const dnum = week[di];
        const items = arr.filter((r) => parseInt(r.start.replace(/[^0-9]/g, ''), 10) === dnum);
        const blocks = items
          .slice(0, 4)
          .map((r) => {
            const t = this.TYPES[r.type] || { c: '#94a3b8', ic: '' };
            const sc = this.STAGEC[r.status];
            return (
              `<div class="lv-block" data-open="${r.id}" style="border-left:3px solid ${t.c}"><div class="flex items-center gap-1.5"><div class="lv-av" style="width:1.6rem;height:1.6rem;overflow:hidden;padding:0"><img src="${this.esc(r.photo)}" alt="${this.esc(r.name)}" class="w-full h-full object-cover"></div><span class="text-[10px] font-bold text-[var(--color-gray-900)] truncate flex-1">${this.esc(r.name.replace('Dr. ', 'Dr '))}</span><span class="lv-dotstat" style="background:${sc}"></span></div><div class="text-[9px] lv-muted mt-1">${this.esc(r.type)} · ${r.days}d</div></div>`
            );
          })
          .join('');
        const more = items.length > 4 ? `<div class="text-[10px] text-center lv-muted font-semibold py-1">+${items.length - 4} more</div>` : '';
        return `<div class="lv-calcol"><div class="lv-calhd${di === todayIdx ? ' today' : ''}">${day} <span class="opacity-70 font-medium">${dnum}</span></div><div class="pb-1 min-h-[80px]">${blocks || '<div class="text-[10px] lv-muted text-center py-4">No leave</div>'}${more}</div></div>`;
      })
      .join('');
    const cal = this.byId('lv-calendar');
    if (cal) cal.innerHTML = html;
  }

  private render(): void {
    const arr = this.filtered();
    (['board', 'list', 'calendar'] as const).forEach((v) => this.byId('lv-view-' + v)?.classList.toggle('hidden', this.state.view !== v));
    this.byId('lv-empty')?.classList.toggle('hidden', arr.length > 0 || this.state.view === 'calendar');
    if (this.state.view === 'board') this.renderKanban(arr);
    else if (this.state.view === 'list') this.renderList(arr);
    else this.renderCalendar(arr);
  }

  /* ================= ACTION MENU ================= */
  private readonly ACTIONS: { a?: string; n?: string; ic?: string; ok?: boolean; danger?: boolean; sep?: boolean }[] = [
    { a: 'view', n: 'View Request', ic: 'ti-eye' },
    { a: 'edit', n: 'Edit Request', ic: 'ti-edit' },
    { sep: true },
    { a: 'approve', n: 'Approve', ic: 'ti-circle-check', ok: true },
    { a: 'reject', n: 'Reject', ic: 'ti-circle-x', danger: true },
    { a: 'changes', n: 'Request Changes', ic: 'ti-message-report' },
    { sep: true },
    { a: 'replace', n: 'Assign Replacement', ic: 'ti-user-plus' },
    { a: 'shiftcov', n: 'Assign Shift Coverage', ic: 'ti-clock-share' },
    { a: 'sched', n: 'View Doctor Schedule', ic: 'ti-calendar' },
    { a: 'docs', n: 'View Documents', ic: 'ti-files' },
    { sep: true },
    { a: 'print', n: 'Print Request', ic: 'ti-printer' },
    { a: 'pdf', n: 'Download PDF', ic: 'ti-file-download' },
    { a: 'notify', n: 'Send Notification', ic: 'ti-bell' },
    { a: 'email', n: 'Send Email', ic: 'ti-mail' },
    { sep: true },
    { a: 'archive', n: 'Archive', ic: 'ti-archive' },
    { a: 'delete', n: 'Delete', ic: 'ti-trash', danger: true },
  ];

  private openMenu(id: string, x: number, y: number): void {
    this.menuReq = id;
    const m = this.byId('lv-menu');
    if (!m) return;
    m.innerHTML = this.ACTIONS.map((a) =>
      a.sep ? '<div class="lv-sep"></div>' : `<div class="lv-mi${a.danger ? ' danger' : a.ok ? ' ok' : ''}" data-act="${a.a}"><i class="ti ${a.ic}"></i>${this.esc(a.n)}</div>`
    ).join('');
    m.classList.add('open');
    const h = Math.min(m.scrollHeight, window.innerHeight * 0.7);
    m.style.left = Math.max(8, Math.min(x, window.innerWidth - 220)) + 'px';
    m.style.top = Math.max(8, Math.min(y, window.innerHeight - h - 8)) + 'px';
  }

  private closeMenu(): void {
    this.byId('lv-menu')?.classList.remove('open');
    this.menuReq = null;
  }

  private doAction(act: string): void {
    const r = this.REQ.find((x) => x.id === this.menuReq);
    if (act === 'view') {
      this.closeMenu();
      if (this.menuReq) this.openDrawer(this.menuReq);
      return;
    }
    if (act === 'approve' && r) {
      r.status = 'Approved';
      this.render();
      this.animateRings();
      this.closeMenu();
      return;
    }
    if (act === 'reject' && r) {
      r.status = 'Rejected';
      this.render();
      this.animateRings();
      this.closeMenu();
      return;
    }
    if (['edit', 'replace', 'shiftcov'].indexOf(act) >= 0) {
      this.closeMenu();
      this.openModal(act === 'edit' ? 'new' : 'coverage', r);
      return;
    }
    if (act === 'docs') {
      this.closeMenu();
      this.openModal('docs', r);
      return;
    }
    if (act === 'delete') {
      this.closeMenu();
      this.openModal('delete', r);
      return;
    }
    this.closeMenu();
  }

  /* ================= DRAWER ================= */
  private openDrawer(id: string): void {
    const r = this.REQ.find((x) => x.id === id);
    if (!r) return;
    const t = this.TYPES[r.type] || { c: '#94a3b8', ic: 'ti-calendar' };
    const hist = [
      { n: 'Request Submitted', tm: 'Jul 14, 09:12', c: '#10b981', done: 1 },
      { n: 'Department Review', tm: 'Jul 14, 14:30', c: '#10b981', done: 1 },
      { n: 'HR Review', tm: 'Jul 15, 10:05', c: '#10b981', done: 1 },
      { n: 'Coverage ' + (r.cov === 'Assigned' ? 'Assigned' : 'Pending'), tm: r.cov === 'Assigned' ? 'Jul 15, 16:20' : '—', c: r.cov === 'Assigned' ? '#10b981' : '#f59e0b', done: r.cov === 'Assigned' ? 1 : 0 },
      { n: 'Final Approval', tm: r.status === 'Approved' ? 'Jul 16, 09:00' : 'Pending', c: r.status === 'Approved' ? '#10b981' : r.status === 'Rejected' ? '#ef4444' : '#94a3b8', done: r.status === 'Approved' ? 1 : 0 },
    ];
    const names = ['medical-certificate.pdf', 'leave-form.pdf', 'itinerary.pdf', 'approval-letter.pdf'];
    const docs: string[] = [];
    for (let i = 0; i < r.docs; i++) docs.push(names[i] || 'document.pdf');
    const body = this.byId('lv-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,${r.c},${this.mix(r.c, 55)})">` +
        `<div class="flex items-center justify-between"><button class="lv-btn lv-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="lv-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><span class="lv-dotstat" style="background:#fff"></span>${this.esc(r.status)}</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl overflow-hidden border border-white/30"><img src="${this.esc(r.photo)}" alt="${this.esc(r.name)}" class="w-full h-full object-cover"></div><div><h2 class="text-xl font-extrabold">${this.esc(r.name)}</h2><p class="text-white/80 text-sm">${this.esc(r.dept)} · ${this.esc(r.spec)}</p><p class="text-white/70 text-xs mt-.5">${this.esc(r.id)} · ${this.esc(r.prio)} priority</p></div></div>` +
        `</div>` +
        `<div class="p-5 space-y-5">` +
        `<div class="grid grid-cols-3 gap-2 text-center"><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">${r.days}</div><div class="text-[10px] lv-muted font-semibold">Days</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(r.start)}</div><div class="text-[10px] lv-muted font-semibold">Start</div></div><div class="p-3 rounded-xl border border-[var(--color-border-color)]"><div class="text-sm font-extrabold text-[var(--color-gray-900)]">${this.esc(r.end)}</div><div class="text-[10px] lv-muted font-semibold">End</div></div></div>` +
        `<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:${this.mix(t.c, 8)};border:1px solid ${this.mix(t.c, 22)}"><i class="ti ${t.ic} text-lg" style="color:${t.c}"></i><div><div class="text-xs lv-muted font-semibold">Leave Type</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(r.type)}</div></div></div>` +
        `<div><div class="text-xs lv-muted font-semibold mb-1.5">Reason</div><p class="text-sm lv-muted leading-relaxed p-3 rounded-lg bg-[var(--color-gray-100)]">${this.esc(r.reason)}</p></div>` +
        `<div><div class="text-xs lv-muted font-semibold mb-2">Supporting Documents (${r.docs})</div>${docs.length ? '<div class="space-y-1.5">' + docs.map((d) => `<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500"></i><span class="text-xs font-semibold text-[var(--color-gray-900)] flex-1 truncate">${this.esc(d)}</span><button class="lv-btn lv-btn-soft !p-1.5"><i class="ti ti-download"></i></button></div>`).join('') + '</div>' : '<p class="text-xs lv-muted">No documents attached.</p>'}</div>` +
        `<div><div class="text-xs lv-muted font-semibold mb-2">Assigned Coverage</div>${r.covDoc ? `<div class="flex items-center gap-2.5 p-2.5 rounded-lg" style="background:${this.mix('#10b981', 8)};border:1px solid ${this.mix('#10b981', 22)}"><i class="ti ti-user-shield text-emerald-500"></i><span class="text-sm font-bold text-[var(--color-gray-900)] flex-1">${this.esc(r.covDoc)}</span><span class="lv-tag" style="background:${this.mix('#10b981')};color:#059669">Covering</span></div>` : '<button class="lv-btn lv-btn-soft w-full" data-modal="coverage"><i class="ti ti-user-plus"></i> Assign Coverage</button>'}</div>` +
        `<div><div class="text-xs lv-muted font-semibold mb-2">Approval History / Timeline</div><div class="space-y-2.5">${hist
          .map(
            (h, i) =>
              `<div class="flex gap-3"><div class="flex flex-col items-center"><div class="w-6 h-6 rounded-full flex items-center justify-center flex-none" style="background:${this.mix(h.c)};color:${h.c}"><i class="ti ${h.done ? 'ti-check' : 'ti-clock'} text-xs"></i></div>${i < hist.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''}</div><div class="pb-2"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(h.n)}</div><div class="text-[11px] lv-muted">${this.esc(h.tm)}</div></div></div>`
          )
          .join('')}</div></div>` +
        `<div class="grid grid-cols-2 gap-2 pt-1"><button class="lv-btn lv-btn-primary" data-act2="approve" data-id2="${r.id}"><i class="ti ti-check"></i> Approve</button><button class="lv-btn lv-btn-soft !text-rose-500" data-act2="reject" data-id2="${r.id}"><i class="ti ti-x"></i> Reject</button><button class="lv-btn lv-btn-soft" data-modal="coverage"><i class="ti ti-user-shield"></i> Coverage</button><button class="lv-btn lv-btn-soft"><i class="ti ti-bell"></i> Notify</button></div>` +
        `</div>`;
    }
    this.byId('lv-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ================= MODALS ================= */
  private fld(label: string, inner: string): string {
    return `<div><label class="lv-lbl">${label}</label>${inner}</div>`;
  }
  private selDoc(): string {
    const names = this.REQ.map((r) => r.name).filter((v, i, a) => a.indexOf(v) === i);
    return `<select class="lv-inp">${names.map((n) => `<option>${this.esc(n)}</option>`).join('')}</select>`;
  }
  private selType(): string {
    return `<select class="lv-inp">${Object.keys(this.TYPES).map((t) => `<option>${this.esc(t)}</option>`).join('')}</select>`;
  }
  private selPool(): string {
    return `<select class="lv-inp">${this.POOL.map((p) => `<option>${this.esc(p.name)} — ${this.esc(p.dept)} (${p.free} free)</option>`).join('')}</select>`;
  }

  private modalDef(key: string, r?: LeaveRequest): { t: string; ic: string; body: string; cta: string; danger?: boolean } | null {
    switch (key) {
      case 'new':
        return {
          t: 'New Leave Request',
          ic: 'ti-calendar-plus',
          body:
            `<div class="space-y-3">${this.fld('Doctor', this.selDoc())}<div class="grid grid-cols-2 gap-3">${this.fld('Leave Type', this.selType())}${this.fld('Priority', '<select class="lv-inp"><option>Low</option><option>Medium</option><option>High</option></select>')}</div>` +
            `<div class="grid grid-cols-2 gap-3">${this.fld('Start Date', '<input type="text" placeholder="dd-mm-yyyy" class="lv-inp" data-provider="flatpickr" data-date-format="d-m-Y">')}${this.fld('End Date', '<input type="text" placeholder="dd-mm-yyyy" class="lv-inp" data-provider="flatpickr" data-date-format="d-m-Y">')}</div>` +
            `${this.fld('Reason', `<textarea class="lv-inp" rows="3" placeholder="Reason for leave">${r ? this.esc(r.reason) : ''}</textarea>`)}</div>`,
          cta: 'Submit Request',
        };
      case 'coverage':
        return {
          t: 'Assign Coverage',
          ic: 'ti-user-shield',
          body:
            `<div class="space-y-3">${this.fld('Leave Request', `<select class="lv-inp">${this.REQ.map((x) => `<option>${this.esc(x.id)} — ${this.esc(x.name)}</option>`).join('')}</select>`)}${this.fld('Replacement Doctor', this.selPool())}${this.fld('Coverage Type', '<select class="lv-inp"><option>Full Shift</option><option>Partial</option><option>On-call only</option><option>Emergency only</option></select>')}${this.fld('Notes', '<input class="lv-inp" placeholder="Optional">')}</div>`,
          cta: 'Assign Coverage',
        };
      case 'docs': {
        const n = r ? r.docs : 0;
        const names = ['medical-certificate.pdf', 'leave-form.pdf', 'itinerary.pdf', 'approval-letter.pdf'];
        const d: string[] = [];
        for (let i = 0; i < n; i++) d.push(names[i]);
        return {
          t: 'Supporting Documents',
          ic: 'ti-files',
          body: `<div class="space-y-2">${d.length ? d.map((x) => `<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><i class="ti ti-file-text text-rose-500 text-lg"></i><span class="text-sm font-semibold text-[var(--color-gray-900)] flex-1 truncate">${this.esc(x)}</span><button class="lv-btn lv-btn-soft !p-1.5"><i class="ti ti-download"></i></button></div>`).join('') : '<p class="text-sm lv-muted text-center py-4">No documents attached.</p>'}<div class="lv-drop" id="lv-dropzone"><i class="ti ti-cloud-upload text-2xl lv-muted"></i><p class="text-xs font-bold text-[var(--color-gray-900)] mt-1">Upload additional documents</p><input type="file" class="hidden" id="lv-file"></div></div>`,
          cta: 'Save',
        };
      }
      case 'approvebulk': {
        const pend = this.REQ.filter((x) => x.status === 'Pending' || x.status === 'Under Review');
        return {
          t: 'Approve Requests',
          ic: 'ti-checks',
          body: `<div class="space-y-2"><p class="text-sm lv-muted mb-2">${pend.length} requests awaiting approval:</p>${pend
            .map(
              (x) =>
                `<label class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)] cursor-pointer"><input type="checkbox" class="lv-cb" checked><div class="lv-av" style="width:2rem;height:2rem;overflow:hidden;padding:0"><img src="${this.esc(x.photo)}" alt="${this.esc(x.name)}" class="w-full h-full object-cover"></div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(x.name)}</div><div class="text-[11px] lv-muted">${this.esc(x.type)} · ${x.days}d</div></div><span class="lv-tag" style="background:${this.mix(this.STAGEC[x.status])};color:${this.STAGEC[x.status]}">${this.esc(x.status)}</span></label>`
            )
            .join('')}</div>`,
          cta: 'Approve All Selected',
        };
      }
      case 'import':
        return {
          t: 'Import Leave Requests',
          ic: 'ti-upload',
          body:
            '<div class="space-y-3"><div class="lv-drop" id="lv-dropzone"><i class="ti ti-cloud-upload text-3xl lv-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Leave Requests</p><p class="text-xs lv-muted">or click to browse files</p><input type="file" class="hidden" id="lv-file"></div><button class="lv-btn lv-btn-soft w-full"><i class="ti ti-file-download"></i> Download Sample Template</button>' +
            `<div class="p-3 rounded-lg" style="background:${this.mix('#f59e0b', 8)}"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs lv-muted" id="lv-import-sum">No file selected yet.</div></div></div>`,
          cta: 'Start Import',
        };
      case 'export': {
        const opts: [string, string][] = [['CSV', 'ti-file-text'], ['Excel', 'ti-file-spreadsheet'], ['PDF', 'ti-file-typography'], ['Print', 'ti-printer']];
        return {
          t: 'Export Leave Report',
          ic: 'ti-download',
          body: `<div class="space-y-4"><div><div class="lv-lbl">Format</div><div class="grid grid-cols-2 gap-2">${opts
            .map((o, i) => `<button class="lv-btn lv-btn-soft justify-start lv-expfmt${i === 0 ? ' !border-[var(--color-primary)]' : ''}" data-fmt="${o[0]}"><i class="ti ${o[1]}"></i> ${o[0]}</button>`)
            .join('')}</div></div><div><div class="lv-lbl">Scope</div><select class="lv-inp"><option>Leave Calendar</option><option>Department Report</option><option>Selected Records</option><option>All Records</option></select></div></div>`,
          cta: 'Export Now',
        };
      }
      case 'print':
        return {
          t: 'Print Leave Report',
          ic: 'ti-printer',
          body: `<div class="space-y-3">${this.fld('Range', '<select class="lv-inp"><option>This Week</option><option>This Month</option><option>Custom</option></select>')}${this.fld('Include', '<select class="lv-inp"><option>All requests</option><option>Approved only</option><option>Pending only</option><option>By department</option></select>')}</div>`,
          cta: 'Print',
        };
      case 'delete':
        return {
          t: 'Delete Confirmation',
          ic: 'ti-trash',
          danger: true,
          body: `<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Delete ${r ? this.esc(r.id) : 'selected requests'}?</p><p class="text-sm lv-muted mt-1">This leave request will be permanently removed. This action cannot be undone.</p></div>`,
          cta: 'Delete',
        };
      default:
        return null;
    }
  }

  private openModal(key: string, r?: LeaveRequest): void {
    const m = this.modalDef(key, r);
    if (!m) return;
    const danger = m.danger;
    const dialog = this.byId('lv-dialog');
    if (dialog) {
      dialog.innerHTML =
        `<div class="p-5"><div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti ${m.ic}" style="color:${danger ? '#ef4444' : 'var(--color-primary)'}"></i> ${this.esc(m.t)}</h3><button class="lv-btn lv-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>${m.body}` +
        `<div class="flex justify-end gap-2 mt-5"><button class="lv-btn lv-btn-soft" data-close>Cancel</button><button class="lv-btn ${danger ? 'lv-btn-soft !bg-rose-500 !text-white' : 'lv-btn-primary'}" id="lv-modal-ok"><i class="ti ${danger ? 'ti-trash' : 'ti-check'}"></i> ${this.esc(m.cta)}</button></div></div>`;
    }
    this.byId('lv-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';

    this.byId('lv-modal-ok')?.addEventListener('click', () => {
      this.byId('lv-modal')?.classList.remove('open');
      if (!this.qsa('.lv-drawer.open,.lv-modal.open').length) this.document.body.style.overflow = '';
      if (key === 'delete' && r) {
        const i = this.REQ.indexOf(r);
        if (i >= 0) this.REQ.splice(i, 1);
        this.render();
        this.animateRings();
      }
      if (key === 'approvebulk') {
        this.REQ.forEach((x) => {
          if (x.status === 'Pending' || x.status === 'Under Review') x.status = 'Approved';
        });
        this.render();
        this.animateRings();
      }
    });

    const dz = this.byId('lv-dropzone');
    if (dz) {
      dz.addEventListener('click', () => (this.byId('lv-file') as HTMLInputElement | null)?.click());
      const fi = this.byId('lv-file') as HTMLInputElement | null;
      if (fi) {
        fi.addEventListener('change', () => {
          if (fi.files && fi.files[0] && this.byId('lv-import-sum')) {
            this.byId('lv-import-sum')!.innerHTML = `<b class="text-[var(--color-gray-900)]">${this.esc(fi.files[0].name)}</b> ready · 18 rows · 0 errors`;
          }
        });
      }
      ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    }
    this.qsa('.lv-expfmt').forEach((b) => {
      b.addEventListener('click', () => {
        this.qsa('.lv-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]'));
        b.classList.add('!border-[var(--color-primary)]');
      });
    });
  }

  /* ================= SELECTION / BULK ================= */
  private selCount(): number {
    return Object.keys(this.state.sel).filter((k) => this.state.sel[k]).length;
  }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('lv-bulk-n');
    if (el) el.textContent = String(n);
    this.byId('lv-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('lv-selall') as HTMLInputElement | null;
    if (!sa) return;
    const vis = this.filtered();
    sa.checked = vis.length > 0 && vis.every((r) => this.state.sel[r.id]);
  }

  private updateFilterCount(): void {
    const n = Object.keys(this.state.filters).filter((k) => k !== 'sort' && this.state.filters[k]).length;
    const el = this.byId('lv-filter-n');
    if (el) {
      el.textContent = String(n);
      el.classList.toggle('hidden', n === 0);
    }
  }

  private animateRings(): void {
    this.qsa('.lv-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }

  /* ================= EVENTS ================= */
  private wireEvents(): void {
    const search = this.byId('lv-search') as HTMLInputElement | null;
    search?.addEventListener('input', () => {
      this.state.q = search.value;
      this.render();
    });
    this.byId('lv-filter-toggle')?.addEventListener('click', () => this.byId('lv-filters')?.classList.toggle('hidden'));
    const viewEl = this.byId('lv-view');
    viewEl?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') as any;
      this.qsa('.lv-segb', viewEl).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.qsa('[data-f]').forEach((sel) => {
      sel.addEventListener('change', () => {
        const key = sel.getAttribute('data-f');
        if (key) this.state.filters[key] = (sel as HTMLInputElement | HTMLSelectElement).value;
        this.updateFilterCount();
        this.render();
      });
    });
    this.byId('lv-clear')?.addEventListener('click', () => {
      Object.keys(this.state.filters).forEach((k) => { if (k !== 'sort') this.state.filters[k] = ''; });
      this.qsa('[data-f]').forEach((s) => {
        if (s.getAttribute('data-f') !== 'sort') (s as HTMLInputElement | HTMLSelectElement).value = '';
      });
      this.updateFilterCount();
      this.render();
    });

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const mo = target.closest('[data-modal]') as HTMLElement | null;
      if (mo) {
        this.openModal(mo.getAttribute('data-modal')!);
        return;
      }
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        this.openDrawer(op.getAttribute('data-open')!);
        return;
      }
      const a2 = target.closest('[data-act2]') as HTMLElement | null;
      if (a2) {
        const id = a2.getAttribute('data-id2');
        const act = a2.getAttribute('data-act2');
        const r = this.REQ.find((x) => x.id === id);
        if (r) {
          r.status = act === 'approve' ? 'Approved' : 'Rejected';
          this.byId('lv-drawer')?.classList.remove('open');
          if (!this.qsa('.lv-drawer.open,.lv-modal.open').length) this.document.body.style.overflow = '';
          this.render();
          this.animateRings();
        }
        return;
      }
      const mb = target.closest('[data-menu]') as HTMLElement | null;
      if (mb) {
        const rc = mb.getBoundingClientRect();
        this.openMenu(mb.getAttribute('data-menu')!, rc.right - 212, rc.bottom + 4);
        e.stopPropagation();
        return;
      }
      const ai = target.closest('[data-act]') as HTMLElement | null;
      if (ai) {
        this.doAction(ai.getAttribute('data-act')!);
        return;
      }
      if (target.closest('[data-refresh]')) {
        const el = this.byId('lv-h-updated');
        if (el) el.textContent = 'just now';
        this.render();
        this.animateRings();
        return;
      }
      const rcb = target.closest('.lv-rowcb') as HTMLInputElement | null;
      if (rcb) {
        this.state.sel[rcb.getAttribute('data-id')!] = rcb.checked;
        this.syncBulk();
        this.syncSelAll();
        return;
      }
      const cl = target.closest('[data-close]') as HTMLElement | null;
      if (cl) {
        const m = cl.closest('.lv-drawer,.lv-modal');
        m?.classList.remove('open');
        if (!this.qsa('.lv-drawer.open,.lv-modal.open').length) this.document.body.style.overflow = '';
        return;
      }
      if (!target.closest('#lv-menu')) this.closeMenu();
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.qsa('.lv-drawer.open,.lv-modal.open').forEach((m) => m.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });
    window.addEventListener('scroll', () => this.closeMenu(), true);
    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === 'lv-selall') {
        const checked = (target as HTMLInputElement).checked;
        const vis = this.filtered();
        vis.forEach((r) => (this.state.sel[r.id] = checked));
        this.render();
        this.syncBulk();
      }
    });
  }

  private wireBulk(): void {
    this.byId('lv-bulk-x')?.addEventListener('click', () => {
      this.state.sel = {};
      this.render();
      this.syncBulk();
    });
    this.qsa('[data-bulk]').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.getAttribute('data-bulk');
        const ids = Object.keys(this.state.sel).filter((k) => this.state.sel[k]);
        if (act === 'approve' || act === 'reject') {
          ids.forEach((id) => {
            const r = this.REQ.find((x) => x.id === id);
            if (r) r.status = act === 'approve' ? 'Approved' : 'Rejected';
          });
          this.render();
          this.animateRings();
          return;
        }
        if (act === 'delete') {
          ids.forEach((id) => {
            const i = this.REQ.findIndex((r) => r.id === id);
            if (i >= 0) this.REQ.splice(i, 1);
          });
          this.state.sel = {};
          this.render();
          this.animateRings();
          this.syncBulk();
        }
      });
    });
  }
}
