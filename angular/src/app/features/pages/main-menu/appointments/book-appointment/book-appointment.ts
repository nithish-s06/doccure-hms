import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  blood: string;
}

interface Slot {
  label: string;
  taken: boolean;
}

interface StatCfg {
  id: string;
  icon: string;
  label: string;
  tone: string;
  delta: number | null;
  meta?: string;
  spark: number[];
}

interface BookDetails {
  name: string;
  dept: string;
  doctor: string;
  consult: string;
  date: string;
  slot: string;
  visit: string;
  priority: string;
  fee: string;
  payment: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "BOOK-APPOINTMENT" (book-appointment.html).
 * Reimplements MC.apptStats/MC.toast locally since there is no global MC object
 * in Angular. Opening the confirm modal is gated behind validate(), so it is
 * triggered programmatically via window.HSOverlay; the modal's own
 * Cancel/Confirm buttons stay fully declarative (data-hs-overlay in the markup).
 */
@Component({
  imports: [],
  selector: 'app-book-appointment',
  styleUrl: './book-appointment.css',
  templateUrl: './book-appointment.html',
})
export class BookAppointment implements AfterViewInit {
  private readonly DOCTORS: Record<string, string[]> = {
    Cardiology: ['Dr. Sarah Chen', 'Dr. Isabelle Duncan'],
    Neurology: ['Dr. Michael Reyes', 'Dr. Camille Rousseau'],
    Orthopedics: ['Dr. Emily Carter', 'Dr. Theodore Nakamura'],
    Pediatrics: ['Dr. David Okonkwo', 'Dr. Hannah Whitmore'],
    Oncology: ['Dr. Laura Bennett', 'Dr. Victor Ramirez'],
    Emergency: ['Dr. Gregory Hollis', 'Dr. Omar Haddad'],
  };

  private readonly PATIENTS: Patient[] = [
    { id: 'PT-2026-0184', name: 'James Morrison', phone: '(212) 555-0147', email: 'j.morrison@mail.com', age: 54, gender: 'Male', blood: 'A+' },
    { id: 'PT-2026-0185', name: 'Linda Whitfield', phone: '(212) 555-0182', email: 'l.whitfield@mail.com', age: 43, gender: 'Female', blood: 'O-' },
    { id: 'PT-2026-0186', name: 'Robert Castillo', phone: '(646) 555-0113', email: 'r.castillo@mail.com', age: 61, gender: 'Male', blood: 'B+' },
    { id: 'PT-2026-0187', name: 'Angela Brooks', phone: '(718) 555-0164', email: 'a.brooks@mail.com', age: 9, gender: 'Female', blood: 'AB+' },
    { id: 'PT-2026-0188', name: 'Marcus Delgado', phone: '(347) 555-0198', email: 'm.delgado@mail.com', age: 47, gender: 'Male', blood: 'O+' },
    { id: 'PT-2026-0189', name: 'Priya Raghavan', phone: '(212) 555-0121', email: 'p.raghavan@mail.com', age: 35, gender: 'Female', blood: 'A-' },
  ];

  private readonly SLOTS: Slot[] = [
    { label: '09:00 AM', taken: false },
    { label: '09:30 AM', taken: true },
    { label: '10:00 AM', taken: false },
    { label: '10:30 AM', taken: false },
    { label: '11:00 AM', taken: true },
    { label: '11:30 AM', taken: false },
    { label: '12:00 PM', taken: false },
    { label: '02:00 PM', taken: false },
    { label: '02:30 PM', taken: true },
    { label: '03:00 PM', taken: false },
    { label: '03:30 PM', taken: false },
    { label: '04:00 PM', taken: false },
  ];

  private mode: 'existing' | 'new' = 'existing';
  private selectedPatient: Patient | null = null;
  private selectedSlot: string | null = null;
  private pendingPrint = false;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const form = this.byId('book-form');
    if (!form) return;

