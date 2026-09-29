import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

interface Appointment {
  id: number;
  code: string;
  patient: string;
  phone: string;
  doctor: string;
  dept: string;
  date: string;
  slot: string;
  type: string;
  status: string;
  payment: string;
  fee: number;
  notes: string;
}

interface StatCfg {
  id: string;
  icon: string;
  label: string;
  tone: string;
  delta: number | null;
  spark: number[];
}

interface GridColumn<T> {
  cls?: string;
  render: (row: T) => string;
}

interface GridConfig<T> {
  tbody: HTMLElement;
  data: T[];
  pageSize: number;
  skipInitialRender?: boolean;
  search: HTMLInputElement | null;
  filters: { el: HTMLSelectElement | null; match: (row: T, v: string) => boolean }[];
  info: HTMLElement | null;
  pager: HTMLElement | null;
  selectAll: HTMLInputElement | null;
  bulkBar: HTMLElement | null;
  bulkCount: HTMLElement | null;
  empty: { icon: string; title: string; text: string };
  columns: GridColumn<T>[];
  rowKey?: (row: T) => number | string;
}

@Component({
  imports: [RouterLink],
  selector: 'app-appointments',
  styleUrl: './appointments.css',
  templateUrl: './appointments.html',
})
export class Appointments implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STATUS: Record<string, string> = {
    Pending: 'badge-amber',
    Confirmed: 'badge-blue',
    'Checked In': 'badge-purple',
    Completed: 'badge-green',
    Cancelled: 'badge-red',
  };
  private readonly PAYMENT: Record<string, string> = {
    Paid: 'badge-green',
    Unpaid: 'badge-red',
    Insurance: 'badge-blue',
    Refunded: 'badge-gray',
  };
  private readonly TYPE: Record<string, string> = {
    Consultation: 'badge-blue',
    'Follow-Up': 'badge-green',
    Emergency: 'badge-red',
    Procedure: 'badge-purple',
    'Check-Up': 'badge-gray',
  };

  private readonly TODAY = '2026-07-17';
  private readonly MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  private data: Appointment[] = [
    { id: 1, code: 'APT-20260', patient: 'James Morrison', phone: '(212) 555-0147', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: this.TODAY, slot: '09:00 AM - 09:30 AM', type: 'Consultation', status: 'Confirmed', payment: 'Paid', fee: 180, notes: 'Chest tightness on exertion.' },
    { id: 2, code: 'APT-20261', patient: 'Linda Whitfield', phone: '(212) 555-0182', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: this.TODAY, slot: '09:30 AM - 10:00 AM', type: 'Follow-Up', status: 'Checked In', payment: 'Insurance', fee: 140, notes: 'Post-migraine review.' },
    { id: 3, code: 'APT-20262', patient: 'Robert Castillo', phone: '(646) 555-0113', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: this.TODAY, slot: '10:00 AM - 10:30 AM', type: 'Procedure', status: 'Pending', payment: 'Unpaid', fee: 420, notes: 'Knee arthroscopy consult.' },
    { id: 4, code: 'APT-20263', patient: 'Angela Brooks', phone: '(718) 555-0164', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', date: this.TODAY, slot: '11:00 AM - 11:30 AM', type: 'Check-Up', status: 'Completed', payment: 'Paid', fee: 120, notes: 'Annual wellness visit.' },
    { id: 5, code: 'APT-20264', patient: 'Marcus Delgado', phone: '(347) 555-0198', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: this.TODAY, slot: '02:00 PM - 02:30 PM', type: 'Follow-Up', status: 'Confirmed', payment: 'Insurance', fee: 260, notes: 'Chemotherapy cycle review.' },
    { id: 6, code: 'APT-20265', patient: 'Priya Raghavan', phone: '(212) 555-0121', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: this.TODAY, slot: '03:30 PM - 04:00 PM', type: 'Consultation', status: 'Cancelled', payment: 'Refunded', fee: 180, notes: 'Patient requested cancellation.' },
    { id: 7, code: 'APT-20266', patient: 'Daniel Kowalski', phone: '(917) 555-0176', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: '2026-07-18', slot: '09:00 AM - 09:30 AM', type: 'Consultation', status: 'Confirmed', payment: 'Paid', fee: 200, notes: 'Numbness in left hand.' },
    { id: 8, code: 'APT-20267', patient: 'Sofia Alvarez', phone: '(646) 555-0155', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-18', slot: '10:00 AM - 10:30 AM', type: 'Follow-Up', status: 'Pending', payment: 'Unpaid', fee: 130, notes: 'Post-op shoulder review.' },
    { id: 9, code: 'APT-20268', patient: 'Gregory Hollis', phone: '(718) 555-0139', doctor: 'Dr. David Okonkwo', dept: 'Emergency', date: '2026-07-18', slot: '11:00 AM - 11:30 AM', type: 'Emergency', status: 'Completed', payment: 'Insurance', fee: 540, notes: 'Laceration repair.' },
    { id: 10, code: 'APT-20269', patient: 'Naomi Fitzgerald', phone: '(212) 555-0190', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: '2026-07-19', slot: '02:00 PM - 02:30 PM', type: 'Consultation', status: 'Confirmed', payment: 'Paid', fee: 240, notes: 'Second opinion requested.' },
    { id: 11, code: 'APT-20270', patient: 'Ethan Caldwell', phone: '(347) 555-0102', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: '2026-07-19', slot: '09:30 AM - 10:00 AM', type: 'Check-Up', status: 'Pending', payment: 'Unpaid', fee: 150, notes: 'Blood pressure monitoring.' },
    { id: 12, code: 'APT-20271', patient: 'Camille Rousseau', phone: '(917) 555-0128', doctor: 'Dr. Michael Reyes', dept: 'Neurology', date: '2026-07-20', slot: '10:00 AM - 10:30 AM', type: 'Follow-Up', status: 'Confirmed', payment: 'Insurance', fee: 160, notes: 'EEG results discussion.' },
    { id: 13, code: 'APT-20272', patient: 'Theodore Nakamura', phone: '(646) 555-0187', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-20', slot: '11:00 AM - 11:30 AM', type: 'Consultation', status: 'Cancelled', payment: 'Refunded', fee: 170, notes: 'Doctor unavailable.' },
    { id: 14, code: 'APT-20273', patient: 'Hannah Whitmore', phone: '(212) 555-0163', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', date: '2026-07-21', slot: '09:00 AM - 09:30 AM', type: 'Check-Up', status: 'Confirmed', payment: 'Paid', fee: 110, notes: 'Immunisation schedule.' },
    { id: 15, code: 'APT-20274', patient: 'Victor Ramirez', phone: '(718) 555-0174', doctor: 'Dr. Laura Bennett', dept: 'Oncology', date: '2026-07-21', slot: '03:30 PM - 04:00 PM', type: 'Procedure', status: 'Pending', payment: 'Insurance', fee: 680, notes: 'Biopsy scheduling.' },
    { id: 16, code: 'APT-20275', patient: 'Isabelle Duncan', phone: '(347) 555-0145', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', date: '2026-07-22', slot: '02:00 PM - 02:30 PM', type: 'Follow-Up', status: 'Completed', payment: 'Paid', fee: 150, notes: 'Stent follow-up, stable.' },
    { id: 17, code: 'APT-20276', patient: 'Omar Haddad', phone: '(917) 555-0119', doctor: 'Dr. David Okonkwo', dept: 'Emergency', date: '2026-07-22', slot: '10:00 AM - 10:30 AM', type: 'Emergency', status: 'Checked In', payment: 'Unpaid', fee: 460, notes: 'Severe abdominal pain.' },
    { id: 18, code: 'APT-20277', patient: 'Grace Lindqvist', phone: '(646) 555-0136', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', date: '2026-07-23', slot: '09:30 AM - 10:00 AM', type: 'Consultation', status: 'Confirmed', payment: 'Paid', fee: 190, notes: 'Lower back pain assessment.' },
  ];

  private editingId: number | null = null;
  private actionId: number | null = null;
  private delCallback: (() => void) | null = null;
  private grid: {
    refresh: () => void;
    selected: () => string[];
    clearSelection: () => void;
    setData: (d: Appointment[]) => void;
  } | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;

    this.apptStats(this.byId('stats-row'), [
      { id: 'stat-total', icon: 'icon-calendar-days', label: 'Total Appointments', tone: 'primary', delta: 12.5, spark: [18, 22, 19, 26, 24, 31, 28] },
      { id: 'stat-today', icon: 'icon-calendar-check', label: 'Today', tone: 'sky', delta: 4.2, spark: [4, 6, 5, 7, 6, 8, 6] },
      { id: 'stat-pending', icon: 'icon-clock', label: 'Pending', tone: 'amber', delta: -6.1, spark: [9, 8, 10, 7, 6, 5, 4] },
      { id: 'stat-confirmed', icon: 'icon-user-check', label: 'Confirmed', tone: 'purple', delta: 8.9, spark: [10, 12, 11, 14, 13, 16, 18] },
      { id: 'stat-completed', icon: 'icon-circle-check', label: 'Completed', tone: 'emerald', delta: 15.3, spark: [6, 8, 7, 10, 12, 11, 14] },
      { id: 'stat-cancelled', icon: 'icon-circle-x', label: 'Cancelled', tone: 'danger', delta: -3.4, spark: [5, 4, 6, 3, 4, 2, 3] },
    ]);

    this.grid = this.makeGrid({
      tbody,
      data: this.data,
      pageSize: 10,
      skipInitialRender: true,
      search: this.byId('search') as HTMLInputElement | null,
      filters: [
        { el: this.byId('filter-dept') as HTMLSelectElement | null, match: (r, v) => r.dept === v },
        { el: this.byId('filter-doctor') as HTMLSelectElement | null, match: (r, v) => r.doctor === v },
        { el: this.byId('filter-status') as HTMLSelectElement | null, match: (r, v) => r.status === v },
      ],
      info: this.byId('info'),
      pager: this.byId('pager'),
      selectAll: this.byId('select-all') as HTMLInputElement | null,
      bulkBar: this.byId('bulk-bar'),
      bulkCount: this.byId('bulk-count'),
      empty: { icon: 'icon-calendar-x', title: 'No appointments found', text: 'Try adjusting your search or filters, or book a new appointment.' },
      columns: [
        { render: (r) => `<a class="font-medium text-primary" href="${this.detailUrl(r)}">${r.code}</a>` },
        {
          render: (r) =>
            '<div class="flex items-center gap-2.5">' +
            `<span class="avatar" style="overflow:hidden"><img src="${this.avatarPhoto(r.patient)}" alt="" style="width:100%;height:100%;object-fit:cover"></span>` +
            `<div><p class="font-medium text-gray-900">${r.patient}</p>` +
            `<p class="text-xs text-gray-500 dark:text-gray-400">${r.phone}</p></div></div>`,
        },
        { render: (r) => r.doctor },
        { render: (r) => r.dept },
        { render: (r) => this.fmtDate(r.date) },
        { render: (r) => `<span class="whitespace-nowrap">${r.slot}</span>` },
        { render: (r) => this.badge(this.TYPE, r.type) },
        { render: (r) => this.badge(this.STATUS, r.status) },
        { render: (r) => this.badge(this.PAYMENT, r.payment) },
        {
          cls: 'text-right',
          render: (r) =>
            this.actions(r.id, [
              { label: 'View', icon: 'icon-eye', act: 'view' },
              { label: 'Edit', icon: 'icon-pencil', act: 'edit' },
              { label: 'Reschedule', icon: 'icon-calendar-clock', act: 'resched' },
              { label: 'Check In', icon: 'icon-user-check', act: 'checkin' },
              { label: 'Send Reminder', icon: 'icon-bell-plus', act: 'remind' },
              { label: 'Collect Payment', icon: 'icon-wallet', act: 'pay' },
              { label: 'Print', icon: 'icon-printer', act: 'print' },
              { label: 'Cancel', icon: 'icon-circle-x', act: 'cancel' },
              { label: 'Delete', icon: 'icon-trash-2', act: 'delete', danger: true },
            ]),
        },
      ],
    });

    this.byId('btn-add')?.addEventListener('click', () => this.openForm(null));
    this.byId('m-close')?.addEventListener('click', () => this.hsClose('form-modal'));
    this.byId('m-cancel')?.addEventListener('click', () => this.hsClose('form-modal'));

    this.byId('btn-save')?.addEventListener('click', () => this.onSave());

    tbody.addEventListener('click', (e) => this.onRowClick(e));

    this.byId('rs-confirm')?.addEventListener('click', () => this.onReschedConfirm());
    this.byId('cancel-confirm')?.addEventListener('click', () => this.onCancelConfirm());
    this.byId('view-print')?.addEventListener('click', () => window.print());
    this.byId('rm-send')?.addEventListener('click', () => this.onRemindSend());
    this.byId('pm-confirm')?.addEventListener('click', () => this.onPayConfirm());

    this.qsa('[data-bulk]').forEach((btn) => btn.addEventListener('click', () => this.onBulk(btn as HTMLElement)));

    this.byId('btn-reset')?.addEventListener('click', () => this.onReset());
    this.byId('btn-print')?.addEventListener('click', () => window.print());
    this.byId('btn-export')?.addEventListener('click', () => this.onExport());

    this.closeOnBackdrop('del-modal');
    this.initDeleteModal();

    this.stats();
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

  private detailUrl(r: Appointment): string {
    return 'appointment-detail.html?' + new URLSearchParams({ id: r.code, patient: r.patient, doctor: r.doctor, dept: r.dept, date: r.date, slot: r.slot, type: r.type, status: r.status }).toString();
  }

  private fmtDate(iso: string): string {
    const parts = iso.split('-');
    return parts[2] + ' ' + this.MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parts[0];
  }

  private avatarPhoto(seed: string): string {
    let h = 0;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return 'assets/img/avatar/avatar-' + String((h % 30) + 1).padStart(2, '0') + '.jpg';
  }

  private stats(): void {
    const set = (id: string, v: number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-total', this.data.length);
    set('stat-today', this.data.filter((r) => r.date === this.TODAY).length);
    set('stat-pending', this.data.filter((r) => r.status === 'Pending').length);
    set('stat-confirmed', this.data.filter((r) => r.status === 'Confirmed').length);
    set('stat-completed', this.data.filter((r) => r.status === 'Completed').length);
    set('stat-cancelled', this.data.filter((r) => r.status === 'Cancelled').length);
  }

  private refresh(): void {
    this.grid?.setData(this.data);
    this.stats();
  }

  private hsOpen(id: string): void {
    const el = this.byId(id);
    const w = window as any;
    if (el && w.HSOverlay) w.HSOverlay.open(el);
  }

  private hsClose(id: string): void {
    const el = this.byId(id);
    const w = window as any;
    if (el && w.HSOverlay) w.HSOverlay.close(el);
  }

  /* ---------------- form ---------------- */

  private openForm(row: Appointment | null): void {
    this.editingId = row ? row.id : null;
    const title = this.byId('m-title');
    if (title) title.textContent = row ? 'Edit Appointment' : 'New Appointment';
    (this.byId('f-patient') as HTMLInputElement).value = row ? row.patient : '';
    (this.byId('f-phone') as HTMLInputElement).value = row ? row.phone : '';
    (this.byId('f-doctor') as HTMLSelectElement).value = row ? row.doctor : 'Dr. Sarah Chen';
    (this.byId('f-dept') as HTMLSelectElement).value = row ? row.dept : 'Cardiology';
    (this.byId('f-date') as HTMLInputElement).value = row ? row.date : '';
    (this.byId('f-time') as HTMLSelectElement).value = row ? row.slot : '09:00 AM - 09:30 AM';
    (this.byId('f-type') as HTMLSelectElement).value = row ? row.type : 'Consultation';
    (this.byId('f-status') as HTMLSelectElement).value = row ? row.status : 'Pending';
    (this.byId('f-payment') as HTMLSelectElement).value = row ? row.payment : 'Unpaid';
    (this.byId('f-fee') as HTMLInputElement).value = row ? String(row.fee) : '';
    (this.byId('f-notes') as HTMLTextAreaElement).value = row ? row.notes : '';
    this.hsOpen('form-modal');
  }

  private onSave(): void {
    const patient = (this.byId('f-patient') as HTMLInputElement).value.trim();
    if (!patient) {
      this.toast('Patient name is required', 'error');
      return;
    }
    const payload = {
      patient,
      phone: (this.byId('f-phone') as HTMLInputElement).value.trim() || '(212) 555-0100',
      doctor: (this.byId('f-doctor') as HTMLSelectElement).value,
      dept: (this.byId('f-dept') as HTMLSelectElement).value,
      date: (this.byId('f-date') as HTMLInputElement).value || this.TODAY,
      slot: (this.byId('f-time') as HTMLSelectElement).value,
      type: (this.byId('f-type') as HTMLSelectElement).value,
      status: (this.byId('f-status') as HTMLSelectElement).value,
      payment: (this.byId('f-payment') as HTMLSelectElement).value,
      fee: parseInt((this.byId('f-fee') as HTMLInputElement).value, 10) || 0,
      notes: (this.byId('f-notes') as HTMLTextAreaElement).value.trim(),
    };

    if (this.editingId) {
      const row = this.data.find((r) => r.id === this.editingId);
      if (row) Object.assign(row, payload);
      this.toast('Appointment updated');
    } else {
      const nextId = Math.max.apply(null, this.data.map((r) => r.id)) + 1;
      this.data.push(Object.assign({ id: nextId, code: 'APT-' + (20259 + nextId) }, payload));
      this.toast('Appointment created');
    }
    this.hsClose('form-modal');
    this.refresh();
  }

  /* ---------------- row actions ---------------- */

  private detailRow(label: string, value: string): string {
    return (
      '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
      `<span class="text-sm text-gray-500 dark:text-gray-400">${label}</span>` +
      `<span class="text-sm font-medium text-gray-900 text-right">${value}</span></div>`
    );
  }

  private onRowClick(e: Event): void {
    const target = e.target as HTMLElement;
    const btn = target.closest('[data-act]') as HTMLElement | null;
    if (!btn) return;
    const row = this.data.find((r) => r.id === parseInt(btn.dataset['id'] || '', 10));
    if (!row) return;
    this.actionId = row.id;

    switch (btn.dataset['act']) {
      case 'view': {
        const body = this.byId('view-body');
        if (body) {
          body.innerHTML =
            this.detailRow('Appointment ID', row.code) +
            this.detailRow('Patient', row.patient) +
            this.detailRow('Phone', row.phone) +
            this.detailRow('Doctor', row.doctor) +
            this.detailRow('Department', row.dept) +
            this.detailRow('Date', this.fmtDate(row.date)) +
            this.detailRow('Time Slot', row.slot) +
            this.detailRow('Visit Type', this.badge(this.TYPE, row.type)) +
            this.detailRow('Status', this.badge(this.STATUS, row.status)) +
            this.detailRow('Payment', this.badge(this.PAYMENT, row.payment)) +
            this.detailRow('Fee', '$' + row.fee.toFixed(2)) +
            this.detailRow('Notes', row.notes || '—');
        }
        this.hsOpen('view-modal');
        return;
      }
      case 'edit':
        this.openForm(row);
        return;
      case 'resched': {
        const nm = this.byId('resched-name');
        if (nm) nm.textContent = row.patient + ' · ' + row.code;
        (this.byId('rs-date') as HTMLInputElement).value = row.date;
        (this.byId('rs-time') as HTMLSelectElement).value = row.slot;
        this.hsOpen('resched-modal');
        return;
      }
      case 'checkin':
        if (row.status === 'Cancelled') {
          this.toast('Cannot check in a cancelled appointment', 'error');
          return;
        }
        row.status = 'Checked In';
        this.toast(row.patient + ' checked in');
        this.refresh();
        return;
      case 'remind': {
        const nm = this.byId('remind-name');
        if (nm) nm.textContent = row.patient + ' · ' + row.code;
        (this.byId('rm-message') as HTMLTextAreaElement).value =
          'Hi ' + row.patient.split(' ')[0] + ', this is a reminder of your ' + row.type.toLowerCase() +
          ' with ' + row.doctor + ' on ' + this.fmtDate(row.date) + ' at ' + row.slot.split(' - ')[0] +
          '. Reply STOP to opt out.';
        this.hsOpen('remind-modal');
        return;
      }
      case 'pay':
        if (row.payment === 'Paid') {
          this.toast('This appointment is already paid', 'info');
          return;
        }
        if (row.payment === 'Refunded') {
          this.toast('This appointment was refunded', 'info');
          return;
        }
        {
          const nm = this.byId('pay-name');
          if (nm) nm.textContent = row.patient + ' · ' + row.code;
          const sum = this.byId('pay-summary');
          if (sum) {
            sum.innerHTML =
              this.detailRow('Consultation Fee', '$' + row.fee.toFixed(2)) +
              this.detailRow('Current Status', this.badge(this.PAYMENT, row.payment)) +
              this.detailRow('Doctor', row.doctor);
          }
          (this.byId('pm-amount') as HTMLInputElement).value = String(row.fee);
        }
        this.hsOpen('pay-modal');
        return;
      case 'print':
        this.toast('Sending ' + row.code + ' to printer', 'info');
        window.print();
        return;
      case 'cancel': {
        const nm = this.byId('cancel-name');
        if (nm) nm.textContent = row.patient + ' · ' + row.code;
        this.hsOpen('cancel-modal');
        return;
      }
      case 'delete':
        this.confirmDelete(row.patient + ' · ' + row.code, () => {
          this.data = this.data.filter((r) => r.id !== row.id);
          this.toast('Appointment deleted');
          this.refresh();
        });
        return;
    }
  }

  private onReschedConfirm(): void {
    const row = this.data.find((r) => r.id === this.actionId);
    if (row) {
      row.date = (this.byId('rs-date') as HTMLInputElement).value || row.date;
      row.slot = (this.byId('rs-time') as HTMLSelectElement).value;
      row.status = 'Confirmed';
    }
    this.hsClose('resched-modal');
    this.toast('Appointment rescheduled');
    this.refresh();
  }

  private onCancelConfirm(): void {
    const row = this.data.find((r) => r.id === this.actionId);
    if (row) {
      row.status = 'Cancelled';
      if (row.payment === 'Paid') row.payment = 'Refunded';
    }
    this.hsClose('cancel-modal');
    this.toast('Appointment cancelled');
    this.refresh();
  }

  private onRemindSend(): void {
    const channels: string[] = [];
    if ((this.byId('rm-sms') as HTMLInputElement).checked) channels.push('SMS');
    if ((this.byId('rm-email') as HTMLInputElement).checked) channels.push('email');
    if ((this.byId('rm-call') as HTMLInputElement).checked) channels.push('phone call');
    if (!channels.length) {
      this.toast('Select at least one channel', 'error');
      return;
    }
    this.hsClose('remind-modal');
    this.toast('Reminder sent via ' + channels.join(' and '));
  }

  private onPayConfirm(): void {
    const row = this.data.find((r) => r.id === this.actionId);
    const amount = parseFloat((this.byId('pm-amount') as HTMLInputElement).value) || 0;
    if (amount <= 0) {
      this.toast('Enter an amount greater than zero', 'error');
      return;
    }
    const method = (this.byId('pm-method') as HTMLSelectElement).value;
    if (row) {
      row.payment = method === 'Insurance' ? 'Insurance' : 'Paid';
      row.fee = amount;
    }
    this.hsClose('pay-modal');
    this.toast('$' + amount.toFixed(2) + ' collected via ' + method);
    this.refresh();
  }

  private onBulk(btn: HTMLElement): void {
    const ids = (this.grid?.selected() || []).map(Number);
    if (!ids.length) return;
    const mode = btn.dataset['bulk'];

    if (mode === 'delete') {
      this.confirmDelete(ids.length + ' appointments', () => {
        this.data = this.data.filter((r) => ids.indexOf(r.id) === -1);
        this.toast(ids.length + ' appointments deleted');
        this.grid?.clearSelection();
        this.refresh();
      });
      return;
    }

    this.data.forEach((r) => {
      if (ids.indexOf(r.id) !== -1) r.status = mode === 'confirm' ? 'Confirmed' : 'Cancelled';
    });
    this.toast(ids.length + ' appointments ' + (mode === 'confirm' ? 'confirmed' : 'cancelled'));
    this.grid?.clearSelection();
    this.refresh();
  }

  private onReset(): void {
    (this.byId('search') as HTMLInputElement).value = '';
    (this.byId('filter-dept') as HTMLSelectElement).value = '';
    (this.byId('filter-doctor') as HTMLSelectElement).value = '';
    (this.byId('filter-status') as HTMLSelectElement).value = '';
    const range = this.byId('filter-range') as HTMLInputElement | null;
    if (range) range.value = '';
    this.grid?.refresh();
    this.toast('Filters cleared', 'info');
  }

  private onExport(): void {
    const head = ['ID', 'Patient', 'Phone', 'Doctor', 'Department', 'Date', 'Slot', 'Type', 'Status', 'Payment', 'Fee'];
    const rows = this.data.map((r) => [r.code, r.patient, r.phone, r.doctor, r.dept, r.date, r.slot, r.type, r.status, r.payment, r.fee]);
    const csv = [head, ...rows].map((line) => line.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = this.document.createElement('a');
    a.href = url;
    a.download = 'appointments.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.toast('Exported ' + this.data.length + ' appointments');
  }

  /* ---------------- shared delete-confirm modal (ported from MC.confirmDelete/initDeleteModal) ---------------- */

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

  /* ---------------- badge / actions / grid (ported from MC.badge / MC.actions / MC.grid) ---------------- */

  private badge(map: Record<string, string>, value: string): string {
    return `<span class="badge ${map[value] || 'badge-gray'}">${value}</span>`;
  }

  private actions(id: number, items: { label: string; icon: string; act: string; danger?: boolean }[]): string {
    let html =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
      '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">' +
      '<i class="icon-ellipsis-vertical text-sm"></i></button>' +
      '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">';
    items.forEach((it) => {
      html +=
        `<button type="button" role="menuitem" data-act="${it.act}" data-id="${id}" ` +
        `class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ${
          it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
        }"><i class="${it.icon} text-sm"></i>${it.label}</button>`;
    });
    return html + '</div></div>';
  }

  private makeGrid<T extends { id: number }>(cfg: GridConfig<T>) {
    const key = cfg.rowKey || ((r: T) => r.id);
    const state = { rows: cfg.data.slice(), page: 1, perPage: cfg.pageSize, selected: new Set<string>() };

    const filtered = (): T[] => {
      const term = cfg.search ? cfg.search.value.trim().toLowerCase() : '';
      return state.rows.filter((row) => {
        if (term && !Object.values(row as any).join(' ').toLowerCase().includes(term)) return false;
        return cfg.filters.every((f) => {
          const v = f.el ? f.el.value : '';
          return !v || f.match(row, v);
        });
      });
    };

    const syncBulk = () => {
      cfg.bulkBar?.classList.toggle('hidden', state.selected.size === 0);
      if (cfg.bulkCount) cfg.bulkCount.textContent = String(state.selected.size);
    };

    const syncSelectAll = () => {
      if (!cfg.selectAll) return;
      const boxes = this.qsa<HTMLInputElement>('[data-row-select]', cfg.tbody);
      const checked = boxes.filter((b) => b.checked).length;
      cfg.selectAll.checked = boxes.length > 0 && checked === boxes.length;
      cfg.selectAll.indeterminate = checked > 0 && checked < boxes.length;
    };

    const renderEmpty = (colspan: number) => {
      const e = cfg.empty;
      const tr = this.document.createElement('tr');
      tr.innerHTML =
        `<td colspan="${colspan}" class="py-12 text-center">` +
        '<div class="flex flex-col items-center gap-2">' +
        '<span class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">' +
        `<i class="${e.icon} text-xl text-gray-400"></i></span>` +
        `<p class="text-sm font-semibold text-gray-900">${e.title}</p>` +
        `<p class="text-xs text-gray-500 dark:text-gray-400">${e.text}</p></div></td>`;
      cfg.tbody.appendChild(tr);
    };

    const pageButton = (label: string, target: number, opts: { active?: boolean; disabled?: boolean; ariaLabel?: string; icon?: string }): HTMLButtonElement => {
      const b = this.document.createElement('button');
      b.type = 'button';
      b.className = opts.active
        ? 'min-w-9 h-9 px-2 rounded-lg text-sm font-semibold bg-primary text-white'
        : 'min-w-9 h-9 px-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:pointer-events-none';
      b.disabled = !!opts.disabled;
      if (opts.ariaLabel) b.setAttribute('aria-label', opts.ariaLabel);
      if (opts.active) b.setAttribute('aria-current', 'page');
      if (opts.icon) {
        const i = this.document.createElement('i');
        i.className = opts.icon + ' text-sm';
        b.appendChild(i);
      } else {
        b.textContent = label;
      }
      b.addEventListener('click', () => {
        state.page = target;
        render();
      });
      return b;
    };

    const renderPager = (pages: number) => {
      if (!cfg.pager) return;
      cfg.pager.textContent = '';
      cfg.pager.appendChild(pageButton('', state.page - 1, { icon: 'icon-chevron-left', disabled: state.page === 1, ariaLabel: 'Previous page' }));
      let start = Math.max(1, state.page - 2);
      const end = Math.min(pages, start + 4);
      start = Math.max(1, end - 4);
      for (let p = start; p <= end; p++) cfg.pager.appendChild(pageButton(String(p), p, { active: p === state.page }));
      cfg.pager.appendChild(pageButton('', state.page + 1, { icon: 'icon-chevron-right', disabled: state.page === pages, ariaLabel: 'Next page' }));
    };

    const renderMeta = (total: number, from: number, pages: number) => {
      if (cfg.info) {
        cfg.info.textContent = total ? `Showing ${from + 1} to ${Math.min(from + state.perPage, total)} of ${total} entries` : 'Showing 0 to 0 of 0 entries';
      }
      renderPager(pages);
      syncSelectAll();
      syncBulk();
    };

    const render = () => {
      const rows = filtered();
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / state.perPage));
      if (state.page > pages) state.page = pages;
      const from = (state.page - 1) * state.perPage;
      const slice = rows.slice(from, from + state.perPage);
      const colspan = cfg.columns.length + (cfg.selectAll ? 1 : 0);

      cfg.tbody.textContent = '';

      if (total === 0) {
        renderEmpty(colspan);
      } else {
        slice.forEach((row) => {
          const tr = this.document.createElement('tr');
          let html = '';
          if (cfg.selectAll) {
            const id = String(key(row));
            html += `<td><input type="checkbox" data-row-select value="${id}" aria-label="Select row"${state.selected.has(id) ? ' checked' : ''} class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"></td>`;
          }
          cfg.columns.forEach((c) => {
            html += `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.render(row)}</td>`;
          });
          tr.innerHTML = html;
          cfg.tbody.appendChild(tr);
        });
      }

      renderMeta(total, from, pages);
      const w = window as any;
      if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
    };

    if (cfg.search) {
      cfg.search.addEventListener('input', () => {
        state.page = 1;
        render();
      });
    }

    cfg.filters.forEach((f) => {
      f.el?.addEventListener('change', () => {
        state.page = 1;
        render();
      });
    });

    if (cfg.selectAll) {
      cfg.selectAll.addEventListener('change', () => {
        this.qsa<HTMLInputElement>('[data-row-select]', cfg.tbody).forEach((b) => {
          b.checked = cfg.selectAll!.checked;
          if (b.checked) state.selected.add(b.value);
          else state.selected.delete(b.value);
        });
        syncBulk();
      });
    }

    cfg.tbody.addEventListener('change', (e) => {
      const box = (e.target as HTMLElement).closest('[data-row-select]') as HTMLInputElement | null;
      if (!box) return;
      if (box.checked) state.selected.add(box.value);
      else state.selected.delete(box.value);
      syncSelectAll();
      syncBulk();
    });

    if (cfg.skipInitialRender) {
      const rows = filtered();
      const total = rows.length;
      const pages = Math.max(1, Math.ceil(total / state.perPage));
      const from = (state.page - 1) * state.perPage;
      renderMeta(total, from, pages);
    } else {
      render();
    }

    return {
      refresh: render,
      selected: () => Array.from(state.selected),
      clearSelection: () => {
        state.selected.clear();
        render();
      },
      setData: (d: T[]) => {
        state.rows = d.slice();
        state.page = 1;
        render();
      },
    };
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
      '<span class="appt-stat-meta">vs last week</span>' +
      '</div></article>'
    );
  }

  private apptStats(container: HTMLElement | null, list: StatCfg[]): void {
    if (!container) return;
    container.innerHTML = list.map((c) => this.apptStat(c)).join('');
  }
}
