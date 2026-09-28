import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface NursingNote {
  id: number;
  patient: string;
  wardBed: string;
  summary: string;
  recordedBy: string;
  date: string;
  shift: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "nursing-notes"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section).
 */
@Component({
  imports: [],
  selector: 'app-nursing-notes',
  styleUrl: './nursing-notes.css',
  templateUrl: './nursing-notes.html',
})
export class NursingNotes implements AfterViewInit {
  private readonly BADGE_SH: Record<string, string> = {
    Morning: 'text-primary bg-primary/10',
    Evening: 'text-warning bg-warning/10',
    Night: 'text-purple bg-purple/10',
  };

  private data: NursingNote[] = [
    { id: 1, patient: 'Ravi Kumar', wardBed: 'ICU Bed 4', summary: 'Patient resting, vitals stable, IV line patent.', recordedBy: 'Fatima Ali', date: '2024-12-06 08:00', shift: 'Morning' },
    { id: 2, patient: 'Sunita Rao', wardBed: 'Surgery Bed 1', summary: 'Post-op pain managed, dressing dry and intact.', recordedBy: 'Grace Lim', date: '2024-12-06 14:30', shift: 'Evening' },
    { id: 3, patient: 'James Miller', wardBed: 'Ortho Ward 2', summary: 'Mobility improving, physiotherapy tolerated well.', recordedBy: 'Omar Farid', date: '2024-12-05 21:15', shift: 'Night' },
    { id: 4, patient: 'Aisha Khan', wardBed: 'Oncology Ward', summary: 'Mild nausea after chemo, antiemetic administered.', recordedBy: 'Priya Das', date: '2024-12-06 09:45', shift: 'Morning' },
    { id: 5, patient: 'Carlos Diaz', wardBed: 'ICU Bed 7', summary: 'Transfusion completed without reaction.', recordedBy: 'Fatima Ali', date: '2024-12-06 22:10', shift: 'Night' },
    { id: 6, patient: 'Lena Fischer', wardBed: 'Maternity Ward', summary: 'Newborn feeding well, mother ambulating.', recordedBy: 'Grace Lim', date: '2024-12-05 16:00', shift: 'Evening' },
    { id: 7, patient: 'Tom Baker', wardBed: 'Emergency Bay 2', summary: 'Discharge instructions reviewed with patient.', recordedBy: 'Omar Farid', date: '2024-12-06 12:20', shift: 'Morning' },
  ];
  private nextId = 8;
  private editingId: number | null = null;
  private readonly todayStr = this.maxDate(this.data.map((r) => r.date.split(' ')[0]));

  private readonly filters = [{ id: 'filter-shift', field: 'shift' as const }];
  private delCallback: (() => void) | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).nnOpenEdit = (id: number) => this.openEdit(id);
    (window as any).nnDelete = (id: number, name: string) => this.deleteNote(id, name);

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

  private rowHTML(r: NursingNote): string {
    return (
      '<tr data-row-id="' + r.id + '"><td class="font-medium text-gray-900">' + r.patient + '</td>' +
      '<td class="text-gray-500 dark:text-gray-400">' + r.wardBed + '</td>' +
      '<td class="text-gray-600 dark:text-gray-300 max-w-xs truncate">' + r.summary + '</td>' +
      '<td class="text-gray-600 dark:text-gray-300">' + r.recordedBy + '</td>' +
      '<td class="text-gray-500 dark:text-gray-400 text-sm">' + r.date + '</td>' +
      '<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' + (this.BADGE_SH[r.shift] || '') + '">' + r.shift + '</span></td>' +
      '<td><div class="flex gap-1">' +
      '<button onclick="nnOpenEdit(' + r.id + ')" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>' +
      "<button onclick=\"nnDelete(" + r.id + ",'" + r.patient.replace(/'/g, '') + "')\" class=\"p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger\" title=\"Delete\"><i class=\"icon-trash-2 text-base\"></i></button>" +
      '</div></td></tr>'
    );
  }

  private render(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const q = search ? search.value.toLowerCase() : '';
    const filterVals = this.filters.map((f) => (this.byId(f.id) as HTMLSelectElement | null)?.value ?? '');
    const searchFields: (keyof NursingNote)[] = ['patient', 'recordedBy', 'wardBed'];
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
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.length);
    const today = this.byId('stat-today');
    if (today) today.textContent = String(this.data.filter((r) => r.date.slice(0, 10) === this.todayStr).length);
    const night = this.byId('stat-night');
    if (night) night.textContent = String(this.data.filter((r) => r.shift === 'Night').length);
    const patients = this.byId('stat-patients');
    if (patients) patients.textContent = String(new Set(this.data.map((r) => r.patient)).size);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'New Nursing Note';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Note';
    const form = this.byId('m-form') as HTMLFormElement | null;
    if (form) form.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Note';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private deleteNote(id: number, name: string): void {
    this.confirmDelete(name, () => {
      this.data = this.data.filter((x) => x.id !== id);
      const tbody = this.byId('tbody');
      const el = tbody?.querySelector(`[data-row-id="${id}"]`);
      if (el) el.remove();
      this.render();
      this.toast('Note deleted', 'success');
    });
  }

  private fillForm(r: NursingNote): void {
    (this.byId('f-patient') as HTMLInputElement).value = r.patient;
    (this.byId('f-wardbed') as HTMLInputElement).value = r.wardBed;
    (this.byId('f-summary') as HTMLTextAreaElement).value = r.summary;
    (this.byId('f-recordedby') as HTMLInputElement).value = r.recordedBy;
    (this.byId('f-date') as HTMLInputElement).value = r.date.split(' ')[0];
    (this.byId('f-shift') as HTMLSelectElement).value = r.shift;
  }

  private buildRecord(): Omit<NursingNote, 'id'> | null {
    const patient = (this.byId('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toast('Patient name required', 'error');
      return null;
    }
    return {
      patient,
      wardBed: (this.byId('f-wardbed') as HTMLInputElement).value.trim(),
      summary: (this.byId('f-summary') as HTMLTextAreaElement).value.trim(),
      recordedBy: (this.byId('f-recordedby') as HTMLInputElement).value.trim(),
      date: (this.byId('f-date') as HTMLInputElement).value || this.todayStr,
      shift: (this.byId('f-shift') as HTMLSelectElement).value,
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
      this.toast('Note updated', 'success');
    } else {
      const newRec: NursingNote = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Note added', 'success');
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
