import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Category {
  k: string;
  n: string;
  ic: string;
  c: string;
}

interface Specialization {
  id: number;
  name: string;
  cat: string;
  ic: string;
  c: string;
  dept: string;
  doctors: number;
  procedures: number;
  rating: number;
  demand: string;
  growth: number;
  wait: string;
  desc: string;
  procs: string[];
  docs: string[];
}

/**
 * Ported from tailwind/src/assets/js/script.js — "specializations".
 * Category pills, the specialization grid (default view, unfiltered, sorted
 * by name) and the sidebar (top-procedures bars, category donut, top-growth
 * list) ship as static markup matching this seed data; this wires
 * search/category/demand/sort changes, the detail drawer and the
 * add-specialization modal.
 */
@Component({
  imports: [],
  selector: 'app-specializations',
  styleUrl: './specializations.css',
  templateUrl: './specializations.html',
})
export class Specializations implements AfterViewInit {
  private readonly CATS: Category[] = [
    { k: 'all', n: 'All', ic: 'ti-layout-grid', c: '#8b5cf6' },
    { k: 'Surgical', n: 'Surgical', ic: 'icon-scissors', c: '#ef4444' },
    { k: 'Medical', n: 'Medical', ic: 'ti-stethoscope', c: '#0ea5e9' },
    { k: 'Diagnostic', n: 'Diagnostic', ic: 'ti-scan', c: '#6366f1' },
    { k: 'Pediatric', n: 'Pediatric', ic: 'ti-baby-carriage', c: '#f59e0b' },
    { k: 'Critical', n: 'Critical Care', ic: 'ti-heartbeat', c: '#f43f5e' },
  ];

