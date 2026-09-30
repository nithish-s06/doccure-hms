import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface Surgeon {
  id: number;
  name: string;
  spec: string;
  specIc: string;
  specC: string;
  dept: string;
  qual: string;
  exp: number;
  status: string;
  today: number;
  succ: number;
  rating: number;
  av: string;
  total: number;
  dur: number;
  sat: number;
  comp: number;
  recov: number;
  photo: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-surgeons',
  styleUrl: './surgeons.css',
  templateUrl: './surgeons.html',
})
export class Surgeons implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STL: Record<string, string> = { avail: 'Available', surgery: 'In Surgery', oncall: 'On Call', off: 'Off Duty', leave: 'On Leave', emerg: 'Emergency Duty' };
  private readonly STC: Record<string, string> = { avail: '#15803d', surgery: '#e06c1f', oncall: '#1d4ed8', off: '#64748b', leave: '#7c3aed', emerg: '#dc2626' };
  private readonly SPECS: [string, string, string][] = [
    ['Cardiac Surgery', 'icon-heart-pulse', '#dc2626'], ['Neuro Surgery', 'icon-brain', '#7c3aed'], ['Orthopedic Surgery', 'icon-bone', '#e06c1f'],
    ['General Surgery', 'icon-slice', '#0f766e'], ['Plastic Surgery', 'icon-sparkles', '#be185d'], ['Pediatric Surgery', 'icon-baby', '#1d4ed8'],
    ['ENT Surgery', 'icon-ear', '#0e7490'], ['Urology', 'icon-droplet', '#b45309'],
  ];
  private readonly DEPTS = ['Cardiology', 'Neurosciences', 'Orthopedics', 'General Surgery', 'Cosmetic', 'Pediatrics', 'ENT', 'Urology'];
  private readonly QUAL = ['MBBS, MS, MCh', 'MBBS, MS', 'MBBS, DNB', 'MBBS, MS, DrNB', 'MBBS, MS, FRCS'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly PROCS = ['CABG', 'Knee Replacement', 'Craniotomy', 'Appendectomy', 'Angioplasty', 'Hip Replacement'];
  private readonly ROOMS = ['OT-01', 'OT-02', 'Cardiac OT', 'Neuro OT'];

  private readonly ACTIONS: [string, string, string][] = [
    ['View Profile', 'icon-eye', 'view'], ['Edit', 'icon-edit', 'edit'], ['Assign Surgery', 'icon-slice', 'assign'], ['Assign OT', 'icon-layout-grid', 'allocate'],
    ['View Schedule', 'icon-calendar', 'schedule'], ['Performance', 'icon-chart-column', 'perf'], ['Contact', 'icon-phone', 'contact'], ['sep', '', ''],
    ['Print Profile', 'icon-printer', 'print'], ['Download PDF', 'icon-file-down', 'pdf'], ['Archive', 'icon-archive', 'archive'], ['Delete', 'icon-trash-2', 'delete'],
  ];
  private readonly SIMPLE: Record<string, string> = { perf: 'Loading performance...', contact: 'Opening contact...', print: 'Printing profile...', pdf: 'PDF downloaded', archive: 'Surgeon archived' };

  private SURG: Surgeon[] = [
    { id: 0, name: 'Dr. Arjun Mehta', spec: 'Cardiac Surgery', specIc: 'icon-heart-pulse', specC: '#dc2626', dept: 'Cardiology', qual: 'MBBS, MS, MCh', exp: 13, status: 'avail', today: 2, succ: 90, rating: 4.9, av: '#475569', total: 757, dur: 106, sat: 96, comp: 3, recov: 90, photo: 'assets/img/doctor/doctor-02.jpg' },
    { id: 1, name: 'Dr. Sneha Khan', spec: 'Neuro Surgery', specIc: 'icon-brain', specC: '#7c3aed', dept: 'Neurosciences', qual: 'MBBS, MS', exp: 19, status: 'surgery', today: 0, succ: 88, rating: 4.3, av: '#0f766e', total: 504, dur: 157, sat: 91, comp: 2.4, recov: 92, photo: 'assets/img/doctor/doctor-03.jpg' },
    { id: 2, name: 'Dr. Rahul Sharma', spec: 'Orthopedic Surgery', specIc: 'icon-bone', specC: '#e06c1f', dept: 'Orthopedics', qual: 'MBBS, DNB', exp: 9, status: 'oncall', today: 3, succ: 89, rating: 4.7, av: '#1e40af', total: 2048, dur: 163, sat: 97, comp: 3.4, recov: 99, photo: 'assets/img/doctor/doctor-05.jpg' },
    { id: 3, name: 'Dr. Leela Das', spec: 'General Surgery', specIc: 'icon-slice', specC: '#0f766e', dept: 'General Surgery', qual: 'MBBS, MS, DrNB', exp: 7, status: 'avail', today: 4, succ: 99, rating: 4.3, av: '#4338ca', total: 571, dur: 163, sat: 89, comp: 2.5, recov: 95, photo: 'assets/img/doctor/doctor-04.jpg' },
    { id: 4, name: 'Dr. Priya Nair', spec: 'Plastic Surgery', specIc: 'icon-sparkles', specC: '#be185d', dept: 'Cosmetic', qual: 'MBBS, MS, FRCS', exp: 12, status: 'off', today: 0, succ: 88, rating: 4.8, av: '#0e7490', total: 889, dur: 136, sat: 97, comp: 1.8, recov: 91, photo: 'assets/img/doctor/doctor-01.jpg' },
    { id: 5, name: 'Dr. Vikram Iyer', spec: 'Pediatric Surgery', specIc: 'icon-baby', specC: '#1d4ed8', dept: 'Pediatrics', qual: 'MBBS, MS, MCh', exp: 26, status: 'leave', today: 3, succ: 97, rating: 4.9, av: '#334155', total: 1719, dur: 136, sat: 90, comp: 2.2, recov: 91, photo: 'assets/img/doctor/doctor-08.jpg' },
    { id: 6, name: 'Dr. Kavya Menon', spec: 'ENT Surgery', specIc: 'icon-ear', specC: '#0e7490', dept: 'ENT', qual: 'MBBS, MS', exp: 6, status: 'avail', today: 3, succ: 91, rating: 4.4, av: '#3f6212', total: 423, dur: 189, sat: 91, comp: 4.1, recov: 91, photo: 'assets/img/doctor/doctor-06.jpg' },
    { id: 7, name: 'Dr. Deepak Kapoor', spec: 'Urology', specIc: 'icon-droplet', specC: '#b45309', dept: 'Urology', qual: 'MBBS, DNB', exp: 18, status: 'surgery', today: 0, succ: 92, rating: 4.5, av: '#7c2d12', total: 1483, dur: 109, sat: 90, comp: 1.4, recov: 92, photo: 'assets/img/doctor/doctor-09.jpg' },
    { id: 8, name: 'Dr. Nisha Rao', spec: 'Cardiac Surgery', specIc: 'icon-heart-pulse', specC: '#dc2626', dept: 'Cardiology', qual: 'MBBS, MS, DrNB', exp: 12, status: 'oncall', today: 3, succ: 92, rating: 4.9, av: '#475569', total: 1004, dur: 170, sat: 91, comp: 2.9, recov: 93, photo: 'assets/img/doctor/doctor-10.jpg' },
    { id: 9, name: 'Dr. Rohan Reddy', spec: 'Neuro Surgery', specIc: 'icon-brain', specC: '#7c3aed', dept: 'Neurosciences', qual: 'MBBS, MS, FRCS', exp: 28, status: 'avail', today: 3, succ: 98, rating: 4.6, av: '#0f766e', total: 2093, dur: 96, sat: 89, comp: 3.4, recov: 92, photo: 'assets/img/doctor/doctor-12.jpg' },
    { id: 10, name: 'Dr. Anil Mehta', spec: 'Orthopedic Surgery', specIc: 'icon-bone', specC: '#e06c1f', dept: 'Orthopedics', qual: 'MBBS, MS, MCh', exp: 17, status: 'emerg', today: 2, succ: 89, rating: 4.5, av: '#1e40af', total: 382, dur: 183, sat: 91, comp: 1.3, recov: 92, photo: 'assets/img/doctor/doctor-13.jpg' },
    { id: 11, name: 'Dr. Meera Khan', spec: 'General Surgery', specIc: 'icon-slice', specC: '#0f766e', dept: 'General Surgery', qual: 'MBBS, MS', exp: 28, status: 'avail', today: 2, succ: 90, rating: 4.4, av: '#4338ca', total: 954, dur: 186, sat: 98, comp: 4, recov: 94, photo: 'assets/img/doctor/doctor-11.jpg' },
  ];

  private sel = new Set<number>();
  private focusId = 0;
  private view: 'grid' | 'compact' | 'list' = 'grid';
  private q = '';
  private fSpec = '';
  private fStatus = '';
  private sort = '';
  private MODALS: Record<string, { t: string; sub: string; ic: string; body: string; cta: string }> = {};
  private clockTimer: any;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.buildModals();
    this.wireEvents();
    setTimeout(() => {
      this.byId('sg-skeleton')?.classList.add('hidden');
      this.byId('sg-content')?.classList.remove('hidden');
      this.animateRings();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(sel: string, r?: ParentNode): T[] {
    return Array.prototype.slice.call((r || this.document).querySelectorAll(sel));
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private toast(msg: string, _icon?: string): void {
    this.toastService.show(msg, 'success');
  }

  private clock(): void {
    const el = this.byId('sg-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  private detailUrl(s: Surgeon): string {
    return 'surgeon-profile.html?' + new URLSearchParams({ id: String(s.id), name: s.name, spec: s.spec, dept: s.dept, status: s.status }).toString();
  }

  private stars(r: number): string {
    const full = Math.round(r);
    return Array.from({ length: 5 }, (_, i) => `<i class="icon-star text-[11px]" style="color:${i < full ? '#f59e0b' : 'var(--sg-soft)'}"></i>`).join('');
  }

  private filtered(): Surgeon[] {
    let r = this.SURG.filter((s) => {
      if (this.q) {
        const t = this.q.toLowerCase();
        if (!(s.name.toLowerCase().includes(t) || s.spec.toLowerCase().includes(t) || s.dept.toLowerCase().includes(t))) return false;
      }
      if (this.fSpec && s.spec !== this.fSpec) return false;
      if (this.fStatus && s.status !== this.fStatus) return false;
      return true;
    });
    if (this.sort === 'name') r.sort((a, b) => a.name.localeCompare(b.name));
    else if (this.sort === 'succ') r.sort((a, b) => b.succ - a.succ);
    else if (this.sort === 'exp') r.sort((a, b) => b.exp - a.exp);
    else if (this.sort === 'rating') r.sort((a, b) => b.rating - a.rating);
    return r;
  }

  /* ---------------- hero counts ---------------- */

  private updateCounts(): void {
    const activeEl = this.byId('sg-h-active');
    if (activeEl) activeEl.textContent = String(this.SURG.filter((s) => s.status !== 'off' && s.status !== 'leave').length);
    const surgEl = this.byId('sg-h-surg');
    if (surgEl) surgEl.textContent = String(this.SURG.reduce((a, s) => a + s.today, 0));
    const availEl = this.byId('sg-h-avail');
    if (availEl) availEl.textContent = String(this.SURG.filter((s) => s.status === 'avail').length);
    const oncallEl = this.byId('sg-h-oncall');
    if (oncallEl) oncallEl.textContent = String(this.SURG.filter((s) => s.status === 'oncall' || s.status === 'emerg').length);
    const succEl = this.byId('sg-h-succ');
    if (succEl) succEl.textContent = Math.round(this.SURG.reduce((a, s) => a + s.succ, 0) / this.SURG.length) + '%';
  }

  /* ---------------- directory ---------------- */

  private docCard(s: Surgeon): string {
    const live = s.status === 'surgery' || s.status === 'oncall' || s.status === 'emerg';
    return `<div class="sg-doc stt-${s.status}" data-doc="${s.id}">
                <div class="sg-doc-banner">
                    <label onclick="event.stopPropagation()" class="absolute top-2.5 left-2.5 z-10"><input type="checkbox" data-sel="${s.id}" ${this.sel.has(s.id) ? 'checked' : ''} class="accent-[var(--sg-c)]"></label>
                    <button data-menu="${s.id}" onclick="event.stopPropagation()" class="sg-doc-menubtn absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center"><i class="icon-more-vertical text-sm"></i></button>
                </div>
                <div class="px-4 pb-4 -mt-8">
                    <div class="flex items-end justify-between">
                        <div class="sg-avatar-ring"><img class="sg-avatar" style="width:54px;height:54px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot${live ? ' pulse' : ''} absolute -bottom-0.5 -right-0.5" style="background:${this.STC[s.status]}"></span></div>
                        <span class="sg-chip mb-1.5" style="background:color-mix(in srgb,${this.STC[s.status]} 14%,transparent);color:${this.STC[s.status]}">${live ? '<span class="sg-dot sg-live" style="background:' + this.STC[s.status] + '"></span>' : ''}${this.STL[s.status]}</span>
                    </div>
                    <p class="sg-doc-name mt-2.5"><a href="${this.detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p>
                    <span class="sg-spec-pill mt-1.5" style="background:color-mix(in srgb,${s.specC} 13%,transparent);color:${s.specC}"><i class="${s.specIc} text-[11px]"></i> ${s.spec}</span>
                    <p class="text-[11px] sg-mut mt-1.5">${s.dept} · ${s.qual}</p>
                    <div class="flex items-center gap-1.5 mt-2">${this.stars(s.rating)}<span class="sg-rating-num">${s.rating.toFixed(1)}</span></div>
                    <div class="sg-stat-row mt-3">
                        <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,var(--sg-c) 14%,transparent);color:var(--sg-c)"><i class="icon-briefcase"></i></span><p class="sg-stat-val sg-head">${s.exp}y</p><p class="sg-stat-lbl">Experience</p></div>
                        <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,#e06c1f 14%,transparent);color:#e06c1f"><i class="icon-calendar-check"></i></span><p class="sg-stat-val" style="color:#e06c1f">${s.today}</p><p class="sg-stat-lbl">Today</p></div>
                        <div class="sg-stat"><span class="sg-stat-ic" style="background:color-mix(in srgb,#15803d 14%,transparent);color:#15803d"><i class="icon-trending-up"></i></span><p class="sg-stat-val" style="color:#15803d">${s.succ}%</p><p class="sg-stat-lbl">Success</p></div>
                    </div>
                    <div class="flex gap-2 mt-3.5">
                        <a href="${this.detailUrl(s)}" onclick="event.stopPropagation()" class="sg-btn sg-btn-primary flex-1 justify-center !py-2 text-xs"><i class="icon-eye"></i> Profile</a>
                        <button data-modal="assign" onclick="event.stopPropagation()" title="Assign Surgery" class="sg-btn sg-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-slice"></i></button>
                        <button data-modal="allocate" onclick="event.stopPropagation()" title="Assign OT" class="sg-btn sg-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-layout-grid"></i></button>
                    </div>
                </div>
            </div>`;
  }

  private compactCard(s: Surgeon): string {
    return `<div class="sg-doc stt-${s.status} p-3" data-doc="${s.id}">
                <div class="flex items-center gap-2.5">
                    <div class="relative flex-none"><img class="sg-avatar round" style="width:42px;height:42px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot absolute -bottom-0.5 -right-0.5" style="background:${this.STC[s.status]}"></span></div>
                    <div class="min-w-0 flex-1"><p class="text-sm font-bold sg-head truncate"><a href="${this.detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p><p class="text-[11px] truncate" style="color:${s.specC}">${s.spec}</p></div>
                    <button data-menu="${s.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut"><i class="icon-more-vertical text-sm"></i></button>
                </div>
                <div class="flex items-center justify-between mt-2 text-[11px]"><span class="sg-chip" style="background:color-mix(in srgb,${this.STC[s.status]} 13%,transparent);color:${this.STC[s.status]}">${this.STL[s.status]}</span><span class="sg-mut">${s.today} today · ${s.succ}%</span></div>
            </div>`;
  }

  private listRow(s: Surgeon): string {
    return `<div class="sg-row stt-${s.status}" data-doc="${s.id}" style="cursor:pointer">
                <label onclick="event.stopPropagation()"><input type="checkbox" data-sel="${s.id}" ${this.sel.has(s.id) ? 'checked' : ''} class="accent-[var(--sg-c)]"></label>
                <div class="flex items-center gap-2.5 min-w-0"><img class="sg-avatar round flex-none" style="width:36px;height:36px" src="${s.photo}" alt="${s.name}"><div class="min-w-0"><p class="text-sm font-semibold sg-head truncate"><a href="${this.detailUrl(s)}" onclick="event.stopPropagation()" class="hover:text-[var(--sg-accent)] hover:underline">${s.name}</a></p><p class="text-[11px] sg-mut truncate">${s.qual}</p></div></div>
                <div class="text-xs"><p class="font-medium" style="color:${s.specC}">${s.spec}</p><p class="sg-mut">${s.dept}</p></div>
                <div class="text-xs sg-head">${s.exp}y exp<p class="sg-mut">${s.today} today</p></div>
                <div><span class="sg-chip" style="background:color-mix(in srgb,${this.STC[s.status]} 13%,transparent);color:${this.STC[s.status]}">${this.STL[s.status]}</span></div>
                <button data-menu="${s.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut justify-self-end"><i class="icon-more-vertical"></i></button>
            </div>`;
  }

  private renderDirectory(): void {
    const list = this.filtered();
    const cnt = this.byId('sg-count');
    if (cnt) cnt.textContent = String(list.length);
    const host = this.byId('sg-directory');
    if (!host) return;
    if (this.view === 'list') {
      host.innerHTML = `<div class="sg-card overflow-hidden"><div class="sg-row !py-2 text-[10px] uppercase tracking-wide sg-mut font-bold"><span></span><span>Surgeon</span><span>Specialty</span><span>Workload</span><span>Status</span><span></span></div>${list.map((s) => this.listRow(s)).join('') || '<p class="text-sm sg-mut text-center py-6">No surgeons found.</p>'}</div>`;
    } else if (this.view === 'compact') {
      host.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((s) => this.compactCard(s)).join('')}</div>`;
    } else {
      host.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((s) => this.docCard(s)).join('') || '<p class="text-sm sg-mut text-center py-6 col-span-4">No surgeons found.</p>'}</div>`;
    }
  }

  /* ---------------- performance ---------------- */

  private ring(p: number, color: string, label: string, val: string | number): string {
    return `<div class="sg-panel p-3 flex flex-col items-center text-center">
                <div class="relative w-16 h-16"><svg viewBox="0 0 36 36" class="sg-ring w-16 h-16"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--sg-track)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${p}"/></svg><span class="absolute inset-0 flex items-center justify-center text-xs font-bold" style="color:${color}">${val}</span></div>
                <p class="text-[11px] font-semibold sg-head mt-1.5">${label}</p></div>`;
  }

  private renderPerformance(): void {
    const s = this.SURG.find((x) => x.id === this.focusId) || this.SURG[0];
    this.focusId = s.id;
    const nameEl = this.byId('sg-perf-name');
    if (nameEl) nameEl.textContent = s.name;
    const host = this.byId('sg-performance');
    if (host) {
      host.innerHTML = [
        this.ring(s.succ, '#15803d', 'Success Rate', s.succ + '%'),
        this.ring(Math.min(100, Math.round(s.total / 25)), '#1d4ed8', 'Total Surgeries', s.total > 999 ? (s.total / 1000).toFixed(1) + 'k' : s.total),
        this.ring(Math.round(100 - s.dur / 3), '#0f766e', 'Avg Duration', s.dur + 'm'),
        this.ring(s.sat, '#e06c1f', 'Satisfaction', s.sat + '%'),
        this.ring(Math.round(100 - s.comp * 15), '#b45309', 'Low Complication', s.comp + '%'),
        this.ring(s.recov, '#7c3aed', 'Recovery Rate', s.recov + '%'),
      ].join('');
    }
  }

  private animateRings(): void {
    this.qsa<HTMLElement>('.sg-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  /* ---------------- schedule ---------------- */

  private renderSchedule(): void {
    const s = this.SURG.find((x) => x.id === this.focusId) || this.SURG[0];
    const nameEl = this.byId('sg-sched-name');
    if (nameEl) nameEl.textContent = s.name;
    const times = ['08:00', '10:30', '13:00', '15:30'];
    const cols = ['#e06c1f', '#1d4ed8', '#0f766e', '#15803d'];
    const nurses = ['N. Das', 'Dr. Menon', 'N. Pillai', 'N. Sharma'];
    const host = this.byId('sg-schedule');
    if (host) {
      host.innerHTML = times
        .map((t, i) => `<div class="sg-tl-item" style="--tc:${cols[i]}"><div class="flex items-start gap-2"><div class="min-w-0 flex-1"><p class="text-sm font-semibold sg-head">${this.PROCS[i % this.PROCS.length]}</p><p class="text-[11px] sg-mut">${this.ROOMS[i % this.ROOMS.length]} · with ${nurses[i]}</p></div><span class="text-[11px] sg-mut whitespace-nowrap">${t}</span></div></div>`)
        .join('');
    }
  }

  /* ---------------- specialties ---------------- */

  private renderSpecialties(): void {
    const host = this.byId('sg-specialties');
    if (!host) return;
    host.innerHTML = this.SPECS.map((sp) => {
      const list = this.SURG.filter((s) => s.spec === sp[0]);
      return `<div class="sg-spec" style="--sv:${sp[2]}" data-spec="${sp[0]}">
                <div class="flex items-center justify-between mb-1.5"><span class="sg-iconbadge w-8 h-8" style="color:${sp[2]}"><i class="${sp[1]}"></i></span><span class="sg-chip" style="background:color-mix(in srgb,${sp[2]} 13%,transparent);color:${sp[2]}">${list.length}</span></div>
                <p class="text-sm font-bold sg-head leading-tight">${sp[0]}</p>
                <p class="text-[11px] sg-mut mt-0.5">${list.reduce((a, s) => a + s.today, 0)} surgeries today</p>
            </div>`;
    }).join('');
  }

  /* ---------------- drawer ---------------- */

  private drawerHost(): HTMLElement {
    let d = this.byId('sg-drawer');
    if (!d) {
      d = this.document.createElement('div');
      d.id = 'sg-drawer';
      d.className = 'sg-drawer';
      this.document.body.appendChild(d);
    }
    return d;
  }

  private syncBodyLock(): void {
    const drawerOpen = this.byId('sg-drawer')?.classList.contains('open');
    const modalHtml = this.byId('sg-modalhost')?.innerHTML.trim();
    this.document.body.style.overflow = drawerOpen || modalHtml ? 'hidden' : '';
  }

  private openDrawer(id: number): void {
    const s = this.SURG.find((x) => x.id === id);
    if (!s) return;
    const box = (t: string, ic: string, body: string) => `<div class="sg-panel p-3"><p class="text-[11px] font-bold sg-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} sg-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-0.5"><span class="sg-mut">${k}</span><span class="font-medium sg-head">${v}</span></div>`;
    const host = this.drawerHost();
    host.innerHTML = `
              <div class="sg-doc-banner stt-${s.status}" style="height:80px;border-radius:0"></div>
              <div class="px-4 -mt-8">
                <div class="flex items-end justify-between">
                    <div class="relative"><img class="sg-avatar" style="width:64px;height:64px" src="${s.photo}" alt="${s.name}"><span class="sg-statusdot absolute bottom-0 right-0" style="width:16px;height:16px;background:${this.STC[s.status]}"></span></div>
                    <button data-close class="w-8 h-8 rounded-lg bg-[var(--sg-surface)] border flex items-center justify-center sg-mut mb-1" style="border-color:var(--sg-border)"><i class="icon-x"></i></button>
                </div>
                <p class="font-bold text-lg sg-head mt-2">${s.name}</p>
                <p class="text-sm font-medium" style="color:${s.specC}"><i class="${s.specIc} text-[12px]"></i> ${s.spec}</p>
                <p class="text-[11px] sg-mut">${s.dept} · ${s.qual}</p>
                <div class="flex items-center gap-2 mt-1.5">${this.stars(s.rating)}<span class="text-[11px] sg-mut">${s.rating.toFixed(1)} rating</span><span class="sg-chip ml-auto" style="background:color-mix(in srgb,${this.STC[s.status]} 13%,transparent);color:${this.STC[s.status]}">${this.STL[s.status]}</span></div>
              </div>
              <div class="p-4 space-y-3">
                <div class="grid grid-cols-3 gap-2 text-center">
                    <div class="sg-panel py-2"><p class="text-lg font-bold sg-head">${s.exp}y</p><p class="text-[10px] sg-mut">Experience</p></div>
                    <div class="sg-panel py-2"><p class="text-lg font-bold" style="color:#15803d">${s.succ}%</p><p class="text-[10px] sg-mut">Success</p></div>
                    <div class="sg-panel py-2"><p class="text-lg font-bold" style="color:#e06c1f">${s.total > 999 ? (s.total / 1000).toFixed(1) + 'k' : s.total}</p><p class="text-[10px] sg-mut">Surgeries</p></div>
                </div>
                ${box('Professional', 'icon-award', row('Qualification', s.qual) + row('Department', s.dept) + row('Experience', s.exp + ' years') + row('Specialty', s.spec))}
                ${box('Performance', 'icon-chart-column', row('Avg Duration', s.dur + ' min') + row('Satisfaction', s.sat + '%') + row('Complication', s.comp + '%') + row('Recovery', s.recov + '%'))}
                ${box("Today's Workload", 'icon-calendar-clock', row('Scheduled', s.today + ' surgeries') + row('Status', this.STL[s.status]) + row('Next Case', s.today ? '08:00 · ' + this.PROCS[s.id % this.PROCS.length] : 'None'))}
                ${box('Contact', 'icon-phone', row('Extension', '+91 80 4567 ' + (1000 + s.id)) + row('Email', s.name.replace('Dr. ', '').split(' ')[0].toLowerCase() + '@dreamscare.health'))}
                <div class="grid grid-cols-2 gap-2">
                    <button data-modal="assign" class="sg-btn sg-btn-primary justify-center"><i class="icon-slice"></i> Assign Surgery</button>
                    <button data-modal="allocate" class="sg-btn sg-btn-ghost justify-center"><i class="icon-layout-grid"></i> Assign OT</button>
                    <button data-modal="leave" class="sg-btn sg-btn-ghost justify-center"><i class="icon-calendar"></i> Leave</button>
                    <button data-modal="edit" class="sg-btn sg-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
                </div>
              </div>`;
    host.classList.add('open');
    this.syncBodyLock();
  }

  private closeDrawer(): void {
    this.byId('sg-drawer')?.classList.remove('open');
    this.syncBodyLock();
  }

  /* ---------------- menu ---------------- */

  private menuHost(): HTMLElement {
    let m = this.byId('sg-menuhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'sg-menuhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="sg-menu" id="sg-openmenu">${this.ACTIONS.map((a) => (a[0] === 'sep' ? '<div class="sg-menu-sep"></div>' : `<button data-action="${a[2]}" data-sid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`)).join('')}</div>`;
    const m = this.byId('sg-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('sg-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ---------------- modals ---------------- */

  private buildModals(): void {
    const fld = (l: string, el: string) => `<div><label class="sg-formlabel">${l}</label>${el}</div>`;
    const inp = (ph?: string) => `<input class="sg-in mt-1" placeholder="${ph || ''}">`;
    const selE = (o: string[]) => `<select class="sg-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
    const drop = (t: string) => `<div class="sg-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--sg-hover)]"><i class="icon-cloud-upload text-3xl sg-mut"></i><p class="text-sm font-semibold mt-1 sg-head">${t}</p></div>`;
    const names = this.SURG.map((s) => s.name);
    this.MODALS = {
      add: { t: 'Add Surgeon', sub: 'Onboard a surgical specialist', ic: 'icon-user-plus', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Full Name', inp('Dr. ...'))}${fld('Specialty', selE(this.SPECS.map((s) => s[0])))}${fld('Department', selE(this.DEPTS))}${fld('Qualification', selE(this.QUAL))}${fld('Experience (yrs)', inp('12'))}${fld('Registration No.', inp('MCI-...'))}${fld('Contact', inp('+91 ...'))}${fld('Email', inp('name@dreamscare.health'))}</div>`, cta: 'Add Surgeon' },
      edit: { t: 'Edit Surgeon', sub: 'Update surgeon profile', ic: 'icon-edit', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Specialty', selE(this.SPECS.map((s) => s[0])))}${fld('Department', selE(this.DEPTS))}${fld('Status', selE(Object.values(this.STL)))}${fld('Experience', inp('12'))}</div>`, cta: 'Save Changes' },
      assign: { t: 'Assign Surgery', sub: 'Assign a case to the surgeon', ic: 'icon-slice', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon', selE(names))}${fld('Procedure', selE(this.PROCS))}${fld('Patient / MRN', inp('Search...'))}${fld('OT Room', selE(this.ROOMS))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Priority', selE(['Routine', 'Medium', 'High', 'Emergency']))}</div>`, cta: 'Assign Surgery' },
      allocate: { t: 'Assign OT', sub: 'Allocate a theater', ic: 'icon-layout-grid', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon', selE(names))}${fld('OT Room', selE(this.ROOMS))}${fld('Slot', selE(['08:00', '10:30', '13:00', '15:30']))}${fld('Duration (h)', inp('2'))}</div>`, cta: 'Assign OT' },
      leave: { t: 'Schedule Leave', sub: 'Plan surgeon time off', ic: 'icon-calendar', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Surgeon', selE(names))}${fld('Type', selE(['Annual', 'Sick', 'Conference', 'Emergency']))}${fld('From', `<input type="text" placeholder="dd-mm-yyyy" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}${fld('To', `<input type="text" placeholder="dd-mm-yyyy" class="sg-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}</div><div class="mt-3">${fld('Cover Surgeon', selE(names))}</div>`, cta: 'Schedule Leave' },
      schedule: { t: 'View Schedule', sub: 'Weekly operating schedule', ic: 'icon-calendar', body: `<div class="space-y-2">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => `<div class="sg-panel p-2.5 flex items-center justify-between"><span class="text-sm font-medium sg-head">${d}</span><span class="text-[11px] sg-mut">${this.rnd(0, 4)} surgeries · ${this.ROOMS[i % this.ROOMS.length]}</span></div>`).join('')}</div>`, cta: 'Close' },
      import: { t: 'Import', sub: 'Bulk-load surgeon records', ic: 'icon-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Staff Directory'].map((f) => `<span class="sg-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--sg-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 12 surgeons · 0 errors</div>`, cta: 'Import' },
      export: { t: 'Export', sub: 'Export the surgeon directory', ic: 'icon-download', body: `<p class="text-xs sg-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV', 'Excel', 'PDF', 'Print', 'Directory Report', 'Performance Report', 'Schedule Report', 'Selected', 'All Records'].map((f) => `<button data-expfmt="${f}" class="sg-btn sg-btn-ghost justify-center">${f}</button>`).join('')}</div>`, cta: 'Export' },
    };
  }

  private modalHost(): HTMLElement {
    let m = this.byId('sg-modalhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'sg-modalhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    const host = this.modalHost();
    host.innerHTML = `<div class="sg-modal-wrap open"><div class="sg-modal-bg" data-close></div><div class="sg-modal">
            <div class="sg-modal-head"><span class="sg-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold sg-head leading-tight">${m.t}</h3><p class="text-[11px] sg-mut">${m.sub || ''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--sg-hover)] flex items-center justify-center sg-mut"><i class="icon-x"></i></button></div>
            <div class="sg-modal-body">${m.body}</div>
            <div class="sg-modal-foot"><button data-close class="sg-btn sg-btn-ghost">Cancel</button><button data-modalok="${key}" class="sg-btn sg-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
        </div></div>`;
    this.syncBodyLock();
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', host).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        if (el.hasAttribute('data-enable-time')) {
          config.enableTime = true;
          config.dateFormat = (config.dateFormat || 'Y-m-d') + ' H:i';
        }
        flatpickr(el, config);
      });
    }
  }

  private openDelete(msg: string, onOk: () => void): void {
    const host = this.modalHost();
    host.innerHTML = `<div class="sg-modal-wrap open"><div class="sg-modal-bg" data-close></div><div class="sg-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg sg-head">Confirm</h3><p class="text-xs sg-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="sg-btn sg-btn-ghost flex-1 justify-center">Cancel</button><button id="sg-delok" class="sg-btn sg-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`;
    this.syncBodyLock();
    const btn = this.byId('sg-delok');
    if (btn) btn.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('sg-modalhost');
    if (host) host.innerHTML = '';
    this.syncBodyLock();
  }

  /* ---------------- bulk / refresh ---------------- */

  private updateBulk(): void {
    const cnt = this.byId('sg-selcount');
    if (cnt) cnt.textContent = String(this.sel.size);
    this.qsa<HTMLElement>('.sg-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private refreshAll(): void {
    this.renderDirectory();
    this.renderPerformance();
    this.renderSchedule();
    this.renderSpecialties();
    this.updateCounts();
    this.animateRings();
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      const vw = target.closest('[data-vw]') as HTMLElement | null;
      if (vw) {
        this.view = vw.dataset['vw'] as any;
        this.qsa('#sg-viewtabs button').forEach((x) => x.classList.toggle('on', x === vw));
        this.renderDirectory();
        return;
      }
      const specEl = target.closest('[data-spec]') as HTMLElement | null;
      if (specEl) {
        const sp = specEl.dataset['spec']!;
        this.fSpec = sp;
        const fspecEl = this.byId('sg-fspec') as HTMLSelectElement | null;
        if (fspecEl) fspecEl.value = sp;
        this.renderDirectory();
        this.byId('sg-directory')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.toast('Filtered: ' + sp, 'icon-filter');
        return;
      }

      const t = target.closest('[data-doc],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.sg-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['doc'] !== undefined) {
        this.focusId = +t.dataset['doc'];
        this.renderPerformance();
        this.renderSchedule();
        this.animateRings();
        this.openDrawer(this.focusId);
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        const r = t.getBoundingClientRect();
        this.openMenu(+t.dataset['menu'], r.left - 180, r.bottom + 4);
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action']!;
        const id = +t.dataset['sid']!;
        this.closeMenu();
        this.focusId = id;
        if (a === 'view') {
          this.openDrawer(id);
        } else if (a === 'perf' || a === 'schedule') {
          this.renderPerformance();
          this.renderSchedule();
          this.animateRings();
          if (a === 'schedule') this.openModal('schedule');
          else this.byId('sg-performance')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (this.MODALS[a]) {
          this.openModal(a);
        } else if (a === 'delete') {
          this.openDelete('Remove this surgeon from the roster?', () => {
            this.SURG = this.SURG.filter((x) => x.id !== id);
            this.sel.delete(id);
            this.refreshAll();
            this.toast('Surgeon removed', 'icon-trash-2');
          });
        } else if (this.SIMPLE[a]) {
          this.toast(this.SIMPLE[a]);
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal']!);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        this.toast(this.MODALS[t.dataset['modalok']].cta + ' — done', 'icon-check');
        this.closeModal();
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast('Exported: ' + t.dataset['expfmt'], 'icon-download');
        this.closeModal();
        return;
      }
      if (t.dataset['close'] !== undefined) {
        this.closeModal();
        this.closeDrawer();
        return;
      }
      if (t.dataset['bulk'] !== undefined) {
        const bk = t.dataset['bulk']!;
        if (bk === 'delete') {
          this.openDelete(`Remove ${this.sel.size} selected surgeon(s)?`, () => {
            this.SURG = this.SURG.filter((s) => !this.sel.has(s.id));
            this.sel.clear();
            this.refreshAll();
            this.updateBulk();
            this.toast('Surgeons removed', 'icon-trash-2');
          });
        } else {
          const labels: Record<string, string> = { assign: 'Surgery assigned', oncall: 'Set on-call', export: 'Exported', print: 'Printing', archive: 'Archived' };
          this.toast(labels[bk] + ' · ' + this.sel.size + ' surgeons');
          if (bk === 'archive') {
            this.sel.clear();
            this.refreshAll();
            this.updateBulk();
          }
        }
        return;
      }
    });

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.dataset['sel'] !== undefined) {
        const id = +target.dataset['sel'];
        target.checked ? this.sel.add(id) : this.sel.delete(id);
        this.updateBulk();
        return;
      }
      if (target.id === 'sg-fspec') {
        this.fSpec = target.value;
        this.renderDirectory();
      }
      if (target.id === 'sg-fstatus') {
        this.fStatus = target.value;
        this.renderDirectory();
      }
      if (target.id === 'sg-sort') {
        this.sort = target.value;
        this.renderDirectory();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'sg-search') {
        this.q = target.value;
        this.renderDirectory();
      }
    });
  }
}
