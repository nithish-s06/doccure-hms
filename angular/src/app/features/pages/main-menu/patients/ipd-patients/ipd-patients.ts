import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const flatpickr: any;

interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  dept: string;
  doctor: string;
  nurse: string;
  ward: string;
  room: string;
  bed: string;
  admit: string;
  condition: string;
  status: string;
  ins: string;
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

interface StaffEntry {
  name: string;
  role: string;
  dept: string;
  acc: string;
  shift: string;
  load: number;
  status: 'busy' | 'on' | 'off';
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ipd-patients".
 * A CRUD-list-style inpatient admissions page: KPI dashboard, ward/bed map,
 * patient care workflow, monitoring widgets, doctor/nursing board,
 * search/filter/sort toolbar (with an advanced filter drawer), grid/list
 * toggle, pagination, row menu, bulk bar, a detail drawer, and assorted
 * per-row/bulk modals — all backed by in-memory seed data since there is no
 * backend.
 */
@Component({
  imports: [],
  selector: 'app-ipd-patients',
  styleUrl: './ipd-patients.css',
  templateUrl: './ipd-patients.html',
})
export class IpdPatients implements AfterViewInit {
  private readonly DEPT_ACC: Record<string, string> = {
    Cardiology: 'rose',
    Neurology: 'violet',
    Orthopedics: 'amber',
    Pediatrics: 'sky',
    'General Surgery': 'teal',
    Maternity: 'emerald',
    Oncology: 'indigo',
  };

  private readonly today = new Date();
  private readonly DOCTORS = ['Dr. Chen', 'Dr. Kumar', 'Dr. Mills', 'Dr. Park', 'Dr. Wang', 'Dr. Rivas'];
  private readonly NURSES = ['Nurse Alba', 'Nurse Reid', 'Nurse Cole', 'Nurse Diaz', 'Nurse Frost'];
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Surgery', 'Maternity', 'Oncology'];
  private readonly WARDS = ['General Ward', 'ICU', 'Private Wing', 'Isolation', 'Maternity'];
  private readonly CONDS = ['Stable', 'Recovering', 'Serious', 'Critical'];
  private readonly STATUSES = ['Admitted', 'ICU', 'Observation', 'Awaiting Discharge'];

  private readonly STAFF: StaffEntry[] = [
    { name: 'Dr. Chen', role: 'Cardiologist', dept: 'Cardiology', acc: 'rose', shift: 'Day', load: 8, status: 'busy' },
    { name: 'Dr. Kumar', role: 'Neurologist', dept: 'Neurology', acc: 'violet', shift: 'Day', load: 6, status: 'on' },
    { name: 'Dr. Wang', role: 'Orthopedic Surgeon', dept: 'Orthopedics', acc: 'amber', shift: 'Night', load: 5, status: 'busy' },
    { name: 'Nurse Alba', role: 'Head Nurse', dept: 'ICU', acc: 'sky', shift: 'Day', load: 12, status: 'busy' },
    { name: 'Nurse Reid', role: 'Staff Nurse', dept: 'General Ward', acc: 'teal', shift: 'Day', load: 9, status: 'on' },
    { name: 'Nurse Cole', role: 'Staff Nurse', dept: 'Private Wing', acc: 'emerald', shift: 'Night', load: 7, status: 'off' },
  ];

  // Fixed bed layout (never randomized) — kept as data so bedAssignModal() can
  // read it even before any mutation has triggered a buildBedMap() re-render.
  private readonly bedTypes = [
    'occ', 'free', 'occ', 'occ', 'icu', 'free', 'occ', 'iso', 'occ', 'free',
    'occ', 'occ', 'res', 'free', 'occ', 'icu', 'occ', 'free', 'occ', 'occ',
    'iso', 'free', 'occ', 'res', 'occ', 'free', 'occ', 'occ', 'icu', 'free',
  ];

  private data: Patient[] = [];
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

  private menu: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.data = this.buildSeedData();
    this.nextId = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const sk = this.byId('ipd-skeleton');
      const ct = this.byId('ipd-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'ipd-fadein .4s ease';
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

    // The static grid holds 6 cards; render once so the default page shows state.size (12).
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
    return `ipd-c-${this.DEPT_ACC[d] || 'primary'}`;
  }

  private iid(n: number): string {
    return `IPD-${String(n).padStart(4, '0')}`;
  }

  private detailUrl(r: Patient): string {
    return `ipd-patient-detail.html?${new URLSearchParams({
      id: this.iid(r.id),
      name: r.name,
      doctor: r.doctor,
      nurse: r.nurse,
      ward: r.ward,
      bed: `${r.room} / Bed ${r.bed}`,
      status: r.status,
    }).toString()}`;
  }

  private inits(n: string): string {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private photo(id: number): string {
    return `assets/img/avatar/avatar-${String(((id - 1) % 30) + 1).padStart(2, '0')}.jpg`;
  }

  // Doctors on the staff board have no numeric id, so hash the name; offset
  // by +15 vs. the patient formula so a doctor and patient never coincide.
  private nameHash(n: string): number {
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) >>> 0;
    return h;
  }

  private doctorPhoto(name: string): string {
    return `assets/img/avatar/avatar-${String((((this.nameHash(name) % 30) + 15) % 30) + 1).padStart(2, '0')}.jpg`;
  }

  private iso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private dAgo(n: number): string {
    const d = new Date(this.today);
    d.setDate(d.getDate() - n);
    return this.iso(d);
  }

  /* ---------------- seed data ---------------- */

  private mk(o: Partial<Patient> & Omit<Patient, 'id' | 'los'>): Patient {
    const admit = o.admit as string;
    const los = Math.max(1, Math.round((this.today.getTime() - new Date(admit).getTime()) / 86400000));
    return { ...o, id: o.id ?? 0, los } as Patient;
  }

  private buildSeedData(): Patient[] {
    const raw: [string, number, string, string, string, string, string, string, string, number, string, string, string][] = [
      ['James Morrison', 58, 'M', 'Cardiology', 'Dr. Chen', 'Nurse Alba', 'ICU', 'ICU-1', 'B1', 6, 'Critical', 'ICU', 'Verified'],
      ['Sarah Adams', 41, 'F', 'Neurology', 'Dr. Kumar', 'Nurse Reid', 'General Ward', '204', 'B2', 3, 'Recovering', 'Admitted', 'Verified'],
      ['Robert Clark', 66, 'M', 'General Surgery', 'Dr. Mills', 'Nurse Cole', 'Private Wing', 'P-12', 'B1', 9, 'Serious', 'Observation', 'Pending'],
      ['Emily Johnson', 29, 'F', 'Maternity', 'Dr. Park', 'Nurse Diaz', 'Maternity', 'M-08', 'B3', 2, 'Stable', 'Admitted', 'Verified'],
      ['David Torres', 47, 'M', 'Orthopedics', 'Dr. Wang', 'Nurse Frost', 'General Ward', '210', 'B4', 5, 'Recovering', 'Admitted', 'Verified'],
      ['Linda Nguyen', 53, 'F', 'Oncology', 'Dr. Rivas', 'Nurse Alba', 'Private Wing', 'P-05', 'B1', 7, 'Serious', 'Observation', 'Pending'],
      ['Michael Harris', 71, 'M', 'Cardiology', 'Dr. Chen', 'Nurse Reid', 'ICU', 'ICU-3', 'B1', 4, 'Critical', 'ICU', 'Verified'],
      ['Anna Peterson', 12, 'F', 'Pediatrics', 'Dr. Park', 'Nurse Cole', 'General Ward', '118', 'B2', 3, 'Stable', 'Admitted', 'Self-pay'],
      ['Carlos Mendez', 38, 'M', 'General Surgery', 'Dr. Mills', 'Nurse Diaz', 'General Ward', '205', 'B1', 2, 'Recovering', 'Awaiting Discharge', 'Verified'],
      ['Olivia Brown', 34, 'F', 'Neurology', 'Dr. Kumar', 'Nurse Frost', 'Isolation', 'ISO-2', 'B1', 8, 'Serious', 'Observation', 'Verified'],
      ['William Davis', 60, 'M', 'Orthopedics', 'Dr. Wang', 'Nurse Alba', 'General Ward', '212', 'B3', 6, 'Recovering', 'Admitted', 'Verified'],
      ['Mia Robinson', 45, 'F', 'Oncology', 'Dr. Rivas', 'Nurse Reid', 'Private Wing', 'P-09', 'B1', 11, 'Critical', 'ICU', 'Self-pay'],
      ['Isabella Garcia', 27, 'F', 'Maternity', 'Dr. Park', 'Nurse Cole', 'Maternity', 'M-03', 'B1', 1, 'Stable', 'Awaiting Discharge', 'Verified'],
      ['Mason Lee', 50, 'M', 'General Surgery', 'Dr. Wang', 'Nurse Diaz', 'General Ward', '208', 'B2', 4, 'Recovering', 'Admitted', 'Verified'],
    ];
    return raw.map((a, i) =>
      this.mk({
        id: i + 1,
        name: a[0],
        age: a[1],
        gender: a[2],
        dept: a[3],
        doctor: a[4],
        nurse: a[5],
        ward: a[6],
        room: a[7],
        bed: a[8],
        admit: this.dAgo(a[9]),
        condition: a[10],
        status: a[11],
        ins: a[12],
      })
    );
  }

