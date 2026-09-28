import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;
declare const HSStaticMethods: any;

interface AppointmentRequest {
  id: number;
  code: string;
  patient: string;
  phone: string;
  email: string;
  doctor: string;
  dept: string;
  date: string;
  time: string;
  channel: string;
  status: string;
  reason: string;
  submitted: string;
}

interface GridColumn<T> {
  cls?: string;
  render: (r: T) => string;
}

interface GridFilter<T> {
  el: HTMLSelectElement | null;
  match: (r: T, v: string) => boolean;
}

interface GridConfig<T> {
  tbody: HTMLElement;
  data: T[];
  pageSize: number;
  skipInitialRender?: boolean;
  search: HTMLInputElement | null;
  filters: GridFilter<T>[];
  info: HTMLElement | null;
  pager: HTMLElement | null;
  selectAll: HTMLInputElement | null;
  bulkBar: HTMLElement | null;
  bulkCount: HTMLElement | null;
  empty: { icon: string; title: string; text: string };
  columns: GridColumn<T>[];
  rowKey?: (r: T) => number | string;
}

interface Grid<T> {
  refresh: () => void;
  selected: () => string[];
  clearSelection: () => void;
  data: () => T[];
  setData: (d: T[]) => void;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "APPOINTMENT-REQUESTS".
 * Same MC.apptStats/MC.grid/MC.badge/MC.actions machinery as
 * follow-up-appointments, reimplemented here as private methods; the
 * approve/reject/suggest/view modals are Preline hs-overlay (open/close via
 * window.HSOverlay), no del-modal on this page.
 */
@Component({
  imports: [],
  selector: 'app-appointment-requests',
  styleUrl: './appointment-requests.css',
  templateUrl: './appointment-requests.html',
})
export class AppointmentRequests implements AfterViewInit {
  private readonly STATUS: Record<string, string> = { New: 'badge-blue', Pending: 'badge-amber', Approved: 'badge-green', Rejected: 'badge-red' };
  private readonly CHANNEL: Record<string, string> = { 'Patient Portal': 'badge-purple', Phone: 'badge-gray', 'Walk-in Desk': 'badge-blue', Referral: 'badge-emerald' };
  private readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private data: AppointmentRequest[] = [
    { id: 1, code: 'REQ-5011', patient: 'James Morrison', phone: '(212) 555-0147', email: 'j.morrison@mail.com', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: '2026-07-20', time: '09:00 AM', channel: 'Patient Portal', status: 'New', reason: 'Chest tightness on exertion', submitted: '2026-07-16' },
    { id: 2, code: 'REQ-5012', patient: 'Linda Whitfield', phone: '(212) 555-0182', email: 'l.whitfield@mail.com', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: '2026-07-21', time: '10:00 AM', channel: 'Phone', status: 'New', reason: 'Recurring migraine review', submitted: '2026-07-16' },
    { id: 3, code: 'REQ-5013', patient: 'Robert Castillo', phone: '(646) 555-0113', email: 'r.castillo@mail.com', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-22', time: '11:00 AM', channel: 'Referral', status: 'Pending', reason: 'Knee pain, referred by GP', submitted: '2026-07-15' },
    { id: 4, code: 'REQ-5014', patient: 'Angela Brooks', phone: '(718) 555-0164', email: 'a.brooks@mail.com', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', date: '2026-07-19', time: '02:00 PM', channel: 'Patient Portal', status: 'Approved', reason: 'Annual wellness check', submitted: '2026-07-14' },
    { id: 5, code: 'REQ-5015', patient: 'Marcus Delgado', phone: '(347) 555-0198', email: 'm.delgado@mail.com', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: '2026-07-23', time: '03:30 PM', channel: 'Phone', status: 'Pending', reason: 'Chemotherapy scheduling', submitted: '2026-07-15' },
    { id: 6, code: 'REQ-5016', patient: 'Priya Raghavan', phone: '(212) 555-0121', email: 'p.raghavan@mail.com', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: '2026-07-18', time: '09:00 AM', channel: 'Walk-in Desk', status: 'Rejected', reason: 'Blood pressure review', submitted: '2026-07-13' },
    { id: 7, code: 'REQ-5017', patient: 'Daniel Kowalski', phone: '(917) 555-0176', email: 'd.kowalski@mail.com', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: '2026-07-24', time: '10:00 AM', channel: 'Patient Portal', status: 'New', reason: 'Numbness in left hand', submitted: '2026-07-17' },
    { id: 8, code: 'REQ-5018', patient: 'Sofia Alvarez', phone: '(646) 555-0155', email: 's.alvarez@mail.com', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-25', time: '11:00 AM', channel: 'Referral', status: 'Approved', reason: 'Post-op shoulder review', submitted: '2026-07-12' },
    { id: 9, code: 'REQ-5019', patient: 'Naomi Fitzgerald', phone: '(212) 555-0190', email: 'n.fitzgerald@mail.com', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: '2026-07-26', time: '02:00 PM', channel: 'Patient Portal', status: 'Pending', reason: 'Second opinion requested', submitted: '2026-07-16' },
    { id: 10, code: 'REQ-5020', patient: 'Ethan Caldwell', phone: '(347) 555-0102', email: 'e.caldwell@mail.com', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: '2026-07-27', time: '09:00 AM', channel: 'Phone', status: 'New', reason: 'Palpitations at night', submitted: '2026-07-17' },
    { id: 11, code: 'REQ-5021', patient: 'Camille Rousseau', phone: '(917) 555-0128', email: 'c.rousseau@mail.com', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: '2026-07-28', time: '10:00 AM', channel: 'Patient Portal', status: 'Approved', reason: 'EEG results discussion', submitted: '2026-07-11' },
    { id: 12, code: 'REQ-5022', patient: 'Victor Ramirez', phone: '(718) 555-0174', email: 'v.ramirez@mail.com', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: '2026-07-29', time: '03:30 PM', channel: 'Referral', status: 'Rejected', reason: 'Biopsy scheduling', submitted: '2026-07-10' },
    { id: 13, code: 'REQ-5023', patient: 'Hannah Whitmore', phone: '(212) 555-0163', email: 'h.whitmore@mail.com', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', date: '2026-07-30', time: '09:00 AM', channel: 'Walk-in Desk', status: 'Pending', reason: 'Immunisation schedule', submitted: '2026-07-15' },
    { id: 14, code: 'REQ-5024', patient: 'Grace Lindqvist', phone: '(646) 555-0136', email: 'g.lindqvist@mail.com', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-31', time: '11:00 AM', channel: 'Patient Portal', status: 'New', reason: 'Lower back pain assessment', submitted: '2026-07-17' },
  ];

  private grid: Grid<AppointmentRequest> | null = null;
  private actionId: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;

    this.apptStats(this.byId('stats-row'), [
      { id: 'stat-new', icon: 'icon-inbox', label: 'New Requests', tone: 'primary', delta: 22.4, spark: [2, 4, 3, 5, 4, 6, 7] },
      { id: 'stat-approved', icon: 'icon-circle-check', label: 'Approved', tone: 'emerald', delta: 10.6, spark: [3, 4, 3, 5, 6, 5, 7] },
      { id: 'stat-pending', icon: 'icon-clock', label: 'Pending', tone: 'amber', delta: -2.8, spark: [5, 4, 5, 4, 3, 4, 3] },
      { id: 'stat-rejected', icon: 'icon-circle-x', label: 'Rejected', tone: 'danger', delta: -5.9, spark: [3, 2, 3, 2, 2, 1, 2] },
    ]);

    this.grid = this.buildGrid<AppointmentRequest>({
      tbody,
      data: this.data,
      pageSize: 10,
      skipInitialRender: true,
      search: this.byId('search') as HTMLInputElement | null,
      filters: [
        { el: this.byId('filter-doctor') as HTMLSelectElement | null, match: (r, v) => r.doctor === v },
        { el: this.byId('filter-channel') as HTMLSelectElement | null, match: (r, v) => r.channel === v },
        { el: this.byId('filter-status') as HTMLSelectElement | null, match: (r, v) => r.status === v },
      ],
      info: this.byId('info'),
      pager: this.byId('pager'),
      selectAll: this.byId('select-all') as HTMLInputElement | null,
      bulkBar: this.byId('bulk-bar'),
      bulkCount: this.byId('bulk-count'),
      empty: { icon: 'icon-inbox', title: 'No requests found', text: 'Try adjusting your search or filters.' },
      columns: [
        { render: (r) => `<a class="font-medium text-primary" href="${this.detailUrl(r)}">${r.code}</a>` },
        {
          render: (r) =>
            `<div><p class="font-medium text-gray-900">${r.patient}</p>` + `<p class="text-xs text-gray-500 dark:text-gray-400">${r.phone}</p></div>`,
        },
        {
          render: (r) => `<div><p class="text-gray-900">${r.doctor}</p>` + `<p class="text-xs text-gray-500 dark:text-gray-400">${r.dept}</p></div>`,
        },
        { render: (r) => this.fmt(r.date) },
        { render: (r) => r.time },
        { render: (r) => this.badge(this.CHANNEL, r.channel) },
        { render: (r) => this.badge(this.STATUS, r.status) },
        {
          cls: 'text-right',
          render: (r) =>
            this.actions(r.id, [
              { label: 'View Details', icon: 'icon-eye', act: 'view' },
              { label: 'Approve', icon: 'icon-circle-check', act: 'approve' },
              { label: 'Suggest Slot', icon: 'icon-calendar-clock', act: 'suggest' },
              { label: 'Reject', icon: 'icon-circle-x', act: 'reject', danger: true },
            ]),
        },
      ],
    });

    tbody.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const rec = this.data.find((r) => r.id === parseInt(btn.dataset['id'] || '0', 10));
      if (!rec) return;
      this.actionId = rec.id;

      switch (btn.dataset['act']) {
        case 'view': {
          const body = this.byId('view-body');
          if (body) {
            body.innerHTML =
              this.row('Request ID', rec.code) +
              this.row('Patient', rec.patient) +
              this.row('Phone', rec.phone) +
              this.row('Email', rec.email) +
              this.row('Requested Doctor', rec.doctor) +
              this.row('Department', rec.dept) +
              this.row('Preferred Date', this.fmt(rec.date)) +
              this.row('Requested Time', rec.time) +
              this.row('Channel', this.badge(this.CHANNEL, rec.channel)) +
              this.row('Status', this.badge(this.STATUS, rec.status)) +
              this.row('Submitted', this.fmt(rec.submitted)) +
              this.row('Reason', rec.reason);
          }
          this.openOverlay('view-modal');
          break;
        }
        case 'approve': {
          if (rec.status === 'Approved') {
            this.toast('Request is already approved', 'info');
            return;
          }
          const body = this.byId('approve-body');
          if (body) {
            body.innerHTML =
              this.row('Request ID', rec.code) + this.row('Patient', rec.patient) + this.row('Doctor', rec.doctor) + this.row('Date', this.fmt(rec.date)) + this.row('Time', rec.time);
          }
          this.openOverlay('approve-modal');
          break;
        }
        case 'suggest': {
          const nameEl = this.byId('suggest-name');
          if (nameEl) nameEl.textContent = `${rec.code} · ${rec.patient}`;
          const dateEl = this.byId('sg-date') as HTMLInputElement | null;
          if (dateEl) dateEl.value = rec.date;
          this.openOverlay('suggest-modal');
          break;
        }
        case 'reject': {
          const nameEl = this.byId('reject-name');
          if (nameEl) nameEl.textContent = `${rec.code} · ${rec.patient}`;
          this.openOverlay('reject-modal');
          break;
        }
      }
    });

    this.byId('approve-confirm')?.addEventListener('click', () => {
      const rec = this.data.find((r) => r.id === this.actionId);
      if (rec) rec.status = 'Approved';
      const notify = (this.byId('approve-notify') as HTMLInputElement | null)?.checked;
      this.closeOverlay('approve-modal');
      this.toast(notify ? 'Request approved and patient notified' : 'Request approved');
      this.refresh();
    });

    this.byId('reject-confirm')?.addEventListener('click', () => {
      const rec = this.data.find((r) => r.id === this.actionId);
      if (rec) rec.status = 'Rejected';
      this.closeOverlay('reject-modal');
      const reason = (this.byId('reject-reason') as HTMLSelectElement | null)?.value || '';
      this.toast(`Request rejected · ${reason}`, 'info');
      this.refresh();
    });

    this.byId('suggest-confirm')?.addEventListener('click', () => {
      const rec = this.data.find((r) => r.id === this.actionId);
      if (rec) {
        const dateEl = this.byId('sg-date') as HTMLInputElement | null;
        const timeEl = this.byId('sg-time') as HTMLSelectElement | null;
        rec.date = dateEl?.value || rec.date;
        rec.time = timeEl?.value || rec.time;
        rec.status = 'Pending';
      }
      this.closeOverlay('suggest-modal');
      this.toast('Alternative slot sent to patient');
      this.refresh();
    });

    this.document.querySelectorAll('[data-bulk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ids = (this.grid?.selected() || []).map(Number);
        if (!ids.length) return;
        const approve = (btn as HTMLElement).dataset['bulk'] === 'approve';
        this.data.forEach((r) => {
          if (ids.indexOf(r.id) !== -1) r.status = approve ? 'Approved' : 'Rejected';
        });
        this.toast(`${ids.length} requests ${approve ? 'approved' : 'rejected'}`);
        this.grid?.clearSelection();
        this.refresh();
      });
    });

