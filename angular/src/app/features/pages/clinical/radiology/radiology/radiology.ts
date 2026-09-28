import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface RadiologyRecord {
  id: number;
  patient: string;
  ref: string;
  mod: string;
  body: string;
  date: string;
  priority: string;
  status: string;
  radio: string;
  notes: string;
}

@Component({
  imports: [],
  selector: 'app-radiology',
  styleUrl: './radiology.css',
  templateUrl: './radiology.html',
})
export class Radiology implements AfterViewInit {
  private readonly pad = (n: number) => '#RAD-' + String(n).padStart(4, '0');

  private readonly SBADGE: Record<string, string> = {
    Pending: 'text-gray-900 bg-light/60',
    Scheduled: 'text-warning bg-warning/10',
    'In Progress': 'text-purple bg-purple/10',
    Reported: 'text-success bg-success/10',
  };

  private readonly PBADGE: Record<string, string> = {
    Routine: 'text-primary bg-primary/10',
    Urgent: 'text-warning bg-warning/10',
    STAT: 'text-danger bg-danger/10',
  };

  private data: RadiologyRecord[] = [
    { id: 1, patient: 'James Morrison', ref: 'Dr. Sarah Chen', mod: 'X-Ray', body: 'Chest', date: '2024-12-10', priority: 'Routine', status: 'Reported', radio: 'Dr. Patel', notes: 'Possible pneumonia' },
    { id: 2, patient: 'Robert Clark', ref: 'Dr. Alice Mills', mod: 'CT Scan', body: 'Abdomen', date: '2024-12-10', priority: 'Urgent', status: 'Reported', radio: 'Dr. Patel', notes: 'Post-operative' },
    { id: 3, patient: 'Sarah Adams', ref: 'Dr. Raj Kumar', mod: 'MRI', body: 'Brain', date: '2024-12-11', priority: 'Routine', status: 'Scheduled', radio: '', notes: 'Headache investigation' },
    { id: 4, patient: 'David Torres', ref: 'Dr. Felix Osei', mod: 'X-Ray', body: 'Left Knee', date: '2024-12-11', priority: 'Routine', status: 'Reported', radio: 'Dr. Patel', notes: '' },
    { id: 5, patient: 'Helen Yu', ref: 'Dr. Raj Kumar', mod: 'MRI', body: 'Spine', date: '2024-12-12', priority: 'Urgent', status: 'In Progress', radio: 'Dr. Patel', notes: 'Acute stroke' },
    { id: 6, patient: 'Linda Nguyen', ref: 'Dr. Li Wang', mod: 'PET Scan', body: 'Full Body', date: '2024-12-13', priority: 'Routine', status: 'Pending', radio: '', notes: 'Oncology staging' },
    { id: 7, patient: 'Anna Peterson', ref: 'Dr. James Park', mod: 'Ultrasound', body: 'Abdomen', date: '2024-12-10', priority: 'STAT', status: 'Reported', radio: 'Dr. Patel', notes: '' },
    { id: 8, patient: 'Mark Davis', ref: 'Dr. Tom Rivas', mod: 'X-Ray', body: 'Right Hip', date: '2024-12-10', priority: 'Urgent', status: 'Reported', radio: 'Dr. Patel', notes: 'Suspected fracture' },
  ];

  private nextId = 9;
  private editingId: number | null = null;
  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private detailUrl(r: RadiologyRecord): string {
    return (
      'radiology-order-detail.html?id=' + r.id + '&patient=' + encodeURIComponent(r.patient) + '&ref=' + encodeURIComponent(r.ref) +
      '&mod=' + encodeURIComponent(r.mod) + '&body=' + encodeURIComponent(r.body) + '&date=' + encodeURIComponent(r.date) +
      '&priority=' + encodeURIComponent(r.priority) + '&status=' + encodeURIComponent(r.status) + '&radio=' + encodeURIComponent(r.radio || '') +
      '&notes=' + encodeURIComponent(r.notes || '')
    );
  }