  private selN(): number {
    return Object.keys(this.state.sel).length;
  }

  /* ---------------- render helpers ---------------- */

  private condBadge(c: string): string {
    const m: Record<string, string> = { Stable: 'stable', Recovering: 'recovering', Serious: 'serious', Critical: 'critical' };
    return `<span class="ipd-badge ${m[c] || 'stable'}">${this.esc(c)}</span>`;
  }

  private statusTag(s: string): string {
    const m: Record<string, [string, string]> = {
      Admitted: ['primary', 'icon-log-in'],
      ICU: ['rose', 'icon-heart-pulse'],
      Observation: ['amber', 'icon-eye'],
      'Awaiting Discharge': ['emerald', 'icon-log-out'],
    };
    const a = m[s] || m['Admitted'];
    return `<span class="ipd-tag ipd-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(s)}</span>`;
  }

  private insBadge(i: string): string {
    const m: Record<string, [string, string]> = {
      Verified: ['emerald', 'icon-badge-check'],
      Pending: ['amber', 'icon-clock'],
      'Self-pay': ['sky', 'icon-wallet'],
    };
    const a = m[i] || m['Pending'];
    return `<span class="ipd-chip ipd-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(i)}</span>`;
  }

  private avatar(r: Patient): string {
    return `<span class="${this.acc(r.dept)} ipd-ava-ring"><img class="ipd-ava object-cover" src="${this.photo(r.id)}" alt=""></span>`;
  }

  private filtered(): Patient[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    const rows = this.data.filter((r) => {
      if (q && !(`${r.name} ${this.iid(r.id)} ${r.doctor} ${r.dept} ${r.ward} ${r.room} ${r.bed}`.toLowerCase().indexOf(q) > -1)) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['ward'] && r.ward !== a['ward']) return false;
      if (a['room'] && r.room.toLowerCase().indexOf(a['room'].toLowerCase()) === -1) return false;
      if (a['bed'] && r.bed.toLowerCase().indexOf(a['bed'].toLowerCase()) === -1) return false;
      if (a['doctor'] && r.doctor !== a['doctor']) return false;
      if (a['cond'] && r.condition !== a['cond']) return false;
      if (a['ins'] && r.ins !== a['ins']) return false;
      if (a['from'] && r.admit < a['from']) return false;
      if (a['to'] && r.admit > a['to']) return false;
      return true;
    });
    rows.sort((x, y) => {
      switch (this.state.sort) {
        case 'newest':
          return y.admit.localeCompare(x.admit);
        case 'oldest':
          return x.admit.localeCompare(y.admit);
        case 'name':
          return x.name.localeCompare(y.name);
        case 'los':
          return y.los - x.los;
        case 'condition':
          return this.CONDS.indexOf(y.condition) - this.CONDS.indexOf(x.condition);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: Patient): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="ipd-card ${this.acc(r.dept)}${sel}" data-id="${r.id}"><div class="p-4">` +
      `<div class="flex items-start gap-3"><input type="checkbox" class="ipd-check mt-1 ipd-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}>${this.avatar(r)}` +
      `<div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-primary"><a href="${this.detailUrl(r)}" class="hover:underline">${this.iid(r.id)}</a></p></div>` +
      `<button class="ipd-mini ipd-menu-btn" data-id="${r.id}"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3">${this.condBadge(r.condition)}${this.statusTag(r.status)}${this.insBadge(r.ins)}</div>` +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">' +
      `<span class="ipd-kv"><i class="icon-building-2 text-primary/70"></i><b class="truncate">${this.esc(r.dept)}</b></span>` +
      `<span class="ipd-kv"><i class="icon-stethoscope text-primary/70"></i><b class="truncate">${this.esc(r.doctor)}</b></span>` +
      `<span class="ipd-kv"><i class="icon-layout-grid text-primary/70"></i>${this.esc(r.ward)}</span>` +
      `<span class="ipd-kv"><i class="icon-door-open text-primary/70"></i>Rm ${this.esc(r.room)} · ${this.esc(r.bed)}</span>` +
      `<span class="ipd-kv"><i class="icon-log-in text-primary/70"></i>${r.admit}</span>` +
      `<span class="ipd-kv"><i class="icon-timer text-primary/70"></i>Stay <span class="ipd-los">${r.los}d</span></span>` +
      '</div>' +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><span class="text-[11px] text-gray-400"><i class="icon-user-round"></i> ${this.esc(r.nurse)}</span>` +
      `<div class="flex gap-1.5"><button class="ipd-mini ipd-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="ipd-mini ipd-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>` +
      '</div></article>'
    );
  }

  private rowHTML(r: Patient): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<tr data-id="${r.id}" class="${sel.trim()}">` +
      `<td><input type="checkbox" class="ipd-check ipd-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}></td>` +
      `<td class="font-mono text-primary"><a href="${this.detailUrl(r)}" class="hover:underline">${this.iid(r.id)}</a></td>` +
      `<td class="font-semibold text-gray-900 dark:text-white">${this.esc(r.name)}</td>` +
      `<td>${this.esc(r.dept)}</td>` +
      `<td>${this.esc(r.doctor)}</td>` +
      `<td>${this.esc(r.ward)}</td>` +
      `<td>${this.esc(r.room)}</td>` +
      `<td>${this.esc(r.bed)}</td>` +
      `<td>${r.admit}</td>` +
      `<td>${r.los}d</td>` +
      `<td>${this.statusTag(r.status)}</td>` +
      `<td class="text-right"><div class="flex gap-1.5 justify-end"><button class="ipd-mini ipd-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="ipd-mini ipd-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></td>` +
      '</tr>'
    );
  }

  private render(): void {
    const grid = this.byId('ipd-gridview');
    const empty = this.byId('ipd-empty');
    const pager = this.byId('ipd-pager');
    const listView = this.byId('ipd-listview');
    const tbody = this.byId('ipd-tbody');
    if (!grid || !empty || !pager) return;

    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);

