import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Assessment {
  id: number;
  patient: string;
  date: string;
  bmi: number;
  nutristatus: string;
  risk: string;
  dietician: string;
  followup: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the "nutrition-assessment"
 * CRUD block inside the shared "Blood Bank / Nursing / Diet modules" region
 * (gated on document.body.dataset.page === "nutrition-assessment"), which
 * calls the shared MC.crudList engine. window.MC is never defined in the
 * Angular app, so this reimplements the same search/filter/add/edit/delete
 * plumbing as component methods, wired through ToastService. The
 * form/delete modals use the legacy class="modal-overlay" pattern
 * (class-toggle open/close).
 */
@Component({
  imports: [RouterLink],
  selector: 'app-nutrition-assessment',
  styleUrl: './nutrition-assessment.css',
  templateUrl: './nutrition-assessment.html',
})
export class NutritionAssessment implements AfterViewInit {
  private readonly BADGE_R: Record<string, string> = {
    Low: 'text-success bg-success/10',
    Moderate: 'text-warning bg-warning/10',
    High: 'text-danger bg-danger/10',
  };

  private data: Assessment[] = [
    { id: 1, patient: 'Ravi Kumar', date: '2024-12-01', bmi: 18.2, nutristatus: 'Undernourished', risk: 'High', dietician: 'Ananya Rao', followup: '2024-12-08' },
    { id: 2, patient: 'Sunita Rao', date: '2024-12-02', bmi: 23.4, nutristatus: 'Well-nourished', risk: 'Low', dietician: 'Kevin Wu', followup: '2024-12-16' },
    { id: 3, patient: 'James Miller', date: '2024-12-03', bmi: 27.8, nutristatus: 'Overweight, monitored', risk: 'Moderate', dietician: 'Ananya Rao', followup: '2024-12-10' },
    { id: 4, patient: 'Aisha Khan', date: '2024-12-04', bmi: 17.5, nutristatus: 'Undernourished due to chemo', risk: 'High', dietician: 'Meera Iyer', followup: '2024-12-07' },
    { id: 5, patient: 'Carlos Diaz', date: '2024-12-05', bmi: 21.9, nutristatus: 'Well-nourished', risk: 'Low', dietician: 'Kevin Wu', followup: '2024-12-19' },
    { id: 6, patient: 'Lena Fischer', date: '2024-12-05', bmi: 24.1, nutristatus: 'Postpartum, adequate intake', risk: 'Low', dietician: 'Ananya Rao', followup: '2024-12-20' },
    { id: 7, patient: 'Tom Baker', date: '2024-12-06', bmi: 26.3, nutristatus: 'Overweight, dietary counseling given', risk: 'Moderate', dietician: 'Meera Iyer', followup: '2024-12-13' },
  ];
  private nextId = 8;
  private editingId: number | null = null;
  private deleteCallback: (() => void) | null = null;
  private readonly today: Date;
  private readonly weekAhead: Date;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.today = new Date(Math.max(...this.data.map((r) => new Date(r.date).getTime())));
    this.weekAhead = new Date(this.today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  ngAfterViewInit(): void {
    (window as any).naOpenEdit = (id: number) => this.openEdit(id);
    (window as any).naDelete = (id: number, name: string) => this.confirmDelete(id, name);

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
    this.byId('filter-risk')?.addEventListener('change', () => this.render());

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

  private rowHTML(r: Assessment): string {
    return `<tr data-row-id="${r.id}"><td class="font-medium text-gray-900">${r.patient}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td class="text-gray-600 dark:text-gray-300">${r.bmi}</td><td class="text-gray-600 dark:text-gray-300">${r.nutristatus}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_R[r.risk] || ''}">${r.risk}</span></td><td class="text-gray-600 dark:text-gray-300">${r.dietician}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.followup}</td><td><div class="flex gap-1"><button onclick="naOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="naDelete(${r.id},'${r.patient.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private render(): void {
    const q = (this.byIdInput('search')?.value || '').toLowerCase();
    const riskFilter = this.byIdInput('filter-risk')?.value || '';
    const rows = this.data.filter((r) => {
      const m = !q || r.patient.toLowerCase().includes(q) || r.dietician.toLowerCase().includes(q);
      return m && (!riskFilter || r.risk === riskFilter);
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
    const high = this.byId('stat-high');
    if (high) high.textContent = String(this.data.filter((r) => r.risk === 'High').length);
    const moderate = this.byId('stat-moderate');
    if (moderate) moderate.textContent = String(this.data.filter((r) => r.risk === 'Moderate').length);
    const followups = this.byId('stat-followups');
    if (followups) followups.textContent = String(this.data.filter((r) => new Date(r.followup) <= this.weekAhead).length);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Assessment';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Assessment';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Assessment';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: Assessment): void {
    (this.byIdInput('f-patient') as HTMLInputElement).value = r.patient;
    (this.byIdInput('f-date') as HTMLInputElement).value = r.date;
    (this.byIdInput('f-bmi') as HTMLInputElement).value = String(r.bmi);
    (this.byIdInput('f-nutristatus') as HTMLInputElement).value = r.nutristatus;
    (this.byIdInput('f-risk') as HTMLSelectElement).value = r.risk;
    (this.byIdInput('f-dietician') as HTMLInputElement).value = r.dietician;
    (this.byIdInput('f-followup') as HTMLInputElement).value = r.followup;
  }

  private buildRecord(): Omit<Assessment, 'id'> | null {
    const patient = (this.byIdInput('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toastService.show('Patient name required', 'error');
      return null;
    }
    return {
      patient,
      date: (this.byIdInput('f-date') as HTMLInputElement).value || this.today.toISOString().slice(0, 10),
      bmi: parseFloat((this.byIdInput('f-bmi') as HTMLInputElement).value) || 0,
      nutristatus: (this.byIdInput('f-nutristatus') as HTMLInputElement).value.trim(),
      risk: (this.byIdInput('f-risk') as HTMLSelectElement).value,
      dietician: (this.byIdInput('f-dietician') as HTMLInputElement).value.trim(),
      followup: (this.byIdInput('f-followup') as HTMLInputElement).value,
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
      this.toastService.show('Assessment updated', 'success');
    } else {
      const newRec: Assessment = { id: this.nextId++, ...rec };
      this.data.push(newRec);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Assessment created', 'success');
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
      this.toastService.show('Assessment deleted', 'success');
    };
    this.openModal('del-modal');
  }
}