  private SPECS: Specialization[] = [
    { id: 1, name: 'Cardiology', cat: 'Medical', ic: 'ti-heart', c: '#ef4444', dept: 'Cardiology', doctors: 18, procedures: 214, rating: 4.9, demand: 'High', growth: 14, wait: '2 days', desc: 'Diagnosis and treatment of heart and blood vessel disorders including interventional procedures.', procs: ['Angioplasty', 'Echocardiography', 'Pacemaker', 'Bypass Surgery'], docs: ['Dr. Sarah Roberts', 'Dr. A. Khan', 'Dr. M. Lee'] },
    { id: 2, name: 'Neurology', cat: 'Medical', ic: 'ti-brain', c: '#8b5cf6', dept: 'Neurology', doctors: 14, procedures: 158, rating: 4.8, demand: 'High', growth: 11, wait: '3 days', desc: 'Care for disorders of the brain, spinal cord and nervous system.', procs: ['EEG', 'Stroke Care', 'Nerve Conduction', 'EMG'], docs: ['Dr. Vikram Nair', 'Dr. S. Gupta'] },
    { id: 3, name: 'Orthopedic Surgery', cat: 'Surgical', ic: 'ti-bone', c: '#0ea5e9', dept: 'Orthopedics', doctors: 16, procedures: 246, rating: 4.7, demand: 'High', growth: 9, wait: '4 days', desc: 'Surgical and non-surgical treatment of the musculoskeletal system.', procs: ['Joint Replacement', 'Arthroscopy', 'Fracture Repair', 'Spine Surgery'], docs: ['Dr. Anita Desai', 'Dr. K. Singh'] },
    { id: 4, name: 'Pediatrics', cat: 'Pediatric', ic: 'ti-baby-carriage', c: '#f59e0b', dept: 'Pediatrics', doctors: 12, procedures: 132, rating: 4.9, demand: 'Medium', growth: 6, wait: '1 day', desc: 'Medical care for infants, children and adolescents.', procs: ['Vaccination', 'Growth Assessment', 'NICU Care', 'Pediatric Surgery'], docs: ['Dr. Meera Iyer', 'Dr. N. Bose'] },
    { id: 5, name: 'Oncology', cat: 'Medical', ic: 'ti-radioactive', c: '#ec4899', dept: 'Oncology', doctors: 11, procedures: 98, rating: 4.6, demand: 'High', growth: 18, wait: '2 days', desc: 'Diagnosis and treatment of cancer including chemotherapy and radiation.', procs: ['Chemotherapy', 'Radiation', 'Biopsy', 'Immunotherapy'], docs: ['Dr. Rajesh Menon', 'Dr. L. Fernandez'] },
    { id: 6, name: 'General Surgery', cat: 'Surgical', ic: 'icon-scissors', c: '#f43f5e', dept: 'Surgery', doctors: 15, procedures: 288, rating: 4.7, demand: 'High', growth: 7, wait: '3 days', desc: 'Broad surgical care of the abdomen, digestive tract and soft tissues.', procs: ['Appendectomy', 'Hernia Repair', 'Laparoscopy', 'Gallbladder'], docs: ['Dr. John Mathew', 'Dr. G. Nair'] },
    { id: 7, name: 'Radiology', cat: 'Diagnostic', ic: 'ti-scan', c: '#6366f1', dept: 'Radiology', doctors: 9, procedures: 342, rating: 4.8, demand: 'Medium', growth: 12, wait: 'Same day', desc: 'Diagnostic imaging services across modalities.', procs: ['MRI', 'CT Scan', 'X-Ray', 'Ultrasound'], docs: ['Dr. Deepak Nair', 'Dr. M. Iyer'] },
    { id: 8, name: 'Dermatology', cat: 'Medical', ic: 'ti-hand-finger', c: '#10b981', dept: 'Dermatology', doctors: 8, procedures: 120, rating: 4.7, demand: 'Medium', growth: 8, wait: '5 days', desc: 'Care for skin, hair and nail conditions, cosmetic and surgical.', procs: ['Skin Biopsy', 'Laser Therapy', 'Cosmetic', 'Allergy Test'], docs: ['Dr. Karan Malhotra'] },
    { id: 9, name: 'Gynecology', cat: 'Surgical', ic: 'ti-mood-heart', c: '#d946ef', dept: 'Gynecology', doctors: 13, procedures: 176, rating: 4.8, demand: 'Medium', growth: 5, wait: '2 days', desc: "Women's reproductive health, obstetrics and gynecologic surgery.", procs: ['Ultrasound', 'Laparoscopy', 'Maternity', 'Fertility'], docs: ['Dr. Priya Sharma', 'Dr. D. Kaur'] },
    { id: 10, name: 'Emergency Medicine', cat: 'Critical', ic: 'ti-ambulance', c: '#dc2626', dept: 'Emergency', doctors: 20, procedures: 410, rating: 4.5, demand: 'High', growth: 15, wait: 'Immediate', desc: 'Acute care for urgent and life-threatening conditions.', procs: ['Trauma Care', 'Triage', 'Resuscitation', 'Stabilization'], docs: ['Dr. John Mathew', 'Dr. S. Ali'] },
    { id: 11, name: 'Anesthesiology', cat: 'Critical', ic: 'ti-lungs', c: '#0891b2', dept: 'Surgery', doctors: 10, procedures: 264, rating: 4.8, demand: 'Medium', growth: 4, wait: 'N/A', desc: 'Anesthesia and perioperative care for surgical patients.', procs: ['General Anesthesia', 'Regional Block', 'Sedation', 'Pain Mgmt'], docs: ['Dr. Arjun Menon'] },
    { id: 12, name: 'Ophthalmology', cat: 'Surgical', ic: 'ti-eye', c: '#14b8a6', dept: 'Eye Care', doctors: 7, procedures: 194, rating: 4.8, demand: 'Medium', growth: 10, wait: '4 days', desc: 'Medical and surgical eye care.', procs: ['Cataract', 'LASIK', 'Retina Surgery', 'Glaucoma'], docs: ['Dr. Sunita Rao'] },
    { id: 13, name: 'Psychiatry', cat: 'Medical', ic: 'ti-mood-smile', c: '#a855f7', dept: 'Psychiatry', doctors: 5, procedures: 64, rating: 4.8, demand: 'Low', growth: 22, wait: '6 days', desc: 'Mental health assessment, therapy and psychiatric treatment.', procs: ['Counselling', 'Therapy', 'Psychometry', 'De-addiction'], docs: ['Dr. Fatima Sheikh'] },
    { id: 14, name: 'Pathology', cat: 'Diagnostic', ic: 'ti-microscope', c: '#7c3aed', dept: 'Laboratory', doctors: 6, procedures: 520, rating: 4.7, demand: 'Medium', growth: 6, wait: 'Same day', desc: 'Laboratory diagnosis of disease through analysis of samples.', procs: ['Blood Tests', 'Histopathology', 'Cytology', 'Cultures'], docs: ['Dr. P. Shah'] },
    { id: 15, name: 'Neonatology', cat: 'Pediatric', ic: 'ti-baby-bottle', c: '#f97316', dept: 'Pediatrics', doctors: 6, procedures: 88, rating: 4.9, demand: 'Low', growth: 13, wait: '1 day', desc: 'Specialized care for newborn infants, especially the ill or premature.', procs: ['NICU Care', 'Ventilation', 'Phototherapy', 'Feeding Support'], docs: ['Dr. N. Bose'] },
    { id: 16, name: 'Urology', cat: 'Surgical', ic: 'ti-droplet', c: '#2563eb', dept: 'Urology', doctors: 8, procedures: 156, rating: 4.6, demand: 'Medium', growth: 7, wait: '3 days', desc: 'Care for the urinary tract and male reproductive system.', procs: ['Cystoscopy', 'Kidney Stone', 'Prostate Surgery', 'TURP'], docs: ['Dr. R. Jain'] },
  ];

