import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink],
  selector: 'app-walk-in-patients',
  styleUrl: './walk-in-patients.css',
  templateUrl: './walk-in-patients.html',
})
export class WalkInPatients implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STATUS: Record<string, string> = {
    Waiting: 'badge-amber',
    Registered: 'badge-blue',
    Completed: 'badge-green',
    Cancelled: 'badge-red',
  };

  private readonly DOCTORS: Record<string, string[]> = {
    Cardiology: ['Dr. Sarah Chen', 'Dr. Isabelle Duncan'],
    Neurology: ['Dr. Michael Reyes', 'Dr. Camille Rousseau'],
    Orthopedics: ['Dr. Emily Carter', 'Dr. Theodore Nakamura'],
    Pediatrics: ['Dr. David Okonkwo', 'Dr. Hannah Whitmore'],
    Oncology: ['Dr. Laura Bennett', 'Dr. Victor Ramirez'],
    Emergency: ['Dr. Gregory Hollis', 'Dr. Omar Haddad'],
  };

  private assignRow: HTMLElement | null = null;
  private tbody!: HTMLElement | null;
  private delCallback: (() => void) | null = null;
  private state = { page: 1, perPage: 8 };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.tbody = this.byId('tbody');
    if (!this.tbody) return;

    const wDept = this.byId('w-dept') as HTMLSelectElement | null;
    const wDoctor = this.byId('w-doctor') as HTMLSelectElement | null;
    const asDept = this.byId('as-dept') as HTMLSelectElement | null;
    const asDoctor = this.byId('as-doctor') as HTMLSelectElement | null;

    if (wDept && wDoctor) {
      this.fillDoctors(wDept, wDoctor);
      wDept.addEventListener('change', () => this.fillDoctors(wDept, wDoctor));
    }
    if (asDept && asDoctor) {
      this.fillDoctors(asDept, asDoctor);
      asDept.addEventListener('change', () => this.fillDoctors(asDept, asDoctor));
    }

    this.render();

    this.byId('select-all')?.addEventListener('change', () => {
      const checked = (this.byId('select-all') as HTMLInputElement).checked;
      this.dataRows().forEach((r) => {
        const cb = r.querySelector('[data-row-select]') as HTMLInputElement | null;
        if (cb) cb.checked = !r.hidden && checked;
      });
      this.syncBulk();
    });
    this.tbody.addEventListener('change', (e) => {
      if (!(e.target as HTMLElement).closest('[data-row-select]')) return;
      this.syncSelectAll();
      this.syncBulk();
    });

    this.byId('btn-register')?.addEventListener('click', () => this.onRegister());

    this.tbody.addEventListener('click', (e) => this.onRowClick(e));

    this.byId('assign-confirm')?.addEventListener('click', () => this.onAssignConfirm());

    this.qsa('[data-bulk]').forEach((btn) => btn.addEventListener('click', () => this.onBulk(btn as HTMLElement)));

    this.byId('btn-reset')?.addEventListener('click', () => this.onReset());
    this.byId('btn-print')?.addEventListener('click', () => window.print());
    this.byId('btn-export')?.addEventListener('click', () => this.onExport());

    this.byId('slip-print')?.addEventListener('click', () => {
      this.hsClose('slip-modal');
      window.print();
    });

    this.closeOnBackdrop('del-modal');
    this.initDeleteModal();
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private hsOpen(id: string): void {
    const el = this.byId(id);
    const w = window as any;
    if (el && w.HSOverlay) w.HSOverlay.open(el);
  }

  private hsClose(id: string): void {
    const el = this.byId(id);
    const w = window as any;
    if (el && w.HSOverlay) w.HSOverlay.close(el);
  }

  private badge(map: Record<string, string>, value: string): string {
    return `<span class="badge ${map[value] || 'badge-gray'}">${value}</span>`;
  }

  private fillDoctors(deptEl: HTMLSelectElement, doctorEl: HTMLSelectElement): void {
    const list = this.DOCTORS[deptEl.value] || [];
    doctorEl.innerHTML = list.map((d) => `<option>${d}</option>`).join('');
  }

  private slipRow(label: string, value: string): string {
    return (
      '<div class="flex justify-between gap-3 text-xs">' +
      `<span class="text-gray-500 dark:text-gray-400">${label}</span>` +
      `<span class="font-medium text-gray-900">${value}</span></div>`
    );
  }

  private dataRows(): HTMLElement[] {
    if (!this.tbody) return [];
    return Array.prototype.slice.call(this.tbody.querySelectorAll('tr[data-id]'));
  }

  private stats(): void {
    const rows = this.dataRows();
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-today', rows.length);
    set('stat-waiting', rows.filter((r) => r.dataset['status'] === 'Waiting').length);
    set('stat-registered', rows.filter((r) => r.dataset['status'] === 'Registered').length);
    set('stat-completed', rows.filter((r) => r.dataset['status'] === 'Completed').length);
  }

  private setStatus(row: HTMLElement, status: string): void {
    row.dataset['status'] = status;
    const cell = row.children[7];
    if (cell) cell.innerHTML = this.badge(this.STATUS, status);
  }

  private matches(row: HTMLElement): boolean {
    const v = (this.byId('filter-status') as HTMLSelectElement | null)?.value || '';
    return !v || row.dataset['status'] === v;
  }

  private passes(row: HTMLElement): boolean {
    const term = (this.byId('search') as HTMLInputElement | null)?.value.trim().toLowerCase() || '';
    if (term && (row.textContent || '').toLowerCase().indexOf(term) === -1) return false;
    return this.matches(row);
  }

  private compareById(a: HTMLElement, b: HTMLElement): number {
    return +(a.dataset['id'] || 0) - +(b.dataset['id'] || 0);
  }

  /* ---------------- static list render (ported from MC.staticList) ---------------- */

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
    const pager = this.byId('pager');
    if (!pager) return;
    pager.textContent = '';
    pager.appendChild(this.pageButton('', this.state.page - 1, { icon: 'icon-chevron-left', disabled: this.state.page === 1, ariaLabel: 'Previous page' }));
    let start = Math.max(1, this.state.page - 2);
    const end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    for (let p = start; p <= end; p++) pager.appendChild(this.pageButton(String(p), p, { active: p === this.state.page }));
    pager.appendChild(this.pageButton('', this.state.page + 1, { icon: 'icon-chevron-right', disabled: this.state.page === pages, ariaLabel: 'Next page' }));
  }

  private render(): void {
    if (!this.tbody) return;
    const view: StaticListView = { container: this.tbody, itemSelector: 'tr[data-id]' };
    const all = this.dataRows();
    let shown = all.filter((el) => this.passes(el));
    shown = shown.slice().sort((a, b) => this.compareById(a, b));
    const pages = Math.max(1, Math.ceil(shown.length / this.state.perPage));
    if (this.state.page > pages) this.state.page = pages;
    const start = (this.state.page - 1) * this.state.perPage;
    const slice = shown.slice(start, start + this.state.perPage);
    all.forEach((el) => {
      el.hidden = slice.indexOf(el) === -1;
    });
    slice.forEach((el) => view.container.appendChild(el));
    const info: StaticListInfo = { total: shown.length, allCount: all.length, from: start, shown: slice.length, pages };

    const w = window as any;
    if (w.HSStaticMethods) w.HSStaticMethods.autoInit();

    const infoEl = this.byId('info');
    if (infoEl) {
      infoEl.textContent = info.total
        ? `Showing ${info.from + 1} to ${info.from + info.shown} of ${info.total} entries`
        : 'Showing 0 to 0 of 0 entries';
    }
    const emptyRow = this.byId('tbody-empty-row') as HTMLTableRowElement | null;
    if (emptyRow) emptyRow.hidden = info.total !== 0;
    this.syncSelectAll();
    this.renderPager(info.pages);
    this.stats();
  }

  /* ---------------- bulk selection ---------------- */

  private visibleRows(): HTMLElement[] {
    return this.dataRows().filter((r) => !r.hidden);
  }

  private selectedRows(): HTMLElement[] {
    return this.dataRows().filter((r) => {
      const cb = r.querySelector('[data-row-select]') as HTMLInputElement | null;
      return cb && cb.checked;
    });
  }

  private syncBulk(): void {
    if (!this.tbody) return;
    const n = this.qsa('[data-row-select]:checked', this.tbody).length;
    this.byId('bulk-bar')?.classList.toggle('hidden', n === 0);
    const countEl = this.byId('bulk-count');
    if (countEl) countEl.textContent = String(n);
  }

  private syncSelectAll(): void {
    const boxes = this.visibleRows()
      .map((r) => r.querySelector('[data-row-select]') as HTMLInputElement | null)
      .filter((b): b is HTMLInputElement => !!b);
    const checked = boxes.filter((b) => b.checked).length;
    const sa = this.byId('select-all') as HTMLInputElement | null;
    if (sa) {
      sa.checked = boxes.length > 0 && checked === boxes.length;
      sa.indeterminate = checked > 0 && checked < boxes.length;
    }
  }

  private clearSelection(): void {
    if (!this.tbody) return;
    this.qsa<HTMLInputElement>('[data-row-select]:checked', this.tbody).forEach((cb) => (cb.checked = false));
    this.syncSelectAll();
    this.syncBulk();
  }

  /* ---------------- register ---------------- */

  private onRegister(): void {
    const name = (this.byId('w-name') as HTMLInputElement).value.trim();
    const phone = (this.byId('w-phone') as HTMLInputElement).value.trim();
    const symptoms = (this.byId('w-symptoms') as HTMLTextAreaElement).value.trim();

    if (!name) {
      this.toast('Patient name is required', 'error');
      return;
    }
    if (!phone) {
      this.toast('Phone number is required', 'error');
      return;
    }
    if (!symptoms) {
      this.toast('Symptoms are required', 'error');
      return;
    }

    const nextToken = 'W-' + String(this.dataRows().length + 1).padStart(3, '0');
    (this.byId('reg-form') as HTMLFormElement).reset();
    const wDept = this.byId('w-dept') as HTMLSelectElement | null;
    const wDoctor = this.byId('w-doctor') as HTMLSelectElement | null;
    if (wDept && wDoctor) this.fillDoctors(wDept, wDoctor);
    this.toast(name + ' registered · token ' + nextToken);
  }

  /* ---------------- row actions ---------------- */

  private onRowClick(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-act]') as HTMLElement | null;
    if (!btn) return;
    const row = btn.closest('tr') as HTMLElement | null;
    if (!row) return;

    switch (btn.dataset['act']) {
      case 'assign': {
        this.assignRow = row;
        const nameEl = this.byId('assign-name');
        if (nameEl) nameEl.textContent = row.dataset['token'] + ' · ' + row.dataset['patient'];
        const asDept = this.byId('as-dept') as HTMLSelectElement;
        const asDoctor = this.byId('as-doctor') as HTMLSelectElement;
        asDept.value = row.dataset['dept'] || '';
        this.fillDoctors(asDept, asDoctor);
        if (row.dataset['doctor']) asDoctor.value = row.dataset['doctor'];
        this.hsOpen('assign-modal');
        return;
      }
      case 'register':
        if (!row.dataset['doctor']) {
          this.toast('Assign a doctor before registering', 'error');
          return;
        }
        this.setStatus(row, 'Registered');
        this.toast(row.dataset['patient'] + ' registered');
        break;
      case 'complete':
        this.setStatus(row, 'Completed');
        this.toast(row.dataset['patient'] + ' marked complete');
        break;
      case 'print': {
        const body = this.byId('slip-body');
        if (body) {
          body.innerHTML =
            '<div class="text-center border-b border-border-color pb-3 mb-3">' +
            '<p class="text-sm font-bold text-gray-900">Dreams HMS</p>' +
            '<p class="text-[11px] text-gray-500 dark:text-gray-400">Outpatient Walk-in Token</p></div>' +
            `<p class="text-center text-4xl font-extrabold text-primary">${row.dataset['token']}</p>` +
            `<p class="text-center text-sm font-medium text-gray-900 mt-1">${row.dataset['patient']}</p>` +
            '<div class="mt-4 space-y-1.5">' +
            this.slipRow('Department', row.dataset['dept'] || '') +
            this.slipRow('Doctor', row.dataset['doctor'] || 'To be assigned') +
            this.slipRow('Priority', row.dataset['priority'] || '') +
            this.slipRow('Payment', row.dataset['payment'] || '') +
            this.slipRow('Fee', '$' + parseFloat(row.dataset['fee'] || '0').toFixed(2)) +
            '</div>' +
            '<p class="text-center text-[10px] text-gray-400 dark:text-gray-500 mt-4 pt-3 border-t border-border-color">' +
            'Please keep this slip until your consultation is complete.</p>';
        }
        this.hsOpen('slip-modal');
        return;
      }
      case 'cancel':
        this.confirmDelete(row.dataset['token'] + ' · ' + row.dataset['patient'], () => {
          this.setStatus(row, 'Cancelled');
          row.dataset['fee'] = '0';
          this.toast('Walk-in cancelled');
          this.render();
        });
        return;
    }
    this.render();
  }

  private onAssignConfirm(): void {
    if (this.assignRow) {
      const asDept = this.byId('as-dept') as HTMLSelectElement;
      const asDoctor = this.byId('as-doctor') as HTMLSelectElement;
      this.assignRow.dataset['dept'] = asDept.value;
      this.assignRow.dataset['doctor'] = asDoctor.value;
      const deptCell = this.assignRow.children[3];
      if (deptCell) deptCell.textContent = this.assignRow.dataset['dept'] || '';
      const doctorCell = this.assignRow.children[4];
      if (doctorCell) {
        doctorCell.innerHTML = this.assignRow.dataset['doctor'] || '<span class="text-xs text-amber-600 font-medium">Unassigned</span>';
      }
      if (this.assignRow.dataset['status'] === 'Waiting') this.setStatus(this.assignRow, 'Registered');
    }
    this.hsClose('assign-modal');
    this.toast('Doctor assigned');
    this.render();
  }

  /* ---------------- bulk ---------------- */

  private onBulk(btn: HTMLElement): void {
    const rows = this.selectedRows();
    if (!rows.length) return;
    rows.forEach((row) => {
      this.setStatus(row, btn.dataset['bulk'] === 'complete' ? 'Completed' : 'Cancelled');
      if (row.dataset['status'] === 'Cancelled') row.dataset['fee'] = '0';
    });
    this.toast(rows.length + ' walk-ins updated');
    this.clearSelection();
    this.render();
  }

  /* ---------------- toolbar ---------------- */

  private onReset(): void {
    (this.byId('search') as HTMLInputElement).value = '';
    (this.byId('filter-status') as HTMLSelectElement).value = '';
    this.render();
    this.toast('Filters cleared', 'info');
  }

  private onExport(): void {
    const head = ['Token', 'Patient', 'Phone', 'Age', 'Department', 'Doctor', 'Symptoms', 'Priority', 'Status', 'Payment', 'Fee'];
    const rows = this.dataRows().map((r) => [
      r.dataset['token'], r.dataset['patient'], r.dataset['phone'], r.dataset['age'], r.dataset['dept'],
      r.dataset['doctor'] || 'Unassigned', r.dataset['symptoms'], r.dataset['priority'], r.dataset['status'],
      r.dataset['payment'], r.dataset['fee'],
    ]);
    const csv = [head, ...rows].map((line) => line.map((c) => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = this.document.createElement('a');
    a.href = url;
    a.download = 'walk-in-patients.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Walk-ins exported');
  }

  /* ---------------- shared delete-confirm modal (ported from MC.confirmDelete/initDeleteModal) ---------------- */

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
      el.addEventListener('mousedown', (e) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }
}
