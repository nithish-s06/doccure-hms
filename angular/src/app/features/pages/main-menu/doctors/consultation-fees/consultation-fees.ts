import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js — "CONSULTATION-FEES".
 * Every fee record ships as static markup in both the grid (#cf-grid) and
 * list (#cf-tbody) views; this reimplements MC.staticList's search/filter/
 * sort over those existing nodes (no data array, no innerHTML rebuilding of
 * rows), plus the toolbar toggles, selection/bulk bar, the sidebar and
 * modal fee calculators, the import dropzone, export format chips, and the
 * generic [data-toast] handler for the 10 static Preline confirm modals.
 */
@Component({
  imports: [],
  selector: 'app-consultation-fees',
  styleUrl: './consultation-fees.css',
  templateUrl: './consultation-fees.html',
})
export class ConsultationFees implements AfterViewInit {
  private view: 'grid' | 'list' = 'grid';

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireToast();
    this.wireListSearchFilterSort();
    this.wireToolbar();
    this.wireSelection();
    this.wireRefresh();
    this.wireCalculators();
    this.wireImportDropzone();
    this.wireExportChips();
    setTimeout(() => {
      this.byId('cf-skeleton')?.classList.add('hidden');
      this.byId('cf-content')?.classList.remove('hidden');
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private qs(sel: string, root?: ParentNode): HTMLElement | null {
    return (root || this.document).querySelector(sel);
  }
  private qsa(sel: string, root?: ParentNode): HTMLElement[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(sel));
  }
  private toast(msg: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, tone);
  }

  private wireToast(): void {
    this.document.addEventListener('click', (e: Event) => {
      const tt = (e.target as HTMLElement).closest('[data-toast]') as HTMLElement | null;
      if (tt) this.toast(tt.getAttribute('data-toast') || '', 'info');
    });
  }

  /* ================= GRID / LIST (search, filter, sort) ================= */
  private wireListSearchFilterSort(): void {
    const grid = this.byId('cf-grid');
    const tbody = this.byId('cf-tbody');
    const empty = this.byId('cf-empty');
    const viewGrid = this.byId('cf-view-grid');
    const viewList = this.byId('cf-view-list');
    const search = this.byId('cf-search') as HTMLInputElement | null;
    const fDept = this.qs('[data-f="dept"]') as HTMLSelectElement | null;
    const fDoctor = this.qs('[data-f="doctor"]') as HTMLSelectElement | null;
    const fCtype = this.qs('[data-f="ctype"]') as HTMLSelectElement | null;
    const fCat = this.qs('[data-f="cat"]') as HTMLSelectElement | null;
    const fStatus = this.qs('[data-f="status"]') as HTMLSelectElement | null;
    const sortSel = this.qs('[data-f="sort"]') as HTMLSelectElement | null;

    const matches = (el: HTMLElement): boolean => {
      if (fDept?.value && el.dataset['dept'] !== fDept.value) return false;
      if (fDoctor?.value && el.dataset['doctor'] !== fDoctor.value) return false;
      if (fCtype?.value && el.dataset['ctype'] !== fCtype.value) return false;
      if (fCat?.value && el.dataset['cat'] !== fCat.value) return false;
      if (fStatus?.value && el.dataset['status'] !== fStatus.value) return false;
      return true;
    };
    const textMatches = (el: HTMLElement, q: string): boolean => {
      if (!q) return true;
      return (el.textContent || '').toLowerCase().indexOf(q) >= 0;
    };
    const compare = (a: HTMLElement, b: HTMLElement): number => {
      switch (sortSel?.value) {
        case 'feelow':
          return (+(a.dataset['final'] || 0)) - (+(b.dataset['final'] || 0));
        case 'rev':
          return (+(b.dataset['rev'] || 0)) - (+(a.dataset['rev'] || 0));
        case 'name':
          return (a.dataset['name'] || '').localeCompare(b.dataset['name'] || '');
        default:
          return (+(b.dataset['final'] || 0)) - (+(a.dataset['final'] || 0));
      }
    };

    const refresh = (): void => {
      const q = (search?.value || '').toLowerCase();
      const cards = grid ? this.qsa('.cf-fcard', grid) : [];
      const rows = tbody ? this.qsa('tr', tbody) : [];

      let visibleCount = 0;
      cards.forEach((el) => {
        const show = matches(el) && textMatches(el, q);
        el.hidden = !show;
        if (show) visibleCount++;
      });
      let visibleRows = 0;
      rows.forEach((el) => {
        const show = matches(el) && textMatches(el, q);
        (el as HTMLElement & { hidden: boolean }).hidden = !show;
        if (show) visibleRows++;
      });

      // Reorder within each container per compare().
      if (grid) {
        cards
          .filter((el) => !el.hidden)
          .sort(compare)
          .forEach((el) => grid.appendChild(el));
      }
      if (tbody) {
        rows
          .filter((el) => !(el as HTMLElement).hidden)
          .sort(compare)
          .forEach((el) => tbody.appendChild(el));
      }

      const total = grid ? visibleCount : visibleRows;
      empty?.classList.toggle('hidden', total !== 0);
      viewGrid?.classList.toggle('hidden', this.view !== 'grid' || total === 0);
      viewList?.classList.toggle('hidden', this.view !== 'list' || total === 0);
      this.syncSelAll();
    };

    search?.addEventListener('input', refresh);
    [fDept, fDoctor, fCtype, fCat, fStatus, sortSel].forEach((sel) => sel?.addEventListener('change', refresh));

    this.byId('cf-view')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.view = b.getAttribute('data-v') as 'grid' | 'list';
      this.qsa('.cf-segb', this.byId('cf-view')!).forEach((x) => x.classList.toggle('active', x === b));
      refresh();
    });

    this.byId('cf-clear')?.addEventListener('click', () => {
      this.qsa('[data-f]').forEach((s) => {
        if (s.getAttribute('data-f') !== 'sort') (s as HTMLInputElement | HTMLSelectElement).value = '';
      });
      this.updateFilterCount();
      refresh();
      this.toast('Filters cleared');
    });

    // expose for refresh() re-use elsewhere (refresh button)
    this.refreshList = refresh;
    refresh();
  }

  private refreshList: () => void = () => {};

  private wireToolbar(): void {
    this.byId('cf-filter-toggle')?.addEventListener('click', () => this.byId('cf-filters')?.classList.toggle('hidden'));
    this.byId('cf-cols-toggle')?.addEventListener('click', () => this.byId('cf-cols')?.classList.toggle('hidden'));
    this.qsa('[data-f]').forEach((sel) => sel.addEventListener('change', () => this.updateFilterCount()));
  }

  private updateFilterCount(): void {
    const fDept = this.qs('[data-f="dept"]') as HTMLSelectElement | null;
    const fDoctor = this.qs('[data-f="doctor"]') as HTMLSelectElement | null;
    const fCtype = this.qs('[data-f="ctype"]') as HTMLSelectElement | null;
    const fCat = this.qs('[data-f="cat"]') as HTMLSelectElement | null;
    const fStatus = this.qs('[data-f="status"]') as HTMLSelectElement | null;
    const n = [fDept, fDoctor, fCtype, fCat, fStatus].filter((s) => s?.value).length;
    const el = this.byId('cf-filter-n');
    if (el) {
      el.textContent = String(n);
      el.classList.toggle('hidden', n === 0);
    }
  }

  /* ================= SELECTION / BULK (list view only) ================= */
  private selectedBoxes(): HTMLInputElement[] {
    return this.qsa('.cf-rowcb') as HTMLInputElement[];
  }
  private selCount(): number {
    return this.selectedBoxes().filter((b) => b.checked).length;
  }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('cf-bulk-n');
    if (el) el.textContent = String(n);
    this.byId('cf-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('cf-selall') as HTMLInputElement | null;
    if (!sa) return;
    const boxes = this.selectedBoxes().filter((b) => !(b.closest('tr') as HTMLElement)?.hidden);
    sa.checked = boxes.length > 0 && boxes.every((b) => b.checked);
  }

  private wireSelection(): void {
    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('cf-rowcb')) {
        this.syncBulk();
        this.syncSelAll();
      }
      if (target.id === 'cf-selall') {
        const checked = (target as HTMLInputElement).checked;
        this.selectedBoxes().forEach((b) => {
          if (!(b.closest('tr') as HTMLElement)?.hidden) b.checked = checked;
        });
        this.syncBulk();
      }
    });
    this.byId('cf-bulk-x')?.addEventListener('click', () => {
      this.selectedBoxes().forEach((b) => (b.checked = false));
      this.syncBulk();
      this.syncSelAll();
    });
    this.qsa('[data-bulk]').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.getAttribute('data-bulk') || '';
        const n = this.selCount();
        const names: Record<string, string> = { update: 'Fees updated for', discount: 'Discount applied to', status: 'Status changed for', export: 'Exported', delete: 'record(s) deleted for' };
        this.toast((names[act] || 'Updated') + ' ' + n + ' record' + (n === 1 ? '' : 's'), act === 'delete' ? 'error' : 'success');
      });
    });
  }

  private wireRefresh(): void {
    this.qs('[data-refresh]')?.addEventListener('click', () => {
      const el = this.byId('cf-h-updated');
      if (el) el.textContent = 'just now';
      this.refreshList();
      this.animateRings();
      this.toast('Fee data refreshed');
    });
  }

  /* ================= FEE CALCULATORS (live, client-side only) ================= */
  private money(n: number): string {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  private wireCalculators(): void {
    const calc = (): void => {
      const base = +((this.byId('cf-c-base') as HTMLInputElement)?.value || 0);
      const mult = +((this.byId('cf-c-type') as HTMLSelectElement)?.value || 1);
      const add = +((this.byId('cf-c-add') as HTMLInputElement)?.value || 0);
      const discP = +((this.byId('cf-c-disc') as HTMLInputElement)?.value || 0);
      const taxP = +((this.byId('cf-c-tax') as HTMLInputElement)?.value || 0);
      const insP = +((this.byId('cf-c-ins') as HTMLInputElement)?.value || 0);
      const gross = base * mult + add;
      const disc = (gross * discP) / 100;
      const taxable = gross - disc;
      const tax = (taxable * taxP) / 100;
      const total = taxable + tax;
      const ins = (total * insP) / 100;
      const pays = total - ins;
      const lines = this.byId('cf-calc-lines');
      if (lines) {
        lines.innerHTML = ([
          ['Consultation (' + mult + '×)', this.money(base * mult)],
          ['Additional charges', this.money(add)],
          ['Discount (' + discP + '%)', '-' + this.money(disc)],
          ['Tax / GST (' + taxP + '%)', '+' + this.money(tax)],
          ['Insurance covers (' + insP + '%)', '-' + this.money(ins)],
        ] as [string, string][])
          .map((x) => `<div class="flex items-center justify-between"><span class="cf-muted">${x[0]}</span><span class="font-semibold text-[var(--color-gray-900)]">${x[1]}</span></div>`)
          .join('');
      }
      const totalEl = this.byId('cf-calc-total');
      if (totalEl) totalEl.textContent = this.money(pays);
    };
    this.qsa('.cf-calc').forEach((el) => el.addEventListener('input', calc));

    const mcalc = (): void => {
      const base = +((this.byId('cf-mc-base') as HTMLInputElement)?.value || 0);
      const mult = +((this.byId('cf-mc-type') as HTMLSelectElement)?.value || 1);
      const discP = +((this.byId('cf-mc-disc') as HTMLInputElement)?.value || 0);
      const taxP = +((this.byId('cf-mc-tax') as HTMLInputElement)?.value || 0);
      const insP = +((this.byId('cf-mc-ins') as HTMLInputElement)?.value || 0);
      const gross = base * mult;
      const disc = (gross * discP) / 100;
      const taxable = gross - disc;
      const tax = (taxable * taxP) / 100;
      const total = taxable + tax;
      const ins = (total * insP) / 100;
      const pays = total - ins;
      const lines = this.byId('cf-mc-lines');
      if (lines) {
        lines.innerHTML = ([
          ['Consultation (' + mult + '×)', this.money(gross)],
          ['Discount (' + discP + '%)', '-' + this.money(disc)],
          ['Tax (' + taxP + '%)', '+' + this.money(tax)],
          ['Insurance (' + insP + '%)', '-' + this.money(ins)],
        ] as [string, string][])
          .map((x) => `<div class="flex justify-between"><span class="cf-muted">${x[0]}</span><span class="font-semibold text-[var(--color-gray-900)]">${x[1]}</span></div>`)
          .join('');
      }
      const totalEl = this.byId('cf-mc-total');
      if (totalEl) totalEl.textContent = this.money(pays);
    };
    this.qsa('.cf-mcalc').forEach((el) => el.addEventListener('input', mcalc));
  }

  /* ================= IMPORT MODAL (dropzone + file preview) ================= */
  private wireImportDropzone(): void {
    const dz = this.byId('cf-dropzone');
    if (!dz) return;
    dz.addEventListener('click', () => (this.byId('cf-file') as HTMLInputElement | null)?.click());
    const fi = this.byId('cf-file') as HTMLInputElement | null;
    fi?.addEventListener('change', () => {
      if (fi.files && fi.files[0]) {
        const sum = this.byId('cf-import-sum');
        if (sum) sum.innerHTML = `<b class="text-[var(--color-gray-900)]">${fi.files[0].name}</b> ready · 32 rows · 0 errors`;
      }
    });
    ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
  }

  /* ================= EXPORT MODAL (format chip toggle) ================= */
  private wireExportChips(): void {
    this.qsa('.cf-expfmt').forEach((b) => {
      b.addEventListener('click', () => {
        this.qsa('.cf-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]'));
        b.classList.add('!border-[var(--color-primary)]');
      });
    });
  }

  /* ================= RINGS ================= */
  private animateRings(): void {
    this.qsa('.cf-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }
}