  private state = { q: '', cat: 'all', demand: '', sort: 'name' };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
    setTimeout(() => {
      this.byId('sp-skeleton')?.classList.add('hidden');
      this.byId('sp-content')?.classList.remove('hidden');
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private qsa(sel: string, root?: ParentNode): HTMLElement[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(sel));
  }
  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }
  private mix(c: string, p = 15): string {
    return `color-mix(in srgb,${c} ${p}%,transparent)`;
  }
  private toast(msg: string): void {
    this.toastService.show(msg, 'success');
  }
  private catColor(k: string): string {
    const found = this.CATS.find((c) => c.k === k);
    return found ? found.c : '#8b5cf6';
  }
  private demandColor(d: string): string {
    return d === 'High' ? '#ef4444' : d === 'Medium' ? '#f59e0b' : '#10b981';
  }
  private ini(n: string): string {
    return n.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  private detailUrl(s: Specialization): string {
    return 'specialization-detail.html?' + new URLSearchParams({ id: String(s.id), name: s.name, dept: s.dept, cat: s.cat }).toString();
  }

  /* ---------- CATEGORY PILLS ---------- */
  private renderCats(): void {
    const el = this.byId('sp-cats');
    if (!el) return;
    el.innerHTML = this.CATS.map((c) => {
      const n = c.k === 'all' ? this.SPECS.length : this.SPECS.filter((s) => s.cat === c.k).length;
      return `<button class="sp-cat${this.state.cat === c.k ? ' active' : ''}" data-cat="${c.k}"><i class="ti ${c.ic}"></i>${this.esc(c.n)} <span class="n">${n}</span></button>`;
    }).join('');
  }

  /* ---------- FILTER ---------- */
  private filtered(): Specialization[] {
    const q = this.state.q.toLowerCase();
    const arr = this.SPECS.filter((s) => {
      if (this.state.cat !== 'all' && s.cat !== this.state.cat) return false;
      if (this.state.demand && s.demand !== this.state.demand) return false;
      if (!q) return true;
      return (s.name + ' ' + s.dept + ' ' + s.procs.join(' ')).toLowerCase().indexOf(q) >= 0;
    });
    arr.sort((a, b) => {
      if (this.state.sort === 'name') return a.name.localeCompare(b.name);
      if (this.state.sort === 'doctors') return b.doctors - a.doctors;
      if (this.state.sort === 'procedures') return b.procedures - a.procedures;
      if (this.state.sort === 'rating') return b.rating - a.rating;
      if (this.state.sort === 'growth') return b.growth - a.growth;
      return 0;
    });
    return arr;
  }

  /* ---------- CARD ---------- */
  private cardHTML(s: Specialization): string {
    const docs = s.docs
      .slice(0, 3)
      .map((n, i) => `<div class="sp-ava" style="background:linear-gradient(135deg,${s.c},${this.mix(s.c, 60)});margin-left:${i ? '-.45rem' : '0'}">${this.esc(this.ini(n))}</div>`)
      .join('');
    return (
      `<div class="sp-card" style="--sc:${s.c}" data-open="${s.id}">` +
      `<div class="p-4">` +
      `<div class="flex items-start gap-3"><div class="sp-card-ic" style="background:linear-gradient(135deg,${s.c},${this.mix(s.c, 60)})"><i class="ti ${s.ic}"></i></div>` +
      `<div class="flex-1 min-w-0"><h3 class="font-bold text-[var(--color-gray-900)] leading-tight truncate"><a href="${this.detailUrl(s)}" class="hover:underline">${this.esc(s.name)}</a></h3><p class="text-xs sp-muted flex items-center gap-1 mt-.5"><i class="ti ti-building-hospital"></i>${this.esc(s.dept)}</p></div>` +
      `<span class="sp-tag" style="background:${this.mix(this.demandColor(s.demand))};color:${this.demandColor(s.demand)}"><i class="ti ti-point"></i>${this.esc(s.demand)}</span>` +
      `</div>` +
      `<div class="grid grid-cols-3 gap-1.5 mt-3.5">` +
      `<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">${s.doctors}</div><div class="text-[10px] sp-muted font-semibold">Doctors</div></div>` +
      `<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">${s.procedures}</div><div class="text-[10px] sp-muted font-semibold">Procedures</div></div>` +
      `<div class="sp-stat"><div class="text-base font-extrabold text-[var(--color-gray-900)] flex items-center justify-center gap-.5"><i class="ti ti-star text-amber-400 text-xs"></i>${s.rating}</div><div class="text-[10px] sp-muted font-semibold">Rating</div></div>` +
      `</div>` +
      `<div class="mt-3"><div class="flex items-center justify-between mb-1"><span class="text-[11px] sp-muted font-semibold flex items-center gap-1"><i class="ti ti-trending-up text-emerald-500"></i>Growth</span><span class="text-[11px] font-bold text-emerald-600">+${s.growth}%</span></div><div class="sp-bar"><span style="width:${Math.min(s.growth * 4, 100)}%;background:linear-gradient(90deg,${s.c},${this.mix(s.c, 60)})"></span></div></div>` +
      `<div class="flex items-center justify-between mt-3.5 pt-3 border-t border-[var(--color-border-color)]"><div class="flex items-center">${docs}${s.docs.length > 3 ? `<span class="text-[11px] sp-muted ml-1.5 font-semibold">+${s.docs.length - 3}</span>` : ''}</div><span class="text-[11px] sp-muted font-semibold flex items-center gap-1"><i class="ti ti-clock"></i>${this.esc(s.wait)}</span></div>` +
      `</div></div>`
    );
  }

  /* ---------- RENDER ---------- */
  private render(): void {
    const arr = this.filtered();
    const grid = this.byId('sp-grid');
    const empty = this.byId('sp-empty');
    empty?.classList.toggle('hidden', arr.length > 0);
    if (grid) grid.innerHTML = arr.map((s) => this.cardHTML(s)).join('');
  }

  /* ---------- SIDEBAR ---------- */
  private renderSide(): void {
    const byProc = this.SPECS.slice().sort((a, b) => b.procedures - a.procedures).slice(0, 6);
    const max = byProc[0]?.procedures || 1;
    const topDemandEl = this.byId('sp-topdemand');
    if (topDemandEl) {
      topDemandEl.innerHTML = byProc
        .map(
          (s) =>
            `<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)] flex items-center gap-1.5"><i class="ti ${s.ic}" style="color:${s.c}"></i>${this.esc(s.name)}</span><span class="text-xs font-bold sp-muted">${s.procedures}</span></div><div class="sp-bar"><span style="width:${Math.round((s.procedures / max) * 100)}%;background:linear-gradient(90deg,${s.c},${this.mix(s.c, 60)})"></span></div></div>`
        )
        .join('');
    }

    const cats = this.CATS.filter((c) => c.k !== 'all');
    const counts = cats.map((c) => ({ c, n: this.SPECS.filter((s) => s.cat === c.k).length }));
    const total = counts.reduce((a, b) => a + b.n, 0) || 1;
    let off = 0;
    let seg = '';
    counts.forEach((x) => {
      const frac = (x.n / total) * 100;
      seg += `<circle cx="18" cy="18" r="15.9155" fill="none" stroke="${x.c.c}" stroke-width="4.2" stroke-dasharray="${frac} ${100 - frac}" stroke-dashoffset="${-off}"/>`;
      off += frac;
    });
    const donut = this.byId('sp-donut');
    if (donut) donut.innerHTML = seg + '<circle cx="18" cy="18" r="10" fill="var(--color-white)"/>';
    const legend = this.byId('sp-donut-legend');
    if (legend) {
      legend.innerHTML = counts
        .map((x) => `<div class="flex items-center gap-2 text-xs"><span class="w-2.5 h-2.5 rounded-full flex-none" style="background:${x.c.c}"></span><span class="font-semibold text-[var(--color-gray-900)] flex-1 truncate">${this.esc(x.c.n)}</span><span class="sp-muted font-bold">${x.n}</span></div>`)
        .join('');
    }

    const byGrowth = this.SPECS.slice().sort((a, b) => b.growth - a.growth).slice(0, 5);
    const growthEl = this.byId('sp-growth');
    if (growthEl) {
      growthEl.innerHTML = byGrowth
        .map(
          (s, i) =>
            `<div class="flex items-center gap-2.5"><div class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold" style="background:${this.mix(s.c)};color:${s.c}">${i + 1}</div><span class="text-sm font-semibold text-[var(--color-gray-900)] flex-1 truncate">${this.esc(s.name)}</span><span class="sp-tag" style="background:${this.mix('#10b981')};color:#059669"><i class="ti ti-trending-up"></i>+${s.growth}%</span></div>`
        )
        .join('');
    }
  }

  /* ---------- BODY SCROLL LOCK ---------- */
  private syncBodyLock(): void {
    const open = this.byId('sp-drawer')?.classList.contains('open') || this.byId('sp-addmodal')?.classList.contains('open');
    this.document.body.style.overflow = open ? 'hidden' : '';
  }

  /* ---------- DRAWER ---------- */
  private openDrawer(id: number): void {
    const s = this.SPECS.find((x) => x.id === id);
    if (!s) return;
    const procs = s.procs.map((p) => `<span class="sp-tag" style="background:${this.mix(s.c)};color:${s.c}">${this.esc(p)}</span>`).join('');
    const docs = s.docs
      .map((n) => `<div class="flex items-center gap-2 p-2 rounded-lg border border-[var(--color-border-color)]"><div class="sp-ava" style="width:2rem;height:2rem;font-size:.65rem;background:linear-gradient(135deg,${s.c},${this.mix(s.c, 60)})">${this.esc(this.ini(n))}</div><span class="text-sm font-semibold text-[var(--color-gray-900)]">${this.esc(n)}</span></div>`)
      .join('');
    const body = this.byId('sp-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-7" style="background:linear-gradient(135deg,${s.c},${this.mix(s.c, 55)})">` +
        `<div class="flex items-center justify-between"><button class="sp-btn sp-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="sp-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><i class="ti ti-point"></i>${this.esc(s.demand)} Demand</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><div class="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-2xl"><i class="ti ${s.ic}"></i></div><div><h2 class="text-xl font-extrabold">${this.esc(s.name)}</h2><p class="text-white/80 text-sm flex items-center gap-2"><span class="inline-flex items-center gap-1"><i class="ti ti-building-hospital"></i>${this.esc(s.dept)}</span><span class="inline-flex items-center gap-1"><i class="ti ti-category"></i>${this.esc(s.cat)}</span></p></div></div>` +
        `</div>` +
        `<div class="p-5 space-y-5">` +
        `<div class="grid grid-cols-2 gap-2.5">` +
        `<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)]">${s.doctors}</div><div class="text-[11px] sp-muted font-semibold">Doctors</div></div>` +
        `<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)]">${s.procedures}</div><div class="text-[11px] sp-muted font-semibold">Procedures/mo</div></div>` +
        `<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-emerald-600">+${s.growth}%</div><div class="text-[11px] sp-muted font-semibold">YoY Growth</div></div>` +
        `<div class="sp-stat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-xl font-extrabold text-[var(--color-gray-900)] flex items-center gap-1"><i class="ti ti-star text-amber-400 text-base"></i>${s.rating}</div><div class="text-[11px] sp-muted font-semibold">Avg Rating</div></div>` +
        `</div>` +
        `<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:${this.mix(s.c, 8)};border:1px solid ${this.mix(s.c, 22)}"><i class="ti ti-clock text-lg" style="color:${s.c}"></i><div><div class="text-xs sp-muted font-semibold">Average Wait Time</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(s.wait)}</div></div></div>` +
        `<div><div class="text-xs sp-muted font-semibold mb-1.5">About</div><p class="text-sm sp-muted leading-relaxed">${this.esc(s.desc)}</p></div>` +
        `<div><div class="text-xs sp-muted font-semibold mb-2">Key Procedures</div><div class="flex flex-wrap gap-1.5">${procs}</div></div>` +
        `<div><div class="text-xs sp-muted font-semibold mb-2">Consultants (${s.docs.length})</div><div class="grid grid-cols-1 gap-2">${docs}</div></div>` +
        `<div class="flex gap-2 pt-1"><button class="sp-btn sp-btn-primary flex-1" data-toast="Viewing doctors in ${this.esc(s.name)}"><i class="ti ti-users"></i> View Doctors</button><button class="sp-btn sp-btn-soft flex-1" data-toast="Edit specialization"><i class="ti ti-edit"></i> Edit</button></div>` +
        `</div>`;
    }
    this.byId('sp-drawer')?.classList.add('open');
    this.syncBodyLock();
  }

  /* ---------- EVENTS ---------- */
  private wireEvents(): void {
    const search = this.byId('sp-search') as HTMLInputElement | null;
    search?.addEventListener('input', () => {
      this.state.q = search.value;
      this.render();
    });
    const demand = this.byId('sp-demand') as HTMLSelectElement | null;
    demand?.addEventListener('change', () => {
      this.state.demand = demand.value;
      this.render();
    });
    const sort = this.byId('sp-sort') as HTMLSelectElement | null;
    sort?.addEventListener('change', () => {
      this.state.sort = sort.value;
      this.render();
    });
    this.byId('sp-cats')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-cat]') as HTMLElement | null;
      if (!b) return;
      this.state.cat = b.getAttribute('data-cat')!;
      this.renderCats();
      this.render();
    });

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        this.openDrawer(+op.getAttribute('data-open')!);
        return;
      }
      if (target.closest('[data-add]')) {
        this.byId('sp-addmodal')?.classList.add('open');
        this.syncBodyLock();
        return;
      }
      if (target.closest('[data-export]')) {
        this.toast('Exporting specializations catalog...');
        return;
      }
      const tt = target.closest('[data-toast]') as HTMLElement | null;
      if (tt) {
        this.toast(tt.getAttribute('data-toast') || '');
        return;
      }
      const c = target.closest('[data-close]') as HTMLElement | null;
      if (c) {
        const m = c.closest('.sp-drawer,.sp-modal');
        m?.classList.remove('open');
        this.syncBodyLock();
        return;
      }
    });
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.qsa('.sp-drawer.open,.sp-modal.open').forEach((m) => m.classList.remove('open'));
        this.syncBodyLock();
      }
    });

    this.byId('sp-f-submit')?.addEventListener('click', () => {
      const nameInp = this.byId('sp-f-name') as HTMLInputElement | null;
      const n = nameInp?.value.trim() || '';
      if (!n) {
        this.toast('Enter specialization name');
        return;
      }
      const id = Math.max(...this.SPECS.map((s) => s.id)) + 1;
      const catName = (this.byId('sp-f-cat') as HTMLSelectElement | null)?.value || '';
      const found = this.CATS.find((c) => c.n === catName);
      this.SPECS.unshift({
        id,
        name: n,
        cat: catName,
        ic: 'ti-stethoscope',
        c: this.catColor(found ? found.k : ''),
        dept: (this.byId('sp-f-dept') as HTMLInputElement | null)?.value.trim() || '—',
        doctors: +((this.byId('sp-f-doc') as HTMLInputElement | null)?.value || 0),
        procedures: 0,
        rating: 0,
        demand: (this.byId('sp-f-dem') as HTMLSelectElement | null)?.value || 'Medium',
        growth: 0,
        wait: '—',
        desc: (this.byId('sp-f-desc') as HTMLTextAreaElement | null)?.value.trim() || 'Newly added specialization.',
        procs: [],
        docs: [],
      });
      this.byId('sp-addmodal')?.classList.remove('open');
      this.syncBodyLock();
      ['sp-f-name', 'sp-f-dept', 'sp-f-doc', 'sp-f-desc'].forEach((x) => {
        const el = this.byId(x) as HTMLInputElement | HTMLTextAreaElement | null;
        if (el) el.value = '';
      });
      this.renderCats();
      this.render();
      this.renderSide();
      this.toast('Specialization "' + n + '" added');
    });
  }
}
