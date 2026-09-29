import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

interface Med {
  name: string;
  stock: number;
  reorder: number;
  price: number;
  ctrl: boolean;
}

interface Cat {
  id: string;
  name: string;
  code: string;
  cls: string;
  icon: string;
  desc: string;
  meds: Med[];
  status: 'Active' | 'Archived';
}

interface Stats {
  total: number;
  ok: number;
  low: number;
  out: number;
  controlled: number;
  value: number;
  health: number;
}

@Component({
  imports: [RouterLink],
  selector: 'app-medicine-categories',
  styleUrl: './medicine-categories.css',
  templateUrl: './medicine-categories.html',
})
export class MedicineCategories implements AfterViewInit {
  AllRoutes = All_Routes;
  private idSeq = 0;
  private mode: 'grid' | 'list' = 'grid';

  private CATS: Cat[] = [
    this.cat({
      name: 'Analgesics', code: 'ANL', cls: 'cat-teal', icon: 'icon-pill',
      desc: 'Pain relief and antipyretics, from over-the-counter paracetamol to scheduled opioids.',
      meds: [
        { name: 'Tylenol', stock: 8400, reorder: 2000, price: 0.08, ctrl: false },
        { name: 'OxyContin', stock: 320, reorder: 400, price: 1.85, ctrl: true },
        { name: 'Panadol', stock: 2600, reorder: 700, price: 0.15, ctrl: false },
        { name: 'Cortisone Cream', stock: 1900, reorder: 600, price: 0.28, ctrl: false },
      ],
    }),
    this.cat({
      name: 'Antibiotics', code: 'ABX', cls: 'cat-sky', icon: 'icon-shield',
      desc: 'Antibacterial agents for treating and preventing infection across body systems.',
      meds: [
        { name: 'Amoxil', stock: 6100, reorder: 1500, price: 0.22, ctrl: false },
        { name: 'Augmentin', stock: 610, reorder: 250, price: 0.9, ctrl: false },
        { name: 'Ciprobay', stock: 3100, reorder: 900, price: 0.34, ctrl: false },
      ],
    }),
    this.cat({
      name: 'Cardiovascular', code: 'CVS', cls: 'cat-red', icon: 'icon-heart-pulse',
      desc: 'Agents for hypertension, cholesterol, angina and other cardiac conditions.',
      meds: [
        { name: 'Lipitor', stock: 5200, reorder: 1200, price: 0.31, ctrl: false },
        { name: 'Norvasc', stock: 4800, reorder: 1200, price: 0.11, ctrl: false },
        { name: 'Timoptic', stock: 430, reorder: 150, price: 1.4, ctrl: false },
      ],
    }),
    this.cat({
      name: 'Respiratory', code: 'RES', cls: 'cat-indigo', icon: 'icon-wind',
      desc: 'Inhalers, bronchodilators and cough preparations for airway disease.',
      meds: [
        { name: 'Ventolin', stock: 890, reorder: 300, price: 4.6, ctrl: false },
        { name: 'Codeine Linctus', stock: 260, reorder: 150, price: 0.38, ctrl: true },
      ],
    }),
    this.cat({
      name: 'Endocrine', code: 'END', cls: 'cat-amber', icon: 'icon-flask-round',
      desc: 'Diabetes, thyroid and hormone therapies including insulin.',
      meds: [
        { name: 'Glucophage', stock: 7600, reorder: 2000, price: 0.06, ctrl: false },
        { name: 'Humulin R', stock: 720, reorder: 250, price: 6.2, ctrl: false },
      ],
    }),
    this.cat({
      name: 'Gastrointestinal', code: 'GIT', cls: 'cat-pink', icon: 'icon-droplet',
      desc: 'Acid suppression, antiemetics and agents for inflammatory bowel disease.',
      meds: [
        { name: 'Nexium', stock: 3300, reorder: 900, price: 0.52, ctrl: false },
        { name: 'Zofran', stock: 1450, reorder: 500, price: 0.74, ctrl: false },
        { name: 'Salofalk', stock: 1200, reorder: 400, price: 0.63, ctrl: false },
      ],
    }),
    this.cat({
      name: 'CNS', code: 'CNS', cls: 'cat-violet', icon: 'icon-brain',
      desc: 'Central nervous system drugs including anxiolytics, stimulants and sedatives.',
      meds: [
        { name: 'Xanax', stock: 0, reorder: 250, price: 0.44, ctrl: true },
        { name: 'Ativan', stock: 540, reorder: 200, price: 1.12, ctrl: true },
        { name: 'Adderall', stock: 180, reorder: 300, price: 1.05, ctrl: true },
      ],
    }),
    this.cat({
      name: 'Anticoagulants', code: 'ACG', cls: 'cat-cyan', icon: 'icon-droplet',
      desc: 'Blood-thinning agents for thromboprophylaxis and treatment.',
      meds: [
        { name: 'Coumadin', stock: 2100, reorder: 800, price: 0.19, ctrl: false },
        { name: 'Eliquis', stock: 940, reorder: 300, price: 3.1, ctrl: false },
      ],
    }),
    this.cat({
      name: 'Ophthalmic', code: 'OPH', cls: 'cat-orange', icon: 'icon-eye',
      desc: 'Eye drops and ointments for glaucoma, infection and dry-eye management.',
      meds: [
        { name: 'Xalatan', stock: 640, reorder: 200, price: 2.1, ctrl: false },
        { name: 'Tobradex', stock: 410, reorder: 150, price: 3.45, ctrl: false },
        { name: 'Restasis', stock: 95, reorder: 120, price: 5.8, ctrl: false },
      ],
    }),
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const rows = this.visible();
    const count = this.byId('result-count');
    if (count) count.textContent = rows.length + ' shown';
    const empty = rows.length === 0;
    this.byId('empty-state')?.classList.toggle('hidden', !empty);
    if (this.mode === 'grid') {
      this.byId('grid-view')?.classList.toggle('hidden', empty);
      this.byId('list-view')?.classList.add('hidden');
    } else {
      this.byId('list-view')?.classList.toggle('hidden', empty);
      this.byId('grid-view')?.classList.add('hidden');
    }

    this.byId('search')?.addEventListener('input', () => this.render());
    this.byId('filter-status')?.addEventListener('change', () => this.render());
    this.byId('sort')?.addEventListener('change', () => this.render());

    this.byId('view-grid')?.addEventListener('click', () => this.setMode('grid'));
    this.byId('view-list')?.addEventListener('click', () => this.setMode('list'));

    this.byId('cat-grid')?.addEventListener('click', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
      if (t) this.openDrawer(t.dataset['open'] || '');
    });
    this.byId('cat-grid')?.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      const t = (ke.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
      if (!t) return;
      ke.preventDefault();
      this.openDrawer(t.dataset['open'] || '');
    });

    this.byId('list-body')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const id = btn.dataset['id'] || '';
      const c = this.CATS.find((x) => x.id === id);
      if (btn.dataset['act'] === 'view') this.openDrawer(id);
      else if (btn.dataset['act'] === 'edit') this.openCat(id);
      else if (btn.dataset['act'] === 'archive') {
        if (c && c.status === 'Active') {
          const ok = this.document.defaultView?.confirm('Archive ' + c.name + ' category?') ?? true;
          if (ok) this.archiveCat(id);
        } else this.archiveCat(id);
      }
    });

    this.byId('btn-add')?.addEventListener('click', () => this.openCat(null));
    this.byId('btn-export')?.addEventListener('click', () =>
      this.toast('Categories exported — ' + this.CATS.length + ' categories.', 'success'),
    );

    this.byId('dw-close')?.addEventListener('click', () => this.closeDrawer());
    this.byId('dw-backdrop')?.addEventListener('click', () => this.closeDrawer());
    this.byId('dw-act-edit')?.addEventListener('click', (e: Event) => {
      const id = (e.currentTarget as HTMLElement).dataset['id'] || '';
      this.closeDrawer();
      this.openCat(id);
    });
    this.byId('dw-act-add')?.addEventListener('click', () => {
      this.closeDrawer();
      this.toast('Add a medicine to this category from the Medicines page.', 'info');
    });
    this.byId('dw-act-archive')?.addEventListener('click', (e: Event) => {
      const id = (e.currentTarget as HTMLElement).dataset['id'] || '';
      const c = this.CATS.find((x) => x.id === id);
      this.closeDrawer();
      if (c && c.status === 'Active') {
        const ok = this.document.defaultView?.confirm('Archive ' + c.name + ' category?') ?? true;
        if (ok) this.archiveCat(id);
      } else this.archiveCat(id);
    });

    this.byId('cm-swatches')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-swatch]') as HTMLElement | null;
      if (!btn) return;
      this.pickCls = btn.dataset['swatch'] || this.pickCls;
      this.pickIcon = btn.dataset['icon'] || this.pickIcon;
      this.renderSwatches();
    });

    this.byId('cm-save')?.addEventListener('click', () => {
      const name = this.getValue('cm-name').trim();
      const code = this.getValue('cm-code').trim().toUpperCase();
      if (!name) return this.toast('Enter a category name.', 'error');
      if (!code) return this.toast('Enter a short code.', 'error');

      const clash = this.CATS.some((c) => c.code === code && c.id !== this.editingId);
      if (clash) return this.toast('Code ' + code + ' is already in use.', 'error');

      if (this.editingId) {
        const c = this.CATS.find((x) => x.id === this.editingId);
        if (c) {
          Object.assign(c, { name, code, desc: this.getValue('cm-desc').trim() || c.desc, cls: this.pickCls, icon: this.pickIcon });
          this.toast(name + ' updated.', 'success');
        }
      } else {
        this.CATS.unshift(
          this.cat({ name, code, cls: this.pickCls, icon: this.pickIcon, desc: this.getValue('cm-desc').trim() || 'No description provided.', meds: [] }),
        );
        this.toast(name + ' category created.', 'success');
      }
      const w = this.document.defaultView as any;
      if (w?.HSOverlay) w.HSOverlay.close('#cat-modal');
      this.render();
    });

    this.document.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Escape') return;
      this.closeDrawer();
    });
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private getValue(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
  }

  private money(n: number): string {
    if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
    return '$' + Number(n).toFixed(0);
  }

  private readonly SWATCHES = [
    { cls: 'cat-teal', icon: 'icon-pill' },
    { cls: 'cat-sky', icon: 'icon-heart-pulse' },
    { cls: 'cat-amber', icon: 'icon-shield' },
    { cls: 'cat-pink', icon: 'icon-flask-round' },
    { cls: 'cat-red', icon: 'icon-syringe' },
    { cls: 'cat-violet', icon: 'icon-brain' },
    { cls: 'cat-indigo', icon: 'icon-wind' },
    { cls: 'cat-cyan', icon: 'icon-droplet' },
    { cls: 'cat-orange', icon: 'icon-eye' },
  ];

  private editingId: string | null = null;
  private pickCls = this.SWATCHES[0].cls;
  private pickIcon = this.SWATCHES[0].icon;

  private cat(o: Omit<Cat, 'id' | 'status'>): Cat {
    this.idSeq++;
    return { id: 'CAT-' + String(this.idSeq).padStart(2, '0'), status: 'Active', ...o };
  }

  private medStatus(m: Med): 'out' | 'low' | 'ok' {
    if (m.stock <= 0) return 'out';
    if (m.stock <= m.reorder) return 'low';
    return 'ok';
  }

  private stats(c: Cat): Stats {
    const total = c.meds.length;
    const out = c.meds.filter((m) => this.medStatus(m) === 'out').length;
    const low = c.meds.filter((m) => this.medStatus(m) === 'low').length;
    const ok = total - out - low;
    const controlled = c.meds.filter((m) => m.ctrl).length;
    const value = c.meds.reduce((s, m) => s + m.stock * m.price, 0);
    const health = total ? Math.round(((ok + low * 0.5) / total) * 100) : 100;
    return { total, ok, low, out, controlled, value, health };
  }

  private healthTone(pct: number): { badge: string; label: string; tone: string } {
    if (pct >= 85) return { badge: 'badge-green', label: 'Healthy', tone: 'tone-stable' };
    if (pct >= 60) return { badge: 'badge-amber', label: 'Watch', tone: 'tone-medium' };
    return { badge: 'badge-red', label: 'At Risk', tone: 'tone-critical' };
  }

  private detailUrl(c: Cat): string {
    return 'medicine-category-detail.html?' + new URLSearchParams({ id: c.id, name: c.name, code: c.code, status: c.status }).toString();
  }

  private visible(): Cat[] {
    const q = this.getValue('search').trim().toLowerCase();
    const status = this.getValue('filter-status');
    const sort = this.getValue('sort');

    const rows = this.CATS.filter((c) => {
      const hit = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      return hit && (!status || c.status === status);
    });

    rows.sort((a, b) => {
      if (sort === 'count') return this.stats(b).total - this.stats(a).total;
      if (sort === 'value') return this.stats(b).value - this.stats(a).value;
      if (sort === 'health') return this.stats(a).health - this.stats(b).health;
      return a.name.localeCompare(b.name);
    });
    return rows;
  }

  private ring(pct: number, cls: string): string {
    return (
      '<svg class="ph-cat-ring ' + cls + '" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
      '<circle class="ph-cat-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3"></circle>' +
      '<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ' +
      'stroke-dasharray="' + pct + ' 100"></circle></svg>'
    );
  }

  private renderHero(): void {
    const active = this.CATS.filter((c) => c.status === 'Active').length;
    const atRisk = this.CATS.filter((c) => this.stats(c).health < 60).length;
    const flag =
      atRisk >= 2
        ? { cls: 'tone-critical', text: atRisk + ' Categories At Risk' }
        : atRisk === 1
          ? { cls: 'tone-medium', text: '1 Category At Risk' }
          : { cls: 'tone-stable', text: 'Taxonomy Healthy' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = active + ' active categories · ' + this.CATS.reduce((s, c) => s + c.meds.length, 0) + ' medicines';
  }

  private renderKpis(): void {
    const total = this.CATS.length;
    const meds = this.CATS.reduce((s, c) => s + c.meds.length, 0);
    const controlled = this.CATS.filter((c) => this.stats(c).controlled > 0).length;
    const atRisk = this.CATS.filter((c) => this.stats(c).health < 60).length;
    const value = this.CATS.reduce((s, c) => s + this.stats(c).value, 0);
    const largest = this.CATS.slice().sort((a, b) => this.stats(b).total - this.stats(a).total)[0];

    const cards = [
      { id: 'kpi-cats', icon: 'icon-layers', label: 'Categories', value: total, tone: 'ph-primary', meta: 'in taxonomy' },
      { id: 'kpi-meds', icon: 'icon-pill', label: 'Total Medicines', value: meds, tone: 'ph-sky', meta: 'classified' },
      { id: 'kpi-largest', icon: 'icon-crown', label: 'Largest', value: largest ? largest.code : '—', tone: 'ph-violet', meta: (largest ? this.stats(largest).total : 0) + ' medicines' },
      { id: 'kpi-controlled', icon: 'icon-shield', label: 'With Controlled', value: controlled, tone: 'ph-amber', meta: 'hold scheduled drugs' },
      { id: 'kpi-risk', icon: 'icon-triangle-alert', label: 'At Risk', value: atRisk, tone: 'ph-danger', meta: 'low stock health' },
      { id: 'kpi-value', icon: 'icon-dollar-sign', label: 'Stock Value', value: this.money(value), tone: 'ph-slate', meta: 'across categories' },
    ];

    const row = this.byId('kpi-row');
    if (row) {
      row.innerHTML = cards
        .map(
          (c) =>
            '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
            '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + '</p>' +
            '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + '</p></article>',
        )
        .join('');
    }
  }

  private renderGrid(rows: Cat[]): void {
    const grid = this.byId('cat-grid');
    if (!grid) return;
    grid.innerHTML = rows
      .map((c) => {
        const s = this.stats(c);
        const samples = c.meds.slice(0, 3).map((m) => '<span class="ph-pill">' + this.esc(m.name) + '</span>').join('');
        const more = c.meds.length > 3 ? '<span class="ph-pill">+' + (c.meds.length - 3) + '</span>' : '';

        return (
          '<article class="ph-cat ' + c.cls + (c.status === 'Archived' ? ' opacity-60' : '') + '" data-open="' + this.esc(c.id) + '" tabindex="0" role="button" ' +
          'aria-label="Open ' + this.esc(c.name) + ' category">' +
          '<div class="flex items-start gap-3">' +
          '<span class="ph-cat-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
          '<div class="min-w-0 flex-1"><div class="flex items-center gap-2">' +
          '<h3 class="text-sm font-bold text-gray-900 truncate mr-auto">' + this.esc(c.name) + '</h3>' +
          (s.controlled ? '<span class="ph-sched sched-2" title="Holds ' + s.controlled + ' controlled drug(s)"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + '</span>' : '') +
          '</div>' +
          '<p class="text-[10px] font-semibold text-gray-400">' + this.esc(c.code) + ' · ' + s.total + ' medicines</p></div>' +
          '<div class="relative grid place-items-center">' + this.ring(s.health, c.cls) + '<span class="ph-cat-ring-label">' + s.health + '%</span></div>' +
          '</div>' +
          '<p class="mt-3 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">' + this.esc(c.desc) + '</p>' +
          '<div class="mt-3 flex flex-wrap gap-1.5">' + samples + more + '</div>' +
          '<div class="mt-3 pt-3 border-t border-border-color dark:border-white/10 flex items-center gap-3 text-[10px] font-semibold">' +
          '<span class="inline-flex items-center gap-1 text-success"><i class="icon-circle-check text-[10px]" aria-hidden="true"></i>' + s.ok + ' ok</span>' +
          '<span class="inline-flex items-center gap-1 text-warning"><i class="icon-triangle-alert text-[10px]" aria-hidden="true"></i>' + s.low + ' low</span>' +
          '<span class="inline-flex items-center gap-1 text-danger"><i class="icon-circle-x text-[10px]" aria-hidden="true"></i>' + s.out + ' out</span>' +
          '<span class="ml-auto text-gray-900 font-extrabold">' + this.money(s.value) + '</span></div>' +
          '</article>'
        );
      })
      .join('');
  }

  private renderList(rows: Cat[]): void {
    const body = this.byId('list-body');
    if (!body) return;
    body.innerHTML = rows
      .map((c) => {
        const s = this.stats(c);
        const h = this.healthTone(s.health);
        const stockCls = h.tone.replace('tone-stable', 'stock-ok').replace('tone-medium', 'stock-low').replace('tone-critical', 'stock-out');
        const actions = [
          { label: 'View', icon: 'icon-eye', act: 'view' },
          { label: 'Edit', icon: 'icon-pencil', act: 'edit' },
          { label: c.status === 'Active' ? 'Archive' : 'Restore', icon: 'icon-archive', act: 'archive', danger: c.status === 'Active' },
        ];
        const actionsHtml =
          '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]"><button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><i class="icon-ellipsis-vertical text-sm"></i></button><div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">' +
          actions
            .map(
              (a) =>
                '<button type="button" role="menuitem" data-act="' + a.act + '" data-id="' + this.esc(c.id) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
                (a.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
                '"><i class="' + a.icon + ' text-sm"></i>' + a.label + '</button>',
            )
            .join('') +
          '</div></div>';

        return (
          '<tr class="hms-row ' + c.cls + (c.status === 'Archived' ? ' opacity-60' : '') + '">' +
          '<td class="hms-cell"><div class="flex items-center gap-3">' +
          '<span class="ph-cat-icon size-9! text-sm!"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
          '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate">' +
          '<a href="' + this.detailUrl(c) + '" class="hover:underline">' + this.esc(c.name) + '</a></p>' +
          '<p class="text-[10px] text-gray-400 truncate max-w-48">' + this.esc(c.desc) + '</p></div></div></td>' +
          '<td class="hms-cell"><span class="hms-chip tone-slate">' + this.esc(c.code) + '</span></td>' +
          '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.total + '</span></td>' +
          '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
          '<svg class="ph-stock ' + stockCls + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + s.health + ' percent stock health">' +
          '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
          '<rect x="0" y="0" width="' + s.health + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
          '<span class="text-xs font-extrabold text-gray-900 tabular-nums w-9 text-right">' + s.health + '%</span></div></td>' +
          '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + this.money(s.value) + '</span></td>' +
          '<td class="hms-cell">' + (s.controlled ? '<span class="ph-sched sched-2"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + '</span>' : '<span class="text-[11px] text-gray-300 dark:text-slate-600">—</span>') + '</td>' +
          '<td class="hms-cell">' + (c.status === 'Active' ? '<span class="badge badge-green">Active</span>' : '<span class="badge badge-gray">Archived</span>') + '</td>' +
          '<td class="hms-cell text-right">' + actionsHtml + '</td></tr>'
        );
      })
      .join('');
  }

  private render(): void {
    this.renderHero();
    this.renderKpis();
    const rows = this.visible();
    const count = this.byId('result-count');
    if (count) count.textContent = rows.length + ' shown';

    const empty = rows.length === 0;
    this.byId('empty-state')?.classList.toggle('hidden', !empty);

    if (this.mode === 'grid') {
      this.byId('grid-view')?.classList.toggle('hidden', empty);
      this.byId('list-view')?.classList.add('hidden');
      if (!empty) this.renderGrid(rows);
    } else {
      this.byId('list-view')?.classList.toggle('hidden', empty);
      this.byId('grid-view')?.classList.add('hidden');
      if (!empty) this.renderList(rows);
    }
  }

  private statTile(label: string, value: string | number, accentIcon: string): string {
    return (
      '<div class="rounded-xl border border-border-color dark:border-white/10 p-2.5 text-center">' +
      '<i class="' + accentIcon + ' text-sm text-gray-400" aria-hidden="true"></i>' +
      '<p class="mt-1 text-base font-extrabold text-gray-900 tabular-nums">' + value + '</p>' +
      '<p class="text-[9px] font-bold uppercase tracking-wide text-gray-400">' + label + '</p></div>'
    );
  }

  private openDrawer(id: string): void {
    const c = this.CATS.find((x) => x.id === id);
    if (!c) return;
    const s = this.stats(c);
    const h = this.healthTone(s.health);

    const icon = this.byId('dw-icon');
    if (icon) {
      icon.className = 'ph-cat-icon ' + c.cls + ' grid size-12 shrink-0 place-items-center rounded-2xl';
      icon.innerHTML = '<i class="' + c.icon + ' text-xl" aria-hidden="true"></i>';
    }
    const title = this.byId('dw-title');
    if (title) title.textContent = c.name;
    const sub = this.byId('dw-sub');
    if (sub) sub.textContent = c.code + ' · ' + s.total + ' medicines';

    const chips = this.byId('dw-chips');
    if (chips) {
      chips.innerHTML =
        '<span class="hms-chip ' + h.tone + '">' + h.label + ' · ' + s.health + '%</span>' +
        (s.controlled ? '<span class="ph-sched sched-2"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.controlled + ' controlled</span>' : '') +
        '<span class="hms-chip tone-slate">' + c.status + '</span>';
    }

    const desc = this.byId('dw-description');
    if (desc) desc.textContent = c.desc;

    const statsEl = this.byId('dw-stats');
    if (statsEl) {
      statsEl.innerHTML =
        this.statTile('Medicines', s.total, 'icon-pill') +
        this.statTile('In Stock', s.ok, 'icon-circle-check') +
        this.statTile('Low / Out', s.low + '/' + s.out, 'icon-triangle-alert') +
        this.statTile('Value', this.money(s.value), 'icon-dollar-sign');
    }

    const pct = (n: number) => (s.total ? Math.round((n / s.total) * 100) : 0);
    const healthEl = this.byId('dw-health');
    if (healthEl) {
      healthEl.innerHTML =
        '<div class="flex items-center gap-3 mb-2.5">' +
        '<div class="relative grid place-items-center ' + c.cls + '">' + this.ring(s.health, c.cls) + '<span class="ph-cat-ring-label">' + s.health + '%</span></div>' +
        '<div><p class="text-sm font-bold text-gray-900">' + h.label + ' stock health</p>' +
        '<p class="text-[11px] text-gray-400">' + s.ok + ' in stock, ' + s.low + ' low, ' + s.out + ' out</p></div></div>' +
        '<div class="flex h-2 w-full overflow-hidden rounded-full">' +
        '<svg class="h-full w-full" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label="Stock split">' +
        '<rect x="0" y="0" width="' + pct(s.ok) + '" height="8" fill="var(--color-success)"></rect>' +
        '<rect x="' + pct(s.ok) + '" y="0" width="' + pct(s.low) + '" height="8" fill="var(--color-warning)"></rect>' +
        '<rect x="' + (pct(s.ok) + pct(s.low)) + '" y="0" width="' + pct(s.out) + '" height="8" fill="var(--color-danger)"></rect></svg></div>';
    }

    const medsEl = this.byId('dw-meds');
    if (medsEl) {
      medsEl.innerHTML = c.meds
        .map((m) => {
          const st = this.medStatus(m);
          const badge = st === 'out' ? 'badge-red' : st === 'low' ? 'badge-amber' : 'badge-green';
          const lbl = st === 'out' ? 'Out' : st === 'low' ? 'Low' : 'OK';
          return (
            '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
            (m.ctrl ? '<i class="icon-shield text-[var(--ph-topical)] text-sm shrink-0" title="Controlled" aria-hidden="true"></i>' : '<i class="icon-pill text-gray-400 text-sm shrink-0" aria-hidden="true"></i>') +
            '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 truncate">' + this.esc(m.name) + '</p>' +
            '<p class="text-[10px] text-gray-400">' + m.stock.toLocaleString() + ' units · $' + m.price.toFixed(2) + '</p></div>' +
            '<span class="badge ' + badge + '">' + lbl + '</span></li>'
          );
        })
        .join('');
    }

    ['dw-act-edit', 'dw-act-add', 'dw-act-archive'].forEach((b) => {
      const el = this.byId(b);
      if (el) el.dataset['id'] = c.id;
    });
    const arch = this.byId('dw-act-archive');
    if (arch) arch.innerHTML = '<i class="icon-archive" aria-hidden="true"></i>' + (c.status === 'Active' ? 'Archive' : 'Restore');

    const drawer = this.byId('drawer');
    drawer?.classList.add('is-open');
    this.document.body.style.overflow = 'hidden';
    this.byId('dw-close')?.focus();
  }

  private closeDrawer(): void {
    this.byId('drawer')?.classList.remove('is-open');
    this.document.body.style.overflow = '';
  }

  private renderSwatches(): void {
    const el = this.byId('cm-swatches');
    if (!el) return;
    el.innerHTML = this.SWATCHES.map((s) => {
      const on = s.cls === this.pickCls;
      return (
        '<button type="button" data-swatch="' + s.cls + '" data-icon="' + s.icon + '" ' +
        'class="ph-cat-icon ' + s.cls + ' size-9! text-sm! ' + (on ? 'ring-2 ring-offset-2 ring-[var(--ph-accent)]' : '') + '" ' +
        'aria-pressed="' + on + '"><i class="' + s.icon + '" aria-hidden="true"></i></button>'
      );
    }).join('');
  }

  private openCat(id: string | null): void {
    this.editingId = id || null;
    const c = id ? this.CATS.find((x) => x.id === id) : null;
    const title = this.byId('cm-title');
    if (title) title.textContent = c ? 'Edit Category' : 'Add Category';
    (this.byId('cm-form') as HTMLFormElement | null)?.reset();

    if (c) {
      this.setValue('cm-name', c.name);
      this.setValue('cm-code', c.code);
      this.setValue('cm-desc', c.desc);
      this.pickCls = c.cls;
      this.pickIcon = c.icon;
    } else {
      this.pickCls = this.SWATCHES[0].cls;
      this.pickIcon = this.SWATCHES[0].icon;
    }
    this.renderSwatches();
    const w = this.document.defaultView as any;
    if (w?.HSOverlay) w.HSOverlay.open('#cat-modal');
  }

  private setValue(id: string, value: string): void {
    const el = this.byId(id) as HTMLInputElement | HTMLTextAreaElement | null;
    if (el) el.value = value;
  }

  private archiveCat(id: string): void {
    const c = this.CATS.find((x) => x.id === id);
    if (!c) return;
    c.status = c.status === 'Active' ? 'Archived' : 'Active';
    this.render();
    this.toast(c.name + (c.status === 'Active' ? ' restored.' : ' archived.'), c.status === 'Active' ? 'success' : 'info');
  }

  private setMode(next: 'grid' | 'list'): void {
    this.mode = next;
    const grid = next === 'grid';
    const viewGrid = this.byId('view-grid');
    if (viewGrid) {
      viewGrid.className = 'grid size-8 place-items-center rounded-lg ' + (grid ? 'text-white bg-white/20' : 'text-white/60 hover:text-white');
      viewGrid.setAttribute('aria-pressed', String(grid));
    }
    const viewList = this.byId('view-list');
    if (viewList) {
      viewList.className = 'grid size-8 place-items-center rounded-lg ' + (grid ? 'text-white/60 hover:text-white' : 'text-white bg-white/20');
      viewList.setAttribute('aria-pressed', String(!grid));
    }
    this.render();
  }
}