  private rowHTML(r: RadiologyRecord): string {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${this.detailUrl(r)}">${this.pad(r.id)}</a></td><td class="font-medium text-gray-900">${r.patient}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-purple bg-purple/10">${r.mod}</span></td><td class="text-gray-600 dark:text-gray-300">${r.body}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.ref}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.PBADGE[r.priority] || 'text-gray-900 bg-light/60'}">${r.priority}</span></td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.SBADGE[r.status] || 'text-gray-900 bg-light/60'}">${r.status}</span></td><td><div class="flex gap-1"><button onclick="openEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button onclick="deleteRecord(${r.id},'${r.patient}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private updateStats(): void {
    const statTotal = this.byId('stat-total');
    if (!statTotal) return;
    statTotal.textContent = String(this.data.length);
    this.byId('stat-pend')!.textContent = String(
      this.data.filter((r) => ['Pending', 'Scheduled'].includes(r.status)).length,
    );
    this.byId('stat-proc')!.textContent = String(
      this.data.filter((r) => r.status === 'In Progress').length,
    );
    this.byId('stat-done')!.textContent = String(
      this.data.filter((r) => r.status === 'Reported').length,
    );
  }

  private render(q = '', mod = '', status = ''): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;
    const matches = this.data.filter((r) => {
      const m = q
        ? r.patient.toLowerCase().includes(q.toLowerCase()) ||
          r.mod.toLowerCase().includes(q.toLowerCase()) ||
          r.body.toLowerCase().includes(q.toLowerCase())
        : true;
      return m && (mod ? r.mod === mod : true) && (status ? r.status === status : true);
    });
    const visible = new Set(matches.map((r) => r.id));
    let anyVisible = false;
    tbody.querySelectorAll('[data-row-id]').forEach((tr) => {
      const el = tr as HTMLElement;
      const isVisible = visible.has(Number(el.dataset['rowId']));
      el.classList.toggle('hidden', !isVisible);
      if (isVisible) anyVisible = true;
    });
    let empty = tbody.querySelector('#no-scans-row');
    if (!anyVisible) {
      if (!empty) {
        tbody.insertAdjacentHTML(
          'beforeend',
          `<tr id="no-scans-row"><td colspan="9" class="text-center py-10 text-gray-400">No scans found</td></tr>`,
        );
      }
    } else if (empty) {
      empty.remove();
    }
    const countEl = this.byId('count');
    if (countEl) countEl.textContent = `${matches.length} of ${this.data.length}`;
    this.updateStats();
  }

  private openAdd(): void {
    this.editingId = null;
    this.byId('m-title')!.textContent = 'New Imaging Request';
    this.byId('btn-save')!.textContent = 'Create Request';
    (this.byId('m-form') as HTMLFormElement).reset();
    (this.byId('f-date') as HTMLInputElement).value = new Date().toISOString().split('T')[0];
    (window as any).HSOverlay && (window as any).HSOverlay.open('#form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id)!;
    this.editingId = id;
    this.byId('m-title')!.textContent = 'Edit Request';
    this.byId('btn-save')!.textContent = 'Update';
    (this.byId('f-patient') as HTMLInputElement).value = r.patient;
    (this.byId('f-ref') as HTMLInputElement).value = r.ref;
    (this.byId('f-mod') as HTMLSelectElement).value = r.mod;
    (this.byId('f-body') as HTMLInputElement).value = r.body;
    (this.byId('f-date') as HTMLInputElement).value = r.date;
    (this.byId('f-priority') as HTMLSelectElement).value = r.priority;
    (this.byId('f-status') as HTMLSelectElement).value = r.status;
    (this.byId('f-radio') as HTMLInputElement).value = r.radio;
    (this.byId('f-notes') as HTMLInputElement).value = r.notes;
    (window as any).HSOverlay && (window as any).HSOverlay.open('#form-modal');
  }

  private saveRecord(): void {
    const patient = (this.byId('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toastService.show('Patient name required', 'error');
      return;
    }
    const rec = {
      patient,
      ref: (this.byId('f-ref') as HTMLInputElement).value.trim(),
      mod: (this.byId('f-mod') as HTMLSelectElement).value,
      body: (this.byId('f-body') as HTMLInputElement).value.trim(),
      date: (this.byId('f-date') as HTMLInputElement).value,
      priority: (this.byId('f-priority') as HTMLSelectElement).value,
      status: (this.byId('f-status') as HTMLSelectElement).value,
      radio: (this.byId('f-radio') as HTMLInputElement).value.trim(),
      notes: (this.byId('f-notes') as HTMLInputElement).value.trim(),
    };
    if (this.editingId) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      this.data[idx] = { ...this.data[idx], ...rec };
      const existingEl = this.byId('tbody')?.querySelector(`[data-row-id="${this.editingId}"]`);
      if (existingEl) existingEl.outerHTML = this.rowHTML(this.data[idx]);
      this.toastService.show('Request updated', 'success');
    } else {
      const newRecord: RadiologyRecord = { id: this.nextId++, ...rec };
      this.data.push(newRecord);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRecord));
      this.toastService.show('Imaging request created', 'success');
    }
    (window as any).HSOverlay && (window as any).HSOverlay.close('#form-modal');
    this.render(
      (this.byId('search') as HTMLInputElement | null)?.value,
      (this.byId('filter-mod') as HTMLSelectElement | null)?.value,
      (this.byId('filter-status') as HTMLSelectElement | null)?.value,
    );
  }

  private deleteRecord(id: number, name: string): void {
    this.byId('del-name')!.textContent = name;
    (window as any).HSOverlay && (window as any).HSOverlay.open('#del-modal');
    (this.byId('del-confirm-btn') as HTMLElement).onclick = () => {
      this.data = this.data.filter((x) => x.id !== id);
      const el = this.byId('tbody')?.querySelector(`[data-row-id="${id}"]`);
      if (el) el.remove();
      this.render(
        (this.byId('search') as HTMLInputElement | null)?.value,
        (this.byId('filter-mod') as HTMLSelectElement | null)?.value,
        (this.byId('filter-status') as HTMLSelectElement | null)?.value,
      );
      this.toastService.show('Request deleted', 'success');
      (window as any).HSOverlay && (window as any).HSOverlay.close('#del-modal');
    };
  }

  ngAfterViewInit(): void {
    // Referenced from inline onclick="..." row-action HTML — must be global.
    (window as any).openEdit = (id: number) => this.openEdit(id);
    (window as any).deleteRecord = (id: number, name: string) => this.deleteRecord(id, name);

    const btnAdd = this.byId('btn-add');
    if (btnAdd) btnAdd.onclick = () => this.openAdd();
    const btnSave = this.byId('btn-save');
    if (btnSave) btnSave.onclick = () => this.saveRecord();
    const searchEl = this.byId('search') as HTMLInputElement | null;
    if (searchEl)
      searchEl.addEventListener('input', (e) =>
        this.render(
          (e.target as HTMLInputElement).value,
          (this.byId('filter-mod') as HTMLSelectElement | null)?.value,
          (this.byId('filter-status') as HTMLSelectElement | null)?.value,
        ),
      );
    const filterMod = this.byId('filter-mod') as HTMLSelectElement | null;
    if (filterMod)
      filterMod.addEventListener('change', (e) =>
        this.render(
          (this.byId('search') as HTMLInputElement | null)?.value,
          (e.target as HTMLSelectElement).value,
          (this.byId('filter-status') as HTMLSelectElement | null)?.value,
        ),
      );
    const filterStatus = this.byId('filter-status') as HTMLSelectElement | null;
    if (filterStatus)
      filterStatus.addEventListener('change', (e) =>
        this.render(
          (this.byId('search') as HTMLInputElement | null)?.value,
          (this.byId('filter-mod') as HTMLSelectElement | null)?.value,
          (e.target as HTMLSelectElement).value,
        ),
      );
    this.updateStats();
  }
}
