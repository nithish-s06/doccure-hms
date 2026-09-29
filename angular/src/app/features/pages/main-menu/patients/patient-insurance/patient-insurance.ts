import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const HSStaticMethods: { autoInit: () => void } | undefined;

/**
 * Ported from tailwind/src/assets/js/script.js — "patient-insurance".
 * Every claim ships as a static .ins-card in the HTML (grid view only —
 * this page never had a list/table view), each carrying its record as
 * data-* attributes. This wires the shared MC.staticList search/filter/
 * sort/paginate behavior to those existing nodes directly as component
 * methods (no data array, no innerHTML rebuild of row content). The
 * per-row hs-dropdown menu items, per-policy "Details" modals, follow-up
 * TPA / download-PDF actions and every other inert action modal have no
 * backend to persist to, so Confirm just closes the modal and toasts via
 * the shared [data-toast] handler (or the [data-remove-item] delete-confirm
 * flow for "Delete Claim").
 */
@Component({
  imports: [RouterLink],
  selector: 'app-patient-insurance',
  styleUrl: './patient-insurance.css',
  templateUrl: './patient-insurance.html',
})
export class PatientInsurance implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STATUS_ORDER: Record<string, number> = { Submitted: 0, Pending: 1, Processing: 2, Approved: 3, Rejected: 4 };

  private page = 1;
  private perPage = 12;
  private delCallback: (() => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    const page = this.byId('ins-page');
    if (!page) return;

    setTimeout(() => {
      const sk = this.byId('ins-skeleton');
      const ct = this.byId('ins-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'ins-fadein .4s ease';
      }

      this.render();

      this.inputEl('ins-search')?.addEventListener('input', () => {
        this.page = 1;
        this.render();
      });
      [this.selectEl('ins-f-provider'), this.selectEl('ins-f-status')].forEach((el) => {
        el?.addEventListener('change', () => {
          this.page = 1;
          this.render();
        });
      });
      this.selectEl('ins-sort')?.addEventListener('change', () => this.render());

      this.on('ins-size', 'change', (e) => {
        this.perPage = +(e.target as HTMLSelectElement).value;
        this.page = 1;
        this.render();
      });
      this.on('ins-jump', 'change', (e) => {
        const v = +(e.target as HTMLInputElement).value;
        if (v >= 1) {
          this.page = v;
          this.render();
        }
      });
      this.on('ins-refresh', 'click', () => {
        this.toast('Refreshed');
        this.setText('ins-updated', 'just now');
        this.render();
      });
      this.on('ins-empty-clear', 'click', () => this.clearFilters());

      this.on('ins-filters', 'click', () => {
        this.byId('ins-filter-drawer')?.classList.add('open');
        this.document.body.style.overflow = 'hidden';
      });
      this.byId('ins-filter-drawer')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('[data-close]')) {
          this.byId('ins-filter-drawer')?.classList.remove('open');
          this.document.body.style.overflow = '';
        }
      });
      this.document.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') {
          this.qsa('.ins-drawer.open').forEach((dr) => dr.classList.remove('open'));
          this.document.body.style.overflow = '';
        }
      });
      this.on('fd-apply', 'click', () => {
        const ids = ['fd-type', 'fd-tpa', 'fd-service', 'fd-min', 'fd-max', 'fd-from', 'fd-to'];
        const n = ids.filter((id) => this.advVal(id)).length;
        const badge = this.byId('ins-filter-badge');
        if (badge) {
          badge.textContent = String(n);
          badge.classList.toggle('hidden', n === 0);
        }
        this.byId('ins-filter-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.render();
        this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
      });
      this.on('fd-reset', 'click', () => {
        this.qsa('#ins-filter-drawer select,#ins-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
        this.byId('ins-filter-badge')?.classList.add('hidden');
        this.render();
      });

      const selectAllHandler = (e: Event) => {
        const checked = (e.target as HTMLInputElement).checked;
        this.visibleRowChecks().forEach((cb) => {
          if (cb.checked !== checked) {
            cb.checked = checked;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      };
      this.on('ins-select-all', 'change', selectAllHandler);
      page.addEventListener('change', (e) => {
        if ((e.target as HTMLElement).closest('[data-row-select]')) this.syncSelectAll();
      });
      this.document.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;
        if (t.closest('[data-clear-selection]') || t.closest('[data-remove-selected]')) setTimeout(() => this.syncSelectAll(), 0);
      });

      this.initDeleteModal();
      this.closeOnBackdrop('del-modal');
      this.on('del-confirm-btn', 'click', () => this.render());

      this.document.addEventListener('click', (e) => {
        const t = e.target as HTMLElement;

        const del = t.closest('[data-remove-item]') as HTMLElement | null;
        if (del) {
          e.stopPropagation();
          const item = this.byId(del.getAttribute('data-remove-item') || '');
          if (item) {
            const nameEl = item.querySelector('[data-name-text]');
            const name = nameEl ? (nameEl.textContent || '').trim() : 'this record';
            this.confirmDelete(name, () => {
              this.qsa(`[id$="-item-${item.getAttribute('data-id')}"]`).forEach((el) => el.remove());
            });
          }
          return;
        }

        const tt = t.closest('[data-toast]');
        if (tt) this.toast(tt.getAttribute('data-toast') || '', 'info');
      });

      this.on('ins-export-run', 'click', () => {
        const fmt = (this.document.querySelector('input[name="ins-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
        const scope = (this.document.querySelector('input[name="ins-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
        this.closeModal('ins-export-modal');
        if (fmt === 'Print') {
          window.print();
          return;
        }
        this.toast(`Exported ${scope} as ${fmt}`);
      });
    }, 1500);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private inputEl(id: string): HTMLInputElement | null {
    return this.byId(id) as HTMLInputElement | null;
  }
  private selectEl(id: string): HTMLSelectElement | null {
    return this.byId(id) as HTMLSelectElement | null;
  }
  private qsa(sel: string, root: ParentNode = this.document): HTMLElement[] {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }
  private on(id: string, ev: string, fn: (e: Event) => void): void {
    this.byId(id)?.addEventListener(ev, fn);
  }
  private setText(id: string, text: string): void {
    const el = this.byId(id);
    if (el) el.textContent = text;
  }
  private advVal(id: string): string {
    const e = this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
    return e ? e.value : '';
  }

  private toast(msg: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, type);
  }

  /* ---------------- staticList ---------------- */

  private matches(el: HTMLElement): boolean {
    const ds = el.dataset;
    const fProvider = this.selectEl('ins-f-provider')?.value || '';
    const fStatus = this.selectEl('ins-f-status')?.value || '';
    if (fProvider && ds['provider'] !== fProvider) return false;
    if (fStatus && ds['status'] !== fStatus) return false;
    if (this.advVal('fd-type') && ds['type'] !== this.advVal('fd-type')) return false;
    if (this.advVal('fd-tpa') && ds['tpa'] !== this.advVal('fd-tpa')) return false;
    if (this.advVal('fd-service') && ds['service'] !== this.advVal('fd-service')) return false;
    if (this.advVal('fd-min') && +(ds['amount'] || 0) < +this.advVal('fd-min')) return false;
    if (this.advVal('fd-max') && +(ds['amount'] || 0) > +this.advVal('fd-max')) return false;
    if (this.advVal('fd-from') && (ds['date'] || '') < this.advVal('fd-from')) return false;
    if (this.advVal('fd-to') && (ds['date'] || '') > this.advVal('fd-to')) return false;
    return true;
  }

  private compare = (a: HTMLElement, b: HTMLElement): number => {
    const sort = this.selectEl('ins-sort')?.value || 'newest';
    const ad = a.dataset, bd = b.dataset;
    switch (sort) {
      case 'oldest':
        return (ad['date'] || '').localeCompare(bd['date'] || '');
      case 'amount':
        return +(bd['amount'] || 0) - +(ad['amount'] || 0);
      case 'status':
        return (this.STATUS_ORDER[ad['status'] || ''] ?? 0) - (this.STATUS_ORDER[bd['status'] || ''] ?? 0);
      default:
        return (bd['date'] || '').localeCompare(ad['date'] || '');
    }
  };

  private passes(el: HTMLElement): boolean {
    const term = this.inputEl('ins-search')?.value.trim().toLowerCase() || '';
    if (term && (el.textContent || '').toLowerCase().indexOf(term) === -1) return false;
    return this.matches(el);
  }

  private pageButton(label: string, target: number, opts: { active?: boolean; disabled?: boolean; icon?: string; ariaLabel?: string } = {}): HTMLButtonElement {
    const b = this.document.createElement('button');
    b.type = 'button';
    b.className = opts.active ? 'pm-page-btn is-active' : 'pm-page-btn';
    b.disabled = !!opts.disabled;
    if (opts.ariaLabel) b.setAttribute('aria-label', opts.ariaLabel);
    if (opts.icon) {
      const i = this.document.createElement('i');
      i.className = opts.icon;
      b.appendChild(i);
    } else {
      b.textContent = label;
    }
    b.addEventListener('click', () => {
      this.page = target;
      this.render();
    });
    return b;
  }

  private renderPager(pages: number): void {
    const pager = this.byId('ins-page-nav');
    if (!pager) return;
    pager.textContent = '';
    pager.appendChild(this.pageButton('', this.page - 1, { icon: 'icon-chevron-left', disabled: this.page === 1, ariaLabel: 'Previous page' }));
    let start = Math.max(1, this.page - 2);
    const end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    for (let p = start; p <= end; p++) pager.appendChild(this.pageButton(String(p), p, { active: p === this.page }));
    pager.appendChild(this.pageButton('', this.page + 1, { icon: 'icon-chevron-right', disabled: this.page === pages, ariaLabel: 'Next page' }));
  }

  private render(): void {
    const grid = this.byId('ins-gridview');
    const empty = this.byId('ins-empty');
    const pager = this.byId('ins-pager');
    if (!grid) return;

    const all = this.qsa('.ins-card[data-id]', grid);
    let shown = all.filter((el) => this.passes(el));
    shown = shown.slice().sort(this.compare);
    const pages = Math.max(1, Math.ceil(shown.length / this.perPage));
    if (this.page > pages) this.page = pages;
    const start = (this.page - 1) * this.perPage;
    const slice = shown.slice(start, start + this.perPage);
    all.forEach((el) => (el.hidden = slice.indexOf(el) === -1));
    slice.forEach((el) => grid.appendChild(el));

    const info = { total: shown.length, allCount: all.length, from: start, shown: slice.length, pages };

    if (typeof HSStaticMethods !== 'undefined') HSStaticMethods.autoInit();

    this.setText('ins-count', `${info.total} of ${info.allCount} claims`);
    this.setText('ins-page-info', info.total ? `Showing ${info.from + 1}–${info.from + info.shown} of ${info.total}` : 'No claims');
    empty?.classList.toggle('hidden', info.total !== 0);
    pager?.classList.toggle('hidden', info.total === 0);
    this.syncSelectAll();

    this.renderPager(info.pages);
  }

  private visibleRowChecks(): HTMLInputElement[] {
    const grid = this.byId('ins-gridview');
    if (!grid) return [];
    return this.qsa('.ins-card[data-id]', grid)
      .filter((item) => !item.hidden)
      .map((item) => item.querySelector('[data-row-select]') as HTMLInputElement | null)
      .filter((b): b is HTMLInputElement => !!b);
  }

  private syncSelectAll(): void {
    const boxes = this.visibleRowChecks();
    const checked = boxes.filter((b) => b.checked).length;
    const sa = this.inputEl('ins-select-all');
    if (sa) {
      sa.checked = boxes.length > 0 && checked === boxes.length;
      sa.indeterminate = checked > 0 && checked < boxes.length;
    }
  }

  private clearFilters(): void {
    const search = this.inputEl('ins-search');
    if (search) search.value = '';
    const fProvider = this.selectEl('ins-f-provider');
    if (fProvider) fProvider.value = '';
    const fStatus = this.selectEl('ins-f-status');
    if (fStatus) fStatus.value = '';
    this.qsa('#ins-filter-drawer select,#ins-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
    this.byId('ins-filter-badge')?.classList.add('hidden');
    this.render();
  }

  /* ---------------- shared modal helpers (MC.openModal/closeModal/confirmDelete/initDeleteModal) ---------------- */

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private confirmDelete(name: string, onConfirm: () => void): void {
    this.setText('del-name', name);
    this.delCallback = onConfirm;
    this.openModal('del-modal');
  }

  private initDeleteModal(): void {
    this.byId('del-confirm-btn')?.addEventListener('click', () => {
      if (this.delCallback) this.delCallback();
      this.closeModal('del-modal');
    });
    this.byId('del-cancel-btn')?.addEventListener('click', () => this.closeModal('del-modal'));
  }

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    el?.addEventListener('mousedown', (e) => {
      if (e.target === el) this.closeModal(id);
    });
  }
}
