import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface Discharge {
  id: number;
  name: string;
  dept: string;
  doctor: string;
  ward: string;
  admit: string;
  discharge: string;
  followUp: string;
  status: string;
  ins: string;
  fu: boolean;
  los: number;
  notes?: string;
}

interface ModalOptions {
  title: string;
  sub?: string;
  icon?: string;
  accent?: string;
  body?: string;
  confirm?: string;
  danger?: boolean;
  onConfirm?: () => void | false;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "discharges".
 * A full CRUD-list-style page: search/filter (including an advanced filter
 * drawer), sort, pagination, row menu, bulk bar, a patient clearance widget,
 * a detail drawer, and assorted per-row/bulk modals (approve, cancel,
 * billing, follow-up, etc.) — all backed by in-memory seed data since there
 * is no backend.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-discharges',
  styleUrl: './discharges.css',
  templateUrl: './discharges.html',
})
export class Discharges implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly DEPT_ACC: Record<string, string> = {
    Cardiology: 'rose',
    Neurology: 'violet',
    Orthopedics: 'amber',
    Pediatrics: 'sky',
    ICU: 'rose',
    Maternity: 'teal',
    Oncology: 'indigo',
  };

  private readonly today = new Date();
  private readonly DOCTORS = ['Dr. Chen', 'Dr. Kumar', 'Dr. Mills', 'Dr. Park', 'Dr. Wang', 'Dr. Rivas'];
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'ICU', 'Maternity', 'Oncology'];
  private readonly WARDS = ['General 2F', 'ICU', 'Maternity', 'Isolation'];

  private data: Discharge[] = [];
  private nextId = 1;

  private state: {
    view: 'grid' | 'list';
    q: string;
    dept: string;
    status: string;
    sort: string;
    page: number;
    size: number;
    adv: Record<string, string>;
    sel: Record<number, boolean>;
  } = { view: 'grid', q: '', dept: '', status: '', sort: 'newest', page: 1, size: 12, adv: {}, sel: {} };

  /* ---- Patient Clearance ---- */
  private clearItems: [string, string, string, boolean][] = [
    ['Doctor Approval', 'icon-stethoscope', 'rose', true],
    ['Nurse Clearance', 'icon-heart-pulse', 'teal', true],
    ['Pharmacy', 'icon-pill', 'emerald', true],
    ['Laboratory', 'icon-flask-conical', 'sky', false],
    ['Radiology', 'icon-scan', 'violet', true],
    ['Billing', 'icon-receipt', 'amber', false],
    ['Insurance', 'icon-shield-check', 'emerald', true],
    ['Administration', 'icon-building', 'indigo', false],
  ];

  private menu: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.data = this.buildSeedData();
    this.nextId = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    // The static grid holds 6 cards; render once so the default page shows state.size (12).
    setTimeout(() => {
      const sk = this.byId('dc-skeleton');
      const ct = this.byId('dc-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'dc-fadein .4s ease';
      }
    }, 1500);

    this.wireToolbar();
    this.wirePageNav();
    this.wireSelectAll();
    this.wireGridDelegation();
    this.wireWidgetsDelegation();
    this.wireDocumentDelegation();
    this.wireModalDismiss();
    this.wireBulkBar();
    this.wireGlobalKeys();
    this.wireFilterDrawer();

    this.render();
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qs<T extends Element = Element>(selector: string, root?: ParentNode): T | null {
    return (root || this.document).querySelector(selector);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private acc(d: string): string {
    return `dc-c-${this.DEPT_ACC[d] || 'primary'}`;
  }

  private did(n: number): string {
    return `DIS-${String(n).padStart(4, '0')}`;
  }

  private detailUrl(): string {
    return 'discharge-detail.html';
  }

  private photo(id: number): string {
    return `assets/img/avatar/avatar-${String(((id - 1) % 30) + 1).padStart(2, '0')}.jpg`;
  }

  private iso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private dAgo(n: number): string {
    const d = new Date(this.today);
    d.setDate(d.getDate() - n);
    return this.iso(d);
  }

  private dAhead(n: number): string {
    const d = new Date(this.today);
    d.setDate(d.getDate() + n);
    return this.iso(d);
  }

  /* ---------------- seed data ---------------- */

  private mk(o: Omit<Discharge, 'id' | 'los'>): Omit<Discharge, 'id'> {
    const los = Math.max(1, Math.round((new Date(o.discharge).getTime() - new Date(o.admit).getTime()) / 86400000));
    return { ...o, los };
  }

  private buildSeedData(): Discharge[] {
    const raw: Omit<Discharge, 'id' | 'los'>[] = [
      { name: 'James Morrison', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', admit: this.dAgo(5), discharge: this.dAgo(0), followUp: this.dAhead(7), status: 'Completed', ins: 'Verified', fu: true },
      { name: 'Sarah Adams', dept: 'Neurology', doctor: 'Dr. Kumar', ward: 'General 2F', admit: this.dAgo(3), discharge: this.dAgo(0), followUp: this.dAhead(10), status: 'Ready', ins: 'Verified', fu: true },
      { name: 'Robert Clark', dept: 'ICU', doctor: 'Dr. Mills', ward: 'ICU', admit: this.dAgo(9), discharge: this.dAgo(0), followUp: this.dAhead(3), status: 'Pending', ins: 'Pending', fu: true },
      { name: 'Emily Johnson', dept: 'Maternity', doctor: 'Dr. Park', ward: 'Maternity', admit: this.dAgo(4), discharge: this.dAgo(1), followUp: this.dAhead(14), status: 'Completed', ins: 'Verified', fu: false },
      { name: 'David Torres', dept: 'Orthopedics', doctor: 'Dr. Wang', ward: 'General 2F', admit: this.dAgo(7), discharge: this.dAgo(1), followUp: this.dAhead(21), status: 'Approved', ins: 'Verified', fu: true },
      { name: 'Linda Nguyen', dept: 'Oncology', doctor: 'Dr. Rivas', ward: 'General 2F', admit: this.dAgo(6), discharge: this.dAgo(1), followUp: this.dAhead(5), status: 'Pending', ins: 'Pending', fu: true },
      { name: 'Michael Harris', dept: 'ICU', doctor: 'Dr. Kumar', ward: 'ICU', admit: this.dAgo(12), discharge: this.dAgo(2), followUp: this.dAhead(2), status: 'Completed', ins: 'Verified', fu: true },
      { name: 'Anna Peterson', dept: 'Pediatrics', doctor: 'Dr. Park', ward: 'General 2F', admit: this.dAgo(3), discharge: this.dAgo(2), followUp: this.dAhead(9), status: 'Ready', ins: 'Uninsured', fu: false },
      { name: 'Carlos Mendez', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', admit: this.dAgo(8), discharge: this.dAgo(2), followUp: this.dAhead(7), status: 'Completed', ins: 'Verified', fu: true },
      { name: 'Olivia Brown', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', admit: this.dAgo(2), discharge: this.dAgo(3), followUp: this.dAhead(12), status: 'Cancelled', ins: 'Verified', fu: false },
      { name: 'William Davis', dept: 'Neurology', doctor: 'Dr. Kumar', ward: 'General 2F', admit: this.dAgo(10), discharge: this.dAgo(3), followUp: this.dAhead(4), status: 'Approved', ins: 'Verified', fu: true },
      { name: 'Mia Robinson', dept: 'Orthopedics', doctor: 'Dr. Wang', ward: 'General 2F', admit: this.dAgo(5), discharge: this.dAgo(4), followUp: this.dAhead(15), status: 'Completed', ins: 'Uninsured', fu: false },
      { name: 'Isabella Garcia', dept: 'Oncology', doctor: 'Dr. Rivas', ward: 'General 2F', admit: this.dAgo(11), discharge: this.dAgo(4), followUp: this.dAhead(6), status: 'Pending', ins: 'Pending', fu: true },
      { name: 'Mason Lee', dept: 'Orthopedics', doctor: 'Dr. Wang', ward: 'General 2F', admit: this.dAgo(6), discharge: this.dAgo(5), followUp: this.dAhead(8), status: 'Completed', ins: 'Verified', fu: true },
    ];
    return raw.map((r, i) => ({ id: i + 1, ...this.mk(r) }));
  }

  private selN(): number {
    return Object.keys(this.state.sel).length;
  }

  /* ---------------- render helpers ---------------- */

  private statusBadge(s: string): string {
    const c: Record<string, string> = { Completed: 'completed', Approved: 'approved', Ready: 'ready', Pending: 'pending', Cancelled: 'cancelled' };
    return `<span class="dc-badge ${c[s] || 'pending'}">${this.esc(s)}</span>`;
  }

  private insBadge(i: string): string {
    const m: Record<string, [string, string]> = {
      Verified: ['emerald', 'icon-badge-check'],
      Pending: ['amber', 'icon-clock'],
      Uninsured: ['rose', 'icon-shield-x'],
    };
    const a = m[i] || m['Pending'];
    return `<span class="dc-chip dc-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(i)}</span>`;
  }

  private fuTag(r: Discharge): string {
    return r.fu
      ? '<span class="dc-tag dc-c-amber"><i class="icon-calendar-clock text-[10px]"></i>Follow-up</span>'
      : '<span class="dc-tag dc-c-emerald"><i class="icon-check text-[10px]"></i>No follow-up</span>';
  }

  private avatar(r: Discharge): string {
    return `<span class="${this.acc(r.dept)} dc-ava-ring"><img class="dc-ava object-cover" src="${this.photo(r.id)}" alt=""></span>`;
  }

  private filtered(): Discharge[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    let rows = this.data.filter((r) => {
      if (q && !(`${r.name} ${this.did(r.id)} ${r.doctor} ${r.dept}`.toLowerCase().indexOf(q) > -1)) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['doctor'] && r.doctor !== a['doctor']) return false;
      if (a['ward'] && r.ward !== a['ward']) return false;
      if (a['fu'] === 'Required' && !r.fu) return false;
      if (a['fu'] === 'Not required' && r.fu) return false;
      if (a['ins'] && r.ins !== a['ins']) return false;
      if (a['from'] && r.discharge < a['from']) return false;
      if (a['to'] && r.discharge > a['to']) return false;
      return true;
    });
    rows = rows.slice().sort((x, y) => {
      switch (this.state.sort) {
        case 'newest':
          return y.discharge.localeCompare(x.discharge);
        case 'oldest':
          return x.discharge.localeCompare(y.discharge);
        case 'name':
          return x.name.localeCompare(y.name);
        case 'los':
          return y.los - x.los;
        case 'status':
          return x.status.localeCompare(y.status);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: Discharge): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="dc-card ${this.acc(r.dept)}${sel}" data-id="${r.id}"><div class="p-4">` +
      `<div class="flex items-start gap-3"><input type="checkbox" class="dc-check mt-1 dc-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}>${this.avatar(r)}` +
      `<div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-primary"><a href="${this.detailUrl()}" class="hover:underline">${this.did(r.id)}</a></p></div>` +
      `<button class="dc-mini dc-menu-btn" data-id="${r.id}"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3">${this.statusBadge(r.status)}${this.fuTag(r)}${this.insBadge(r.ins)}</div>` +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">' +
      `<span class="dc-kv"><i class="icon-building-2 text-primary/70"></i><b class="truncate">${this.esc(r.dept)}</b></span>` +
      `<span class="dc-kv"><i class="icon-stethoscope text-primary/70"></i><b class="truncate">${this.esc(r.doctor)}</b></span>` +
      `<span class="dc-kv"><i class="icon-log-in text-primary/70"></i>Adm ${r.admit}</span>` +
      `<span class="dc-kv"><i class="icon-log-out text-primary/70"></i>Dis ${r.discharge}</span>` +
      `<span class="dc-kv"><i class="icon-timer text-primary/70"></i>Stay <span class="dc-los">${r.los}d</span></span>` +
      `<span class="dc-kv"><i class="icon-calendar-clock text-primary/70"></i>${r.fu ? r.followUp : '—'}</span>` +
      '</div>' +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><span class="text-[11px] text-gray-400"><i class="icon-timer"></i> ${r.los}-day stay</span>` +
      `<div class="flex gap-1.5"><button class="dc-mini dc-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="dc-mini dc-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>` +
      '</div></article>'
    );
  }

  private rowHTML(r: Discharge): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<tr data-id="${r.id}" class="${sel.trim()}">` +
      `<td><input type="checkbox" class="dc-check dc-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}></td>` +
      `<td class="font-mono text-primary"><a href="${this.detailUrl()}" class="hover:underline">${this.did(r.id)}</a></td>` +
      `<td class="font-semibold text-gray-900 dark:text-white">${this.esc(r.name)}</td>` +
      `<td>${this.esc(r.dept)}</td>` +
      `<td>${this.esc(r.doctor)}</td>` +
      `<td>${r.admit}</td>` +
      `<td>${r.discharge}</td>` +
      `<td>${r.los}d</td>` +
      `<td>${r.fu ? r.followUp : '—'}</td>` +
      `<td>${this.statusBadge(r.status)}</td>` +
      `<td class="text-right"><div class="flex gap-1.5 justify-end"><button class="dc-mini dc-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="dc-mini dc-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></td>` +
      '</tr>'
    );
  }

  private render(): void {
    const grid = this.byId('dc-gridview');
    const empty = this.byId('dc-empty');
    const pager = this.byId('dc-pager');
    const listView = this.byId('dc-listview');
    const tbody = this.byId('dc-tbody');
    if (!grid || !empty || !pager) return;

    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);

    const count = this.byId('dc-count');
    if (count) count.textContent = `${total} of ${this.data.length} discharges`;
    empty.classList.toggle('hidden', total !== 0);
    pager.classList.toggle('hidden', total === 0);
    if (this.state.view === 'grid') {
      grid.classList.remove('hidden');
      if (listView) listView.classList.add('hidden');
    } else {
      grid.classList.add('hidden');
      if (listView) listView.classList.remove('hidden');
    }
    grid.innerHTML = pageRows.map((r) => this.cardHTML(r)).join('');
    if (tbody) tbody.innerHTML = pageRows.map((r) => this.rowHTML(r)).join('');
    const pageInfo = this.byId('dc-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No records';
    this.pageNav(pages);

    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa1 = this.byId('dc-select-all') as HTMLInputElement | null;
    if (sa1) sa1.checked = !!allSel;
    const sa2 = this.byId('dc-select-all-2') as HTMLInputElement | null;
    if (sa2) sa2.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="dc-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="dc-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="dc-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const nav = this.byId('dc-page-nav');
    if (nav) nav.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.dc-ring[data-p]', scope || this.document).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
      });
    });
  }

  /* ---------------- KPIs / dashboard widgets ---------------- */

  private buildKPIs(): void {
    const by = (f: (r: Discharge) => boolean) => this.data.filter(f).length;
    const k: [string, number, string, string, number, string][] = [
      ["Today's Discharges", by((r) => r.discharge === this.iso(this.today)), 'primary', 'icon-user-check', 62, '+12%'],
      ['Pending Approval', by((r) => r.status === 'Pending'), 'amber', 'icon-clock', 40, 'Queue'],
      ['Ready for Discharge', by((r) => r.status === 'Ready'), 'teal', 'icon-clipboard-check', 55, 'Ready'],
      ['Completed', by((r) => r.status === 'Completed'), 'emerald', 'icon-badge-check', 84, 'Done'],
      ['Follow-up Required', by((r) => r.fu), 'violet', 'icon-calendar-clock', 48, 'Care'],
      ['Beds Released Today', by((r) => r.discharge === this.iso(this.today) && r.status === 'Completed') + 5, 'sky', 'icon-bed', 33, 'Free'],
    ];
    const spark = '1,14 9,11 17,13 25,7 33,9 41,4 53,2';
    const kpis = this.byId('dc-kpis');
    if (kpis) {
      kpis.innerHTML = k
        .map(
          (c) =>
            `<div class="dc-stat dc-c-${c[2]}"><div class="flex items-start justify-between"><span class="dc-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="dc-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="dc-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--dc-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
    }
    this.initRings(this.byId('dc-kpis'));

    const dept: [string, number, string][] = [
      ['Cardiology', 28, 'rose'],
      ['Orthopedics', 22, 'amber'],
      ['Neurology', 16, 'violet'],
    ];
    const deptwidget = this.byId('dc-deptwidget');
    if (deptwidget) {
      deptwidget.innerHTML = dept
        .map(
          (d) =>
            `<div class="dc-c-${d[2]}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${d[0]}</span><b class="text-gray-900 dark:text-white">${d[1]}%</b></div><div class="dc-bar"><i style="width:${d[1] * 3.2}%"></i></div></div>`
        )
        .join('');
    }

    const los: [string, number, string][] = [
      ['0–2 days', 34, 'emerald'],
      ['3–5 days', 42, 'primary'],
      ['6–10 days', 18, 'amber'],
      ['10+ days', 6, 'rose'],
    ];
    const loswidget = this.byId('dc-loswidget');
    if (loswidget) {
      loswidget.innerHTML = los
        .map(
          (l) =>
            `<div class="flex items-center gap-2 dc-c-${l[2]}"><span class="text-[11px] text-gray-500 dark:text-gray-400" style="width:4.5rem">${l[0]}</span><div class="dc-bar flex-1"><i style="width:${l[1]}%"></i></div><b class="text-xs text-gray-900 dark:text-white">${l[1]}%</b></div>`
        )
        .join('');
    }

    const todayBadge = this.byId('dc-today-badge');
    if (todayBadge) todayBadge.textContent = String(by((r) => r.discharge === this.iso(this.today)));
    const pendingBadge = this.byId('dc-pending-badge');
    if (pendingBadge) pendingBadge.textContent = String(by((r) => r.status === 'Pending'));
    const bedsBadge = this.byId('dc-beds-badge');
    if (bedsBadge) bedsBadge.textContent = '18';
    const avg = (this.data.reduce((s, r) => s + r.los, 0) / this.data.length).toFixed(1);
    const avgLos = this.byId('dc-avg-los');
    if (avgLos) avgLos.textContent = avg;

    this.buildClearance();
  }

  private buildClearance(): void {
    const clearance = this.byId('dc-clearance');
    if (clearance) {
      clearance.innerHTML = this.clearItems
        .map(
          (c, i) =>
            `<button class="dc-clear dc-c-${c[2]}${c[3] ? ' done' : ''}" data-clear="${i}"><span class="dc-clear-ico"><i class="${c[1]}"></i></span><span class="text-xs font-bold text-gray-900 dark:text-white">${c[0]}</span><span class="dc-clear-badge"><i class="icon-${c[3] ? 'check' : 'clock'}"></i>${c[3] ? 'Cleared' : 'Pending'}</span></button>`
        )
        .join('');
    }
    const done = this.clearItems.filter((c) => c[3]).length;
    const clearCount = this.byId('dc-clear-count');
    if (clearCount) clearCount.textContent = `${done}/8`;
  }

  private updateBulk(): void {
    const n = this.selN();
    const cnt = this.byId('dc-bulk-count');
    if (cnt) cnt.textContent = String(n);
    const bar = this.byId('dc-bulkbar');
    if (bar) (bar as HTMLElement).hidden = n === 0;
  }

  private selectedRecs(): Discharge[] {
    return this.data.filter((r) => this.state.sel[r.id]);
  }

  /* ---------------- action menu ---------------- */

  private closeMenu(): void {
    if (this.menu) {
      this.menu.remove();
      this.menu = null;
    }
  }

  private showMenu(btn: HTMLElement, id: number): void {
    this.closeMenu();
    const I = (ic: string, l: string, a: string, d?: boolean) => `<button data-a="${a}" data-id="${id}"${d ? ' class="danger"' : ''}><i class="${ic}"></i>${l}</button>`;
    const html =
      '<div class="dc-menu"><p class="dc-menu-lbl">Manage</p>' +
      I('icon-eye', 'View Details', 'view') +
      I('icon-edit', 'Edit Discharge', 'edit') +
      I('icon-badge-check', 'Approve Discharge', 'approve') +
      I('icon-x-circle', 'Cancel Discharge', 'cancel') +
      '<div class="dc-menu-sep"></div><p class="dc-menu-lbl">Documents</p>' +
      I('icon-printer', 'Print Summary', 'print') +
      I('icon-download', 'Download PDF', 'pdf') +
      I('icon-file-text', 'Generate Letter', 'letter') +
      I('icon-receipt', 'Billing Summary', 'billing') +
      '<div class="dc-menu-sep"></div><p class="dc-menu-lbl">Care & Share</p>' +
      I('icon-calendar-plus', 'Schedule Follow-up', 'followup') +
      I('icon-message-circle', 'Send SMS', 'sms') +
      I('icon-mail', 'Send Email', 'email') +
      '<div class="dc-menu-sep"></div>' +
      I('icon-archive', 'Archive', 'archive') +
      I('icon-trash-2', 'Delete', 'delete', true) +
      '</div>';
    const w = this.document.createElement('div');
    w.innerHTML = html;
    this.menu = w.firstChild as HTMLElement;
    this.menu.style.position = 'fixed';
    this.document.body.appendChild(this.menu);
    const b = btn.getBoundingClientRect();
    const mw = this.menu.offsetWidth;
    const mh = this.menu.offsetHeight;
    let left = Math.min(b.right - mw, window.innerWidth - mw - 8);
    if (left < 8) left = 8;
    let top = b.bottom + 6;
    if (top + mh > window.innerHeight - 8) top = Math.max(8, b.top - mh - 6);
    this.menu.style.left = `${left}px`;
    this.menu.style.top = `${top}px`;
    this.menu.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const t = target.closest('[data-a]') as HTMLElement | null;
      if (!t) return;
      this.rowAction(t.getAttribute('data-a') || '', +(t.getAttribute('data-id') || 0));
      this.closeMenu();
    });
  }

  /* ---------------- modal engine ---------------- */

  private modal(o: ModalOptions): void {
    const title = this.byId('dc-modal-title');
    if (title) title.textContent = o.title;
    const sub = this.byId('dc-modal-sub');
    if (sub) sub.textContent = o.sub || '';
    const ico = this.byId('dc-modal-ico');
    if (ico) {
      ico.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      ico.className = `dc-doc-ico ${o.accent || 'dc-c-primary'}`;
    }
    const body = this.byId('dc-modal-body');
    if (body) body.innerHTML = o.body || '';
    const c = this.byId('dc-modal-confirm');
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = `dc-btn ${o.danger ? 'dc-btn-danger' : 'dc-btn-primary'}`;
      c.onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('dc-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    // Modal body HTML is injected after the page's initial-load flatpickr auto-init
    // has already run, so any date fields inside it must be initialized here instead.
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', this.byId('dc-modal-body') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
    }
  }

  private closeModal(): void {
    this.byId('dc-modal')?.classList.remove('open');
    if (!this.qsa('.dc-drawer.open').length) this.document.body.style.overflow = '';
  }

  private fld(l: string, id: string, v?: string | number, ph?: string): string {
    return `<div><label class="dc-lbl">${l}</label><input id="${id}" class="dc-in" value="${this.esc(v || '')}" placeholder="${this.esc(ph || '')}"></div>`;
  }

  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="dc-lbl">${l}</label><select id="${id}" class="dc-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }

  private dfld(l: string, id: string, v?: string): string {
    return `<div><label class="dc-lbl">${l}</label><input type="text" id="${id}" class="dc-in" placeholder="yyyy-mm-dd" value="${v || ''}" data-provider="flatpickr" data-date-format="Y-m-d"></div>`;
  }

  private area(l: string, id: string, v?: string): string {
    return `<div><label class="dc-lbl">${l}</label><textarea id="${id}" class="dc-in" rows="3" style="resize:vertical">${this.esc(v || '')}</textarea></div>`;
  }

  private dischargeForm(r: Partial<Discharge>): string {
    r = r || {};
    return (
      '<div class="grid grid-cols-2 gap-3">' +
      this.fld('Patient Name', 'm-name', r.name, 'Full name') +
      this.sel('Department', 'm-dept', this.DEPTS, r.dept) +
      this.sel('Doctor', 'm-doc', this.DOCTORS, r.doctor) +
      this.sel('Ward', 'm-ward', this.WARDS, r.ward) +
      this.dfld('Admission Date', 'm-admit', r.admit) +
      this.dfld('Discharge Date', 'm-dis', r.discharge || this.iso(this.today)) +
      this.sel('Status', 'm-status', ['Pending', 'Ready', 'Approved', 'Completed', 'Cancelled'], r.status) +
      this.sel('Insurance', 'm-ins', ['Verified', 'Pending', 'Uninsured'], r.ins) +
      this.dfld('Follow-up Date', 'm-fu', r.followUp) +
      '</div>' +
      this.area('Discharge Notes', 'm-notes', r.notes)
    );
  }

  private readForm(): Omit<Discharge, 'id'> {
    const admit = (this.byId('m-admit') as HTMLInputElement | null)?.value || this.dAgo(4);
    const dis = (this.byId('m-dis') as HTMLInputElement | null)?.value || this.iso(this.today);
    const fu = (this.byId('m-fu') as HTMLInputElement | null)?.value || '';
    return this.mk({
      name: ((this.byId('m-name') as HTMLInputElement | null)?.value || '').trim(),
      dept: (this.byId('m-dept') as HTMLSelectElement | null)?.value || '',
      doctor: (this.byId('m-doc') as HTMLSelectElement | null)?.value || '',
      ward: (this.byId('m-ward') as HTMLSelectElement | null)?.value || '',
      admit: admit,
      discharge: dis,
      status: (this.byId('m-status') as HTMLSelectElement | null)?.value || '',
      ins: (this.byId('m-ins') as HTMLSelectElement | null)?.value || '',
      followUp: fu || this.dAhead(7),
      fu: !!fu,
      notes: (this.byId('m-notes') as HTMLTextAreaElement | null)?.value || '',
    });
  }

  private openForm(): void {
    this.modal({
      title: 'New Discharge',
      icon: 'icon-user-check',
      sub: 'Initiate a patient discharge',
      confirm: 'Create Discharge',
      body: this.dischargeForm({ status: 'Pending' }),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Patient name is required', 'error');
          return false;
        }
        const nf: Discharge = { ...f, id: this.nextId++ };
        this.data.unshift(nf);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(`Discharge created for ${nf.name}`);
        return undefined;
      },
    });
  }

  private rowAction(a: string, id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    switch (a) {
      case 'view':
        this.openDetail(id);
        return;
      case 'edit':
        this.modal({
          title: 'Edit Discharge',
          sub: this.did(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.dischargeForm(r),
          onConfirm: () => {
            Object.assign(r, this.readForm());
            this.buildKPIs();
            this.render();
            this.toast('Discharge updated');
          },
        });
        return;
      case 'approve':
        this.modal({
          title: 'Approve Discharge',
          sub: r.name,
          icon: 'icon-badge-check',
          accent: 'dc-c-emerald',
          confirm: 'Approve',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Approve discharge for <strong>${this.esc(r.name)}</strong>? All clearances will be marked final.</p>`,
          onConfirm: () => {
            r.status = 'Approved';
            this.buildKPIs();
            this.render();
            this.toast(`${r.name} approved for discharge`);
          },
        });
        return;
      case 'cancel':
        this.modal({
          title: 'Cancel Discharge',
          sub: r.name,
          icon: 'icon-x-circle',
          accent: 'dc-c-rose',
          danger: true,
          confirm: 'Cancel Discharge',
          body: this.area('Reason for cancellation', 'c-reason'),
          onConfirm: () => {
            r.status = 'Cancelled';
            this.buildKPIs();
            this.render();
            this.toast(`${r.name}'s discharge cancelled`);
          },
        });
        return;
      case 'print':
        this.toast('Printing discharge summary…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'pdf':
        this.toast(`Generating PDF for ${r.name}…`, 'info');
        return;
      case 'letter':
        this.toast(`Discharge letter generated for ${r.name}`);
        return;
      case 'billing':
        this.modal({
          title: 'Billing Summary',
          sub: r.name,
          icon: 'icon-receipt',
          accent: 'dc-c-amber',
          confirm: 'Close',
          body:
            '<div class="rounded-xl border border-border-color p-3 space-y-2 text-sm">' +
            `<div class="flex justify-between"><span class="text-gray-500">Room charges (${r.los}d)</span><b class="text-gray-900 dark:text-white">$${r.los * 320}</b></div>` +
            '<div class="flex justify-between"><span class="text-gray-500">Procedures</span><b class="text-gray-900 dark:text-white">$1,240</b></div>' +
            '<div class="flex justify-between"><span class="text-gray-500">Pharmacy</span><b class="text-gray-900 dark:text-white">$380</b></div>' +
            `<div class="flex justify-between border-t border-border-color pt-2"><span class="font-bold text-gray-900 dark:text-white">Total</span><b class="text-primary">$${r.los * 320 + 1620}</b></div>` +
            '</div>',
          onConfirm: () => undefined,
        });
        return;
      case 'followup':
        this.modal({
          title: 'Schedule Follow-up',
          sub: r.name,
          icon: 'icon-calendar-plus',
          accent: 'dc-c-violet',
          confirm: 'Schedule',
          body: this.sel('Doctor', 'f-doc', this.DOCTORS, r.doctor) + this.dfld('Follow-up Date', 'f-date', r.followUp) + this.area('Instructions', 'f-note'),
          onConfirm: () => {
            r.followUp = (this.byId('f-date') as HTMLInputElement | null)?.value || r.followUp;
            r.fu = true;
            this.render();
            this.toast(`Follow-up scheduled for ${r.followUp}`);
          },
        });
        return;
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: r.name,
          icon: 'icon-message-circle',
          accent: 'dc-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 's-msg'),
          onConfirm: () => this.toast(`SMS sent to ${r.name}`),
        });
        return;
      case 'email':
        this.modal({
          title: 'Send Email',
          sub: r.name,
          icon: 'icon-mail',
          accent: 'dc-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'e-sub', 'Discharge Summary') + this.area('Message', 'e-msg'),
          onConfirm: () => this.toast(`Email sent to ${r.name}`),
        });
        return;
      case 'archive':
        this.modal({
          title: 'Archive Discharge',
          sub: r.name,
          icon: 'icon-archive',
          confirm: 'Archive',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Archive discharge record for <strong>${this.esc(r.name)}</strong>?</p>`,
          onConfirm: () => this.toast(`${r.name} archived`),
        });
        return;
      case 'delete':
        this.modal({
          title: 'Delete Discharge',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'dc-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete discharge <strong>${this.did(r.id)}</strong> for ${this.esc(r.name)}?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => x.id !== id);
            delete this.state.sel[id];
            this.buildKPIs();
            this.render();
            this.toast('Discharge deleted');
          },
        });
        return;
    }
  }

  /* ---------------- detail drawer (full discharge summary) ---------------- */

  private openDetail(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    const kv = (k: string, v: string) => `<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">${k}</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">${v}</span></div>`;
    const sec = (t: string, inner: string) => `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">${t}</p>${inner}</div>`;
    const tl = (t: string, s: string, d: string) => `<div class="dc-tl-item"><span class="dc-tl-node"><i class="${d}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${t}</p><p class="text-[10px] text-gray-400">${s}</p></div>`;
    const tags = (arr: string[], ac: string) => `<div class="flex flex-wrap gap-1.5">${arr.map((x) => `<span class="dc-tag ${ac}">${x}</span>`).join('')}</div>`;

    const body = this.byId('dc-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="dc-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="dc-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="dc-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="dc-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4">${this.avatar(r)}<div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-white/80">${this.did(r.id)}</p><div class="mt-1.5">${this.statusBadge(r.status)}</div></div></div></div>` +
        `<div class="p-4 space-y-4"><div class="flex flex-wrap gap-1.5">${this.fuTag(r)}${this.insBadge(r.ins)}<span class="dc-tag dc-c-primary"><i class="icon-timer text-[10px]"></i>${r.los}-day stay</span></div>` +
        `<div class="rounded-xl border border-border-color p-3">${kv('Department', this.esc(r.dept))}${kv('Assigned Doctor', this.esc(r.doctor))}${kv('Ward', this.esc(r.ward))}${kv('Admission Date', r.admit)}${kv('Discharge Date', r.discharge)}${kv('Length of Stay', `${r.los} days`)}${kv('Follow-up', r.fu ? r.followUp : 'Not required')}</div>` +
        sec('Diagnosis', '<p class="text-sm text-gray-600 dark:text-gray-300">Acute coronary syndrome, managed with angioplasty. Stable at discharge.</p>') +
        sec('Treatment Summary', '<p class="text-sm text-gray-600 dark:text-gray-300">Coronary angioplasty with stent placement. IV therapy, cardiac monitoring, physiotherapy.</p>') +
        sec('Procedures', tags(['Angioplasty', 'ECG', 'Stress Test'], 'dc-c-violet')) +
        sec('Medications', tags(['Atorvastatin 20mg', 'Aspirin 75mg', 'Metoprolol 50mg'], 'dc-c-emerald')) +
        sec('Allergies', tags(['Penicillin', 'Pollen'], 'dc-c-amber')) +
        sec('Laboratory Results', `<div class="rounded-xl border border-border-color p-2.5 text-xs">${kv('CBC', 'Normal')}${kv('HbA1c', '6.8% · High')}${kv('Troponin', 'Normal')}</div>`) +
        sec('Radiology Summary', '<p class="text-sm text-gray-600 dark:text-gray-300">Chest X-Ray clear. Echocardiogram shows improved ejection fraction (52%).</p>') +
        sec('Diet Instructions', '<p class="text-sm text-gray-600 dark:text-gray-300">Low-sodium, low-fat cardiac diet. Limit caffeine. Adequate hydration.</p>') +
        sec('Home Care Instructions', '<p class="text-sm text-gray-600 dark:text-gray-300">Rest 1 week, light activity thereafter. Monitor BP daily. No heavy lifting for 4 weeks.</p>') +
        sec('Discharge Instructions', '<p class="text-sm text-gray-600 dark:text-gray-300">Continue prescribed medication. Return if chest pain, shortness of breath, or fever.</p>') +
        sec('Doctor Notes', `<p class="text-sm text-gray-600 dark:text-gray-300">Patient recovered well. ${this.esc(r.doctor)} cleared for discharge.</p>`) +
        sec(
          'Follow-up Schedule',
          `<div class="dc-recent" style="border:1px solid var(--color-border-color)"><span class="dc-clear-ico dc-c-violet"><i class="icon-calendar-clock"></i></span><div class="flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white">Cardiology Review</p><p class="text-[10px] text-gray-400">${r.fu ? r.followUp : 'Not scheduled'} · ${this.esc(r.doctor)}</p></div></div>`
        ) +
        sec('Billing Status', '<div class="flex items-center gap-2"><div class="dc-bar dc-c-emerald flex-1"><i style="width:100%"></i></div><span class="dc-chip dc-c-emerald">Cleared</span></div>') +
        sec(
          'Timeline',
          `<div class="dc-tl ${this.acc(r.dept)}">${tl('Admitted', r.admit, 'icon-log-in')}${tl('Treatment completed', r.discharge, 'icon-activity')}${tl(`Doctor approval · ${this.esc(r.doctor)}`, r.discharge, 'icon-stethoscope')}${tl('Clearances processed', r.discharge, 'icon-clipboard-check')}${tl('Discharged', r.discharge, 'icon-log-out')}</div>`
        ) +
        `<div class="grid grid-cols-2 gap-2"><button class="dc-btn dc-btn-success" data-da="approve" data-id="${id}"><i class="icon-badge-check"></i>Approve</button><button class="dc-btn dc-btn-primary" data-da="followup" data-id="${id}"><i class="icon-calendar-plus"></i>Follow-up</button><button class="dc-btn dc-btn-solid" data-da="print" data-id="${id}"><i class="icon-printer"></i>Summary</button><button class="dc-btn dc-btn-solid" data-da="email" data-id="${id}"><i class="icon-mail"></i>Email</button></div></div>`;
    }
    this.byId('dc-detail-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ---------------- bulk ---------------- */

  private bulk(a: string): void {
    const recs = this.selectedRecs();
    const n = recs.length;
    if (!n && a !== 'clear') {
      this.toast('No discharges selected', 'error');
      return;
    }
    switch (a) {
      case 'clear':
        this.state.sel = {};
        this.render();
        return;
      case 'approve':
        recs.forEach((r) => {
          if (r.status !== 'Cancelled') r.status = 'Approved';
        });
        this.buildKPIs();
        this.render();
        this.toast(`${n} discharges approved`);
        return;
      case 'export':
        this.toast(`Exported ${n} discharges`);
        return;
      case 'print':
        this.toast(`Printing ${n} summaries…`, 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'followup':
        this.modal({
          title: 'Schedule Follow-up',
          sub: `${n} patients`,
          icon: 'icon-calendar-plus',
          accent: 'dc-c-violet',
          confirm: 'Schedule',
          body: this.dfld('Follow-up Date', 'bk-fu', this.dAhead(7)),
          onConfirm: () => {
            const v = (this.byId('bk-fu') as HTMLInputElement | null)?.value || '';
            recs.forEach((r) => {
              r.followUp = v || r.followUp;
              r.fu = true;
            });
            this.buildKPIs();
            this.render();
            this.toast(`Follow-up scheduled for ${n}`);
          },
        });
        return;
      case 'status':
        this.modal({
          title: 'Update Status',
          sub: `${n} discharges`,
          icon: 'icon-activity',
          confirm: 'Apply',
          body: this.sel('Status', 'bk-s', ['Pending', 'Ready', 'Approved', 'Completed', 'Cancelled']),
          onConfirm: () => {
            const v = (this.byId('bk-s') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.status = v));
            this.buildKPIs();
            this.render();
            this.toast(`${n} set to ${v}`);
          },
        });
        return;
      case 'delete':
        this.modal({
          title: `Delete ${n} discharges`,
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'dc-c-rose',
          danger: true,
          confirm: `Delete ${n}`,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete ${n} selected discharge records?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => !this.state.sel[x.id]);
            this.state.sel = {};
            this.buildKPIs();
            this.render();
            this.toast(`${n} discharges deleted`);
          },
        });
        return;
    }
  }

  private importModal(): void {
    this.modal({
      title: 'Import Discharges',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'dc-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div><div class="flex items-center gap-2 mt-3"><span class="dc-chip dc-c-emerald">CSV</span><span class="dc-chip dc-c-emerald">Excel</span><a href="#" class="ml-auto text-xs font-bold text-primary hover:underline" id="dc-tmpl">Download template</a></div><div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">16</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">1</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 16 discharges (1 warning)'),
    });
    const tm = this.byId('dc-tmpl');
    if (tm) {
      tm.onclick = (e: Event) => {
        e.preventDefault();
        this.toast('Template downloaded', 'info');
      };
    }
  }

  private exportModal(): void {
    this.modal({
      title: 'Export Discharges',
      icon: 'icon-download',
      accent: 'dc-c-emerald',
      confirm: 'Export',
      body:
        '<label class="dc-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map((f, i) => `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="dc-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`)
          .join('') +
        '</div><label class="dc-lbl">Records</label><div class="space-y-2">' +
        [
          ['all', 'All records'],
          ['filtered', 'Current filters'],
          ['selected', `Selected (${this.selN()})`],
        ]
          .map((o, i) => `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="dc-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`)
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.qs('input[name="dc-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const s = (this.qs('input[name="dc-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
        if (f === 'Print') {
          this.toast('Opening print…', 'info');
          setTimeout(() => window.print(), 400);
        } else {
          this.toast(`Exported ${s} as ${f}`);
        }
      },
    });
  }

  /* ---------------- wiring ---------------- */

  private on(id: string, ev: string, fn: EventListener): void {
    const el = this.byId(id);
    if (el) el.addEventListener(ev, fn);
  }

  private clearFilters(): void {
    this.state.q = '';
    this.state.dept = '';
    this.state.status = '';
    this.state.adv = {};
    this.state.page = 1;
    const search = this.byId('dc-search') as HTMLInputElement | null;
    if (search) search.value = '';
    const dept = this.byId('dc-f-dept') as HTMLSelectElement | null;
    if (dept) dept.value = '';
    const status = this.byId('dc-f-status') as HTMLSelectElement | null;
    if (status) status.value = '';
    this.byId('dc-filter-badge')?.classList.add('hidden');
    this.render();
  }

  private wireToolbar(): void {
    this.on('dc-search', 'input', (e: Event) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dc-f-dept', 'change', (e: Event) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dc-f-status', 'change', (e: Event) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dc-sort', 'change', (e: Event) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    this.on('dc-view-grid', 'click', (e: Event) => {
      this.state.view = 'grid';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('dc-view-list')?.classList.remove('is-active');
      this.render();
    });
    this.on('dc-view-list', 'click', (e: Event) => {
      this.state.view = 'list';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('dc-view-grid')?.classList.remove('is-active');
      this.render();
    });
    this.on('dc-refresh', 'click', () => {
      this.toast('Refreshed');
      const updated = this.byId('dc-updated');
      if (updated) updated.textContent = 'just now';
      this.render();
    });
    this.on('dc-import', 'click', () => this.importModal());
    this.on('dc-export', 'click', () => this.exportModal());
    this.on('dc-filters', 'click', () => {
      this.byId('dc-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.on('dc-size', 'change', (e: Event) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dc-jump', 'change', (e: Event) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    this.on('dc-empty-clear', 'click', () => this.clearFilters());
  }

  private wirePageNav(): void {
    this.byId('dc-page-nav')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-pg]') as HTMLElement | null;
      if (!b) return;
      const v = b.getAttribute('data-pg') || '';
      if (v === 'prev') this.state.page--;
      else if (v === 'next') this.state.page++;
      else this.state.page = +v;
      this.render();
    });
  }

  private wireSelectAll(): void {
    const selectAll = (e: Event) => {
      const onn = (e.target as HTMLInputElement).checked;
      const start = (this.state.page - 1) * this.state.size;
      const rows = this.filtered().slice(start, start + this.state.size);
      rows.forEach((r) => {
        if (onn) this.state.sel[r.id] = true;
        else delete this.state.sel[r.id];
      });
      this.render();
    };
    this.on('dc-select-all', 'change', selectAll);
    this.on('dc-select-all-2', 'change', selectAll);
  }

  private wireGridDelegation(): void {
    const delegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.dc-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +(mb.getAttribute('data-id') || 0));
        return;
      }
      const v = target.closest('.dc-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const ed = target.closest('.dc-edit') as HTMLElement | null;
      if (ed) {
        this.rowAction('edit', +(ed.getAttribute('data-id') || 0));
        return;
      }
      const ch = target.closest('.dc-rowcheck') as HTMLInputElement | null;
      if (ch) {
        if (ch.checked) this.state.sel[+(ch.getAttribute('data-id') || 0)] = true;
        else delete this.state.sel[+(ch.getAttribute('data-id') || 0)];
        this.render();
        return;
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.dc-card') as HTMLElement | null;
      if (card) this.openDetail(+(card.getAttribute('data-id') || 0));
    };
    this.byId('dc-gridview')?.addEventListener('click', delegate);
    this.byId('dc-listview')?.addEventListener('click', delegate);
  }

  private wireWidgetsDelegation(): void {
    this.byId('dc-page')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const cl = target.closest('[data-clear]') as HTMLElement | null;
      if (cl) {
        const i = +(cl.getAttribute('data-clear') || 0);
        this.clearItems[i][3] = !this.clearItems[i][3];
        this.buildClearance();
        this.toast(this.clearItems[i][0] + (this.clearItems[i][3] ? ' cleared' : ' marked pending'));
      }
    });
  }

  private wireDocumentDelegation(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        const k = op.getAttribute('data-open');
        if (k === 'new') return void this.openForm();
        if (k === 'export') return void this.exportModal();
      }
      const ac = target.closest('[data-act]') as HTMLElement | null;
      if (ac) {
        const a = ac.getAttribute('data-act');
        if (a === 'print-summary') {
          this.toast('Preparing discharge summaries…', 'info');
          setTimeout(() => window.print(), 400);
        } else if (a === 'approve-pending') {
          const p = this.data.filter((r) => r.status === 'Pending' || r.status === 'Ready');
          p.forEach((r) => (r.status = 'Approved'));
          this.buildKPIs();
          this.render();
          this.toast(`${p.length} discharges approved`);
        }
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa<HTMLElement>('.dc-drawer.open').forEach((d) => d.classList.remove('open'));
        if (!this.qsa('.dc-drawer.open').length && !this.byId('dc-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('dc-detail-drawer')?.classList.remove('open');
        if (!this.qsa('.dc-drawer.open').length && !this.byId('dc-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da') || '', +(da.getAttribute('data-id') || 0));
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.dc-menu-btn,#dc-cols')) this.closeMenu();
    });
  }

  private wireModalDismiss(): void {
    this.byId('dc-modal')?.addEventListener('mousedown', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === this.byId('dc-modal') || target.classList.contains('dc-modal-back')) this.closeModal();
    });
  }

  private wireBulkBar(): void {
    this.byId('dc-bulkbar')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-bulk]') as HTMLElement | null;
      if (b) this.bulk(b.getAttribute('data-bulk') || '');
    });
  }

  private wireGlobalKeys(): void {
    window.addEventListener('resize', () => this.closeMenu());
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeModal();
        this.qsa<HTMLElement>('.dc-drawer.open').forEach((d) => d.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });
  }

  private wireFilterDrawer(): void {
    this.on('fd-apply', 'click', () => {
      this.state.adv = {
        doctor: (this.byId('fd-doctor') as HTMLSelectElement | null)?.value || '',
        ward: (this.byId('fd-ward') as HTMLSelectElement | null)?.value || '',
        fu: (this.byId('fd-fu') as HTMLSelectElement | null)?.value || '',
        ins: (this.byId('fd-ins') as HTMLSelectElement | null)?.value || '',
        from: (this.byId('fd-from') as HTMLInputElement | null)?.value || '',
        to: (this.byId('fd-to') as HTMLInputElement | null)?.value || '',
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('dc-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('dc-filter-drawer')?.classList.remove('open');
      if (!this.qsa('.dc-drawer.open').length && !this.byId('dc-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
    });
    this.on('fd-reset', 'click', () => {
      this.qsa<HTMLInputElement | HTMLSelectElement>('#dc-filter-drawer select,#dc-filter-drawer input').forEach((i) => (i.value = ''));
      this.state.adv = {};
      this.byId('dc-filter-badge')?.classList.add('hidden');
      this.render();
    });
  }
}
