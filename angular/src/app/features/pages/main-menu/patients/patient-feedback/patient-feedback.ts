import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

type ViewMode = 'grid' | 'list';

interface StaticListInfo {
  total: number;
  allCount: number;
  from: number;
  shown: number;
  pages: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "patient-feedback".
 * Every review ships as a static .fb-card (grid) / <tr> (list) in the HTML,
 * each carrying its record as data-* attributes. This wires
 * search/filter/sort/pagination against those existing nodes (the
 * MC.staticList helper, reimplemented here as plain component methods since
 * there is no global MC object in Angular) — no data array, no innerHTML
 * rebuild of row content. "Respond" is the one action with real per-row
 * content (prefilled from the card's own dataset); the rest
 * (resolve/escalate/feature/notify/call/download/request/survey/import) have
 * no backend to persist to, so Confirm just closes the modal (Preline, via
 * its own data-hs-overlay attribute) and toasts via the shared [data-toast]
 * handler.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-patient-feedback',
  styleUrl: './patient-feedback.css',
  templateUrl: './patient-feedback.html',
})
export class PatientFeedback implements AfterViewInit {
  AllRoutes = All_Routes;
  private view: ViewMode = 'grid';
  private page = 1;
  private perPage = 12;
  private delCallback: (() => void) | null = null;
  private currentRespondId: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.init(), 1500);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private val(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  }

  private toast(msg: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, tone);
  }

  private openRespond(id: string): void {
    const item = this.byId('fb-grid-item-' + id);
    if (!item) return;
    const nameEl = this.byId('fb-respond-name');
    if (nameEl) nameEl.textContent = `${item.dataset['patient']} · ${item.dataset['rating']}★`;
    const textEl = this.byId('fb-respond-text') as HTMLTextAreaElement | null;
    if (textEl) textEl.value = 'Thank you for sharing your feedback. ';
    this.currentRespondId = id;
    this.openModal('fb-respond-modal');
  }

  private init(): void {
    const sk = this.byId('fb-skeleton');
    const ct = this.byId('fb-content');
    if (sk) sk.style.display = 'none';
    if (ct) {
      ct.classList.remove('hidden');
      ct.style.animation = 'fb-fadein .4s ease';
    }

    this.render();

    const search = this.byId('fb-search') as HTMLInputElement | null;
    search?.addEventListener('input', () => {
      this.page = 1;
      this.render();
    });
    ['fb-f-rating', 'fb-f-sent', 'fb-f-status'].forEach((id) => {
      this.byId(id)?.addEventListener('change', () => {
        this.page = 1;
        this.render();
      });
    });
    this.byId('fb-sort')?.addEventListener('change', () => this.render());

    this.byId('fb-view-grid')?.addEventListener('click', (e) => {
      this.view = 'grid';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('fb-view-list')?.classList.remove('is-active');
      this.render();
    });
    this.byId('fb-view-list')?.addEventListener('click', (e) => {
      this.view = 'list';
      (e.currentTarget as HTMLElement).classList.add('is-active');
      this.byId('fb-view-grid')?.classList.remove('is-active');
      this.render();
    });
    this.byId('fb-size')?.addEventListener('change', (e) => {
      this.perPage = +(e.target as HTMLSelectElement).value;
      this.page = 1;
      this.render();
    });
    this.byId('fb-jump')?.addEventListener('change', (e) => {
      const v = +(e.target as HTMLInputElement).value;
      if (v >= 1) {
        this.page = v;
        this.render();
      }
    });
    this.byId('fb-refresh')?.addEventListener('click', () => {
      this.toast('Refreshed');
      const upd = this.byId('fb-updated');
      if (upd) upd.textContent = 'just now';
      this.render();
    });
    this.byId('fb-empty-clear')?.addEventListener('click', () => this.clearFilters());

    this.byId('fb-filters')?.addEventListener('click', () => {
      this.byId('fb-filter-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
    this.byId('fb-filter-drawer')?.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('[data-close]')) {
        this.byId('fb-filter-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
      }
    });
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        Array.from(this.document.querySelectorAll('.fb-drawer.open')).forEach((dr) => dr.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });
    this.byId('fd-apply')?.addEventListener('click', () => {
      const ids = ['fd-cat', 'fd-dept', 'fd-source', 'fd-from', 'fd-to'];
      const n = ids.filter((id) => this.val(id)).length;
      const badge = this.byId('fb-filter-badge');
      if (badge) {
        badge.textContent = String(n);
        badge.classList.toggle('hidden', n === 0);
      }
      this.byId('fb-filter-drawer')?.classList.remove('open');
      this.document.body.style.overflow = '';
      this.page = 1;
      this.render();
      this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`, 'success');
    });
    this.byId('fd-reset')?.addEventListener('click', () => {
      Array.from(this.document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#fb-filter-drawer select,#fb-filter-drawer input')).forEach((i) => (i.value = ''));
      this.byId('fb-filter-badge')?.classList.add('hidden');
      this.page = 1;
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
    this.byId('fb-select-all')?.addEventListener('change', selectAllHandler);
    this.byId('fb-select-all-2')?.addEventListener('change', selectAllHandler);
    const page = this.byId('fb-page');
    page?.addEventListener('change', (e) => {
      if ((e.target as HTMLElement).closest('[data-row-select]')) this.syncSelectAll();
    });
    this.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-clear-selection]') || target.closest('[data-remove-selected]')) setTimeout(() => this.syncSelectAll(), 0);
    });

    this.initDeleteModal();
    this.closeOnBackdrop('del-modal');
    this.byId('del-confirm-btn')?.addEventListener('click', () => this.render());

    // Generic delete: any [data-remove-item] removes the matching
    // fb-grid-item-N / fb-row-item-N pair after confirmation.
    this.document.addEventListener('click', (e) => {
      const del = (e.target as HTMLElement).closest('[data-remove-item]') as HTMLElement | null;
      if (!del) return;
      e.stopPropagation();
      const item = this.byId(del.getAttribute('data-remove-item') || '');
      if (!item) return;
      const nameEl = item.querySelector('[data-name-text]');
      const name = nameEl ? (nameEl.textContent || '').trim() : 'this record';
      this.confirmDelete(name, () => {
        const id = item.getAttribute('data-id');
        Array.from(this.document.querySelectorAll(`[id$="-item-${id}"]`)).forEach((el) => el.remove());
      });
    });

    // Respond needs the clicked row's own patient/rating, so every
    // .fb-respond trigger (card mini-button, list mini-button, dropdown
    // item, "Needs Response" sidebar widget, hero "Respond" button) is
    // wired through this one delegated handler instead of a static
    // [data-hs-overlay] attribute.
    page?.addEventListener('click', (e) => {
      const rb = (e.target as HTMLElement).closest('.fb-respond') as HTMLElement | null;
      if (!rb) return;
      const id = rb.getAttribute('data-id');
      if (!id) return;
      this.openRespond(id);
    });
    this.byId('fb-respond-confirm')?.addEventListener('click', () => {
      const item = this.currentRespondId ? this.byId('fb-grid-item-' + this.currentRespondId) : null;
      const name = item ? item.dataset['patient'] : 'the patient';
      this.closeModal('fb-respond-modal');
      this.toast(`Response sent to ${name}`);
    });
    this.document.addEventListener('click', (e) => {
      const ac = (e.target as HTMLElement).closest('[data-act]');
      if (!ac) return;
      if (ac.getAttribute('data-act') === 'respond-pending') {
        const grid = this.byId('fb-gridview');
        const pending = grid
          ? Array.from(grid.querySelectorAll<HTMLElement>('.fb-card[data-id]')).find((c) => c.dataset['status'] === 'New')
          : undefined;
        if (pending) this.openRespond(pending.dataset['id'] || '');
        else this.toast('No pending feedback', 'info');
      }
    });

    // Generic toast-on-confirm for every inert action modal (resolve,
    // escalate, feature, notify, call, download, request, survey, import,
    // bulk actions).
    this.document.addEventListener('click', (e) => {
      const tt = (e.target as HTMLElement).closest('[data-toast]');
      if (tt) this.toast(tt.getAttribute('data-toast') || '', 'info');
    });

    this.byId('fb-export-run')?.addEventListener('click', () => {
      const fmt = (this.document.querySelector('input[name="fb-exf"]:checked') as HTMLInputElement | null)?.value || 'CSV';
      const scope = (this.document.querySelector('input[name="fb-exs"]:checked') as HTMLInputElement | null)?.value || 'all';
      this.closeModal('fb-export-modal');
      if (fmt === 'Print') {
        window.print();
        return;
      }
      this.toast(`Exported ${scope} as ${fmt}`);
    });
  }

  /* ---------------- static list (search/filter/sort/paginate) ---------------- */

  private matches(el: HTMLElement): boolean {
    const ds = el.dataset;
    const fRating = this.val('fb-f-rating');
    const fSent = this.val('fb-f-sent');
    const fStatus = this.val('fb-f-status');
    if (fRating && ds['rating'] !== fRating) return false;
    if (fSent && ds['sentiment'] !== fSent) return false;
    if (fStatus && ds['status'] !== fStatus) return false;
    const cat = this.val('fd-cat');
    if (cat && ds['category'] !== cat) return false;
    const dept = this.val('fd-dept');
    if (dept && ds['dept'] !== dept) return false;
    const source = this.val('fd-source');
    if (source && ds['source'] !== source) return false;
    const from = this.val('fd-from');
    if (from && (ds['date'] || '') < from) return false;
    const to = this.val('fd-to');
    if (to && (ds['date'] || '') > to) return false;
    return true;
  }

  private compare(a: HTMLElement, b: HTMLElement): number {
    switch (this.val('fb-sort')) {
      case 'oldest':
        return (a.dataset['date'] || '').localeCompare(b.dataset['date'] || '');
      case 'highest':
        return +(b.dataset['rating'] || 0) - +(a.dataset['rating'] || 0);
      case 'lowest':
        return +(a.dataset['rating'] || 0) - +(b.dataset['rating'] || 0);
      default:
        return (b.dataset['date'] || '').localeCompare(a.dataset['date'] || '');
    }
  }

  private passes(el: HTMLElement): boolean {
    const search = this.byId('fb-search') as HTMLInputElement | null;
    const term = search ? search.value.trim().toLowerCase() : '';
    if (term && !(el.textContent || '').toLowerCase().includes(term)) return false;
    return this.matches(el);
  }

  private render(): void {
    const grid = this.byId('fb-gridview');
    const tbody = this.byId('fb-tbody');
    const listView = this.byId('fb-listview');
    const empty = this.byId('fb-empty');
    const pager = this.byId('fb-pager');
    if (!grid || !tbody) return;

    let info: StaticListInfo | null = null;
    const views: { container: HTMLElement; selector: string }[] = [
      { container: grid, selector: '.fb-card' },
      { container: tbody, selector: 'tr' },
    ];

    views.forEach((v) => {
      const all = Array.from(v.container.querySelectorAll<HTMLElement>(v.selector));
      let shown = all.filter((el) => this.passes(el));
      shown = shown.slice().sort((a, b) => this.compare(a, b));
      const pages = Math.max(1, Math.ceil(shown.length / this.perPage));
      if (this.page > pages) this.page = pages;
      const start = (this.page - 1) * this.perPage;
      const slice = shown.slice(start, start + this.perPage);
      all.forEach((el) => (el.hidden = slice.indexOf(el) === -1));
      slice.forEach((el) => v.container.appendChild(el));
      if (!info) info = { total: shown.length, allCount: all.length, from: start, shown: slice.length, pages };
    });

    this.renderPager(info!.pages);
    this.onRender(info!, grid, tbody, listView, empty, pager);
  }

  private onRender(info: StaticListInfo, grid: HTMLElement, tbody: HTMLElement, listView: HTMLElement | null, empty: HTMLElement | null, pager: HTMLElement | null): void {
    const count = this.byId('fb-count');
    if (count) count.textContent = `${info.total} of ${info.allCount} reviews`;
    const pageInfo = this.byId('fb-page-info');
    if (pageInfo) pageInfo.textContent = info.total ? `Showing ${info.from + 1}–${info.from + info.shown} of ${info.total}` : 'No reviews';
    empty?.classList.toggle('hidden', info.total !== 0);
    pager?.classList.toggle('hidden', info.total === 0);
    grid.classList.toggle('hidden', this.view !== 'grid' || info.total === 0);
    listView?.classList.toggle('hidden', this.view !== 'list' || info.total === 0);
    this.syncSelectAll();
  }

  private renderPager(pages: number): void {
    const pager = this.byId('fb-page-nav');
    if (!pager) return;
    pager.textContent = '';
    pager.appendChild(this.pageButton('', this.page - 1, { icon: 'icon-chevron-left', disabled: this.page === 1, ariaLabel: 'Previous page' }));
    let start = Math.max(1, this.page - 2);
    const end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    for (let p = start; p <= end; p++) pager.appendChild(this.pageButton(String(p), p, { active: p === this.page }));
    pager.appendChild(this.pageButton('', this.page + 1, { icon: 'icon-chevron-right', disabled: this.page === pages, ariaLabel: 'Next page' }));
  }

  private pageButton(label: string, target: number, opts: { active?: boolean; disabled?: boolean; icon?: string; ariaLabel?: string }): HTMLButtonElement {
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

  private visibleRowChecks(): HTMLInputElement[] {
    const container = this.view === 'grid' ? this.byId('fb-gridview') : this.byId('fb-tbody');
    if (!container) return [];
    const sel = this.view === 'grid' ? '.fb-card' : 'tr';
    return Array.from(container.querySelectorAll<HTMLElement>(sel))
      .filter((item) => !item.hidden)
      .map((item) => item.querySelector<HTMLInputElement>('[data-row-select]'))
      .filter((x): x is HTMLInputElement => !!x);
  }

  private syncSelectAll(): void {
    const boxes = this.visibleRowChecks();
    const checked = boxes.filter((b) => b.checked).length;
    [this.byId('fb-select-all'), this.byId('fb-select-all-2')].forEach((sa) => {
      if (!sa) return;
      const input = sa as HTMLInputElement;
      input.checked = boxes.length > 0 && checked === boxes.length;
      input.indeterminate = checked > 0 && checked < boxes.length;
    });
  }

  private clearFilters(): void {
    const search = this.byId('fb-search') as HTMLInputElement | null;
    if (search) search.value = '';
    ['fb-f-rating', 'fb-f-sent', 'fb-f-status'].forEach((id) => {
      const el = this.byId(id) as HTMLSelectElement | null;
      if (el) el.value = '';
    });
    Array.from(this.document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#fb-filter-drawer select,#fb-filter-drawer input')).forEach((i) => (i.value = ''));
    this.byId('fb-filter-badge')?.classList.add('hidden');
    this.page = 1;
    this.render();
  }

  /* ---------------- shared modal helpers (ported from MC.openModal/closeModal/confirmDelete/initDeleteModal) ---------------- */

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
    const nameEl = this.byId('del-name');
    if (nameEl) nameEl.textContent = name;
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
