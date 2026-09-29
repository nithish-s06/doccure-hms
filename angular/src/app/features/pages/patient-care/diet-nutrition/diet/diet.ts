import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface DietPlan {
  id: number;
  patient: string;
  type: string;
  ward: string;
  dietitian: string;
  cal: number;
  date: string;
  status: string;
  meals: string;
  notes: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "diet" section (uses the
 * shared MC.crudList engine gated on document.body.dataset.page === "diet").
 * window.MC is never defined in the Angular app, so this reimplements the
 * same search/filter/add/edit/delete plumbing as component methods, wired
 * through ToastService instead of MC.toast. The form/delete modals here are
 * Preline-native (class="hs-overlay"), opened/closed via window.HSOverlay.
 */
@Component({
  imports: [],
  selector: 'app-diet',
  styleUrl: './diet.css',
  templateUrl: './diet.html',
})
export class Diet implements AfterViewInit {
  private readonly SBADGE: Record<string, string> = {
    Active: 'text-success bg-success/10',
    'On Hold': 'text-warning bg-warning/10',
    Completed: 'text-gray-900 bg-light/60',
  };
  private readonly TBADGE: Record<string, string> = {
    Diabetic: 'text-warning bg-warning/10',
    Cardiac: 'text-danger bg-danger/10',
    'Weight Loss': 'text-success bg-success/10',
    Renal: 'text-primary bg-primary/10',
    'High Protein': 'text-purple bg-purple/10',
    Liquid: 'text-gray-900 bg-light/60',
    General: 'text-primary bg-primary/10',
  };

  private data: DietPlan[] = [
    { id: 1, patient: 'James Morrison', type: 'Cardiac', ward: 'Cardiology - A101', dietitian: 'Dr. Nadia Ahmed', cal: 1800, date: '2024-12-01', status: 'Active', meals: '3', notes: 'Low sodium, low fat, no fried food' },
    { id: 2, patient: 'Robert Clark', type: 'Liquid', ward: 'ICU - 01', dietitian: 'Dr. Nadia Ahmed', cal: 1200, date: '2024-12-03', status: 'Active', meals: '6', notes: 'Post-op, IV + oral liquids only' },
    { id: 3, patient: 'Emily Johnson', type: 'High Protein', ward: 'Maternity - MW01', dietitian: 'Dr. Pita', cal: 2400, date: '2024-11-29', status: 'Completed', meals: '5', notes: 'Post-delivery recovery' },
    { id: 4, patient: 'David Torres', type: 'General', ward: 'Surgical - SW05', dietitian: 'Dr. Nadia Ahmed', cal: 2000, date: '2024-12-04', status: 'Active', meals: '3', notes: 'Post knee surgery' },
    { id: 5, patient: 'Michael Harris', type: 'Cardiac', ward: 'Geriatrics - G03', dietitian: 'Dr. Pita', cal: 1600, date: '2024-12-01', status: 'Active', meals: '4', notes: 'Low potassium, no salt' },
    { id: 6, patient: 'Linda Nguyen', type: 'Renal', ward: 'Oncology - OW02', dietitian: 'Dr. Nadia Ahmed', cal: 1900, date: '2024-12-05', status: 'Active', meals: '3', notes: 'Chemotherapy dietary support' },
    { id: 7, patient: 'Carlos Vega', type: 'Liquid', ward: 'ICU - 04', dietitian: 'Dr. Pita', cal: 1000, date: '2024-12-10', status: 'Active', meals: '6', notes: 'NPO, progressing to liquids' },
    { id: 8, patient: 'Helen Yu', type: 'Diabetic', ward: 'Neurology - N01', dietitian: 'Dr. Nadia Ahmed', cal: 1700, date: '2024-12-09', status: 'On Hold', meals: '4', notes: 'Stroke patient — awaiting swallow assessment' },
  ];
  private nextId = 9;
  private editingId: number | null = null;
  private deleteCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    (window as any).dietOpenEdit = (id: number) => this.openEdit(id);
    (window as any).dietDeleteRecord = (id: number, name: string) => this.confirmDelete(id, name);

    this.byId('btn-add')?.addEventListener('click', () => this.openAdd());
    this.byId('btn-save')?.addEventListener('click', () => this.save());
    this.byId('search')?.addEventListener('input', () => this.render());
    this.byId('filter-type')?.addEventListener('change', () => this.render());
    this.byId('del-confirm-btn')?.addEventListener('click', () => {
      if (this.deleteCallback) this.deleteCallback();
      this.closeModal('del-modal');
    });

    this.updateStats();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private byIdInput(id: string): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null {
    return this.byId(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  }

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

  private rowHTML(r: DietPlan): string {
    return `<tr data-row-id="${r.id}"><td class="font-medium text-gray-900">${r.patient}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.TBADGE[r.type] || 'text-gray-900 bg-light/60'}">${r.type}</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.ward}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.dietitian}</td><td class="font-semibold text-gray-900">${r.cal} kcal</td><td class="text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">${r.notes || '—'}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.SBADGE[r.status] || 'text-gray-900 bg-light/60'}">${r.status}</span></td><td><div class="flex gap-1"><button data-hs-overlay="#form-modal" onclick="dietOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button data-hs-overlay="#del-modal" onclick="dietDeleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private render(): void {
    const q = (this.byIdInput('search')?.value || '').toLowerCase();
    const typeFilter = this.byIdInput('filter-type')?.value || '';
    const rows = this.data.filter((r) => {
      const m = !q || r.patient.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
      return m && (!typeFilter || r.type === typeFilter);
    });
    const visible = new Set(rows.map((r) => r.id));
    this.byId('tbody')
      ?.querySelectorAll('[data-row-id]')
      .forEach((tr) => {
        tr.classList.toggle('hidden', !visible.has(Number((tr as HTMLElement).dataset['rowId'])));
      });
    const emptyRow = this.byId('tbody-empty');
    if (emptyRow) emptyRow.classList.toggle('hidden', rows.length !== 0);
    const count = this.byId('count');
    if (count) count.textContent = `${rows.length} of ${this.data.length}`;
    this.updateStats();
  }

  private updateStats(): void {
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.filter((r) => r.status === 'Active').length);
    const diabetic = this.byId('stat-diabetic');
    if (diabetic) diabetic.textContent = String(this.data.filter((r) => r.type === 'Diabetic').length);
    const cardiac = this.byId('stat-cardiac');
    if (cardiac) cardiac.textContent = String(this.data.filter((r) => r.type === 'Cardiac').length);
    const other = this.byId('stat-other');
    if (other) other.textContent = String(this.data.filter((r) => !['Diabetic', 'Cardiac'].includes(r.type)).length);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Diet Plan';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Plan';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    const dateInput = this.byIdInput('f-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Diet Plan';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
  }

  private fillForm(r: DietPlan): void {
    (this.byIdInput('f-patient') as HTMLInputElement).value = r.patient;
    (this.byIdInput('f-type') as HTMLSelectElement).value = r.type;
    (this.byIdInput('f-ward') as HTMLInputElement).value = r.ward;
    (this.byIdInput('f-dietitian') as HTMLInputElement).value = r.dietitian;
    (this.byIdInput('f-cal') as HTMLInputElement).value = String(r.cal);
    (this.byIdInput('f-date') as HTMLInputElement).value = r.date;
    (this.byIdInput('f-status') as HTMLSelectElement).value = r.status;
    (this.byIdInput('f-meals') as HTMLSelectElement).value = r.meals;
    (this.byIdInput('f-notes') as HTMLTextAreaElement).value = r.notes;
  }

  private buildRecord(): Omit<DietPlan, 'id'> | null {
    const patient = (this.byIdInput('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toastService.show('Patient name required', 'error');
      return null;
    }
    return {
      patient,
      type: (this.byIdInput('f-type') as HTMLSelectElement).value,
      ward: (this.byIdInput('f-ward') as HTMLInputElement).value.trim(),
      dietitian: (this.byIdInput('f-dietitian') as HTMLInputElement).value.trim(),
      cal: parseInt((this.byIdInput('f-cal') as HTMLInputElement).value, 10) || 1800,
      date: (this.byIdInput('f-date') as HTMLInputElement).value,
      status: (this.byIdInput('f-status') as HTMLSelectElement).value,
      meals: (this.byIdInput('f-meals') as HTMLSelectElement).value,
      notes: (this.byIdInput('f-notes') as HTMLTextAreaElement).value.trim(),
    };
  }

  private save(): void {
    const rec = this.buildRecord();
    if (!rec) return;
    if (this.editingId) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      this.data[idx] = { ...this.data[idx], ...rec };
      const el = this.byId('tbody')?.querySelector(`[data-row-id="${this.editingId}"]`);
      if (el) el.outerHTML = this.rowHTML(this.data[idx]);
      this.toastService.show('Plan updated', 'success');
    } else {
      const newRec: DietPlan = { id: this.nextId++, ...rec };
      this.data.push(newRec);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Diet plan created', 'success');
    }
    this.closeModal('form-modal');
    this.render();
  }

  private confirmDelete(id: number, name: string): void {
    const nameEl = this.byId('del-name');
    if (nameEl) nameEl.textContent = name;
    this.deleteCallback = () => {
      this.data = this.data.filter((x) => x.id !== id);
      const el = this.byId('tbody')?.querySelector(`[data-row-id="${id}"]`);
      if (el) el.remove();
      this.render();
      this.toastService.show('Plan removed', 'success');
    };
    this.openModal('del-modal');
  }
}