    this.byId('btn-reset')?.addEventListener('click', () => {
      const search = this.byId('search') as HTMLInputElement | null;
      if (search) search.value = '';
      const fDoctor = this.byId('filter-doctor') as HTMLSelectElement | null;
      if (fDoctor) fDoctor.value = '';
      const fChannel = this.byId('filter-channel') as HTMLSelectElement | null;
      if (fChannel) fChannel.value = '';
      const fStatus = this.byId('filter-status') as HTMLSelectElement | null;
      if (fStatus) fStatus.value = '';
      this.grid?.refresh();
      this.toast('Filters cleared', 'info');
    });

    this.byId('btn-print')?.addEventListener('click', () => window.print());

    this.byId('btn-export')?.addEventListener('click', () => {
      const head = ['Request ID', 'Patient', 'Phone', 'Email', 'Doctor', 'Department', 'Preferred Date', 'Time', 'Channel', 'Status'];
      const rows = this.data.map((r) => [r.code, r.patient, r.phone, r.email, r.doctor, r.dept, r.date, r.time, r.channel, r.status]);
      const csv = [head]
        .concat(rows)
        .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = this.document.createElement('a');
      a.href = url;
      a.download = 'appointment-requests.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.toast('Requests exported');
    });

    this.stats();
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private fmt(iso: string): string {
    const p = iso.split('-');
    return `${p[2]} ${this.MONTHS[parseInt(p[1], 10) - 1]} ${p[0]}`;
  }

