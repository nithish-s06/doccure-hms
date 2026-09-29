import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Order {
  id: string;
  cancelled: boolean;
  draft?: boolean;
  supplier: string;
  items: number;
  received: number;
  value: number;
  expected: string;
  placed: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "pharmacy-purchase-orders"
 * (pharmacy-purchase-orders.html). Purchase-order tracking with send/receive/
 * cancel actions. Static demo data — no API.
 *
 * The ported template has no po-modal / rc-modal / del-modal markup (Preline
 * modal conversion note in script.js), so the open*()/confirmDelete() calls
 * below find nothing to open — search/filter, send/receive/cancel status
 * changes and the toast-only buttons are the wired, visible behavior.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-purchase-orders',
  styleUrl: './pharmacy-purchase-orders.css',
  templateUrl: './pharmacy-purchase-orders.html',
})
export class PharmacyPurchaseOrders implements AfterViewInit {
  private seq = 4170;
  private mk(o: Partial<Order>): Order {
    this.seq++;
    return Object.assign({ id: 'PO-' + this.seq, cancelled: false } as Order, o);
  }

  private ORDERS: Order[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.ORDERS = [
      this.mk({ supplier: 'McKesson', items: 8, received: 8, value: 18400, expected: '12 Jul 2026', placed: '05 Jul' }),
      this.mk({ supplier: 'Cardinal Health', items: 5, received: 5, value: 9600, expected: '14 Jul 2026', placed: '07 Jul' }),
      this.mk({ supplier: 'AmerisourceBergen', items: 6, received: 4, value: 12750, expected: '17 Jul 2026', placed: '09 Jul' }),
      this.mk({ supplier: 'Cencora', items: 4, received: 0, value: 7300, expected: '19 Jul 2026', placed: '11 Jul' }),
      this.mk({ supplier: 'McKesson', items: 9, received: 3, value: 21050, expected: '18 Jul 2026', placed: '10 Jul' }),
      this.mk({ supplier: 'Morris & Dickson', items: 3, received: 0, value: 4200, expected: '22 Jul 2026', placed: '14 Jul' }),
      this.mk({ supplier: 'Cardinal Health', items: 7, received: 0, value: 15900, expected: '—', placed: '16 Jul', draft: true }),
      this.mk({ supplier: 'Cencora', items: 2, received: 0, value: 1800, expected: '20 Jul 2026', placed: '13 Jul', cancelled: true }),
    ];
  }

