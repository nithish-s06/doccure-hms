import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;

interface CalEvent {
  id: number;
  patient: string;
  doctor: string;
  dept: string;
  type: string;
  date: string;
  start: number;
  dur: number;
  phone: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "APPOINTMENT-CALENDAR".
 * Day/week/month calendar view with a mini month picker, doctor/department
 * filters, quick-book + event-details modals (Preline hs-overlay), and
 * drag-and-drop rescheduling — all against in-memory seed events.
 */
@Component({
  imports: [],
  selector: 'app-appointment-calendar',
  styleUrl: './appointment-calendar.css',
  templateUrl: './appointment-calendar.html',
})
export class AppointmentCalendar implements AfterViewInit {
  private readonly MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private readonly HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  // Fixed "today" so the static template renders identically for every buyer.
  private readonly TODAY = { y: 2026, m: 6, d: 17 }; // 17 Jul 2026
  private readonly NOW_MINUTES = 10 * 60 + 30; // current-time indicator at 10:30

  private readonly TYPE_COLOR: Record<string, { dot: string; card: string }> = {
    Consultation: { dot: 'bg-primary', card: 'bg-primary-100 dark:bg-primary-600/20 border-primary/30 text-primary' },
    'Follow-Up': { dot: 'bg-emerald-500', card: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' },
    Emergency: { dot: 'bg-danger', card: 'bg-red-50 dark:bg-red-500/10 border-danger/30 text-danger' },
    Procedure: { dot: 'bg-purple', card: 'bg-purple-50 dark:bg-purple-500/10 border-purple/30 text-purple' },
  };

  private readonly DOCTORS = ['Dr. Sarah Chen', 'Dr. Michael Reyes', 'Dr. Emily Carter', 'Dr. David Okonkwo', 'Dr. Laura Bennett'];
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology'];

  private events: CalEvent[] = [
    { id: 1, patient: 'James Morrison', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', type: 'Consultation', date: '2026-07-17', start: 9, dur: 0.5, phone: '(212) 555-0147' },
    { id: 2, patient: 'Linda Whitfield', doctor: 'Dr. Michael Reyes', dept: 'Neurology', type: 'Follow-Up', date: '2026-07-17', start: 9.5, dur: 0.5, phone: '(212) 555-0182' },
    { id: 3, patient: 'Robert Castillo', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', type: 'Procedure', date: '2026-07-17', start: 10, dur: 1, phone: '(646) 555-0113' },
    { id: 4, patient: 'Angela Brooks', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', type: 'Consultation', date: '2026-07-17', start: 11, dur: 0.5, phone: '(718) 555-0164' },
    { id: 5, patient: 'Marcus Delgado', doctor: 'Dr. Laura Bennett', dept: 'Oncology', type: 'Follow-Up', date: '2026-07-17', start: 14, dur: 0.5, phone: '(347) 555-0198' },
    { id: 6, patient: 'Gregory Hollis', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', type: 'Emergency', date: '2026-07-17', start: 15.5, dur: 1, phone: '(718) 555-0139' },
    { id: 7, patient: 'Daniel Kowalski', doctor: 'Dr. Michael Reyes', dept: 'Neurology', type: 'Consultation', date: '2026-07-16', start: 9, dur: 0.5, phone: '(917) 555-0176' },
    { id: 8, patient: 'Sofia Alvarez', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', type: 'Follow-Up', date: '2026-07-16', start: 10, dur: 0.5, phone: '(646) 555-0155' },
    { id: 9, patient: 'Naomi Fitzgerald', doctor: 'Dr. Laura Bennett', dept: 'Oncology', type: 'Consultation', date: '2026-07-18', start: 14, dur: 0.5, phone: '(212) 555-0190' },
    { id: 10, patient: 'Ethan Caldwell', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', type: 'Consultation', date: '2026-07-18', start: 9.5, dur: 0.5, phone: '(347) 555-0102' },
    { id: 11, patient: 'Camille Rousseau', doctor: 'Dr. Michael Reyes', dept: 'Neurology', type: 'Follow-Up', date: '2026-07-20', start: 10, dur: 0.5, phone: '(917) 555-0128' },
    { id: 12, patient: 'Hannah Whitmore', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', type: 'Consultation', date: '2026-07-21', start: 9, dur: 0.5, phone: '(212) 555-0163' },
    { id: 13, patient: 'Victor Ramirez', doctor: 'Dr. Laura Bennett', dept: 'Oncology', type: 'Procedure', date: '2026-07-21', start: 15.5, dur: 1, phone: '(718) 555-0174' },
    { id: 14, patient: 'Isabelle Duncan', doctor: 'Dr. Sarah Chen', dept: 'Cardiology', type: 'Follow-Up', date: '2026-07-22', start: 14, dur: 0.5, phone: '(347) 555-0145' },
    { id: 15, patient: 'Omar Haddad', doctor: 'Dr. David Okonkwo', dept: 'Pediatrics', type: 'Emergency', date: '2026-07-22', start: 10, dur: 1, phone: '(917) 555-0119' },
    { id: 16, patient: 'Grace Lindqvist', doctor: 'Dr. Emily Carter', dept: 'Orthopedics', type: 'Consultation', date: '2026-07-23', start: 9.5, dur: 0.5, phone: '(646) 555-0136' },
  ];

  private view: 'month' | 'week' | 'day' = 'month';
  private cursor = { y: this.TODAY.y, m: this.TODAY.m, d: this.TODAY.d };
  private miniCursor = { y: this.TODAY.y, m: this.TODAY.m };
  private active = { doctors: new Set(this.DOCTORS), depts: new Set(this.DEPTS) };

  // Capacity model: 10 bookable slots per doctor per day.
  private readonly SLOTS_PER_DAY = this.HOURS.length * this.DOCTORS.length;

  private quickSlot: { date: string; hour: number } | null = null;
  private dragId: number | null = null;

  private body!: HTMLElement | null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.body = this.byId('cal-body');
    if (!this.body) return;

    this.document.querySelectorAll('[data-filter]').forEach((box) => {
      box.addEventListener('change', () => {
        const el = box as HTMLInputElement;
        const set = (this.active as any)[el.dataset['filter'] as string] as Set<string>;
        if (el.checked) set.add(el.value);
        else set.delete(el.value);
        this.render();
      });
    });

    this.byId('mini-grid')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-mini]') as HTMLElement | null;
      if (!btn) return;
      this.cursor = { y: this.miniCursor.y, m: this.miniCursor.m, d: parseInt(btn.dataset['mini'] || '1', 10) };
      this.render();
    });

    this.byId('mini-prev')?.addEventListener('click', () => {
      this.miniCursor.m--;
      if (this.miniCursor.m < 0) {
        this.miniCursor.m = 11;
        this.miniCursor.y--;
      }
      this.renderMini();
    });
    this.byId('mini-next')?.addEventListener('click', () => {
      this.miniCursor.m++;
      if (this.miniCursor.m > 11) {
        this.miniCursor.m = 0;
        this.miniCursor.y++;
      }
      this.renderMini();
    });

    this.document.querySelectorAll('.view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.view = (btn as HTMLElement).dataset['view'] as 'month' | 'week' | 'day';
        this.document.querySelectorAll('.view-btn').forEach((b) => {
          const on = b === btn;
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.className = 'view-btn px-4 py-1.5 rounded-lg text-sm font-medium ' + (on ? 'bg-white dark:bg-slate-600 text-gray-900 shadow-sm' : 'text-gray-500 dark:text-gray-400');
        });
        this.render();
      });
    });

    this.byId('cal-prev')?.addEventListener('click', () => this.shift(-1));
    this.byId('cal-next')?.addEventListener('click', () => this.shift(1));
    this.byId('cal-today')?.addEventListener('click', () => {
      this.cursor = { y: this.TODAY.y, m: this.TODAY.m, d: this.TODAY.d };
      this.miniCursor = { y: this.TODAY.y, m: this.TODAY.m };
      this.render();
    });

    this.body.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const evBtn = target.closest('[data-event]') as HTMLElement | null;
      if (evBtn) {
        const ev = this.events.find((x) => x.id === parseInt(evBtn.dataset['event'] || '0', 10));
        if (!ev) return;
        const detailsBody = this.byId('details-body');
        if (detailsBody) {
          detailsBody.innerHTML =
            this.detailRow('Patient', ev.patient) +
            this.detailRow('Phone', ev.phone) +
            this.detailRow('Doctor', ev.doctor) +
            this.detailRow('Department', ev.dept) +
            this.detailRow('Type', `<span class="badge badge-blue">${ev.type}</span>`) +
            this.detailRow('Date', ev.date) +
            this.detailRow('Time', `${this.fmtHour(ev.start)} — ${this.fmtHour(ev.start + ev.dur)}`);
        }
        if (typeof HSOverlay !== 'undefined') HSOverlay.open(this.byId('details-modal'));
        return;
      }

      const cell = target.closest('.cal-drop') as HTMLElement | null;
      if (!cell) return;
      this.quickSlot = { date: cell.dataset['date'] || '', hour: cell.dataset['hour'] ? parseFloat(cell.dataset['hour'] as string) : 9 };
      const slotEl = this.byId('quick-slot');
      if (slotEl) slotEl.textContent = `${this.quickSlot.date} at ${this.fmtHour(this.quickSlot.hour)}`;
      const patientEl = this.byId('q-patient') as HTMLInputElement | null;
      if (patientEl) patientEl.value = '';
      if (typeof HSOverlay !== 'undefined') HSOverlay.open(this.byId('quick-modal'));
    });

