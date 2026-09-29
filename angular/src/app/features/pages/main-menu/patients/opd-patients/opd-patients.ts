import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface OpdPatient {
  id: number;
  token: number;
  name: string;
  age: number;
  gender: string;
  dept: string;
  doctor: string;
  time: string;
  waited: number;
  status: string;
  visit: string;
  queue: string;
  ins: string;
  date: string;
  photo: string;
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
  hideConfirm?: boolean;
  onConfirm?: () => void | false;
}

interface DocBoardEntry {
  name: string;
  dept: string;
  acc: string;
  avail: 'busy' | 'on' | 'off';
  waiting: number;
  done: number;
  cur: string;
  prog: number;
  photo: string;
}


@Component({
  imports: [RouterLink],
  selector: 'app-opd-patients',
  styleUrl: './opd-patients.css',
  templateUrl: './opd-patients.html',
})
export class OpdPatients implements AfterViewInit {
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
  private readonly VISITS = ['New', 'Follow-up', 'Walk-in'];
  private readonly STATUSES = ['Waiting', 'In Consultation', 'Lab', 'Pharmacy', 'Completed', 'Cancelled'];
  private readonly QSTATES = ['Waiting', 'Called', 'In Progress', 'Done'];

  private readonly MPHOTO = ['avatar-01.jpg', 'avatar-02.jpg', 'avatar-06.jpg', 'avatar-07.jpg', 'avatar-11.jpg', 'avatar-12.jpg', 'avatar-13.jpg', 'avatar-15.jpg'];
  private readonly FPHOTO = ['avatar-03.jpg', 'avatar-04.jpg', 'avatar-05.jpg', 'avatar-08.jpg', 'avatar-09.jpg', 'avatar-10.jpg', 'avatar-14.jpg', 'avatar-16.jpg'];

  private data: OpdPatient[] = [];
  private nextId = 1;
  private nextTok = 1;

  private state: {
    view: string;
    q: string;
    dept: string;
    status: string;
    sort: string;
    page: number;
    size: number;
    adv: Record<string, string>;
    sel: Record<number, boolean>;
    serving: number;
  } = { view: 'grid', q: '', dept: '', status: '', sort: 'token', page: 1, size: 10, adv: {}, sel: {}, serving: 5 };

  private readonly DOCBOARD: DocBoardEntry[] = [
    { name: 'Dr. Chen', dept: 'Cardiology', acc: 'rose', avail: 'busy', waiting: 4, done: 11, cur: 'Sophia Davis', prog: 68, photo: 'assets/img/doctor/doctor-02.jpg' },
    { name: 'Dr. Kumar', dept: 'Neurology', acc: 'violet', avail: 'busy', waiting: 3, done: 8, cur: 'Oliver Reed', prog: 52, photo: 'assets/img/doctor/doctor-09.jpg' },
    { name: 'Dr. Park', dept: 'Pediatrics', acc: 'sky', avail: 'on', waiting: 2, done: 14, cur: '—', prog: 90, photo: 'assets/img/doctor/doctor-06.jpg' },
    { name: 'Dr. Wang', dept: 'Orthopedics', acc: 'amber', avail: 'busy', waiting: 5, done: 9, cur: 'Lucas Young', prog: 44, photo: 'assets/img/doctor/doctor-12.jpg' },
    { name: 'Dr. Mills', dept: 'ENT / GM', acc: 'indigo', avail: 'on', waiting: 3, done: 12, cur: 'Isabella Lopez', prog: 75, photo: 'assets/img/doctor/doctor-13.jpg' },
    { name: 'Dr. Rivas', dept: 'Dermatology', acc: 'emerald', avail: 'off', waiting: 0, done: 7, cur: '—', prog: 100, photo: 'assets/img/doctor/doctor-04.jpg' },
  ];

  private menu: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.data = this.buildSeedData();
    this.nextId = this.data.length + 1;
    this.nextTok = this.data.length + 1;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const sk = this.byId('opd-skeleton');
      const ct = this.byId('opd-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'opd-fadein .4s ease';
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

    // The static grid holds 6 cards; render once so the default page shows state.size (10).
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
    return `opd-c-${this.DEPT_ACC[d] || 'primary'}`;
  }

  private oid(n: number): string {
    return `OPD-${String(n).padStart(4, '0')}`;
  }

  private detailUrl(): string {
    return 'opd-patient-detail.html';
  }

  private tok(n: number): string {
    return `T-${String(n).padStart(3, '0')}`;
  }

