import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

interface Admission {
  id: number;
  name: string;
  dept: string;
  doctor: string;
  ward: string;
  room: string;
  bed: string;
  type: string;
  date: string;
  time: string;
  status: string;
  ins: string;
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

@Component({
  imports: [RouterLink],
  selector: 'app-admissions',
  styleUrl: './admissions.css',
  templateUrl: './admissions.html',
})
export class Admissions implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly DEPT_ACC: Record<string, string> = {
    Cardiology: 'rose',
    Neurology: 'violet',
    Orthopedics: 'amber',
    Pediatrics: 'sky',
    ICU: 'rose',
    Maternity: 'teal',
    Oncology: 'indigo',
    Emergency: 'rose',
  };

  private readonly today = new Date();
  private readonly DOCTORS = ['Dr. Chen', 'Dr. Kumar', 'Dr. Mills', 'Dr. Park', 'Dr. Wang', 'Dr. Rivas'];
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'ICU', 'Maternity', 'Oncology', 'Emergency'];
  private readonly WARDS = ['General 2F', 'ICU', 'Maternity', 'Isolation', 'Emergency'];

  private data: Admission[] = [];
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

  private menu: HTMLElement | null = null;
  private selBed: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.data = this.buildSeedData();
    this.nextId = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    const page = this.byId('ad-page');
    if (!page) return;

    const grid = this.byId('ad-gridview');
    const empty = this.byId('ad-empty');
    const pager = this.byId('ad-pager');

    setTimeout(() => {
      const sk = this.byId('ad-skeleton');
      const ct = this.byId('ad-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'ad-fadein .4s ease';
      }
      this.buildKPIs();
      this.render();
    }, 1500);

    /* ---- events ---- */
    const on = (id: string, ev: string, fn: (e: Event) => void) => this.byId(id)?.addEventListener(ev, fn);
    on('ad-search', 'input', (e: Event) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    on('ad-f-dept', 'change', (e: Event) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    on('ad-f-status', 'change', (e: Event) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    on('ad-sort', 'change', (e: Event) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    on('ad-refresh', 'click', () => {
      this.toast('Refreshed');
      const updated = this.byId('ad-updated');
      if (updated) updated.textContent = 'just now';
      this.render();
    });
    on('ad-import', 'click', () => this.importModal());
    on('ad-export', 'click', () => this.exportModal());
    on('ad-filters', 'click', () => {
      this.byId('ad-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    on('ad-size', 'change', (e: Event) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    on('ad-jump', 'change', (e: Event) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    on('ad-empty-clear', 'click', () => this.clearFilters());

    this.byId('ad-page-nav')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-pg]') as HTMLElement | null;
      if (!b) return;
      const v = b.getAttribute('data-pg');
      if (v === 'prev') this.state.page--;
      else if (v === 'next') this.state.page++;
      else this.state.page = +(v || 1);
      this.render();
    });

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
    on('ad-select-all', 'change', selectAll);

    /* delegated results clicks */
    const delegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.ad-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +(mb.getAttribute('data-id') || 0));
        return;
      }
      const v = target.closest('.ad-view') as HTMLElement | null;
      if (v) return this.openDetail(+(v.getAttribute('data-id') || 0));
      const ed = target.closest('.ad-edit') as HTMLElement | null;
      if (ed) return this.rowAction('edit', +(ed.getAttribute('data-id') || 0));
      const ch = target.closest('.ad-rowcheck') as HTMLInputElement | null;
      if (ch) {
        if (ch.checked) this.state.sel[+(ch.getAttribute('data-id') || 0)] = true;
        else delete this.state.sel[+(ch.getAttribute('data-id') || 0)];
        return this.render();
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.ad-card') as HTMLElement | null;
      if (card) return this.openDetail(+(card.getAttribute('data-id') || 0));
    };
    grid?.addEventListener('click', delegate);
    this.byId('ad-recentwidget')?.addEventListener('click', (e: Event) => {
      const v = (e.target as HTMLElement).closest('.ad-view') as HTMLElement | null;
      if (v) this.openDetail(+(v.getAttribute('data-id') || 0));
    });

    /* hero / quick opens */
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        const k = op.getAttribute('data-open');
        if (k === 'new' || k === 'emergency') return this.openForm(k as 'new' | 'emergency');
        if (k === 'bed') {
          this.document.querySelector('#ad-bedgrid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return this.toast('Pick an available bed on the right', 'info');
        }
      }
      const ac = target.closest('[data-act]') as HTMLElement | null;
      if (ac) {
        const a = ac.getAttribute('data-act');
        if (a === 'print-list') {
          this.toast('Preparing admission list…', 'info');
          setTimeout(() => window.print(), 400);
        }
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa('.ad-drawer.open').forEach((d) => d.classList.remove('open'));
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('ad-detail-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da') || '', +(da.getAttribute('data-id') || 0));
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.ad-menu-btn')) this.closeMenu();
    });
    this.byId('ad-modal')?.addEventListener('mousedown', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === this.byId('ad-modal') || target.classList.contains('ad-modal-back')) this.closeModal();
    });
    this.byId('ad-bulkbar')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-bulk]') as HTMLElement | null;
      if (b) this.bulk(b.getAttribute('data-bulk') || '');
    });
    window.addEventListener('resize', () => this.closeMenu());
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeModal();
        this.qsa('.ad-drawer.open').forEach((d) => d.classList.remove('open'));
      }
    });

    /* filter drawer */
    on('fd-apply', 'click', () => {
      this.state.adv = {
        doctor: (this.byId('fd-doctor') as HTMLSelectElement | null)?.value || '',
        ward: (this.byId('fd-ward') as HTMLSelectElement | null)?.value || '',
        room: (this.byId('fd-room') as HTMLInputElement | null)?.value || '',
        type: (this.byId('fd-type') as HTMLSelectElement | null)?.value || '',
        ins: (this.byId('fd-ins') as HTMLSelectElement | null)?.value || '',
        from: (this.byId('fd-from') as HTMLInputElement | null)?.value || '',
        to: (this.byId('fd-to') as HTMLInputElement | null)?.value || '',
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('ad-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('ad-filter-drawer')?.classList.remove('open');
      this.document.body.style.overflow = '';
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
    });
    on('fd-reset', 'click', () => {
      this.qsa<HTMLInputElement | HTMLSelectElement>('#ad-filter-drawer select,#ad-filter-drawer input').forEach((i) => (i.value = ''));
      this.state.adv = {};
      this.byId('ad-filter-badge')?.classList.add('hidden');
      this.render();
    });

    /* bed grid selection */
    this.byId('ad-bedgrid') &&
      page.addEventListener('click', (e: Event) => {
        const c = (e.target as HTMLElement).closest('.ad-bedcell') as HTMLElement | null;
        if (!c) return;
        if (c.getAttribute('data-state') === 'occupied') return void this.toast('Bed occupied', 'error');
        this.qsa('#ad-bedgrid .ad-bedcell.selected').forEach((x) => x.classList.remove('selected'));
        c.classList.add('selected');
        this.selBed = c.getAttribute('data-bed');
        const sel = this.byId('ad-bed-sel');
        if (sel) sel.textContent = `Bed ${this.selBed}`;
      });
    on('ad-bed-confirm', 'click', () => {
      if (!this.selBed) return void this.toast('Select a bed first', 'error');
      this.toast(`Bed ${this.selBed} assigned`);
    });
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
    return `ad-c-${this.DEPT_ACC[d] || 'primary'}`;
  }

  private aid(n: number): string {
    return `ADM-${String(n).padStart(4, '0')}`;
  }

  private detailUrl(r: Admission): string {
    return `admission-detail?${new URLSearchParams({ id: String(r.id), name: r.name, dept: r.dept, doctor: r.doctor, status: r.status }).toString()}`;
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

  private selN(): number {
    return Object.keys(this.state.sel).length;
  }

  /* ---------------- seed data ---------------- */

  private buildSeedData(): Admission[] {
    const raw: Omit<Admission, 'id'>[] = [
      { name: 'James Morrison', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', room: '204', bed: 'B', type: 'Scheduled', date: this.dAgo(0), time: '09:20', status: 'Admitted', ins: 'Verified' },
      { name: 'Carlos Mendez', dept: 'Emergency', doctor: 'Dr. Mills', ward: 'Emergency', room: 'ER-5', bed: '3', type: 'Emergency', date: this.dAgo(0), time: '10:05', status: 'Admitted', ins: 'Pending' },
      { name: 'Sophia Wilson', dept: 'Maternity', doctor: 'Dr. Park', ward: 'Maternity', room: '114', bed: 'A', type: 'Scheduled', date: this.dAgo(0), time: '11:40', status: 'Pending', ins: 'Verified' },
      { name: 'Robert Clark', dept: 'ICU', doctor: 'Dr. Mills', ward: 'ICU', room: 'ICU-3', bed: '1', type: 'Emergency', date: this.dAgo(1), time: '22:15', status: 'Admitted', ins: 'Pending' },
      { name: 'Isabella Garcia', dept: 'Oncology', doctor: 'Dr. Rivas', ward: 'General 2F', room: '310', bed: 'A', type: 'Transfer', date: this.dAgo(1), time: '14:30', status: 'Reserved', ins: 'Verified' },
      { name: 'William Davis', dept: 'Neurology', doctor: 'Dr. Kumar', ward: 'General 2F', room: '208', bed: 'B', type: 'Transfer', date: this.dAgo(2), time: '08:00', status: 'Admitted', ins: 'Verified' },
      { name: 'Mia Robinson', dept: 'Orthopedics', doctor: 'Dr. Wang', ward: 'General 2F', room: '301', bed: 'C', type: 'Scheduled', date: this.dAgo(2), time: '13:10', status: 'Discharged', ins: 'Uninsured' },
      { name: 'Ethan Miller', dept: 'Pediatrics', doctor: 'Dr. Park', ward: 'General 2F', room: 'Ward-1', bed: '4', type: 'Observation', date: this.dAgo(2), time: '16:45', status: 'Pending', ins: 'Pending' },
      { name: 'Olivia Brown', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', room: '205', bed: 'A', type: 'Scheduled', date: this.dAgo(3), time: '10:20', status: 'Reserved', ins: 'Verified' },
      { name: 'Mason Lee', dept: 'Orthopedics', doctor: 'Dr. Wang', ward: 'General 2F', room: 'OT-2', bed: 'B', type: 'Scheduled', date: this.dAgo(3), time: '09:00', status: 'Admitted', ins: 'Verified' },
      { name: 'Linda Nguyen', dept: 'Oncology', doctor: 'Dr. Rivas', ward: 'General 2F', room: '312', bed: 'A', type: 'Observation', date: this.dAgo(4), time: '12:30', status: 'Admitted', ins: 'Pending' },
      { name: 'Michael Harris', dept: 'ICU', doctor: 'Dr. Kumar', ward: 'ICU', room: 'ICU-2', bed: '2', type: 'Emergency', date: this.dAgo(4), time: '03:15', status: 'Admitted', ins: 'Verified' },
      { name: 'Anna Peterson', dept: 'Pediatrics', doctor: 'Dr. Park', ward: 'Isolation', room: 'ISO-1', bed: '1', type: 'Emergency', date: this.dAgo(5), time: '18:20', status: 'Discharged', ins: 'Uninsured' },
      { name: 'David Torres', dept: 'Cardiology', doctor: 'Dr. Chen', ward: 'General 2F', room: '206', bed: 'C', type: 'Scheduled', date: this.dAgo(5), time: '11:00', status: 'Reserved', ins: 'Verified' },
    ];
    return raw.map((r, i) => ({ ...r, id: i + 1 }));
  }

  /* ---------------- render helpers ---------------- */

  private statusBadge(s: string): string {
    const c: Record<string, string> = { Admitted: 'admitted', Pending: 'pending', Reserved: 'reserved', Discharged: 'discharged' };
    return `<span class="ad-badge ${c[s] || 'pending'}">${this.esc(s)}</span>`;
  }

  private typeTag(t: string): string {
    const a: Record<string, string> = { Emergency: 'ad-c-rose', Scheduled: 'ad-c-primary', Transfer: 'ad-c-violet', Observation: 'ad-c-amber' };
    return `<span class="ad-tag ${a[t] || 'ad-c-primary'}">${this.esc(t)}</span>`;
  }

  private insBadge(i: string): string {
    const m: Record<string, [string, string]> = { Verified: ['emerald', 'icon-badge-check'], Pending: ['amber', 'icon-clock'], Uninsured: ['rose', 'icon-shield-x'] };
    const a = m[i] || m['Pending'];
    return `<span class="ad-chip ad-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(i)}</span>`;
  }

  private avatar(r: Admission): string {
    return `<span class="${this.acc(r.dept)} ad-ava-ring"><img class="ad-ava object-cover" src="${this.photo(r.id)}" alt=""></span>`;
  }

  private filtered(): Admission[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    let rows = this.data.filter((r) => {
      if (q && !(`${r.name} ${this.aid(r.id)} ${r.doctor} ${r.ward} ${r.dept}`.toLowerCase().indexOf(q) > -1)) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['doctor'] && r.doctor !== a['doctor']) return false;
      if (a['ward'] && r.ward !== a['ward']) return false;
      if (a['room'] && (r.room || '').toLowerCase().indexOf(a['room'].toLowerCase()) === -1) return false;
      if (a['type'] && r.type !== a['type']) return false;
      if (a['ins'] && r.ins !== a['ins']) return false;
      if (a['from'] && r.date < a['from']) return false;
      if (a['to'] && r.date > a['to']) return false;
      return true;
    });
    rows = rows.slice().sort((x, y) => {
      switch (this.state.sort) {
        case 'newest':
          return (y.date + y.time).localeCompare(x.date + x.time);
        case 'oldest':
          return (x.date + x.time).localeCompare(y.date + y.time);
        case 'name':
          return x.name.localeCompare(y.name);
        case 'status':
          return x.status.localeCompare(y.status);
        case 'dept':
          return x.dept.localeCompare(y.dept);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: Admission): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="ad-card ${this.acc(r.dept)}${sel}" data-id="${r.id}"><div class="p-4">` +
      `<div class="flex items-start gap-3"><input type="checkbox" class="ad-check mt-1 ad-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}>${this.avatar(r)}` +
      `<div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><a href="${this.detailUrl(r)}" class="text-[11px] font-mono text-primary hover:underline">${this.aid(r.id)}</a></div>` +
      `<button class="ad-mini ad-menu-btn" data-id="${r.id}"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3">${this.typeTag(r.type)}${this.statusBadge(r.status)}${this.insBadge(r.ins)}</div>` +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">' +
      `<span class="ad-kv"><i class="icon-building-2 text-primary/70"></i><b class="truncate">${this.esc(r.dept)}</b></span>` +
      `<span class="ad-kv"><i class="icon-stethoscope text-primary/70"></i><b class="truncate">${this.esc(r.doctor)}</b></span>` +
      `<span class="ad-kv"><i class="icon-layout-grid text-primary/70"></i><b class="truncate">${this.esc(r.ward)}</b></span>` +
      `<span class="ad-kv"><i class="icon-bed text-primary/70"></i>Room ${this.esc(r.room)} · <span class="ad-bed">${this.esc(r.bed)}</span></span>` +
      '</div>' +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><span class="text-[11px] text-gray-400"><i class="icon-clock"></i> ${r.date} · ${r.time}</span>` +
      `<div class="flex gap-1.5"><button class="ad-mini ad-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="ad-mini ad-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>` +
      '</div></article>'
    );
  }

  private render(): void {
    const grid = this.byId('ad-gridview');
    const empty = this.byId('ad-empty');
    const pager = this.byId('ad-pager');
    if (!grid || !empty || !pager) return;

    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);

    const count = this.byId('ad-count');
    if (count) count.textContent = `${total} of ${this.data.length} admissions`;
    empty.classList.toggle('hidden', total !== 0);
    pager.classList.toggle('hidden', total === 0);
    grid.innerHTML = pageRows.map((r) => this.cardHTML(r)).join('');
    const pageInfo = this.byId('ad-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No records';
    this.pageNav(pages);
    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa = this.byId('ad-select-all') as HTMLInputElement | null;
    if (sa) sa.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="ad-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="ad-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="ad-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const nav = this.byId('ad-page-nav');
    if (nav) nav.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.ad-ring[data-p]', scope || this.document).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
      });
    });
  }

  /* ---------------- KPIs + widgets ---------------- */

  private buildKPIs(): void {
    const by = (f: (r: Admission) => boolean) => this.data.filter(f).length;
    const k: [string, number, string, string, number, string][] = [
      ["Today's Admissions", by((r) => r.date === this.iso(this.today)), 'indigo', 'icon-user-plus', 60, '+18%'],
      ['Active Admissions', by((r) => r.status === 'Admitted'), 'emerald', 'icon-hospital', 82, 'Live'],
      ['Emergency', by((r) => r.type === 'Emergency'), 'rose', 'icon-siren', 40, 'Urgent'],
      ['Scheduled', by((r) => r.type === 'Scheduled'), 'sky', 'icon-calendar-check', 55, 'Planned'],
      ['Pending Beds', by((r) => r.status === 'Pending' || r.status === 'Reserved'), 'amber', 'icon-bed', 35, 'Queue'],
      ['Available Beds', 18, 'teal', 'icon-check-check', 30, 'Free'],
    ];
    const spark = '1,14 9,11 17,13 25,7 33,9 41,4 53,2';
    const kpis = this.byId('ad-kpis');
    if (kpis) {
      kpis.innerHTML = k
        .map(
          (c) =>
            `<div class="ad-stat ad-c-${c[2]}"><div class="flex items-start justify-between"><span class="ad-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="ad-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="ad-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--ad-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
    }
    this.initRings(this.byId('ad-kpis'));

    const occ: [string, number, string][] = [
      ['Occupied', 62, 'rose'],
      ['Available', 22, 'emerald'],
      ['Reserved', 10, 'amber'],
    ];
    const occwidget = this.byId('ad-occwidget');
    if (occwidget) {
      occwidget.innerHTML = occ
        .map(
          (o) =>
            `<div class="ad-c-${o[2]}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${o[0]}</span><b class="text-gray-900 dark:text-white">${o[1]}%</b></div><div class="ad-bar"><i style="width:${o[1]}%"></i></div></div>`
        )
        .join('');
    }

    const dept: [string, number, string][] = [
      ['Cardiology', 24, 'rose'],
      ['ICU', 18, 'violet'],
      ['Maternity', 15, 'teal'],
    ];
    const deptwidget = this.byId('ad-deptwidget');
    if (deptwidget) {
      deptwidget.innerHTML = dept
        .map(
          (d) =>
            `<div class="ad-c-${d[2]}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${d[0]}</span><b class="text-gray-900 dark:text-white">${d[1]}</b></div><div class="ad-bar"><i style="width:${d[1] * 3}%"></i></div></div>`
        )
        .join('');
    }

    const recentwidget = this.byId('ad-recentwidget');
    if (recentwidget) {
      recentwidget.innerHTML = this.data
        .slice(0, 6)
        .map(
          (r) =>
            `<button class="ad-recent w-full text-left ad-view" data-id="${r.id}"><span class="${this.acc(r.dept)} ad-ava-ring" style="border-radius:.7rem"><img class="ad-ava object-cover" style="width:2.1rem;height:2.1rem;border-radius:.6rem" src="${this.photo(r.id)}" alt=""></span><div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[10px] text-gray-400">${this.aid(r.id)} · ${r.ward}</p></div>${this.statusBadge(r.status)}</button>`
        )
        .join('');
    }

    const todayBadge = this.byId('ad-today-badge');
    if (todayBadge) todayBadge.textContent = String(by((r) => r.date === this.iso(this.today)));
    const occPct = this.byId('ad-occ-pct');
    if (occPct) occPct.textContent = '78%';
    const occBar = this.byId('ad-occ-bar');
    if (occBar) occBar.style.width = '78%';

    const bs: [string, number, string][] = [
      ['Available', 18, 'emerald'],
      ['Occupied', 62, 'rose'],
      ['Reserved', 8, 'amber'],
      ['ICU', 6, 'violet'],
    ];
    const bedstats = this.byId('ad-bedstats');
    if (bedstats) {
      bedstats.innerHTML = bs.map((b) => `<div class="rounded-xl border border-border-color p-2"><p class="text-base font-extrabold text-gray-900 dark:text-white">${b[1]}</p><p class="text-[10px] text-gray-500">${b[0]}</p></div>`).join('');
    }
    const states = [
      'available', 'occupied', 'available', 'reserved', 'occupied', 'icu', 'occupied', 'available', 'available', 'occupied', 'reserved', 'available',
      'occupied', 'available', 'icu', 'occupied', 'available', 'occupied', 'available', 'reserved', 'occupied', 'available', 'occupied', 'available',
    ];
    const bedgrid = this.byId('ad-bedgrid');
    if (bedgrid) {
      bedgrid.innerHTML = states.map((s, i) => `<div class="ad-bedcell ${s}" data-bed="${i + 1}" data-state="${s}" title="Bed ${i + 1} · ${s}">${i + 1}</div>`).join('');
    }
  }

  /* ---------------- selection / bulk ---------------- */

  private updateBulk(): void {
    const n = this.selN();
    const cnt = this.byId('ad-bulk-count');
    if (cnt) cnt.textContent = String(n);
    const bar = this.byId('ad-bulkbar');
    if (bar) (bar as HTMLElement).hidden = n === 0;
  }

  private selectedRecs(): Admission[] {
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
      '<div class="ad-menu"><p class="ad-menu-lbl">Manage</p>' +
      I('icon-eye', 'View Details', 'view') +
      I('icon-edit', 'Edit Admission', 'edit') +
      I('icon-bed', 'Assign Bed', 'bed') +
      I('icon-layout-grid', 'Transfer Ward', 'tward') +
      I('icon-arrow-left-right', 'Transfer Room', 'troom') +
      I('icon-stethoscope', 'Assign Doctor', 'assign') +
      I('icon-shield-check', 'Insurance Verify', 'ins') +
      I('icon-upload', 'Upload Documents', 'upload') +
      '<div class="ad-menu-sep"></div><p class="ad-menu-lbl">Share</p>' +
      I('icon-printer', 'Print Form', 'print') +
      I('icon-download', 'Download PDF', 'pdf') +
      I('icon-message-circle', 'Send SMS', 'sms') +
      I('icon-mail', 'Send Email', 'email') +
      '<div class="ad-menu-sep"></div>' +
      I('icon-log-out', 'Discharge', 'discharge') +
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
      const t = (e.target as HTMLElement).closest('[data-a]') as HTMLElement | null;
      if (!t) return;
      this.rowAction(t.getAttribute('data-a') || '', +(t.getAttribute('data-id') || 0));
      this.closeMenu();
    });
  }

  /* ---------------- modal engine ---------------- */

  private modal(o: ModalOptions): void {
    const title = this.byId('ad-modal-title');
    if (title) title.textContent = o.title;
    const sub = this.byId('ad-modal-sub');
    if (sub) sub.textContent = o.sub || '';
    const ico = this.byId('ad-modal-ico');
    if (ico) {
      ico.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      ico.className = `ad-doc-ico ${o.accent || 'ad-c-primary'}`;
    }
    const body = this.byId('ad-modal-body');
    if (body) body.innerHTML = o.body || '';
    const c = this.byId('ad-modal-confirm');
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = `ad-btn ${o.danger ? 'ad-btn-danger' : 'ad-btn-primary'}`;
      (c as HTMLButtonElement).onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('ad-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    this.byId('ad-modal')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private fld(l: string, id: string, v?: string, ph?: string): string {
    return `<div><label class="ad-lbl">${l}</label><input id="${id}" class="ad-in" value="${this.esc(v || '')}" placeholder="${this.esc(ph || '')}"></div>`;
  }

  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="ad-lbl">${l}</label><select id="${id}" class="ad-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }

  private area(l: string, id: string, v?: string): string {
    return `<div><label class="ad-lbl">${l}</label><textarea id="${id}" class="ad-in" rows="3" style="resize:vertical">${this.esc(v || '')}</textarea></div>`;
  }

  private admissionForm(r: Partial<Admission>): string {
    r = r || {};
    return (
      '<div class="grid grid-cols-2 gap-3">' +
      this.fld('Patient Name', 'm-name', r.name, 'Full name') +
      this.sel('Department', 'm-dept', this.DEPTS, r.dept) +
      this.sel('Doctor', 'm-doc', this.DOCTORS, r.doctor) +
      this.sel('Ward', 'm-ward', this.WARDS, r.ward) +
      this.fld('Room', 'm-room', r.room, '204') +
      this.fld('Bed', 'm-bed', r.bed, 'B') +
      this.sel('Type', 'm-type', ['Scheduled', 'Emergency', 'Transfer', 'Observation'], r.type) +
      this.sel('Insurance', 'm-ins', ['Verified', 'Pending', 'Uninsured'], r.ins) +
      '</div>' +
      this.area('Admission Notes', 'm-notes', r.notes)
    );
  }

  private readForm(): Omit<Admission, 'id' | 'date' | 'time' | 'status'> {
    return {
      name: ((this.byId('m-name') as HTMLInputElement | null)?.value || '').trim(),
      dept: (this.byId('m-dept') as HTMLSelectElement | null)?.value || '',
      doctor: (this.byId('m-doc') as HTMLSelectElement | null)?.value || '',
      ward: (this.byId('m-ward') as HTMLSelectElement | null)?.value || '',
      room: ((this.byId('m-room') as HTMLInputElement | null)?.value || '').trim() || 'TBA',
      bed: ((this.byId('m-bed') as HTMLInputElement | null)?.value || '').trim() || '—',
      type: (this.byId('m-type') as HTMLSelectElement | null)?.value || '',
      ins: (this.byId('m-ins') as HTMLSelectElement | null)?.value || '',
      notes: (this.byId('m-notes') as HTMLTextAreaElement | null)?.value || '',
    };
  }

  private openForm(kind: 'new' | 'emergency'): void {
    const emg = kind === 'emergency';
    this.modal({
      title: emg ? 'Emergency Admission' : 'New Admission',
      icon: emg ? 'icon-siren' : 'icon-user-plus',
      accent: emg ? 'ad-c-rose' : 'ad-c-primary',
      sub: 'Register a new patient admission',
      confirm: emg ? 'Emergency Admit' : 'Create Admission',
      body: this.admissionForm(emg ? { type: 'Emergency', ward: 'Emergency' } : {}),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Patient name is required', 'error');
          return false;
        }
        const rec: Admission = { ...f, id: this.nextId++, date: this.iso(this.today), time: new Date().toTimeString().slice(0, 5), status: emg ? 'Admitted' : 'Pending' };
        this.data.unshift(rec);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(`${emg ? 'Emergency admission' : 'Admission'} created for ${rec.name}`);
        return undefined;
      },
    });
  }

  /* ---------------- row actions ---------------- */

  private rowAction(a: string, id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    switch (a) {
      case 'view':
        return this.openDetail(id);
      case 'edit':
        return this.modal({
          title: 'Edit Admission',
          sub: this.aid(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.admissionForm(r),
          onConfirm: () => {
            Object.assign(r, this.readForm());
            this.buildKPIs();
            this.render();
            this.toast('Admission updated');
          },
        });
      case 'bed':
        return this.modal({
          title: 'Assign Bed',
          sub: r.name,
          icon: 'icon-bed',
          accent: 'ad-c-emerald',
          confirm: 'Assign',
          body: this.sel('Ward', 'b-ward', this.WARDS, r.ward) + '<div class="grid grid-cols-2 gap-3">' + this.fld('Room', 'b-room', r.room) + this.fld('Bed', 'b-bed', r.bed) + '</div>',
          onConfirm: () => {
            r.ward = (this.byId('b-ward') as HTMLSelectElement).value;
            r.room = (this.byId('b-room') as HTMLInputElement).value;
            r.bed = (this.byId('b-bed') as HTMLInputElement).value;
            this.render();
            this.toast(`Bed assigned · ${r.room}-${r.bed}`);
          },
        });
      case 'tward':
        return this.modal({
          title: 'Transfer Ward',
          sub: r.name,
          icon: 'icon-layout-grid',
          accent: 'ad-c-violet',
          confirm: 'Transfer',
          body: this.sel('To Ward', 't-ward', this.WARDS, r.ward),
          onConfirm: () => {
            r.ward = (this.byId('t-ward') as HTMLSelectElement).value;
            this.render();
            this.toast(`Transferred to ${r.ward}`);
          },
        });
      case 'troom':
        return this.modal({
          title: 'Transfer Room',
          sub: r.name,
          icon: 'icon-arrow-left-right',
          accent: 'ad-c-amber',
          confirm: 'Transfer',
          body: '<div class="grid grid-cols-2 gap-3">' + this.fld('Room', 't-room', '') + this.fld('Bed', 't-bed', '') + '</div>',
          onConfirm: () => {
            r.room = (this.byId('t-room') as HTMLInputElement).value || r.room;
            r.bed = (this.byId('t-bed') as HTMLInputElement).value || r.bed;
            this.render();
            this.toast('Room changed');
          },
        });
      case 'assign':
        return this.modal({
          title: 'Assign Doctor',
          sub: r.name,
          icon: 'icon-stethoscope',
          confirm: 'Assign',
          body: this.sel('Doctor', 'a-doc', this.DOCTORS, r.doctor),
          onConfirm: () => {
            r.doctor = (this.byId('a-doc') as HTMLSelectElement).value;
            this.render();
            this.toast(`${r.doctor} assigned`);
          },
        });
      case 'ins':
        return this.modal({
          title: 'Insurance Verification',
          sub: r.name,
          icon: 'icon-shield-check',
          accent: 'ad-c-emerald',
          confirm: 'Update',
          body: this.sel('Status', 'i-st', ['Verified', 'Pending', 'Uninsured'], r.ins),
          onConfirm: () => {
            r.ins = (this.byId('i-st') as HTMLSelectElement).value;
            this.render();
            this.toast(`Insurance ${r.ins.toLowerCase()}`);
          },
        });
      case 'upload':
        return this.modal({
          title: 'Upload Documents',
          sub: r.name,
          icon: 'icon-upload',
          accent: 'ad-c-violet',
          confirm: 'Upload',
          body:
            this.sel('Type', 'u-t', ['ID Proof', 'Insurance Card', 'Referral', 'Lab Report']) +
            '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.5rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-2xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop or click to browse</p><p class="text-[11px]">PDF, JPG up to 10MB</p></div>',
          onConfirm: () => this.toast('Document uploaded'),
        });
      case 'print':
        this.toast('Printing admission form…', 'info');
        return void setTimeout(() => window.print(), 400);
      case 'pdf':
        return void this.toast(`Generating PDF for ${r.name}…`, 'info');
      case 'sms':
        return this.modal({
          title: 'Send SMS',
          sub: r.name,
          icon: 'icon-message-circle',
          accent: 'ad-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 's-msg'),
          onConfirm: () => this.toast(`SMS sent to ${r.name}`),
        });
      case 'email':
        return this.modal({
          title: 'Send Email',
          sub: r.name,
          icon: 'icon-mail',
          accent: 'ad-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'e-sub', '') + this.area('Message', 'e-msg'),
          onConfirm: () => this.toast(`Email sent to ${r.name}`),
        });
      case 'discharge':
        return this.modal({
          title: 'Discharge Patient',
          sub: r.name,
          icon: 'icon-log-out',
          accent: 'ad-c-rose',
          confirm: 'Discharge',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Mark <strong>${this.esc(r.name)}</strong> as discharged?</p>` + this.area('Discharge summary', 'd-sum'),
          onConfirm: () => {
            r.status = 'Discharged';
            this.buildKPIs();
            this.render();
            this.toast(`${r.name} discharged`);
          },
        });
      case 'delete':
        return this.modal({
          title: 'Delete Admission',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'ad-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete admission <strong>${this.aid(r.id)}</strong> for ${this.esc(r.name)}?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => x.id !== id);
            delete this.state.sel[id];
            this.buildKPIs();
            this.render();
            this.toast('Admission deleted');
          },
        });
    }
  }

  /* ---------------- detail drawer ---------------- */

  private openDetail(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    const kv = (k: string, v: string) => `<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">${k}</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">${v}</span></div>`;
    const tl = (t: string, s: string, d: string) => `<div class="ad-tl-item"><span class="ad-tl-node"><i class="${d}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${t}</p><p class="text-[10px] text-gray-400">${s}</p></div>`;
    const body = this.byId('ad-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="ad-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="ad-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="ad-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="ad-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4">${this.avatar(r)}<div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-white/80">${this.aid(r.id)}</p><div class="mt-1.5">${this.statusBadge(r.status)}</div></div></div></div>` +
        `<div class="p-4 space-y-4"><div class="flex flex-wrap gap-1.5">${this.typeTag(r.type)}${this.insBadge(r.ins)}</div>` +
        `<div class="rounded-xl border border-border-color p-3">${kv('Admission ID', this.aid(r.id))}${kv('Department', this.esc(r.dept))}${kv('Assigned Doctor', this.esc(r.doctor))}${kv('Ward', this.esc(r.ward))}${kv('Room', this.esc(r.room))}${kv('Bed', this.esc(r.bed))}${kv('Admission Date', `${r.date} · ${r.time}`)}${kv('Insurance', this.esc(r.ins))}</div>` +
        `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">Admission Notes</p><p class="text-sm text-gray-600 dark:text-gray-300">${this.esc(r.notes) || 'No notes recorded for this admission.'}</p></div>` +
        `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">Timeline</p><div class="ad-tl ${this.acc(r.dept)}">${tl('Registered', `${r.date} · ${r.time}`, 'icon-user-plus')}${tl(`Doctor consultation · ${this.esc(r.doctor)}`, r.date, 'icon-stethoscope')}${tl(`Insurance ${this.esc(r.ins)}`, r.date, 'icon-shield-check')}${tl(`Bed assigned · ${this.esc(r.room)}-${this.esc(r.bed)}`, r.date, 'icon-bed')}${tl(`Admission ${this.esc(r.status)}`, r.date, 'icon-badge-check')}</div></div>` +
        `<div class="grid grid-cols-2 gap-2"><button class="ad-btn ad-btn-primary" data-da="edit" data-id="${id}"><i class="icon-edit"></i>Edit</button><button class="ad-btn ad-btn-success" data-da="bed" data-id="${id}"><i class="icon-bed"></i>Assign Bed</button><button class="ad-btn ad-btn-solid" data-da="sms" data-id="${id}"><i class="icon-message-circle"></i>SMS</button><button class="ad-btn ad-btn-solid" data-da="discharge" data-id="${id}"><i class="icon-log-out"></i>Discharge</button></div></div>`;
    }
    this.byId('ad-detail-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ---------------- bulk ---------------- */

  private bulk(a: string): void {
    const recs = this.selectedRecs();
    const n = recs.length;
    if (!n && a !== 'clear') {
      this.toast('No admissions selected', 'error');
      return;
    }
    switch (a) {
      case 'clear':
        this.state.sel = {};
        this.render();
        return;
      case 'export':
        return void this.toast(`Exported ${n} admissions`);
      case 'print':
        this.toast(`Printing ${n} admissions…`, 'info');
        return void setTimeout(() => window.print(), 400);
      case 'ward':
        return this.modal({
          title: 'Assign Ward',
          sub: `${n} admissions`,
          icon: 'icon-building-2',
          confirm: 'Apply',
          body: this.sel('Ward', 'bk-w', this.WARDS),
          onConfirm: () => {
            const v = (this.byId('bk-w') as HTMLSelectElement).value;
            recs.forEach((r) => (r.ward = v));
            this.render();
            this.toast(`${n} moved to ${v}`);
          },
        });
      case 'assign':
        return this.modal({
          title: 'Assign Doctor',
          sub: `${n} admissions`,
          icon: 'icon-stethoscope',
          confirm: 'Apply',
          body: this.sel('Doctor', 'bk-d', this.DOCTORS),
          onConfirm: () => {
            const v = (this.byId('bk-d') as HTMLSelectElement).value;
            recs.forEach((r) => (r.doctor = v));
            this.render();
            this.toast(`Assigned ${v} to ${n}`);
          },
        });
      case 'status':
        return this.modal({
          title: 'Update Status',
          sub: `${n} admissions`,
          icon: 'icon-activity',
          confirm: 'Apply',
          body: this.sel('Status', 'bk-s', ['Admitted', 'Pending', 'Reserved', 'Discharged']),
          onConfirm: () => {
            const v = (this.byId('bk-s') as HTMLSelectElement).value;
            recs.forEach((r) => (r.status = v));
            this.buildKPIs();
            this.render();
            this.toast(`${n} set to ${v}`);
          },
        });
      case 'delete':
        return this.modal({
          title: `Delete ${n} admissions`,
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'ad-c-rose',
          danger: true,
          confirm: `Delete ${n}`,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete ${n} selected admissions?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => !this.state.sel[x.id]);
            this.state.sel = {};
            this.buildKPIs();
            this.render();
            this.toast(`${n} admissions deleted`);
          },
        });
    }
  }

  /* ---------------- import / export modals ---------------- */

  private importModal(): void {
    this.modal({
      title: 'Import Admissions',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'ad-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div><div class="flex items-center gap-2 mt-3"><span class="ad-chip ad-c-emerald">CSV</span><span class="ad-chip ad-c-emerald">Excel</span><a href="#" class="ml-auto text-xs font-bold text-primary hover:underline" id="ad-tmpl">Download template</a></div><div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">18</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">2</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 18 admissions (2 warnings)'),
    });
    const tm = this.byId('ad-tmpl');
    if (tm)
      tm.onclick = (e: Event) => {
        e.preventDefault();
        this.toast('Template downloaded', 'info');
      };
  }

  private exportModal(): void {
    this.modal({
      title: 'Export Admissions',
      icon: 'icon-download',
      accent: 'ad-c-emerald',
      confirm: 'Export',
      body:
        '<label class="ad-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map((f, i) => `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="ad-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`)
          .join('') +
        '</div><label class="ad-lbl">Records</label><div class="space-y-2">' +
        ([
          ['all', 'All records'],
          ['filtered', 'Current filters'],
          ['selected', `Selected (${this.selN()})`],
        ] as [string, string][])
          .map((o, i) => `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="ad-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`)
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.document.querySelector('input[name="ad-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const s = (this.document.querySelector('input[name="ad-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
        if (f === 'Print') {
          this.toast('Opening print…', 'info');
          setTimeout(() => window.print(), 400);
        } else this.toast(`Exported ${s} as ${f}`);
      },
    });
  }

  /* ---------------- misc ---------------- */

  private clearFilters(): void {
    this.state.q = '';
    this.state.dept = '';
    this.state.status = '';
    this.state.adv = {};
    this.state.page = 1;
    const search = this.byId('ad-search') as HTMLInputElement | null;
    if (search) search.value = '';
    const fdept = this.byId('ad-f-dept') as HTMLSelectElement | null;
    if (fdept) fdept.value = '';
    const fstatus = this.byId('ad-f-status') as HTMLSelectElement | null;
    if (fstatus) fstatus.value = '';
    this.byId('ad-filter-badge')?.classList.add('hidden');
    this.render();
  }
}
