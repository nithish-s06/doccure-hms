import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface QueueRow {
  id: number;
  token: string;
  patient: string;
  phone: string;
  doctor: string;
  room: string;
  wait: number;
  priority: string;
  status: string;
}

interface StatCfg {
  id: string;
  icon: string;
  label: string;
  tone: string;
  delta: number | null;
  meta?: string;
  spark: number[];
}

interface GridColumn<T> {
  cls?: string;
  render: (row: T) => string;
}

interface GridConfig<T> {
  tbody: HTMLElement;
  data: T[];
  pageSize: number;
  skipInitialRender?: boolean;
  search: HTMLInputElement | null;
  filters: { el: HTMLSelectElement | null; match: (row: T, v: string) => boolean }[];
  info: HTMLElement | null;
  pager: HTMLElement | null;
  selectAll: HTMLInputElement | null;
  bulkBar: HTMLElement | null;
  bulkCount: HTMLElement | null;
  empty: { icon: string; title: string; text: string };
  columns: GridColumn<T>[];
  rowKey?: (row: T) => number | string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "queue-management"
 * (queue-management.html). Reimplements MC.grid/MC.badge/MC.actions/
 * MC.apptStats locally since there is no global MC object in Angular.
 * del-modal here is page-owned Preline hs-overlay markup (not the shared
 * MC.deleteModalHTML template), so confirm/cancel wiring below drives it
 * directly instead of the MC.confirmDelete/MC.initDeleteModal pattern.
 */
@Component({
  imports: [],
  selector: 'app-queue-management',
  styleUrl: './queue-management.css',
  templateUrl: './queue-management.html',
})
export class QueueManagement implements AfterViewInit {
  private readonly STATUS: Record<string, string> = {
    Waiting: 'badge-amber',
    Called: 'badge-blue',
    'In Consultation': 'badge-purple',
    'On Hold': 'badge-gray',
    Completed: 'badge-green',
    Skipped: 'badge-red',
  };
  private readonly PRIORITY: Record<string, string> = {
    Normal: 'badge-gray',
    Urgent: 'badge-amber',
    Critical: 'badge-red',
  };
  private readonly PRIORITY_RANK: Record<string, number> = { Critical: 0, Urgent: 1, Normal: 2 };

  private data: QueueRow[] = [
    { id: 1, token: 'A-101', patient: 'James Morrison', phone: '(212) 555-0147', doctor: 'Dr. Sarah Chen', room: 'Room 204', wait: 4, priority: 'Normal', status: 'In Consultation' },
    { id: 2, token: 'A-102', patient: 'Linda Whitfield', phone: '(212) 555-0182', doctor: 'Dr. Sarah Chen', room: 'Room 204', wait: 11, priority: 'Normal', status: 'Called' },
    { id: 3, token: 'A-103', patient: 'Robert Castillo', phone: '(646) 555-0113', doctor: 'Dr. Sarah Chen', room: 'Room 204', wait: 18, priority: 'Urgent', status: 'Waiting' },
    { id: 4, token: 'B-201', patient: 'Angela Brooks', phone: '(718) 555-0164', doctor: 'Dr. Michael Reyes', room: 'Room 118', wait: 6, priority: 'Normal', status: 'In Consultation' },
    { id: 5, token: 'B-202', patient: 'Marcus Delgado', phone: '(347) 555-0198', doctor: 'Dr. Michael Reyes', room: 'Room 118', wait: 23, priority: 'Normal', status: 'Waiting' },
    { id: 6, token: 'B-203', patient: 'Priya Raghavan', phone: '(212) 555-0121', doctor: 'Dr. Michael Reyes', room: 'Room 118', wait: 31, priority: 'Critical', status: 'Waiting' },
    { id: 7, token: 'C-301', patient: 'Daniel Kowalski', phone: '(917) 555-0176', doctor: 'Dr. Emily Carter', room: 'Room 302', wait: 9, priority: 'Normal', status: 'On Hold' },
    { id: 8, token: 'C-302', patient: 'Sofia Alvarez', phone: '(646) 555-0155', doctor: 'Dr. Emily Carter', room: 'Room 302', wait: 14, priority: 'Urgent', status: 'Waiting' },
    { id: 9, token: 'C-303', patient: 'Gregory Hollis', phone: '(718) 555-0139', doctor: 'Dr. Emily Carter', room: 'Room 302', wait: 0, priority: 'Normal', status: 'Completed' },
    { id: 10, token: 'D-401', patient: 'Naomi Fitzgerald', phone: '(212) 555-0190', doctor: 'Dr. David Okonkwo', room: 'Room 106', wait: 0, priority: 'Normal', status: 'Completed' },
    { id: 11, token: 'D-402', patient: 'Ethan Caldwell', phone: '(347) 555-0102', doctor: 'Dr. David Okonkwo', room: 'Room 106', wait: 27, priority: 'Normal', status: 'Waiting' },
    { id: 12, token: 'D-403', patient: 'Camille Rousseau', phone: '(917) 555-0128', doctor: 'Dr. David Okonkwo', room: 'Room 106', wait: 35, priority: 'Urgent', status: 'Waiting' },
    { id: 13, token: 'A-104', patient: 'Theodore Nakamura', phone: '(646) 555-0187', doctor: 'Dr. Sarah Chen', room: 'Room 204', wait: 42, priority: 'Normal', status: 'Skipped' },
    { id: 14, token: 'B-204', patient: 'Hannah Whitmore', phone: '(212) 555-0163', doctor: 'Dr. Michael Reyes', room: 'Room 118', wait: 8, priority: 'Normal', status: 'Waiting' },
  ];