  private iso(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  /* ---------------- seed data ---------------- */

  private buildSeedData(): OpdPatient[] {
    const raw: [string, number, string, string, string, string, number, string, string, string, string][] = [
      ['Ava Thompson', 34, 'F', 'Cardiology', 'Dr. Chen', '09:00 AM', 12, 'In Consultation', 'Follow-up', 'In Progress', 'Verified'],
      ['Liam Carter', 8, 'M', 'Pediatrics', 'Dr. Park', '09:10 AM', 18, 'Waiting', 'New', 'Waiting', 'Verified'],
      ['Noah Bennett', 52, 'M', 'Orthopedics', 'Dr. Wang', '09:20 AM', 6, 'Lab', 'Follow-up', 'In Progress', 'Pending'],
      ['Emma Wilson', 27, 'F', 'Dermatology', 'Dr. Rivas', '09:30 AM', 22, 'Waiting', 'Walk-in', 'Called', 'Self-pay'],
      ['Oliver Reed', 45, 'M', 'Neurology', 'Dr. Kumar', '09:40 AM', 3, 'In Consultation', 'New', 'In Progress', 'Verified'],
      ['Sophia Davis', 61, 'F', 'Cardiology', 'Dr. Chen', '09:50 AM', 30, 'Waiting', 'Follow-up', 'Waiting', 'Verified'],
      ['Mason Clark', 19, 'M', 'ENT', 'Dr. Mills', '10:00 AM', 8, 'Pharmacy', 'New', 'Done', 'Pending'],
      ['Isabella Lopez', 39, 'F', 'General Medicine', 'Dr. Mills', '10:10 AM', 15, 'Waiting', 'Walk-in', 'Called', 'Verified'],
      ['Ethan Turner', 5, 'M', 'Pediatrics', 'Dr. Park', '10:20 AM', 4, 'Completed', 'Follow-up', 'Done', 'Verified'],
      ['Mia Hall', 48, 'F', 'Neurology', 'Dr. Kumar', '10:30 AM', 26, 'Waiting', 'New', 'Waiting', 'Self-pay'],
      ['Lucas Young', 33, 'M', 'Orthopedics', 'Dr. Wang', '10:40 AM', 9, 'In Consultation', 'Follow-up', 'In Progress', 'Verified'],
      ['Charlotte King', 29, 'F', 'Dermatology', 'Dr. Rivas', '10:50 AM', 11, 'Waiting', 'New', 'Waiting', 'Pending'],
      ['Henry Scott', 70, 'M', 'Cardiology', 'Dr. Chen', '11:00 AM', 2, 'Completed', 'Follow-up', 'Done', 'Verified'],
      ['Amelia Green', 42, 'F', 'General Medicine', 'Dr. Mills', '11:10 AM', 20, 'Waiting', 'Walk-in', 'Waiting', 'Verified'],
      ['Jack Adams', 16, 'M', 'ENT', 'Dr. Mills', '11:20 AM', 7, 'Cancelled', 'New', 'Done', 'Self-pay'],
      ['Grace Nelson', 55, 'F', 'Neurology', 'Dr. Kumar', '11:30 AM', 13, 'Lab', 'Follow-up', 'In Progress', 'Verified'],
    ];
    const data = raw.map(
      (a, i): OpdPatient => ({
        id: i + 1,
        token: i + 1,
        name: a[0],
        age: a[1],
        gender: a[2],
        dept: a[3],
        doctor: a[4],
        time: a[5],
        waited: a[6],
        status: a[7],
        visit: a[8],
        queue: a[9],
        ins: a[10],
        date: this.iso(this.today),
        photo: '',
      })
    );
    let mi = 0;
    let fi = 0;
    data.forEach((r) => {
      r.photo = `assets/img/avatar/${r.gender === 'F' ? this.FPHOTO[fi++ % this.FPHOTO.length] : this.MPHOTO[mi++ % this.MPHOTO.length]}`;
    });
    return data;
  }

  private selN(): number {
    return Object.keys(this.state.sel).length;
  }

  /* ---------------- render helpers ---------------- */

  private statusBadge(s: string): string {
    const c: Record<string, string> = { Completed: 'completed', 'In Consultation': 'consult', Waiting: 'waiting', Lab: 'lab', Pharmacy: 'pharmacy', Cancelled: 'cancelled' };
    return `<span class="opd-badge ${c[s] || 'waiting'}">${this.esc(s)}</span>`;
  }

  private queueBadge(q: string): string {
    const m: Record<string, [string, string]> = { Waiting: ['amber', 'icon-clock'], Called: ['sky', 'icon-bell'], 'In Progress': ['primary', 'icon-loader'], Done: ['emerald', 'icon-check'] };
    const a = m[q] || m['Waiting'];
    return `<span class="opd-tag opd-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(q)}</span>`;
  }

  private visitTag(v: string): string {
    const m: Record<string, [string, string]> = { New: ['emerald', 'icon-sparkles'], 'Follow-up': ['violet', 'icon-repeat'], 'Walk-in': ['amber', 'icon-footprints'] };
    const a = m[v] || m['New'];
    return `<span class="opd-tag opd-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(v)}</span>`;
  }

  private insBadge(i: string): string {
    const m: Record<string, [string, string]> = { Verified: ['emerald', 'icon-badge-check'], Pending: ['amber', 'icon-clock'], 'Self-pay': ['sky', 'icon-wallet'] };
    const a = m[i] || m['Pending'];
    return `<span class="opd-chip opd-c-${a[0]}"><i class="${a[1]} text-[10px]"></i>${this.esc(i)}</span>`;
  }

  private avatar(r: OpdPatient): string {
    return `<span class="${this.acc(r.dept)} opd-ava-ring"><img class="opd-ava object-cover" src="${r.photo}" alt=""></span>`;
  }

  private filtered(): OpdPatient[] {
    const q = this.state.q.toLowerCase();
    const a = this.state.adv;
    let rows = this.data.filter((r) => {
      if (q && !(`${r.name} ${this.oid(r.id)} ${this.tok(r.token)} ${r.doctor} ${r.dept}`.toLowerCase().indexOf(q) > -1)) return false;
      if (this.state.dept && r.dept !== this.state.dept) return false;
      if (this.state.status && r.status !== this.state.status) return false;
      if (a['doctor'] && r.doctor !== a['doctor']) return false;
      if (a['visit'] && r.visit !== a['visit']) return false;
      if (a['queue'] && r.queue !== a['queue']) return false;
      if (a['ins'] && r.ins !== a['ins']) return false;
      if (a['token'] && String(r.token) !== String(a['token'])) return false;
      if (a['from'] && r.date < a['from']) return false;
      if (a['to'] && r.date > a['to']) return false;
      return true;
    });
    rows = rows.slice().sort((x, y) => {
      switch (this.state.sort) {
        case 'token':
          return x.token - y.token;
        case 'wait':
          return y.waited - x.waited;
        case 'name':
          return x.name.localeCompare(y.name);
        case 'time':
          return x.time.localeCompare(y.time);
        case 'status':
          return x.status.localeCompare(y.status);
      }
      return 0;
    });
    return rows;
  }

  private cardHTML(r: OpdPatient): string {
    const sel = this.state.sel[r.id] ? ' is-selected' : '';
    return (
      `<article class="opd-card ${this.acc(r.dept)}${sel}" data-id="${r.id}"><div class="p-4">` +
      `<div class="flex items-start gap-3"><input type="checkbox" class="opd-check mt-1 opd-rowcheck" data-id="${r.id}"${this.state.sel[r.id] ? ' checked' : ''}>${this.avatar(r)}` +
      `<div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-primary"><a href="${this.detailUrl()}" class="hover:underline">${this.oid(r.id)}</a></p></div>` +
      `<span class="opd-token" title="Token">${this.tok(r.token)}</span>` +
      `<button class="opd-mini opd-menu-btn ml-1.5" data-id="${r.id}"><i class="icon-ellipsis-vertical"></i></button></div>` +
      `<div class="flex flex-wrap gap-1.5 mt-3">${this.statusBadge(r.status)}${this.visitTag(r.visit)}${this.insBadge(r.ins)}</div>` +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">' +
      `<span class="opd-kv"><i class="icon-user text-primary/70"></i>${r.age}y · ${this.esc(r.gender)}</span>` +
      `<span class="opd-kv"><i class="icon-building-2 text-primary/70"></i><b class="truncate">${this.esc(r.dept)}</b></span>` +
      `<span class="opd-kv"><i class="icon-stethoscope text-primary/70"></i><b class="truncate">${this.esc(r.doctor)}</b></span>` +
      `<span class="opd-kv"><i class="icon-clock text-primary/70"></i>${this.esc(r.time)}</span>` +
      `<span class="opd-kv"><i class="icon-timer text-primary/70"></i>Waited <b>${r.waited}m</b></span>` +
      `<span class="opd-kv"><i class="icon-list-ordered text-primary/70"></i>${this.esc(r.queue)}</span>` +
      '</div>' +
      `<div class="flex items-center justify-between mt-3 pt-3 border-t border-border-color">${this.queueBadge(r.queue)}` +
      `<div class="flex gap-1.5"><button class="opd-mini opd-start" data-id="${r.id}" title="Start consultation"><i class="icon-play text-sm"></i></button><button class="opd-mini opd-view" data-id="${r.id}" title="Details"><i class="icon-eye text-sm"></i></button><button class="opd-mini opd-edit" data-id="${r.id}" title="Edit"><i class="icon-edit text-sm"></i></button></div></div>` +
      '</div></article>'
    );
  }

  private render(): void {
    const grid = this.byId('opd-gridview');
    const empty = this.byId('opd-empty');
    const pager = this.byId('opd-pager');
    if (!grid || !empty || !pager) return;

    const rows = this.filtered();
    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / this.state.size));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.size;
    const pageRows = rows.slice(start, start + this.state.size);

    const count = this.byId('opd-count');
    if (count) count.textContent = `${total} of ${this.data.length} patients`;
    empty.classList.toggle('hidden', total !== 0);
    pager.classList.toggle('hidden', total === 0);
    grid.innerHTML = pageRows.map((r) => this.cardHTML(r)).join('');
    const pageInfo = this.byId('opd-page-info');
    if (pageInfo) pageInfo.textContent = total ? `Showing ${start + 1}–${start + pageRows.length} of ${total}` : 'No records';
    this.pageNav(pages);