  private detailUrl(r: AppointmentRequest): string {
    return (
      'appointment-request-detail.html?' +
      new URLSearchParams({ id: r.code, patient: r.patient, doctor: r.doctor, dept: r.dept, date: r.date, time: r.time, channel: r.channel, status: r.status }).toString()
    );
  }

  private row(label: string, value: string): string {
    return (
      '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
      `<span class="text-sm text-gray-500 dark:text-gray-400">${label}</span>` +
      `<span class="text-sm font-medium text-gray-900 text-right">${value}</span></div>`
    );
  }

  private stats(): void {
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-new', this.data.filter((r) => r.status === 'New').length);
    set('stat-approved', this.data.filter((r) => r.status === 'Approved').length);
    set('stat-pending', this.data.filter((r) => r.status === 'Pending').length);
    set('stat-rejected', this.data.filter((r) => r.status === 'Rejected').length);
  }

  private refresh(): void {
    this.grid?.setData(this.data);
    this.stats();
  }

  private openOverlay(id: string): void {
    if (typeof HSOverlay !== 'undefined') HSOverlay.open('#' + id);
  }

  private closeOverlay(id: string): void {
    if (typeof HSOverlay !== 'undefined') HSOverlay.close('#' + id);
  }

  /* ---------------- MC.apptStats (reimplemented) ---------------- */

