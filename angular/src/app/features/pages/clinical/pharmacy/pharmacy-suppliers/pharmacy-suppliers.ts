import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  cats: string[];
  onTime: number;
  openPos: number;
  spend: number;
  status: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-suppliers',
  styleUrl: './pharmacy-suppliers.css',
  templateUrl: './pharmacy-suppliers.html',
})
export class PharmacySuppliers implements AfterViewInit {
  AllRoutes = All_Routes;
  private seq = 0;
  private mk(o: Partial<Supplier>): Supplier {
    this.seq++;
    return Object.assign({ id: 'SUP-' + String(this.seq).padStart(2, '0') } as Supplier, o);
  }

  private SUPPLIERS: Supplier[] = [];

  private editingId: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.SUPPLIERS = [
      this.mk({ name: 'McKesson', contact: 'Dana Whitcomb', email: 'orders@mckesson.com', phone: '(415) 983-8300', city: 'Irving, TX', cats: ['Analgesics', 'Endocrine'], onTime: 97, openPos: 3, spend: 412000, status: 'Preferred' }),
      this.mk({ name: 'Cardinal Health', contact: 'Luis Herrera', email: 'supply@cardinalhealth.com', phone: '(614) 757-5000', city: 'Dublin, OH', cats: ['Antibiotics', 'CNS'], onTime: 94, openPos: 2, spend: 286000, status: 'Preferred' }),
      this.mk({ name: 'AmerisourceBergen', contact: 'Renee Caldwell', email: 'po@amerisourcebergen.com', phone: '(610) 727-7000', city: 'Conshohocken, PA', cats: ['Analgesics', 'Endocrine'], onTime: 91, openPos: 4, spend: 231000, status: 'Approved' }),
      this.mk({ name: 'Cencora', contact: 'Piotr Zielinski', email: 'orders@cencora.com', phone: '(610) 727-7429', city: 'Philadelphia, PA', cats: ['Cardiovascular', 'Gastrointestinal'], onTime: 88, openPos: 1, spend: 174000, status: 'Approved' }),
      this.mk({ name: 'Morris & Dickson', contact: 'Abby Lantz', email: 'sales@morrisdickson.com', phone: '(318) 424-5462', city: 'Shreveport, LA', cats: ['Gastrointestinal', 'Cardiovascular'], onTime: 82, openPos: 2, spend: 96000, status: 'Approved' }),
      this.mk({ name: 'Henry Schein', contact: 'Tobias Grant', email: 'rx@henryschein.com', phone: '(631) 843-5500', city: 'Melville, NY', cats: ['Respiratory'], onTime: 64, openPos: 0, spend: 41000, status: 'On Hold' }),
    ];
  }

  ngAfterViewInit(): void {
    // Hero/KPIs are already correct in the static HTML for the initial
    // SUPPLIERS state; only the supplier grid needs an initial render.
    this.renderGrid();

    const search = this.byId('search');
    if (search) search.addEventListener('input', () => this.renderGrid());
    const filterStatus = this.byId('filter-status');
    if (filterStatus) filterStatus.addEventListener('change', () => this.renderGrid());

    const gridBody = this.byId('grid-body');
    if (gridBody) {
      gridBody.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
        if (!btn) return;
        const s = this.SUPPLIERS.find((x) => x.id === btn.dataset['id']);
        if (!s) return;
        if (btn.dataset['act'] === 'edit') this.openSup(s.id);
        else if (btn.dataset['act'] === 'po') this.toast('New purchase order started for ' + s.name + ' — continue on Purchase Orders.', 'info');
        else if (btn.dataset['act'] === 'hold') {
          if (s.status !== 'On Hold') {
            this.confirmDelete(s.name + ' (put on hold)', () => {
              s.status = 'On Hold';
              this.patchRow(s);
              this.renderAll();
              this.toast(s.name + ' placed on hold — no new orders.', 'info');
            });
          } else {
            s.status = 'Approved';
            this.patchRow(s);
            this.renderAll();
            this.toast(s.name + ' hold released.', 'success');
          }
        }
      });
    }

    const btnAdd = this.byId('btn-add');
    if (btnAdd) btnAdd.addEventListener('click', () => this.openSup(null));
    const btnExport = this.byId('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => this.toast('Supplier directory exported — ' + this.SUPPLIERS.length + ' vendors.', 'success'));

    const smSave = this.byId('sm-save');
    if (smSave) {
      smSave.addEventListener('click', () => {
        const name = this.getValue('sm-name').trim();
        if (!name) return this.toast('Enter the company name.', 'error');
        const data = {
          name,
          contact: this.getValue('sm-contact').trim() || '—',
          email: this.getValue('sm-email').trim() || '—',
          phone: this.getValue('sm-phone').trim() || '—',
          city: this.getValue('sm-city').trim() || '—',
          status: this.getValue('sm-status'),
          cats: this.getValue('sm-cats').split(',').map((c) => c.trim()).filter(Boolean),
        };
        if (this.editingId) {
          const s = this.SUPPLIERS.find((x) => x.id === this.editingId);
          if (s) {
            Object.assign(s, data);
            this.patchRow(s);
            this.toast(name + ' updated.', 'success');
          }
        } else {
          const s = this.mk(Object.assign({ onTime: 100, openPos: 0, spend: 0 }, data));
          this.SUPPLIERS.unshift(s);
          const emptyRow = this.byId('grid-empty-row');
          if (emptyRow) emptyRow.insertAdjacentHTML('beforebegin', this.rowHTML(s));
          else this.byId('grid-body')?.insertAdjacentHTML('beforeend', this.rowHTML(s));
          const w = window as any;
          if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
          this.toast(name + ' added to the directory.', 'success');
        }
        this.closeModal('sup-modal');
        this.renderAll();
        return undefined;
      });
    }

    this.initDeleteModal();
    this.closeOnBackdrop('del-modal');
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      this.closeModal('del-modal');
    });
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private getValue(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private money(n: number): string {
    return '$' + (n / 1000).toFixed(0) + 'k';
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): undefined {
    this.toastService.show(message, tone);
    return undefined;
  }

  /* ---------------- shared MC-style modal helpers ---------------- */

  private delCallback: (() => void) | null = null;

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    const w = window as any;
    if (el.classList.contains('hs-overlay') && w.HSOverlay) {
      w.HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    const w = window as any;
    if (el.classList.contains('hs-overlay') && w.HSOverlay) {
      w.HSOverlay.close(el);
      return;
    }
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private confirmDelete(name: string, onConfirm: () => void): void {
    const delName = this.byId('del-name');
    if (delName) delName.textContent = name;
    this.delCallback = onConfirm;
    this.openModal('del-modal');
  }

  private initDeleteModal(): void {
    const btn = this.byId('del-confirm-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
        this.closeModal('del-modal');
      });
    }
    const cancel = this.byId('del-cancel-btn');
    if (cancel) cancel.addEventListener('click', () => this.closeModal('del-modal'));
  }

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    if (el) {
      el.addEventListener('mousedown', (e: Event) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }

  private actions(id: string, items: { label: string; icon: string; act: string; danger?: boolean }[]): string {
    let html =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
      '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">' +
      '<i class="icon-ellipsis-vertical text-sm"></i></button>' +
      '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">';
    items.forEach((it) => {
      html +=
        '<button type="button" role="menuitem" data-act="' + it.act + '" data-id="' + id + '" ' +
        'class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
        (it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
        '"><i class="' + it.icon + ' text-sm"></i>' + it.label + '</button>';
    });
    return html + '</div></div>';
  }

  /* ---------------- derived ---------------- */

  private onTimeTone(p: number): string {
    if (p >= 90) return 'stock-ok';
    if (p >= 75) return 'stock-low';
    return 'stock-out';
  }

  private detailUrl(s: Supplier): string {
    return 'pharmacy-supplier-detail.html?' + new URLSearchParams({ id: s.id, name: s.name, status: s.status }).toString();
  }

  private STATUS: Record<string, string> = { Preferred: 'badge-green', Approved: 'badge-blue', 'On Hold': 'badge-amber' };

  /* ---------------- render ---------------- */

  private renderHero(): void {
    const hold = this.SUPPLIERS.filter((s) => s.status === 'On Hold').length;
    const flag = hold >= 2 ? { cls: 'tone-critical', text: hold + ' On Hold' } : hold === 1 ? { cls: 'tone-medium', text: '1 On Hold' } : { cls: 'tone-stable', text: 'Supply Chain Healthy' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = this.SUPPLIERS.length + ' suppliers · ' + this.SUPPLIERS.reduce((s, x) => s + x.openPos, 0) + ' open POs';
  }

  private renderKpis(): void {
    const preferred = this.SUPPLIERS.filter((s) => s.status === 'Preferred').length;
    const hold = this.SUPPLIERS.filter((s) => s.status === 'On Hold').length;
    const openPos = this.SUPPLIERS.reduce((s, x) => s + x.openPos, 0);
    const spend = this.SUPPLIERS.reduce((s, x) => s + x.spend, 0);
    const avgOnTime = Math.round(this.SUPPLIERS.reduce((s, x) => s + x.onTime, 0) / this.SUPPLIERS.length);

    const set = (id: string, value: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(value);
    };
    set('kpi-total', this.SUPPLIERS.length);
    set('kpi-preferred', preferred);
    set('kpi-hold', hold);
    set('kpi-pos', openPos);
    set('kpi-ontime', avgOnTime + '%');
    set('kpi-spend', this.money(spend));
  }

  private rowHTML(s: Supplier): string {
    const tone = this.onTimeTone(s.onTime);
    return (
      '<tr class="hms-row" data-row-id="' + this.esc(s.id) + '">' +
      '<td class="hms-cell"><div class="flex items-center gap-3">' +
      '<span class="hms-member-avatar ph-primary size-9! rounded-full!"><i class="icon-building-2 text-sm" aria-hidden="true"></i></span>' +
      '<div class="min-w-0"><p class="text-xs font-bold"><a class="text-primary hover:underline truncate" href="' + this.detailUrl(s) + '">' + this.esc(s.name) + '</a></p>' +
      '<p class="text-[10px] text-gray-400">' + this.esc(s.id) + ' · ' + this.esc(s.city) + '</p></div></div></td>' +
      '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(s.contact) + '</p>' +
      '<p class="text-[10px] text-gray-400">' + this.esc(s.email) + '</p></td>' +
      '<td class="hms-cell"><div class="flex flex-wrap gap-1">' + s.cats.map((c) => '<span class="hms-chip tone-info">' + this.esc(c) + '</span>').join('') + '</div></td>' +
      '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
      '<svg class="ph-stock ' + tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + s.onTime + ' percent on time">' +
      '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
      '<rect x="0" y="0" width="' + s.onTime + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
      '<span class="text-xs font-extrabold text-gray-900 tabular-nums w-9 text-right">' + s.onTime + '%</span></div></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.openPos + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + this.money(s.spend) + '</span></td>' +
      '<td class="hms-cell"><span class="badge ' + this.STATUS[s.status] + '">' + s.status + '</span></td>' +
      '<td class="hms-cell text-right">' +
      this.actions(s.id, [
        { label: 'Edit', icon: 'icon-pencil', act: 'edit' },
        { label: 'New PO', icon: 'icon-clipboard-list', act: 'po' },
        { label: s.status === 'On Hold' ? 'Release Hold' : 'Put On Hold', icon: 'icon-pause', act: 'hold', danger: s.status !== 'On Hold' },
      ]) +
      '</td></tr>'
    );
  }

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const status = this.getValue('filter-status');
    const rows = this.SUPPLIERS.filter((s) => {
      const hit = !q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
      return hit && (!status || s.status === status);
    });
    const visible = new Set(rows.map((s) => s.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' supplier' : ' suppliers');

    let anyVisible = false;
    this.byId('grid-body')
      ?.querySelectorAll('[data-row-id]')
      .forEach((tr) => {
        const el = tr as HTMLElement;
        const show = visible.has(el.dataset['rowId'] || '');
        el.classList.toggle('hidden', !show);
        if (show) anyVisible = true;
      });
    const emptyRow = this.byId('grid-empty-row');
    if (emptyRow) emptyRow.classList.toggle('hidden', anyVisible);
  }

  private patchRow(s: Supplier): void {
    const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + s.id + '"]');
    if (rowEl) rowEl.outerHTML = this.rowHTML(s);
    const w = window as any;
    if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderGrid();
  }

  private openSup(id: string | null): void {
    this.editingId = id;
    const s = id ? this.SUPPLIERS.find((x) => x.id === id) : null;
    const title = this.byId('sm-title');
    if (title) title.textContent = s ? 'Edit Supplier' : 'Add Supplier';
    const form = this.byId('sm-form') as HTMLFormElement | null;
    if (form) form.reset();
    if (s) {
      const set = (id2: string, v: string) => {
        const el = this.byId(id2) as HTMLInputElement | HTMLSelectElement | null;
        if (el) el.value = v;
      };
      set('sm-name', s.name);
      set('sm-contact', s.contact);
      set('sm-email', s.email);
      set('sm-phone', s.phone);
      set('sm-city', s.city);
      set('sm-status', s.status);
      set('sm-cats', s.cats.join(', '));
    }
    this.openModal('sup-modal');
  }
}
