import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';

interface BloodIssueRecord {
  id: number;
  group: string;
  units: number;
  issuedTo: string;
  issuedBy: string;
  date: string;
  crossmatch: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the shared "Blood Bank /
 * Nursing / Diet modules" CRUD block gated on
 * `document.body.dataset.page === "blood-issue"`, which called the generic
 * MC.crudList(cfg) engine. Reimplemented here as component methods; see
 * blood-requests.ts for the identical pattern notes (no add/edit/delete
 * modal markup ships in this page's HTML, so opening one is a guarded
 * no-op, matching the source's MC.openModal behavior on a missing id).
 */
@Component({
  imports: [RouterLink],
  selector: 'app-blood-issue',
  styleUrl: './blood-issue.css',
  templateUrl: './blood-issue.html',
})
export class BloodIssue implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly BADGE_C: Record<string, string> = {
    Compatible: 'text-success bg-success/10',
    Pending: 'text-warning bg-warning/10',
    Incompatible: 'text-danger bg-danger/10',
  };

  private data: BloodIssueRecord[] = [
    { id: 1, group: 'O+', units: 2, issuedTo: 'Ravi Kumar — ICU Bed 4', issuedBy: 'Nurse Fatima Ali', date: '2024-12-06 09:20', crossmatch: 'Compatible' },
    { id: 2, group: 'A-', units: 1, issuedTo: 'Sunita Rao — Surgery Bed 1', issuedBy: 'Nurse Grace Lim', date: '2024-12-05 14:10', crossmatch: 'Compatible' },
    { id: 3, group: 'B+', units: 1, issuedTo: 'James Miller — Ortho Ward 2', issuedBy: 'Nurse Omar Farid', date: '2024-12-04 11:45', crossmatch: 'Pending' },
    { id: 4, group: 'AB+', units: 1, issuedTo: 'Aisha Khan — Oncology Ward', issuedBy: 'Nurse Fatima Ali', date: '2024-12-04 08:30', crossmatch: 'Compatible' },
    { id: 5, group: 'O-', units: 3, issuedTo: 'Carlos Diaz — ICU Bed 7', issuedBy: 'Nurse Grace Lim', date: '2024-12-07 02:15', crossmatch: 'Compatible' },
    { id: 6, group: 'B-', units: 2, issuedTo: 'Lena Fischer — Maternity Ward', issuedBy: 'Nurse Priya Das', date: '2024-12-02 16:50', crossmatch: 'Incompatible' },
    { id: 7, group: 'A+', units: 1, issuedTo: 'Tom Baker — Emergency Bay 2', issuedBy: 'Nurse Omar Farid', date: '2024-11-30 19:05', crossmatch: 'Compatible' },
  ];
  private nextId = 8;
  private editingId: number | null = null;
  private todayStr = '';

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    const today = new Date(Math.max(...this.data.map((r) => new Date(r.date.split(' ')[0]).getTime())));
    this.todayStr = today.toISOString().slice(0, 10);
  }