    const count = this.byId('ipd-count');
    if (count) count.textContent = `${total} of ${this.data.length} inpatients`;
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
    const pageInfo = this.byId('ipd-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No records';
    this.pageNav(pages);

    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa1 = this.byId('ipd-select-all') as HTMLInputElement | null;
    if (sa1) sa1.checked = !!allSel;
    const sa2 = this.byId('ipd-select-all-2') as HTMLInputElement | null;
    if (sa2) sa2.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="ipd-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="ipd-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="ipd-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const nav = this.byId('ipd-page-nav');
    if (nav) nav.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.ipd-ring[data-p]', scope || this.document).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
      });
    });
  }

  /* ---------------- KPIs / dashboard widgets ---------------- */

  private buildKPIs(): void {
    const by = (f: (r: Patient) => boolean) => this.data.filter(f).length;
    const totalBeds = 120;
    const occupied = this.data.length;
    const occPct = Math.round((occupied / totalBeds) * 100);
    const k: [string, string | number, string, string, number, string][] = [
      ['Total Inpatients', this.data.length, 'primary', 'icon-bed', 72, '+6%'],
      ['ICU Patients', by((r) => r.status === 'ICU'), 'rose', 'icon-heart-pulse', 48, 'Critical'],
      ['General Ward', by((r) => r.ward === 'General Ward'), 'teal', 'icon-layout-grid', 60, 'Ward'],
      ['Private Rooms', by((r) => r.ward === 'Private Wing'), 'violet', 'icon-door-open', 40, 'Private'],
      ['Awaiting Discharge', by((r) => r.status === 'Awaiting Discharge'), 'emerald', 'icon-log-out', 30, 'Soon'],
      ['Available Beds', totalBeds - occupied, 'sky', 'icon-bed-single', 55, 'Free'],
    ];
    const spark = '1,14 9,11 17,13 25,7 33,9 41,4 53,2';
    const kpis = this.byId('ipd-kpis');
    if (kpis) {
      kpis.innerHTML = k
        .map(
          (c) =>
            `<div class="ipd-stat ipd-c-${c[2]}"><div class="flex items-start justify-between"><span class="ipd-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="ipd-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="ipd-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--ipd-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
    }
    this.initRings(this.byId('ipd-kpis'));

    const avg = (this.data.reduce((s, r) => s + r.los, 0) / this.data.length).toFixed(1);
    const losBig = this.byId('ipd-los-big');
    if (losBig) losBig.textContent = avg;
    const avgLos = this.byId('ipd-avg-los');
    if (avgLos) avgLos.textContent = avg;
    const los: [string, number, string][] = [
      ['1–3 days', 32, 'emerald'],
      ['4–7 days', 40, 'primary'],
      ['8–14 days', 20, 'amber'],
      ['14+ days', 8, 'rose'],
    ];
    const loswidget = this.byId('ipd-loswidget');
    if (loswidget) {
      loswidget.innerHTML = los
        .map(
          (l) =>
            `<div class="flex items-center gap-2 ipd-c-${l[2]}"><span class="text-[11px] text-gray-500 dark:text-gray-400" style="width:4.5rem">${l[0]}</span><div class="ipd-bar flex-1"><i style="width:${l[1]}%"></i></div><b class="text-xs text-gray-900 dark:text-white">${l[1]}%</b></div>`
        )
        .join('');
    }

    const icu: [string, string, string][] = [
      ['ICU Beds', '20', 'rose'],
      ['Occupied', '16', 'amber'],
      ['Available', '4', 'emerald'],
      ['Ventilators', '11', 'sky'],
    ];
    const icuwidget = this.byId('ipd-icuwidget');
    if (icuwidget) {
      icuwidget.innerHTML = icu
        .map(
          (b) =>
            `<div class="rounded-xl border border-border-color p-2.5 ipd-c-${b[2]}"><p class="text-xl font-extrabold text-gray-900 dark:text-white">${b[1]}</p><p class="text-[10px] text-gray-500">${b[0]}</p></div>`
        )
        .join('');
    }

    const moves: [string, string, string][] = [
      ['James Morrison moved to ICU-1', '8m ago', 'icon-heart-pulse'],
      ['Carlos Mendez marked for discharge', '22m ago', 'icon-log-out'],
      ['Anna Peterson admitted · Pediatrics', '40m ago', 'icon-log-in'],
    ];
    const movewidget = this.byId('ipd-movewidget');
    if (movewidget) {
      movewidget.innerHTML = moves
        .map(
          (a) =>
            `<div class="ipd-tl-item"><span class="ipd-tl-node"><i class="${a[2]}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${a[0]}</p><p class="text-[10px] text-gray-400">${a[1]}</p></div>`
        )
        .join('');
    }

    this.buildBedMap();
    this.buildMonitoring();
    this.buildStaffBoard();

    const activeBadge = this.byId('ipd-active-badge');
    if (activeBadge) activeBadge.textContent = String(this.data.length);
    const occBadge = this.byId('ipd-occ-badge');
    if (occBadge) occBadge.textContent = String(occPct);
    const icuBadge = this.byId('ipd-icu-badge');
    if (icuBadge) icuBadge.textContent = '4';

    const recentwidget = this.byId('ipd-recentwidget');
    if (recentwidget) {
      recentwidget.innerHTML = this.data
        .slice(0, 6)
        .map(
          (r) =>
            `<button class="ipd-recent w-full text-left ipd-view" data-id="${r.id}"><span class="${this.acc(r.dept)} ipd-ava-ring" style="border-radius:.7rem"><img class="ipd-ava object-cover" style="width:2.1rem;height:2.1rem;border-radius:.6rem" src="${this.photo(r.id)}" alt=""></span><div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[10px] text-gray-400">${this.iid(r.id)} · ${this.esc(r.ward)}</p></div>${this.condBadge(r.condition)}</button>`
        )
        .join('');
    }
  }

  /* ---- bed map ---- */

  private buildBedMap(): void {
    const bedmap = this.byId('ipd-bedmap');
    if (bedmap) {
      bedmap.innerHTML = this.bedTypes
        .map((t, i) => {
          const lbl = (t === 'icu' ? 'IC' : t === 'iso' ? 'IS' : t === 'res' ? 'R' : '') + (i + 1);
          return `<button class="ipd-bed ${t}" data-bed="${i + 1}" data-type="${t}" title="Bed ${i + 1}">${lbl}</button>`;
        })
        .join('');
    }
    const free = this.bedTypes.filter((t) => t === 'free').length;
    const stats: [string, string | number, string][] = [
      ['Ward Occupancy', '78%', 'primary'],
      ['Rooms Available', '12', 'emerald'],
      ['Beds Available', free, 'sky'],
      ['ICU Beds', '4', 'rose'],
      ['Isolation', '3', 'amber'],
      ['Reserved', '6', 'violet'],
    ];
    const bedstats = this.byId('ipd-bedstats');
    if (bedstats) {
      bedstats.innerHTML = stats
        .map(
          (s) =>
            `<div class="rounded-xl border border-border-color p-3 ipd-c-${s[2]}"><p class="text-xl font-extrabold text-gray-900 dark:text-white">${s[1]}</p><p class="text-[10px] text-gray-500">${s[0]}</p></div>`
        )
        .join('');
    }
    // right sidebar snapshot
    const freeChip = this.byId('ipd-bedfree-chip');
    if (freeChip) freeChip.textContent = `${free} free`;
    const snap: [string, number, string][] = [
      ['General Ward', 68, 'teal'],
      ['ICU', 80, 'rose'],
      ['Private Wing', 55, 'violet'],
      ['Isolation', 40, 'amber'],
      ['Maternity', 62, 'emerald'],
    ];
    const bedsnapshot = this.byId('ipd-bedsnapshot');
    if (bedsnapshot) {
      bedsnapshot.innerHTML = snap
        .map(
          (s) =>
            `<div class="ipd-c-${s[2]}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${s[0]}</span><b class="text-gray-900 dark:text-white">${s[1]}%</b></div><div class="ipd-bar"><i style="width:${s[1]}%"></i></div></div>`
        )
        .join('');
    }
  }

  /* ---- monitoring ---- */

  private buildMonitoring(): void {
    const mon: [string, string, string, string, string][] = [
      ['Vital Signs', 'Stable', 'All within range', 'icon-heart-pulse', 'rose'],
      ['Medication Schedule', '12 due', 'Next dose 2:00 PM', 'icon-pill', 'emerald'],
      ['Nursing Notes', '38 today', '5 flagged', 'icon-clipboard-list', 'sky'],
      ['Laboratory Alerts', '3 alerts', '2 critical results', 'icon-flask-conical', 'amber'],
      ['Care Plan', '94%', 'On track', 'icon-list-checks', 'teal'],
      ['Daily Progress', '+8%', 'vs yesterday', 'icon-trending-up', 'primary'],
      ['Fall Risk', '5 high', 'Precautions active', 'icon-triangle-alert', 'amber'],
      ['Infection Risk', '2 isolated', 'Isolation ward', 'icon-shield-alert', 'violet'],
    ];
    const monitor = this.byId('ipd-monitor');
    if (monitor) {
      monitor.innerHTML = mon
        .map(
          (m) =>
            `<div class="ipd-mon ipd-c-${m[4]}"><div class="flex items-center gap-2.5"><span class="ipd-mon-ico"><i class="${m[3]}"></i></span><span class="ipd-chip">${m[1]}</span></div><p class="mt-2.5 text-sm font-bold text-gray-900 dark:text-white">${m[0]}</p><p class="text-[11px] text-gray-500 dark:text-gray-400">${m[2]}</p></div>`
        )
        .join('');
    }
  }

  /* ---- doctor & nursing board ---- */

  private buildStaffBoard(): void {
    const staffboard = this.byId('ipd-staffboard');
    if (!staffboard) return;
    staffboard.innerHTML = this.STAFF.map((s) => {
      const isDoc = s.name.indexOf('Dr.') === 0;
      const avaInner = isDoc
        ? `<img class="ipd-ava object-cover" src="${this.doctorPhoto(s.name)}" alt="">`
        : `<span class="ipd-ava">${this.esc(this.inits(s.name))}</span>`;
      return (
        `<div class="ipd-mon ipd-c-${s.acc}" style="padding:1rem"><div class="flex items-center gap-3"><span class="ipd-c-${s.acc} ipd-ava-ring">${avaInner}</span><div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${s.name}</p><p class="text-[11px] text-gray-400">${s.role}</p></div><span class="ipd-avail ${s.status}">${s.status === 'on' ? 'Available' : s.status === 'busy' ? 'On Rounds' : 'Off Shift'}</span></div>` +
        `<div class="grid grid-cols-3 gap-2 mt-3 text-center"><div class="rounded-lg border border-border-color p-2"><p class="text-[10px] text-gray-500">Dept</p><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${s.dept}</p></div><div class="rounded-lg border border-border-color p-2"><p class="text-[10px] text-gray-500">Shift</p><p class="text-xs font-bold text-gray-900 dark:text-white">${s.shift}</p></div><div class="rounded-lg border border-border-color p-2"><p class="text-[10px] text-gray-500">Load</p><p class="text-xs font-bold text-gray-900 dark:text-white">${s.load}</p></div></div>` +
        `<div class="flex gap-1.5 mt-3"><button class="ipd-btn ipd-btn-solid flex-1" style="padding:.4rem" data-staff="call" data-name="${this.esc(s.name)}"><i class="icon-phone"></i>Call</button><button class="ipd-btn ipd-btn-solid flex-1" style="padding:.4rem" data-staff="msg" data-name="${this.esc(s.name)}"><i class="icon-message-circle"></i>Message</button></div></div>`
      );
    }).join('');
  }

  private updateBulk(): void {
    const n = this.selN();
    const cnt = this.byId('ipd-bulk-count');
    if (cnt) cnt.textContent = String(n);
    const bar = this.byId('ipd-bulkbar');
    if (bar) (bar as HTMLElement).hidden = n === 0;
  }

  private selectedRecs(): Patient[] {
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
      '<div class="ipd-menu"><p class="ipd-menu-lbl">Patient</p>' +
      I('icon-eye', 'View Profile', 'view') +
      I('icon-edit', 'Edit Patient', 'edit') +
      '<div class="ipd-menu-sep"></div><p class="ipd-menu-lbl">Placement</p>' +
      I('icon-arrow-left-right', 'Transfer Ward', 'tward') +
      I('icon-door-open', 'Transfer Room', 'troom') +
      I('icon-bed', 'Change Bed', 'bed') +
      I('icon-user-cog', 'Assign Doctor', 'doctor') +
      I('icon-user-round', 'Assign Nurse', 'nurse') +
      '<div class="ipd-menu-sep"></div><p class="ipd-menu-lbl">Care</p>' +
      I('icon-pill', 'Medication Chart', 'med') +
      I('icon-clipboard-list', 'Treatment Plan', 'plan') +
      I('icon-flask-conical', 'Laboratory Orders', 'lab') +
      I('icon-scissors', 'Surgery Schedule', 'surgery') +
      I('icon-log-out', 'Discharge Planning', 'discharge') +
      '<div class="ipd-menu-sep"></div><p class="ipd-menu-lbl">Documents & Share</p>' +
      I('icon-printer', 'Print Summary', 'print') +
      I('icon-download', 'Download PDF', 'pdf') +
      I('icon-receipt', 'Billing Details', 'billing') +
      I('icon-message-circle', 'Send SMS', 'sms') +
      I('icon-mail', 'Send Email', 'email') +
      '<div class="ipd-menu-sep"></div>' +
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
    const title = this.byId('ipd-modal-title');
    if (title) title.textContent = o.title;
    const sub = this.byId('ipd-modal-sub');
    if (sub) sub.textContent = o.sub || '';
    const ico = this.byId('ipd-modal-ico');
    if (ico) {
      ico.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      ico.className = `ipd-doc-ico ${o.accent || 'ipd-c-primary'}`;
    }
    const body = this.byId('ipd-modal-body');
    if (body) body.innerHTML = o.body || '';
    const c = this.byId('ipd-modal-confirm');
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = `ipd-btn ${o.danger ? 'ipd-btn-danger' : 'ipd-btn-primary'}`;
      c.onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('ipd-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    // Modal body HTML is injected after the page's initial-load flatpickr auto-init
    // has already run, so any date fields inside it must be initialized here instead.
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', this.byId('ipd-modal-body') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
    }
  }

  private closeModal(): void {
    this.byId('ipd-modal')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private fld(l: string, id: string, v?: string | number, ph?: string): string {
    return `<div><label class="ipd-lbl">${l}</label><input id="${id}" class="ipd-in" value="${this.esc(v || '')}" placeholder="${this.esc(ph || '')}"></div>`;
  }

  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="ipd-lbl">${l}</label><select id="${id}" class="ipd-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }

  private dfld(l: string, id: string, v?: string): string {
    return `<div><label class="ipd-lbl">${l}</label><input type="text" id="${id}" class="ipd-in" placeholder="yyyy-mm-dd" value="${v || ''}" data-provider="flatpickr" data-date-format="Y-m-d"></div>`;
  }

  private area(l: string, id: string, v?: string): string {
    return `<div><label class="ipd-lbl">${l}</label><textarea id="${id}" class="ipd-in" rows="3" style="resize:vertical">${this.esc(v || '')}</textarea></div>`;
  }

  private admitForm(r: Partial<Patient>): string {
    r = r || {};
    return (
      '<div class="grid grid-cols-2 gap-3">' +
      this.fld('Patient Name', 'm-name', r.name, 'Full name') +
      this.fld('Age', 'm-age', r.age, 'e.g. 45') +
      this.sel('Gender', 'm-gender', ['M', 'F', 'Other'], r.gender) +
      this.sel('Department', 'm-dept', this.DEPTS, r.dept) +
      this.sel('Doctor', 'm-doc', this.DOCTORS, r.doctor) +
      this.sel('Nurse', 'm-nurse', this.NURSES, r.nurse) +
      this.sel('Ward', 'm-ward', this.WARDS, r.ward) +
      this.fld('Room', 'm-room', r.room, 'e.g. 204') +
      this.fld('Bed', 'm-bed', r.bed, 'e.g. B2') +
      this.dfld('Admission Date', 'm-admit', r.admit || this.iso(this.today)) +
      this.sel('Condition', 'm-cond', this.CONDS, r.condition) +
      this.sel('Status', 'm-status', this.STATUSES, r.status) +
      this.sel('Insurance', 'm-ins', ['Verified', 'Pending', 'Self-pay'], r.ins) +
      '</div>' +
      this.area('Diagnosis / Notes', 'm-notes', r.notes)
    );
  }

  private readForm(): Omit<Patient, 'id'> {
    const admit = (this.byId('m-admit') as HTMLInputElement | null)?.value || this.iso(this.today);
    return this.mk({
      name: ((this.byId('m-name') as HTMLInputElement | null)?.value || '').trim(),
      age: +((this.byId('m-age') as HTMLInputElement | null)?.value || 0) || 0,
      gender: (this.byId('m-gender') as HTMLSelectElement | null)?.value || '',
      dept: (this.byId('m-dept') as HTMLSelectElement | null)?.value || '',
      doctor: (this.byId('m-doc') as HTMLSelectElement | null)?.value || '',
      nurse: (this.byId('m-nurse') as HTMLSelectElement | null)?.value || '',
      ward: (this.byId('m-ward') as HTMLSelectElement | null)?.value || '',
      room: (this.byId('m-room') as HTMLInputElement | null)?.value || '—',
      bed: (this.byId('m-bed') as HTMLInputElement | null)?.value || '—',
      admit,
      condition: (this.byId('m-cond') as HTMLSelectElement | null)?.value || '',
      status: (this.byId('m-status') as HTMLSelectElement | null)?.value || '',
      ins: (this.byId('m-ins') as HTMLSelectElement | null)?.value || '',
      notes: (this.byId('m-notes') as HTMLTextAreaElement | null)?.value || '',
    }) as Omit<Patient, 'id'>;
  }

  private openForm(kind: 'bed' | 'transfer' | 'new'): void {
    if (kind === 'bed') {
      this.bedAssignModal();
      return;
    }
    if (kind === 'transfer') {
      const opts = this.data.map((r) => r.name);
      this.modal({
        title: 'Transfer Patient',
        icon: 'icon-arrow-left-right',
        accent: 'ipd-c-violet',
        sub: 'Move a patient between wards/rooms',
        confirm: 'Transfer',
        body:
          this.sel('Patient', 't-p', opts) +
          '<div class="grid grid-cols-2 gap-3">' +
          this.sel('To Ward', 't-ward', this.WARDS) +
          this.fld('To Room', 't-room', '', 'e.g. 210') +
          '</div>' +
          this.fld('To Bed', 't-bed', '', 'e.g. B3') +
          this.area('Reason', 't-reason'),
        onConfirm: () => {
          const nm = (this.byId('t-p') as HTMLSelectElement | null)?.value;
          const r = this.data.find((x) => x.name === nm);
          const wardVal = (this.byId('t-ward') as HTMLSelectElement | null)?.value || '';
          const roomVal = (this.byId('t-room') as HTMLInputElement | null)?.value || '';
          const bedVal = (this.byId('t-bed') as HTMLInputElement | null)?.value || '';
          if (r) {
            r.ward = wardVal;
            if (roomVal) r.room = roomVal;
            if (bedVal) r.bed = bedVal;
          }
          this.buildKPIs();
          this.render();
          this.toast(`${nm} transferred to ${wardVal}`);
        },
      });
      return;
    }
    this.modal({
      title: 'Admit Patient',
      icon: 'icon-bed-single',
      accent: 'ipd-c-rose',
      sub: 'Register a new inpatient admission',
      confirm: 'Admit Patient',
      body: this.admitForm({ condition: 'Stable', status: 'Admitted', ward: 'General Ward' }),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Patient name is required', 'error');
          return false;
        }
        const nf: Patient = { ...f, id: this.nextId++ };
        this.data.unshift(nf);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(`${nf.name} admitted · ${this.iid(nf.id)}`);
        return undefined;
      },
    });
  }

  private bedAssignModal(): void {
    const free = this.bedTypes.map((t, i) => ({ t, i: i + 1 })).filter((b) => b.t === 'free');
    const body =
      '<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Select an available bed to assign. Green tiles are free.</p><div class="ipd-bedmap" style="grid-template-columns:repeat(auto-fill,minmax(2.8rem,1fr))">' +
      this.bedTypes.map((t, i) => `<button class="ipd-bed ${t}" data-assign="${i + 1}"${t !== 'free' ? ' disabled style=opacity:.5' : ''}>${i + 1}</button>`).join('') +
      '</div>' +
      `<div class="mt-3">${this.sel('Assign to patient', 'ba-p', this.data.map((r) => r.name))}</div>`;
    this.modal({
      title: 'Bed Assignment',
      sub: `${free.length} beds available`,
      icon: 'icon-layout-grid',
      confirm: 'Assign Bed',
      body,
      onConfirm: () => {
        const picked = this.qs<HTMLElement>('.ipd-bed.picked', this.byId('ipd-modal-body') || undefined);
        const nm = (this.byId('ba-p') as HTMLSelectElement | null)?.value;
        this.toast(picked ? `Bed ${picked.getAttribute('data-assign')} assigned to ${nm}` : `Bed assigned to ${nm}`);
      },
    });
    const modalBody = this.byId('ipd-modal-body');
    if (modalBody) {
      modalBody.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const b = target.closest('[data-assign]') as HTMLButtonElement | null;
        if (!b || b.disabled) return;
        this.qsa<HTMLElement>('.ipd-bed.picked', modalBody).forEach((x) => {
          x.classList.remove('picked');
          x.style.outline = '';
        });
        b.classList.add('picked');
        b.style.outline = '3px solid var(--color-primary)';
      });
    }
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
          title: 'Edit Patient',
          sub: this.iid(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.admitForm(r),
          onConfirm: () => {
            Object.assign(r, this.readForm());
            this.buildKPIs();
            this.render();
            this.toast('Patient updated');
          },
        });
        return;
      case 'tward':
        this.modal({
          title: 'Transfer Ward',
          sub: r.name,
          icon: 'icon-arrow-left-right',
          accent: 'ipd-c-violet',
          confirm: 'Transfer',
          body: this.sel('New Ward', 'tw', this.WARDS, r.ward) + this.area('Reason', 'tw-r'),
          onConfirm: () => {
            r.ward = (this.byId('tw') as HTMLSelectElement | null)?.value || r.ward;
            this.buildKPIs();
            this.render();
            this.toast(`${r.name} moved to ${r.ward}`);
          },
        });
        return;
      case 'troom':
        this.modal({
          title: 'Transfer Room',
          sub: r.name,
          icon: 'icon-door-open',
          accent: 'ipd-c-sky',
          confirm: 'Transfer',
          body: this.fld('New Room', 'tr', r.room),
          onConfirm: () => {
            r.room = (this.byId('tr') as HTMLInputElement | null)?.value || r.room;
            this.render();
            this.toast(`${r.name} moved to Room ${r.room}`);
          },
        });
        return;
      case 'bed':
        this.modal({
          title: 'Change Bed',
          sub: r.name,
          icon: 'icon-bed',
          confirm: 'Update Bed',
          body: this.fld('New Bed', 'cb', r.bed),
          onConfirm: () => {
            r.bed = (this.byId('cb') as HTMLInputElement | null)?.value || r.bed;
            this.render();
            this.toast(`${r.name} moved to Bed ${r.bed}`);
          },
        });
        return;
      case 'doctor':
        this.modal({
          title: 'Assign Doctor',
          sub: r.name,
          icon: 'icon-user-cog',
          accent: 'ipd-c-violet',
          confirm: 'Assign',
          body: this.sel('Doctor', 'ad', this.DOCTORS, r.doctor),
          onConfirm: () => {
            r.doctor = (this.byId('ad') as HTMLSelectElement | null)?.value || r.doctor;
            this.render();
            this.toast(`${r.name} assigned to ${r.doctor}`);
          },
        });
        return;
      case 'nurse':
        this.modal({
          title: 'Assign Nurse',
          sub: r.name,
          icon: 'icon-user-round',
          accent: 'ipd-c-teal',
          confirm: 'Assign',
          body: this.sel('Nurse', 'an', this.NURSES, r.nurse),
          onConfirm: () => {
            r.nurse = (this.byId('an') as HTMLSelectElement | null)?.value || r.nurse;
            this.render();
            this.toast(`${r.name} assigned to ${r.nurse}`);
          },
        });
        return;
      case 'med':
        this.modal({
          title: 'Medication Chart',
          sub: r.name,
          icon: 'icon-pill',
          accent: 'ipd-c-emerald',
          confirm: 'Save',
          body:
            '<div class="rounded-xl border border-border-color p-3 space-y-2 text-sm">' +
            ['Ceftriaxone 1g — 8:00 AM', 'Paracetamol 500mg — 2:00 PM', 'Pantoprazole 40mg — 8:00 PM']
              .map((m) => `<div class="flex items-center gap-2"><i class="icon-pill text-primary"></i>${m}</div>`)
              .join('') +
            '</div>' +
            this.area('Add medication', 'med-add'),
          onConfirm: () => this.toast(`Medication chart updated for ${r.name}`),
        });
        return;
      case 'plan':
        this.modal({
          title: 'Treatment Plan',
          sub: r.name,
          icon: 'icon-clipboard-list',
          confirm: 'Save',
          body: this.area('Treatment plan', 'plan-txt', 'Continue IV antibiotics, monitor vitals q4h, physiotherapy from day 3.'),
          onConfirm: () => this.toast('Treatment plan saved'),
        });
        return;
      case 'lab':
        this.modal({
          title: 'Laboratory Orders',
          sub: r.name,
          icon: 'icon-flask-conical',
          accent: 'ipd-c-amber',
          confirm: 'Order',
          body:
            '<div class="grid grid-cols-2 gap-2">' +
            ['CBC', 'LFT', 'KFT', 'Electrolytes', 'CRP', 'Blood Culture']
              .map((t) => `<label class="flex items-center gap-2 rounded-lg border border-border-color p-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" class="ipd-check"> ${t}</label>`)
              .join('') +
            '</div>',
          onConfirm: () => this.toast(`Lab orders placed for ${r.name}`),
        });
        return;
      case 'surgery':
        this.modal({
          title: 'Schedule Surgery',
          sub: r.name,
          icon: 'icon-scissors',
          accent: 'ipd-c-rose',
          confirm: 'Schedule',
          body:
            this.fld('Procedure', 'sg-proc', '', 'e.g. Appendectomy') +
            '<div class="grid grid-cols-2 gap-3">' +
            this.dfld('Date', 'sg-date', '') +
            this.sel('Theater', 'sg-ot', ['OT-1', 'OT-2', 'OT-3']) +
            '</div>' +
            this.sel('Surgeon', 'sg-doc', this.DOCTORS, r.doctor),
          onConfirm: () => this.toast(`Surgery scheduled for ${r.name}`),
        });
        return;
      case 'discharge':
        this.modal({
          title: 'Discharge Planning',
          sub: r.name,
          icon: 'icon-log-out',
          accent: 'ipd-c-emerald',
          confirm: 'Plan Discharge',
          body: this.dfld('Expected Discharge', 'dc-date', '') + this.area('Discharge instructions', 'dc-note'),
          onConfirm: () => {
            r.status = 'Awaiting Discharge';
            this.buildKPIs();
            this.render();
            this.toast(`${r.name} marked for discharge`);
          },
        });
        return;
      case 'print':
        this.toast('Printing patient summary…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'pdf':
        this.toast(`Generating PDF for ${r.name}…`, 'info');
        return;
      case 'billing':
        this.modal({
          title: 'Billing Details',
          sub: r.name,
          icon: 'icon-receipt',
          accent: 'ipd-c-amber',
          confirm: 'Close',
          body:
            `<div class="rounded-xl border border-border-color p-3 space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-500">Bed charges (${r.los}d)</span><b class="text-gray-900 dark:text-white">$${r.los * 280}</b></div><div class="flex justify-between"><span class="text-gray-500">Procedures</span><b class="text-gray-900 dark:text-white">$2,150</b></div><div class="flex justify-between"><span class="text-gray-500">Pharmacy</span><b class="text-gray-900 dark:text-white">$640</b></div><div class="flex justify-between border-t border-border-color pt-2"><span class="font-bold text-gray-900 dark:text-white">Total</span><b class="text-primary">$${r.los * 280 + 2790}</b></div></div>`,
          onConfirm: () => undefined,
        });
        return;
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: r.name,
          icon: 'icon-message-circle',
          accent: 'ipd-c-emerald',
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
          accent: 'ipd-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'e-sub', 'IPD Update') + this.area('Message', 'e-msg'),
          onConfirm: () => this.toast(`Email sent to ${r.name}`),
        });
        return;
      case 'archive':
        this.modal({
          title: 'Archive Patient',
          sub: r.name,
          icon: 'icon-archive',
          confirm: 'Archive',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Archive inpatient record for <strong>${this.esc(r.name)}</strong>?</p>`,
          onConfirm: () => this.toast(`${r.name} archived`),
        });
        return;
      case 'delete':
        this.modal({
          title: 'Delete Patient',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'ipd-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete inpatient <strong>${this.iid(r.id)}</strong> for ${this.esc(r.name)}?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => x.id !== id);
            delete this.state.sel[id];
            this.buildKPIs();
            this.render();
            this.toast('Patient deleted');
          },
        });
        return;
    }
  }

  /* ---------------- detail drawer ---------------- */

  private openDetail(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    const kv = (k: string, v: string) => `<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">${k}</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">${v}</span></div>`;
    const sec = (t: string, inner: string) => `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">${t}</p>${inner}</div>`;
    const tl = (t: string, s: string, d: string) => `<div class="ipd-tl-item"><span class="ipd-tl-node"><i class="${d}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${t}</p><p class="text-[10px] text-gray-400">${s}</p></div>`;
    const tags = (arr: string[], ac: string) => `<div class="flex flex-wrap gap-1.5">${arr.map((x) => `<span class="ipd-tag ${ac}">${x}</span>`).join('')}</div>`;
    const vit = (l: string, v: string, u: string, ac: string) => `<div class="rounded-xl border border-border-color p-2.5 ipd-c-${ac}"><p class="text-[10px] text-gray-500">${l}</p><p class="text-sm font-extrabold text-gray-900 dark:text-white">${v} <span class="text-[10px] font-medium text-gray-400">${u}</span></p></div>`;

    const body = this.byId('ipd-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="ipd-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="ipd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="ipd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="ipd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4">${this.avatar(r)}<div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-white/80">${this.iid(r.id)} · ${r.age}y · ${this.esc(r.gender)}</p><div class="mt-1.5">${this.condBadge(r.condition)}</div></div></div></div>` +
        `<div class="p-4 space-y-4"><div class="flex flex-wrap gap-1.5">${this.statusTag(r.status)}${this.insBadge(r.ins)}<span class="ipd-tag ipd-c-primary"><i class="icon-timer text-[10px]"></i>${r.los}-day stay</span></div>` +
        sec('Patient Summary', `<div class="rounded-xl border border-border-color p-3">${kv('Age / Gender', `${r.age}y · ${this.esc(r.gender)}`)}${kv('Department', this.esc(r.dept))}${kv('Condition', this.esc(r.condition))}${kv('Insurance', this.esc(r.ins))}</div>`) +
        sec('Admission Details', `<div class="rounded-xl border border-border-color p-3">${kv('Admission Date', r.admit)}${kv('Length of Stay', `${r.los} days`)}${kv('Status', this.esc(r.status))}</div>`) +
        sec('Assigned Doctor & Ward', `<div class="rounded-xl border border-border-color p-3">${kv('Doctor', this.esc(r.doctor))}${kv('Nurse', this.esc(r.nurse))}${kv('Ward', this.esc(r.ward))}${kv('Room / Bed', `${this.esc(r.room)} · ${this.esc(r.bed)}`)}</div>`) +
        sec('Diagnosis', `<p class="text-sm text-gray-600 dark:text-gray-300">Acute condition under active management. ${this.esc(r.dept)} team monitoring closely.</p>`) +
        sec('Current Treatment', '<p class="text-sm text-gray-600 dark:text-gray-300">IV therapy, vitals monitoring q4h, physiotherapy and diet management as per care plan.</p>') +
        sec('Medications', tags(['Ceftriaxone 1g', 'Paracetamol 500mg', 'Pantoprazole 40mg'], 'ipd-c-emerald')) +
        sec(
          'Vitals',
          `<div class="grid grid-cols-3 gap-2">${vit('BP', '128/82', 'mmHg', 'rose')}${vit('Pulse', '82', 'bpm', 'violet')}${vit('Temp', '99.1', '°F', 'amber')}${vit('SpO₂', '96', '%', 'sky')}${vit('Resp', '18', '/min', 'teal')}${vit('GCS', '15', '', 'emerald')}</div>`
        ) +
        sec('Laboratory Results', `<div class="rounded-xl border border-border-color p-2.5 text-xs">${kv('CBC', 'Normal')}${kv('CRP', '12 mg/L · High')}${kv('Electrolytes', 'Normal')}</div>`) +
        sec(
          'Timeline',
          `<div class="ipd-tl ${this.acc(r.dept)}">${tl('Admitted', r.admit, 'icon-log-in')}${tl(`Bed assigned · Rm ${this.esc(r.room)}`, r.admit, 'icon-bed')}${tl('Initial assessment', r.admit, 'icon-clipboard-list')}${tl('Treatment ongoing', 'Now', 'icon-stethoscope')}</div>`
        ) +
        `<div class="grid grid-cols-2 gap-2"><button class="ipd-btn ipd-btn-primary" data-da="tward" data-id="${id}"><i class="icon-arrow-left-right"></i>Transfer</button><button class="ipd-btn ipd-btn-success" data-da="discharge" data-id="${id}"><i class="icon-log-out"></i>Discharge</button><button class="ipd-btn ipd-btn-solid" data-da="med" data-id="${id}"><i class="icon-pill"></i>Medication</button><button class="ipd-btn ipd-btn-solid" data-da="billing" data-id="${id}"><i class="icon-receipt"></i>Billing</button></div></div>`;
    }
    this.byId('ipd-detail-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ---------------- bulk ---------------- */

  private bulk(a: string): void {
    const recs = this.selectedRecs();
    const n = recs.length;
    if (!n && a !== 'clear') {
      this.toast('No patients selected', 'error');
      return;
    }
    switch (a) {
      case 'clear':
        this.state.sel = {};
        this.render();
        return;
      case 'doctor':
        this.modal({
          title: 'Assign Doctor',
          sub: `${n} patients`,
          icon: 'icon-user-cog',
          accent: 'ipd-c-violet',
          confirm: 'Assign',
          body: this.sel('Doctor', 'bk-doc', this.DOCTORS),
          onConfirm: () => {
            const v = (this.byId('bk-doc') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.doctor = v));
            this.render();
            this.toast(`${n} assigned to ${v}`);
          },
        });
        return;
      case 'nurse':
        this.modal({
          title: 'Assign Nurse',
          sub: `${n} patients`,
          icon: 'icon-user-round',
          accent: 'ipd-c-teal',
          confirm: 'Assign',
          body: this.sel('Nurse', 'bk-n', this.NURSES),
          onConfirm: () => {
            const v = (this.byId('bk-n') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.nurse = v));
            this.render();
            this.toast(`${n} assigned to ${v}`);
          },
        });
        return;
      case 'ward':
        this.modal({
          title: 'Transfer Ward',
          sub: `${n} patients`,
          icon: 'icon-arrow-left-right',
          accent: 'ipd-c-violet',
          confirm: 'Transfer',
          body: this.sel('New Ward', 'bk-w', this.WARDS),
          onConfirm: () => {
            const v = (this.byId('bk-w') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.ward = v));
            this.buildKPIs();
            this.render();
            this.toast(`${n} moved to ${v}`);
          },
        });
        return;
      case 'bed':
        this.modal({
          title: 'Change Bed',
          sub: `${n} patients`,
          icon: 'icon-bed',
          confirm: 'Apply',
          body: this.fld('Bed prefix', 'bk-b', '', 'e.g. B'),
          onConfirm: () => this.toast(`Bed change queued for ${n} patients`),
        });
        return;
      case 'status':
        this.modal({
          title: 'Update Status',
          sub: `${n} patients`,
          icon: 'icon-activity',
          confirm: 'Apply',
          body: this.sel('Status', 'bk-s', this.STATUSES),
          onConfirm: () => {
            const v = (this.byId('bk-s') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.status = v));
            this.buildKPIs();
            this.render();
            this.toast(`${n} set to ${v}`);
          },
        });
        return;
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: `${n} patients`,
          icon: 'icon-message-circle',
          accent: 'ipd-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 'bk-sms'),
          onConfirm: () => this.toast(`SMS sent to ${n} patients`),
        });
        return;
      case 'export':
        this.toast(`Exported ${n} inpatients`);
        return;
      case 'print':
        this.toast(`Printing ${n} summaries…`, 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'delete':
        this.modal({
          title: `Delete ${n} patients`,
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'ipd-c-rose',
          danger: true,
          confirm: `Delete ${n}`,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete ${n} selected inpatient records?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => !this.state.sel[x.id]);
            this.state.sel = {};
            this.buildKPIs();
            this.render();
            this.toast(`${n} patients deleted`);
          },
        });
        return;
    }
  }

  private importModal(): void {
    this.modal({
      title: 'Import Inpatients',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'ipd-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div>' +
        '<div class="flex items-center gap-2 mt-3"><span class="ipd-chip ipd-c-emerald">CSV</span><span class="ipd-chip ipd-c-emerald">Excel</span><a href="#" class="ml-auto text-xs font-bold text-primary hover:underline" id="ipd-tmpl">Download template</a></div>' +
        '<div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">14</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">1</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 14 inpatients (1 warning)'),
    });
    const tm = this.byId('ipd-tmpl') as HTMLAnchorElement | null;
    if (tm) {
      tm.onclick = (e: MouseEvent) => {
        e.preventDefault();
        this.toast('Template downloaded', 'info');
      };
    }
  }

  private exportModal(): void {
    this.modal({
      title: 'Export Inpatients',
      icon: 'icon-download',
      accent: 'ipd-c-emerald',
      confirm: 'Export',
      body:
        '<label class="ipd-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map((f, i) => `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="ipd-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`)
          .join('') +
        '</div><label class="ipd-lbl">Records</label><div class="space-y-2">' +
        ([['all', 'All records'], ['filtered', 'Current filters'], ['selected', `Selected (${this.selN()})`]] as [string, string][])
          .map((o, i) => `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="ipd-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`)
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.qs<HTMLInputElement>('input[name="ipd-exf"]:checked'))?.value || 'CSV';
        const s = (this.qs<HTMLInputElement>('input[name="ipd-exs"]:checked'))?.value || 'all';
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

  private on(id: string, ev: string, fn: (e: Event) => void): void {
    const el = this.byId(id);
    if (el) el.addEventListener(ev, fn);
  }

  private wireToolbar(): void {
    this.on('ipd-search', 'input', (e) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('ipd-f-dept', 'change', (e) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('ipd-f-status', 'change', (e) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('ipd-sort', 'change', (e) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    this.on('ipd-view-grid', 'click', (e) => {
      this.state.view = 'grid';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('ipd-view-list')?.classList.remove('is-active');
      this.render();
    });
    this.on('ipd-view-list', 'click', (e) => {
      this.state.view = 'list';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('ipd-view-grid')?.classList.remove('is-active');
      this.render();
    });
    this.on('ipd-refresh', 'click', () => {
      this.toast('Refreshed');
      const updated = this.byId('ipd-updated');
      if (updated) updated.textContent = 'just now';
      this.buildKPIs();
      this.render();
    });
    this.on('ipd-import', 'click', () => this.importModal());
    this.on('ipd-export', 'click', () => this.exportModal());
    this.on('ipd-print', 'click', () => {
      this.toast('Printing IPD list…', 'info');
      setTimeout(() => window.print(), 400);
    });
    this.on('ipd-filters', 'click', () => {
      this.byId('ipd-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.on('ipd-size', 'change', (e) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('ipd-jump', 'change', (e) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    this.on('ipd-empty-clear', 'click', () => this.clearFilters());
    this.on('ipd-bedward', 'change', (e) => {
      this.toast(`Showing ${(e.target as HTMLSelectElement).value} bed map`, 'info');
    });
  }

  private wirePageNav(): void {
    this.byId('ipd-page-nav')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-pg]') as HTMLElement | null;
      if (!b) return;
      const v = b.getAttribute('data-pg');
      if (v === 'prev') this.state.page--;
      else if (v === 'next') this.state.page++;
      else this.state.page = +(v || 1);
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
    this.on('ipd-select-all', 'change', selectAll);
    this.on('ipd-select-all-2', 'change', selectAll);
  }

  private wireGridDelegation(): void {
    const delegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.ipd-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +(mb.getAttribute('data-id') || 0));
        return;
      }
      const v = target.closest('.ipd-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const ed = target.closest('.ipd-edit') as HTMLElement | null;
      if (ed) {
        this.rowAction('edit', +(ed.getAttribute('data-id') || 0));
        return;
      }
      const ch = target.closest('.ipd-rowcheck') as HTMLInputElement | null;
      if (ch) {
        if (ch.checked) this.state.sel[+(ch.getAttribute('data-id') || 0)] = true;
        else delete this.state.sel[+(ch.getAttribute('data-id') || 0)];
        this.render();
        return;
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.ipd-card') as HTMLElement | null;
      if (card) this.openDetail(+(card.getAttribute('data-id') || 0));
    };
    this.byId('ipd-gridview')?.addEventListener('click', delegate);
  }

  private wireWidgetsDelegation(): void {
    // widgets / bed map / staff delegation
    this.byId('ipd-page')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const v = target.closest('#ipd-recentwidget .ipd-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const bed = target.closest('#ipd-bedmap [data-bed]') as HTMLElement | null;
      if (bed) {
        const ty = bed.getAttribute('data-type');
        this.toast(
          `Bed ${bed.getAttribute('data-bed')} · ${ty === 'free' ? 'Available' : ty === 'icu' ? 'ICU (occupied)' : ty === 'iso' ? 'Isolation' : ty === 'res' ? 'Reserved' : 'Occupied'}`,
          'info'
        );
        return;
      }
      const st = target.closest('[data-staff]') as HTMLElement | null;
      if (st) {
        const nm = st.getAttribute('data-name');
        const act = st.getAttribute('data-staff');
        this.toast(`${act === 'call' ? 'Calling ' : 'Messaging '}${nm}…`, 'info');
      }
    });
  }

  private wireDocumentDelegation(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        const k = op.getAttribute('data-open');
        if (k === 'new') return this.openForm('new');
        if (k === 'bed') return this.openForm('bed');
        if (k === 'transfer') return this.openForm('transfer');
        if (k === 'export') return this.exportModal();
      }
      const ac = target.closest('[data-act]') as HTMLElement | null;
      if (ac) {
        const a = ac.getAttribute('data-act');
        if (a === 'print-list') {
          this.toast('Preparing IPD list…', 'info');
          setTimeout(() => window.print(), 400);
        }
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa<HTMLElement>('.ipd-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('ipd-detail-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da') || '', +(da.getAttribute('data-id') || 0));
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.ipd-menu-btn,#ipd-cols')) this.closeMenu();
    });
  }

  private wireModalDismiss(): void {
    this.byId('ipd-modal')?.addEventListener('mousedown', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === this.byId('ipd-modal') || target.classList.contains('ipd-modal-back')) this.closeModal();
    });
  }

  private wireBulkBar(): void {
    this.byId('ipd-bulkbar')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-bulk]') as HTMLElement | null;
      if (b) this.bulk(b.getAttribute('data-bulk') || '');
    });
  }

  private wireGlobalKeys(): void {
    window.addEventListener('resize', () => this.closeMenu());
    this.document.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        this.closeMenu();
        this.closeModal();
        this.qsa<HTMLElement>('.ipd-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
    });
  }

  private wireFilterDrawer(): void {
    this.on('fd-apply', 'click', () => {
      this.state.adv = {
        ward: (this.byId('fd-ward') as HTMLSelectElement | null)?.value || '',
        room: (this.byId('fd-room') as HTMLInputElement | null)?.value || '',
        bed: (this.byId('fd-bed') as HTMLInputElement | null)?.value || '',
        doctor: (this.byId('fd-doctor') as HTMLSelectElement | null)?.value || '',
        cond: (this.byId('fd-cond') as HTMLSelectElement | null)?.value || '',
        ins: (this.byId('fd-ins') as HTMLSelectElement | null)?.value || '',
        from: (this.byId('fd-from') as HTMLInputElement | null)?.value || '',
        to: (this.byId('fd-to') as HTMLInputElement | null)?.value || '',
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('ipd-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('ipd-filter-drawer')?.classList.remove('open');
      this.document.body.style.overflow = '';
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
    });
    this.on('fd-reset', 'click', () => {
      this.qsa<HTMLInputElement | HTMLSelectElement>('#ipd-filter-drawer select,#ipd-filter-drawer input').forEach((i) => (i.value = ''));
      this.state.adv = {};
      this.byId('ipd-filter-badge')?.classList.add('hidden');
      this.render();
    });
  }

  private clearFilters(): void {
    this.state.q = '';
    this.state.dept = '';
    this.state.status = '';
    this.state.adv = {};
    this.state.page = 1;
    const search = this.byId('ipd-search') as HTMLInputElement | null;
    if (search) search.value = '';
    const dept = this.byId('ipd-f-dept') as HTMLSelectElement | null;
    if (dept) dept.value = '';
    const status = this.byId('ipd-f-status') as HTMLSelectElement | null;
    if (status) status.value = '';
    this.byId('ipd-filter-badge')?.classList.add('hidden');
    this.render();
  }
}
