import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const HSStaticMethods: { autoInit: () => void } | undefined;

/**
 * Ported from tailwind/src/assets/js/script.js — "patient-medical-history".
 * Every record ships as a static .mh-tl-item (timeline) / <tr> (list) in
 * the HTML, each carrying its record as data-* attributes. This wires the
 * shared MC.staticList search/filter/sort/paginate behavior to those
 * existing nodes directly as component methods (no data array, no
 * innerHTML rebuild of row content). The per-row hs-dropdown menu items and
 * every inert action modal have no backend to persist to, so Confirm just
 * closes the modal and toasts via the shared [data-toast] handler (or the
 * [data-remove-item] delete-confirm flow). The 10-section "Medical History
 * Sections" accordion uses Preline's own hs-accordion component and needs
 * no JS here.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-patient-medical-history',
  styleUrl: './patient-medical-history.css',
  templateUrl: './patient-medical-history.html',
})
export class PatientMedicalHistory implements AfterViewInit {
  AllRoutes = All_Routes;
  private page = 1;
  private perPage = 8;
  private view: 'tl' | 'list' = 'tl';
  private delCallback: (() => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    const page = this.byId('mh-page');
    if (!page) return;

    setTimeout(() => {
      const sk = this.byId('mh-skeleton');
      const ct = this.byId('mh-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'mh-fadein .4s ease';
      }
      this.initRings(page);

      this.render();

      this.on('mh-view-tl', 'click', (e) => {
        this.view = 'tl';
        (e.currentTarget as HTMLElement).classList.add('is-active');
        this.byId('mh-view-list')?.classList.remove('is-active');
        this.render();
      });
      this.on('mh-view-list', 'click', (e) => {
        this.view = 'list';
        (e.currentTarget as HTMLElement).classList.add('is-active');
        this.byId('mh-view-tl')?.classList.remove('is-active');
        this.render();
      });

      this.inputEl('mh-search')?.addEventListener('input', () => {
        this.page = 1;
        this.render();
      });
      [this.selectEl('mh-f-cat'), this.selectEl('mh-f-dept')].forEach((el) => {
        el?.addEventListener('change', () => {
          this.page = 1;
          this.render();
        });
      });
      this.selectEl('mh-sort')?.addEventListener('change', () => this.render());

      this.on('mh-size', 'change', (e) => {
        this.perPage = +(e.target as HTMLSelectElement).value;
        this.page = 1;
        this.render();
      });
      this.on('mh-jump', 'change', (e) => {
        const v = +(e.target as HTMLInputElement).value;
        if (v >= 1) {
          this.page = v;
          this.render();
        }
      });
      this.on('mh-refresh', 'click', () => {
        this.toast('Refreshed');
        this.setText('mh-updated', 'just now');
        this.render();
      });
      this.on('mh-empty-clear', 'click', () => this.clearFilters());

      this.on('mh-filters', 'click', () => {
        this.byId('mh-filter-drawer')?.classList.add('open');
        this.document.body.style.overflow = 'hidden';
      });
      this.byId('mh-filter-drawer')?.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('[data-close]')) {
          this.byId('mh-filter-drawer')?.classList.remove('open');
          this.document.body.style.overflow = '';
        }
      });
      this.document.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Escape') {
          this.qsa('.mh-drawer.open').forEach((dr) => dr.classList.remove('open'));
          this.document.body.style.overflow = '';
        }
      });
      this.on('fd-apply', 'click', () => {
        const ids = ['fd-dx', 'fd-doctor', 'fd-type', 'fd-status', 'fd-att', 'fd-from', 'fd-to'];
        const n = ids.filter((id) => this.advVal(id)).length;
        const badge = this.byId('mh-filter-badge');
        if (badge) {
          badge.textContent = String(n);
          badge.classList.toggle('hidden', n === 0);
        }
        this.byId('mh-filter-drawer')?.classList.remove('open');
        this.document.body.style.overflow = '';
        this.render();
        this.toast(`${n} filter${n !== 1 ? 's' : ''} applied`);
      });
      this.on('fd-reset', 'click', () => {
        this.qsa('#mh-filter-drawer select,#mh-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
        this.byId('mh-filter-badge')?.classList.add('hidden');
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
      this.on('mh-select-all', 'change', selectAllHandler);
      this.on('mh-select-all-2', 'change', selectAllHandler);
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

      page.addEventListener('click', (e) => {
        const cj = (e.target as HTMLElement).closest('.mh-cat-jump') as HTMLElement | null;
        if (!cj) return;
        const cat = cj.getAttribute('data-cat') || '';
        const fCat = this.selectEl('mh-f-cat');
        if (fCat) fCat.value = cat;
        this.render();
        this.toast(`Filtered by ${cat}`, 'info');
      });

      this.on('mh-export-run', 'click', () => {
        const fmt = (this.document.querySelector('input[name="mh-exf"]:checked') as HTMLInputElement | null)?.value || 'PDF';
        const scope = (this.document.querySelector('input[name="mh-exs"]:checked') as HTMLInputElement | null)?.value || 'complete';
        this.closeModal('mh-export-modal');
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

  private initRings(scope: HTMLElement): void {
    requestAnimationFrame(() => {
      this.qsa('.mh-ring[data-p]', scope).forEach((r) => {
        const p = Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0)));
        r.style.setProperty('--p', String(p));
      });
    });
  }

  /* ---------------- staticList ---------------- */

  private matches(el: HTMLElement): boolean {
    const ds = el.dataset;
    const fCat = this.selectEl('mh-f-cat')?.value || '';
    const fDept = this.selectEl('mh-f-dept')?.value || '';
    if (fCat && ds['category'] !== fCat) return false;
    if (fDept && ds['dept'] !== fDept) return false;
    if (this.advVal('fd-dx') && (ds['dx'] || '').toLowerCase().indexOf(this.advVal('fd-dx').toLowerCase()) === -1) return false;
    if (this.advVal('fd-doctor') && ds['doctor'] !== this.advVal('fd-doctor')) return false;
    if (this.advVal('fd-type') && ds['category'] !== this.advVal('fd-type')) return false;
    if (this.advVal('fd-status') && ds['status'] !== this.advVal('fd-status')) return false;
    const att = +(ds['attachments'] || 0);
    if (this.advVal('fd-att') === 'With attachments' && !att) return false;
    if (this.advVal('fd-att') === 'Without attachments' && att) return false;
    if (this.advVal('fd-from') && (ds['date'] || '') < this.advVal('fd-from')) return false;
    if (this.advVal('fd-to') && (ds['date'] || '') > this.advVal('fd-to')) return false;
    return true;
  }

  private compare = (a: HTMLElement, b: HTMLElement): number => {
    const sort = this.selectEl('mh-sort')?.value || 'newest';
    const ad = a.dataset, bd = b.dataset;
    switch (sort) {
      case 'oldest':
        return (ad['date'] || '').localeCompare(bd['date'] || '');
      case 'category':
        return (ad['category'] || '').localeCompare(bd['category'] || '');
      case 'doctor':
        return (ad['doctor'] || '').localeCompare(bd['doctor'] || '');
      default:
        return (bd['date'] || '').localeCompare(ad['date'] || '');
    }
  };

  private passes(el: HTMLElement): boolean {
    const term = this.inputEl('mh-search')?.value.trim().toLowerCase() || '';
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
    const pager = this.byId('mh-page-nav');
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
    const timeline = this.byId('mh-timeline');
    const tbody = this.byId('mh-tbody');
    const tlview = this.byId('mh-tlview');
    const listView = this.byId('mh-listview');
    const empty = this.byId('mh-empty');
    const pager = this.byId('mh-pager');
    if (!timeline || !tbody) return;

    let info: { total: number; allCount: number; from: number; shown: number; pages: number } | null = null;
    [
      { container: timeline, sel: '.mh-tl-item' },
      { container: tbody, sel: 'tr' },
    ].forEach((view) => {
      const all = this.qsa(view.sel, view.container);
      let shown = all.filter((el) => this.passes(el));
      shown = shown.slice().sort(this.compare);
      const pages = Math.max(1, Math.ceil(shown.length / this.perPage));
      if (this.page > pages) this.page = pages;
      const start = (this.page - 1) * this.perPage;
      const slice = shown.slice(start, start + this.perPage);
      all.forEach((el) => (el.hidden = slice.indexOf(el) === -1));
      slice.forEach((el) => view.container.appendChild(el));
      if (!info) info = { total: shown.length, allCount: all.length, from: start, shown: slice.length, pages };
    });
    if (!info) return;
    const finalInfo = info as { total: number; allCount: number; from: number; shown: number; pages: number };

    if (typeof HSStaticMethods !== 'undefined') HSStaticMethods.autoInit();

    this.setText('mh-count', `${finalInfo.total} of ${finalInfo.allCount} records`);
    this.setText('mh-page-info', finalInfo.total ? `Showing ${finalInfo.from + 1}–${finalInfo.from + finalInfo.shown} of ${finalInfo.total}` : 'No records');
    empty?.classList.toggle('hidden', finalInfo.total !== 0);
    pager?.classList.toggle('hidden', finalInfo.total === 0);
    tlview?.classList.toggle('hidden', this.view !== 'tl' || finalInfo.total === 0);
    listView?.classList.toggle('hidden', this.view !== 'list' || finalInfo.total === 0);
    this.syncSelectAll();

    this.renderPager(finalInfo.pages);
  }

  private visibleRowChecks(): HTMLInputElement[] {
    const container = this.view === 'tl' ? this.byId('mh-timeline') : this.byId('mh-tbody');
    if (!container) return [];
    const sel = this.view === 'tl' ? '.mh-tl-item' : 'tr';
    return this.qsa(sel, container)
      .filter((item) => !item.hidden)
      .map((item) => item.querySelector('[data-row-select]') as HTMLInputElement | null)
      .filter((b): b is HTMLInputElement => !!b);
  }

  private syncSelectAll(): void {
    const boxes = this.visibleRowChecks();
    const checked = boxes.filter((b) => b.checked).length;
    [this.inputEl('mh-select-all'), this.inputEl('mh-select-all-2')].forEach((sa) => {
      if (!sa) return;
      sa.checked = boxes.length > 0 && checked === boxes.length;
      sa.indeterminate = checked > 0 && checked < boxes.length;
    });
  }

  private clearFilters(): void {
    const search = this.inputEl('mh-search');
    if (search) search.value = '';
    const fCat = this.selectEl('mh-f-cat');
    if (fCat) fCat.value = '';
    const fDept = this.selectEl('mh-f-dept');
    if (fDept) fDept.value = '';
    this.qsa('#mh-filter-drawer select,#mh-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
    this.byId('mh-filter-badge')?.classList.add('hidden');
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
