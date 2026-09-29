import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface DieticianRow {
  id: number;
  name: string;
  specialization: string;
  patients: number;
  contact: string;
  availability: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the "dietician" CRUD block
 * inside the shared "Blood Bank / Nursing / Diet modules" region (gated on
 * document.body.dataset.page === "dietician"), which calls the shared
 * MC.crudList engine. window.MC is never defined in the Angular app, so
 * this reimplements the same search/filter/add/edit/delete plumbing as
 * component methods, wired through ToastService. The form/delete modals
 * here use the legacy class="modal-overlay" pattern (class-toggle open/close).
 */
@Component({
  imports: [RouterLink],
  selector: 'app-dietician',
  styleUrl: './dietician.css',
  templateUrl: './dietician.html',
})
export class Dietician implements AfterViewInit {
  private readonly BADGE_S: Record<string, string> = {
    Available: 'text-success bg-success/10',
    'On Leave': 'text-warning bg-warning/10',
  };

  private data: DieticianRow[] = [
    { id: 1, name: 'Ananya Rao', specialization: 'Clinical Nutrition', patients: 14, contact: 'ananya.rao@dreamshms.com', availability: 'Mon–Fri, Morning', status: 'Available' },
    { id: 2, name: 'Kevin Wu', specialization: 'Renal Diets', patients: 9, contact: 'kevin.wu@dreamshms.com', availability: 'Mon–Sat, Evening', status: 'Available' },
    { id: 3, name: 'Meera Iyer', specialization: 'Oncology Nutrition', patients: 11, contact: 'meera.iyer@dreamshms.com', availability: 'Tue–Sun, Morning', status: 'On Leave' },
    { id: 4, name: 'David Osei', specialization: 'Pediatric Nutrition', patients: 7, contact: 'david.osei@dreamshms.com', availability: 'Mon–Fri, Afternoon', status: 'Available' },
    { id: 5, name: 'Priya Nair', specialization: 'Diabetic Diets', patients: 16, contact: 'priya.nair@dreamshms.com', availability: 'Mon–Fri, Morning', status: 'Available' },
    { id: 6, name: 'Carlos Mendes', specialization: 'Bariatric Nutrition', patients: 5, contact: 'carlos.mendes@dreamshms.com', availability: 'Wed–Sun, Evening', status: 'On Leave' },
  ];
  private nextId = 7;
  private editingId: number | null = null;
  private deleteCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    (window as any).dtOpenEdit = (id: number) => this.openEdit(id);
    (window as any).dtDelete = (id: number, name: string) => this.confirmDelete(id, name);

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
    this.byId('filter-status')?.addEventListener('change', () => this.render());

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

  private rowHTML(r: DieticianRow): string {
    return `<tr data-row-id="${r.id}"><td class="font-medium text-gray-900">${r.name}</td><td class="text-gray-600 dark:text-gray-300">${r.specialization}</td><td class="text-gray-500 dark:text-gray-400">${r.patients}</td><td class="text-gray-600 dark:text-gray-300">${r.contact}</td><td class="text-gray-500 dark:text-gray-400">${r.availability}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_S[r.status] || ''}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="dtOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="dtDelete(${r.id},'${r.name.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private render(): void {
    const q = (this.byIdInput('search')?.value || '').toLowerCase();
    const statusFilter = this.byIdInput('filter-status')?.value || '';
    const rows = this.data.filter((r) => {
      const m = !q || r.name.toLowerCase().includes(q) || r.specialization.toLowerCase().includes(q);
      return m && (!statusFilter || r.status === statusFilter);
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
    const available = this.byId('stat-available');
    if (available) available.textContent = String(this.data.filter((r) => r.status === 'Available').length);
    const onLeave = this.byId('stat-onleave');
    if (onLeave) onLeave.textContent = String(this.data.filter((r) => r.status === 'On Leave').length);
    const patients = this.byId('stat-patients');
    if (patients) patients.textContent = String(this.data.reduce((s, r) => s + r.patients, 0));
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Dietician';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Dietician';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Dietician';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: DieticianRow): void {
    (this.byIdInput('f-name') as HTMLInputElement).value = r.name;
    (this.byIdInput('f-specialization') as HTMLInputElement).value = r.specialization;
    (this.byIdInput('f-patients') as HTMLInputElement).value = String(r.patients);
    (this.byIdInput('f-contact') as HTMLInputElement).value = r.contact;
    (this.byIdInput('f-availability') as HTMLInputElement).value = r.availability;
    (this.byIdInput('f-status') as HTMLSelectElement).value = r.status;
  }

  private buildRecord(): Omit<DieticianRow, 'id'> | null {
    const name = (this.byIdInput('f-name') as HTMLInputElement).value.trim();
    if (!name) {
      this.toastService.show('Name is required', 'error');
      return null;
    }
    return {
      name,
      specialization: (this.byIdInput('f-specialization') as HTMLInputElement).value.trim(),
      patients: parseFloat((this.byIdInput('f-patients') as HTMLInputElement).value) || 0,
      contact: (this.byIdInput('f-contact') as HTMLInputElement).value.trim(),
      availability: (this.byIdInput('f-availability') as HTMLInputElement).value.trim(),
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
      this.toastService.show('Dietician updated', 'success');
    } else {
      const newRec: DieticianRow = { id: this.nextId++, ...rec };
      this.data.push(newRec);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Dietician added', 'success');
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
      this.toastService.show('Dietician removed', 'success');
    };
    this.openModal('del-modal');
  }
}
