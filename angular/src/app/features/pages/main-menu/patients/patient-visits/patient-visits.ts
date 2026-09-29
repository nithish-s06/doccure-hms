import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface Visit {
  id: number;
  date: string;
  name: string;
  age: number;
  gender: string;
  dept: string;
  doctor: string;
  type: string;
  time: string;
  status: string;
  source: string;
  prio: string;
  dx: string;
  followUp: string;
  fu: boolean;
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

interface DocBoardEntry {
  name: string;
  dept: string;
  acc: string;
  avail: 'busy' | 'on' | 'off';
  seen: number;
  cur: string;
  up: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "patient-visits".
 * A full CRUD-list-style page: search/filter (including an advanced filter
 * drawer), sort, pagination, row menu, bulk bar, a detail drawer, and
 * assorted per-row/bulk modals (schedule follow-up, prescribe, order labs,
 * etc.) — all backed by in-memory seed data since there is no backend.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-patient-visits',
  styleUrl: './patient-visits.css',
  templateUrl: './patient-visits.html',
})
export class PatientVisits implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly DEPT_ACC: Record<string, string> = {
    Cardiology: 'rose',
    Neurology: 'violet',
    Orthopedics: 'amber',
    Pediatrics: 'sky',
    'General Medicine': 'teal',
    Dermatology: 'emerald',
    ENT: 'indigo',
  };

  private readonly today = new Date();
  private readonly DOCTORS = ['Dr. Chen', 'Dr. Kumar', 'Dr. Mills', 'Dr. Park', 'Dr. Wang', 'Dr. Rivas'];
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology', 'ENT'];
  private readonly TYPES = ['New', 'Follow-up', 'Walk-in', 'Emergency'];
  private readonly STATUSES = ['Waiting', 'Ongoing', 'Completed', 'Scheduled', 'Cancelled'];
  private readonly SOURCES = ['Online', 'Phone', 'Walk-in', 'Referral'];
  private readonly PRIOS = ['High', 'Medium', 'Low'];

  private data: Visit[] = [];
  private nextId = 1;

  private state: {
    q: string;
    dept: string;
    status: string;
    sort: string;
    page: number;
    size: number;
    adv: Record<string, string>;
    sel: Record<number, boolean>;
  } = { q: '', dept: '', status: '', sort: 'newest', page: 1, size: 12, adv: {}, sel: {} };

  private readonly DOCBOARD: DocBoardEntry[] = [
    { name: 'Dr. Chen', dept: 'Cardiology', acc: 'rose', avail: 'busy', seen: 11, cur: 'Ava Thompson', up: 4 },
    { name: 'Dr. Kumar', dept: 'Neurology', acc: 'violet', avail: 'busy', seen: 8, cur: 'Oliver Reed', up: 3 },
    { name: 'Dr. Park', dept: 'Pediatrics', acc: 'sky', avail: 'on', seen: 14, cur: '—', up: 2 },
    { name: 'Dr. Wang', dept: 'Orthopedics', acc: 'amber', avail: 'busy', seen: 9, cur: 'Lucas Young', up: 5 },
    { name: 'Dr. Mills', dept: 'ENT / GM', acc: 'indigo', avail: 'on', seen: 12, cur: 'Isabella Lopez', up: 3 },
    { name: 'Dr. Rivas', dept: 'Dermatology', acc: 'emerald', avail: 'off', seen: 7, cur: '—', up: 0 },
  ];

  private menu: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.data = this.buildSeedData();
    this.nextId = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const sk = this.byId('pv-skeleton');
      const ct = this.byId('pv-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'pv-fadein .4s ease';
      }
      this.buildKPIs();
      this.initRings(this.byId('pv-kpis'));
      this.render();
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
    return `pv-c-${this.DEPT_ACC[d] || 'primary'}`;
  }

  private vid(n: number): string {
    return `VIS-${String(n).padStart(4, '0')}`;
  }

  private inits(n: string): string {
    return n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
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

  private buildSeedData(): Visit[] {
    const raw: [string, number, string, string, string, string, string, string, string, string, string, string, number][] = [
      ['Ava Thompson', 34, 'F', 'Cardiology', 'Dr. Chen', 'New', '09:00 AM', 'Ongoing', 'Online', 'High', 'Hypertension review', this.dAhead(14), 0],
      ['Liam Carter', 8, 'M', 'Pediatrics', 'Dr. Park', 'Walk-in', '09:10 AM', 'Waiting', 'Walk-in', 'Medium', 'Fever & cough', this.dAhead(7), 0],
      ['Noah Bennett', 52, 'M', 'Orthopedics', 'Dr. Wang', 'Follow-up', '09:20 AM', 'Completed', 'Phone', 'Low', 'Knee pain follow-up', this.dAhead(30), 1],
      ['Emma Wilson', 27, 'F', 'Dermatology', 'Dr. Rivas', 'New', '09:30 AM', 'Waiting', 'Online', 'Low', 'Skin rash', '', 0],
      ['Oliver Reed', 45, 'M', 'Neurology', 'Dr. Kumar', 'Emergency', '09:40 AM', 'Ongoing', 'Referral', 'High', 'Migraine, severe', this.dAhead(3), 0],
      ['Sophia Davis', 61, 'F', 'Cardiology', 'Dr. Chen', 'Follow-up', '09:50 AM', 'Scheduled', 'Online', 'Medium', 'Post-angioplasty', this.dAhead(10), 1],
      ['Mason Clark', 19, 'M', 'ENT', 'Dr. Mills', 'New', '10:00 AM', 'Completed', 'Phone', 'Low', 'Ear infection', this.dAhead(14), 1],
      ['Isabella Lopez', 39, 'F', 'General Medicine', 'Dr. Mills', 'Walk-in', '10:10 AM', 'Waiting', 'Walk-in', 'Medium', 'General checkup', '', 0],
      ['Ethan Turner', 5, 'M', 'Pediatrics', 'Dr. Park', 'Follow-up', '10:20 AM', 'Completed', 'Online', 'Low', 'Vaccination', this.dAhead(60), 1],
      ['Mia Hall', 48, 'F', 'Neurology', 'Dr. Kumar', 'New', '10:30 AM', 'Scheduled', 'Referral', 'High', 'Seizure evaluation', this.dAhead(5), 0],
      ['Lucas Young', 33, 'M', 'Orthopedics', 'Dr. Wang', 'Follow-up', '10:40 AM', 'Ongoing', 'Phone', 'Medium', 'Fracture review', this.dAhead(21), 1],
      ['Charlotte King', 29, 'F', 'Dermatology', 'Dr. Rivas', 'New', '10:50 AM', 'Waiting', 'Online', 'Low', 'Acne treatment', '', 0],
      ['Henry Scott', 70, 'M', 'Cardiology', 'Dr. Chen', 'Follow-up', '11:00 AM', 'Completed', 'Online', 'High', 'Arrhythmia review', this.dAhead(7), 1],
      ['Amelia Green', 42, 'F', 'General Medicine', 'Dr. Mills', 'Walk-in', '11:10 AM', 'Waiting', 'Walk-in', 'Medium', 'Diabetes management', this.dAhead(30), 1],
      ['Jack Adams', 16, 'M', 'ENT', 'Dr. Mills', 'New', '11:20 AM', 'Cancelled', 'Phone', 'Low', 'Tonsillitis', '', 0],
      ['Grace Nelson', 55, 'F', 'Neurology', 'Dr. Kumar', 'Emergency', '11:30 AM', 'Ongoing', 'Referral', 'High', 'Stroke assessment', this.dAhead(2), 0],
    ];
    return raw.map((a, i) => ({
      id: i + 1,
      date: this.dAgo(i % 4),
      name: a[0],
      age: a[1],
      gender: a[2],
      dept: a[3],
      doctor: a[4],
      type: a[5],
      time: a[6],
      status: a[7],
      source: a[8],
      prio: a[9],
      dx: a[10],
      followUp: a[11],
      fu: a[12] === 1,
    }));
  }

  private selN(): number {
    return Object.keys(this.state.sel).length;
  }

  /* ---------------- render helpers ---------------- */

  private statusBadge(s: string): string {
    const c: Record<string, string> = { Completed: 'completed', Ongoing: 'ongoing', Waiting: 'waiting', Scheduled: 'scheduled', Cancelled: 'cancelled' };
    return `<span class="pv-badge ${c[s] || 'waiting'}">${this.esc(s)}</span>`;
  }

  private typeTag(v: string): string {
    const m: Record<string, [string, string]> = {
      New: ['emerald', 'icon-sparkles'],
      'Follow-up': ['violet', 'icon-repeat'],
      'Walk-in': ['amber', 'icon-footprints'],
      Emergency: ['rose', 'icon-siren'],
    };
    const a = m[v] || m['New'];
    return `<span class="pv-tag pv-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(v)}</span>`;
  }

  private prioBadge(p: string): string {
    return `<span class="pv-prio ${p.toLowerCase()}"><i class="icon-flag text-[9px]"></i>${this.esc(p)}</span>`;
  }

  private avatar(r: Visit): string {
    return `<span class="${this.acc(r.dept)} pv-ava-ring"><span class="pv-ava">${this.esc(this.inits(r.name))}</span></span>`;
  }

  private detailUrl(r: Visit): string {
    return `patient-visit-detail.html?${new URLSearchParams({ id: String(r.id), name: r.name, doctor: r.doctor, status: r.status }).toString()}`;
  }

  private filtered(): Visit[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    let rows = this.data.filter((r) => {
      if (q && !(`${r.name} ${this.vid(r.id)} ${r.doctor} ${r.dept} ${r.dx}`.toLowerCase().indexOf(q) > -1)) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['doctor'] && r.doctor !== a['doctor']) return false;
      if (a['type'] && r.type !== a['type']) return false;
      if (a['source'] && r.source !== a['source']) return false;
      if (a['prio'] && r.prio !== a['prio']) return false;
      if (a['fu'] === 'Required' && !r.fu) return false;
      if (a['fu'] === 'Not required' && r.fu) return false;
      if (a['from'] && r.date < a['from']) return false;
      if (a['to'] && r.date > a['to']) return false;
      return true;
    });
    rows = rows.slice().sort((x, y) => {
      switch (this.state.sort) {
        case 'newest':
          return y.date.localeCompare(x.date) || x.time.localeCompare(y.time);
        case 'oldest':
          return x.date.localeCompare(y.date);
        case 'name':
          return x.name.localeCompare(y.name);
        case 'priority':
          return this.PRIOS.indexOf(x.prio) - this.PRIOS.indexOf(y.prio);
        case 'status':
          return x.status.localeCompare(y.status);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: Visit): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="pv-card ${this.acc(r.dept)}${sel}" data-id="${r.id}"><div class="p-4">` +
      `<div class="flex items-start gap-3"><input type="checkbox" class="pv-check mt-1 pv-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}>${this.avatar(r)}` +
      `<div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><a href="${this.detailUrl(r)}" class="text-[11px] font-mono text-primary hover:underline">${this.vid(r.id)}</a></div>` +
      this.prioBadge(r.prio) +
      `<button class="pv-mini pv-menu-btn ml-1.5" data-id="${r.id}"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3">${this.statusBadge(r.status)}${this.typeTag(r.type)}</div>` +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">' +
      `<span class="pv-kv"><i class="icon-building-2 text-primary/70"></i><b class="truncate">${this.esc(r.dept)}</b></span>` +
      `<span class="pv-kv"><i class="icon-stethoscope text-primary/70"></i><b class="truncate">${this.esc(r.doctor)}</b></span>` +
      `<span class="pv-kv"><i class="icon-calendar text-primary/70"></i>${r.date}</span>` +
      `<span class="pv-kv"><i class="icon-clock text-primary/70"></i>${this.esc(r.time)}</span>` +
      '</div>' +
      `<div class="mt-3 rounded-xl border border-border-color p-2.5"><p class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Diagnosis</p><p class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">${this.esc(r.dx)}</p></div>` +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><span class="text-[11px] text-gray-400"><i class="icon-calendar-clock"></i> ${r.fu ? 'F/U ' + r.followUp : 'No follow-up'}</span>` +
      `<div class="flex gap-1.5"><button class="pv-mini pv-start" data-id="${r.id}" title="Start"><i class="icon-play text-sm"></i></button><button class="pv-mini pv-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="pv-mini pv-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>` +
      '</div></article>'
    );
  }

  private render(): void {
    const grid = this.byId('pv-gridview');
    const empty = this.byId('pv-empty');
    const pager = this.byId('pv-pager');
    if (!grid || !empty || !pager) return;

    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);

    const count = this.byId('pv-count');
    if (count) count.textContent = `${total} of ${this.data.length} visits`;
    empty.classList.toggle('hidden', total !== 0);
    pager.classList.toggle('hidden', total === 0);
    grid.innerHTML = pageRows.map((r) => this.cardHTML(r)).join('');
    const pageInfo = this.byId('pv-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No records';
    this.pageNav(pages);

    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa1 = this.byId('pv-select-all') as HTMLInputElement | null;
    if (sa1) sa1.checked = !!allSel;
    const sa2 = this.byId('pv-select-all-2') as HTMLInputElement | null;
    if (sa2) sa2.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="pv-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="pv-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="pv-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const nav = this.byId('pv-page-nav');
    if (nav) nav.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.pv-ring[data-p]', scope || this.document).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
      });
    });
  }

  /* ---------------- KPIs / dashboard widgets ---------------- */

  private buildKPIs(): void {
    const by = (f: (r: Visit) => boolean) => this.data.filter(f).length;
    const k: [string, string | number, string, string, number, string][] = [
      ["Today's Visits", by((r) => r.date === this.iso(this.today)) + 24, 'primary', 'icon-clipboard-list', 78, '+11%'],
      ['Completed Visits', by((r) => r.status === 'Completed'), 'emerald', 'icon-badge-check', 62, 'Done'],
      ['Ongoing Consults', by((r) => r.status === 'Ongoing'), 'violet', 'icon-stethoscope', 34, 'Live'],
      ['Follow-up Visits', by((r) => r.type === 'Follow-up'), 'teal', 'icon-repeat', 46, 'Return'],
      ['New Patients', by((r) => r.type === 'New'), 'sky', 'icon-user-plus', 52, 'New'],
      ['Avg Consult Time', '15m', 'amber', 'icon-timer', 40, '-1.4m'],
    ];
    const spark = '1,14 9,10 17,12 25,6 33,9 41,4 53,2';
    const kpis = this.byId('pv-kpis');
    if (kpis) {
      kpis.innerHTML = k
        .map(
          (c) =>
            `<div class="pv-stat pv-c-${c[2]}"><div class="flex items-start justify-between"><span class="pv-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="pv-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="pv-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--pv-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
    }
    this.initRings(this.byId('pv-kpis'));

    const work = this.DOCBOARD.slice(0, 5).map((d): [string, number, string] => [d.name, Math.min(100, d.seen * 7), d.acc]);
    const workwidget = this.byId('pv-workwidget');
    if (workwidget) {
      workwidget.innerHTML = work
        .map(
          (d) =>
            `<div class="flex items-center gap-2.5 pv-c-${d[2]}"><span class="text-xs font-semibold text-gray-700 dark:text-gray-200 w-20 truncate">${d[0]}</span><div class="pv-bar flex-1"><i style="width:${d[1]}%"></i></div><b class="text-xs text-gray-900 dark:text-white">${Math.round(d[1] / 7)}</b></div>`
        )
        .join('');
    }

    const dur: [string, number, string][] = [
      ['< 10 min', 28, 'emerald'],
      ['10–20 min', 48, 'primary'],
      ['20–30 min', 18, 'amber'],
      ['30+ min', 6, 'rose'],
    ];
    const durwidget = this.byId('pv-durwidget');
    if (durwidget) {
      durwidget.innerHTML = dur
        .map(
          (l) =>
            `<div class="flex items-center gap-2 pv-c-${l[2]}"><span class="text-[11px] text-gray-500 dark:text-gray-400" style="width:4.5rem">${l[0]}</span><div class="pv-bar flex-1"><i style="width:${l[1]}%"></i></div><b class="text-xs text-gray-900 dark:text-white">${l[1]}%</b></div>`
        )
        .join('');
    }

    const trend = [52, 60, 45, 72, 58, 80, 66];
    const tmax = Math.max(...trend);
    const trendwidget = this.byId('pv-trendwidget');
    if (trendwidget) {
      trendwidget.innerHTML = trend
        .map((v, i) => {
          const h = Math.round((v / tmax) * 100);
          const g = i === 5 ? 'linear-gradient(180deg,#0ea5e9,#6366f1)' : `color-mix(in oklab,#0ea5e9 ${30 + h * 0.25}%,transparent)`;
          return `<span style="width:100%;height:${h}%;background:${g};border-radius:.35rem"></span>`;
        })
        .join('');
    }

    this.buildConsum();
    this.buildDocBoard();
    this.buildTimeline(this.data[0]);

    const todayBadge = this.byId('pv-today-badge');
    if (todayBadge) todayBadge.textContent = String(by((r) => r.date === this.iso(this.today)) + 24);
    const activeBadge = this.byId('pv-active-badge');
    if (activeBadge) activeBadge.textContent = String(by((r) => r.status === 'Ongoing'));
    const waitBadge = this.byId('pv-wait-badge');
    if (waitBadge) waitBadge.textContent = '12';
    const consultBadge = this.byId('pv-consult-badge');
    if (consultBadge) consultBadge.textContent = '15';

    const recentwidget = this.byId('pv-recentwidget');
    if (recentwidget) {
      recentwidget.innerHTML = this.data
        .slice(0, 6)
        .map(
          (r) =>
            `<button class="pv-recent w-full text-left pv-view" data-id="${r.id}"><span class="${this.acc(r.dept)} pv-ava-ring" style="border-radius:.7rem"><span class="pv-ava" style="width:2.1rem;height:2.1rem;font-size:.72rem;border-radius:.6rem">${this.inits(r.name)}</span></span><div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[10px] text-gray-400">${this.vid(r.id)} · ${this.esc(r.dept)}</p></div>${this.statusBadge(r.status)}</button>`
        )
        .join('');
    }
  }

  private buildConsum(): void {
    const sum: [string, string, string, string, string][] = [
      ['Symptoms', '3 recorded', 'Chest pain, fatigue', 'icon-thermometer', 'rose'],
      ['Diagnosis', 'Confirmed', 'Essential hypertension', 'icon-clipboard-check', 'violet'],
      ['Treatment Plan', 'Active', 'Medication + lifestyle', 'icon-list-checks', 'teal'],
      ['Prescriptions', '3 items', 'Amlodipine, Aspirin…', 'icon-pill', 'emerald'],
      ['Lab Tests', '2 ordered', 'Lipid panel, HbA1c', 'icon-flask-conical', 'amber'],
      ['Radiology', '1 ordered', 'Chest X-Ray', 'icon-scan', 'sky'],
      ['Procedures', 'None', 'No procedures', 'icon-activity', 'indigo'],
      ['Follow-up', 'In 14 days', 'Cardiology review', 'icon-calendar-clock', 'primary'],
    ];
    const consum = this.byId('pv-consum');
    if (!consum) return;
    consum.innerHTML = sum
      .map(
        (m) =>
          `<div class="pv-sum pv-c-${m[4]}"><div class="flex items-center gap-2.5"><span class="pv-sum-ico"><i class="${m[3]}"></i></span><span class="pv-chip">${m[1]}</span></div><p class="mt-2.5 text-sm font-bold text-gray-900 dark:text-white">${m[0]}</p><p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">${m[2]}</p></div>`
      )
      .join('');
  }

  private buildDocBoard(): void {
    const docboard = this.byId('pv-docboard');
    if (!docboard) return;
    docboard.innerHTML = this.DOCBOARD.map(
      (d) =>
        `<div class="pv-sum pv-c-${d.acc}" style="padding:1rem"><div class="flex items-center gap-3"><span class="pv-c-${d.acc} pv-ava-ring"><span class="pv-ava">${this.inits(d.name)}</span></span><div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${d.name}</p><p class="text-[11px] text-gray-400">${d.dept}</p></div><span class="pv-avail ${d.avail}">${d.avail === 'on' ? 'Available' : d.avail === 'busy' ? 'In Consult' : 'Off Duty'}</span></div>` +
        `<div class="grid grid-cols-2 gap-2 mt-3 text-center"><div class="rounded-lg border border-border-color p-2"><p class="text-lg font-extrabold text-gray-900 dark:text-white">${d.seen}</p><p class="text-[10px] text-gray-500">Seen Today</p></div><div class="rounded-lg border border-border-color p-2"><p class="text-lg font-extrabold text-gray-900 dark:text-white">${d.up}</p><p class="text-[10px] text-gray-500">Upcoming</p></div></div>` +
        `<div class="mt-3 flex items-center justify-between text-[11px]"><span class="text-gray-500">Current: <b class="text-gray-900 dark:text-white">${this.esc(d.cur)}</b></span></div>` +
        `<div class="flex gap-1.5 mt-2"><button class="pv-btn pv-btn-solid flex-1" style="padding:.4rem" data-docact="board" data-doc="${this.esc(d.name)}"><i class="icon-calendar"></i>Schedule</button><button class="pv-btn pv-btn-solid flex-1" style="padding:.4rem" data-docact="msg" data-doc="${this.esc(d.name)}"><i class="icon-message-circle"></i>Message</button></div></div>`
    ).join('');
  }

  private buildTimeline(r: Visit | undefined): void {
    r = r || this.data[0];
    if (!r) return;
    const chip = this.byId('pv-tl-chip');
    if (chip) chip.textContent = this.vid(r.id);
    const steps: [string, string, string, boolean][] = [
      ['Registration', r.time, 'icon-user-plus', true],
      ['Check-in', r.time, 'icon-log-in', true],
      ['Vitals Recorded', 'BP 128/82', 'icon-heart-pulse', true],
      ['Doctor Consultation', this.esc(r.doctor), 'icon-stethoscope', r.status !== 'Waiting' && r.status !== 'Scheduled'],
      ['Laboratory', 'Lipid, HbA1c', 'icon-flask-conical', r.status === 'Completed'],
      ['Radiology', 'Chest X-Ray', 'icon-scan', r.status === 'Completed'],
      ['Pharmacy', '3 medications', 'icon-pill', r.status === 'Completed'],
      ['Billing', 'Invoice generated', 'icon-receipt', r.status === 'Completed'],
      ['Follow-up Scheduled', r.fu ? r.followUp : '—', 'icon-calendar-clock', r.fu],
      ['Visit Completed', r.status === 'Completed' ? 'Done' : 'Pending', 'icon-badge-check', r.status === 'Completed'],
    ];
    const timeline = this.byId('pv-timeline');
    if (timeline) {
      timeline.innerHTML = steps
        .map(
          (s) =>
            `<div class="pv-tl-item"><span class="pv-tl-node${s[3] ? '' : ' pending'}"><i class="${s[2]}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${s[0]}</p><p class="text-[10px] text-gray-400">${s[1]}</p></div>`
        )
        .join('');
    }
  }

  private updateBulk(): void {
    const n = this.selN();
    const cnt = this.byId('pv-bulk-count');
    if (cnt) cnt.textContent = String(n);
    const bar = this.byId('pv-bulkbar');
    if (bar) (bar as HTMLElement).hidden = n === 0;
  }

  private selectedRecs(): Visit[] {
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
      '<div class="pv-menu"><p class="pv-menu-lbl">Visit</p>' +
      I('icon-eye', 'View Visit', 'view') +
      I('icon-edit', 'Edit Visit', 'edit') +
      I('icon-user', 'View Patient Profile', 'profile') +
      I('icon-play', 'Start Consultation', 'start') +
      I('icon-check-circle', 'Complete Consultation', 'complete') +
      '<div class="pv-menu-sep"></div><p class="pv-menu-lbl">Clinical</p>' +
      I('icon-clipboard-check', 'Add Diagnosis', 'dx') +
      I('icon-pill', 'Add Prescription', 'rx') +
      I('icon-flask-conical', 'Order Lab Test', 'lab') +
      I('icon-scan', 'Order Radiology', 'rad') +
      I('icon-calendar-plus', 'Schedule Follow-up', 'followup') +
      '<div class="pv-menu-sep"></div><p class="pv-menu-lbl">Documents & Share</p>' +
      I('icon-printer', 'Print Visit Summary', 'print') +
      I('icon-download', 'Download PDF', 'pdf') +
      I('icon-message-circle', 'Send SMS', 'sms') +
      I('icon-mail', 'Send Email', 'email') +
      '<div class="pv-menu-sep"></div>' +
      I('icon-archive', 'Archive Visit', 'archive') +
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
    const title = this.byId('pv-modal-title');
    if (title) title.textContent = o.title;
    const sub = this.byId('pv-modal-sub');
    if (sub) sub.textContent = o.sub || '';
    const ico = this.byId('pv-modal-ico');
    if (ico) {
      ico.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      ico.className = `pv-doc-ico ${o.accent || 'pv-c-primary'}`;
    }
    const body = this.byId('pv-modal-body');
    if (body) body.innerHTML = o.body || '';
    const c = this.byId('pv-modal-confirm');
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = `pv-btn ${o.danger ? 'pv-btn-danger' : 'pv-btn-primary'}`;
      c.onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('pv-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    // Modal body HTML is injected after the page's initial-load flatpickr auto-init
    // has already run, so any date fields inside it must be initialized here instead.
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', this.byId('pv-modal-body') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
    }
  }

  private closeModal(): void {
    this.byId('pv-modal')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private fld(l: string, id: string, v?: string | number, ph?: string): string {
    return `<div><label class="pv-lbl">${l}</label><input id="${id}" class="pv-in" value="${this.esc(v || '')}" placeholder="${this.esc(ph || '')}"></div>`;
  }

  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="pv-lbl">${l}</label><select id="${id}" class="pv-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }

  private dfld(l: string, id: string, v?: string): string {
    return `<div><label class="pv-lbl">${l}</label><input type="text" id="${id}" class="pv-in" placeholder="yyyy-mm-dd" value="${v || ''}" data-provider="flatpickr" data-date-format="Y-m-d"></div>`;
  }

  private area(l: string, id: string, v?: string): string {
    return `<div><label class="pv-lbl">${l}</label><textarea id="${id}" class="pv-in" rows="3" style="resize:vertical">${this.esc(v || '')}</textarea></div>`;
  }

  private visitForm(r: Partial<Visit>): string {
    r = r || {};
    return (
      '<div class="grid grid-cols-2 gap-3">' +
      this.fld('Patient Name', 'm-name', r.name, 'Full name') +
      this.fld('Age', 'm-age', r.age, 'e.g. 34') +
      this.sel('Gender', 'm-gender', ['M', 'F', 'Other'], r.gender) +
      this.sel('Department', 'm-dept', this.DEPTS, r.dept) +
      this.sel('Doctor', 'm-doc', this.DOCTORS, r.doctor) +
      this.sel('Visit Type', 'm-type', this.TYPES, r.type) +
      this.fld('Visit Time', 'm-time', r.time, 'e.g. 10:30 AM') +
      this.sel('Status', 'm-status', this.STATUSES, r.status) +
      this.sel('Source', 'm-source', this.SOURCES, r.source) +
      this.sel('Priority', 'm-prio', this.PRIOS, r.prio) +
      this.dfld('Follow-up Date', 'm-fu', r.followUp) +
      '</div>' +
      this.fld('Diagnosis Summary', 'm-dx', r.dx, 'Chief complaint / diagnosis') +
      this.area('Notes', 'm-notes', r.notes)
    );
  }

  private readForm(): Omit<Visit, 'id'> {
    const fu = (this.byId('m-fu') as HTMLInputElement | null)?.value || '';
    return {
      name: ((this.byId('m-name') as HTMLInputElement | null)?.value || '').trim(),
      age: +((this.byId('m-age') as HTMLInputElement | null)?.value || 0) || 0,
      gender: (this.byId('m-gender') as HTMLSelectElement | null)?.value || '',
      dept: (this.byId('m-dept') as HTMLSelectElement | null)?.value || '',
      doctor: (this.byId('m-doc') as HTMLSelectElement | null)?.value || '',
      type: (this.byId('m-type') as HTMLSelectElement | null)?.value || '',
      time: (this.byId('m-time') as HTMLInputElement | null)?.value || '—',
      status: (this.byId('m-status') as HTMLSelectElement | null)?.value || '',
      source: (this.byId('m-source') as HTMLSelectElement | null)?.value || '',
      prio: (this.byId('m-prio') as HTMLSelectElement | null)?.value || '',
      dx: (this.byId('m-dx') as HTMLInputElement | null)?.value || '—',
      followUp: fu,
      fu: !!fu,
      date: this.iso(this.today),
      notes: (this.byId('m-notes') as HTMLTextAreaElement | null)?.value || '',
    };
  }

  private openForm(kind: 'walkin' | 'followup' | 'new'): void {
    if (kind === 'walkin') {
      this.modal({
        title: 'Walk-in Registration',
        icon: 'icon-footprints',
        accent: 'pv-c-amber',
        sub: 'Register a walk-in patient visit',
        confirm: 'Register Walk-in',
        body: this.visitForm({ status: 'Waiting', type: 'Walk-in', source: 'Walk-in', prio: 'Medium' }),
        onConfirm: () => {
          const f = this.readForm();
          if (!f.name) {
            this.toast('Patient name is required', 'error');
            return false;
          }
          const nf: Visit = { ...f, id: this.nextId++ };
          this.data.unshift(nf);
          this.state.page = 1;
          this.buildKPIs();
          this.render();
          this.toast(`Walk-in registered · ${this.vid(nf.id)}`);
          return undefined;
        },
      });
      return;
    }
    if (kind === 'followup') {
      this.modal({
        title: 'Schedule Follow-up',
        icon: 'icon-calendar-plus',
        accent: 'pv-c-violet',
        sub: 'Book a follow-up visit',
        confirm: 'Schedule',
        body: this.sel('Patient', 'fu-p', this.data.map((r) => r.name)) + this.sel('Doctor', 'fu-doc', this.DOCTORS) + this.dfld('Follow-up Date', 'fu-date', this.dAhead(7)) + this.area('Instructions', 'fu-note'),
        onConfirm: () => {
          const nm = (this.byId('fu-p') as HTMLSelectElement | null)?.value;
          const r = this.data.find((x) => x.name === nm);
          if (r) {
            r.followUp = (this.byId('fu-date') as HTMLInputElement | null)?.value || this.dAhead(7);
            r.fu = true;
          }
          this.buildKPIs();
          this.render();
          this.toast(`Follow-up scheduled for ${nm}`);
        },
      });
      return;
    }
    this.modal({
      title: 'New Visit',
      icon: 'icon-clipboard-plus',
      accent: 'pv-c-teal',
      sub: 'Record a new patient visit',
      confirm: 'Create Visit',
      body: this.visitForm({ status: 'Waiting', type: 'New', source: 'Online', prio: 'Medium' }),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Patient name is required', 'error');
          return false;
        }
        const nf: Visit = { ...f, id: this.nextId++ };
        this.data.unshift(nf);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(`Visit created for ${nf.name}`);
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
          title: 'Edit Visit',
          sub: this.vid(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.visitForm(r),
          onConfirm: () => {
            Object.assign(r, this.readForm());
            this.buildKPIs();
            this.render();
            this.toast('Visit updated');
          },
        });
        return;
      case 'profile':
        this.toast(`Opening patient profile for ${r.name}`, 'info');
        return;
      case 'start':
        r.status = 'Ongoing';
        this.buildKPIs();
        this.render();
        this.buildTimeline(r);
        this.toast(`Consultation started for ${r.name}`);
        return;
      case 'complete':
        r.status = 'Completed';
        this.buildKPIs();
        this.render();
        this.buildTimeline(r);
        this.toast(`${r.name}'s consultation completed`);
        return;
      case 'dx':
        this.modal({
          title: 'Add Diagnosis',
          sub: r.name,
          icon: 'icon-clipboard-check',
          accent: 'pv-c-violet',
          confirm: 'Save',
          body: this.fld('Diagnosis', 'dx-t', r.dx) + this.area('Clinical notes', 'dx-n'),
          onConfirm: () => {
            r.dx = (this.byId('dx-t') as HTMLInputElement | null)?.value || r.dx;
            this.render();
            this.toast(`Diagnosis added for ${r.name}`);
          },
        });
        return;
      case 'rx':
        this.modal({
          title: 'Add Prescription',
          sub: r.name,
          icon: 'icon-pill',
          accent: 'pv-c-emerald',
          confirm: 'Prescribe',
          body:
            this.fld('Medication', 'rx-m', '', 'e.g. Amlodipine 5mg') +
            '<div class="grid grid-cols-2 gap-3">' +
            this.fld('Dosage', 'rx-d', '', '1-0-1') +
            this.fld('Duration', 'rx-du', '', '30 days') +
            '</div>' +
            this.area('Instructions', 'rx-i'),
          onConfirm: () => this.toast(`Prescription added for ${r.name}`),
        });
        return;
      case 'lab':
        this.modal({
          title: 'Order Lab Test',
          sub: r.name,
          icon: 'icon-flask-conical',
          accent: 'pv-c-amber',
          confirm: 'Order',
          body:
            '<div class="grid grid-cols-2 gap-2">' +
            ['CBC', 'Lipid Panel', 'HbA1c', 'LFT', 'KFT', 'TSH']
              .map((t) => `<label class="flex items-center gap-2 rounded-lg border border-border-color p-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" class="pv-check"> ${t}</label>`)
              .join('') +
            '</div>',
          onConfirm: () => this.toast(`Lab tests ordered for ${r.name}`),
        });
        return;
      case 'rad':
        this.modal({
          title: 'Order Radiology',
          sub: r.name,
          icon: 'icon-scan',
          accent: 'pv-c-sky',
          confirm: 'Order',
          body: this.sel('Study', 'rad-s', ['Chest X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'ECG']) + this.area('Clinical indication', 'rad-n'),
          onConfirm: () => this.toast(`Radiology ordered for ${r.name}`),
        });
        return;
      case 'followup':
        this.modal({
          title: 'Schedule Follow-up',
          sub: r.name,
          icon: 'icon-calendar-plus',
          accent: 'pv-c-violet',
          confirm: 'Schedule',
          body: this.sel('Doctor', 'f-doc', this.DOCTORS, r.doctor) + this.dfld('Follow-up Date', 'f-date', r.followUp || this.dAhead(7)) + this.area('Instructions', 'f-note'),
          onConfirm: () => {
            r.followUp = (this.byId('f-date') as HTMLInputElement | null)?.value || this.dAhead(7);
            r.fu = true;
            this.buildKPIs();
            this.render();
            this.toast(`Follow-up scheduled for ${r.followUp}`);
          },
        });
        return;
      case 'print':
        this.toast('Printing visit summary…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'pdf':
        this.toast(`Generating PDF for ${r.name}…`, 'info');
        return;
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: r.name,
          icon: 'icon-message-circle',
          accent: 'pv-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 's-msg', `Your visit summary is ready. ${r.fu ? `Follow-up on ${r.followUp}.` : ''}`),
          onConfirm: () => this.toast(`SMS sent to ${r.name}`),
        });
        return;
      case 'email':
        this.modal({
          title: 'Send Email',
          sub: r.name,
          icon: 'icon-mail',
          accent: 'pv-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'e-sub', 'Visit Summary') + this.area('Message', 'e-msg'),
          onConfirm: () => this.toast(`Email sent to ${r.name}`),
        });
        return;
      case 'archive':
        this.modal({
          title: 'Archive Visit',
          sub: r.name,
          icon: 'icon-archive',
          confirm: 'Archive',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Archive visit record <strong>${this.vid(r.id)}</strong>?</p>`,
          onConfirm: () => this.toast(`${this.vid(r.id)} archived`),
        });
        return;
      case 'delete':
        this.modal({
          title: 'Delete Visit',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'pv-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete visit <strong>${this.vid(r.id)}</strong> for ${this.esc(r.name)}?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => x.id !== id);
            delete this.state.sel[id];
            this.buildKPIs();
            this.render();
            this.toast('Visit deleted');
          },
        });
        return;
    }
  }

  /* ---------------- detail drawer ---------------- */

  private openDetail(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.buildTimeline(r);
    const kv = (k: string, v: string) => `<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">${k}</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">${v}</span></div>`;
    const sec = (t: string, inner: string) => `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">${t}</p>${inner}</div>`;
    const tl = (t: string, s: string, d: string) => `<div class="pv-tl-item"><span class="pv-tl-node"><i class="${d}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${t}</p><p class="text-[10px] text-gray-400">${s}</p></div>`;
    const tags = (arr: string[], ac: string) => `<div class="flex flex-wrap gap-1.5">${arr.map((x) => `<span class="pv-tag ${ac}">${x}</span>`).join('')}</div>`;
    const vit = (l: string, v: string, u: string, ac: string) => `<div class="rounded-xl border border-border-color p-2.5 pv-c-${ac}"><p class="text-[10px] text-gray-500">${l}</p><p class="text-sm font-extrabold text-gray-900 dark:text-white">${v} <span class="text-[10px] font-medium text-gray-400">${u}</span></p></div>`;

    const body = this.byId('pv-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="pv-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="pv-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="pv-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="pv-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4">${this.avatar(r)}<div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-white/80">${this.vid(r.id)} · ${r.age}y · ${this.esc(r.gender)}</p><div class="mt-1.5">${this.statusBadge(r.status)}</div></div></div></div>` +
        `<div class="p-4 space-y-4"><div class="flex flex-wrap gap-1.5">${this.typeTag(r.type)}${this.prioBadge(r.prio)}<span class="pv-tag pv-c-primary"><i class="icon-globe text-[10px]"></i>${this.esc(r.source)}</span></div>` +
        sec('Patient Summary', `<div class="rounded-xl border border-border-color p-3">${kv('Age / Gender', `${r.age}y · ${this.esc(r.gender)}`)}${kv('Department', this.esc(r.dept))}${kv('Priority', this.esc(r.prio))}</div>`) +
        sec(
          'Visit Information',
          `<div class="rounded-xl border border-border-color p-3">${kv('Visit Date', r.date)}${kv('Time', this.esc(r.time))}${kv('Doctor', this.esc(r.doctor))}${kv('Type', this.esc(r.type))}${kv('Status', this.esc(r.status))}${kv('Follow-up', r.fu ? r.followUp : 'Not required')}</div>`
        ) +
        sec('Chief Complaint', `<p class="text-sm text-gray-600 dark:text-gray-300">${this.esc(r.dx)}. Symptom onset 3 days ago, worsening with exertion.</p>`) +
        sec('Diagnosis', `<p class="text-sm text-gray-600 dark:text-gray-300">${this.esc(r.dx)} — confirmed on clinical examination.</p>`) +
        sec(
          'Vitals',
          `<div class="grid grid-cols-3 gap-2">${vit('BP', '128/82', 'mmHg', 'rose')}${vit('Pulse', '78', 'bpm', 'violet')}${vit('Temp', '98.6', '°F', 'amber')}${vit('SpO₂', '98', '%', 'sky')}${vit('Weight', '72', 'kg', 'teal')}${vit('BMI', '24.2', '', 'emerald')}</div>`
        ) +
        sec('Prescriptions', tags(['Amlodipine 5mg', 'Aspirin 75mg', 'Atorvastatin 20mg'], 'pv-c-emerald')) +
        sec('Laboratory Orders', tags(['Lipid Panel', 'HbA1c', 'CBC'], 'pv-c-amber')) +
        sec('Radiology Orders', tags(['Chest X-Ray', 'ECG'], 'pv-c-sky')) +
        sec('Doctor Notes', `<p class="text-sm text-gray-600 dark:text-gray-300">${this.esc(r.doctor)} — advise lifestyle modification, salt restriction; review labs at follow-up.</p>`) +
        sec(
          'Timeline',
          `<div class="pv-tl ${this.acc(r.dept)}">${tl('Registered', r.time, 'icon-user-plus')}${tl('Vitals recorded', 'BP 128/82', 'icon-heart-pulse')}${tl(`Consultation · ${this.esc(r.doctor)}`, r.status, 'icon-stethoscope')}${tl(r.fu ? `Follow-up ${r.followUp}` : 'No follow-up', 'Plan', 'icon-calendar-clock')}</div>`
        ) +
        `<div class="grid grid-cols-2 gap-2"><button class="pv-btn pv-btn-primary" data-da="start" data-id="${id}"><i class="icon-play"></i>Start</button><button class="pv-btn pv-btn-success" data-da="complete" data-id="${id}"><i class="icon-check-circle"></i>Complete</button><button class="pv-btn pv-btn-solid" data-da="rx" data-id="${id}"><i class="icon-pill"></i>Prescribe</button><button class="pv-btn pv-btn-solid" data-da="followup" data-id="${id}"><i class="icon-calendar-plus"></i>Follow-up</button></div></div>`;
    }
    this.byId('pv-detail-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ---------------- bulk ---------------- */

  private bulk(a: string): void {
    const recs = this.selectedRecs();
    const n = recs.length;
    if (!n && a !== 'clear') {
      this.toast('No visits selected', 'error');
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
          sub: `${n} visits`,
          icon: 'icon-user-cog',
          accent: 'pv-c-violet',
          confirm: 'Assign',
          body: this.sel('Doctor', 'bk-doc', this.DOCTORS),
          onConfirm: () => {
            const v = (this.byId('bk-doc') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.doctor = v));
            this.buildKPIs();
            this.render();
            this.toast(`${n} assigned to ${v}`);
          },
        });
        return;
      case 'status':
        this.modal({
          title: 'Update Visit Status',
          sub: `${n} visits`,
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
      case 'followup':
        this.modal({
          title: 'Schedule Follow-up',
          sub: `${n} visits`,
          icon: 'icon-calendar-plus',
          accent: 'pv-c-violet',
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
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: `${n} visits`,
          icon: 'icon-message-circle',
          accent: 'pv-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 'bk-sms'),
          onConfirm: () => this.toast(`SMS sent to ${n} patients`),
        });
        return;
      case 'email':
        this.modal({
          title: 'Send Email',
          sub: `${n} visits`,
          icon: 'icon-mail',
          accent: 'pv-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'bk-esub', 'Visit Update') + this.area('Message', 'bk-emsg'),
          onConfirm: () => this.toast(`Email sent to ${n} patients`),
        });
        return;
      case 'export':
        this.toast(`Exported ${n} visits`);
        return;
      case 'print':
        this.toast(`Printing ${n} summaries…`, 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'delete':
        this.modal({
          title: `Delete ${n} visits`,
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'pv-c-rose',
          danger: true,
          confirm: `Delete ${n}`,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete ${n} selected visit records?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => !this.state.sel[x.id]);
            this.state.sel = {};
            this.buildKPIs();
            this.render();
            this.toast(`${n} visits deleted`);
          },
        });
        return;
    }
  }

  private importModal(): void {
    this.modal({
      title: 'Import Visits',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'pv-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div><div class="flex items-center gap-2 mt-3"><span class="pv-chip pv-c-emerald">CSV</span><span class="pv-chip pv-c-emerald">Excel</span><a href="#" class="ml-auto text-xs font-bold text-primary hover:underline" id="pv-tmpl">Download template</a></div><div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">20</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">2</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 20 visits (2 warnings)'),
    });
    const tm = this.byId('pv-tmpl');
    if (tm) {
      tm.onclick = (e: Event) => {
        e.preventDefault();
        this.toast('Template downloaded', 'info');
      };
    }
  }

  private exportModal(): void {
    this.modal({
      title: 'Export Visits',
      icon: 'icon-download',
      accent: 'pv-c-emerald',
      confirm: 'Export',
      body:
        '<label class="pv-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map((f, i) => `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="pv-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`)
          .join('') +
        '</div><label class="pv-lbl">Records</label><div class="space-y-2">' +
        [
          ['all', 'All records'],
          ['filtered', 'Current filters'],
          ['selected', `Selected (${this.selN()})`],
        ]
          .map((o, i) => `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="pv-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`)
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.qs('input[name="pv-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const s = (this.qs('input[name="pv-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
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
    const search = this.byId('pv-search') as HTMLInputElement | null;
    if (search) search.value = '';
    const dept = this.byId('pv-f-dept') as HTMLSelectElement | null;
    if (dept) dept.value = '';
    const status = this.byId('pv-f-status') as HTMLSelectElement | null;
    if (status) status.value = '';
    this.byId('pv-filter-badge')?.classList.add('hidden');
    this.render();
  }

  private wireToolbar(): void {
    this.on('pv-search', 'input', (e: Event) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('pv-f-dept', 'change', (e: Event) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('pv-f-status', 'change', (e: Event) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('pv-sort', 'change', (e: Event) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    this.on('pv-refresh', 'click', () => {
      this.toast('Refreshed');
      const updated = this.byId('pv-updated');
      if (updated) updated.textContent = 'just now';
      this.buildKPIs();
      this.render();
    });
    this.on('pv-import', 'click', () => this.importModal());
    this.on('pv-export', 'click', () => this.exportModal());
    this.on('pv-print', 'click', () => {
      this.toast('Printing visit report…', 'info');
      setTimeout(() => window.print(), 400);
    });
    this.on('pv-filters', 'click', () => {
      this.byId('pv-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.on('pv-size', 'change', (e: Event) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('pv-jump', 'change', (e: Event) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    this.on('pv-empty-clear', 'click', () => this.clearFilters());
  }

  private wirePageNav(): void {
    this.byId('pv-page-nav')?.addEventListener('click', (e: Event) => {
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
    this.on('pv-select-all', 'change', selectAll);
    this.on('pv-select-all-2', 'change', selectAll);
  }

  private wireGridDelegation(): void {
    const delegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.pv-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +(mb.getAttribute('data-id') || 0));
        return;
      }
      const st = target.closest('.pv-start') as HTMLElement | null;
      if (st) {
        this.rowAction('start', +(st.getAttribute('data-id') || 0));
        return;
      }
      const v = target.closest('.pv-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const ed = target.closest('.pv-edit') as HTMLElement | null;
      if (ed) {
        this.rowAction('edit', +(ed.getAttribute('data-id') || 0));
        return;
      }
      const ch = target.closest('.pv-rowcheck') as HTMLInputElement | null;
      if (ch) {
        if (ch.checked) this.state.sel[+(ch.getAttribute('data-id') || 0)] = true;
        else delete this.state.sel[+(ch.getAttribute('data-id') || 0)];
        this.render();
        return;
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.pv-card') as HTMLElement | null;
      if (card) this.openDetail(+(card.getAttribute('data-id') || 0));
    };
    this.byId('pv-gridview')?.addEventListener('click', delegate);
  }

  private wireWidgetsDelegation(): void {
    this.byId('pv-page')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const v = target.closest('#pv-recentwidget .pv-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const d = target.closest('[data-docact]') as HTMLElement | null;
      if (d) {
        const doc = d.getAttribute('data-doc') || '';
        const act = d.getAttribute('data-docact');
        this.toast(`${act === 'msg' ? 'Messaging ' : 'Opening schedule for '}${doc}…`, 'info');
      }
    });
  }

  private wireDocumentDelegation(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        const k = op.getAttribute('data-open');
        if (k === 'new') return void this.openForm('new');
        if (k === 'walkin') return void this.openForm('walkin');
        if (k === 'followup') return void this.openForm('followup');
        if (k === 'export') return void this.exportModal();
      }
      const ac = target.closest('[data-act]') as HTMLElement | null;
      if (ac) {
        const a = ac.getAttribute('data-act');
        if (a === 'print-report') {
          this.toast('Preparing visit report…', 'info');
          setTimeout(() => window.print(), 400);
        }
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa<HTMLElement>('.pv-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('pv-detail-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da') || '', +(da.getAttribute('data-id') || 0));
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.pv-menu-btn,#pv-cols')) this.closeMenu();
    });
  }

  private wireModalDismiss(): void {
    this.byId('pv-modal')?.addEventListener('mousedown', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === this.byId('pv-modal') || target.classList.contains('pv-modal-back')) this.closeModal();
    });
  }

  private wireBulkBar(): void {
    this.byId('pv-bulkbar')?.addEventListener('click', (e: Event) => {
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
        this.qsa<HTMLElement>('.pv-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
    });
  }

  private wireFilterDrawer(): void {
    this.on('fd-apply', 'click', () => {
      this.state.adv = {
        doctor: (this.byId('fd-doctor') as HTMLSelectElement | null)?.value || '',
        type: (this.byId('fd-type') as HTMLSelectElement | null)?.value || '',
        source: (this.byId('fd-source') as HTMLSelectElement | null)?.value || '',
        prio: (this.byId('fd-prio') as HTMLSelectElement | null)?.value || '',
        fu: (this.byId('fd-fu') as HTMLSelectElement | null)?.value || '',
        from: (this.byId('fd-from') as HTMLInputElement | null)?.value || '',
        to: (this.byId('fd-to') as HTMLInputElement | null)?.value || '',
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('pv-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('pv-filter-drawer')?.classList.remove('open');
      this.document.body.style.overflow = '';
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
    });
    this.on('fd-reset', 'click', () => {
      this.qsa<HTMLInputElement | HTMLSelectElement>('#pv-filter-drawer select,#pv-filter-drawer input').forEach((i) => (i.value = ''));
      this.state.adv = {};
      this.byId('pv-filter-badge')?.classList.add('hidden');
      this.render();
    });
  }
}