    this.byId('btn-quick')?.addEventListener('click', () => {
      this.quickSlot = { date: this.iso(this.cursor.y, this.cursor.m, this.cursor.d), hour: 9 };
      const slotEl = this.byId('quick-slot');
      if (slotEl) slotEl.textContent = `${this.quickSlot.date} at ${this.fmtHour(9)}`;
      const patientEl = this.byId('q-patient') as HTMLInputElement | null;
      if (patientEl) patientEl.value = '';
      if (typeof HSOverlay !== 'undefined') HSOverlay.open(this.byId('quick-modal'));
    });

    this.byId('quick-save')?.addEventListener('click', () => {
      const patientEl = this.byId('q-patient') as HTMLInputElement | null;
      const patient = (patientEl?.value || '').trim();
      if (!patient) {
        this.toast('Patient name is required', 'error');
        return;
      }
      const doctorEl = this.byId('q-doctor') as HTMLSelectElement | null;
      const typeEl = this.byId('q-type') as HTMLSelectElement | null;
      const doctor = doctorEl?.value || this.DOCTORS[0];
      this.events.push({
        id: Math.max(...this.events.map((e) => e.id)) + 1,
        patient,
        doctor,
        dept: this.DEPTS[this.DOCTORS.indexOf(doctor)] || 'Cardiology',
        type: typeEl?.value || 'Consultation',
        date: this.quickSlot!.date,
        start: this.quickSlot!.hour,
        dur: 0.5,
        phone: '(212) 555-0100',
      });
      if (typeof HSOverlay !== 'undefined') HSOverlay.close(this.byId('quick-modal'));
      this.toast(`Appointment booked for ${patient}`);
      this.render();
    });