    this.apptStats(this.byId('stats-row'), [
      { id: 'stat-slots', icon: 'icon-clock-3', label: 'Slots Today', tone: 'primary', delta: 0, meta: 'per doctor', spark: [12, 12, 12, 12, 12, 12, 12] },
      { id: 'stat-available', icon: 'icon-circle-check', label: 'Available', tone: 'emerald', delta: 6.7, meta: 'vs yesterday', spark: [7, 8, 7, 9, 8, 10, 9] },
      { id: 'stat-booked', icon: 'icon-user-check', label: 'Booked', tone: 'amber', delta: 9.1, meta: 'vs yesterday', spark: [2, 3, 2, 3, 3, 4, 3] },
      { id: 'stat-next', icon: 'icon-calendar-clock', label: 'Next Available', tone: 'sky', delta: null, meta: 'earliest free slot', spark: [] },
    ]);
    this.bookStats();

    this.qsa('.pt-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.mode = (btn as HTMLElement).dataset['mode'] as 'existing' | 'new';
        this.qsa('.pt-btn').forEach((b) => {
          const on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.className =
            'pt-btn px-4 py-1.5 rounded-lg text-sm font-medium ' +
            (on ? 'bg-white dark:bg-slate-600 text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400');
        });
        this.byId('pane-existing')?.classList.toggle('hidden', this.mode !== 'existing');
        this.byId('pane-new')?.classList.toggle('hidden', this.mode !== 'new');
      });
    });

    const pSearch = this.byId('p-search') as HTMLInputElement | null;
    pSearch?.addEventListener('input', (e) => this.renderResults((e.target as HTMLInputElement).value));
    this.renderResults('');

    this.byId('p-results')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-patient]') as HTMLElement | null;
      if (!btn) return;
      this.selectedPatient = this.PATIENTS.find((p) => p.id === btn.dataset['patient']) || null;
      const sel = this.byId('p-selected');
      if (sel && this.selectedPatient) {
        sel.classList.remove('hidden');
        sel.innerHTML =
          '<div class="flex items-center gap-3">' +
          `<span class="avatar bg-primary">${this.initials(this.selectedPatient.name)}</span>` +
          `<div class="flex-1"><p class="text-sm font-semibold text-gray-900">${this.selectedPatient.name}</p>` +
          `<p class="text-xs text-gray-500 dark:text-gray-400">${this.selectedPatient.id} · ${this.selectedPatient.age} yrs · ${this.selectedPatient.gender} · ${this.selectedPatient.blood}</p></div>` +
          '<button type="button" id="p-clear" class="p-2 rounded-lg text-gray-500 hover:text-danger" aria-label="Clear selection"><i class="icon-x text-sm"></i></button></div>';
      }
      if (pSearch) pSearch.value = '';
      this.renderResults('');
      this.byId('p-clear')?.addEventListener('click', () => {
        this.selectedPatient = null;
        this.byId('p-selected')?.classList.add('hidden');
      });
    });

    const dDept = this.byId('d-dept') as HTMLSelectElement | null;
    dDept?.addEventListener('change', () => this.fillDoctors());
    this.fillDoctors();

    this.renderSlots();

    this.byId('slots')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-slot]') as HTMLElement | null;
      if (!btn) return;
      this.selectedSlot = btn.dataset['slot'] || null;
      this.renderSlots();
    });

    this.byId('btn-save')?.addEventListener('click', () => this.openConfirm(false));
    this.byId('btn-save-print')?.addEventListener('click', () => this.openConfirm(true));

    this.byId('confirm-save')?.addEventListener('click', () => {
      this.toast('Appointment booked successfully');
      if (this.pendingPrint) window.print();
      window.setTimeout(() => {
        window.location.href = 'appointments.html';
      }, 900);
    });
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private initials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('');
  }

  private bookStats(): void {
    const free = this.SLOTS.filter((s) => !s.taken);
    const set = (id: string, v: string) => {
      const el = this.byId(id);
      if (el) el.textContent = v;
    };
    set('stat-slots', String(this.SLOTS.length));
    set('stat-available', String(free.length));
    set('stat-booked', String(this.SLOTS.length - free.length));
    set('stat-next', free.length ? free[0].label : 'None');
  }

  /* ---------------- patient search ---------------- */

  private renderResults(term: string): void {
    const list = this.byId('p-results');
    if (!list) return;
    const q = term.trim().toLowerCase();
    if (!q) {
      list.innerHTML = '<p class="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Start typing to search patient records.</p>';
      return;
    }
    const hits = this.PATIENTS.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.id.toLowerCase().includes(q));
    if (!hits.length) {
      list.innerHTML =
        '<div class="p-6 text-center"><i class="icon-user-x text-xl text-gray-300 dark:text-gray-600"></i>' +
        '<p class="text-sm font-semibold text-gray-900 mt-2">No patient found</p>' +
        '<p class="text-xs text-gray-500 dark:text-gray-400">Switch to New Patient to register them.</p></div>';
      return;
    }
    list.innerHTML = hits
      .map(
        (p) =>
          `<button type="button" data-patient="${p.id}" class="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">` +
          `<span class="avatar bg-primary text-xs">${this.initials(p.name)}</span>` +
          `<span class="flex-1"><span class="block text-sm font-medium text-gray-900">${p.name}</span>` +
          `<span class="block text-xs text-gray-500 dark:text-gray-400">${p.id} · ${p.phone}</span></span>` +
          '<i class="icon-chevron-right text-gray-400"></i></button>',
      )
      .join('');
  }

  /* ---------------- department / doctor ---------------- */

  private fillDoctors(): void {
    const dDept = this.byId('d-dept') as HTMLSelectElement | null;
    const dDoctor = this.byId('d-doctor') as HTMLSelectElement | null;
    if (!dDept || !dDoctor) return;
    const list = this.DOCTORS[dDept.value] || [];
    dDoctor.innerHTML = list.map((d) => `<option>${d}</option>`).join('');
  }

  /* ---------------- time slots ---------------- */

  private renderSlots(): void {
    const slots = this.byId('slots');
    if (!slots) return;
    slots.innerHTML = this.SLOTS.map((s) => {
      if (s.taken) {
        return (
          '<button type="button" role="radio" aria-checked="false" disabled ' +
          'class="px-3.5 py-2 rounded-lg border border-border-color text-sm font-medium text-gray-400 bg-gray-50 dark:bg-slate-800 line-through cursor-not-allowed">' +
          s.label + '</button>'
        );
      }
      const on = this.selectedSlot === s.label;
      return (
        `<button type="button" role="radio" aria-checked="${on ? 'true' : 'false'}" data-slot="${s.label}" ` +
        `class="px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
          on ? 'bg-primary border-primary text-white' : 'border-border-color text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary'
        }">${s.label}</button>`
      );
    }).join('');
  }

  /* ---------------- validation & save ---------------- */

  private patientName(): string {
    if (this.mode === 'existing') return this.selectedPatient ? this.selectedPatient.name : '';
    const first = (this.byId('n-first') as HTMLInputElement | null)?.value.trim() || '';
    const last = (this.byId('n-last') as HTMLInputElement | null)?.value.trim() || '';
    return first && last ? first + ' ' + last : '';
  }

  private validate(): BookDetails | null {
    const name = this.patientName();
    if (!name) {
      this.toast(this.mode === 'existing' ? 'Select a patient first' : 'First and last name are required', 'error');
      return null;
    }
    if (this.mode === 'new' && !(this.byId('n-phone') as HTMLInputElement | null)?.value.trim()) {
      this.toast('Phone number is required', 'error');
      return null;
    }
    if (!(this.byId('a-date') as HTMLInputElement | null)?.value) {
      this.toast('Appointment date is required', 'error');
      return null;
    }
    if (!this.selectedSlot) {
      this.toast('Select a time slot', 'error');
      return null;
    }
    const priority = this.document.querySelector('input[name="priority"]:checked') as HTMLInputElement | null;
    return {
      name,
      dept: (this.byId('d-dept') as HTMLSelectElement).value,
      doctor: (this.byId('d-doctor') as HTMLSelectElement).value,
      consult: (this.byId('d-consult') as HTMLSelectElement).value,
      date: (this.byId('a-date') as HTMLInputElement).value,
      slot: this.selectedSlot,
      visit: (this.byId('a-visit') as HTMLSelectElement).value,
      priority: priority ? priority.value : 'Normal',
      fee: (this.byId('d-fee') as HTMLInputElement).value || '0',
      payment: (this.byId('pay-method') as HTMLSelectElement).value + ' · ' + (this.byId('pay-status') as HTMLSelectElement).value,
    };
  }

  private row(label: string, value: string): string {
    return (
      '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
      `<span class="text-sm text-gray-500 dark:text-gray-400">${label}</span>` +
      `<span class="text-sm font-medium text-gray-900 text-right">${value}</span></div>`
    );
  }

  private openConfirm(withPrint: boolean): void {
    const d = this.validate();
    if (!d) return;
    this.pendingPrint = withPrint;
    const body = this.byId('confirm-body');
    if (body) {
      body.innerHTML =
        this.row('Patient', d.name) +
        this.row('Doctor', d.doctor) +
        this.row('Department', d.dept) +
        this.row('Consultation', d.consult) +
        this.row('Date', d.date) +
        this.row('Time Slot', d.slot) +
        this.row('Visit Type', d.visit) +
        this.row('Priority', d.priority) +
        this.row('Payment', d.payment) +
        this.row('Fee', '$' + d.fee);
    }
    const w = window as any;
    const modal = this.byId('confirm-modal');
    if (modal && w.HSOverlay) w.HSOverlay.open(modal);
  }

  /* ---------------- appointment stat cards (ported from MC.apptStat/apptStats) ---------------- */

  private sparkline(series: number[]): string {
    if (!series || series.length < 2) return '';
    const W = 80;
    const H = 24;
    const max = Math.max.apply(null, series);
    const min = Math.min.apply(null, series);
    const span = max - min || 1;
    const step = W / (series.length - 1);
    const points = series.map((v, i) => {
      const x = (i * step).toFixed(1);
      const y = (H - 2 - ((v - min) / span) * (H - 4)).toFixed(1);
      return x + ',' + y;
    });
    const area = '0,' + H + ' ' + points.join(' ') + ' ' + W + ',' + H;
    const last = points[points.length - 1].split(',');
    return (
      `<svg class="appt-stat-spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
      `<polygon points="${area}" fill="currentColor" opacity="0.12"></polygon>` +
      `<polyline points="${points.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></polyline>` +
      `<circle cx="${last[0]}" cy="${last[1]}" r="1.8" fill="currentColor"></circle></svg>`
    );
  }

  private delta(value: number | null): string {
    if (value === null || value === undefined) return '';
    const up = value > 0;
    const flat = value === 0;
    const cls = flat ? 'is-flat' : up ? 'is-up' : 'is-down';
    const icon = flat ? 'icon-minus' : up ? 'icon-trending-up' : 'icon-trending-down';
    const sign = up ? '+' : '';
    const label = flat ? 'No change' : sign + value + '% ' + (up ? 'increase' : 'decrease');
    return (
      `<span class="appt-stat-delta ${cls}" title="${label}">` +
      `<i class="${icon} text-[10px]" aria-hidden="true"></i>` +
      `<span class="sr-only">${label}</span>` +
      `<span aria-hidden="true">${sign}${value}%</span></span>`
    );
  }

  private apptStat(cfg: StatCfg): string {
    return (
      `<article class="appt-stat tone-${cfg.tone || 'primary'}">` +
      '<div class="appt-stat-head">' +
      `<span class="appt-stat-icon"><i class="${cfg.icon}" aria-hidden="true"></i></span>` +
      this.delta(cfg.delta) +
      '</div>' +
      `<p class="appt-stat-value" id="${cfg.id}">0</p>` +
      `<p class="appt-stat-label">${cfg.label}</p>` +
      '<div class="appt-stat-foot">' +
      this.sparkline(cfg.spark) +
      `<span class="appt-stat-meta">${cfg.meta || 'vs last week'}</span>` +
      '</div></article>'
    );
  }

  private apptStats(container: HTMLElement | null, list: StatCfg[]): void {
    if (!container) return;
    container.innerHTML = list.map((c) => this.apptStat(c)).join('');
  }
}
