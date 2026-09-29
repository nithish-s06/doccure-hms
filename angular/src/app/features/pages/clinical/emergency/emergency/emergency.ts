import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;

interface EmergencyCase {
  id: number;
  patient: string;
  agegen: string;
  complaint: string;
  triage: string;
  doctor: string;
  arrival: string;
  status: string;
  notes: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "emergency".
 * A CRUD-list-style page (MC.crudList) for the emergency case register:
 * search/filter, add/edit modal, delete-confirm modal and live stat tiles.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-emergency',
  styleUrl: './emergency.css',
  templateUrl: './emergency.html',
})
export class Emergency implements AfterViewInit {
  private readonly TBADGE: Record<string, string> = {
    'Red (Critical)': 'text-danger bg-danger/10',
    'Orange (Urgent)': 'text-warning bg-warning/10',
    'Yellow (Semi-urgent)': 'text-info bg-info/10',
    'Green (Non-urgent)': 'text-success bg-success/10',
  };

  private readonly SBADGE: Record<string, string> = {
    Waiting: 'text-warning bg-warning/10',
    'In Treatment': 'text-primary bg-primary/10',
    Admitted: 'text-purple bg-purple/10',
    Discharged: 'text-success bg-success/10',
  };

  private data: EmergencyCase[] = [
    { id: 1, patient: 'Carlos Vega', agegen: '52/M', complaint: 'Severe chest pain, sweating', triage: 'Red (Critical)', doctor: 'Dr. Tom Rivas', arrival: '2024-12-10T08:15', status: 'In Treatment', notes: 'Suspected MI' },
    { id: 2, patient: 'Diana Park', agegen: '34/F', complaint: 'Difficulty breathing, high fever', triage: 'Orange (Urgent)', doctor: 'Dr. Sarah Chen', arrival: '2024-12-10T09:00', status: 'In Treatment', notes: '' },
    { id: 3, patient: 'Brian Lee', agegen: '28/M', complaint: 'Deep laceration on forearm', triage: 'Yellow (Semi-urgent)', doctor: 'Dr. Alice Mills', arrival: '2024-12-10T09:30', status: 'Waiting', notes: '' },
    { id: 4, patient: 'Sophie Turner', agegen: '19/F', complaint: 'Allergic reaction, hives', triage: 'Orange (Urgent)', doctor: 'Dr. James Park', arrival: '2024-12-10T10:00', status: 'Admitted', notes: 'Anaphylaxis — epinephrine given' },
    { id: 5, patient: 'Mark Davis', agegen: '67/M', complaint: 'Fall, suspected hip fracture', triage: 'Orange (Urgent)', doctor: 'Dr. Felix Osei', arrival: '2024-12-10T10:45', status: 'Waiting', notes: '' },
    { id: 6, patient: 'Aisha Kofi', agegen: '8/F', complaint: 'High fever, seizure', triage: 'Red (Critical)', doctor: 'Dr. James Park', arrival: '2024-12-10T11:00', status: 'In Treatment', notes: 'Febrile seizure — pediatric emergency' },
    { id: 7, patient: 'Peter Walsh', agegen: '45/M', complaint: 'Minor burn on hand', triage: 'Green (Non-urgent)', doctor: 'Dr. Tom Rivas', arrival: '2024-12-10T11:30', status: 'Discharged', notes: '' },
    { id: 8, patient: 'Hannah Cruz', agegen: '38/F', complaint: 'Abdominal pain', triage: 'Yellow (Semi-urgent)', doctor: 'Dr. Li Wang', arrival: '2024-12-10T12:00', status: 'Waiting', notes: '' },
  ];

  private nextId = 9;
  private editingId: number | null = null;
  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    (window as any)['emergencyOpenAdd'] = () => this.openAdd();
    (window as any)['emergencyOpenEdit'] = (id: number) => this.openEdit(id);
    (window as any)['emergencyDeleteRecord'] = (id: number, name: string) => this.deleteRecord(id, name);