    const allSel = pageRows.length > 0 && pageRows.every((r) => this.state.sel[r.id]);
    const sa1 = this.byId('opd-select-all') as HTMLInputElement | null;
    if (sa1) sa1.checked = !!allSel;
    const sa2 = this.byId('opd-select-all-2') as HTMLInputElement | null;
    if (sa2) sa2.checked = !!allSel;
    this.updateBulk();
  }

  private pageNav(pages: number): void {
    const p = this.state.page;
    let h = `<button class="opd-pg" data-pg="prev"${p <= 1 ? ' disabled' : ''}><i class="icon-chevron-left"></i></button>`;
    const list: (number | string)[] = [];
    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || Math.abs(i - p) <= 1) list.push(i);
      else if (list[list.length - 1] !== '…') list.push('…');
    }
    list.forEach((i) => {
      h += i === '…' ? '<span class="px-1 text-gray-400">…</span>' : `<button class="opd-pg${i === p ? ' is-active' : ''}" data-pg="${i}">${i}</button>`;
    });
    h += `<button class="opd-pg" data-pg="next"${p >= pages ? ' disabled' : ''}><i class="icon-chevron-right"></i></button>`;
    const nav = this.byId('opd-page-nav');
    if (nav) nav.innerHTML = h;
  }

  private initRings(scope: HTMLElement | null): void {
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.opd-ring[data-p]', scope || this.document).forEach((r) => {
        r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
      });
    });
  }

  /* ---------------- KPIs / dashboard widgets ---------------- */

  private buildKPIs(): void {
    const by = (f: (r: OpdPatient) => boolean) => this.data.filter(f).length;
    const k: [string, string | number, string, string, number, string][] = [
      ["Today's OPD Patients", this.data.length, 'primary', 'icon-users', 78, '+9%'],
      ['Waiting Patients', by((r) => r.status === 'Waiting'), 'amber', 'icon-clock', 45, 'Queue'],
      ['In Consultation', by((r) => r.status === 'In Consultation'), 'violet', 'icon-stethoscope', 32, 'Live'],
      ['Completed Consults', by((r) => r.status === 'Completed'), 'emerald', 'icon-badge-check', 60, 'Done'],
      ['Follow-up Visits', by((r) => r.visit === 'Follow-up'), 'teal', 'icon-repeat', 40, 'Return'],
      ['New Registrations', by((r) => r.visit === 'New'), 'sky', 'icon-user-plus', 55, 'New'],
    ];
    const spark = '1,14 9,10 17,12 25,6 33,9 41,4 53,2';
    const kpis = this.byId('opd-kpis');
    if (kpis) {
      kpis.innerHTML = k
        .map(
          (c) =>
            `<div class="opd-stat opd-c-${c[2]}"><div class="flex items-start justify-between"><span class="opd-stat-ico"><i class="${c[3]}"></i></span>` +
            `<svg class="opd-ring" viewBox="0 0 36 36" data-p="${c[4]}"><circle class="trk" cx="18" cy="18" r="15.915" pathLength="100"></circle><circle class="bar" cx="18" cy="18" r="15.915" pathLength="100"></circle></svg></div>` +
            `<p class="mt-3 text-2xl font-extrabold text-gray-900 dark:text-white">${c[1]}</p><p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">${c[0]}</p>` +
            `<div class="mt-2.5 flex items-center justify-between gap-2"><span class="opd-chip">${c[5]}</span><svg width="54" height="18" viewBox="0 0 54 18" fill="none" style="color:var(--opd-c)"><polyline points="${spark}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`
        )
        .join('');
    }
    this.initRings(this.byId('opd-kpis'));

    // hourly flow
    const flow = [8, 14, 22, 30, 26, 18, 12, 20, 24, 16];
    const mx = Math.max(...flow);
    const flowwidget = this.byId('opd-flowwidget');
    if (flowwidget) {
      flowwidget.innerHTML = flow
        .map((v, i) => {
          const h = Math.round((v / mx) * 100);
          const g = i === 3 ? 'linear-gradient(180deg,var(--color-primary),#6366f1)' : `color-mix(in oklab,var(--color-primary) ${30 + h * 0.25}%,transparent)`;
          return `<span style="width:100%;height:${h}%;background:${g};border-radius:.35rem" title="${v} patients"></span>`;
        })
        .join('');
    }

    const dept: [string, number, string][] = [
      ['Cardiology', 26, 'rose'],
      ['General Medicine', 22, 'teal'],
      ['Pediatrics', 18, 'sky'],
    ];
    const deptwidget = this.byId('opd-deptwidget');
    if (deptwidget) {
      deptwidget.innerHTML = dept
        .map(
          (d) =>
            `<div class="opd-c-${d[2]}"><div class="flex justify-between text-xs mb-1"><span class="text-gray-500 dark:text-gray-400">${d[0]}</span><b class="text-gray-900 dark:text-white">${d[1]}%</b></div><div class="opd-bar"><i style="width:${d[1] * 3.4}%"></i></div></div>`
        )
        .join('');
    }

    const ds = this.DOCBOARD.slice(0, 5);
    const docstatuswidget = this.byId('opd-docstatuswidget');
    if (docstatuswidget) {
      docstatuswidget.innerHTML = ds
        .map(
          (d) =>
            `<div class="flex items-center gap-2.5 opd-c-${d.acc}"><span class="opd-c-${d.acc}" style="width:.55rem;height:.55rem;border-radius:9999px;background:var(--opd-c);flex-shrink:0"></span><span class="text-xs font-semibold text-gray-700 dark:text-gray-200 w-20 truncate">${d.name}</span><div class="opd-bar flex-1"><i style="width:${d.prog}%"></i></div><span class="opd-avail ${d.avail}">${d.avail === 'on' ? 'Free' : d.avail === 'busy' ? 'Busy' : 'Off'}</span></div>`
        )
        .join('');
    }

    const qa: [string, string, string][] = [
      ['Avg Wait', '18m', 'amber'],
      ['Longest Wait', '34m', 'rose'],
      ['Served / hr', '9', 'emerald'],
      ['No-shows', '2', 'sky'],
    ];
    const queuewidget = this.byId('opd-queuewidget');
    if (queuewidget) {
      queuewidget.innerHTML = qa
        .map((b) => `<div class="rounded-xl border border-border-color p-2.5 opd-c-${b[2]}"><p class="text-xl font-extrabold text-gray-900 dark:text-white">${b[1]}</p><p class="text-[10px] text-gray-500">${b[0]}</p></div>`)
        .join('');
    }

    const ct: [string, number, string][] = [
      ['< 10 min', 30, 'emerald'],
      ['10–20 min', 46, 'primary'],
      ['20–30 min', 18, 'amber'],
      ['30+ min', 6, 'rose'],
    ];
    const ctwidget = this.byId('opd-ctwidget');
    if (ctwidget) {
      ctwidget.innerHTML = ct
        .map(
          (l) =>
            `<div class="flex items-center gap-2 opd-c-${l[2]}"><span class="text-[11px] text-gray-500 dark:text-gray-400" style="width:4.5rem">${l[0]}</span><div class="opd-bar flex-1"><i style="width:${l[1]}%"></i></div><b class="text-xs text-gray-900 dark:text-white">${l[1]}%</b></div>`
        )
        .join('');
    }

    const acts: [string, string, string][] = [
      ['Henry Scott completed consultation', '2m ago', 'icon-badge-check'],
      ['Token T-008 called · Dr. Mills', '5m ago', 'icon-bell'],
      ['Emma Wilson registered (Walk-in)', '9m ago', 'icon-user-plus'],
    ];
    const actwidget = this.byId('opd-actwidget');
    if (actwidget) {
      actwidget.innerHTML = acts
        .map((a) => `<div class="opd-tl-item"><span class="opd-tl-node"><i class="${a[2]}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${a[0]}</p><p class="text-[10px] text-gray-400">${a[1]}</p></div>`)
        .join('');
    }

    // doctor status board
    const docboard = this.byId('opd-docboard');
    if (docboard) {
      docboard.innerHTML = this.DOCBOARD.map(
        (d) =>
          `<div class="opd-doc opd-c-${d.acc} p-4"><div class="flex items-center gap-3"><span class="opd-c-${d.acc} opd-ava-ring"><img class="opd-ava object-cover" src="${d.photo}" alt=""></span><div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${d.name}</p><p class="text-[11px] text-gray-400">${d.dept}</p></div><span class="opd-avail ${d.avail}"><i class="icon-${d.avail === 'off' ? 'moon' : 'circle'} text-[8px]"></i>${d.avail === 'on' ? 'Available' : d.avail === 'busy' ? 'In Consult' : 'Off Duty'}</span></div>` +
          `<div class="grid grid-cols-2 gap-2 mt-3 text-center"><div class="rounded-lg border border-border-color p-2"><p class="text-lg font-extrabold text-gray-900 dark:text-white">${d.waiting}</p><p class="text-[10px] text-gray-500">Waiting</p></div><div class="rounded-lg border border-border-color p-2"><p class="text-lg font-extrabold text-gray-900 dark:text-white">${d.done}</p><p class="text-[10px] text-gray-500">Completed</p></div></div>` +
          `<div class="mt-3"><div class="flex items-center justify-between text-[11px] mb-1"><span class="text-gray-500">Current: <b class="text-gray-900 dark:text-white">${this.esc(d.cur)}</b></span><span class="opd-chip">${d.prog}%</span></div><div class="opd-bar"><i style="width:${d.prog}%"></i></div></div>` +
          `<div class="flex gap-1.5 mt-3"><button class="opd-btn opd-btn-solid flex-1" style="padding:.4rem" data-docact="assign" data-doc="${this.esc(d.name)}"><i class="icon-user-plus"></i>Assign</button><button class="opd-btn opd-btn-solid flex-1" style="padding:.4rem" data-docact="view" data-doc="${this.esc(d.name)}"><i class="icon-eye"></i>View</button></div></div>`
      ).join('');
    }

    this.buildQueueBoard();

    const todayBadge = this.byId('opd-today-badge');
    if (todayBadge) todayBadge.textContent = String(this.data.length);
    const queueBadge = this.byId('opd-queue-badge');
    if (queueBadge) queueBadge.textContent = String(by((r) => r.status === 'Waiting'));
    const consultBadge = this.byId('opd-consult-badge');
    if (consultBadge) consultBadge.textContent = String(by((r) => r.status === 'In Consultation'));
    const avgw = Math.round(this.data.reduce((s, r) => s + r.waited, 0) / this.data.length);
    const waitBadge = this.byId('opd-wait-badge');
    if (waitBadge) waitBadge.textContent = String(avgw);

    const recentwidget = this.byId('opd-recentwidget');
    if (recentwidget) {
      recentwidget.innerHTML = this.data
        .slice(0, 6)
        .map(
          (r) =>
            `<button class="opd-recent w-full text-left opd-view" data-id="${r.id}"><span class="${this.acc(r.dept)} opd-ava-ring" style="border-radius:.7rem"><img class="opd-ava object-cover" style="width:2.1rem;height:2.1rem;border-radius:.6rem" src="${r.photo}" alt=""></span><div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[10px] text-gray-400">${this.tok(r.token)} · ${this.esc(r.dept)}</p></div>${this.statusBadge(r.status)}</button>`
        )
        .join('');
    }
  }

  /* ---- live queue board ---- */

  private buildQueueBoard(): void {
    const waiting = this.data.filter((r) => r.status === 'Waiting').length;
    const consult = this.data.filter((r) => r.status === 'In Consultation').length;
    const done = this.data.filter((r) => r.status === 'Completed').length;
    const cur = this.data.find((r) => r.id === this.state.serving);
    const next = this.data
      .filter((r) => r.status === 'Waiting')
      .sort((a, b) => a.token - b.token)[0];
    const tiles: [string, string | number, string, string][] = [
      ['Current Token', cur ? this.tok(cur.token) : '—', 'icon-ticket', '#38bdf8'],
      ['Next Token', next ? this.tok(next.token) : '—', 'icon-skip-forward', '#818cf8'],
      ['Waiting Queue', waiting, 'icon-users', '#fbbf24'],
      ['In Consultation', consult, 'icon-stethoscope', '#a78bfa'],
      ['Completed Today', done, 'icon-badge-check', '#34d399'],
      ['Est. Wait', '18m', 'icon-timer', '#f472b6'],
    ];
    const queueboard = this.byId('opd-queueboard');
    if (queueboard) {
      queueboard.innerHTML = tiles
        .map((t) => `<div class="opd-qtile"><div class="flex items-center justify-between"><span class="l">${t[0]}</span><i class="${t[2]}" style="color:${t[3]}"></i></div><p class="n mt-1.5" style="color:${t[3]}">${t[1]}</p></div>`)
        .join('');
    }
    const served = this.data.length ? Math.round((done / this.data.length) * 100) : 0;
    const qp = this.byId('opd-qprog') as HTMLElement | null;
    if (qp) qp.style.width = `${served}%`;
    const qpLbl = this.byId('opd-qprog-lbl');
    if (qpLbl) qpLbl.textContent = `${served}% served`;

    // right sidebar now-serving
    const curTokenEl = this.byId('opd-cur-token');
    if (curTokenEl) curTokenEl.textContent = cur ? this.tok(cur.token) : '—';
    const nextTokenEl = this.byId('opd-next-token');
    if (nextTokenEl) nextTokenEl.textContent = next ? this.tok(next.token) : '—';
    const servingChip = this.byId('opd-serving-chip');
    if (servingChip) servingChip.textContent = cur ? cur.dept : 'Idle';
    const serveMini = this.byId('opd-serve-mini');
    if (serveMini) {
      serveMini.innerHTML = (
        [
          ['Waiting', waiting, 'amber'],
          ['Consult', consult, 'violet'],
          ['Done', done, 'emerald'],
        ] as [string, number, string][]
      )
        .map((m) => `<div class="rounded-lg border border-border-color p-2 opd-c-${m[2]}"><p class="text-base font-extrabold text-gray-900 dark:text-white">${m[1]}</p><p class="text-[10px] text-gray-500">${m[0]}</p></div>`)
        .join('');
    }
  }

  private callNext(): void {
    const next = this.data.filter((r) => r.status === 'Waiting').sort((a, b) => a.token - b.token)[0];
    if (!next) {
      this.toast('Queue is empty', 'info');
      return;
    }
    const cur = this.data.find((r) => r.id === this.state.serving);
    if (cur && cur.status === 'In Consultation') {
      cur.status = 'Completed';
      cur.queue = 'Done';
    }
    next.status = 'In Consultation';
    next.queue = 'In Progress';
    this.state.serving = next.id;
    this.buildKPIs();
    this.render();
    this.toast(`Now serving ${this.tok(next.token)} · ${next.name}`);
  }

  private updateBulk(): void {
    const n = this.selN();
    const cnt = this.byId('opd-bulk-count');
    if (cnt) cnt.textContent = String(n);
    const bar = this.byId('opd-bulkbar');
    if (bar) (bar as HTMLElement).hidden = n === 0;
  }

  private selectedRecs(): OpdPatient[] {
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
      '<div class="opd-menu"><p class="opd-menu-lbl">Patient</p>' +
      I('icon-eye', 'View Profile', 'view') +
      I('icon-edit', 'Edit Details', 'edit') +
      I('icon-play', 'Start Consultation', 'start') +
      I('icon-check-circle', 'Complete Consultation', 'complete') +
      '<div class="opd-menu-sep"></div><p class="opd-menu-lbl">Queue & Care</p>' +
      I('icon-user-cog', 'Assign Doctor', 'assign') +
      I('icon-ticket', 'Change Token', 'token') +
      I('icon-flask-conical', 'Send to Lab', 'lab') +
      I('icon-pill', 'Send to Pharmacy', 'pharmacy') +
      I('icon-file-text', 'Generate Prescription', 'rx') +
      '<div class="opd-menu-sep"></div><p class="opd-menu-lbl">Documents & Share</p>' +
      I('icon-printer', 'Print Visit Summary', 'print') +
      I('icon-download', 'Download PDF', 'pdf') +
      I('icon-calendar-plus', 'Book Follow-up', 'followup') +
      I('icon-message-circle', 'Send SMS', 'sms') +
      I('icon-mail', 'Send Email', 'email') +
      '<div class="opd-menu-sep"></div>' +
      I('icon-x-circle', 'Cancel Visit', 'cancel') +
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
    const title = this.byId('opd-modal-title');
    if (title) title.textContent = o.title;
    const sub = this.byId('opd-modal-sub');
    if (sub) sub.textContent = o.sub || '';
    const ico = this.byId('opd-modal-ico');
    if (ico) {
      ico.innerHTML = `<i class="${o.icon || 'icon-check'}"></i>`;
      ico.className = `opd-doc-ico ${o.accent || 'opd-c-primary'}`;
    }
    const body = this.byId('opd-modal-body');
    if (body) body.innerHTML = o.body || '';
    const c = this.byId('opd-modal-confirm') as HTMLElement | null;
    if (c) {
      c.textContent = o.confirm || 'Confirm';
      c.className = `opd-btn ${o.danger ? 'opd-btn-danger' : 'opd-btn-primary'}`;
      c.style.display = o.hideConfirm ? 'none' : '';
      c.onclick = () => {
        if (o.onConfirm && o.onConfirm() === false) return;
        this.closeModal();
      };
    }
    this.byId('opd-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    // Modal body HTML is injected after the page's initial-load flatpickr auto-init
    // has already run, so any date fields inside it must be initialized here instead.
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', this.byId('opd-modal-body') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
    }
  }

  private closeModal(): void {
    this.byId('opd-modal')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private fld(l: string, id: string, v?: string | number, ph?: string): string {
    return `<div><label class="opd-lbl">${l}</label><input id="${id}" class="opd-in" value="${this.esc(v || '')}" placeholder="${this.esc(ph || '')}"></div>`;
  }

  private sel(l: string, id: string, opts: string[], v?: string): string {
    return `<div><label class="opd-lbl">${l}</label><select id="${id}" class="opd-in">${opts.map((o) => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
  }

  private area(l: string, id: string, v?: string): string {
    return `<div><label class="opd-lbl">${l}</label><textarea id="${id}" class="opd-in" rows="3" style="resize:vertical">${this.esc(v || '')}</textarea></div>`;
  }

  private patientForm(r: Partial<OpdPatient>): string {
    r = r || {};
    return (
      '<div class="grid grid-cols-2 gap-3">' +
      this.fld('Patient Name', 'm-name', r.name, 'Full name') +
      this.fld('Age', 'm-age', r.age, 'e.g. 34') +
      this.sel('Gender', 'm-gender', ['M', 'F', 'Other'], r.gender) +
      this.sel('Department', 'm-dept', this.DEPTS, r.dept) +
      this.sel('Doctor', 'm-doc', this.DOCTORS, r.doctor) +
      this.fld('Appointment Time', 'm-time', r.time, 'e.g. 10:30 AM') +
      this.sel('Visit Type', 'm-visit', this.VISITS, r.visit) +
      this.sel('Consultation Status', 'm-status', this.STATUSES, r.status) +
      this.sel('Queue Status', 'm-queue', this.QSTATES, r.queue) +
      this.sel('Insurance', 'm-ins', ['Verified', 'Pending', 'Self-pay'], r.ins) +
      '</div>' +
      this.area('Notes / Chief Complaint', 'm-notes', r.notes)
    );
  }

  private readForm(): Omit<OpdPatient, 'id' | 'token' | 'photo'> {
    return {
      name: ((this.byId('m-name') as HTMLInputElement | null)?.value || '').trim(),
      age: +((this.byId('m-age') as HTMLInputElement | null)?.value || 0) || 0,
      gender: (this.byId('m-gender') as HTMLSelectElement | null)?.value || '',
      dept: (this.byId('m-dept') as HTMLSelectElement | null)?.value || '',
      doctor: (this.byId('m-doc') as HTMLSelectElement | null)?.value || '',
      time: (this.byId('m-time') as HTMLInputElement | null)?.value || '—',
      visit: (this.byId('m-visit') as HTMLSelectElement | null)?.value || '',
      status: (this.byId('m-status') as HTMLSelectElement | null)?.value || '',
      queue: (this.byId('m-queue') as HTMLSelectElement | null)?.value || '',
      ins: (this.byId('m-ins') as HTMLSelectElement | null)?.value || '',
      waited: 0,
      date: this.iso(this.today),
      notes: (this.byId('m-notes') as HTMLTextAreaElement | null)?.value || '',
    };
  }

  private openForm(kind: 'new' | 'book'): void {
    if (kind === 'book') {
      this.modal({
        title: 'Book Appointment',
        icon: 'icon-calendar-plus',
        accent: 'opd-c-emerald',
        sub: 'Schedule an OPD visit',
        confirm: 'Book Appointment',
        body: this.patientForm({ status: 'Waiting', queue: 'Waiting', visit: 'New' }),
        onConfirm: () => {
          const f = this.readForm();
          if (!f.name) {
            this.toast('Patient name is required', 'error');
            return false;
          }
          const nf: OpdPatient = { ...f, id: this.nextId++, token: this.nextTok++, photo: 'assets/img/avatar/avatar-01.jpg' };
          this.data.push(nf);
          this.state.page = 1;
          this.buildKPIs();
          this.render();
          this.toast(`Appointment booked for ${nf.name} · ${this.tok(nf.token)}`);
          return undefined;
        },
      });
      return;
    }
    this.modal({
      title: 'Register OPD Patient',
      icon: 'icon-user-plus',
      sub: 'Add a new outpatient visit',
      confirm: 'Register & Issue Token',
      body: this.patientForm({ status: 'Waiting', queue: 'Waiting', visit: 'New' }),
      onConfirm: () => {
        const f = this.readForm();
        if (!f.name) {
          this.toast('Patient name is required', 'error');
          return false;
        }
        const nf: OpdPatient = { ...f, id: this.nextId++, token: this.nextTok++, photo: 'assets/img/avatar/avatar-01.jpg' };
        this.data.push(nf);
        this.state.page = 1;
        this.buildKPIs();
        this.render();
        this.toast(`Registered ${nf.name} · Token ${this.tok(nf.token)}`);
        return undefined;
      },
    });
  }

  private tokenManager(): void {
    const rows = this.data
      .slice()
      .sort((a, b) => a.token - b.token)
      .slice(0, 8);
    const body =
      '<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Manage the live token queue. Drag priority, recall or skip tokens.</p><div class="space-y-2">' +
      rows
        .map(
          (r) =>
            `<div class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5"><span class="opd-token ${this.acc(r.dept)}">${this.tok(r.token)}</span><div class="min-w-0 flex-1"><p class="text-sm font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[11px] text-gray-400">${this.esc(r.dept)} · ${this.esc(r.doctor)}</p></div>${this.statusBadge(r.status)}</div>`
        )
        .join('') +
      '</div>';
    this.modal({
      title: 'Token Management',
      sub: `${this.data.length} tokens in queue`,
      icon: 'icon-ticket',
      accent: 'opd-c-sky',
      confirm: 'Call Next Token',
      body,
      onConfirm: () => this.callNext(),
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
          title: 'Edit Patient',
          sub: this.oid(r.id),
          icon: 'icon-edit',
          confirm: 'Save',
          body: this.patientForm(r),
          onConfirm: () => {
            Object.assign(r, this.readForm());
            this.buildKPIs();
            this.render();
            this.toast('Patient updated');
          },
        });
        return;
      case 'start':
        r.status = 'In Consultation';
        r.queue = 'In Progress';
        this.state.serving = r.id;
        this.buildKPIs();
        this.render();
        this.toast(`Consultation started for ${r.name}`);
        return;
      case 'complete':
        r.status = 'Completed';
        r.queue = 'Done';
        this.buildKPIs();
        this.render();
        this.toast(`${r.name}'s consultation completed`);
        return;
      case 'assign':
        this.modal({
          title: 'Assign Doctor',
          sub: r.name,
          icon: 'icon-user-cog',
          accent: 'opd-c-violet',
          confirm: 'Assign',
          body: this.sel('Doctor', 'a-doc', this.DOCTORS, r.doctor) + this.sel('Department', 'a-dept', this.DEPTS, r.dept),
          onConfirm: () => {
            r.doctor = (this.byId('a-doc') as HTMLSelectElement | null)?.value || r.doctor;
            r.dept = (this.byId('a-dept') as HTMLSelectElement | null)?.value || r.dept;
            this.buildKPIs();
            this.render();
            this.toast(`${r.name} assigned to ${r.doctor}`);
          },
        });
        return;
      case 'token':
        this.modal({
          title: 'Change Token',
          sub: r.name,
          icon: 'icon-ticket',
          accent: 'opd-c-sky',
          confirm: 'Update Token',
          body: this.fld('New Token Number', 't-num', r.token, 'e.g. 21'),
          onConfirm: () => {
            const v = +((this.byId('t-num') as HTMLInputElement | null)?.value || 0);
            if (v > 0) r.token = v;
            this.buildKPIs();
            this.render();
            this.toast(`Token updated to ${this.tok(r.token)}`);
          },
        });
        return;
      case 'lab':
        r.status = 'Lab';
        r.queue = 'In Progress';
        this.buildKPIs();
        this.render();
        this.toast(`${r.name} sent to Laboratory`, 'info');
        return;
      case 'pharmacy':
        r.status = 'Pharmacy';
        r.queue = 'In Progress';
        this.buildKPIs();
        this.render();
        this.toast(`${r.name} sent to Pharmacy`, 'info');
        return;
      case 'rx':
        this.modal({
          title: 'Generate Prescription',
          sub: r.name,
          icon: 'icon-file-text',
          accent: 'opd-c-emerald',
          confirm: 'Generate',
          body: this.area('Medications', 'rx-med', '') + this.area('Instructions', 'rx-note', ''),
          onConfirm: () => this.toast(`Prescription generated for ${r.name}`),
        });
        return;
      case 'print':
        this.toast('Printing visit summary…', 'info');
        setTimeout(() => window.print(), 400);
        return;
      case 'pdf':
        this.toast(`Generating PDF for ${r.name}…`, 'info');
        return;
      case 'followup':
        this.modal({
          title: 'Book Follow-up',
          sub: r.name,
          icon: 'icon-calendar-plus',
          accent: 'opd-c-violet',
          confirm: 'Book',
          body:
            this.sel('Doctor', 'f-doc', this.DOCTORS, r.doctor) +
            '<div><label class="opd-lbl">Follow-up Date</label><input type="text" placeholder="dd-mm-yyyy" id="f-date" class="opd-in" data-provider="flatpickr" data-date-format="d-m-Y"></div>' +
            this.area('Instructions', 'f-note'),
          onConfirm: () => this.toast(`Follow-up booked for ${r.name}`),
        });
        return;
      case 'sms':
        this.modal({
          title: 'Send SMS',
          sub: r.name,
          icon: 'icon-message-circle',
          accent: 'opd-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 's-msg', `Your token ${this.tok(r.token)} is approaching. Please stay near ${r.dept}.`),
          onConfirm: () => this.toast(`SMS sent to ${r.name}`),
        });
        return;
      case 'email':
        this.modal({
          title: 'Send Email',
          sub: r.name,
          icon: 'icon-mail',
          accent: 'opd-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'e-sub', 'OPD Visit Summary') + this.area('Message', 'e-msg'),
          onConfirm: () => this.toast(`Email sent to ${r.name}`),
        });
        return;
      case 'cancel':
        this.modal({
          title: 'Cancel Visit',
          sub: r.name,
          icon: 'icon-x-circle',
          accent: 'opd-c-rose',
          danger: true,
          confirm: 'Cancel Visit',
          body: this.area('Reason for cancellation', 'c-reason'),
          onConfirm: () => {
            r.status = 'Cancelled';
            r.queue = 'Done';
            this.buildKPIs();
            this.render();
            this.toast(`${r.name}'s visit cancelled`);
          },
        });
        return;
      case 'delete':
        this.modal({
          title: 'Delete Patient',
          sub: 'This cannot be undone',
          icon: 'icon-trash-2',
          accent: 'opd-c-rose',
          danger: true,
          confirm: 'Delete',
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete OPD record <strong>${this.oid(r.id)}</strong> for ${this.esc(r.name)}?</p>`,
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
    const tl = (t: string, s: string, d: string) => `<div class="opd-tl-item"><span class="opd-tl-node"><i class="${d}"></i></span><p class="text-xs font-semibold text-gray-900 dark:text-white">${t}</p><p class="text-[10px] text-gray-400">${s}</p></div>`;
    const tags = (arr: string[], ac: string) => `<div class="flex flex-wrap gap-1.5">${arr.map((x) => `<span class="opd-tag ${ac}">${x}</span>`).join('')}</div>`;
    const vit = (l: string, v: string, u: string, ac: string) => `<div class="rounded-xl border border-border-color p-2.5 opd-c-${ac}"><p class="text-[10px] text-gray-500">${l}</p><p class="text-sm font-extrabold text-gray-900 dark:text-white">${v} <span class="text-[10px] font-medium text-gray-400">${u}</span></p></div>`;

    const body = this.byId('opd-detail-body');
    if (body) {
      body.innerHTML =
        `<div class="opd-drawer-hero ${this.acc(r.dept)}"><div class="relative flex items-center justify-between"><button class="opd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-close><i class="icon-x"></i></button><div class="flex gap-1.5"><button class="opd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="edit" data-id="${id}"><i class="icon-edit"></i></button><button class="opd-icobtn" style="background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.25);color:#fff" data-da="print" data-id="${id}"><i class="icon-printer"></i></button></div></div>` +
        `<div class="relative flex items-center gap-3 mt-4">${this.avatar(r)}<div class="min-w-0"><p class="text-lg font-extrabold truncate">${this.esc(r.name)}</p><p class="text-[11px] font-mono text-white/80">${this.oid(r.id)} · Token ${this.tok(r.token)}</p><div class="mt-1.5">${this.statusBadge(r.status)}</div></div></div></div>` +
        `<div class="p-4 space-y-4"><div class="flex flex-wrap gap-1.5">${this.visitTag(r.visit)}${this.queueBadge(r.queue)}${this.insBadge(r.ins)}</div>` +
        sec('Patient Summary', `<div class="rounded-xl border border-border-color p-3">${kv('Age / Gender', `${r.age}y · ${this.esc(r.gender)}`)}${kv('Department', this.esc(r.dept))}${kv('Assigned Doctor', this.esc(r.doctor))}${kv('Visit Type', this.esc(r.visit))}</div>`) +
        sec('Appointment Details', `<div class="rounded-xl border border-border-color p-3">${kv('Appointment Time', this.esc(r.time))}${kv('Waiting Time', `${r.waited} min`)}${kv('Queue Status', this.esc(r.queue))}${kv('Consultation', this.esc(r.status))}</div>`) +
        sec(
          'Vitals',
          `<div class="grid grid-cols-3 gap-2">${vit('BP', '122/80', 'mmHg', 'rose')}${vit('Pulse', '76', 'bpm', 'violet')}${vit('Temp', '98.4', '°F', 'amber')}${vit('SpO₂', '98', '%', 'sky')}${vit('Weight', '68', 'kg', 'teal')}${vit('BMI', '23.1', '', 'emerald')}</div>`
        ) +
        sec('Medical History', '<p class="text-sm text-gray-600 dark:text-gray-300">Hypertension (2019), seasonal allergies. Non-smoker. No prior surgeries.</p>') +
        sec('Allergies', tags(['Penicillin', 'Dust'], 'opd-c-amber')) +
        sec('Current Medications', tags(['Amlodipine 5mg', 'Cetirizine 10mg'], 'opd-c-emerald')) +
        sec('Doctor Notes', `<p class="text-sm text-gray-600 dark:text-gray-300">${this.esc(r.doctor)} — patient stable, reviewing recent labs. Advise lifestyle changes and follow-up in 2 weeks.</p>`) +
        sec('Prescriptions', `<div class="rounded-xl border border-border-color p-2.5 text-xs">${kv('Rx-2291', 'Amlodipine · 30 days')}${kv('Rx-2288', 'Cetirizine · 14 days')}</div>`) +
        sec(
          'Previous Visits',
          `<div class="space-y-2">${(
            [
              ['12 Jun', 'Cardiology', 'Follow-up'],
              ['03 May', 'General Medicine', 'New'],
              ['18 Apr', 'Cardiology', 'Follow-up'],
            ] as [string, string, string][]
          )
            .map(
              (p) =>
                `<div class="opd-recent" style="border:1px solid var(--color-border-color)"><span class="opd-doc-ico opd-c-primary" style="width:2rem;height:2rem;font-size:.85rem"><i class="icon-calendar"></i></span><div class="flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white">${p[1]}</p><p class="text-[10px] text-gray-400">${p[0]} · ${p[2]}</p></div></div>`
            )
            .join('')}</div>`
        ) +
        sec(
          'Timeline',
          `<div class="opd-tl ${this.acc(r.dept)}">${tl('Registered', r.time, 'icon-user-plus')}${tl(`Token issued · ${this.tok(r.token)}`, r.time, 'icon-ticket')}${tl(`Waiting (${r.waited}m)`, 'Queue', 'icon-clock')}${tl(r.status, 'Now', 'icon-stethoscope')}</div>`
        ) +
        `<div class="grid grid-cols-2 gap-2"><button class="opd-btn opd-btn-primary" data-da="start" data-id="${id}"><i class="icon-play"></i>Start</button><button class="opd-btn opd-btn-success" data-da="complete" data-id="${id}"><i class="icon-check-circle"></i>Complete</button><button class="opd-btn opd-btn-solid" data-da="rx" data-id="${id}"><i class="icon-file-text"></i>Prescription</button><button class="opd-btn opd-btn-solid" data-da="followup" data-id="${id}"><i class="icon-calendar-plus"></i>Follow-up</button></div></div>`;
    }
    this.byId('opd-detail-drawer')?.classList.add('open');
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
      case 'assign':
        this.modal({
          title: 'Assign Doctor',
          sub: `${n} patients`,
          icon: 'icon-user-cog',
          accent: 'opd-c-violet',
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
      case 'queue':
        this.modal({
          title: 'Change Queue Status',
          sub: `${n} patients`,
          icon: 'icon-list-ordered',
          confirm: 'Apply',
          body: this.sel('Queue Status', 'bk-q', this.QSTATES),
          onConfirm: () => {
            const v = (this.byId('bk-q') as HTMLSelectElement | null)?.value || '';
            recs.forEach((r) => (r.queue = v));
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
          accent: 'opd-c-emerald',
          confirm: 'Send',
          body: this.area('Message', 'bk-sms'),
          onConfirm: () => this.toast(`SMS sent to ${n} patients`),
        });
        return;
      case 'email':
        this.modal({
          title: 'Send Email',
          sub: `${n} patients`,
          icon: 'icon-mail',
          accent: 'opd-c-sky',
          confirm: 'Send',
          body: this.fld('Subject', 'bk-esub', 'OPD Update') + this.area('Message', 'bk-emsg'),
          onConfirm: () => this.toast(`Email sent to ${n} patients`),
        });
        return;
      case 'export':
        this.toast(`Exported ${n} patients`);
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
          accent: 'opd-c-rose',
          danger: true,
          confirm: `Delete ${n}`,
          body: `<p class="text-sm text-gray-600 dark:text-gray-300">Delete ${n} selected OPD records?</p>`,
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
      title: 'Import OPD Patients',
      sub: 'CSV or Excel',
      icon: 'icon-upload',
      accent: 'opd-c-sky',
      confirm: 'Import',
      body:
        '<div style="border:2px dashed var(--color-border-color);border-radius:.9rem;padding:1.75rem;text-align:center;color:var(--color-gray-500)"><i class="icon-cloud-upload text-3xl"></i><p class="text-sm font-bold mt-1">Drag &amp; drop your file</p><p class="text-[11px]">CSV, XLSX up to 10MB</p></div>' +
        '<div class="flex items-center gap-2 mt-3"><span class="opd-chip opd-c-emerald">CSV</span><span class="opd-chip opd-c-emerald">Excel</span><a href="#" class="ml-auto text-xs font-bold text-primary hover:underline" id="opd-tmpl">Download template</a></div>' +
        '<div class="mt-3 rounded-xl border border-border-color p-3 grid grid-cols-3 text-center"><div><p class="text-lg font-extrabold text-emerald-600">18</p><p class="text-[10px] text-gray-500">Valid</p></div><div><p class="text-lg font-extrabold text-amber-600">2</p><p class="text-[10px] text-gray-500">Warnings</p></div><div><p class="text-lg font-extrabold text-rose-600">0</p><p class="text-[10px] text-gray-500">Errors</p></div></div>',
      onConfirm: () => this.toast('Imported 18 patients (2 warnings)'),
    });
    const tm = this.byId('opd-tmpl');
    if (tm) {
      tm.onclick = (e: Event) => {
        e.preventDefault();
        this.toast('Template downloaded', 'info');
      };
    }
  }

  private exportModal(): void {
    this.modal({
      title: 'Export OPD Patients',
      icon: 'icon-download',
      accent: 'opd-c-emerald',
      confirm: 'Export',
      body:
        '<label class="opd-lbl">Format</label><div class="grid grid-cols-4 gap-2 mb-3">' +
        ['CSV', 'Excel', 'PDF', 'Print']
          .map(
            (f, i) =>
              `<label class="flex items-center justify-center gap-1 rounded-lg border border-border-color p-2 cursor-pointer text-xs font-bold text-gray-700 dark:text-gray-300"><input type="radio" name="opd-exf" value="${f}"${i === 0 ? ' checked' : ''} class="accent-primary">${f}</label>`
          )
          .join('') +
        '</div><label class="opd-lbl">Records</label><div class="space-y-2">' +
        (
          [
            ['all', 'All records'],
            ['filtered', 'Current filters'],
            ['selected', `Selected (${this.selN()})`],
          ] as [string, string][]
        )
          .map(
            (o, i) =>
              `<label class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 cursor-pointer text-sm text-gray-700 dark:text-gray-300"><input type="radio" name="opd-exs" value="${o[0]}"${i === 0 ? ' checked' : ''} class="accent-primary">${o[1]}</label>`
          )
          .join('') +
        '</div>',
      onConfirm: () => {
        const f = (this.qs('input[name="opd-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const s = (this.qs('input[name="opd-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
        if (f === 'Print') {
          this.toast('Opening print…', 'info');
          setTimeout(() => window.print(), 400);
        } else {
          this.toast(`Exported ${s} as ${f}`);
        }
      },
    });
  }

  private clearFilters(): void {
    this.state.q = '';
    this.state.dept = '';
    this.state.status = '';
    this.state.adv = {};
    this.state.page = 1;
    const search = this.byId('opd-search') as HTMLInputElement | null;
    if (search) search.value = '';
    const fdept = this.byId('opd-f-dept') as HTMLSelectElement | null;
    if (fdept) fdept.value = '';
    const fstatus = this.byId('opd-f-status') as HTMLSelectElement | null;
    if (fstatus) fstatus.value = '';
    this.byId('opd-filter-badge')?.classList.add('hidden');
    this.render();
  }

  /* ---------------- wiring ---------------- */

  private on(id: string, ev: string, fn: (e: Event) => void): void {
    const el = this.byId(id);
    if (el) el.addEventListener(ev, fn);
  }

  private wireToolbar(): void {
    this.on('opd-search', 'input', (e) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('opd-f-dept', 'change', (e) => {
      this.state.dept = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('opd-f-status', 'change', (e) => {
      this.state.status = (e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('opd-sort', 'change', (e) => {
      this.state.sort = (e.target as HTMLSelectElement).value;
      this.render();
    });
    this.on('opd-refresh', 'click', () => {
      this.toast('Refreshed');
      const updated = this.byId('opd-updated');
      if (updated) updated.textContent = 'just now';
      this.buildKPIs();
      this.render();
    });
    this.on('opd-import', 'click', () => this.importModal());
    this.on('opd-export', 'click', () => this.exportModal());
    this.on('opd-print', 'click', () => {
      this.toast('Printing OPD list…', 'info');
      setTimeout(() => window.print(), 400);
    });
    this.on('opd-filters', 'click', () => {
      this.byId('opd-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.on('opd-size', 'change', (e) => {
      this.state.size = +(e.target as HTMLSelectElement).value;
      this.state.page = 1;
      this.render();
    });
    this.on('opd-jump', 'change', (e) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.state.page = v;
        this.render();
      }
    });
    this.on('opd-empty-clear', 'click', () => this.clearFilters());
  }

  private wirePageNav(): void {
    this.byId('opd-page-nav')?.addEventListener('click', (e: Event) => {
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
    this.on('opd-select-all', 'change', selectAll);
    this.on('opd-select-all-2', 'change', selectAll);
  }

  private wireGridDelegation(): void {
    const grid = this.byId('opd-gridview');
    if (!grid) return;
    grid.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const mb = target.closest('.opd-menu-btn') as HTMLElement | null;
      if (mb) {
        e.stopPropagation();
        this.showMenu(mb, +(mb.getAttribute('data-id') || 0));
        return;
      }
      const st = target.closest('.opd-start') as HTMLElement | null;
      if (st) {
        this.rowAction('start', +(st.getAttribute('data-id') || 0));
        return;
      }
      const v = target.closest('.opd-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const ed = target.closest('.opd-edit') as HTMLElement | null;
      if (ed) {
        this.rowAction('edit', +(ed.getAttribute('data-id') || 0));
        return;
      }
      const ch = target.closest('.opd-rowcheck') as HTMLInputElement | null;
      if (ch) {
        const id = +(ch.getAttribute('data-id') || 0);
        if (ch.checked) this.state.sel[id] = true;
        else delete this.state.sel[id];
        this.render();
        return;
      }
      if (target.closest('a,button,input')) return;
      const card = target.closest('.opd-card') as HTMLElement | null;
      if (card) this.openDetail(+(card.getAttribute('data-id') || 0));
    });
  }

  private wireWidgetsDelegation(): void {
    const page = this.byId('opd-page');
    if (!page) return;
    page.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const v = target.closest('#opd-recentwidget .opd-view') as HTMLElement | null;
      if (v) {
        this.openDetail(+(v.getAttribute('data-id') || 0));
        return;
      }
      const d = target.closest('[data-docact]') as HTMLElement | null;
      if (d) {
        const doc = d.getAttribute('data-doc') || '';
        const act = d.getAttribute('data-docact');
        if (act === 'view') {
          this.toast(`Opening ${doc}'s board`, 'info');
          return;
        }
        this.modal({
          title: `Assign to ${doc}`,
          icon: 'icon-user-cog',
          accent: 'opd-c-violet',
          confirm: 'Assign',
          body: this.sel(
            'Select patient',
            'da-p',
            this.data.filter((r) => r.status === 'Waiting').map((r) => r.name)
          ),
          onConfirm: () => this.toast(`Patient assigned to ${doc}`),
        });
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
        if (k === 'book') return this.openForm('book');
        if (k === 'token') return this.tokenManager();
        if (k === 'export') return this.exportModal();
      }
      const ac = target.closest('[data-act]') as HTMLElement | null;
      if (ac) {
        const a = ac.getAttribute('data-act');
        if (a === 'print-list') {
          this.toast('Preparing OPD list…', 'info');
          setTimeout(() => window.print(), 400);
        } else if (a === 'call-next') {
          this.callNext();
        }
      }
      if (target.closest('[data-close]')) {
        this.closeModal();
        this.qsa<HTMLElement>('.opd-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
      const da = target.closest('[data-da]') as HTMLElement | null;
      if (da) {
        this.byId('opd-detail-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.rowAction(da.getAttribute('data-da') || '', +(da.getAttribute('data-id') || 0));
      }
      if (this.menu && !this.menu.contains(target) && !target.closest('.opd-menu-btn,#opd-cols')) this.closeMenu();
    });
  }

  private wireModalDismiss(): void {
    this.byId('opd-modal')?.addEventListener('mousedown', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target === this.byId('opd-modal') || target.classList.contains('opd-modal-back')) this.closeModal();
    });
  }

  private wireBulkBar(): void {
    this.byId('opd-bulkbar')?.addEventListener('click', (e: Event) => {
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
        this.qsa<HTMLElement>('.opd-drawer.open').forEach((dr) => dr.classList.remove('open'));
      }
    });
  }

  private wireFilterDrawer(): void {
    this.on('fd-apply', 'click', () => {
      this.state.adv = {
        doctor: (this.byId('fd-doctor') as HTMLSelectElement | null)?.value || '',
        visit: (this.byId('fd-visit') as HTMLSelectElement | null)?.value || '',
        queue: (this.byId('fd-queue') as HTMLSelectElement | null)?.value || '',
        ins: (this.byId('fd-ins') as HTMLSelectElement | null)?.value || '',
        token: (this.byId('fd-token') as HTMLInputElement | null)?.value || '',
        from: (this.byId('fd-from') as HTMLInputElement | null)?.value || '',
        to: (this.byId('fd-to') as HTMLInputElement | null)?.value || '',
      };
      const n = Object.keys(this.state.adv).filter((k) => this.state.adv[k]).length;
      const badge = this.byId('opd-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.state.page = 1;
      this.byId('opd-filter-drawer')?.classList.remove('open');
      this.document.body.style.overflow = '';
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
    });
    this.on('fd-reset', 'click', () => {
      this.qsa<HTMLInputElement | HTMLSelectElement>('#opd-filter-drawer select,#opd-filter-drawer input').forEach((i) => (i.value = ''));
      this.state.adv = {};
      this.byId('opd-filter-badge')?.classList.add('hidden');
      this.render();
    });
  }
}
