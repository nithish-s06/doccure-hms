import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';

interface Sale {
  id: string;
  customer: string;
  items: number;
  pay: string;
  amount: number;
  time: string;
  status: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-sales',
  styleUrl: './pharmacy-sales.css',
  templateUrl: './pharmacy-sales.html',
})
export class PharmacySales implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STATUS: Record<string, string> = { Paid: 'badge-green', 'Pending Claim': 'badge-amber', Refunded: 'badge-gray' };
  private readonly PAY_ICON: Record<string, string> = { Cash: 'icon-banknote', Card: 'icon-credit-card', Insurance: 'icon-shield' };

  private seq = 90210;
  private mk(o: Partial<Sale>): Sale {
    this.seq++;
    return Object.assign({ id: 'INV-' + this.seq } as Sale, o);
  }

  private SALES: Sale[] = [];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.SALES = [
      this.mk({ customer: 'Walk-in', items: 2, pay: 'Cash', amount: 14.6, time: '07:22 AM', status: 'Paid' }),
      this.mk({ customer: 'Grant Sutherland', items: 3, pay: 'Card', amount: 32.4, time: '07:48 AM', status: 'Paid' }),
      this.mk({ customer: 'Bernadette Cho', items: 1, pay: 'Insurance', amount: 58.0, time: '08:05 AM', status: 'Pending Claim' }),
      this.mk({ customer: 'Walk-in', items: 4, pay: 'Cash', amount: 21.15, time: '08:19 AM', status: 'Paid' }),
      this.mk({ customer: 'Camila Restrepo', items: 2, pay: 'Insurance', amount: 44.9, time: '08:37 AM', status: 'Pending Claim' }),
      this.mk({ customer: 'Walk-in', items: 1, pay: 'Card', amount: 9.8, time: '08:52 AM', status: 'Refunded' }),
      this.mk({ customer: 'Julian Alvarez', items: 2, pay: 'Card', amount: 27.35, time: '09:04 AM', status: 'Paid' }),
      this.mk({ customer: 'Walk-in', items: 5, pay: 'Cash', amount: 38.7, time: '09:18 AM', status: 'Paid' }),
      this.mk({ customer: 'Ophelia Grant', items: 3, pay: 'Insurance', amount: 91.2, time: '09:33 AM', status: 'Pending Claim' }),
    ];
  }

  ngAfterViewInit(): void {
    // Hero/KPIs are already correct in the static HTML for the initial
    // SALES state; only the sales grid needs an initial render.
    this.renderGrid();

    const search = this.byId('search');
    if (search) search.addEventListener('input', () => this.renderGrid());
    const filterPay = this.byId('filter-pay');
    if (filterPay) filterPay.addEventListener('change', () => this.renderGrid());
    const filterStatus = this.byId('filter-status');
    if (filterStatus) filterStatus.addEventListener('change', () => this.renderGrid());

    const gridBody = this.byId('grid-body');
    if (gridBody) {
      gridBody.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
        if (!btn) return;
        const s = this.SALES.find((x) => x.id === btn.dataset['id']);
        if (!s) return;
        if (btn.dataset['act'] === 'print') this.toast('Receipt printed for ' + s.id + '.', 'info');
        else if (btn.dataset['act'] === 'claim') {
          s.status = 'Paid';
          this.patchRow(s);
          this.renderAll();
          this.toast(s.id + ' claim settled.', 'success');
        } else if (btn.dataset['act'] === 'refund') {
          this.confirmDelete(s.id + ' — refund ' + this.money(s.amount), () => {
            s.status = 'Refunded';
            this.patchRow(s);
            this.renderAll();
            this.toast(s.id + ' refunded ' + this.money(s.amount) + '.', 'info');
          });
        }
      });
    }

    const btnAdd = this.byId('btn-add');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const form = this.byId('sl-form') as HTMLFormElement | null;
        if (form) form.reset();
        this.openModal('sale-modal');
      });
    }
    const btnCloseTill = this.byId('btn-close-till');
    if (btnCloseTill) btnCloseTill.addEventListener('click', () => this.toast('Till closed — ' + this.money(this.revenue()) + ' reconciled across ' + this.SALES.length + ' transactions.', 'success'));
    const btnExport = this.byId('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => this.toast('Sales exported — ' + this.SALES.length + ' transactions.', 'success'));

    const slSave = this.byId('sl-save');
    if (slSave) {
      slSave.addEventListener('click', () => {
        const amount = parseFloat(this.getValue('sl-amount'));
        if (!amount || amount <= 0) return this.toast('Enter the sale amount.', 'error');
        const pay = this.getValue('sl-pay');
        const s = this.mk({
          customer: this.getValue('sl-customer').trim() || 'Walk-in',
          items: parseInt(this.getValue('sl-items'), 10) || 1,
          pay,
          amount,
          time: '09:42 AM',
          status: pay === 'Insurance' ? 'Pending Claim' : 'Paid',
        });
        this.SALES.unshift(s);
        this.byId('grid-body')?.insertAdjacentHTML('afterbegin', this.rowHTML(s));
        const w = window as any;
        if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
        this.closeModal('sale-modal');
        this.renderAll();
        this.toast('Sale completed — ' + this.money(amount) + ' ' + pay.toLowerCase() + '.', 'success');
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
    return '$' + n.toFixed(2);
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

  // Revenue counts paid + pending; refunds are excluded.
  private revenue(): number {
    return this.SALES.filter((s) => s.status !== 'Refunded').reduce((a, s) => a + s.amount, 0);
  }

  private detailUrl(s: Sale): string {
    return 'pharmacy-sale-detail.html?' + new URLSearchParams({
      id: s.id, customer: s.customer, amount: String(s.amount), status: s.status, items: String(s.items), pay: s.pay, time: s.time,
    }).toString();
  }

  /* ---------------- render ---------------- */

  private renderHero(): void {
    const claims = this.SALES.filter((s) => s.status === 'Pending Claim').length;
    const flag = claims >= 4 ? { cls: 'tone-medium', text: claims + ' Claims Pending' } : { cls: 'tone-stable', text: 'Till Balanced' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = this.SALES.length + ' sales · ' + this.money(this.revenue()) + ' taken';
  }

  private renderKpis(): void {
    const byPay = (p: string) => this.SALES.filter((s) => s.pay === p && s.status !== 'Refunded').reduce((a, s) => a + s.amount, 0);
    const refunds = this.SALES.filter((s) => s.status === 'Refunded').length;

    const set = (id: string, v: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('kpi-revenue', this.money(this.revenue()));
    set('kpi-count', this.SALES.length);
    set('kpi-cash', this.money(byPay('Cash')));
    set('kpi-card', this.money(byPay('Card')));
    set('kpi-insurance', this.money(byPay('Insurance')));
    set('kpi-refunds', refunds);
  }

  private rowHTML(s: Sale): string {
    const acts: { label: string; icon: string; act: string; danger?: boolean }[] = [{ label: 'Print Receipt', icon: 'icon-printer', act: 'print' }];
    if (s.status === 'Paid') acts.push({ label: 'Refund', icon: 'icon-undo-2', act: 'refund', danger: true });
    if (s.status === 'Pending Claim') acts.push({ label: 'Mark Claim Paid', icon: 'icon-check', act: 'claim' });

    return (
      '<tr class="hms-row' + (s.status === 'Refunded' ? ' opacity-60' : '') + '" data-row-id="' + this.esc(s.id) + '">' +
      '<td class="hms-cell"><a class="font-mono text-[11px] font-bold text-primary hover:underline" href="' + this.detailUrl(s) + '">' + this.esc(s.id) + '</a></td>' +
      '<td class="hms-cell"><span class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(s.customer) + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + s.items + '</span></td>' +
      '<td class="hms-cell"><span class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">' +
      '<i class="' + this.PAY_ICON[s.pay] + ' text-[12px] text-gray-400" aria-hidden="true"></i>' + s.pay + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs font-extrabold text-gray-900 tabular-nums">' + this.money(s.amount) + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs text-gray-500 dark:text-gray-400 tabular-nums">' + this.esc(s.time) + '</span></td>' +
      '<td class="hms-cell"><span class="badge ' + this.STATUS[s.status] + '">' + s.status + '</span></td>' +
      '<td class="hms-cell text-right">' + this.actions(s.id, acts) + '</td></tr>'
    );
  }

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const pay = this.getValue('filter-pay');
    const st = this.getValue('filter-status');

    const rows = this.SALES.filter((s) => {
      const hit = !q || s.id.toLowerCase().includes(q) || s.customer.toLowerCase().includes(q);
      return hit && (!pay || s.pay === pay) && (!st || s.status === st);
    });
    const visible = new Set(rows.map((s) => s.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' sale' : ' sales');

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

  private patchRow(s: Sale): void {
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
}
