import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  patient: string;
  contact: string;
  emergency: string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-patient-family-members',
  styleUrl: './patient-family-members.css',
  templateUrl: './patient-family-members.html',
})
export class PatientFamilyMembers implements AfterViewInit {
  private data: FamilyMember[] = [
    { id: 1, name: 'Rachel Morrison', relation: 'Spouse', patient: 'James Morrison', contact: '+1 555-201-4432', emergency: 'Yes' },
    { id: 2, name: 'Tommy Clark', relation: 'Child', patient: 'Robert Clark', contact: '+1 555-330-2210', emergency: 'No' },
    { id: 3, name: 'Susan Johnson', relation: 'Parent', patient: 'Emily Johnson', contact: '+1 555-118-9987', emergency: 'Yes' },
    { id: 4, name: 'Carlos Torres', relation: 'Sibling', patient: 'David Torres', contact: '+1 555-773-4501', emergency: 'No' },
    { id: 5, name: 'Minh Nguyen', relation: 'Spouse', patient: 'Linda Nguyen', contact: '+1 555-902-1187', emergency: 'Yes' },
    { id: 6, name: 'Ella Harris', relation: 'Child', patient: 'Michael Harris', contact: '+1 555-664-3320', emergency: 'No' },
    { id: 7, name: 'George Adams', relation: 'Parent', patient: 'Sarah Adams', contact: '+1 555-441-6650', emergency: 'Yes' },
    { id: 8, name: 'Kevin Peterson', relation: 'Guardian', patient: 'Anna Peterson', contact: '+1 555-287-9043', emergency: 'Yes' },
  ];
  private nextId = 9;
  private editingId: number | null = null;
  private readonly filters = [
    { id: 'filter-relation', field: 'relation' as const },
    { id: 'filter-emergency', field: 'emergency' as const },
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).fmOpenEdit = (id: number) => this.openEdit(id);
    (window as any).fmDelete = (id: number, name: string) => this.deleteMember(id, name);

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

  private escapeHtml(str: string): string {
    const div = this.document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  private rowHTML(r: FamilyMember): string {
    return (
      '<tr data-row-id="' + r.id + '"><td class="font-medium text-gray-900">' + this.escapeHtml(r.name) + '</td>' +
      '<td class="text-gray-600 dark:text-gray-300">' + this.escapeHtml(r.relation) + '</td>' +
      '<td class="text-gray-600 dark:text-gray-300">' + this.escapeHtml(r.patient) + '</td>' +
      '<td class="text-gray-500 dark:text-gray-400 text-sm">' + this.escapeHtml(r.contact) + '</td>' +
      '<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ' +
      (r.emergency === 'Yes' ? 'text-success bg-success/10' : 'text-gray-900 bg-light/60') +
      '">' + r.emergency + '</span></td>' +
      '<td><div class="flex gap-1">' +
      '<button onclick="fmOpenEdit(' + r.id + ')" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>' +
      "<button onclick=\"fmDelete(" + r.id + ",'" + r.name.replace(/'/g, '') + "')\" class=\"p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger\" title=\"Delete\"><i class=\"icon-trash-2 text-base\"></i></button>" +
      '</div></td></tr>'
    );
  }

  private render(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const q = search ? search.value.toLowerCase() : '';
    const filterVals = this.filters.map((f) => (this.byId(f.id) as HTMLSelectElement | null)?.value ?? '');
    const searchFields: (keyof FamilyMember)[] = ['name', 'patient'];
    const rows = this.data.filter((r) => {
      const m = !q || searchFields.some((f) => String(r[f]).toLowerCase().includes(q));
      return (
        m &&
        this.filters.every((f, i) => !filterVals[i] || (r as any)[f.field] === filterVals[i])
      );
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
    const emergency = this.byId('stat-emergency');
    if (emergency) emergency.textContent = String(this.data.filter((r) => r.emergency === 'Yes').length);
    const spouse = this.byId('stat-spouse');
    if (spouse) spouse.textContent = String(this.data.filter((r) => r.relation === 'Spouse').length);
    const children = this.byId('stat-children');
    if (children) children.textContent = String(this.data.filter((r) => r.relation === 'Child').length);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Add Family Member';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Save Member';
    const form = this.byId('m-form') as HTMLFormElement | null;
    if (form) form.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Family Member';
    const saveBtn = this.byId('btn-save');
    if (saveBtn) saveBtn.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private deleteMember(id: number, name: string): void {
    this.confirmDelete(name, () => {
      this.data = this.data.filter((x) => x.id !== id);
      const tbody = this.byId('tbody');
      const el = tbody?.querySelector(`[data-row-id="${id}"]`);
      if (el) el.remove();
      this.render();
      this.toastService.show('Family member deleted', 'success');
    });
  }

  private fillForm(r: FamilyMember): void {
    (this.byId('f-name') as HTMLInputElement).value = r.name;
    (this.byId('f-relation') as HTMLSelectElement).value = r.relation;
    (this.byId('f-patient') as HTMLInputElement).value = r.patient;
    (this.byId('f-contact') as HTMLInputElement).value = r.contact;
    (this.byId('f-emergency') as HTMLSelectElement).value = r.emergency;
  }

  private buildRecord(): Omit<FamilyMember, 'id'> | null {
    const name = (this.byId('f-name') as HTMLInputElement).value.trim();
    const patient = (this.byId('f-patient') as HTMLInputElement).value.trim();
    if (!name) {
      this.toastService.show('Family member name required', 'error');
      return null;
    }
    if (!patient) {
      this.toastService.show('Related patient is required', 'error');
      return null;
    }
    return {
      name,
      relation: (this.byId('f-relation') as HTMLSelectElement).value,
      patient,
      contact: (this.byId('f-contact') as HTMLInputElement).value.trim(),
      emergency: (this.byId('f-emergency') as HTMLSelectElement).value,
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
      this.toastService.show('Family member updated', 'success');
    } else {
      const newRec: FamilyMember = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toastService.show('Family member added', 'success');
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

  private delCallback: (() => void) | null = null;

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
