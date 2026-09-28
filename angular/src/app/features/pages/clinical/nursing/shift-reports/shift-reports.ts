import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface ShiftReport {
  id: number;
  shift: string;
  ward: string;
  nurse: string;
  count: number;
  notes: string;
  incident: string;
  date: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "shift-reports"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section). This page's HTML has no add/edit modal, so only
 * search/filter/stats/delete are wired; delete uses a browser confirm().
 */
@Component({
  imports: [],
  selector: 'app-shift-reports',
  styleUrl: './shift-reports.css',
  templateUrl: './shift-reports.html',
})
export class ShiftReports implements AfterViewInit {
  private readonly BADGE_SH: Record<string, string> = {
    Morning: 'text-primary bg-primary/10',
    Evening: 'text-warning bg-warning/10',
    Night: 'text-purple bg-purple/10',
  };
  private readonly BADGE_I: Record<string, string> = {
    Yes: 'text-danger bg-danger/10',
    No: 'text-success bg-success/10',
  };

  private data: ShiftReport[] = [
    { id: 1, shift: 'Morning', ward: 'ICU', nurse: 'Fatima Ali', count: 12, notes: 'All patients stable, one fall risk flagged in bed 4.', incident: 'Yes', date: '2024-12-06' },
    { id: 2, shift: 'Evening', ward: 'Surgery Ward', nurse: 'Grace Lim', count: 18, notes: 'Two post-op patients monitored, no complications.', incident: 'No', date: '2024-12-06' },
    { id: 3, shift: 'Night', ward: 'Ortho Ward', nurse: 'Omar Farid', count: 14, notes: 'Quiet shift, all pain managed well.', incident: 'No', date: '2024-12-05' },
    { id: 4, shift: 'Morning', ward: 'Oncology Ward', nurse: 'Priya Das', count: 10, notes: 'One patient reported nausea, managed with medication.', incident: 'No', date: '2024-12-06' },
    { id: 5, shift: 'Night', ward: 'ICU', nurse: 'Fatima Ali', count: 12, notes: 'Code blue drill conducted, no actual incidents.', incident: 'No', date: '2024-12-05' },
    { id: 6, shift: 'Evening', ward: 'Maternity Ward', nurse: 'Grace Lim', count: 9, notes: 'Two deliveries, both mother/baby stable.', incident: 'No', date: '2024-12-05' },
    { id: 7, shift: 'Morning', ward: 'Emergency', nurse: 'Omar Farid', count: 22, notes: 'High patient volume, one altercation with visitor.', incident: 'Yes', date: '2024-12-06' },
  ];
  private readonly todayStr = this.maxDate(this.data.map((r) => r.date));

  private readonly filters = [{ id: 'filter-shift', field: 'shift' as const }];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).srOpenEdit = (id: number) => this.openEdit(id);
    (window as any).srDelete = (id: number, name: string) => this.deleteReport(id, name);

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

  private maxDate(dates: string[]): string {
    const max = new Date(Math.max(...dates.map((d) => new Date(d).getTime())));
    return max.toISOString().slice(0, 10);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private render(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const q = search ? search.value.toLowerCase() : '';
    const filterVals = this.filters.map((f) => (this.byId(f.id) as HTMLSelectElement | null)?.value ?? '');
    const searchFields: (keyof ShiftReport)[] = ['ward', 'nurse'];
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
    if (today) today.textContent = String(this.data.filter((r) => r.date === this.todayStr).length);
    const incidents = this.byId('stat-incidents');
    if (incidents) incidents.textContent = String(this.data.filter((r) => r.incident === 'Yes').length);
    const wards = this.byId('stat-wards');
    if (wards) wards.textContent = String(new Set(this.data.map((r) => r.ward)).size);
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    // No add/edit modal exists in this page's markup; edit is a no-op here.
  }

  private deleteReport(id: number, name: string): void {
    if (!this.document.defaultView?.confirm(`Delete shift report for ${name}?`)) return;
    this.data = this.data.filter((x) => x.id !== id);
    const tbody = this.byId('tbody');
    const el = tbody?.querySelector(`[data-row-id="${id}"]`);
    if (el) el.remove();
    this.render();
    this.toast('Report deleted', 'success');
  }
}
