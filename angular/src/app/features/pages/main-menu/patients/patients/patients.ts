import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';

interface StaticListView {
  container: HTMLElement;
  itemSelector: string;
}

interface StaticListInfo {
  total: number;
  allCount: number;
  from: number;
  shown: number;
  pages: number;
}
@Component({
  imports: [RouterLink,Datepicker],
  selector: 'app-patients',
  styleUrl: './patients.css',
  templateUrl: './patients.html',
})
export class Patients implements AfterViewInit {
  AllRoutes = All_Routes;
  private view: 'grid' | 'list' = 'grid';
  private state = { page: 1, perPage: 12 };
  private readonly advIds = [
    'fd-dept', 'fd-doctor', 'fd-status', 'fd-admission', 'fd-blood',
    'fd-gender', 'fd-insurance', 'fd-age-min', 'fd-age-max', 'fd-from', 'fd-to',
  ];

  private grid!: HTMLElement | null;
  private listWrap!: HTMLElement | null;
  private tbody!: HTMLElement | null;
  private empty!: HTMLElement | null;
  private pager!: HTMLElement | null;
  private search!: HTMLInputElement | null;
  private fDept!: HTMLSelectElement | null;
  private fStatus!: HTMLSelectElement | null;
  private sortSel!: HTMLSelectElement | null;
  private pageNav!: HTMLElement | null;

