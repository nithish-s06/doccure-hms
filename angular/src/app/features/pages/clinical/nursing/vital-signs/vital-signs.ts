import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface VitalReading {
  id: number;
  patient: string;
  wardBed: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  recordedBy: string;
  date: string;
  flag: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "vital-signs"
 * (MC.crudList block, Blood Bank / Nursing / Diet modules — generated
 * CRUD blocks section). This page's HTML has no add/edit modal, so only
 * search/filter/stats/delete are wired; delete uses a browser confirm().
 */
@Component({
  imports: [],
  selector: 'app-vital-signs',
  styleUrl: './vital-signs.css',
  templateUrl: './vital-signs.html',
})
export class VitalSigns implements AfterViewInit {
  private readonly BADGE_F: Record<string, string> = {
    Normal: 'text-success bg-success/10',
    Abnormal: 'text-danger bg-danger/10',
  };

  private data: VitalReading[] = [
    { id: 1, patient: 'Ravi Kumar', wardBed: 'ICU Bed 4', bp: '150/95', pulse: 102, temp: 99.8, spo2: 94, recordedBy: 'Fatima Ali', date: '2024-12-06 08:10', flag: 'Abnormal' },
    { id: 2, patient: 'Sunita Rao', wardBed: 'Surgery Bed 1', bp: '118/76', pulse: 74, temp: 98.4, spo2: 98, recordedBy: 'Grace Lim', date: '2024-12-06 09:00', flag: 'Normal' },
    { id: 3, patient: 'James Miller', wardBed: 'Ortho Ward 2', bp: '122/80', pulse: 80, temp: 98.6, spo2: 97, recordedBy: 'Omar Farid', date: '2024-12-06 07:45', flag: 'Normal' },
    { id: 4, patient: 'Aisha Khan', wardBed: 'Oncology Ward', bp: '108/68', pulse: 96, temp: 100.4, spo2: 95, recordedBy: 'Priya Das', date: '2024-12-06 10:15', flag: 'Abnormal' },
    { id: 5, patient: 'Carlos Diaz', wardBed: 'ICU Bed 7', bp: '160/100', pulse: 110, temp: 101.2, spo2: 91, recordedBy: 'Fatima Ali', date: '2024-12-06 06:30', flag: 'Abnormal' },
    { id: 6, patient: 'Lena Fischer', wardBed: 'Maternity Ward', bp: '116/74', pulse: 82, temp: 98.2, spo2: 99, recordedBy: 'Grace Lim', date: '2024-12-05 22:00', flag: 'Normal' },
    { id: 7, patient: 'Tom Baker', wardBed: 'Emergency Bay 2', bp: '124/82', pulse: 88, temp: 98.9, spo2: 97, recordedBy: 'Omar Farid', date: '2024-12-06 11:50', flag: 'Normal' },
    { id: 8, patient: 'Hana Suzuki', wardBed: 'General Ward 3', bp: '130/85', pulse: 92, temp: 99.1, spo2: 96, recordedBy: 'Priya Das', date: '2024-12-06 12:40', flag: 'Normal' },
  ];

  private readonly filters = [{ id: 'filter-flag', field: 'flag' as const }];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService,
  ) {}

  ngAfterViewInit(): void {
    (window as any).vsOpenEdit = (id: number) => this.openEdit(id);
    (window as any).vsDelete = (id: number, name: string) => this.deleteReading(id, name);

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
    const searchFields: (keyof VitalReading)[] = ['patient', 'wardBed'];
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
    const normal = this.byId('stat-normal');
    if (normal) normal.textContent = String(this.data.filter((r) => r.flag === 'Normal').length);
    const abnormal = this.byId('stat-abnormal');
    if (abnormal) abnormal.textContent = String(this.data.filter((r) => r.flag === 'Abnormal').length);
    const patients = this.byId('stat-patients');
    if (patients) patients.textContent = String(new Set(this.data.map((r) => r.patient)).size);
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    // No add/edit modal exists in this page's markup; edit is a no-op here.
  }

  private deleteReading(id: number, name: string): void {
    if (!this.document.defaultView?.confirm(`Delete vitals record for ${name}?`)) return;
    this.data = this.data.filter((x) => x.id !== id);
    const tbody = this.byId('tbody');
    const el = tbody?.querySelector(`[data-row-id="${id}"]`);
    if (el) el.remove();
    this.render();
    this.toast('Vitals record deleted', 'success');
  }
}
