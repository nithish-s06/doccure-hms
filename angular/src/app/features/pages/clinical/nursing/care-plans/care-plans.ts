import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface CarePlan {
  id: number;
  patient: string;
  diagnosis: string;
  goal: string;
  interventions: string;
  nurse: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "care-plans"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section). This page's HTML has no add/edit modal, so only
 * search/filter/stats/delete are wired; delete uses a browser confirm().
 */
@Component({
  imports: [RouterLink],
  selector: 'app-care-plans',
  styleUrl: './care-plans.css',
  templateUrl: './care-plans.html',
})
export class CarePlans implements AfterViewInit {
  private readonly BADGE_S: Record<string, string> = {
    Active: 'text-primary bg-primary/10',
    Completed: 'text-success bg-success/10',
    Discontinued: 'text-danger bg-danger/10',
  };

  private data: CarePlan[] = [
    { id: 1, patient: 'Ravi Kumar', diagnosis: 'Risk of infection', goal: 'Remains infection-free through discharge', interventions: 'Monitor wound, aseptic dressing changes, vitals q4h.', nurse: 'Fatima Ali', status: 'Active' },
    { id: 2, patient: 'Sunita Rao', diagnosis: 'Acute pain post-surgery', goal: 'Pain score below 3/10', interventions: 'Scheduled analgesia, positioning, relaxation techniques.', nurse: 'Grace Lim', status: 'Active' },
    { id: 3, patient: 'James Miller', diagnosis: 'Impaired mobility', goal: 'Ambulate independently with walker', interventions: 'Daily physiotherapy, fall precautions.', nurse: 'Omar Farid', status: 'Completed' },
    { id: 4, patient: 'Aisha Khan', diagnosis: 'Nutritional deficit', goal: 'Maintain adequate caloric intake', interventions: 'Dietician consult, antiemetics before meals.', nurse: 'Priya Das', status: 'Active' },
    { id: 5, patient: 'Carlos Diaz', diagnosis: 'Fluid volume deficit', goal: 'Stable fluid balance within 48h', interventions: 'IV fluids, strict intake/output monitoring.', nurse: 'Fatima Ali', status: 'Active' },
    { id: 6, patient: 'Lena Fischer', diagnosis: 'Postpartum recovery', goal: 'Safe breastfeeding established', interventions: 'Lactation support, perineal care education.', nurse: 'Grace Lim', status: 'Completed' },
    { id: 7, patient: 'Tom Baker', diagnosis: 'Anxiety related to diagnosis', goal: 'Verbalizes reduced anxiety', interventions: 'Therapeutic communication, discharge counseling.', nurse: 'Omar Farid', status: 'Discontinued' },
  ];

  private readonly filters = [{ id: 'filter-status', field: 'status' as const }];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).cpOpenEdit = (id: number) => this.openEdit(id);
    (window as any).cpDelete = (id: number, name: string) => this.deletePlan(id, name);

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
    const searchFields: (keyof CarePlan)[] = ['patient', 'diagnosis', 'nurse'];
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
    const active = this.byId('stat-active');
    if (active) active.textContent = String(this.data.filter((r) => r.status === 'Active').length);
    const completed = this.byId('stat-completed');
    if (completed) completed.textContent = String(this.data.filter((r) => r.status === 'Completed').length);
    const discontinued = this.byId('stat-discontinued');
    if (discontinued) discontinued.textContent = String(this.data.filter((r) => r.status === 'Discontinued').length);
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    // No add/edit modal exists in this page's markup; edit is a no-op here.
  }

  private deletePlan(id: number, name: string): void {
    if (!this.document.defaultView?.confirm(`Delete care plan for ${name}?`)) return;
    this.data = this.data.filter((x) => x.id !== id);
    const tbody = this.byId('tbody');
    const el = tbody?.querySelector(`[data-row-id="${id}"]`);
    if (el) el.remove();
    this.render();
    this.toast('Care plan deleted', 'success');
  }
}