  ngAfterViewInit(): void {
    // Hero/KPIs are already correct in the static HTML for the initial
    // ORDERS state, and the supplier <option>s are baked in too; only the
    // order grid needs an initial render.
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
        const o = this.ORDERS.find((x) => x.id === btn.dataset['id']);
        if (!o) return;
        const act = btn.dataset['act'];

        if (act === 'send') {
          o.draft = false;
          o.expected = '24 Jul 2026';
          this.patchRow(o);
          this.renderAll();
          this.toast(o.id + ' sent to ' + o.supplier + '.', 'success');
        } else if (act === 'receive') {
          const rcSub = this.byId('rc-sub');
          if (rcSub) rcSub.textContent = o.id + ' · ' + o.supplier + ' · ' + o.received + '/' + o.items + ' received';
          const rcItems = this.byId('rc-items') as HTMLInputElement | null;
          if (rcItems) rcItems.value = String(o.items - o.received);
          const rcNotes = this.byId('rc-notes') as HTMLTextAreaElement | null;
          if (rcNotes) rcNotes.value = '';
          const rcSave = this.byId('rc-save');
          if (rcSave) rcSave.dataset['id'] = o.id;
          this.openModal('rc-modal');
        } else if (act === 'cancel') {
          this.confirmDelete(o.id + ' (' + o.supplier + ')', () => {
            o.cancelled = true;
            this.patchRow(o);
            this.renderAll();
            this.toast(o.id + ' cancelled.', 'info');
          });
        } else if (act === 'print') {
          this.toast(o.id + ' sent to the printer.', 'info');
          window.print();
        }
      });
    }

    const btnAdd = this.byId('btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const form = this.byId('pm-form') as HTMLFormElement | null;
        if (form) form.reset();
        this.openModal('po-modal');
      });
    }
    const btnPrint = this.byId('btn-print');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        this.toast('Purchase order list sent to the printer.', 'info');
        window.print();
      });
    }

    const pmSave = this.byId('pm-save');
    if (pmSave) {
      pmSave.addEventListener('click', () => {
        const items = parseInt(this.getValue('pm-items'), 10);
        if (!items || items < 1) return this.toast('Enter the number of line items.', 'error');
        const supplier = this.getValue('pm-supplier');
        const o = this.mk({
          supplier,
          items,
          received: 0,
          value: parseFloat(this.getValue('pm-value')) || 0,
          expected: this.getValue('pm-expected').trim() || '—',
          placed: '17 Jul',
          draft: true,
        });
        this.ORDERS.unshift(o);
        this.byId('grid-body')?.insertAdjacentHTML('afterbegin', this.rowHTML(o));
        const w = window as any;
        if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
        this.closeModal('po-modal');
        this.renderAll();
        this.toast('Draft PO created for ' + supplier + '.', 'success');
        return undefined;
      });
    }

    const rcSave = this.byId('rc-save');
    if (rcSave) {
      rcSave.addEventListener('click', () => {
        const o = this.ORDERS.find((x) => x.id === rcSave.dataset['id']);
        if (!o) return;
        const n = parseInt(this.getValue('rc-items'), 10);
        if (!n || n < 1) return this.toast('Enter how many items arrived.', 'error');
        o.received = Math.min(o.items, o.received + n);
        this.patchRow(o);
        this.closeModal('rc-modal');
        this.renderAll();
        this.toast(o.id + ' — ' + this.status(o).label + ' (' + o.received + '/' + o.items + ').', 'success');
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
    return '$' + n.toLocaleString();
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

  private status(o: Order): { label: string; badge: string } {
    if (o.cancelled) return { label: 'Cancelled', badge: 'badge-gray' };
    if (o.draft) return { label: 'Draft', badge: 'badge-blue' };
    if (o.received >= o.items) return { label: 'Received', badge: 'badge-green' };
    if (o.received > 0) return { label: 'Partially Received', badge: 'badge-amber' };
    return { label: 'Sent', badge: 'badge-purple' };
  }

  private detailUrl(o: Order): string {
    const s = this.status(o);
    return 'pharmacy-purchase-order-detail.html?' + new URLSearchParams({
      id: o.id, supplier: o.supplier, items: String(o.items), received: String(o.received),
      value: String(o.value), expected: o.expected, placed: o.placed, status: s.label,
    }).toString();
  }

  /* ---------------- render ---------------- */

  private renderHero(): void {
    const open = this.ORDERS.filter((o) => !o.cancelled && this.status(o).label !== 'Received').length;
    const partial = this.ORDERS.filter((o) => this.status(o).label === 'Partially Received').length;
    const flag = partial >= 3 ? { cls: 'tone-medium', text: 'Deliveries Split' } : { cls: 'tone-stable', text: 'Procurement Flowing' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = this.ORDERS.length + ' orders · ' + open + ' open';
  }

  private renderKpis(): void {
    const by = (l: string) => this.ORDERS.filter((o) => this.status(o).label === l).length;
    const openValue = this.ORDERS.filter((o) => !o.cancelled && this.status(o).label !== 'Received').reduce((s, o) => s + o.value, 0);

    const set = (id: string, v: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('kpi-total', this.ORDERS.length);
    set('kpi-draft', by('Draft'));
    set('kpi-sent', by('Sent'));
    set('kpi-partial', by('Partially Received'));
    set('kpi-received', by('Received'));
    set('kpi-value', '$' + Math.round(openValue / 1000) + 'k');
  }

  private rowHTML(o: Order): string {
    const s = this.status(o);
    const pct = o.items ? Math.round((o.received / o.items) * 100) : 0;
    const tone = pct >= 100 ? 'stock-ok' : pct > 0 ? 'stock-low' : 'stock-out';
    const acts: { label: string; icon: string; act: string; danger?: boolean }[] = [{ label: 'Print', icon: 'icon-printer', act: 'print' }];
    if (s.label === 'Draft') acts.unshift({ label: 'Send to Supplier', icon: 'icon-send', act: 'send' });
    if (s.label === 'Sent' || s.label === 'Partially Received') acts.unshift({ label: 'Receive Delivery', icon: 'icon-package-check', act: 'receive' });
    if (!o.cancelled && s.label !== 'Received') acts.push({ label: 'Cancel PO', icon: 'icon-x', act: 'cancel', danger: true });

    return (
      '<tr class="hms-row' + (o.cancelled ? ' opacity-60' : '') + '" data-row-id="' + this.esc(o.id) + '">' +
      '<td class="hms-cell"><a href="' + this.detailUrl(o) + '" class="font-mono text-[11px] font-bold text-primary hover:underline">' + this.esc(o.id) + '</a>' +
      '<p class="text-[10px] text-gray-400">placed ' + this.esc(o.placed) + '</p></td>' +
      '<td class="hms-cell"><span class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(o.supplier) + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + o.items + '</span></td>' +
      '<td class="hms-cell"><div class="flex items-center gap-2 min-w-28">' +
      '<svg class="ph-stock ' + tone + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + o.received + ' of ' + o.items + ' items received">' +
      '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
      '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
      '<span class="text-xs font-extrabold text-gray-900 tabular-nums">' + o.received + '/' + o.items + '</span></div></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + this.money(o.value) + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs text-gray-600 dark:text-gray-300">' + this.esc(o.expected) + '</span></td>' +
      '<td class="hms-cell"><span class="badge ' + s.badge + '">' + s.label + '</span></td>' +
      '<td class="hms-cell text-right">' + this.actions(o.id, acts) + '</td></tr>'
    );
  }

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const st = this.getValue('filter-status');
    const rows = this.ORDERS.filter((o) => {
      const hit = !q || o.id.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q);
      return hit && (!st || this.status(o).label === st);
    });
    const visible = new Set(rows.map((o) => o.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' order' : ' orders');

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

  private patchRow(o: Order): void {
    const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + o.id + '"]');
    if (rowEl) rowEl.outerHTML = this.rowHTML(o);
    const w = window as any;
    if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderGrid();
  }
}