  private grid: {
    refresh: () => void;
    selected: () => string[];
    clearSelection: () => void;
    setData: (d: QueueRow[]) => void;
  } | null = null;
  private announceId: number | null = null;
  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;

    this.apptStats(this.byId('stats-row'), [
      { id: 'stat-waiting', icon: 'icon-hourglass', label: 'Waiting', tone: 'amber', delta: 5.4, meta: 'vs 1 hour ago', spark: [3, 5, 4, 6, 7, 6, 8] },
      { id: 'stat-called', icon: 'icon-bell-ring', label: 'Called', tone: 'sky', delta: 0, meta: 'vs 1 hour ago', spark: [1, 2, 1, 2, 1, 2, 1] },
      { id: 'stat-consult', icon: 'icon-stethoscope', label: 'In Consultation', tone: 'purple', delta: 2.1, meta: 'vs 1 hour ago', spark: [2, 3, 2, 4, 3, 4, 3] },
      { id: 'stat-completed', icon: 'icon-circle-check', label: 'Completed', tone: 'emerald', delta: 18.6, meta: 'vs 1 hour ago', spark: [2, 4, 6, 8, 10, 12, 14] },
    ]);

    this.grid = this.makeGrid({
      tbody,
      data: this.data,
      pageSize: 10,
      skipInitialRender: true,
      search: this.byId('search') as HTMLInputElement | null,
      filters: [
        { el: this.byId('filter-doctor') as HTMLSelectElement | null, match: (r, v) => r.doctor === v },
        { el: this.byId('filter-priority') as HTMLSelectElement | null, match: (r, v) => r.priority === v },
        { el: this.byId('filter-status') as HTMLSelectElement | null, match: (r, v) => r.status === v },
      ],
      info: this.byId('info'),
      pager: this.byId('pager'),
      selectAll: this.byId('select-all') as HTMLInputElement | null,
      bulkBar: this.byId('bulk-bar'),
      bulkCount: this.byId('bulk-count'),
      empty: { icon: 'icon-ticket', title: 'Queue is empty', text: 'No tokens match the current filters.' },
      columns: [
        { render: (r) => `<a href="${this.detailUrl(r)}" class="inline-flex items-center justify-center min-w-14 px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 font-bold text-gray-900 hover:underline">${r.token}</a>` },
        { render: (r) => `<div><p class="font-medium text-gray-900">${r.patient}</p><p class="text-xs text-gray-500 dark:text-gray-400">${r.phone}</p></div>` },
        { render: (r) => r.doctor },
        { render: (r) => r.room },
        { render: (r) => this.waitCell(r) },
        { render: (r) => this.badge(this.PRIORITY, r.priority) },
        { render: (r) => this.badge(this.STATUS, r.status) },
        {
          cls: 'text-right',
          render: (r) =>
            this.actions(r.id, [
              { label: 'Call', icon: 'icon-bell-ring', act: 'call' },
              { label: 'Announce', icon: 'icon-volume-2', act: 'announce' },
              { label: 'Start Consultation', icon: 'icon-play', act: 'start' },
              { label: 'Hold', icon: 'icon-pause', act: 'hold' },
              { label: 'Skip', icon: 'icon-skip-forward', act: 'skip' },
              { label: 'Complete', icon: 'icon-circle-check', act: 'complete' },
              { label: 'Print Token', icon: 'icon-printer', act: 'print' },
              { label: 'Remove', icon: 'icon-trash-2', act: 'delete', danger: true },
            ]),
        },
      ],
    });

