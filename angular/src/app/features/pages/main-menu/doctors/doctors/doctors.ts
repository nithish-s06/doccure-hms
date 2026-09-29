import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

interface DoctorRow {
  id: number;
  name: string;
  spec: string;
  dept: string;
  gender: string;
  exp: number;
  status: string;
  rating: number;
  patients: number;
  fee: number;
  ctype: string;
  qual: string;
  days: number[];
  phone: string;
  email: string;
  reviews: number;
}

@Component({
  imports: [RouterLink],
  selector: 'app-doctors',
  styleUrl: './doctors.css',
  templateUrl: './doctors.html',
})
export class Doctors implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly DEPT_ACC: Record<string, string> = { Cardiology: 'rose', Neurology: 'violet', Orthopedics: 'amber', Pediatrics: 'sky', 'General Medicine': 'teal', Dermatology: 'emerald', ENT: 'indigo', Oncology: 'blue' };
  private readonly STATUS_RING: Record<string, string> = { Available: '#10b981', Busy: '#d97706', 'On Leave': '#8b5cf6', 'Off Duty': '#64748b' };
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology', 'ENT', 'Oncology'];
  private readonly STATUSES = ['Available', 'Busy', 'On Leave', 'Off Duty'];
  private readonly DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly DOC_PHOTOS = Array.from({ length: 30 }, (_, i) => `avatar-${String(i + 1).padStart(2, '0')}.jpg`);

  private data: DoctorRow[] = [];
  private nextId = 1;
  private state = { view: 'grid' as 'grid' | 'list', q: '', dept: '', status: '', sort: 'name', page: 1, size: 12, adv: {} as Record<string, string>, sel: {} as Record<number, boolean> };
  private menu: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    const seed: [string, string, string, string, number, string, number, number, number, string, string, number[]][] = [
      ['Dr. Ethan Chen', 'Cardiologist', 'Cardiology', 'M', 18, 'Available', 4.9, 32, 800, 'In-person', 'MD, DM Cardiology', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. Priya Kumar', 'Neurologist', 'Neurology', 'F', 12, 'Busy', 4.7, 24, 900, 'Both', 'MD, DM Neurology', [1, 1, 1, 1, 1, 1, 0]],
      ['Dr. Marcus Mills', 'General Physician', 'General Medicine', 'M', 9, 'Available', 4.5, 40, 500, 'Both', 'MBBS, MD', [1, 1, 1, 1, 1, 1, 0]],
      ['Dr. Sofia Park', 'Pediatrician', 'Pediatrics', 'F', 14, 'Available', 4.8, 36, 600, 'In-person', 'MD Pediatrics', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. David Wang', 'Orthopedic Surgeon', 'Orthopedics', 'M', 20, 'On Leave', 4.6, 18, 1000, 'In-person', 'MS Orthopedics', [1, 1, 0, 1, 1, 0, 0]],
      ['Dr. Elena Rivas', 'Dermatologist', 'Dermatology', 'F', 7, 'Available', 4.4, 28, 700, 'Telemedicine', 'MD Dermatology', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. James Okoro', 'ENT Specialist', 'ENT', 'M', 11, 'Busy', 4.3, 22, 650, 'Both', 'MS ENT', [1, 0, 1, 1, 1, 1, 0]],
      ['Dr. Hannah Lee', 'Oncologist', 'Oncology', 'F', 16, 'Available', 4.9, 15, 1200, 'In-person', 'MD, DM Oncology', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. Robert Frost', 'Cardiologist', 'Cardiology', 'M', 22, 'Off Duty', 4.5, 0, 850, 'In-person', 'MD, DM Cardiology', [0, 0, 1, 1, 1, 0, 0]],
      ['Dr. Aisha Khan', 'Neurologist', 'Neurology', 'F', 8, 'Available', 4.6, 26, 800, 'Both', 'MD Neurology', [1, 1, 1, 1, 1, 1, 0]],
      ['Dr. Thomas Reed', 'Pediatrician', 'Pediatrics', 'M', 6, 'Busy', 4.2, 34, 550, 'In-person', 'MD Pediatrics', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. Grace Kim', 'Dermatologist', 'Dermatology', 'F', 10, 'Available', 4.7, 30, 750, 'Telemedicine', 'MD Dermatology', [1, 1, 1, 1, 1, 0, 0]],
      ['Dr. Samuel Ali', 'Orthopedic Surgeon', 'Orthopedics', 'M', 15, 'Available', 4.5, 20, 950, 'Both', 'MS Orthopedics', [1, 1, 1, 0, 1, 1, 0]],
      ['Dr. Nina Patel', 'General Physician', 'General Medicine', 'F', 5, 'On Leave', 4.3, 0, 450, 'Both', 'MBBS', [1, 1, 1, 1, 1, 0, 0]],
    ];
    this.data = seed.map((a, i) => ({
      id: i + 1,
      name: a[0] as string,
      spec: a[1] as string,
      dept: a[2] as string,
      gender: a[3] === 'M' ? 'Male' : 'Female',
      exp: a[4] as number,
      status: a[5] as string,
      rating: a[6] as number,
      patients: a[7] as number,
      fee: a[8] as number,
      ctype: a[9] as string,
      qual: a[10] as string,
      days: a[11] as number[],
      phone: '+91 98' + (100000 + i * 137),
      email: (a[0] as string).toLowerCase().replace('dr. ', '').replace(' ', '.') + '@dreamshms.com',
      reviews: 40 + i * 13,
    }));
    this.nextId = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    this.wireEvents();
    setTimeout(() => {
      const sk = this.byId('dr-skeleton');
      const ct = this.byId('dr-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'dr-fadein .4s ease';
      }
      this.initRings(this.byId('dr-kpis'));
      this.initRings(this.byId('dr-page'));
    }, 1500);
    this.render();
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
  private toast(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, type);
  }

  private acc(d: string): string {
    return 'dr-c-' + (this.DEPT_ACC[d] || 'primary');
  }
  private did(n: number): string {
    return 'DR-' + String(n).padStart(4, '0');
  }
  private detailUrl(r: DoctorRow): string {
    return 'doctor-profile.html?' + new URLSearchParams({ id: String(r.id), name: r.name, spec: r.spec, dept: r.dept, status: r.status }).toString();
  }
  private photoUrl(id: number): string {
    return 'assets/img/avatar/' + this.DOC_PHOTOS[(id - 1) % this.DOC_PHOTOS.length];
  }
  private money(n: number): string {
    return '₹' + Number(n).toLocaleString('en-IN');
  }
  private stars(n: number): string {
    const f = Math.round(n);
    let h = '';
    for (let i = 1; i <= 5; i++) h += `<i class="icon-star${i <= f ? '' : ' off'}"></i>`;
    return `<span class="dr-stars">${h}</span>`;
  }
  private selN(): number {
    return Object.keys(this.state.sel).length;
  }
  private statusBadge(s: string): string {
    const c: Record<string, string> = { Available: 'available', Busy: 'busy', 'On Leave': 'leave', 'Off Duty': 'offduty' };
    return `<span class="dr-badge ${c[s] || 'available'}">${this.esc(s)}</span>`;
  }

  private filtered(): DoctorRow[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    let rows = this.data.filter((r) => {
      if (q && (r.name + ' ' + r.spec + ' ' + r.dept + ' ' + this.did(r.id)).toLowerCase().indexOf(q) === -1) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['spec'] && r.spec.toLowerCase().indexOf(a['spec'].toLowerCase()) === -1) return false;
      if (a['exp']) {
        const lo = ({ '0-5 yrs': [0, 5], '5-10 yrs': [5, 10], '10-20 yrs': [10, 20], '20+ yrs': [20, 99] } as Record<string, [number, number]>)[a['exp']];
        if (lo && (r.exp < lo[0] || r.exp > lo[1])) return false;
      }
      if (a['rating']) {
        const m = parseFloat(a['rating']);
        if (r.rating < m) return false;
      }
      if (a['type'] && a['type'] !== 'Both' && r.ctype !== a['type'] && r.ctype !== 'Both') return false;
      if (a['gender'] && r.gender !== a['gender']) return false;
      return true;
    });
    rows = rows.slice().sort((x, y) => {
      switch (this.state.sort) {
        case 'name':
          return x.name.localeCompare(y.name);
        case 'rating':
          return y.rating - x.rating;
        case 'exp':
          return y.exp - x.exp;
        case 'patients':
          return y.patients - x.patients;
        case 'dept':
          return x.dept.localeCompare(y.dept);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: DoctorRow): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="dr-card ${this.acc(r.dept)}${sel}" data-id="${r.id}">` +
      `<div class="dr-cardtop"><input type="checkbox" class="dr-check dr-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''} style="position:absolute;top:.6rem;left:.6rem;z-index:2"><button class="dr-mini dr-menu-btn" data-id="${r.id}" style="position:absolute;top:.5rem;right:.5rem;z-index:2;background:rgba(255,255,255,.2);border-color:rgba(255,255,255,.3);color:#fff"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="px-4 pb-4 -mt-7"><div class="flex items-end justify-between"><span class="dr-ava dr-ava-photo" style="--dr-ring:${this.STATUS_RING[r.status] || '#10b981'}"><img src="${this.photoUrl(r.id)}" alt="${this.esc(r.name)}" loading="lazy"></span><span class="mb-1">${this.statusBadge(r.status)}</span></div>` +
      `<p class="mt-2 font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[12px] text-primary font-semibold">${this.esc(r.spec)}</p>` +
      `<div class="flex items-center justify-between mt-1.5"><div class="flex items-center gap-1.5">${this.stars(r.rating)}<span class="text-[11px] text-gray-400">${r.rating.toFixed(1)} (${r.reviews})</span></div><span class="dr-metarow"><i class="icon-building-2 text-xs"></i>${this.esc(r.dept)}</span></div>` +
      `<div class="grid grid-cols-3 gap-1.5 mt-3"><div class="dr-statbox"><b>${r.exp}y</b><span>Experience</span></div><div class="dr-statbox"><b>${r.patients}</b><span>Today</span></div><div class="dr-statbox"><b>${this.money(r.fee)}</b><span>Fee</span></div></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3"><span class="dr-tag ${this.acc(r.dept)}"><i class="icon-graduation-cap text-[10px]"></i>${this.esc(r.qual)}</span><span class="dr-tag dr-c-sky"><i class="icon-${r.ctype === 'Telemedicine' ? 'video' : r.ctype === 'Both' ? 'monitor-smartphone' : 'user'} text-[10px]"></i>${this.esc(r.ctype)}</span></div>` +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color"><a href="${this.detailUrl(r)}" class="text-[11px] font-mono text-gray-400 hover:text-primary hover:underline">${this.did(r.id)}</a>` +
      `<div class="flex gap-1.5"><button class="dr-mini dr-view" data-id="${r.id}" title="Profile"><i class="icon-eye text-sm"></i></button><button class="dr-mini dr-book" data-id="${r.id}" title="Book"><i class="icon-calendar-plus text-sm"></i></button><button class="dr-mini dr-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div></div>` +
      `</article>`
    );
  }

  private rowHTML(r: DoctorRow): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<tr class="${sel} ${this.acc(r.dept)}" data-id="${r.id}"><td><input type="checkbox" class="dr-check dr-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}></td>` +
      `<td data-col="name"><div class="flex items-center gap-2.5"><span class="dr-ava-sm dr-ava-sm-photo"><img src="${this.photoUrl(r.id)}" alt="${this.esc(r.name)}" loading="lazy"></span><div class="min-w-0"><span class="font-bold text-gray-900 dark:text-white block leading-tight">${this.esc(r.name)}</span><a href="${this.detailUrl(r)}" class="text-[11px] font-mono text-gray-400 hover:text-primary hover:underline">${this.did(r.id)}</a></div></div></td>` +
      `<td data-col="spec">${this.esc(r.spec)}</td><td data-col="dept">${this.esc(r.dept)}</td>` +
      `<td data-col="exp" class="text-gray-500">${r.exp} yrs</td><td data-col="patients">${r.patients}</td>` +
      `<td data-col="rating"><div class="flex items-center gap-1">${this.stars(r.rating)}<span class="text-[11px] text-gray-400">${r.rating.toFixed(1)}</span></div></td>` +
      `<td data-col="fee" class="font-semibold text-gray-900 dark:text-white">${this.money(r.fee)}</td>` +
      `<td data-col="status">${this.statusBadge(r.status)}</td>` +
      `<td class="text-right"><div class="inline-flex gap-1.5"><button class="dr-mini dr-view" data-id="${r.id}"><i class="icon-eye text-sm"></i></button><button class="dr-mini dr-edit" data-id="${r.id}"><i class="icon-edit text-sm"></i></button><button class="dr-mini dr-menu-btn" data-id="${r.id}"><i class="icon-ellipsis-vertical text-sm"></i></button></div></td></tr>`
    );
  }

  private render(): void {
    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);
    const grid = this.byId('dr-gridview');
    const tbody = this.byId('dr-tbody');
    const listView = this.byId('dr-listview');
    const empty = this.byId('dr-empty');
    const pager = this.byId('dr-pager');

    const countEl = this.byId('dr-count');
    if (countEl) countEl.textContent = total + ' of ' + this.data.length + ' doctors';
    empty?.classList.toggle('hidden', total !== 0);
    pager?.classList.toggle('hidden', total === 0);
    if (this.state.view === 'grid') {
      grid?.classList.remove('hidden');
      listView?.classList.add('hidden');
      if (grid) grid.innerHTML = pageRows.map((r) => this.cardHTML(r)).join('');
    } else {
      grid?.classList.add('hidden');
      listView?.classList.remove('hidden');
      if (tbody) tbody.innerHTML = pageRows.map((r) => this.rowHTML(r)).join('');
    }
    const pageInfo = this.byId('dr-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No doctors';
    this.pageNav(pages);
    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa = this.byId('dr-select-all') as HTMLInputElement | null;
    if (sa) sa.checked = !!allSel;
    const s2 = this.byId('dr-select-all-2') as HTMLInputElement | null;
    if (s2) s2.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="dr-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="dr-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="dr-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const el = this.byId('dr-page-nav');
    if (el) el.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    if (!scope) return;
    requestAnimationFrame(() => {
      this.qsa('.dr-ring[data-p]', scope).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || '0')))));
      });
    });
  }

  private buildKPIs(): void {
    const by = (f: (r: DoctorRow) => boolean) => this.data.filter(f).length;
    const totalPat = this.data.reduce((s, r) => s + r.patients, 0);
    const avgR = this.data.reduce((s, r) => s + r.rating, 0) / this.data.length;
    const availPct = Math.round((by((r) => r.status === 'Available') / this.data.length) * 100);
    const k: [string, number | string, string, string, number, string][] = [
      ['Total Doctors', this.data.length, 'primary', 'icon-stethoscope', 82, 'Staff'],
      ['Available Now', by((r) => r.status === 'Available'), 'emerald', 'icon-circle-check', availPct, 'On duty'],
      ['Departments', this.DEPTS.filter((d) => this.data.some((r) => r.dept === d)).length, 'violet', 'icon-building-2', 60, 'Active'],
      ['Patients Today', totalPat, 'amber', 'icon-users', 74, 'Seen'],
      ['Avg Rating', avgR.toFixed(1), 'teal', 'icon-star', Math.round((avgR / 5) * 100), 'of 5'],
      ['On Leave', by((r) => r.status === 'On Leave' || r.status === 'Off Duty'), 'rose', 'icon-calendar-x', 25, 'Away'],
    ];
    const spark = '1,14 9,11 17,13 25,7 33,9 41,4 53,2';
    const kpisEl = this.byId('dr-kpis');
    if (kpisEl) {
      kpisEl.innerHTML = k
        .map(
          (c) =>
            `<div class="dr-stat dr-c-${c[2]}"><div class="flex items-start justify-between"><span class="dr-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="dr-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="dr-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--dr-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
      this.initRings(kpisEl);
    }
    this.initRings(this.byId('dr-page'));

    const totalBadge = this.byId('dr-total-badge');
    if (totalBadge) totalBadge.textContent = String(this.data.length);
    const availBadge = this.byId('dr-avail-badge');
    if (availBadge) availBadge.textContent = String(by((r) => r.status === 'Available'));
    const patientsBadge = this.byId('dr-patients-badge');
    if (patientsBadge) patientsBadge.textContent = String(totalPat);
    const ratingBadge = this.byId('dr-rating-badge');
    if (ratingBadge) ratingBadge.textContent = avgR.toFixed(1);
  }

  private updateBulk(): void {
    const n = this.selN();
    const el = this.byId('dr-bulk-count');
    if (el) el.textContent = String(n);
    const bar = this.byId('dr-bulkbar');
    if (bar) (bar as any).hidden = n === 0;
  }
  private selectedRecs(): DoctorRow[] {
    return this.data.filter((r) => this.state.sel[r.id]);
  }

  /* ---- action menu ---- */
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
      '<div class="dr-menu"><p class="dr-menu-lbl">Doctor</p>' +
      I('icon-eye', 'View Profile', 'view') +
      I('icon-edit', 'Edit', 'edit') +
      I('icon-calendar-plus', 'Book Appointment', 'book') +
      I('icon-calendar-clock', 'Manage Schedule', 'sched') +
      '<div class="dr-menu-sep"></div><p class="dr-menu-lbl">Status</p>' +
      I('icon-circle-check', 'Set Available', 'avail') +
      I('icon-coffee', 'Set Busy', 'setbusy') +
      I('icon-calendar-x', 'Mark On Leave', 'leave') +
      '<div class="dr-menu-sep"></div><p class="dr-menu-lbl">Contact</p>' +
      I('icon-message-circle', 'Send Message', 'message') +
      I('icon-mail', 'Email', 'email') +
      I('icon-phone', 'Call', 'call') +
      '<div class="dr-menu-sep"></div>' +
      I('icon-printer', 'Print Profile', 'print') +
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
    this.menu.style.left = left + 'px';
    this.menu.style.top = top + 'px';
    this.menu.addEventListener('click', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-a]') as HTMLElement | null;
      if (!t) return;
      this.rowAction(t.getAttribute('data-a')!, +t.getAttribute('data-id')!);
      this.closeMenu();
    });
  }

  /* ---- modal engine ---- */
  private modal(o: {
    title: string;
    sub?: string;
    icon?: string;
    accent?: string;
    body?: string;
    confirm?: string;
    danger?: boolean;
    hideConfirm?: boolean;
    onConfirm?: () => void | boolean;
    after?: () => void;
  }): void {
    const titleEl = this.byId('dr-modal-title');
    if (titleEl) titleEl.textContent = o.title;
    const subEl = this.byId('dr-modal-sub');
    if (subEl) subEl.textContent = o.sub || '';
    const icoEl = this.byId('dr-modal-ico');
    if (icoEl) {
      icoEl.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      icoEl.className = 'dr-doc-ico ' + (o.accent || 'dr-c-primary');
    }
    const bodyEl = this.byId('dr-modal-body');
    if (bodyEl) bodyEl.innerHTML = o.body || '';
    const c = this.byId('dr-modal-confirm') as HTMLButtonElement | null;
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = 'dr-btn ' + (o.danger ? 'dr-btn-danger' : 'dr-btn-primary');
      c.style.display = o.hideConfirm ? 'none' : '';
      c.onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('dr-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    if (o.after) o.after();
  }
  private closeModal(): void {
    this.byId('dr-modal')?.classList.remove('open');
    if (!this.qsa('.dr-drawer.open').length) this.document.body.style.overflow = '';
  }
  private fld(l: string, id: string, v?: string | number, ph?: string): string {
    return `<div><label class="dr-lbl">${l}</label><input id="${id}" class="dr-in" value="${this.esc(v ?? '')}" placeholder="${this.esc(ph ?? '')}"></div>`;
  }
  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="dr-lbl">${l}</label><select id="${id}" class="dr-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }
  private area(l: string, id: string, v?: string): string {
    return `<div><label class="dr-lbl">${l}</label><textarea id="${id}" class="dr-in" rows="2" style="resize:vertical">${this.esc(v ?? '')}</textarea></div>`;
  }
  private docForm(r: Partial<DoctorRow>): string {
    return (
      `<div class="grid grid-cols-2 gap-3">${this.fld('Full Name', 'm-name', r.name, 'e.g. Dr. Jane Doe')}${this.fld('Specialty', 'm-spec', r.spec, 'e.g. Cardiologist')}${this.sel('Department', 'm-dept', this.DEPTS, r.dept)}${this.sel('Gender', 'm-gender', ['Male', 'Female'], r.gender)}${this.fld('Experience (yrs)', 'm-exp', r.exp, 'e.g. 12')}${this.fld('Qualification', 'm-qual', r.qual, 'e.g. MD, DM')}${this.fld('Consultation Fee', 'm-fee', r.fee, 'e.g. 800')}${this.sel('Consultation Type', 'm-ctype', ['In-person', 'Telemedicine', 'Both'], r.ctype)}${this.sel('Status', 'm-status', this.STATUSES, r.status)}${this.fld('Phone', 'm-phone', r.phone, '+91 …')}</div>` +
      this.fld('Email', 'm-email', r.email, 'name@dreamshms.com')
    );
  }
  private readForm(): Partial<DoctorRow> {
    return {
      name: (this.byId('m-name') as HTMLInputElement).value.trim(),
      spec: (this.byId('m-spec') as HTMLInputElement).value || 'General Physician',
      dept: (this.byId('m-dept') as HTMLSelectElement).value,
      gender: (this.byId('m-gender') as HTMLSelectElement).value,
      exp: +(this.byId('m-exp') as HTMLInputElement).value || 0,
      qual: (this.byId('m-qual') as HTMLInputElement).value || 'MBBS',
      fee: +(this.byId('m-fee') as HTMLInputElement).value || 500,
      ctype: (this.byId('m-ctype') as HTMLSelectElement).value,
      status: (this.byId('m-status') as HTMLSelectElement).value,
      phone: (this.byId('m-phone') as HTMLInputElement).value,
      email: (this.byId('m-email') as HTMLInputElement).value,
      rating: 4.5,
      patients: 0,
      reviews: 0,
      days: [1, 1, 1, 1, 1, 0, 0],
    };
  }

  private openForm(kind: string): void {
    if (kind === 'schedule') {
      this.modal({
        title: 'Manage Schedule',
        icon: 'icon-calendar-clock',
        accent: 'dr-c-primary',
        sub: 'Weekly availability template',
        confirm: 'Save Schedule',
        body:
          this.sel('Doctor', 'sc-doc', this.data.map((r) => r.name)) +
          '<label class="dr-lbl mt-2">Working Days</label><div class="dr-week">' +
          this.DAYS.map((d) => `<button type="button" class="dr-day on" data-day="${d}"><div class="d">${d}</div><i class="icon-check text-emerald-500"></i></button>`).join('') +
          `</div><div class="grid grid-cols-2 gap-3 mt-3">${this.fld('From', 'sc-from', '09:00 AM')}${this.fld('To', 'sc-to', '05:00 PM')}</div>`,
        after: () => {
          const wk = this.qs('.dr-week');
          wk?.addEventListener('click', (e: Event) => {
            const d = (e.target as HTMLElement).closest('[data-day]');
            d?.classList.toggle('on');
          });
        },
        onConfirm: () => {
          this.toast('Schedule updated for ' + (this.byId('sc-doc') as HTMLSelectElement).value);
        },
      });
      return;
    }
    if (kind === 'dept') {
      const deptAgg: Record<string, number> = {};
      this.data.forEach((r) => (deptAgg[r.dept] = (deptAgg[r.dept] || 0) + 1));
      this.modal({
        title: 'Departments',
        icon: 'icon-building-2',
        accent: 'dr-c-violet',
        sub: this.DEPTS.length + ' departments',
        hideConfirm: true,
        confirm: 'Close',
        body:
          '<div class="space-y-2">' +
          this.DEPTS.map(
            (d) =>
              `<div class="dr-recent ${this.acc(d)}" style="border:1px solid var(--color-border-color)"><span class="dr-doc-ico" style="width:2.2rem;height:2.2rem"><i class="icon-building-2"></i></span><div class="flex-1"><p class="text-sm font-bold text-gray-900 dark:text-white">${d}</p><p class="text-[10px] text-gray-400">${deptAgg[d] || 0} doctors</p></div><button class="dr-tag ${this.acc(d)}" data-dept-filter="${d}">View</button></div>`
          ).join('') +
          '</div>',
      });
      return;
    }
    this.modal({
      title: 'Add Doctor',
      icon: 'icon-user-plus',
      accent: 'dr-c-success',
      sub: 'Onboard a new doctor',
      confirm: 'Add Doctor',
      body: this.docForm({ status: 'Available', ctype: 'Both', dept: 'Cardiology', gender: 'Male' }),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Doctor name is required', 'error');
          return false;
        }
        if (f.name.indexOf('Dr.') !== 0) f.name = 'Dr. ' + f.name;
        (f as DoctorRow).id = this.nextId++;
        this.data.unshift(f as DoctorRow);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(f.name + ' added');
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
          title: 'Edit Doctor',
          sub: this.did(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.docForm(r),
          onConfirm: () => {
            const f = this.readForm();
            f.rating = r.rating;
            f.patients = r.patients;
            f.reviews = r.reviews;
            f.days = r.days;
            Object.assign(r, f);
            this.buildKPIs();
            this.render();
            this.toast('Doctor updated');
          },
        });
        return;
      case 'book':
        this.modal({
          title: 'Book Appointment',
          sub: r.name,
          icon: 'icon-calendar-plus',
          accent: 'dr-c-sky',
          confirm: 'Book',
          body:
            this.fld('Patient', 'bk-p', '', 'Patient name') +
            '<div class="grid grid-cols-2 gap-3"><div><label class="dr-lbl">Date</label><input type="text" placeholder="dd-mm-yyyy" id="bk-d" class="dr-in" data-provider="flatpickr" data-date-format="d-m-Y"></div>' +
            this.sel('Time', 'bk-t', ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']) +
            '</div>',
          onConfirm: () => this.toast('Appointment booked with ' + r.name),
        });
        return;
      case 'sched':
        this.openForm('schedule');
        return;
      case 'avail':
        r.status = 'Available';
        this.buildKPIs();
        this.render();
        this.toast(r.name + ' set Available');
        return;
      case 'setbusy':
        r.status = 'Busy';
        this.buildKPIs();
        this.render();
        this.toast(r.name + ' set Busy');
        return;
      case 'leave':
        r.status = 'On Leave';
        this.buildKPIs();
        this.render();
        this.toast(r.name + ' marked On Leave');
        return;
      case 'message':
        this.modal({ title: 'Send Message', sub: r.name, icon: 'icon-message-circle', accent: 'dr-c-emerald', confirm: 'Send', body: this.area('Message', 'ms-msg'), onConfirm: () => this.toast('Message sent to ' + r.name) });
        return;
      case 'email':
        this.modal({ title: 'Send Email', sub: r.email, icon: 'icon-mail', accent: 'dr-c-primary', confirm: 'Send', body: this.fld('Subject', 'em-s', '') + this.area('Message', 'em-m'), onConfirm: () => this.toast('Email sent to ' + r.name) });
        return;
      case 'call':
        this.toast('Calling ' + r.name + ' · ' + r.phone, 'info');
        return;
      case 'print':
        this.toast('Printing profile…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'delete':
        this.modal({
          title: 'Delete Doctor',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'dr-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Remove <strong>${this.esc(r.name)}</strong> from the roster?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => x.id !== id);
            delete this.state.sel[id];
            this.buildKPIs();
            this.render();
            this.toast('Doctor removed');
          },
        });
        return;
    }
  }

  /* ---- profile drawer ---- */
  private openDetail(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    const kv = (k: string, v: string) => `<div class="flex items-center justify-between py-2 border-b border-border-color" style="border-bottom-style:dashed"><span class="text-xs text-gray-500 dark:text-gray-400">${k}</span><span class="text-xs font-bold text-gray-900 dark:text-white text-right">${v}</span></div>`;
    const sec = (t: string, inner: string) => `<div><p class="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">${t}</p>${inner}</div>`;
    const stat = (v: string | number, l: string, ac: string) => `<div class="rounded-xl border border-border-color p-2.5 text-center dr-c-${ac}"><p class="text-lg font-extrabold text-gray-900 dark:text-white">${v}</p><p class="text-[10px] text-gray-500">${l}</p></div>`;
    const week = `<div class="dr-week ${this.acc(r.dept)}">${this.DAYS.map((d, i) => `<div class="dr-day${r.days[i] ? ' on' : ''}"><div class="d">${d}</div>${r.days[i] ? '<i class="icon-check" style="color:var(--dr-c)"></i>' : '<i class="icon-x text-gray-300"></i>'}</div>`).join('')}</div>`;
    const body = this.byId('dr-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="dr-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="dr-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4"><span class="dr-ava dr-ava-photo" style="width:4rem;height:4rem;--dr-ring:${this.STATUS_RING[r.status] || '#10b981'}"><img src="${this.photoUrl(r.id)}" alt="${this.esc(r.name)}"></span><div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[12px] text-white/80">${this.esc(r.spec)}</p><div class="mt-1 flex items-center gap-1.5"><span class="dr-stars" style="color:#fde68a">${this.stars(r.rating).replace('class="dr-stars"', 'class=""')}</span><span class="text-[11px] text-white/80">${r.rating.toFixed(1)} (${r.reviews})</span></div></div></div>` +
        `<div class="relative mt-3">${this.statusBadge(r.status)}</div></div>` +
        `<div class="p-4 space-y-4"><div class="grid grid-cols-3 gap-2">${stat(r.exp + 'y', 'Experience', 'primary')}${stat(r.patients, 'Patients', 'emerald')}${stat(this.money(r.fee), 'Fee', 'amber')}</div>` +
        sec('Professional Info', `<div class="rounded-xl border border-border-color p-3">${kv('Department', this.esc(r.dept))}${kv('Qualification', this.esc(r.qual))}${kv('Consultation', this.esc(r.ctype))}${kv('Gender', this.esc(r.gender))}${kv('Doctor ID', this.did(r.id))}</div>`) +
        sec('Contact', `<div class="rounded-xl border border-border-color p-3">${kv('Phone', this.esc(r.phone))}${kv('Email', this.esc(r.email))}</div>`) +
        sec('Weekly Availability', week) +
        sec(
          'Performance',
          '<div class="space-y-2">' +
            ([
              ['Patient Satisfaction', Math.round((r.rating / 5) * 100)],
              ['Appointment Adherence', 92],
              ['Response Time', 88],
            ] as [string, number][])
              .map((p) => `<div class="${this.acc(r.dept)}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${p[0]}</span><b class="text-gray-900 dark:text-white">${p[1]}%</b></div><div class="dr-bar"><i style="width:${p[1]}%"></i></div></div>`)
              .join('') +
            '</div>'
        ) +
        `<div class="grid grid-cols-2 gap-2"><button class="dr-btn dr-btn-primary" data-da="book" data-id="${id}"><i class="icon-calendar-plus"></i>Book</button><button class="dr-btn dr-btn-success" data-da="sched" data-id="${id}"><i class="icon-calendar-clock"></i>Schedule</button><button class="dr-btn dr-btn-solid" data-da="message" data-id="${id}"><i class="icon-message-circle"></i>Message</button><button class="dr-btn dr-btn-solid" data-da="call" data-id="${id}"><i class="icon-phone"></i>Call</button></div></div>`;
    }
    this.byId('dr-detail-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  /* ---- bulk ---- */
  private bulk(a: string): void {
    const recs = this.selectedRecs();
    const n = recs.length;
    if (!n && a !== 'clear') {
      this.toast('No doctors selected', 'error');
      return;
    }
    switch (a) {
      case 'clear':
        this.state.sel = {};
        this.render();
        return;
      case 'status':
        this.modal({
          title: 'Update Status',
          sub: n + ' doctors',
          icon: 'icon-activity',
          confirm: 'Apply',
          body: this.sel('Status', 'bk-s', this.STATUSES),
          onConfirm: () => {
            const v = (this.byId('bk-s') as HTMLSelectElement).value;
            recs.forEach((r) => (r.status = v));
            this.buildKPIs();
            this.render();
            this.toast(n + ' set to ' + v);
          },
        });
        return;
      case 'dept':
        this.modal({
          title: 'Reassign Department',
          sub: n + ' doctors',
          icon: 'icon-building-2',
          accent: 'dr-c-violet',
          confirm: 'Apply',
          body: this.sel('Department', 'bk-d', this.DEPTS),
          onConfirm: () => {
            const v = (this.byId('bk-d') as HTMLSelectElement).value;
            recs.forEach((r) => (r.dept = v));
            this.buildKPIs();
            this.render();
            this.toast(n + ' moved to ' + v);
          },
        });
        return;
      case 'message':
        this.modal({ title: 'Message ' + n + ' doctors', icon: 'icon-message-circle', accent: 'dr-c-emerald', confirm: 'Send', body: this.area('Message', 'bk-m'), onConfirm: () => this.toast('Message sent to ' + n + ' doctors') });
        return;
      case 'export':
        this.toast('Exported ' + n + ' doctors');
        return;
      case 'print':
        this.toast('Printing ' + n + ' profiles…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'delete':
        this.modal({
          title: 'Delete ' + n + ' doctors',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'dr-c-rose',
          danger: true,
          confirm: 'Delete ' + n,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Remove ${n} selected doctors?</p>`,
          onConfirm: () => {
            this.data = this.data.filter((x) => !this.state.sel[x.id]);
            this.state.sel = {};
            this.buildKPIs();
            this.render();
            this.toast(n + ' doctors removed');
          },
        });
        return;
    }
  }

  private importModal(): void {
    this.modal({
      title: 'Import Doctors',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'dr-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div><div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">12</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">1</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 12 doctors (1 warning)'),
    });
  }

  private exportModal(): void {
    this.modal({
      title: 'Export Doctors',
      icon: 'icon-download',
      accent: 'dr-c-emerald',
      confirm: 'Export',
      body:
        '<label class="dr-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map((f, i) => `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="dr-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`)
          .join('') +
        '</div><label class="dr-lbl">Records</label><div class="space-y-2">' +
        ([
          ['all', 'All doctors'],
          ['available', 'Available only'],
          ['filtered', 'Current filters'],
          ['selected', 'Selected (' + this.selN() + ')'],
        ] as [string, string][])
          .map((o, i) => `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="dr-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`)
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.document.querySelector('input[name="dr-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const s = (this.document.querySelector('input[name="dr-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
        if (f === 'Print') {
          this.toast('Opening print…', 'info');
          setTimeout(() => window.print(), 400);
        } else this.toast('Exported ' + s + ' as ' + f);
      },
    });
  }

  private on(id: string, ev: string, fn: (e: Event) => void): void {
    this.byId(id)?.addEventListener(ev, fn);
  }

  private clearFilters(): void {
    this.state.q = '';
    this.state.dept = '';
    this.state.status = '';
    this.state.adv = {};
    this.state.page = 1;
    (this.byId('dr-search') as HTMLInputElement).value = '';
    (this.byId('dr-f-dept') as HTMLSelectElement).value = '';
    (this.byId('dr-f-status') as HTMLSelectElement).value = '';
    this.byId('dr-filter-badge')?.classList.add('hidden');
    this.render();
  }

  private wireEvents(): void {
    this.on('dr-search', 'input', (e) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dr-f-dept', 'change', (e) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dr-f-status', 'change', (e) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dr-sort', 'change', (e) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    this.on('dr-view-grid', 'click', () => {
      this.state.view = 'grid';
      this.byId('dr-view-grid')?.classList.add('is-active');
      this.byId('dr-view-list')?.classList.remove('is-active');
      this.render();
    });
    this.on('dr-view-list', 'click', () => {
      this.state.view = 'list';
      this.byId('dr-view-list')?.classList.add('is-active');
      this.byId('dr-view-grid')?.classList.remove('is-active');
      this.render();
    });
    this.on('dr-import', 'click', () => this.importModal());
    this.on('dr-export', 'click', () => this.exportModal());
    this.on('dr-filters', 'click', () => {
      this.byId('dr-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.on('dr-size', 'change', (e) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('dr-jump', 'change', (e) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    this.on('dr-empty-clear', 'click', () => this.clearFilters());

    this.byId('dr-page-nav')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-pg]') as HTMLElement | null;
      if (!b) return;
      const v = b.getAttribute('data-pg');
      if (v === 'prev') this.state.page--;
      else if (v === 'next') this.state.page++;
      else this.state.page = +v!;
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
    this.on('dr-select-all', 'change', selectAll);
    this.on('dr-select-all-2', 'change', selectAll);

    const delegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.dr-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +mb.getAttribute('data-id')!);
        return;
      }
      const bk = target.closest('.dr-book') as HTMLElement | null;
      if (bk) {
        e.stopPropagation();
        this.rowAction('book', +bk.getAttribute('data-id')!);
        return;
      }
      const v = target.closest('.dr-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+v.getAttribute('data-id')!);
        return;
      }
      const ed = target.closest('.dr-edit') as HTMLElement | null;
      if (ed) {
        this.rowAction('edit', +ed.getAttribute('data-id')!);
        return;
      }
      const ch = target.closest('.dr-rowcheck') as HTMLInputElement | null;
      if (ch) {
        e.stopPropagation();
        if (ch.checked) this.state.sel[+ch.getAttribute('data-id')!] = true;
        else delete this.state.sel[+ch.getAttribute('data-id')!];
        this.render();
        return;
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.dr-card[data-id]') as HTMLElement | null;
      if (card) {
        this.openDetail(+card.getAttribute('data-id')!);
        return;
      }
      const row = target.closest('tr[data-id]') as HTMLElement | null;
      if (row) {
        this.openDetail(+row.getAttribute('data-id')!);
        return;
      }
    };
    this.byId('dr-gridview')?.addEventListener('click', delegate);
    this.byId('dr-listview')?.addEventListener('click', delegate);

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        const k = op.getAttribute('data-open');
        if (k === 'new') return this.openForm('new');
        if (k === 'schedule') return this.openForm('schedule');
        if (k === 'dept') return this.openForm('dept');
        if (k === 'export') return this.exportModal();
      }
      const df = target.closest('[data-dept-filter]') as HTMLElement | null;
      if (df) {
        this.closeModal();
        this.state.dept = df.getAttribute('data-dept-filter')!;
        (this.byId('dr-f-dept') as HTMLSelectElement).value = this.state.dept;
        this.state.page = 1;
        this.render();
        this.toast('Filtered by ' + this.state.dept, 'info');
        return;
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa('.dr-drawer.open').forEach((dr) => dr.classList.remove('open'));
        if (!this.qsa('.dr-drawer.open').length && !this.byId('dr-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('dr-detail-drawer')?.classList.remove('open');
        if (!this.qsa('.dr-drawer.open').length && !this.byId('dr-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da')!, +da.getAttribute('data-id')!);
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.dr-menu-btn')) this.closeMenu();
    });
    this.byId('dr-modal')?.addEventListener('mousedown', (e: Event) => {
      const modal = this.byId('dr-modal');
      if (e.target === modal || (e.target as HTMLElement).classList.contains('dr-modal-back')) this.closeModal();
    });
    this.byId('dr-bulkbar')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-bulk]') as HTMLElement | null;
      if (b) this.bulk(b.getAttribute('data-bulk')!);
    });
    window.addEventListener('resize', () => this.closeMenu());
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.closeModal();
        this.qsa('.dr-drawer.open').forEach((dr) => dr.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });

    this.on('fd-apply', 'click', () => {
      this.state.adv = {
        spec: (this.byId('fd-spec') as HTMLInputElement).value,
        exp: (this.byId('fd-exp') as HTMLSelectElement).value,
        rating: (this.byId('fd-rating') as HTMLSelectElement).value,
        type: (this.byId('fd-type') as HTMLSelectElement).value,
        gender: (this.byId('fd-gender') as HTMLSelectElement).value,
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('dr-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('dr-filter-drawer')?.classList.remove('open');
      if (!this.qsa('.dr-drawer.open').length && !this.byId('dr-modal')?.classList.contains('open')) this.document.body.style.overflow = '';
      this.render();
      this.toast(n + ' filter' + (n !== 1 ? 's' : '') + ' applied');
    });
    this.on('fd-reset', 'click', () => {
      this.qsa('#dr-filter-drawer select,#dr-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
      this.state.adv = {};
      this.byId('dr-filter-badge')?.classList.add('hidden');
      this.render();
    });
  }
}
