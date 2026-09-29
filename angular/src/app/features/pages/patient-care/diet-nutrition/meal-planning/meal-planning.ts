import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface MealPlan {
  id: number;
  patient: string;
  wardBed: string;
  diet: string;
  meal: string;
  date: string;
  dietician: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the "meal-planning" CRUD
 * block inside the shared "Blood Bank / Nursing / Diet modules" region
 * (gated on document.body.dataset.page === "meal-planning"), which calls
 * the shared MC.crudList engine. window.MC is never defined in the Angular
 * app, so this reimplements the same search/filter/add/edit/delete plumbing
 * as component methods, wired through ToastService. The form/delete modals
 * use the legacy class="modal-overlay" pattern (class-toggle open/close).
 */
@Component({
  imports: [RouterLink],
  selector: 'app-meal-planning',
  styleUrl: './meal-planning.css',
  templateUrl: './meal-planning.html',
})
export class MealPlanning implements AfterViewInit {
  private readonly BADGE_S: Record<string, string> = {
    Scheduled: 'text-primary bg-primary/10',
    Served: 'text-success bg-success/10',
    Cancelled: 'text-danger bg-danger/10',
  };

  private data: MealPlan[] = [
    { id: 1, patient: 'Ravi Kumar', wardBed: 'ICU Bed 4', diet: 'Liquid', meal: 'Breakfast', date: '2024-12-06', dietician: 'Ananya Rao', status: 'Served' },
    { id: 2, patient: 'Sunita Rao', wardBed: 'Surgery Bed 1', diet: 'Regular', meal: 'Lunch', date: '2024-12-06', dietician: 'Kevin Wu', status: 'Scheduled' },
    { id: 3, patient: 'James Miller', wardBed: 'Ortho Ward 2', diet: 'Cardiac', meal: 'Dinner', date: '2024-12-06', dietician: 'Ananya Rao', status: 'Scheduled' },
    { id: 4, patient: 'Aisha Khan', wardBed: 'Oncology Ward', diet: 'Diabetic', meal: 'Breakfast', date: '2024-12-06', dietician: 'Meera Iyer', status: 'Served' },
    { id: 5, patient: 'Carlos Diaz', wardBed: 'ICU Bed 7', diet: 'Renal', meal: 'Lunch', date: '2024-12-06', dietician: 'Kevin Wu', status: 'Cancelled' },
    { id: 6, patient: 'Lena Fischer', wardBed: 'Maternity Ward', diet: 'Regular', meal: 'Dinner', date: '2024-12-05', dietician: 'Ananya Rao', status: 'Served' },
    { id: 7, patient: 'Tom Baker', wardBed: 'Emergency Bay 2', diet: 'Diabetic', meal: 'Lunch', date: '2024-12-06', dietician: 'Meera Iyer', status: 'Scheduled' },
  ];
  private nextId = 8;
  private editingId: number | null = null;
  private deleteCallback: (() => void) | null = null;
  private readonly todayStr: string;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    const today = new Date(Math.max(...this.data.map((r) => new Date(r.date).getTime())));
    this.todayStr = today.toISOString().slice(0, 10);
  }

  ngAfterViewInit(): void {
    (window as any).mpOpenEdit = (id: number) => this.openEdit(id);
    (window as any).mpDelete = (id: number, name: string) => this.confirmDelete(id, name);

    this.byId('btn-add')?.addEventListener('click', () => this.openAdd());
    this.byId('btn-save')?.addEventListener('click', () => this.save());
    this.byId('m-close')?.addEventListener('click', () => this.closeModal('form-modal'));
    this.byId('m-cancel')?.addEventListener('click', () => this.closeModal('form-modal'));
    this.byId('del-cancel-btn')?.addEventListener('click', () => this.closeModal('del-modal'));
    this.byId('del-confirm-btn')?.addEventListener('click', () => {
      if (this.deleteCallback) this.deleteCallback();
      this.closeModal('del-modal');
    });
    this.closeOnBackdrop('form-modal');
    this.closeOnBackdrop('del-modal');
    this.byId('search')?.addEventListener('input', () => this.render());
    this.byId('filter-diet')?.addEventListener('change', () => this.render());
    this.byId('filter-meal')?.addEventListener('change', () => this.render());

    this.updateStats();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private byIdInput(id: string): HTMLInputElement | HTMLSelectElement | null {
    return this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
  }

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

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    el?.addEventListener('mousedown', (e: Event) => {
      if (e.target === el) this.closeModal(id);
    });
  }

  private rowHTML(r: MealPlan): string {
    return `<tr data-row-id="${r.id}"><td class="font-medium text-gray-900">${r.patient}</td><td class="text-gray-500 dark:text-gray-400">${r.wardBed}</td><td class="text-gray-600 dark:text-gray-300">${r.diet}</td><td class="text-gray-600 dark:text-gray-300">${r.meal}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td class="text-gray-600 dark:text-gray-300">${r.dietician}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_S[r.status] || ''}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="mpOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="mpDelete(${r.id},'${r.patient.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private render(): void {
    const q = (this.byIdInput('search')?.value || '').toLowerCase();
    const dietFilter = this.byIdInput('filter-diet')?.value || '';
    const mealFilter = this.byIdInput('filter-meal')?.value || '';
    const rows = this.data.filter((r) => {
      const m = !q || r.patient.toLowerCase().includes(q) || r.wardBed.toLowerCase().includes(q) || r.dietician.toLowerCase().includes(q);
      return m && (!dietFilter || r.diet === dietFilter) && (!mealFilter || r.meal === mealFilter);
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
    if (total) total.textContent = String(this.data.length);
    const todayEl = this.byId('stat-today');
    if (todayEl) todayEl.textContent = String(this.data.filter((r) => r.date === this.todayStr && r.status !== 'Cancelled').length);
    const diabetic = this.byId('stat-diabetic');
    if (diabetic) diabetic.textContent = String(this.data.filter((r) => r.diet === 'Diabetic').length);
    const dieticians = this.byId('stat-dieticians');
    if (dieticians) dieticians.textContent = String(new Set(this.data.map((r) => r.dietician)).size);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Meal Plan';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Meal Plan';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Meal Plan';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: MealPlan): void {
    (this.byIdInput('f-patient') as HTMLInputElement).value = r.patient;
    (this.byIdInput('f-wardbed') as HTMLInputElement).value = r.wardBed;
    (this.byIdInput('f-diet') as HTMLSelectElement).value = r.diet;
    (this.byIdInput('f-meal') as HTMLSelectElement).value = r.meal;
    (this.byIdInput('f-date') as HTMLInputElement).value = r.date;
    (this.byIdInput('f-dietician') as HTMLInputElement).value = r.dietician;
    (this.byIdInput('f-status') as HTMLSelectElement).value = r.status;
  }

  private buildRecord(): Omit<MealPlan, 'id'> | null {
    const patient = (this.byIdInput('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toastService.show('Patient name required', 'error');
      return null;
    }
    return {
      patient,
      wardBed: (this.byIdInput('f-wardbed') as HTMLInputElement).value.trim(),
      diet: (this.byIdInput('f-diet') as HTMLSelectElement).value,
      meal: (this.byIdInput('f-meal') as HTMLSelectElement).value,
      date: (this.byIdInput('f-date') as HTMLInputElement).value || this.todayStr,
      dietician: (this.byIdInput('f-dietician') as HTMLInputElement).value.trim(),
      status: (this.byIdInput('f-status') as HTMLSelectElement).value,
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
      this.toastService.show('Meal plan updated', 'success');
    } else {
      const newRec: MealPlan = { id: this.nextId++, ...rec };
      this.data.push(newRec);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Meal plan created', 'success');
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
      this.toastService.show('Meal plan deleted', 'success');
    };
    this.openModal('del-modal');
  }
}
