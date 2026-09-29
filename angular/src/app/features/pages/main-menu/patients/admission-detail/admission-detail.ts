import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

/**
 * Ported from tailwind/src/assets/js/script.js — "ADMISSION-DETAIL".
 * Reads the query params written by admissions.ts's detailUrl() (id, name,
 * dept, doctor, status) and personalizes the static hero/stat/info markup
 * for whichever admission record was clicked.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-admission-detail',
  styleUrl: './admission-detail.css',
  templateUrl: './admission-detail.html',
})
export class AdmissionDetail implements AfterViewInit {
  AllRoutes = All_Routes;

  private readonly BADGE: Record<string, string> = {
    Admitted: 'text-purple bg-purple/10',
    Pending: 'text-warning bg-warning/10',
    Reserved: 'text-primary bg-primary/10',
    Discharged: 'text-gray-700 bg-gray-100',
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    const params = new URLSearchParams(this.document.defaultView?.location.search || '');
    const pick = (key: string, fallback: string) => {
      const v = params.get(key);
      return v && v.length ? v : fallback;
    };

    const r = {
      id: pick('id', '1'),
      name: pick('name', 'James Morrison'),
      dept: pick('dept', 'Cardiology'),
      doctor: pick('doctor', 'Dr. Chen'),
      status: pick('status', 'Admitted'),
    };

    const admId = 'ADM-' + String(r.id).padStart(4, '0');

    this.setText('amd-patient-name', r.name);
    this.setText('amd-hero-status-text', r.status);
    this.setText('amd-hero-id', admId);
    this.setText('amd-hero-dept', r.dept);
    this.setText('amd-hero-doctor', r.doctor);

    this.setText('amd-stat-dept', r.dept);
    this.setText('amd-stat-doctor', r.doctor);
    const statusEl = this.byId('amd-stat-status');
    if (statusEl) {
      statusEl.textContent = r.status;
      statusEl.className = 'mt-3 inline-flex w-fit items-center px-3 py-1.5 rounded-lg text-sm font-extrabold ' + (this.BADGE[r.status] || 'text-gray-700 bg-gray-100');
    }

    this.setText('amd-info-patient', r.name);
    this.setText('amd-info-id', admId);
    this.setText('amd-info-dept', r.dept);
    this.setText('amd-info-doctor', r.doctor);

    this.setText('amd-side-doctor-name', r.doctor);
    this.setText('amd-side-doctor-dept', r.dept);

    this.byId('amd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.byId('amd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private setText(id: string, value: string): void {
    const el = this.byId(id);
    if (el) el.textContent = value;
  }
}