    this.body.addEventListener('dragstart', (e) => {
      const el = (e.target as HTMLElement).closest('[data-event]') as HTMLElement | null;
      if (!el) return;
      this.dragId = parseInt(el.dataset['event'] || '0', 10);
      el.classList.add('opacity-50');
    });

    this.body.addEventListener('dragend', (e) => {
      const el = (e.target as HTMLElement).closest('[data-event]') as HTMLElement | null;
      if (el) el.classList.remove('opacity-50');
    });

    this.body.addEventListener('dragover', (e) => {
      if ((e.target as HTMLElement).closest('.cal-drop')) e.preventDefault();
    });

    this.body.addEventListener('drop', (e) => {
      const cell = (e.target as HTMLElement).closest('.cal-drop') as HTMLElement | null;
      if (!cell || this.dragId === null) return;
      e.preventDefault();
      const ev = this.events.find((x) => x.id === this.dragId);
      if (ev) {
        ev.date = cell.dataset['date'] || ev.date;
        if (cell.dataset['hour']) ev.start = parseFloat(cell.dataset['hour'] as string);
        this.toast(`${ev.patient} moved to ${ev.date}`);
      }
      this.dragId = null;
      this.render();
    });

    // Modal open/close is handled declaratively by Preline via
    // data-hs-overlay="#quick-modal" / "#details-modal" (see markup) —
    // no custom close/backdrop wiring needed here.
    this.byId('btn-print')?.addEventListener('click', () => window.print());

