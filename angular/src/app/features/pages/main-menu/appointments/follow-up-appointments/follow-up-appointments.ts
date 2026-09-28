import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;
declare const HSStaticMethods: any;

interface FollowUp {
  id: number;
  patient: string;
  phone: string;
  doctor: string;
  dept: string;
  prev: string;
  next: string;
  reason: string;
  status: string;
  history: string[];
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
 * Ported from tailwind/src/assets/js/script.js — "Follow-up Appointments
 * (follow-up-appointments.html)". Drives the appointment stat cards
 * (MC.apptStats), the data-driven table (MC.grid), and the history /
 * reschedule modals + bulk actions — all reimplemented as private methods
 * since there is no global MC object in Angular.
 */
@Component({
  imports: [],
  selector: 'app-follow-up-appointments',
  styleUrl: './follow-up-appointments.css',
  templateUrl: './follow-up-appointments.html',
})
export class FollowUpAppointments implements AfterViewInit {
  private readonly STATUS: Record<string, string> = {
    'Due Today': 'badge-amber',
    Upcoming: 'badge-blue',
    Missed: 'badge-red',
    Completed: 'badge-green',
    Cancelled: 'badge-gray',
  };

  private readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private data: FollowUp[] = [
    { id: 1, patient: 'James Morrison', phone: '(212) 555-0147', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', prev: '2026-06-19', next: '2026-07-17', reason: 'Post-stent review', status: 'Due Today', history: ['2026-06-19 · Stent placement follow-up', '2026-05-08 · Angiogram', '2026-04-22 · Initial consultation'] },
    { id: 2, patient: 'Linda Whitfield', phone: '(212) 555-0182', doctor: 'Dr. Michael Reyes', dept: 'Neurology', prev: '2026-06-17', next: '2026-07-17', reason: 'Migraine medication review', status: 'Due Today', history: ['2026-06-17 · Medication adjusted', '2026-05-13 · MRI review'] },
    { id: 3, patient: 'Robert Castillo', phone: '(646) 555-0113', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', prev: '2026-06-25', next: '2026-07-24', reason: 'Knee arthroscopy recovery', status: 'Upcoming', history: ['2026-06-25 · Arthroscopy performed', '2026-06-02 · Pre-op assessment'] },
    { id: 4, patient: 'Angela Brooks', phone: '(718) 555-0164', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', prev: '2026-06-10', next: '2026-07-10', reason: 'Growth monitoring', status: 'Missed', history: ['2026-06-10 · Routine check', '2026-03-14 · Immunisation'] },
    { id: 5, patient: 'Marcus Delgado', phone: '(347) 555-0198', doctor: 'Dr. Laura Bennett', dept: 'Oncology', prev: '2026-06-30', next: '2026-07-21', reason: 'Chemotherapy cycle 3', status: 'Upcoming', history: ['2026-06-30 · Cycle 2 completed', '2026-06-09 · Cycle 1 completed'] },
    { id: 6, patient: 'Priya Raghavan', phone: '(212) 555-0121', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', prev: '2026-05-28', next: '2026-06-28', reason: 'Blood pressure review', status: 'Missed', history: ['2026-05-28 · Medication started'] },
    { id: 7, patient: 'Daniel Kowalski', phone: '(917) 555-0176', doctor: 'Dr. Michael Reyes', dept: 'Neurology', prev: '2026-06-12', next: '2026-07-12', reason: 'Nerve conduction results', status: 'Completed', history: ['2026-07-12 · Results reviewed, discharged', '2026-06-12 · EMG performed'] },
    { id: 8, patient: 'Sofia Alvarez', phone: '(646) 555-0155', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', prev: '2026-06-20', next: '2026-07-25', reason: 'Shoulder physiotherapy review', status: 'Upcoming', history: ['2026-06-20 · Physio plan agreed'] },
    { id: 9, patient: 'Naomi Fitzgerald', phone: '(212) 555-0190', doctor: 'Dr. Laura Bennett', dept: 'Oncology', prev: '2026-06-15', next: '2026-07-15', reason: 'Biopsy results discussion', status: 'Completed', history: ['2026-07-15 · Results benign', '2026-06-15 · Biopsy taken'] },
    { id: 10, patient: 'Ethan Caldwell', phone: '(347) 555-0102', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', prev: '2026-06-27', next: '2026-07-27', reason: 'Holter monitor review', status: 'Upcoming', history: ['2026-06-27 · Monitor fitted'] },
    { id: 11, patient: 'Camille Rousseau', phone: '(917) 555-0128', doctor: 'Dr. Michael Reyes', dept: 'Neurology', prev: '2026-05-20', next: '2026-06-20', reason: 'Seizure medication review', status: 'Missed', history: ['2026-05-20 · Dose increased'] },
    { id: 12, patient: 'Hannah Whitmore', phone: '(212) 555-0163', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', prev: '2026-06-22', next: '2026-07-22', reason: 'Asthma control review', status: 'Upcoming', history: ['2026-06-22 · Inhaler technique taught'] },
    { id: 13, patient: 'Victor Ramirez', phone: '(718) 555-0174', doctor: 'Dr. Laura Bennett', dept: 'Oncology', prev: '2026-06-18', next: '2026-07-17', reason: 'Post-biopsy wound check', status: 'Due Today', history: ['2026-06-18 · Biopsy performed'] },
    { id: 14, patient: 'Grace Lindqvist', phone: '(646) 555-0136', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', prev: '2026-06-05', next: '2026-07-05', reason: 'Back pain reassessment', status: 'Completed', history: ['2026-07-05 · Improved, discharged', '2026-06-05 · Physio referral'] },
  ];

  private grid: Grid<FollowUp> | null = null;
  private actionId: number | null = null;
  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;

    this.apptStats(this.byId('stats-row'), [
      { id: 'stat-due', icon: 'icon-calendar-check', label: 'Due Today', tone: 'amber', delta: 3.1, spark: [2, 3, 2, 4, 3, 4, 3] },
      { id: 'stat-upcoming', icon: 'icon-calendar-clock', label: 'Upcoming', tone: 'sky', delta: 7.4, spark: [5, 6, 5, 7, 8, 7, 9] },
      { id: 'stat-missed', icon: 'icon-calendar-x', label: 'Missed', tone: 'danger', delta: -8.2, spark: [5, 4, 5, 3, 4, 3, 2] },
      { id: 'stat-completed', icon: 'icon-circle-check', label: 'Completed', tone: 'emerald', delta: 13.7, spark: [3, 4, 5, 4, 6, 7, 8] },
    ]);

    this.grid = this.buildGrid<FollowUp>({
      tbody,
      data: this.data,
      pageSize: 10,
      skipInitialRender: true,
      search: this.byId('search') as HTMLInputElement | null,
      filters: [
        { el: this.byId('filter-doctor') as HTMLSelectElement | null, match: (r, v) => r.doctor === v },
        { el: this.byId('filter-status') as HTMLSelectElement | null, match: (r, v) => r.status === v },
      ],
      info: this.byId('info'),
      pager: this.byId('pager'),
      selectAll: this.byId('select-all') as HTMLInputElement | null,
      bulkBar: this.byId('bulk-bar'),
      bulkCount: this.byId('bulk-count'),
      empty: { icon: 'icon-calendar-check', title: 'No follow-ups found', text: 'Try adjusting your search or filters.' },
      columns: [
        {
          render: (r) =>
            `<div><p class="font-medium"><a class="text-primary" href="${this.detailUrl(r)}">${r.patient}</a></p>` +
            `<p class="text-xs text-gray-500 dark:text-gray-400">${r.phone}</p></div>`,
        },
        { render: (r) => r.doctor },
        { render: (r) => r.dept },
        { render: (r) => this.fmt(r.prev) },
        {
          render: (r) =>
            `<span class="${r.status === 'Missed' ? 'text-danger font-semibold' : r.status === 'Due Today' ? 'text-amber-600 font-semibold' : ''}">` +
            this.fmt(r.next) +
            '</span>',
        },
        { render: (r) => `<span class="block max-w-44 truncate" title="${r.reason}">${r.reason}</span>` },
        { render: (r) => this.badge(this.STATUS, r.status) },
        {
          cls: 'text-right',
          render: (r) =>
            this.actions(r.id, [
              { label: 'View History', icon: 'icon-history', act: 'history' },
              { label: 'Reschedule', icon: 'icon-calendar-clock', act: 'resched' },
              { label: 'Send Reminder', icon: 'icon-bell-ring', act: 'remind' },
              { label: 'Complete', icon: 'icon-circle-check', act: 'complete' },
              { label: 'Cancel', icon: 'icon-circle-x', act: 'cancel', danger: true },
            ]),
        },
      ],
    });

    tbody.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const row = this.data.find((r) => r.id === parseInt(btn.dataset['id'] || '0', 10));
      if (!row) return;
      this.actionId = row.id;

      switch (btn.dataset['act']) {
        case 'history': {
          const nameEl = this.byId('history-name');
          if (nameEl) nameEl.textContent = `${row.patient} · ${row.dept}`;
          const body = this.byId('history-body');
          if (body) {
            body.innerHTML = row.history
              .map((h) => {
                const parts = h.split(' · ');
                return (
                  '<div class="flex gap-3 p-3 rounded-lg border border-border-color">' +
                  '<span class="size-9 shrink-0 flex items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-600/20">' +
                  '<i class="icon-file-text text-primary text-sm"></i></span>' +
                  `<div><p class="text-sm font-medium text-gray-900">${parts[1]}</p>` +
                  `<p class="text-xs text-gray-500 dark:text-gray-400">${this.fmt(parts[0])}</p></div></div>`
                );
              })
              .join('');
          }
          this.openOverlay('history-modal');
          return;
        }
        case 'resched': {
          const nameEl = this.byId('resched-name');
          if (nameEl) nameEl.textContent = `${row.patient} · ${row.reason}`;
          const dateEl = this.byId('rs-date') as HTMLInputElement | null;
          if (dateEl) dateEl.value = row.next;
          this.openOverlay('resched-modal');
          return;
        }
        case 'remind':
          this.toast(`Reminder sent to ${row.patient}`, 'info');
          return;
        case 'complete':
          row.status = 'Completed';
          this.toast(`${row.patient} follow-up completed`);
          break;
        case 'cancel':
          this.confirmDelete(`${row.patient} · ${row.reason}`, () => {
            row.status = 'Cancelled';
            this.toast('Follow-up cancelled');
            this.refresh();
          });
          return;
      }
      this.refresh();
    });

    this.byId('rs-confirm')?.addEventListener('click', () => {
      const row = this.data.find((r) => r.id === this.actionId);
      if (row) {
        const dateEl = this.byId('rs-date') as HTMLInputElement | null;
        row.next = dateEl?.value || row.next;
        row.status = 'Upcoming';
      }
      this.closeOverlay('resched-modal');
      this.toast('Follow-up rescheduled');
      this.refresh();
    });

    this.document.querySelectorAll('[data-bulk]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ids = (this.grid?.selected() || []).map(Number);
        if (!ids.length) return;
        if ((btn as HTMLElement).dataset['bulk'] === 'remind') {
          this.toast(`Reminders sent to ${ids.length} patients`, 'info');
          this.grid?.clearSelection();
          return;
        }
        this.data.forEach((r) => {
          if (ids.indexOf(r.id) !== -1) r.status = 'Completed';
        });
        this.toast(`${ids.length} follow-ups completed`);
        this.grid?.clearSelection();
        this.refresh();
      });
    });

    this.byId('btn-reset')?.addEventListener('click', () => {
      const search = this.byId('search') as HTMLInputElement | null;
      if (search) search.value = '';
      const fDoctor = this.byId('filter-doctor') as HTMLSelectElement | null;
      if (fDoctor) fDoctor.value = '';
      const fStatus = this.byId('filter-status') as HTMLSelectElement | null;
      if (fStatus) fStatus.value = '';
      const fRange = this.byId('filter-range') as HTMLInputElement | null;
      if (fRange) fRange.value = '';
      this.grid?.refresh();
      this.toast('Filters cleared', 'info');
    });

    this.byId('btn-print')?.addEventListener('click', () => window.print());

    this.byId('btn-export')?.addEventListener('click', () => {
      const head = ['Patient', 'Phone', 'Doctor', 'Department', 'Previous Visit', 'Follow-up Date', 'Reason', 'Status'];
      const rows = this.data.map((r) => [r.patient, r.phone, r.doctor, r.dept, r.prev, r.next, r.reason, r.status]);
      const csv = [head]
        .concat(rows)
        .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = this.document.createElement('a');
      a.href = url;
      a.download = 'follow-up-appointments.csv';
      a.click();
      URL.revokeObjectURL(url);
      this.toast('Follow-ups exported');
    });

    this.closeOnBackdrop('del-modal');
    this.initDeleteModal();
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

  private detailUrl(r: FollowUp): string {
    return (
      'follow-up-appointment-detail.html?' +
      new URLSearchParams({
        id: String(r.id),
        patient: r.patient,
        doctor: r.doctor,
        dept: r.dept,
        prev: r.prev,
        next: r.next,
        reason: r.reason,
        status: r.status,
      }).toString()
    );
  }

  private stats(): void {
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-due', this.data.filter((r) => r.status === 'Due Today').length);
    set('stat-upcoming', this.data.filter((r) => r.status === 'Upcoming').length);
    set('stat-missed', this.data.filter((r) => r.status === 'Missed').length);
    set('stat-completed', this.data.filter((r) => r.status === 'Completed').length);
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

  /* ---------------- shared delete modal (ported from MC.confirmDelete/initDeleteModal/closeOnBackdrop) ---------------- */

  private confirmDelete(name: string, onConfirm: () => void): void {
    const nameEl = this.byId('del-name');
    if (nameEl) nameEl.textContent = name;
    this.delCallback = onConfirm;
    this.openModal('del-modal');
  }

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.close(el);
      return;
    }
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private initDeleteModal(): void {
    const btn = this.byId('del-confirm-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
        this.closeModal('del-modal');
      });
    }
    const cancel = this.byId('del-cancel-btn');
    if (cancel) cancel.addEventListener('click', () => this.closeModal('del-modal'));
  }

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    if (el) {
      el.addEventListener('mousedown', (e) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }
}
