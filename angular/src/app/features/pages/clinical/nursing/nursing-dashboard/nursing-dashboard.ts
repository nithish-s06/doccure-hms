import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface NursingTask {
  id: number;
  task: string;
  patient: string;
  wardBed: string;
  priority: string;
  nurse: string;
  due: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "nursing-dashboard"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section).
 */
@Component({
  imports: [],
  selector: 'app-nursing-dashboard',
  styleUrl: './nursing-dashboard.css',
  templateUrl: './nursing-dashboard.html',
})
export class NursingDashboard implements AfterViewInit {
  private readonly BADGE_P: Record<string, string> = {
    Low: 'text-gray-500 bg-light/60',
    Medium: 'text-primary bg-primary/10',
    High: 'text-warning bg-warning/10',
    Critical: 'text-danger bg-danger/10',
  };
  private readonly BADGE_S: Record<string, string> = {
    Pending: 'text-warning bg-warning/10',
    'In Progress': 'text-primary bg-primary/10',
    Completed: 'text-success bg-success/10',
  };

  private data: NursingTask[] = [
    { id: 1, task: 'Administer IV medication', patient: 'Ravi Kumar', wardBed: 'ICU Bed 4', priority: 'Critical', nurse: 'Fatima Ali', due: '2024-12-06 10:00', status: 'In Progress' },
    { id: 2, task: 'Record vitals', patient: 'Sunita Rao', wardBed: 'Surgery Bed 1', priority: 'Medium', nurse: 'Grace Lim', due: '2024-12-06 11:30', status: 'Pending' },
    { id: 3, task: 'Wound dressing change', patient: 'James Miller', wardBed: 'Ortho Ward 2', priority: 'High', nurse: 'Omar Farid', due: '2024-12-06 09:15', status: 'Completed' },
    { id: 4, task: 'Patient mobility assist', patient: 'Aisha Khan', wardBed: 'Oncology Ward', priority: 'Low', nurse: 'Priya Das', due: '2024-12-06 14:00', status: 'Pending' },
    { id: 5, task: 'Blood transfusion monitoring', patient: 'Carlos Diaz', wardBed: 'ICU Bed 7', priority: 'Critical', nurse: 'Fatima Ali', due: '2024-12-06 08:45', status: 'In Progress' },
    { id: 6, task: 'Medication reconciliation', patient: 'Lena Fischer', wardBed: 'Maternity Ward', priority: 'Medium', nurse: 'Grace Lim', due: '2024-12-05 17:00', status: 'Completed' },
    { id: 7, task: 'Discharge education', patient: 'Tom Baker', wardBed: 'Emergency Bay 2', priority: 'Low', nurse: 'Omar Farid', due: '2024-12-06 13:00', status: 'Pending' },
    { id: 8, task: 'Pain assessment', patient: 'Hana Suzuki', wardBed: 'General Ward 3', priority: 'High', nurse: 'Priya Das', due: '2024-12-06 09:30', status: 'In Progress' },
  ];
  private nextId = 9;
  private editingId: number | null = null;
  private readonly todayStr = this.maxDate(this.data.map((r) => r.due.split(' ')[0]));

  private readonly filters = [{ id: 'filter-priority', field: 'priority' as const }, { id: 'filter-status', field: 'status' as const }];
  private delCallback: (() => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).ndOpenEdit = (id: number) => this.openEdit(id);
    (window as any).ndDelete = (id: number, name: string) => this.deleteTask(id, name);