    const addBtn = this.byId('btn-add');
    if (addBtn) addBtn.addEventListener('click', () => this.openAdd());

    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.addEventListener('click', () => this.save());

    const closeBtn = this.byId('m-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal('form-modal'));
    const cancelBtn = this.byId('m-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal('form-modal'));

    const search = this.byId('search');
    if (search) search.addEventListener('input', () => this.render());

    ['filter-triage', 'filter-status'].forEach((id) => {
      const el = this.byId(id);
      if (el) el.addEventListener('change', () => this.render());
    });

    this.initDeleteModal();
    this.closeOnBackdrop('form-modal');
    this.closeOnBackdrop('del-modal');

    this.updateStats();
  }

  /* --- MC.crudList equivalents ---------------------------------------- */

  private render(): void {
    const q = ((this.byId('search') as HTMLInputElement | null)?.value ?? '').toLowerCase();
    const triageVal = (this.byId('filter-triage') as HTMLSelectElement | null)?.value ?? '';
    const statusVal = (this.byId('filter-status') as HTMLSelectElement | null)?.value ?? '';

    const rows = this.data.filter((r) => {
      const m = !q || r.patient.toLowerCase().includes(q) || r.complaint.toLowerCase().includes(q);
      return m && (!triageVal || r.triage === triageVal) && (!statusVal || r.status === statusVal);
    });

    const visible = new Set(rows.map((r) => r.id));
    this.document.querySelectorAll('#tbody [data-row-id]').forEach((tr) => {
      const el = tr as HTMLElement;
      el.classList.toggle('hidden', !visible.has(Number(el.dataset['rowId'])));
    });

    const emptyRow = this.byId('tbody-empty');
    if (emptyRow) emptyRow.classList.toggle('hidden', rows.length !== 0);

    const count = this.byId('count');
    if (count) count.textContent = rows.length + ' of ' + this.data.length;

    this.updateStats();
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Register Emergency Case';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Register';
    const form = this.byId('m-form') as HTMLFormElement | null;
    if (form) form.reset();
    const arrival = this.byId('f-arrival') as HTMLInputElement | null;
    if (arrival) arrival.value = this.now();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Case';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private deleteRecord(id: number, name: string): void {
    this.confirmDelete(name, () => {
      this.data = this.data.filter((x) => x.id !== id);
      const el = this.document.querySelector('#tbody [data-row-id="' + id + '"]');
      if (el) el.remove();
      this.render();
      this.toastService.show('Case closed', 'success');
    });
  }

  private save(): void {
    const rec = this.buildRecord();
    if (!rec) return;
    if (this.editingId != null) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      this.data[idx] = Object.assign({}, this.data[idx], rec);
      const el = this.document.querySelector('#tbody [data-row-id="' + this.editingId + '"]');
      if (el) el.outerHTML = this.rowHTML(this.data[idx]);
      this.toastService.show('Case updated', 'success');
    } else {
      const newRec: EmergencyCase = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Emergency case registered', 'success');
    }
    this.closeModal('form-modal');
    this.render();
  }

  private fillForm(r: EmergencyCase): void {
    (this.byId('f-patient') as HTMLInputElement | null)!.value = r.patient;
    (this.byId('f-agegen') as HTMLInputElement | null)!.value = r.agegen;
    (this.byId('f-complaint') as HTMLInputElement | null)!.value = r.complaint;
    (this.byId('f-triage') as HTMLSelectElement | null)!.value = r.triage;
    (this.byId('f-doctor') as HTMLInputElement | null)!.value = r.doctor;
    (this.byId('f-arrival') as HTMLInputElement | null)!.value = r.arrival;
    (this.byId('f-status') as HTMLSelectElement | null)!.value = r.status;
    (this.byId('f-notes') as HTMLTextAreaElement | null)!.value = r.notes;
  }

