import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Batch {
  id: string;
  med: string;
  batch: string;
  location: string;
  qty: number;
  reorder: number;
  days: number;
  expiry: string;
  price: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "pharmacy-inventory" (pharmacy-inventory.html).
 * Stock batches across locations, with adjust/move/write-off actions. Static
 * demo data — no API. Days-until-expiry are stored relative to a fixed "today"
 * (17 Jul 2026) so the demo needs no Date.now() while remaining internally
 * consistent.
 *
 * The ported template has no adj-modal / del-modal markup (Preline modal
 * conversion note in script.js), so openAdjust()/confirmDelete() below find
 * nothing to open — search/filter, move-location and the toast-only buttons
 * are the wired, visible behavior.
 */
@Component({
  imports: [],
  selector: 'app-pharmacy-inventory',
  styleUrl: './pharmacy-inventory.css',
  templateUrl: './pharmacy-inventory.html',
})
export class PharmacyInventory implements AfterViewInit {
  private BATCHES: Batch[] = [
    { id: 'BT-8801', med: 'Tylenol 500 mg', batch: 'TY26H114', location: 'Main Pharmacy', qty: 5200, reorder: 1500, days: 412, expiry: 'Sep 2027', price: 0.08 },
    { id: 'BT-8802', med: 'Tylenol 500 mg', batch: 'TY26D077', location: 'ED Satellite', qty: 900, reorder: 400, days: 168, expiry: 'Jan 2027', price: 0.08 },
    { id: 'BT-8803', med: 'Amoxil 500 mg', batch: 'AMX2609', location: 'Main Pharmacy', qty: 4100, reorder: 1200, days: 290, expiry: 'May 2027', price: 0.22 },
    { id: 'BT-8804', med: 'Ventolin Inhaler', batch: 'VEN26K3', location: 'ED Satellite', qty: 310, reorder: 120, days: 74, expiry: 'Sep 2026', price: 4.6 },
    { id: 'BT-8805', med: 'Humulin R', batch: 'HUM26C8', location: 'Cold Chain', qty: 480, reorder: 200, days: 58, expiry: 'Sep 2026', price: 6.2 },
    { id: 'BT-8806', med: 'Ativan 2 mg/mL', batch: 'ATV26F2', location: 'OR Store', qty: 140, reorder: 180, days: 132, expiry: 'Nov 2026', price: 1.12 },
    { id: 'BT-8807', med: 'Zofran 4 mg', batch: 'ZOF26J9', location: 'OR Store', qty: 760, reorder: 300, days: 233, expiry: 'Mar 2027', price: 0.74 },
    { id: 'BT-8808', med: 'Augmentin Syrup', batch: 'AUG26B4', location: 'Main Pharmacy', qty: 220, reorder: 250, days: 41, expiry: 'Aug 2026', price: 0.9 },
    { id: 'BT-8809', med: 'Lipitor 20 mg', batch: 'LIP26M1', location: 'Main Pharmacy', qty: 3900, reorder: 1000, days: 502, expiry: 'Dec 2027', price: 0.31 },
    { id: 'BT-8810', med: 'Coumadin 5 mg', batch: 'COU26A6', location: 'Main Pharmacy', qty: 1600, reorder: 700, days: 85, expiry: 'Oct 2026', price: 0.19 },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    // Hero/KPIs are already correct in the static HTML for the initial
    // BATCHES state; only the batch grid needs an initial render.
    this.renderGrid();

    const search = this.byId('search');
    if (search) search.addEventListener('input', () => this.renderGrid());
    const filterLocation = this.byId('filter-location');
    if (filterLocation) filterLocation.addEventListener('change', () => this.renderGrid());
    const filterState = this.byId('filter-state');
    if (filterState) filterState.addEventListener('change', () => this.renderGrid());

    const gridBody = this.byId('grid-body');
    if (gridBody) {
      gridBody.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
        if (!btn) return;
        const b = this.BATCHES.find((x) => x.id === btn.dataset['id']);
        if (!b) return;
        if (btn.dataset['act'] === 'adjust') this.openAdjust(b.id);
        else if (btn.dataset['act'] === 'move') {
          b.location = b.location === 'Main Pharmacy' ? 'ED Satellite' : 'Main Pharmacy';
          const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + b.id + '"]');
          if (rowEl) rowEl.outerHTML = this.rowHTML(b);
          const w = window as any;
          if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
          this.renderAll();
          this.toast(b.batch + ' moved to ' + b.location + '.', 'success');
        } else if (btn.dataset['act'] === 'writeoff') {
          this.confirmDelete(b.med + ' batch ' + b.batch, () => {
            this.BATCHES = this.BATCHES.filter((x) => x.id !== b.id);
            const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + b.id + '"]');
            if (rowEl) rowEl.remove();
            this.renderAll();
            this.toast(b.batch + ' written off and removed from stock.', 'info');
          });
        }
      });
    }

    const btnAdjust = this.byId('btn-adjust');
    if (btnAdjust) btnAdjust.addEventListener('click', () => this.openAdjust(null));
    const btnCount = this.byId('btn-count');
    if (btnCount) btnCount.addEventListener('click', () => this.toast('Cycle count started — ' + this.BATCHES.length + ' batches on the sheet.', 'info'));
    const btnExport = this.byId('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => this.toast('Inventory exported — ' + this.BATCHES.length + ' batches.', 'success'));

    // Selecting a batch in the modal pre-fills its current quantity.
    const amBatch = this.byId('am-batch') as HTMLSelectElement | null;
    if (amBatch) {
      amBatch.addEventListener('change', () => {
        const b = this.BATCHES.find((x) => x.id === amBatch.value);
        const amQty = this.byId('am-qty') as HTMLInputElement | null;
        if (b && amQty) amQty.value = String(b.qty);
      });
    }
    const amSave = this.byId('am-save');
    if (amSave) {
      amSave.addEventListener('click', () => {
        const b = this.BATCHES.find((x) => x.id === this.getValue('am-batch'));
        if (!b) return;
        const qty = parseInt(this.getValue('am-qty'), 10);
        if (isNaN(qty) || qty < 0) return this.toast('Enter a valid quantity.', 'error');
        const delta = qty - b.qty;
        b.qty = qty;
        const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + b.id + '"]');
        if (rowEl) rowEl.outerHTML = this.rowHTML(b);
        const w = window as any;
        if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
        this.renderAll();
        this.toast(b.batch + ' adjusted ' + (delta >= 0 ? '+' : '') + delta.toLocaleString() + ' (' + this.getValue('am-reason') + ').', 'success');
        this.closeModal('adj-modal');
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
    return '$' + Math.round(n).toLocaleString();
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

  private state(b: Batch): { key: string; label: string; badge: string; tone: string } {
    if (b.days <= 90) return { key: 'expiring', label: 'Expiring ' + b.days + 'd', badge: 'badge-amber', tone: 'stock-low' };
    if (b.qty <= b.reorder) return { key: 'low', label: 'Below Reorder', badge: 'badge-red', tone: 'stock-out' };
    return { key: 'ok', label: 'Healthy', badge: 'badge-green', tone: 'stock-ok' };
  }

  private detailUrl(b: Batch): string {
    return 'pharmacy-inventory-detail.html?' + new URLSearchParams({
      id: b.id, med: b.med, batch: b.batch, location: b.location,
      qty: String(b.qty), reorder: String(b.reorder), days: String(b.days), expiry: b.expiry, price: String(b.price),
    }).toString();
  }

  /* ---------------- render ---------------- */

  private renderHero(): void {
    const low = this.BATCHES.filter((b) => this.state(b).key === 'low').length;
    const exp = this.BATCHES.filter((b) => this.state(b).key === 'expiring').length;
    const flag =
      low + exp >= 5
        ? { cls: 'tone-critical', text: 'Stock Attention Needed' }
        : low + exp >= 2
          ? { cls: 'tone-medium', text: low + exp + ' Batches Flagged' }
          : { cls: 'tone-stable', text: 'Stock Healthy' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = this.BATCHES.length + ' batches · ' + this.BATCHES.reduce((s, b) => s + b.qty, 0).toLocaleString() + ' units';
  }

  private renderKpis(): void {
    const units = this.BATCHES.reduce((s, b) => s + b.qty, 0);
    const value = this.BATCHES.reduce((s, b) => s + b.qty * b.price, 0);
    const low = this.BATCHES.filter((b) => this.state(b).key === 'low').length;
    const exp = this.BATCHES.filter((b) => this.state(b).key === 'expiring').length;
    const cold = this.BATCHES.filter((b) => b.location === 'Cold Chain').length;

    const set = (id: string, v: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('kpi-batches', this.BATCHES.length);
    set('kpi-units', units.toLocaleString());
    set('kpi-low', low);
    set('kpi-exp', exp);
    set('kpi-cold', cold);
    set('kpi-value', '$' + Math.round(value / 1000) + 'k');
  }

  private rowHTML(b: Batch): string {
    const s = this.state(b);
    const pct = Math.min(100, Math.round((b.qty / (b.reorder * 2)) * 100));
    return (
      '<tr class="hms-row" data-row-id="' + this.esc(b.id) + '">' +
      '<td class="hms-cell"><p class="text-xs font-bold text-gray-900">' + this.esc(b.med) + '</p>' +
      '<a href="' + this.detailUrl(b) + '" class="text-[10px] text-gray-400 hover:text-primary hover:underline">' + this.esc(b.id) + '</a></td>' +
      '<td class="hms-cell"><span class="font-mono text-[11px] font-bold text-gray-900">' + this.esc(b.batch) + '</span></td>' +
      '<td class="hms-cell"><span class="hms-chip tone-info">' + this.esc(b.location) + '</span></td>' +
      '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
      '<svg class="ph-stock ' + s.tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + b.qty + ' units">' +
      '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
      '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
      '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + b.qty.toLocaleString() + '</span></div>' +
      '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">reorder @ ' + b.reorder.toLocaleString() + '</p></td>' +
      '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(b.expiry) + '</p>' +
      '<p class="text-[10px] ' + (b.days <= 90 ? 'font-bold text-warning' : 'text-gray-400') + '">' + b.days + ' days</p></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + this.money(b.qty * b.price) + '</span></td>' +
      '<td class="hms-cell"><span class="badge ' + s.badge + '">' + s.label + '</span></td>' +
      '<td class="hms-cell text-right">' +
      this.actions(b.id, [
        { label: 'Adjust Quantity', icon: 'icon-scale', act: 'adjust' },
        { label: 'Move Location', icon: 'icon-arrow-right-left', act: 'move' },
        { label: 'Write Off Batch', icon: 'icon-trash-2', act: 'writeoff', danger: true },
      ]) +
      '</td></tr>'
    );
  }

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const loc = this.getValue('filter-location');
    const st = this.getValue('filter-state');

    const rows = this.BATCHES.filter((b) => {
      const hit = !q || b.med.toLowerCase().includes(q) || b.batch.toLowerCase().includes(q);
      return hit && (!loc || b.location === loc) && (!st || this.state(b).key === st);
    });
    const visible = new Set(rows.map((b) => b.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' batch' : ' batches');

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

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderGrid();
  }

  private openAdjust(id: string | null): void {
    const amBatch = this.byId('am-batch') as HTMLSelectElement | null;
    if (amBatch) {
      amBatch.innerHTML = this.BATCHES.map(
        (b) => '<option value="' + this.esc(b.id) + '"' + (b.id === id ? ' selected' : '') + '>' + this.esc(b.med) + ' — ' + this.esc(b.batch) + ' (' + b.qty.toLocaleString() + ')</option>'
      ).join('');
    }
    const b = this.BATCHES.find((x) => x.id === (id || this.BATCHES[0]?.id));
    const amQty = this.byId('am-qty') as HTMLInputElement | null;
    if (amQty) amQty.value = b ? String(b.qty) : '';
    const amNotes = this.byId('am-notes') as HTMLTextAreaElement | null;
    if (amNotes) amNotes.value = '';
    this.openModal('adj-modal');
  }
}