    const btnAdd = this.byId('btn-add');
    if (btnAdd) btnAdd.addEventListener('click', () => this.openAdd());
    const btnSave = this.byId('btn-save');
    if (btnSave) btnSave.addEventListener('click', () => this.save());
    const closeBtn = this.byId('m-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal('form-modal'));
    const cancelBtn = this.byId('m-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal('form-modal'));
    const search = this.byId('search') as HTMLInputElement | null;
    if (search) search.addEventListener('input', () => this.render());
    this.filters.forEach((f) => {
      const el = this.byId(f.id) as HTMLSelectElement | null;
      if (el) el.addEventListener('change', () => this.render());
    });

    this.initDeleteModal();
    this.closeOnBackdrop('form-modal');
    this.closeOnBackdrop('del-modal');

    this.updateStats();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private maxDate(dates: string[]): string {
    const max = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
    return max.toISOString().slice(0, 10);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private rowHTML(r: NursingTask): string {
    return (
      '<tr data-row-id="' + r.id + '"><td class="font-medium text-gray-900">' + r.task + '</td>' +
      '<td class="text-gray-600 dark:text-gray-300">' + r.patient + '</td>' +
      '<td class="text-gray-500 dark:text-gray-400">' + r.wardBed + '</td>' +
      '<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' + (this.BADGE_P[r.priority] || '') + '">' + r.priority + '</span></td>' +
      '<td class="text-gray-600 dark:text-gray-300">' + r.nurse + '</td>' +
      '<td class="text-gray-500 dark:text-gray-400 text-sm">' + r.due + '</td>' +
      '<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' + (this.BADGE_S[r.status] || '') + '">' + r.status + '</span></td>' +
      '<td><div class="flex gap-1">' +
      '<button onclick="ndOpenEdit(' + r.id + ')" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>' +
      "<button onclick=\"ndDelete(" + r.id + ",'" + r.task.replace(/'/g, '') + "')\" class=\"p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger\" title=\"Delete\"><i class=\"icon-trash-2 text-base\"></i></button>" +
      '</div></td></tr>'
    );
  }

  private render(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const q = search ? search.value.toLowerCase() : '';
    const filterVals = this.filters.map((f) => (this.byId(f.id) as HTMLSelectElement | null)?.value ?? '');
    const searchFields: (keyof NursingTask)[] = ['task', 'patient', 'nurse'];
    const rows = this.data.filter((r) => {
      const m = !q || searchFields.some((f) => String(r[f]).toLowerCase().includes(q));
      return m && this.filters.every((f, i) => !filterVals[i] || (r as any)[f.field] === filterVals[i]);
    });
    const visible = new Set(rows.map((r) => r.id));
    const tbody = this.byId('tbody');
    if (tbody) {
      tbody.querySelectorAll('[data-row-id]').forEach((tr) => {
        tr.classList.toggle('hidden', !visible.has(Number((tr as HTMLElement).dataset['rowId'])));
      });
    }
    const emptyRow = this.byId('tbody-empty');
    if (emptyRow) emptyRow.classList.toggle('hidden', rows.length !== 0);
    const countEl = this.byId('count');
    if (countEl) countEl.textContent = rows.length + ' of ' + this.data.length;
    this.updateStats();
  }

  private updateStats(): void {
    const active = this.byId('stat-active');
    if (active) active.textContent = String(this.data.filter((r) => r.status !== 'Completed').length);
    const critical = this.byId('stat-critical');
    if (critical) critical.textContent = String(this.data.filter((r) => r.priority === 'Critical').length);
    const patients = this.byId('stat-patients');
    if (patients) patients.textContent = String(new Set(this.data.map((r) => r.patient)).size);
    const completed = this.byId('stat-completed');
    if (completed) completed.textContent = String(this.data.filter((r) => r.status === 'Completed' && r.due.slice(0, 10) === this.todayStr).length);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Nursing Task';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Task';
    const form = this.byId('m-form') as HTMLFormElement | null;
    if (form) form.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Task';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private deleteTask(id: number, name: string): void {
    this.confirmDelete(name, () => {
      this.data = this.data.filter((x) => x.id !== id);
      const tbody = this.byId('tbody');
      const el = tbody?.querySelector(`[data-row-id="${id}"]`);
      if (el) el.remove();
      this.render();
      this.toast('Task deleted', 'success');
    });
  }

  private fillForm(r: NursingTask): void {
    (this.byId('f-task') as HTMLInputElement).value = r.task;
    (this.byId('f-patient') as HTMLInputElement).value = r.patient;
    (this.byId('f-wardbed') as HTMLInputElement).value = r.wardBed;
    (this.byId('f-priority') as HTMLSelectElement).value = r.priority;
    (this.byId('f-nurse') as HTMLInputElement).value = r.nurse;
    (this.byId('f-due') as HTMLInputElement).value = r.due.split(' ')[0];
    (this.byId('f-status') as HTMLSelectElement).value = r.status;
  }

  private buildRecord(): Omit<NursingTask, 'id'> | null {
    const task = (this.byId('f-task') as HTMLInputElement).value.trim();
    if (!task) {
      this.toast('Task is required', 'error');
      return null;
    }
    return {
      task,
      patient: (this.byId('f-patient') as HTMLInputElement).value.trim(),
      wardBed: (this.byId('f-wardbed') as HTMLInputElement).value.trim(),
      priority: (this.byId('f-priority') as HTMLSelectElement).value,
      nurse: (this.byId('f-nurse') as HTMLInputElement).value.trim(),
      due: (this.byId('f-due') as HTMLInputElement).value || this.todayStr,
      status: (this.byId('f-status') as HTMLSelectElement).value,
    };
  }

  private save(): void {
    const rec = this.buildRecord();
    if (!rec) return;
    const tbody = this.byId('tbody');
    if (this.editingId) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      this.data[idx] = Object.assign({}, this.data[idx], rec);
      const el = tbody?.querySelector(`[data-row-id="${this.editingId}"]`);
      if (el) el.outerHTML = this.rowHTML(this.data[idx]);
      this.toast('Task updated', 'success');
    } else {
      const newRec: NursingTask = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Task created', 'success');
    }
    this.closeModal('form-modal');
    this.render();
  }

  // ---- shared modal helpers (ported from MC.openModal/closeModal/confirmDelete/initDeleteModal) ----

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