  private sparkline(series: number[]): string {
    if (!series || series.length < 2) return '';
    const W = 80;
    const H = 24;
    const max = Math.max(...series);
    const min = Math.min(...series);
    const span = max - min || 1;
    const step = W / (series.length - 1);
    const points = series.map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (H - 2 - ((v - min) / span) * (H - 4)).toFixed(1);
      return `${x},${y}`;
    });
    const area = `0,${H} ${points.join(' ')} ${W},${H}`;
    const last = points[points.length - 1].split(',');
    return (
      `<svg class="appt-stat-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
      `<polygon points="${area}" fill="currentColor" opacity="0.12"></polygon>` +
      `<polyline points="${points.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.5" ` +
      'stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>' +
      `<circle cx="${last[0]}" cy="${last[1]}" r="1.8" fill="currentColor"></circle>` +
      '</svg>'
    );
  }

  private delta(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    const up = value > 0;
    const flat = value === 0;
    const cls = flat ? 'is-flat' : up ? 'is-up' : 'is-down';
    const icon = flat ? 'icon-minus' : up ? 'icon-trending-up' : 'icon-trending-down';
    const sign = up ? '+' : '';
    const label = flat ? 'No change' : `${sign}${value}% ${up ? 'increase' : 'decrease'}`;
    return (
      `<span class="appt-stat-delta ${cls}" title="${label}">` +
      `<i class="${icon} text-[10px]" aria-hidden="true"></i>` +
      `<span class="sr-only">${label}</span>` +
      `<span aria-hidden="true">${sign}${value}%</span></span>`
    );
  }

  private apptStat(cfg: { id: string; icon: string; label: string; tone?: string; delta?: number; spark?: number[]; meta?: string }): string {
    return (
      `<article class="appt-stat tone-${cfg.tone || 'primary'}">` +
      '<div class="appt-stat-head">' +
      `<span class="appt-stat-icon"><i class="${cfg.icon}" aria-hidden="true"></i></span>` +
      this.delta(cfg.delta) +
      '</div>' +
      `<p class="appt-stat-value" id="${cfg.id}">0</p>` +
      `<p class="appt-stat-label">${cfg.label}</p>` +
      '<div class="appt-stat-foot">' +
      this.sparkline(cfg.spark || []) +
      `<span class="appt-stat-meta">${cfg.meta || 'vs last week'}</span>` +
      '</div></article>'
    );
  }

  private apptStats(container: HTMLElement | null, list: { id: string; icon: string; label: string; tone?: string; delta?: number; spark?: number[]; meta?: string }[]): void {
    if (!container) return;
    container.innerHTML = list.map((c) => this.apptStat(c)).join('');
  }

  /* ---------------- MC.badge / MC.actions (reimplemented) ---------------- */

  private badge(map: Record<string, string>, value: string): string {
    return `<span class="badge ${map[value] || 'badge-gray'}">${value}</span>`;
  }

  private actions(id: number, items: { label: string; icon: string; act: string; danger?: boolean }[]): string {
    let html =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
      '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">' +
      '<i class="icon-ellipsis-vertical text-sm"></i></button>' +
      '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">';
    items.forEach((it) => {
      html +=
        `<button type="button" role="menuitem" data-act="${it.act}" data-id="${id}" ` +
        'class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
        (it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
        `"><i class="${it.icon} text-sm"></i>${it.label}</button>`;
    });
    return html + '</div></div>';
  }

  /* ---------------- MC.grid (reimplemented) ---------------- */

  private buildGrid<T>(cfg: GridConfig<T>): Grid<T> {
    const key = cfg.rowKey || ((r: any) => r.id);
    const state = { rows: (cfg.data || []).slice(), page: 1, perPage: cfg.pageSize || 10, selected: new Set<string>() };

    const filtered = (): T[] => {
      const term = cfg.search ? cfg.search.value.trim().toLowerCase() : '';
      return state.rows.filter((row) => {
        if (term && !Object.values(row as any).join(' ').toLowerCase().includes(term)) return false;
        return (cfg.filters || []).every((f) => {
          const v = f.el ? f.el.value : '';
          return !v || f.match(row, v);
        });
      });
    };

    const syncBulk = () => {
      cfg.bulkBar?.classList.toggle('hidden', state.selected.size === 0);
      if (cfg.bulkCount) cfg.bulkCount.textContent = String(state.selected.size);
    };

    const syncSelectAll = () => {
      if (!cfg.selectAll) return;
      const boxes = Array.from(cfg.tbody.querySelectorAll('[data-row-select]')) as HTMLInputElement[];
      const checked = boxes.filter((b) => b.checked).length;
      cfg.selectAll.checked = boxes.length > 0 && checked === boxes.length;
      cfg.selectAll.indeterminate = checked > 0 && checked < boxes.length;
    };

    const renderEmpty = (colspan: number) => {
      const e = cfg.empty || ({} as GridConfig<T>['empty']);
      const tr = this.document.createElement('tr');
      tr.innerHTML =
        `<td colspan="${colspan}" class="py-12 text-center">` +
        '<div class="flex flex-col items-center gap-2">' +
        '<span class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">' +
        `<i class="${e.icon || 'icon-inbox'} text-xl text-gray-400"></i>` +
        '</span>' +
        `<p class="text-sm font-semibold text-gray-900">${e.title || 'No records found'}</p>` +
        `<p class="text-xs text-gray-500 dark:text-gray-400">${e.text || 'Try adjusting your search or filters.'}</p>` +
        '</div></td>';
      cfg.tbody.appendChild(tr);
    };

    const pageButton = (label: string, target: number, opts: { active?: boolean; disabled?: boolean; ariaLabel?: string; icon?: string }): HTMLButtonElement => {
      const o = opts || {};
      const b = this.document.createElement('button');
      b.type = 'button';
      b.className = o.active
        ? 'min-w-9 h-9 px-2 rounded-lg text-sm font-semibold bg-primary text-white'
        : 'min-w-9 h-9 px-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none';
      b.disabled = !!o.disabled;
      if (o.ariaLabel) b.setAttribute('aria-label', o.ariaLabel);
      if (o.active) b.setAttribute('aria-current', 'page');
      if (o.icon) {
        const i = this.document.createElement('i');
        i.className = o.icon + ' text-sm';
        b.appendChild(i);
      } else {
        b.textContent = label;
      }
      b.addEventListener('click', () => {
        state.page = target;
        render();
      });
      return b;
    };

    const renderPager = (pages: number) => {
      if (!cfg.pager) return;
      cfg.pager.textContent = '';
      cfg.pager.appendChild(pageButton('', state.page - 1, { icon: 'icon-chevron-left', disabled: state.page === 1, ariaLabel: 'Previous page' }));
      let start = Math.max(1, state.page - 2);
      const end = Math.min(pages, start + 4);
      start = Math.max(1, end - 4);
      for (let p = start; p <= end; p++) {
        cfg.pager.appendChild(pageButton(String(p), p, { active: p === state.page }));
      }
      cfg.pager.appendChild(pageButton('', state.page + 1, { icon: 'icon-chevron-right', disabled: state.page === pages, ariaLabel: 'Next page' }));
    };

    const renderMeta = (total: number, from: number, pages: number) => {
      if (cfg.info) {
        cfg.info.textContent = total ? `Showing ${from + 1} to ${Math.min(from + state.perPage, total)} of ${total} entries` : 'Showing 0 to 0 of 0 entries';
      }
      renderPager(pages);
      syncSelectAll();
      syncBulk();
    };

    const render = () => {
      const rows = filtered();
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > pages) state.page = pages;

      const from = (state.page - 1) * state.perPage;
      const slice = rows.slice(from, from + state.perPage);
      const colspan = cfg.columns.length + (cfg.selectAll ? 1 : 0);

      cfg.tbody.textContent = '';

      if (total === 0) {
        renderEmpty(colspan);
      } else {
        slice.forEach((row) => {
          const tr = this.document.createElement('tr');
          let html = '';
          if (cfg.selectAll) {
            const id = String(key(row));
            html += `<td><input type="checkbox" data-row-select value="${id}" aria-label="Select row"${state.selected.has(id) ? ' checked' : ''} class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"></td>`;
          }
          cfg.columns.forEach((c) => {
            html += `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.render(row)}</td>`;
          });
          tr.innerHTML = html;
          cfg.tbody.appendChild(tr);
        });
      }

      renderMeta(total, from, pages);
      if (typeof HSStaticMethods !== 'undefined') HSStaticMethods.autoInit();
    };

    if (cfg.search) {
      cfg.search.addEventListener('input', () => {
        state.page = 1;
        render();
      });
    }

    (cfg.filters || []).forEach((f) => {
      f.el?.addEventListener('change', () => {
        state.page = 1;
        render();
      });
    });

    if (cfg.selectAll) {
      cfg.selectAll.addEventListener('change', () => {
        cfg.tbody.querySelectorAll('[data-row-select]').forEach((b) => {
          const box = b as HTMLInputElement;
          box.checked = cfg.selectAll!.checked;
          if (box.checked) state.selected.add(box.value);
          else state.selected.delete(box.value);
        });
        syncBulk();
      });
    }

    cfg.tbody.addEventListener('change', (e) => {
      const box = (e.target as HTMLElement).closest('[data-row-select]') as HTMLInputElement | null;
      if (!box) return;
      if (box.checked) state.selected.add(box.value);
      else state.selected.delete(box.value);
      syncSelectAll();
      syncBulk();
    });

    if (cfg.skipInitialRender) {
      const rows = filtered();
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / state.perPage));
      const from = (state.page - 1) * state.perPage;
      renderMeta(total, from, pages);
    } else {
      render();
    }

    return {
      refresh: render,
      selected: () => Array.from(state.selected),
      clearSelection: () => {
        state.selected.clear();
        render();
      },
      data: () => state.rows,
      setData: (d: T[]) => {
        state.rows = d.slice();
        state.page = 1;
        render();
      },
    };
  }
}