  ngAfterViewInit(): void {
    (window as any)['biOpenAdd'] = () => this.openAdd();
    (window as any)['biOpenEdit'] = (id: number) => this.openEdit(id);
    (window as any)['biDelete'] = (id: number, name: string) => this.remove(id, name);

    const addBtn = this.byId('btn-add');
    if (addBtn) addBtn.onclick = () => this.openAdd();
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.onclick = () => this.save();
    const closeBtn = this.byId('m-close');
    if (closeBtn) closeBtn.onclick = () => this.closeModal();
    const cancelBtn = this.byId('m-cancel');
    if (cancelBtn) cancelBtn.onclick = () => this.closeModal();
    const search = this.byId('search');
    if (search) search.addEventListener('input', () => this.render());
    const fGroup = this.byId('filter-group');
    if (fGroup) fGroup.addEventListener('change', () => this.render());
    const fCross = this.byId('filter-crossmatch');
    if (fCross) fCross.addEventListener('change', () => this.render());

    this.render();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private detailUrl(r: BloodIssueRecord): string {
    return `blood-issue-detail.html?${new URLSearchParams({
      id: String(r.id), group: r.group, units: String(r.units), issuedTo: r.issuedTo,
      issuedBy: r.issuedBy, date: r.date, crossmatch: r.crossmatch,
    }).toString()}`;
  }

  private rowHTML(r: BloodIssueRecord): string {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${this.detailUrl(r)}">#BI-${String(r.id).padStart(5, '0')}</a></td>` +
      `<td class="font-medium text-gray-900">${r.group}</td>` +
      `<td class="text-gray-500 dark:text-gray-400">${r.units}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.issuedTo}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.issuedBy}</td>` +
      `<td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td>` +
      `<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_C[r.crossmatch] || ''}">${r.crossmatch}</span></td>` +
      '<td><div class="flex gap-1">' +
      `<button onclick="biOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>` +
      `<button onclick="biDelete(${r.id},'${r.issuedTo.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button>` +
      '</div></td></tr>';
  }

  private render(): void {
    const searchEl = this.byId('search') as HTMLInputElement | null;
    const q = (searchEl?.value || '').toLowerCase();
    const groupEl = this.byId('filter-group') as HTMLSelectElement | null;
    const crossEl = this.byId('filter-crossmatch') as HTMLSelectElement | null;
    const groupVal = groupEl?.value || '';
    const crossVal = crossEl?.value || '';

    const rows = this.data.filter((r) => {
      const m = !q || [r.issuedTo, r.issuedBy].some((f) => String(f).toLowerCase().includes(q));
      return m && (!groupVal || r.group === groupVal) && (!crossVal || r.crossmatch === crossVal);
    });
    const visible = new Set(rows.map((r) => r.id));
    const tbody = this.byId('tbody');
    tbody?.querySelectorAll('[data-row-id]').forEach((tr) => {
      tr.classList.toggle('hidden', !visible.has(Number((tr as HTMLElement).dataset['rowId'])));
    });
    const emptyRow = this.byId('tbody-empty');
    if (emptyRow) emptyRow.classList.toggle('hidden', rows.length !== 0);
    const count = this.byId('count');
    if (count) count.textContent = `${rows.length} of ${this.data.length}`;
    this.updateStats();
  }

  private updateStats(): void {
    const units = this.byId('stat-units');
    if (units) units.textContent = String(this.data.reduce((s, r) => s + r.units, 0));
    const today = this.byId('stat-today');
    if (today) today.textContent = String(this.data.filter((r) => r.date.slice(0, 10) === this.todayStr).length);
    const pendingcm = this.byId('stat-pendingcm');
    if (pendingcm) pendingcm.textContent = String(this.data.filter((r) => r.crossmatch === 'Pending').length);
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.length);
  }

  private openModal(id: string): void {
    this.byId(id)?.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(): void {
    this.byId('form-modal')?.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Blood Issue';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Save Issue';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Blood Issue';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: BloodIssueRecord): void {
    const set = (id: string, v: string | number) => {
      const el = this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = String(v);
    };
    set('f-group', r.group);
    set('f-units', r.units);
    set('f-issuedto', r.issuedTo);
    set('f-issuedby', r.issuedBy);
    set('f-date', r.date.split(' ')[0]);
    set('f-crossmatch', r.crossmatch);
  }

  private buildRecord(): Omit<BloodIssueRecord, 'id'> | null {
    const get = (id: string) => (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value || '';
    const issuedTo = get('f-issuedto').trim();
    if (!issuedTo) {
      this.toast('Issued To is required', 'error');
      return null;
    }
    return {
      group: get('f-group'),
      units: parseFloat(get('f-units')) || 0,
      issuedTo,
      issuedBy: get('f-issuedby').trim(),
      date: get('f-date') || this.todayStr,
      crossmatch: get('f-crossmatch'),
    };
  }

  private save(): void {
    const rec = this.buildRecord();
    if (!rec) return;
    const tbody = this.byId('tbody');
    if (this.editingId != null) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      if (idx > -1) {
        this.data[idx] = Object.assign({}, this.data[idx], rec);
        const el = tbody?.querySelector(`[data-row-id="${this.editingId}"]`);
        if (el) el.outerHTML = this.rowHTML(this.data[idx]);
      }
      this.toast('Issue record updated', 'success');
    } else {
      const newRec: BloodIssueRecord = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Issue recorded', 'success');
    }
    this.closeModal();
    this.render();
  }

  private remove(id: number, _name: string): void {
    this.data = this.data.filter((x) => x.id !== id);
    const tbody = this.byId('tbody');
    const el = tbody?.querySelector(`[data-row-id="${id}"]`);
    if (el) el.remove();
    this.render();
    this.toast('Issue record deleted', 'success');
  }
}
