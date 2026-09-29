import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface BloodCamp {
  id: number;
  name: string;
  location: string;
  date: string;
  organizer: string;
  target: number;
  collected: number;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — the shared "Blood Bank /
 * Nursing / Diet modules" CRUD block gated on
 * `document.body.dataset.page === "blood-camps"`, which called the generic
 * MC.crudList(cfg) engine (search/filter/add/edit/delete against a table,
 * live stat tiles). Reimplemented here as component methods since there is
 * no global MC object in Angular. The page's markup ships with the seed
 * rows already rendered into #tbody and has no add/edit/delete modal
 * markup, so opening the add/edit modal is a guarded no-op (mirrors the
 * source, which also no-ops via MC.openModal when the target id is
 * missing); delete removes the row from the DOM and re-renders, matching
 * MC.crudList's behavior exactly.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-blood-camps',
  styleUrl: './blood-camps.css',
  templateUrl: './blood-camps.html',
})
export class BloodCamps implements AfterViewInit {
  private readonly BADGE_S: Record<string, string> = {
    Upcoming: 'text-primary bg-primary/10',
    Ongoing: 'text-warning bg-warning/10',
    Completed: 'text-success bg-success/10',
  };

  private data: BloodCamp[] = [
    { id: 1, name: 'City Center Donation Drive', location: 'Community Hall, Downtown', date: '2024-12-10', organizer: 'Red Cross Society', target: 100, collected: 0, status: 'Upcoming' },
    { id: 2, name: 'University Campus Camp', location: 'State University Grounds', date: '2024-12-02', organizer: 'Student Health Council', target: 80, collected: 76, status: 'Completed' },
    { id: 3, name: 'Corporate Park Drive', location: 'Tech Park Auditorium', date: '2024-12-06', organizer: 'Dreams HMS Outreach', target: 60, collected: 34, status: 'Ongoing' },
    { id: 4, name: "Faith Center Camp", location: "St. Mary's Hall", date: '2024-11-28', organizer: 'Interfaith Council', target: 50, collected: 48, status: 'Completed' },
    { id: 5, name: 'Rural Health Camp', location: 'Village Panchayat Ground', date: '2024-12-14', organizer: 'Rural Outreach Trust', target: 70, collected: 0, status: 'Upcoming' },
    { id: 6, name: 'Fire Dept. Fundraiser', location: 'Central Fire Station', date: '2024-12-01', organizer: 'City Fire Department', target: 40, collected: 41, status: 'Completed' },
  ];
  private nextId = 7;
  private editingId: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    (window as any)['bcOpenAdd'] = () => this.openAdd();
    (window as any)['bcOpenEdit'] = (id: number) => this.openEdit(id);
    (window as any)['bcDelete'] = (id: number, name: string) => this.remove(id, name);

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

  private rowHTML(r: BloodCamp): string {
    return `<tr data-row-id="${r.id}">` +
      `<td class="font-medium text-gray-900">${r.name}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.location}</td>` +
      `<td class="text-gray-500 dark:text-gray-400 text-sm">${r.date}</td>` +
      `<td class="text-gray-600 dark:text-gray-300">${r.organizer}</td>` +
      `<td class="text-gray-500 dark:text-gray-400">${r.target}</td>` +
      `<td class="font-semibold text-gray-900">${r.collected}</td>` +
      `<td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${this.BADGE_S[r.status] || ''}">${r.status}</span></td>` +
      '<td><div class="flex gap-1">' +
      `<button onclick="bcOpenEdit(${r.id})" class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button>` +
      `<button onclick="bcDelete(${r.id},'${r.name.replace(/'/g, '')}')" class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button>` +
      '</div></td></tr>';
  }

  private render(): void {
    const searchEl = this.byId('search') as HTMLInputElement | null;
    const q = (searchEl?.value || '').toLowerCase();
    const statusEl = this.byId('filter-status') as HTMLSelectElement | null;
    const statusVal = statusEl?.value || '';

    const rows = this.data.filter((r) => {
      const m = !q || [r.name, r.location, r.organizer].some((f) => String(f).toLowerCase().includes(q));
      return m && (!statusVal || r.status === statusVal);
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
    const upcoming = this.byId('stat-upcoming');
    if (upcoming) upcoming.textContent = String(this.data.filter((r) => r.status === 'Upcoming').length);
    const units = this.byId('stat-units');
    if (units) units.textContent = String(this.data.reduce((s, r) => s + r.collected, 0));
    const ongoing = this.byId('stat-ongoing');
    if (ongoing) ongoing.textContent = String(this.data.filter((r) => r.status === 'Ongoing').length);
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
    if (title) title.textContent = 'New Blood Camp';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Save Camp';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
    this.openModal('form-modal');
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Blood Camp';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Update';
    this.fillForm(r);
    this.openModal('form-modal');
  }

  private fillForm(r: BloodCamp): void {
    const set = (id: string, v: string | number) => {
      const el = this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
      if (el) el.value = String(v);
    };
    set('f-name', r.name);
    set('f-location', r.location);
    set('f-date', r.date);
    set('f-organizer', r.organizer);
    set('f-target', r.target);
    set('f-collected', r.collected);
    set('f-status', r.status);
  }

  private buildRecord(): Omit<BloodCamp, 'id'> | null {
    const get = (id: string) => (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value || '';
    const name = get('f-name').trim();
    if (!name) {
      this.toast('Camp name is required', 'error');
      return null;
    }
    return {
      name,
      location: get('f-location').trim(),
      date: get('f-date'),
      organizer: get('f-organizer').trim(),
      target: parseFloat(get('f-target')) || 0,
      collected: parseFloat(get('f-collected')) || 0,
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
      this.toast('Camp updated', 'success');
    } else {
      const newRec: BloodCamp = Object.assign({ id: this.nextId++ }, rec);
      this.data.push(newRec);
      tbody?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Camp added', 'success');
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
    this.toast('Camp removed', 'success');
  }
}
