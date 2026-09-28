import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js — "BED-OCCUPANCY".
 * Hero, KPIs, discharge projection, length-of-stay and the ward-performance
 * table all ship as static HTML — this only wires interaction:
 *   - #range toggles which pre-rendered trend/heatmap variant (7/14/30-day)
 *     is visible — no chart is drawn or regenerated.
 *   - #ward-sort reorders the existing static <tr> rows via their
 *     data-occ/data-los/data-turnover attributes.
 *   - #btn-export / #btn-print confirm via toast / trigger print.
 */
@Component({
  imports: [],
  selector: 'app-bed-occupancy',
  styleUrl: './bed-occupancy.css',
  templateUrl: './bed-occupancy.html',
})
export class BedOccupancy implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.applyRange();
    this.byId('range')?.addEventListener('change', () => this.applyRange());
    this.wireWardSort();

    this.byId('btn-export')?.addEventListener('click', () => {
      const wards = this.document.querySelectorAll('#ward-body tr').length;
      const range = (this.byId('range') as HTMLSelectElement | null)?.value || '14';
      this.toastService.show(`Occupancy report exported — ${wards} wards, ${range} days.`, 'success');
    });
    this.byId('btn-print')?.addEventListener('click', () => {
      this.toastService.show('Occupancy report sent to the printer.', 'info');
      window.print();
    });
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private applyRange(): void {
    const rangeEl = this.byId('range') as HTMLSelectElement | null;
    const val = rangeEl?.value || '14';
    this.document.querySelectorAll<HTMLElement>('[data-trend-range]').forEach((el) => {
      el.hidden = el.dataset['trendRange'] !== val;
    });
    const heatVal = val === '7' ? '7' : '14';
    this.document.querySelectorAll<HTMLElement>('[data-heat-range]').forEach((el) => {
      el.hidden = el.dataset['heatRange'] !== heatVal;
    });
    const heroRange = this.byId('hero-range');
    if (heroRange) heroRange.textContent = `Last ${val} days`;
  }

  private wireWardSort(): void {
    const sortEl = this.byId('ward-sort') as HTMLSelectElement | null;
    const body = this.byId('ward-body');
    if (!sortEl || !body) return;

    const apply = () => {
      const rows = Array.from(body.querySelectorAll<HTMLElement>('tr'));
      const sorted = rows.slice().sort((a, b) => this.compareWards(a, b, sortEl.value));
      sorted.forEach((row) => body.appendChild(row));
    };

    sortEl.addEventListener('change', apply);
  }

  private compareWards(a: HTMLElement, b: HTMLElement, sort: string): number {
    switch (sort) {
      case 'los':
        return +(b.dataset['los'] || 0) - +(a.dataset['los'] || 0);
      case 'turnover':
        return +(b.dataset['turnover'] || 0) - +(a.dataset['turnover'] || 0);
      default:
        return +(b.dataset['occ'] || 0) - +(a.dataset['occ'] || 0);
    }
  }
}