  private buildRecord(): Omit<EmergencyCase, 'id'> | null {
    const patient = ((this.byId('f-patient') as HTMLInputElement | null)?.value ?? '').trim();
    const complaint = ((this.byId('f-complaint') as HTMLInputElement | null)?.value ?? '').trim();
    if (!patient) {
      this.toastService.show('Patient name required', 'error');
      return null;
    }
    if (!complaint) {
      this.toastService.show('Complaint required', 'error');
      return null;
    }
    return {
      patient,
      agegen: ((this.byId('f-agegen') as HTMLInputElement | null)?.value ?? '').trim(),
      complaint,
      triage: (this.byId('f-triage') as HTMLSelectElement | null)?.value ?? '',
      doctor: ((this.byId('f-doctor') as HTMLInputElement | null)?.value ?? '').trim(),
      arrival: (this.byId('f-arrival') as HTMLInputElement | null)?.value ?? '',
      status: (this.byId('f-status') as HTMLSelectElement | null)?.value ?? '',
      notes: ((this.byId('f-notes') as HTMLTextAreaElement | null)?.value ?? '').trim(),
    };
  }

  private updateStats(): void {
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.filter((r) => r.status !== 'Discharged').length);
    const critical = this.byId('stat-critical');
    if (critical) {
      critical.textContent = String(
        this.data.filter((r) => r.triage === 'Red (Critical)' && r.status !== 'Discharged').length,
      );
    }
    const urgent = this.byId('stat-urgent');
    if (urgent) {
      urgent.textContent = String(
        this.data.filter((r) => r.triage === 'Orange (Urgent)' && r.status !== 'Discharged').length,
      );
    }
    const stable = this.byId('stat-stable');
    if (stable) {
      stable.textContent = String(
        this.data.filter(
          (r) => ['Green (Non-urgent)', 'Yellow (Semi-urgent)'].includes(r.triage) || r.status === 'Discharged',
        ).length,
      );
    }
  }

  private rowHTML(r: EmergencyCase): string {
    return (
      '<tr data-row-id="' + r.id + '"><td class="text-primary font-mono text-sm"><a href="' + this.detailUrl(r) + '">' +
      this.pad(r.id) + '</a></td><td><p class="font-medium text-gray-900">' + r.patient +
      '</p><p class="text-xs text-gray-400">' + r.agegen + '</p></td><td class="text-gray-600 dark:text-gray-300 max-w-xs">' +
      r.complaint + '</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' +
      (this.TBADGE[r.triage] || 'text-gray-900 bg-light/60') + ' text-xs">' + r.triage +
      '</span></td><td class="text-gray-500 dark:text-gray-400 text-sm">' + r.doctor +
      '</td><td class="text-gray-500 dark:text-gray-400 text-sm">' + r.arrival.replace('T', ' ') +
      '</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' +
      (this.SBADGE[r.status] || 'text-gray-900 bg-light/60') + '">' + r.status +
      '</span></td><td><div class="flex gap-1"><button data-hs-overlay="#form-modal" onclick="emergencyOpenEdit(' + r.id +
      ')" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button data-hs-overlay="#del-modal" onclick="emergencyDeleteRecord(' +
      r.id + ",'" + r.patient + '\')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Close"><i class="icon-trash-2 text-base"></i></button></div></td></tr>'
    );
  }

  private pad(n: number): string {
    return '#ER-' + String(n).padStart(4, '0');
  }

  private detailUrl(r: EmergencyCase): string {
    const params = new URLSearchParams({
      id: String(r.id),
      patient: r.patient,
      complaint: r.complaint,
      triage: r.triage,
      status: r.status,
    });
    return 'emergency-detail.html?' + params.toString();
  }

  private now(): string {
    return new Date().toISOString().slice(0, 16);
  }

  /* --- Shared MC.* modal helpers --------------------------------------- */

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    if (el.classList.contains('hs-overlay') && typeof HSOverlay !== 'undefined') {
      HSOverlay.close(el);
      return;
    }
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
      el.addEventListener('mousedown', (e: Event) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
}