    // The default month view, mini calendar and stat cards are already
    // static markup in the HTML, matching what render() would have produced
    // for the frozen TODAY on load. render() stays available above for view
    // switching, month/week/day navigation, filter changes and the mutation
    // handlers (quick-book, drag-and-drop reschedule).
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private iso(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  private daysInMonth(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate();
  }

  private firstWeekday(y: number, m: number): number {
    return new Date(y, m, 1).getDay();
  }

  private fmtHour(h: number): string {
    const base = Math.floor(h);
    const mins = h % 1 ? '30' : '00';
    const suffix = base >= 12 ? 'PM' : 'AM';
    const display = base % 12 === 0 ? 12 : base % 12;
    return `${display}:${mins} ${suffix}`;
  }

  private visible(): CalEvent[] {
    return this.events.filter((e) => this.active.doctors.has(e.doctor) && this.active.depts.has(e.dept));
  }

  private eventsOn(dateIso: string): CalEvent[] {
    return this.visible()
      .filter((e) => e.date === dateIso)
      .sort((a, b) => a.start - b.start);
  }

  // The 4 KPI cards in #stats-row are already static markup in the HTML,
  // matching what MC.apptStats([...]) plus calStats() would have produced
  // on load. calStats() stays below to update the same #stat-* elements
  // after a genuine mutation (booking, drag-and-drop reschedule).
  private calStats(): void {
    const todayIso = this.iso(this.TODAY.y, this.TODAY.m, this.TODAY.d);
    const today = this.events.filter((e) => e.date === todayIso).length;

    const base = new Date(this.TODAY.y, this.TODAY.m, this.TODAY.d);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    const weekDates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      weekDates.push(this.iso(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    const week = this.events.filter((e) => weekDates.indexOf(e.date) !== -1).length;

    const set = (id: string, v: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('stat-today', today);
    set('stat-week', week);
    set('stat-slots', Math.max(0, this.SLOTS_PER_DAY - today));
    set('stat-util', Math.round((today / this.SLOTS_PER_DAY) * 100) + '%');
  }

  private renderMini(): void {
    const label = this.byId('mini-label');
    if (label) label.textContent = `${this.MONTHS[this.miniCursor.m]} ${this.miniCursor.y}`;
    const total = this.daysInMonth(this.miniCursor.y, this.miniCursor.m);
    const lead = this.firstWeekday(this.miniCursor.y, this.miniCursor.m);
    let html = '';
    for (let i = 0; i < lead; i++) html += '<span></span>';
    for (let d = 1; d <= total; d++) {
      const dateIso = this.iso(this.miniCursor.y, this.miniCursor.m, d);
      const isToday = this.miniCursor.y === this.TODAY.y && this.miniCursor.m === this.TODAY.m && d === this.TODAY.d;
      const isSel = this.cursor.y === this.miniCursor.y && this.cursor.m === this.miniCursor.m && d === this.cursor.d;
      const has = this.eventsOn(dateIso).length > 0;
      html +=
        `<button type="button" data-mini="${d}" class="relative h-7 rounded-lg text-xs font-medium transition-colors ` +
        (isToday ? 'bg-primary text-white' : isSel ? 'bg-primary-100 dark:bg-primary-600/20 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700') +
        `">${d}` +
        (has && !isToday ? '<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>' : '') +
        '</button>';
    }
    const grid = this.byId('mini-grid');
    if (grid) grid.innerHTML = html;
  }

  private card(e: CalEvent, compact: boolean): string {
    const c = this.TYPE_COLOR[e.type];
    return (
      `<button type="button" draggable="true" data-event="${e.id}" ` +
      `class="cal-event w-full text-left px-2 py-1 rounded-md border cursor-grab active:cursor-grabbing transition-transform hover:-translate-y-0.5 ${c.card}">` +
      `<span class="block text-[11px] font-semibold truncate">${e.patient}</span>` +
      (compact ? '' : `<span class="block text-[10px] opacity-80 truncate">${this.fmtHour(e.start)} · ${e.doctor}</span>`) +
      '</button>'
    );
  }

  private renderMonth(): void {
    const label = this.byId('cal-label');
    if (label) label.textContent = `${this.MONTHS[this.cursor.m]} ${this.cursor.y}`;
    const total = this.daysInMonth(this.cursor.y, this.cursor.m);
    const lead = this.firstWeekday(this.cursor.y, this.cursor.m);

    let html = '<div class="grid grid-cols-7 gap-px bg-border-color rounded-lg overflow-hidden min-w-[720px]">';
    this.DAYS.forEach((d) => {
      html += `<div class="bg-gray-50 dark:bg-slate-800 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">${d}</div>`;
    });
    for (let i = 0; i < lead; i++) {
      html += '<div class="bg-white dark:bg-slate-900 min-h-28"></div>';
    }
    for (let d = 1; d <= total; d++) {
      const dateIso = this.iso(this.cursor.y, this.cursor.m, d);
      const dayEvents = this.eventsOn(dateIso);
      const isToday = this.cursor.y === this.TODAY.y && this.cursor.m === this.TODAY.m && d === this.TODAY.d;
      html +=
        `<div class="bg-white dark:bg-slate-900 min-h-28 p-1.5 space-y-1 cal-drop" data-date="${dateIso}">` +
        '<div class="flex items-center justify-between">' +
        `<span class="${isToday ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold' : 'text-xs font-semibold text-gray-600 dark:text-gray-400'}">${d}</span>` +
        (dayEvents.length > 2 ? `<span class="text-[10px] text-gray-400">+${dayEvents.length - 2}</span>` : '') +
        '</div>' +
        dayEvents.slice(0, 2).map((e) => this.card(e, true)).join('') +
        '</div>';
    }
    if (this.body) this.body.innerHTML = html + '</div>';
  }

  private timeGrid(dates: string[]): void {
    const label =
      dates.length === 1
        ? `${this.DAYS[new Date(dates[0]).getUTCDay()]}, ${dates[0].split('-')[2]} ${this.MONTHS[this.cursor.m]} ${this.cursor.y}`
        : `${this.MONTHS[this.cursor.m]} ${this.cursor.y}`;
    const labelEl = this.byId('cal-label');
    if (labelEl) labelEl.textContent = label;

    const cols = dates.length;
    let html = `<div class="min-w-[720px]"><div class="grid" style="grid-template-columns:64px repeat(${cols},minmax(0,1fr))">`;

    html += '<div></div>';
    dates.forEach((dt) => {
      const parts = dt.split('-');
      const isToday = dt === this.iso(this.TODAY.y, this.TODAY.m, this.TODAY.d);
      html +=
        '<div class="pb-2 text-center border-b border-border-color">' +
        `<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">${this.DAYS[new Date(dt + 'T00:00:00').getDay()]}</p>` +
        `<p class="${isToday ? 'mx-auto mt-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold' : 'mt-1 text-sm font-bold text-gray-900'}">${parseInt(parts[2], 10)}</p></div>`;
    });

    this.HOURS.forEach((h) => {
      html += `<div class="h-16 pr-2 pt-1 text-right text-[11px] text-gray-400 border-b border-border-color">${this.fmtHour(h)}</div>`;
      dates.forEach((dt) => {
        const slotEvents = this.eventsOn(dt).filter((e) => Math.floor(e.start) === h);
        const isNow = dt === this.iso(this.TODAY.y, this.TODAY.m, this.TODAY.d) && h === Math.floor(this.NOW_MINUTES / 60);
        html +=
          `<div class="relative h-16 border-b border-l border-border-color p-1 space-y-1 cal-drop hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" data-date="${dt}" data-hour="${h}">` +
          (isNow
            ? `<span class="absolute left-0 right-0 z-10 flex items-center pointer-events-none" style="top:${((this.NOW_MINUTES % 60) / 60) * 100}%">` +
              '<span class="w-1.5 h-1.5 rounded-full bg-danger"></span><span class="flex-1 h-px bg-danger"></span></span>'
            : '') +
          slotEvents.map((e) => this.card(e, false)).join('') +
          '</div>';
      });
    });

    if (this.body) this.body.innerHTML = html + '</div></div>';
  }

  private renderWeek(): void {
    const base = new Date(this.cursor.y, this.cursor.m, this.cursor.d);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(this.iso(d.getFullYear(), d.getMonth(), d.getDate()));
    }
    this.timeGrid(dates);
  }

  private renderDay(): void {
    this.timeGrid([this.iso(this.cursor.y, this.cursor.m, this.cursor.d)]);
  }

  private render(): void {
    if (this.view === 'month') this.renderMonth();
    else if (this.view === 'week') this.renderWeek();
    else this.renderDay();
    this.renderMini();
    this.calStats();
  }

  private shift(dir: number): void {
    if (this.view === 'month') {
      this.cursor.m += dir;
      if (this.cursor.m < 0) {
        this.cursor.m = 11;
        this.cursor.y--;
      }
      if (this.cursor.m > 11) {
        this.cursor.m = 0;
        this.cursor.y++;
      }
      this.miniCursor = { y: this.cursor.y, m: this.cursor.m };
    } else {
      const step = this.view === 'week' ? 7 : 1;
      const d = new Date(this.cursor.y, this.cursor.m, this.cursor.d + dir * step);
      this.cursor = { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
      this.miniCursor = { y: this.cursor.y, m: this.cursor.m };
    }
    this.render();
  }

  private detailRow(label: string, value: string): string {
    return (
      '<div class="flex justify-between gap-4 py-2 border-b border-border-color last:border-0">' +
      `<span class="text-sm text-gray-500 dark:text-gray-400">${label}</span>` +
      `<span class="text-sm font-medium text-gray-900 text-right">${value}</span></div>`
    );
  }
}
