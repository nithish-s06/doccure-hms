import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';

interface BloodRequest {
  id: number;
  patient: string;
  group: string;
  units: number;
  requestedBy: string;
  urgency: string;
  date: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the shared "Blood Bank /
 * Nursing / Diet modules" CRUD block gated on
 * `document.body.dataset.page === "blood-requests"`, which called the
 * generic MC.crudList(cfg) engine (search/filter/add/edit/delete against a
 * table, live stat tiles). Reimplemented here as component methods since
 * there is no global MC object in Angular. The page's markup ships with the
 * seed rows already rendered into #tbody and has no add/edit/delete modal
 * markup, so opening the add/edit modal is a guarded no-op (mirrors the
 * source, which also no-ops via MC.openModal when the target id is
 * missing); delete removes the row from the DOM and re-renders, matching
 * MC.crudList's behavior exactly.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-blood-requests',
  styleUrl: './blood-requests.css',
  templateUrl: './blood-requests.html',
})
export class BloodRequests implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly BADGE_U: Record<string, string> = {
    Routine: 'text-primary bg-primary/10',
    Urgent: 'text-warning bg-warning/10',
    Emergency: 'text-danger bg-danger/10',
  };
  private readonly BADGE_S: Record<string, string> = {
    Pending: 'text-warning bg-warning/10',
    Approved: 'text-primary bg-primary/10',
    Fulfilled: 'text-success bg-success/10',
  };

  private data: BloodRequest[] = [
    { id: 1, patient: 'Ravi Kumar', group: 'O+', units: 2, requestedBy: 'Dr. Mehta — ICU', urgency: 'Emergency', date: '2024-12-06', status: 'Fulfilled' },
    { id: 2, patient: 'Sunita Rao', group: 'A-', units: 1, requestedBy: 'Dr. Chen — Surgery', urgency: 'Urgent', date: '2024-12-05', status: 'Approved' },
    { id: 3, patient: 'James Miller', group: 'B+', units: 3, requestedBy: 'Dr. Alvarez — Ortho', urgency: 'Routine', date: '2024-12-03', status: 'Pending' },
    { id: 4, patient: 'Aisha Khan', group: 'AB+', units: 1, requestedBy: 'Dr. Novak — Oncology', urgency: 'Urgent', date: '2024-12-04', status: 'Approved' },
    { id: 5, patient: 'Carlos Diaz', group: 'O-', units: 4, requestedBy: 'Dr. Mehta — ICU', urgency: 'Emergency', date: '2024-12-07', status: 'Pending' },
    { id: 6, patient: 'Lena Fischer', group: 'B-', units: 2, requestedBy: 'Dr. Osei — Maternity', urgency: 'Urgent', date: '2024-12-02', status: 'Fulfilled' },
    { id: 7, patient: 'Tom Baker', group: 'A+', units: 1, requestedBy: 'Dr. Sharma — Emergency', urgency: 'Routine', date: '2024-11-30', status: 'Fulfilled' },
  ];
  private nextId = 8;
  private editingId: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    (window as any)['brOpenAdd'] = () => this.openAdd();
    (window as any)['brOpenEdit'] = (id: number) => this.openEdit(id);
    (window as any)['brDelete'] = (id: number, name: string) => this.remove(id, name);

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
    const fStatus = this.byId('filter-status');
    if (fStatus) fStatus.addEventListener('change', () => this.render());

    this.render();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private detailUrl(r: BloodRequest): string {
    return `blood-request-detail.html?${new URLSearchParams({
      id: String(r.id), patient: r.patient, group: r.group, units: String(r.units),
      requestedBy: r.requestedBy, urgency: r.urgency, date: r.date, status: r.status,
    }).toString()}`;
  }

  private rowHTML(r: BloodRequest): string {
    return `<tr data-row-id="${r.id}"><td class="text-primary font-mono text-sm"><a href="${this.detailUrl(r)}">#BR-${String(r.id).padStart(5, '0')}</a></td>` +
      `<td class="font-medium text-gray-900">${r.patient}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.group}</td>` +
      `<td class="text-gray-500 dark:text-gray-400">${r.units}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.requestedBy}</td>` +
      `<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_U[r.urgency] || ''}">${r.urgency}</span></td>` +
      `<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_S[r.status] || ''}">${r.status}</span></td>` +
      '<td><div class="flex gap-1">' +
      `<button onclick="brOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>` +
      `<button onclick="brDelete(${r.id},'${r.patient.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button>` +
      '</div></td></tr>';
  }

  private render(): void {
    const searchEl = this.byId('search') as HTMLInputElement | null;
    const q = (searchEl?.value || '').toLowerCase();
    const groupEl = this.byId('filter-group') as HTMLSelectElement | null;
    const statusEl = this.byId('filter-status') as HTMLSelectElement | null;
    const groupVal = groupEl?.value || '';
    const statusVal = statusEl?.value || '';

    const rows = this.data.filter((r) => {
      const m = !q || [r.patient, r.requestedBy].some((f) => String(f).toLowerCase().includes(q));
      return m && (!groupVal || r.group === groupVal) && (!statusVal || r.status === statusVal);
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
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.length);
    const pending = this.byId('stat-pending');
    if (pending) pending.textContent = String(this.data.filter((r) => r.status === 'Pending').length);
    const emergency = this.byId('stat-emergency');
    if (emergency) emergency.textContent = String(this.data.filter((r) => r.urgency === 'Emergency').length);
    const fulfilled = this.byId('stat-fulfilled');
    if (fulfilled) fulfilled.textContent = String(this.data.filter((r) => r.status === 'Fulfilled').length);
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
    if (title) title.textContent = 'New Blood Request';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Submit Request';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Blood Request';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: BloodRequest): void {
    const set = (id: string, v: string | number) => {
      const el = this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = String(v);
    };
    set('f-patient', r.patient);
    set('f-group', r.group);
    set('f-units', r.units);
    set('f-requestedby', r.requestedBy);
    set('f-urgency', r.urgency);
    set('f-date', r.date);
    set('f-status', r.status);
  }

  private buildRecord(): Omit<BloodRequest, 'id'> | null {
    const get = (id: string) => (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value || '';
    const patient = get('f-patient').trim();
    if (!patient) {
      this.toast('Patient name required', 'error');
      return null;
    }
    return {
      patient,
      group: get('f-group'),
      units: parseFloat(get('f-units')) || 0,
      requestedBy: get('f-requestedby').trim(),
      urgency: get('f-urgency'),
      date: get('f-date'),
      status: get('f-status'),
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
      this.toast('Request updated', 'success');
    } else {
      const newRec: BloodRequest = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Request submitted', 'success');
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
    this.toast('Request deleted', 'success');
  }
}
