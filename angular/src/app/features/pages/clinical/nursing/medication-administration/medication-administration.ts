import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface MarEntry {
  id: number;
  patient: string;
  medication: string;
  dose: string;
  route: string;
  scheduled: string;
  administered: string;
  by: string;
  date: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "medication-administration"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section). This page's HTML has no add/edit modal, so only
 * search/filter/stats/delete are wired; delete uses a browser confirm().
 */
@Component({
  imports: [RouterLink],
  selector: 'app-medication-administration',
  styleUrl: './medication-administration.css',
  templateUrl: './medication-administration.html',
})
export class MedicationAdministration implements AfterViewInit {
  private readonly BADGE_S: Record<string, string> = {
    Given: 'text-success bg-success/10',
    Missed: 'text-danger bg-danger/10',
    Refused: 'text-warning bg-warning/10',
  };

  private data: MarEntry[] = [
    { id: 1, patient: 'Ravi Kumar', medication: 'Amoxicillin', dose: '500mg', route: 'Oral', scheduled: '08:00 AM', administered: '08:05 AM', by: 'Fatima Ali', date: '2024-12-06', status: 'Given' },
    { id: 2, patient: 'Sunita Rao', medication: 'Morphine', dose: '2mg', route: 'IV', scheduled: '09:00 AM', administered: '09:02 AM', by: 'Grace Lim', date: '2024-12-06', status: 'Given' },
    { id: 3, patient: 'James Miller', medication: 'Ibuprofen', dose: '400mg', route: 'Oral', scheduled: '12:00 PM', administered: '—', by: 'Omar Farid', date: '2024-12-06', status: 'Missed' },
    { id: 4, patient: 'Aisha Khan', medication: 'Ondansetron', dose: '4mg', route: 'IV', scheduled: '10:30 AM', administered: '10:31 AM', by: 'Priya Das', date: '2024-12-06', status: 'Given' },
    { id: 5, patient: 'Carlos Diaz', medication: 'Insulin Regular', dose: '6 units', route: 'Subcutaneous', scheduled: '07:00 AM', administered: '—', by: 'Fatima Ali', date: '2024-12-06', status: 'Refused' },
    { id: 6, patient: 'Lena Fischer', medication: 'Paracetamol', dose: '650mg', route: 'Oral', scheduled: '06:00 PM', administered: '06:05 PM', by: 'Grace Lim', date: '2024-12-05', status: 'Given' },
    { id: 7, patient: 'Tom Baker', medication: 'Cetirizine', dose: '10mg', route: 'Oral', scheduled: '09:00 PM', administered: '09:10 PM', by: 'Omar Farid', date: '2024-12-05', status: 'Given' },
    { id: 8, patient: 'Hana Suzuki', medication: 'Silver Sulfadiazine', dose: 'Apply thin layer', route: 'Topical', scheduled: '02:00 PM', administered: '—', by: 'Priya Das', date: '2024-12-06', status: 'Missed' },
  ];

  private readonly filters = [{ id: 'filter-status', field: 'status' as const }];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).maOpenEdit = (id: number) => this.openEdit(id);
    (window as any).maDelete = (id: number, name: string) => this.deleteEntry(id, name);

    const search = this.byId('search') as HTMLInputElement | null;
    if (search) search.addEventListener('input', () => this.render());
    this.filters.forEach((f) => {
      const el = this.byId(f.id) as HTMLSelectElement | null;
      if (el) el.addEventListener('change', () => this.render());
    });

    this.updateStats();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private render(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const q = search ? search.value.toLowerCase() : '';
    const filterVals = this.filters.map((f) => (this.byId(f.id) as HTMLSelectElement | null)?.value ?? '');
    const searchFields: (keyof MarEntry)[] = ['patient', 'medication'];
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
    const given = this.byId('stat-given');
    if (given) given.textContent = String(this.data.filter((r) => r.status === 'Given').length);
    const missed = this.byId('stat-missed');
    if (missed) missed.textContent = String(this.data.filter((r) => r.status === 'Missed').length);
    const refused = this.byId('stat-refused');
    if (refused) refused.textContent = String(this.data.filter((r) => r.status === 'Refused').length);
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    // No add/edit modal exists in this page's markup; edit is a no-op here.
  }

  private deleteEntry(id: number, name: string): void {
    if (!this.document.defaultView?.confirm(`Delete MAR entry for ${name}?`)) return;
    this.data = this.data.filter((x) => x.id !== id);
    const tbody = this.byId('tbody');
    const el = tbody?.querySelector(`[data-row-id="${id}"]`);
    if (el) el.remove();
    this.render();
    this.toast('Entry deleted', 'success');
  }
}