    tbody.addEventListener('click', (e) => this.onRowClick(e));

    this.byId('btn-call-next')?.addEventListener('click', () => this.onCallNext());

    this.qsa('[data-bulk]').forEach((btn) => btn.addEventListener('click', () => this.onBulk(btn as HTMLElement)));

    this.byId('btn-reset')?.addEventListener('click', () => this.onReset());
    this.byId('btn-print')?.addEventListener('click', () => window.print());
    this.byId('btn-export')?.addEventListener('click', () => this.onExport());

    this.byId('announce-confirm')?.addEventListener('click', () => this.onAnnounceConfirm());
    this.byId('del-confirm-btn')?.addEventListener('click', () => {
      if (this.delCallback) this.delCallback();
    });

    this.stats();
    this.nowServing();
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private detailUrl(r: QueueRow): string {
    return 'queue-token-detail.html?' + new URLSearchParams({ id: String(r.id), token: r.token, patient: r.patient, status: r.status }).toString();
  }

  private stats(): void {
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-waiting', this.data.filter((r) => r.status === 'Waiting').length);
    set('stat-called', this.data.filter((r) => r.status === 'Called').length);
    set('stat-consult', this.data.filter((r) => r.status === 'In Consultation').length);
    set('stat-completed', this.data.filter((r) => r.status === 'Completed').length);
  }

  private nextInLine(): QueueRow | undefined {
    return this.data
      .filter((r) => r.status === 'Waiting')
      .sort((a, b) => {
        const p = this.PRIORITY_RANK[a.priority] - this.PRIORITY_RANK[b.priority];
        return p !== 0 ? p : b.wait - a.wait;
      })[0];
  }

  private nowServing(): void {
    const current = this.data.find((r) => r.status === 'In Consultation') || this.data.find((r) => r.status === 'Called');
    const setText = (id: string, v: string) => {
      const el = this.byId(id);
      if (el) el.textContent = v;
    };
    setText('now-token', current ? current.token : '—');
    setText('now-patient', current ? current.patient : 'No patient called');
    setText('now-doctor', current ? current.doctor : '—');
    setText('now-room', current ? current.room : '—');
    const next = this.nextInLine();
    setText('now-next', next ? 'Next up: ' + next.token + ' · ' + next.patient : 'Next up: queue is clear');
  }

  private waitCell(r: QueueRow): string {
    if (r.status === 'Completed') return '<span class="text-gray-400">—</span>';
    const cls = r.wait >= 30 ? 'text-danger font-semibold' : r.wait >= 15 ? 'text-amber-600 font-medium' : 'text-gray-600 dark:text-gray-400';
    return `<span class="${cls}">${r.wait} min</span>`;
  }

  private refresh(): void {
    this.grid?.setData(this.data);
    this.stats();
    this.nowServing();
  }

  /* ---------------- row actions ---------------- */

  private onRowClick(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-act]') as HTMLElement | null;
    if (!btn) return;
    const row = this.data.find((r) => r.id === parseInt(btn.dataset['id'] || '', 10));
    if (!row) return;
    const w = window as any;

    switch (btn.dataset['act']) {
      case 'announce': {
        this.announceId = row.id;
        const tokenEl = this.byId('announce-token');
        if (tokenEl) tokenEl.textContent = row.token;
        const patientEl = this.byId('announce-patient');
        if (patientEl) patientEl.textContent = row.patient;
        const roomEl = this.byId('announce-room');
        if (roomEl) roomEl.textContent = row.doctor + ' · ' + row.room;
        if (w.HSOverlay) w.HSOverlay.open('#announce-modal');
        return;
      }
      case 'call':
        row.status = 'Called';
        this.toast('Called ' + row.token + ' · ' + row.patient);
        break;
      case 'start':
        row.status = 'In Consultation';
        this.toast(row.patient + ' is now in consultation');
        break;
      case 'hold':
        row.status = 'On Hold';
        this.toast(row.token + ' placed on hold', 'info');
        break;
      case 'skip':
        row.status = 'Skipped';
        this.toast(row.token + ' skipped', 'info');
        break;
      case 'complete':
        row.status = 'Completed';
        row.wait = 0;
        this.toast(row.patient + ' marked complete');
        break;
      case 'print':
        this.toast('Printing token ' + row.token, 'info');
        window.print();
        return;
      case 'delete': {
        const nameEl = this.byId('del-name');
        if (nameEl) nameEl.textContent = row.token + ' · ' + row.patient;
        this.delCallback = () => {
          this.data = this.data.filter((r) => r.id !== row.id);
          this.toast('Removed from queue');
          this.refresh();
        };
        if (w.HSOverlay) w.HSOverlay.open('#del-modal');
        return;
      }
    }
    this.refresh();
  }