  private delCallback: (() => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    if (!this.byId('pm-page')) return;

    this.grid = this.byId('pm-grid');
    this.listWrap = this.byId('pm-list');
    this.tbody = this.byId('pm-tbody');
    this.empty = this.byId('pm-empty');
    this.pager = this.byId('pm-pager');
    this.search = this.byId('pm-search') as HTMLInputElement | null;
    this.fDept = this.byId('pm-f-dept') as HTMLSelectElement | null;
    this.fStatus = this.byId('pm-f-status') as HTMLSelectElement | null;
    this.sortSel = this.byId('pm-sort') as HTMLSelectElement | null;
    this.pageNav = this.byId('pm-page-nav');

    if (this.search) this.search.addEventListener('input', () => { this.state.page = 1; this.render(); });
    if (this.fDept) this.fDept.addEventListener('change', () => { this.state.page = 1; this.render(); });
    if (this.fStatus) this.fStatus.addEventListener('change', () => { this.state.page = 1; this.render(); });
    if (this.sortSel) this.sortSel.addEventListener('change', () => this.render());

    const viewGrid = this.byId('pm-view-grid');
    const viewList = this.byId('pm-view-list');
    if (viewGrid) {
      viewGrid.addEventListener('click', () => {
        this.view = 'grid';
        viewGrid.classList.add('is-active');
        viewList?.classList.remove('is-active');
        this.render();
      });
    }
    if (viewList) {
      viewList.addEventListener('click', () => {
        this.view = 'list';
        viewList.classList.add('is-active');
        viewGrid?.classList.remove('is-active');
        this.render();
      });
    }

    const pageSize = this.byId('pm-page-size') as HTMLSelectElement | null;
    if (pageSize) {
      pageSize.addEventListener('change', (e) => {
        this.state.perPage = +((e.target as HTMLSelectElement).value);
        this.state.page = 1;
        this.render();
      });
    }
    const jump = this.byId('pm-jump') as HTMLInputElement | null;
    if (jump) {
      jump.addEventListener('change', (e) => {
        const v = +((e.target as HTMLInputElement).value);
        if (v >= 1) { this.state.page = v; this.render(); }
      });
    }
    const refresh = this.byId('pm-refresh');
    if (refresh) {
      refresh.addEventListener('click', () => {
        this.render();
        this.toastService.show('List refreshed', 'success');
        const updated = this.byId('pm-updated');
        if (updated) updated.textContent = 'just now';
      });
    }
    const bulkOpen = this.byId('pm-bulk-open');
    if (bulkOpen) {
      bulkOpen.addEventListener('click', () => {
        const cb = this.byId('pm-select-all') as HTMLInputElement | null;
        if (!cb) return;
        cb.checked = true;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }

    const emptyClear = this.byId('pm-empty-clear');
    if (emptyClear) emptyClear.addEventListener('click', () => this.clearFilters());

    const filtersBtn = this.byId('pm-filters');
    if (filtersBtn) {
      filtersBtn.addEventListener('click', () => {
        this.byId('pm-filter-drawer')?.classList.add('open');
      });
    }
    const drawer = this.byId('pm-filter-drawer');
    if (drawer) {
      drawer.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('[data-drawer-close]')) {
          drawer.classList.remove('open');
        }
      });
    }
    const fdApply = this.byId('fd-apply');
    if (fdApply) {
      fdApply.addEventListener('click', () => {
        const count = this.advIds.filter((id) => this.advVal(id)).length;
        const badge = this.byId('pm-filter-badge');
        if (badge) {
          badge.textContent = String(count);
          badge.classList.toggle('hidden', count === 0);
        }
        drawer?.classList.remove('open');
        this.render();
        this.toastService.show(count + ' filter' + (count !== 1 ? 's' : '') + ' applied', 'success');
      });
    }
    const fdReset = this.byId('fd-reset');
    if (fdReset) {
      fdReset.addEventListener('click', () => {
        this.qsa('#pm-filter-drawer select').forEach((s) => ((s as HTMLSelectElement).value = ''));
        this.qsa('#pm-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
        this.byId('pm-filter-badge')?.classList.add('hidden');
        this.render();
      });
    }

    const exportRun = this.byId('pm-export-run');
    if (exportRun) {
      exportRun.addEventListener('click', () => {
        const fmtEl = this.document.querySelector('input[name="exp-fmt"]:checked') as HTMLInputElement | null;
        const scopeEl = this.document.querySelector('input[name="exp-scope"]:checked') as HTMLInputElement | null;
        const fmt = fmtEl?.value || 'CSV';
        const scope = scopeEl?.value || 'all';
        this.closeModal('pm-export-modal');
        if (fmt === 'Print') { window.print(); return; }
        this.toastService.show('Exported ' + scope + ' records as ' + fmt, 'success');
      });
    }
    const exportBtn = this.byId('pm-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const el = this.byId('exp-sel-count');
        if (el) el.textContent = String(this.visibleRowChecks().filter((b) => b.checked).length);
      });
    }
    const importRun = this.byId('pm-import-run');
    if (importRun) {
      importRun.addEventListener('click', () => {
        this.byId('pm-import-summary')?.classList.remove('hidden');
        this.toastService.show('Imported 14 patients (2 warnings)', 'success');
      });
    }
    const importTemplate = this.byId('pm-import-template');
    if (importTemplate) {
      importTemplate.addEventListener('click', (e) => {
        e.preventDefault();
        this.toastService.show('Sample template downloaded', 'info');
      });
    }

    this.initDeleteModal();
    this.wireSelectionAndBulk();
    this.document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.qsa('.pm-drawer.open').forEach((d) => d.classList.remove('open'));
      }
    });

    this.render();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa(selector: string): HTMLElement[] {
    return Array.prototype.slice.call(this.document.querySelectorAll(selector));
  }

  private advVal(id: string): string {
    const e = this.document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    return e ? e.value : '';
  }

  private matches(el: HTMLElement): boolean {
    const ds = el.dataset;
    if (this.fDept?.value && ds['dept'] !== this.fDept.value) return false;
    if (this.fStatus?.value && ds['status'] !== this.fStatus.value) return false;
    if (this.advVal('fd-dept') && ds['dept'] !== this.advVal('fd-dept')) return false;
    if (this.advVal('fd-doctor') && ds['doctor'] !== this.advVal('fd-doctor')) return false;
    if (this.advVal('fd-status') && ds['status'] !== this.advVal('fd-status')) return false;
    if (this.advVal('fd-admission') && ds['admissionType'] !== this.advVal('fd-admission')) return false;
    if (this.advVal('fd-blood') && ds['blood'] !== this.advVal('fd-blood')) return false;
    if (this.advVal('fd-gender') && ds['gender'] !== this.advVal('fd-gender')) return false;
    if (this.advVal('fd-insurance') && ds['insurance'] !== this.advVal('fd-insurance')) return false;
    if (this.advVal('fd-age-min') && +(ds['age'] ?? 0) < +this.advVal('fd-age-min')) return false;
    if (this.advVal('fd-age-max') && +(ds['age'] ?? 0) > +this.advVal('fd-age-max')) return false;
    if (this.advVal('fd-from') && (ds['admission'] ?? '') < this.advVal('fd-from')) return false;
    if (this.advVal('fd-to') && (ds['admission'] ?? '') > this.advVal('fd-to')) return false;
    return true;
  }

  private compare = (a: HTMLElement, b: HTMLElement): number => {
    const pinA = a.classList.contains('is-pinned');
    const pinB = b.classList.contains('is-pinned');
    if (pinA !== pinB) return pinA ? -1 : 1;
    const sortVal = this.sortSel?.value;
    switch (sortVal) {
      case 'name-desc':
        return (b.dataset['name'] ?? '').localeCompare(a.dataset['name'] ?? '');
      case 'newest':
        return (b.dataset['admission'] ?? '').localeCompare(a.dataset['admission'] ?? '');
      case 'oldest':
        return (a.dataset['admission'] ?? '').localeCompare(b.dataset['admission'] ?? '');
      case 'age':
        return +(b.dataset['age'] ?? 0) - +(a.dataset['age'] ?? 0);
      case 'status':
        return (a.dataset['status'] ?? '').localeCompare(b.dataset['status'] ?? '');
      default:
        return (a.dataset['name'] ?? '').localeCompare(b.dataset['name'] ?? '');
    }
  };

  private visibleRowChecks(): HTMLInputElement[] {
    const container = this.view === 'grid' ? this.grid : this.tbody;
    const selector = container === this.grid ? '#pm-grid > .pm-card' : '#pm-tbody > tr';
    return this.qsa(selector)
      .filter((item) => !item.hidden)
      .map((item) => item.querySelector('[data-row-select]'))
      .filter((el): el is HTMLInputElement => !!el);
  }

  private syncSelectAll(): void {
    const boxes = this.visibleRowChecks();
    const checked = boxes.filter((b) => b.checked).length;
    [this.byId('pm-select-all'), this.byId('pm-select-all-2')].forEach((sa) => {
      if (!sa) return;
      const input = sa as HTMLInputElement;
      input.checked = boxes.length > 0 && checked === boxes.length;
      input.indeterminate = checked > 0 && checked < boxes.length;
    });
    this.syncBulkBar();
  }

  private syncBulkBar(): void {
    const ids = new Set<string>();
    this.qsa('[data-row-select]').forEach((b) => {
      if ((b as HTMLInputElement).checked) ids.add((b as HTMLInputElement).dataset['rowSelect'] || '');
    });
    this.qsa('[data-bulk-bar]').forEach((bar) => {
      (bar as HTMLElement).hidden = ids.size === 0;
      const count = bar.querySelector('[data-bulk-count]');
      if (count) count.textContent = String(ids.size);
    });
  }

  private wireSelectionAndBulk(): void {
    [this.byId('pm-select-all'), this.byId('pm-select-all-2')].forEach((sa) => {
      if (!sa) return;
      sa.addEventListener('change', () => {
        const on = (sa as HTMLInputElement).checked;
        this.visibleRowChecks().forEach((b) => {
          b.checked = on;
          this.qsa('[data-row-select="' + b.dataset['rowSelect'] + '"]').forEach((dup) => ((dup as HTMLInputElement).checked = on));
        });
        this.syncSelectAll();
      });
    });

    this.document.addEventListener('change', (e) => {
      const box = (e.target as HTMLElement).closest('[data-row-select]') as HTMLInputElement | null;
      if (!box) return;
      const id = box.dataset['rowSelect'];
      this.qsa('[data-row-select="' + id + '"]').forEach((b) => ((b as HTMLInputElement).checked = box.checked));
      this.syncSelectAll();
    });

    this.document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-clear-selection]')) {
        this.qsa('[data-row-select]').forEach((b) => ((b as HTMLInputElement).checked = false));
        this.syncSelectAll();
        return;
      }
      const rm = target.closest('[data-remove-selected]');
      if (rm) {
        const ids = new Set<string>();
        this.qsa('[data-row-select]').forEach((b) => {
          if ((b as HTMLInputElement).checked) ids.add((b as HTMLInputElement).dataset['rowSelect'] || '');
        });
        ids.forEach((id) => {
          this.qsa('[id$="-item-' + id + '"]').forEach((el) => el.remove());
        });
        this.syncSelectAll();
      }
    });
  }

  // ---- static list engine (ported from MC.staticList) ----

  private itemsOf(view: StaticListView): HTMLElement[] {
    return Array.prototype.slice.call(view.container.querySelectorAll(view.itemSelector));
  }

  private passes(el: HTMLElement): boolean {
    const term = this.search ? this.search.value.trim().toLowerCase() : '';
    if (term && (el.textContent || '').toLowerCase().indexOf(term) === -1) return false;
    return this.matches(el);
  }

  private pageButton(label: string, target: number, opts: { active?: boolean; disabled?: boolean; ariaLabel?: string; icon?: string }): HTMLButtonElement {
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
      this.state.page = target;
      this.render();
    });
    return b;
  }

  private renderPager(pages: number): void {
    if (!this.pageNav) return;
    this.pageNav.textContent = '';
    this.pageNav.appendChild(this.pageButton('', this.state.page - 1, { icon: 'icon-chevron-left', disabled: this.state.page === 1, ariaLabel: 'Previous page' }));
    let start = Math.max(1, this.state.page - 2);
    const end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    for (let p = start; p <= end; p++) {
      this.pageNav.appendChild(this.pageButton(String(p), p, { active: p === this.state.page }));
    }
    this.pageNav.appendChild(this.pageButton('', this.state.page + 1, { icon: 'icon-chevron-right', disabled: this.state.page === pages, ariaLabel: 'Next page' }));
  }

  private render(): void {
    if (!this.grid || !this.tbody) return;
    const views: StaticListView[] = [
      { container: this.grid, itemSelector: '.pm-card' },
      { container: this.tbody, itemSelector: 'tr' },
    ];
    const infoHolder: { value: StaticListInfo | null } = { value: null };
    views.forEach((view) => {
      const all = this.itemsOf(view);
      let shown = all.filter((el) => this.passes(el));
      shown = shown.slice().sort(this.compare);
      const pages = Math.max(1, Math.ceil(shown.length / this.state.perPage));
      if (this.state.page > pages) this.state.page = pages;
      const start = (this.state.page - 1) * this.state.perPage;
      const slice = shown.slice(start, start + this.state.perPage);
      all.forEach((el) => { el.hidden = slice.indexOf(el) === -1; });
      slice.forEach((el) => view.container.appendChild(el));
      if (!infoHolder.value) infoHolder.value = { total: shown.length, allCount: all.length, from: start, shown: slice.length, pages };
    });

    if ((window as any).HSStaticMethods) (window as any).HSStaticMethods.autoInit();

    const result = infoHolder.value;
    if (result) {
      const count = this.byId('pm-count');
      if (count) count.textContent = result.total + ' of ' + result.allCount + ' patients';
      const pageInfo = this.byId('pm-page-info');
      if (pageInfo) {
        pageInfo.textContent = result.total
          ? 'Showing ' + (result.from + 1) + '–' + (result.from + result.shown) + ' of ' + result.total
          : 'No records';
      }
      this.empty?.classList.toggle('hidden', result.total !== 0);
      this.pager?.classList.toggle('hidden', result.total === 0);
      this.grid?.classList.toggle('hidden', this.view !== 'grid' || result.total === 0);
      this.listWrap?.classList.toggle('hidden', this.view !== 'list' || result.total === 0);
      this.syncSelectAll();
      this.renderPager(result.pages);
    }
  }

  private clearFilters(): void {
    if (this.search) this.search.value = '';
    if (this.fDept) this.fDept.value = '';
    if (this.fStatus) this.fStatus.value = '';
    this.qsa('#pm-filter-drawer select').forEach((s) => ((s as HTMLSelectElement).value = ''));
    this.qsa('#pm-filter-drawer input').forEach((i) => ((i as HTMLInputElement).value = ''));
    this.byId('pm-filter-badge')?.classList.add('hidden');
    this.render();
  }

  // ---- shared modal helpers (ported from MC.openModal/closeModal/confirmDelete/initDeleteModal) ----

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && (window as any).HSOverlay) {
      (window as any).HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && (window as any).HSOverlay) {
      (window as any).HSOverlay.close(el);
      return;
    }
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
}