  private onCallNext(): void {
    const next = this.nextInLine();
    if (!next) {
      this.toast('No patients waiting', 'info');
      return;
    }
    this.data.forEach((r) => {
      if (r.status === 'Called') r.status = 'In Consultation';
    });
    next.status = 'Called';
    this.toast('Now calling ' + next.token + ' · ' + next.patient);
    this.refresh();
  }

  private onBulk(btn: HTMLElement): void {
    const ids = (this.grid?.selected() || []).map(Number);
    if (!ids.length) return;
    this.data.forEach((r) => {
      if (ids.indexOf(r.id) === -1) return;
      if (btn.dataset['bulk'] === 'hold') {
        r.status = 'On Hold';
      } else {
        r.status = 'Completed';
        r.wait = 0;
      }
    });
    this.toast(ids.length + ' tokens updated');
    this.grid?.clearSelection();
    this.refresh();
  }

  private onReset(): void {
    (this.byId('search') as HTMLInputElement).value = '';
    (this.byId('filter-doctor') as HTMLSelectElement).value = '';
    (this.byId('filter-priority') as HTMLSelectElement).value = '';
    (this.byId('filter-status') as HTMLSelectElement).value = '';
    this.grid?.refresh();
    this.toast('Filters cleared', 'info');
  }

  private onExport(): void {
    const head = ['Token', 'Patient', 'Phone', 'Doctor', 'Room', 'Waiting (min)', 'Priority', 'Status'];
    const rows = this.data.map((r) => [r.token, r.patient, r.phone, r.doctor, r.room, r.wait, r.priority, r.status]);
    const csv = [head, ...rows].map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = this.document.createElement('a');
    a.href = url;
    a.download = 'queue.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Queue exported');
  }

  private onAnnounceConfirm(): void {
    const targets: string[] = [];
    if ((this.byId('an-display') as HTMLInputElement).checked) targets.push('display');
    if ((this.byId('an-audio') as HTMLInputElement).checked) targets.push('audio');
    if ((this.byId('an-sms') as HTMLInputElement).checked) targets.push('SMS');
    if (!targets.length) {
      this.toast('Select at least one announcement channel', 'error');
      return;
    }
    const row = this.data.find((r) => r.id === this.announceId);
    if (row && row.status === 'Waiting') row.status = 'Called';
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.close('#announce-modal');
    this.toast('Announced ' + (row ? row.token : '') + ' on ' + targets.join(', '));
    this.refresh();
  }

  /* ---------------- badge / actions / grid (ported from MC.badge / MC.actions / MC.grid) ---------------- */

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
        `class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ${
          it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
        }"><i class="${it.icon} text-sm"></i>${it.label}</button>`;
    });
    return html + '</div></div>';
  }

  private makeGrid<T extends { id: number }>(cfg: GridConfig<T>) {
    const key = cfg.rowKey || ((r: T) => r.id);
    const state = { rows: cfg.data.slice(), page: 1, perPage: cfg.pageSize, selected: new Set<string>() };

    const filtered = (): T[] => {
      const term = cfg.search ? cfg.search.value.trim().toLowerCase() : '';
      return state.rows.filter((row) => {
        if (term && !Object.values(row as any).join(' ').toLowerCase().includes(term)) return false;
        return cfg.filters.every((f) => {
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
      const boxes = this.qsa<HTMLInputElement>('[data-row-select]', cfg.tbody);
      const checked = boxes.filter((b) => b.checked).length;
      cfg.selectAll.checked = boxes.length > 0 && checked === boxes.length;
      cfg.selectAll.indeterminate = checked > 0 && checked < boxes.length;
    };

    const renderEmpty = (colspan: number) => {
      const e = cfg.empty;
      const tr = this.document.createElement('tr');
      tr.innerHTML =
        `<td colspan="${colspan}" class="py-12 text-center">` +
        '<div class="flex flex-col items-center gap-2">' +
        '<span class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">' +
        `<i class="${e.icon} text-xl text-gray-400"></i></span>` +
        `<p class="text-sm font-semibold text-gray-900">${e.title}</p>` +
        `<p class="text-xs text-gray-500 dark:text-gray-400">${e.text}</p></div></td>`;
      cfg.tbody.appendChild(tr);
    };

    const pageButton = (label: string, target: number, opts: { active?: boolean; disabled?: boolean; ariaLabel?: string; icon?: string }): HTMLButtonElement => {
      const b = this.document.createElement('button');
      b.type = 'button';
      b.className = opts.active
        ? 'min-w-9 h-9 px-2 rounded-lg text-sm font-semibold bg-primary text-white'
        : 'min-w-9 h-9 px-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none';
      b.disabled = !!opts.disabled;
      if (opts.ariaLabel) b.setAttribute('aria-label', opts.ariaLabel);
      if (opts.active) b.setAttribute('aria-current', 'page');
      if (opts.icon) {
        const i = this.document.createElement('i');
        i.className = opts.icon + ' text-sm';
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
      for (let p = start; p <= end; p++) cfg.pager.appendChild(pageButton(String(p), p, { active: p === state.page }));
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
      const w = window as any;
      if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
    };

    if (cfg.search) {
      cfg.search.addEventListener('input', () => {
        state.page = 1;
        render();
      });
    }

    cfg.filters.forEach((f) => {
      f.el?.addEventListener('change', () => {
        state.page = 1;
        render();
      });
    });

    if (cfg.selectAll) {
      cfg.selectAll.addEventListener('change', () => {
        this.qsa<HTMLInputElement>('[data-row-select]', cfg.tbody).forEach((b) => {
          b.checked = cfg.selectAll!.checked;
          if (b.checked) state.selected.add(b.value);
          else state.selected.delete(b.value);
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
      setData: (d: T[]) => {
        state.rows = d.slice();
        state.page = 1;
        render();
      },
    };
  }

  /* ---------------- appointment stat cards (ported from MC.apptStat/apptStats) ---------------- */

  private sparkline(series: number[]): string {
    if (!series || series.length < 2) return '';
    const W = 80;
    const H = 24;
    const max = Math.max.apply(null, series);
    const min = Math.min.apply(null, series);
    const span = max - min || 1;
    const step = W / (series.length - 1);
    const points = series.map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (H - 2 - ((v - min) / span) * (H - 4)).toFixed(1);
      return x + ',' + y;
    });
    const area = '0,' + H + ' ' + points.join(' ') + ' ' + W + ',' + H;
    const last = points[points.length - 1].split(',');
    return (
      `<svg class="appt-stat-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
      `<polygon points="${area}" fill="currentColor" opacity="0.12"></polygon>` +
      `<polyline points="${points.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>` +
      `<circle cx="${last[0]}" cy="${last[1]}" r="1.8" fill="currentColor"></circle></svg>`
    );
  }

  private delta(value: number | null): string {
    if (value === null || value === undefined) return '';
    const up = value > 0;
    const flat = value === 0;
    const cls = flat ? 'is-flat' : up ? 'is-up' : 'is-down';
    const icon = flat ? 'icon-minus' : up ? 'icon-trending-up' : 'icon-trending-down';
    const sign = up ? '+' : '';
    const label = flat ? 'No change' : sign + value + '% ' + (up ? 'increase' : 'decrease');
    return (
      `<span class="appt-stat-delta ${cls}" title="${label}">` +
      `<i class="${icon} text-[10px]" aria-hidden="true"></i>` +
      `<span class="sr-only">${label}</span>` +
      `<span aria-hidden="true">${sign}${value}%</span></span>`
    );
  }

  private apptStat(cfg: StatCfg): string {
    return (
      `<article class="appt-stat tone-${cfg.tone || 'primary'}">` +
      '<div class="appt-stat-head">' +
      `<span class="appt-stat-icon"><i class="${cfg.icon}" aria-hidden="true"></i></span>` +
      this.delta(cfg.delta) +
      '</div>' +
      `<p class="appt-stat-value" id="${cfg.id}">0</p>` +
      `<p class="appt-stat-label">${cfg.label}</p>` +
      '<div class="appt-stat-foot">' +
      this.sparkline(cfg.spark) +
      `<span class="appt-stat-meta">${cfg.meta || 'vs last week'}</span>` +
      '</div></article>'
    );
  }

  private apptStats(container: HTMLElement | null, list: StatCfg[]): void {
    if (!container) return;
    container.innerHTML = list.map((c) => this.apptStat(c)).join('');
  }
}
