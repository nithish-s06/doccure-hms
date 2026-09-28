import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const flatpickr: any;

interface OtEvent {
  id: number;
  day: number;
  startH: number;
  dur: number;
  room: string;
  patient: string;
  mrn: string;
  proc: string;
  surgeon: string;
  anesth: string;
  nurse: string;
  prio: 'emerg' | 'high' | 'med' | 'routine';
  status: string;
  av: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ot-calendar".
 */
@Component({
  imports: [],
  selector: 'app-ot-calendar',
  styleUrl: './ot-calendar.css',
  templateUrl: './ot-calendar.html',
})
export class OtCalendar implements AfterViewInit {
  private readonly PRIOC: Record<string, string> = { emerg: '#dc2626', high: '#e06c1f', med: '#1d4ed8', routine: '#0f766e' };
  private readonly PRIOL: Record<string, string> = { emerg: 'Emergency', high: 'High', med: 'Medium', routine: 'Routine' };
  private readonly SURGEONS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao', 'Dr. V. Iyer'];
  private readonly ANESTH = ['Dr. K. Menon', 'Dr. T. Bose', 'Dr. M. Shah'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy'];
  private readonly PROCS = ['CABG', 'Knee Replacement', 'Craniotomy', 'Appendectomy', 'Cholecystectomy', 'Hip Replacement', 'Cataract', 'C-Section', 'Spinal Fusion', 'Hernia Repair', 'Angioplasty', 'Thyroidectomy'];
  private readonly NAMES = ['Rahul Sharma', 'Anita Reddy', 'Vikram Nair', 'Priya Patel', 'Suresh Gupta', 'Meera Singh', 'Arjun Menon', 'Kavya Das', 'Deepak Joshi', 'Neha Verma', 'Rohan Iyer', 'Sana Khan', 'Manoj Rao', 'Divya Menon'];
  private readonly ROOMS = ['OT-01', 'OT-02', 'OT-03', 'OT-04', 'Cardiac OT', 'Neuro OT', 'Emergency OT', 'Orthopedic OT'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  private readonly DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private readonly PRIOS: OtEvent['prio'][] = ['emerg', 'high', 'med', 'routine', 'routine', 'med', 'high'];

  private curY = 2026;
  private curM = 6;
  private curView: 'month' | 'week' | 'day' | 'timeline' | 'resource' = 'month';
  private curDay = 17;
  private seq = 43;
  private focusId = 0;
  private dragEvtId: number | null = null;
  private clockTimer: any;

  private EVENTS: OtEvent[] = [
    { id: 0, day: 17, startH: 9, dur: 2, room: 'OT-01', patient: 'Rahul Sharma', mrn: 'MRN-70600', proc: 'CABG', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Fernandes', prio: 'emerg', status: 'Scheduled', av: '#475569' },
    { id: 1, day: 17, startH: 9, dur: 2, room: 'OT-01', patient: 'Anita Reddy', mrn: 'MRN-70601', proc: 'Knee Replacement', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Pillai', prio: 'high', status: 'Confirmed', av: '#0f766e' },
    { id: 2, day: 4, startH: 10, dur: 1, room: 'OT-03', patient: 'Vikram Nair', mrn: 'MRN-70602', proc: 'Craniotomy', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Sharma', prio: 'med', status: 'Tentative', av: '#1e40af' },
    { id: 3, day: 5, startH: 15, dur: 2, room: 'OT-04', patient: 'Priya Patel', mrn: 'MRN-70603', proc: 'Appendectomy', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Das', prio: 'routine', status: 'Scheduled', av: '#4338ca' },
    { id: 4, day: 5, startH: 10, dur: 2, room: 'Cardiac OT', patient: 'Suresh Gupta', mrn: 'MRN-70604', proc: 'Cholecystectomy', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Reddy', prio: 'routine', status: 'Confirmed', av: '#0e7490' },
    { id: 5, day: 8, startH: 15, dur: 2, room: 'Neuro OT', patient: 'Meera Singh', mrn: 'MRN-70605', proc: 'Hip Replacement', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Fernandes', prio: 'med', status: 'Tentative', av: '#334155' },
    { id: 6, day: 8, startH: 9, dur: 2, room: 'Emergency OT', patient: 'Arjun Menon', mrn: 'MRN-70606', proc: 'Cataract', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Pillai', prio: 'high', status: 'Scheduled', av: '#3f6212' },
    { id: 7, day: 8, startH: 8, dur: 2, room: 'Orthopedic OT', patient: 'Kavya Das', mrn: 'MRN-70607', proc: 'C-Section', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Sharma', prio: 'emerg', status: 'Confirmed', av: '#7c2d12' },
    { id: 8, day: 9, startH: 14, dur: 2, room: 'OT-01', patient: 'Deepak Joshi', mrn: 'MRN-70608', proc: 'Spinal Fusion', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Das', prio: 'high', status: 'Tentative', av: '#475569' },
    { id: 9, day: 9, startH: 10, dur: 1, room: 'OT-02', patient: 'Neha Verma', mrn: 'MRN-70609', proc: 'Hernia Repair', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Reddy', prio: 'med', status: 'Scheduled', av: '#0f766e' },
    { id: 10, day: 9, startH: 14, dur: 1, room: 'OT-03', patient: 'Rohan Iyer', mrn: 'MRN-70610', proc: 'Angioplasty', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Fernandes', prio: 'routine', status: 'Confirmed', av: '#1e40af' },
    { id: 11, day: 11, startH: 11, dur: 2, room: 'OT-04', patient: 'Sana Khan', mrn: 'MRN-70611', proc: 'Thyroidectomy', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Pillai', prio: 'routine', status: 'Tentative', av: '#4338ca' },
    { id: 12, day: 11, startH: 12, dur: 1, room: 'Cardiac OT', patient: 'Manoj Rao', mrn: 'MRN-70612', proc: 'CABG', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Sharma', prio: 'med', status: 'Scheduled', av: '#0e7490' },
    { id: 13, day: 11, startH: 10, dur: 2, room: 'Neuro OT', patient: 'Divya Menon', mrn: 'MRN-70613', proc: 'Knee Replacement', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Das', prio: 'high', status: 'Confirmed', av: '#334155' },
    { id: 14, day: 12, startH: 11, dur: 3, room: 'Emergency OT', patient: 'Rahul Sharma', mrn: 'MRN-70614', proc: 'Craniotomy', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Reddy', prio: 'emerg', status: 'Tentative', av: '#3f6212' },
    { id: 15, day: 12, startH: 9, dur: 2, room: 'Orthopedic OT', patient: 'Anita Reddy', mrn: 'MRN-70615', proc: 'Appendectomy', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Fernandes', prio: 'high', status: 'Scheduled', av: '#7c2d12' },
    { id: 16, day: 12, startH: 8, dur: 1, room: 'OT-01', patient: 'Vikram Nair', mrn: 'MRN-70616', proc: 'Cholecystectomy', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Pillai', prio: 'med', status: 'Confirmed', av: '#475569' },
    { id: 17, day: 13, startH: 14, dur: 2, room: 'OT-02', patient: 'Priya Patel', mrn: 'MRN-70617', proc: 'Hip Replacement', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Sharma', prio: 'routine', status: 'Tentative', av: '#0f766e' },
    { id: 18, day: 14, startH: 15, dur: 1, room: 'OT-03', patient: 'Suresh Gupta', mrn: 'MRN-70618', proc: 'Cataract', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Das', prio: 'routine', status: 'Scheduled', av: '#1e40af' },
    { id: 19, day: 14, startH: 9, dur: 3, room: 'OT-04', patient: 'Meera Singh', mrn: 'MRN-70619', proc: 'C-Section', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Reddy', prio: 'med', status: 'Confirmed', av: '#4338ca' },
    { id: 20, day: 15, startH: 10, dur: 1, room: 'Cardiac OT', patient: 'Arjun Menon', mrn: 'MRN-70620', proc: 'Spinal Fusion', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Fernandes', prio: 'high', status: 'Tentative', av: '#0e7490' },
    { id: 21, day: 15, startH: 9, dur: 1, room: 'Neuro OT', patient: 'Kavya Das', mrn: 'MRN-70621', proc: 'Hernia Repair', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Pillai', prio: 'emerg', status: 'Scheduled', av: '#334155' },
    { id: 22, day: 17, startH: 11, dur: 1, room: 'Emergency OT', patient: 'Deepak Joshi', mrn: 'MRN-70622', proc: 'Angioplasty', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Sharma', prio: 'high', status: 'Confirmed', av: '#3f6212' },
    { id: 23, day: 18, startH: 15, dur: 2, room: 'Orthopedic OT', patient: 'Neha Verma', mrn: 'MRN-70623', proc: 'Thyroidectomy', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Das', prio: 'med', status: 'Tentative', av: '#7c2d12' },
    { id: 24, day: 18, startH: 12, dur: 2, room: 'OT-01', patient: 'Rohan Iyer', mrn: 'MRN-70624', proc: 'CABG', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Reddy', prio: 'routine', status: 'Scheduled', av: '#475569' },
    { id: 25, day: 19, startH: 14, dur: 3, room: 'OT-02', patient: 'Sana Khan', mrn: 'MRN-70625', proc: 'Knee Replacement', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Fernandes', prio: 'routine', status: 'Confirmed', av: '#0f766e' },
    { id: 26, day: 20, startH: 12, dur: 2, room: 'OT-03', patient: 'Manoj Rao', mrn: 'MRN-70626', proc: 'Craniotomy', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Pillai', prio: 'med', status: 'Tentative', av: '#1e40af' },
    { id: 27, day: 20, startH: 13, dur: 2, room: 'OT-04', patient: 'Divya Menon', mrn: 'MRN-70627', proc: 'Appendectomy', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Sharma', prio: 'high', status: 'Scheduled', av: '#4338ca' },
    { id: 28, day: 21, startH: 10, dur: 2, room: 'Cardiac OT', patient: 'Rahul Sharma', mrn: 'MRN-70628', proc: 'Cholecystectomy', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Das', prio: 'emerg', status: 'Confirmed', av: '#0e7490' },
    { id: 29, day: 21, startH: 8, dur: 2, room: 'Neuro OT', patient: 'Anita Reddy', mrn: 'MRN-70629', proc: 'Hip Replacement', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Reddy', prio: 'high', status: 'Tentative', av: '#334155' },
    { id: 30, day: 21, startH: 11, dur: 2, room: 'Emergency OT', patient: 'Vikram Nair', mrn: 'MRN-70630', proc: 'Cataract', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Fernandes', prio: 'med', status: 'Scheduled', av: '#3f6212' },
    { id: 31, day: 24, startH: 8, dur: 2, room: 'Orthopedic OT', patient: 'Priya Patel', mrn: 'MRN-70631', proc: 'C-Section', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Pillai', prio: 'routine', status: 'Confirmed', av: '#7c2d12' },
    { id: 32, day: 28, startH: 14, dur: 1, room: 'OT-01', patient: 'Suresh Gupta', mrn: 'MRN-70632', proc: 'Spinal Fusion', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Sharma', prio: 'routine', status: 'Tentative', av: '#475569' },
    { id: 33, day: 28, startH: 10, dur: 3, room: 'OT-02', patient: 'Meera Singh', mrn: 'MRN-70633', proc: 'Hernia Repair', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Das', prio: 'med', status: 'Scheduled', av: '#0f766e' },
    { id: 34, day: 29, startH: 8, dur: 3, room: 'OT-03', patient: 'Arjun Menon', mrn: 'MRN-70634', proc: 'Angioplasty', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Reddy', prio: 'high', status: 'Confirmed', av: '#1e40af' },
    { id: 35, day: 30, startH: 8, dur: 3, room: 'OT-04', patient: 'Kavya Das', mrn: 'MRN-70635', proc: 'Thyroidectomy', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Fernandes', prio: 'emerg', status: 'Tentative', av: '#4338ca' },
    { id: 36, day: 30, startH: 8, dur: 3, room: 'Cardiac OT', patient: 'Deepak Joshi', mrn: 'MRN-70636', proc: 'CABG', surgeon: 'Dr. A. Mehta', anesth: 'Dr. K. Menon', nurse: 'N. Pillai', prio: 'high', status: 'Scheduled', av: '#0e7490' },
    { id: 37, day: 31, startH: 15, dur: 1, room: 'Neuro OT', patient: 'Neha Verma', mrn: 'MRN-70637', proc: 'Knee Replacement', surgeon: 'Dr. S. Kapoor', anesth: 'Dr. T. Bose', nurse: 'N. Sharma', prio: 'med', status: 'Confirmed', av: '#334155' },
    { id: 38, day: 17, startH: 15, dur: 3, room: 'Emergency OT', patient: 'Rohan Iyer', mrn: 'MRN-70638', proc: 'Craniotomy', surgeon: 'Dr. R. Nair', anesth: 'Dr. M. Shah', nurse: 'N. Das', prio: 'routine', status: 'Tentative', av: '#3f6212' },
    { id: 39, day: 17, startH: 12, dur: 1, room: 'Orthopedic OT', patient: 'Sana Khan', mrn: 'MRN-70639', proc: 'Appendectomy', surgeon: 'Dr. L. Khan', anesth: 'Dr. K. Menon', nurse: 'N. Reddy', prio: 'routine', status: 'Scheduled', av: '#7c2d12' },
    { id: 40, day: 17, startH: 14, dur: 1, room: 'OT-01', patient: 'Manoj Rao', mrn: 'MRN-70640', proc: 'Cholecystectomy', surgeon: 'Dr. P. Rao', anesth: 'Dr. T. Bose', nurse: 'N. Fernandes', prio: 'med', status: 'Confirmed', av: '#475569' },
    { id: 41, day: 17, startH: 10, dur: 2, room: 'OT-02', patient: 'Divya Menon', mrn: 'MRN-70641', proc: 'Hip Replacement', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Pillai', prio: 'high', status: 'Tentative', av: '#0f766e' },
    { id: 42, day: 8, startH: 16, dur: 2, room: 'Neuro OT', patient: 'Farah Sheikh', mrn: 'MRN-70642', proc: 'Thyroidectomy', surgeon: 'Dr. V. Iyer', anesth: 'Dr. M. Shah', nurse: 'N. Pillai', prio: 'high', status: 'Confirmed', av: '#7c3aed' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
    setTimeout(() => {
      this.byId('oc-skeleton')?.classList.add('hidden');
      this.byId('oc-content')?.classList.remove('hidden');
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(sel: string, r?: ParentNode): T[] {
    return Array.prototype.slice.call((r || this.document).querySelectorAll(sel));
  }

  private toast(msg: string, _icon?: string): void {
    this.toastService.show(msg, 'success');
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  private clock(): void {
    const el = this.byId('oc-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  private overlaps(a: OtEvent, b: OtEvent): boolean {
    return a.id !== b.id && a.day === b.day && a.room === b.room && a.startH < b.startH + b.dur && b.startH < a.startH + a.dur;
  }

  private isConflict(e: OtEvent): boolean {
    return this.EVENTS.some((x) => this.overlaps(e, x));
  }

  private conflictList(): [OtEvent, OtEvent][] {
    const seen = new Set<string>();
    const out: [OtEvent, OtEvent][] = [];
    this.EVENTS.forEach((e) => {
      this.EVENTS.forEach((x) => {
        if (this.overlaps(e, x)) {
          const key = [Math.min(e.id, x.id), Math.max(e.id, x.id)].join('-');
          if (!seen.has(key)) {
            seen.add(key);
            out.push([e, x]);
          }
        }
      });
    });
    return out;
  }

  private mkEvent(day: number): OtEvent {
    const id = this.seq++;
    const startH = 8 + Math.floor(Math.random() * 8);
    const dur = [1, 2, 2, 3][Math.floor(Math.random() * 4)];
    return {
      id, day, startH, dur, room: this.ROOMS[id % this.ROOMS.length], patient: this.NAMES[id % this.NAMES.length], mrn: 'MRN-' + (70600 + id),
      proc: this.PROCS[id % this.PROCS.length], surgeon: this.SURGEONS[id % this.SURGEONS.length], anesth: this.ANESTH[id % this.ANESTH.length], nurse: this.NURSES[id % this.NURSES.length],
      prio: this.PRIOS[id % this.PRIOS.length], status: ['Scheduled', 'Confirmed', 'Tentative'][id % 3], av: this.AVC[id % this.AVC.length],
    };
  }

  /* ---------------- hero counts ---------------- */

  private updateCounts(): void {
    const today = this.byId('oc-h-today');
    if (today) today.textContent = String(this.EVENTS.filter((e) => e.day === this.curDay).length);
    const avail = this.byId('oc-h-avail');
    if (avail) avail.textContent = String(Math.max(0, this.ROOMS.length - this.EVENTS.filter((e) => e.day === this.curDay).length));
    const week = this.byId('oc-h-week');
    if (week) week.textContent = String(this.EVENTS.filter((e) => Math.abs(e.day - this.curDay) <= 3).length);
    const nc = this.conflictList().length;
    const confH = this.byId('oc-h-conf');
    if (confH) confH.textContent = String(nc);
    const confC = this.byId('oc-conf-count');
    if (confC) confC.textContent = String(nc);
  }

  /* ---------------- calendar views ---------------- */

  private evtPill(e: OtEvent): string {
    const c = this.PRIOC[e.prio];
    const cf = this.isConflict(e);
    return `<div class="oc-evt ${cf ? 'conflict' : ''}" draggable="true" data-evt="${e.id}" data-src="month" style="background:${c}" title="${e.patient} · ${e.proc} · ${e.room} · ${e.startH}:00">${cf ? '<i class="icon-alert-triangle text-[8px]"></i>' : ''}<span class="truncate">${e.startH}:00 ${e.proc}</span></div>`;
  }

  private renderCalendar(): void {
    const title = this.byId('oc-caltitle');
    if (title) {
      title.textContent =
        this.curView === 'month' ? `${this.MON[this.curM]} ${this.curY}` :
        this.curView === 'week' ? `Week of ${this.MON[this.curM]} ${this.curDay}` :
        this.curView === 'day' ? `${this.MON[this.curM]} ${this.curDay}, ${this.curY}` :
        this.curView === 'timeline' ? `Timeline · ${this.MON[this.curM]} ${this.curDay}` :
        `OT Resource · ${this.MON[this.curM]} ${this.curDay}`;
    }
    if (this.curView === 'month') this.renderMonth();
    else if (this.curView === 'week') this.renderWeek();
    else if (this.curView === 'day') this.renderDay();
    else this.renderResource();
  }

  private renderMonth(): void {
    const first = new Date(this.curY, this.curM, 1).getDay();
    const days = new Date(this.curY, this.curM + 1, 0).getDate();
    const prevDays = new Date(this.curY, this.curM, 0).getDate();
    let cells: { d: number; dim: boolean }[] = [];
    for (let i = first - 1; i >= 0; i--) cells.push({ d: prevDays - i, dim: true });
    for (let d = 1; d <= days; d++) cells.push({ d, dim: false });
    while (cells.length % 7 !== 0 || cells.length < 42) cells.push({ d: cells.length - (first + days) + 1, dim: true });
    cells = cells.slice(0, 42);

    const host = this.byId('oc-calendar');
    if (!host) return;
    host.innerHTML =
      `<div class="grid grid-cols-7 gap-1px mb-1">${this.DOW.map((d) => `<div class="text-center text-[11px] font-semibold oc-mut py-1">${d}</div>`).join('')}</div>` +
      `<div class="oc-monthgrid">${cells.map((c) => {
        const evs = c.dim ? [] : this.EVENTS.filter((e) => e.day === c.d);
        const isToday = !c.dim && c.d === this.curDay;
        return `<div class="oc-daycell ${c.dim ? 'dim' : ''} ${isToday ? 'today' : ''}" data-daydrop="${c.dim ? '' : c.d}">
                    <div class="flex items-center justify-between"><span class="oc-daynum ${c.dim ? 'oc-mut' : 'oc-head'}">${c.d}</span>${evs.length > 2 ? `<span class="text-[9px] oc-mut">+${evs.length - 2}</span>` : ''}</div>
                    <div class="space-y-0.5 overflow-hidden">${evs.slice(0, 3).map((e) => this.evtPill(e)).join('')}</div>
                </div>`;
      }).join('')}</div>`;
  }

  private timeGrid(cols: number, colLabels: string[], eventsFor: (ci: number) => OtEvent[]): string {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const rowH = 46;
    let html = `<div class="oc-tgrid" style="grid-template-columns:56px repeat(${cols},minmax(120px,1fr))">`;
    html += `<div class="oc-thead">Time</div>` + colLabels.map((l) => `<div class="oc-thead">${l}</div>`).join('');
    hours.forEach((h, hi) => {
      html += `<div class="oc-hourlabel">${h}:00</div>`;
      for (let ci = 0; ci < cols; ci++) {
        const blocks = hi === 0 ? eventsFor(ci) : [];
        html += `<div class="oc-tcell dropcol" data-timedrop="${ci}">${
          hi === 0
            ? blocks.map((e) => {
                const top = (e.startH - 8) * rowH + 2;
                const height = e.dur * rowH - 6;
                const cf = this.isConflict(e);
                return `<div class="oc-block ${cf ? 'conflict' : ''}" draggable="true" data-evt="${e.id}" style="top:${top}px;height:${height}px;background:${this.PRIOC[e.prio]}"><p class="font-semibold truncate">${e.proc}</p><p class="opacity-80 truncate">${e.patient}</p><p class="opacity-70 truncate">${e.startH}:00 · ${e.room}</p></div>`;
              }).join('')
            : ''
        }</div>`;
      }
    });
    html += `</div>`;
    return `<div class="overflow-x-auto">${html}</div>`;
  }

  private renderWeek(): void {
    const base = this.curDay - new Date(this.curY, this.curM, this.curDay).getDay();
    const dayNums = Array.from({ length: 7 }, (_, i) => base + i);
    const host = this.byId('oc-calendar');
    if (host) host.innerHTML = this.timeGrid(7, this.DOW.map((d, i) => `${d} ${dayNums[i] > 0 ? dayNums[i] : ''}`), (ci) => this.EVENTS.filter((e) => e.day === dayNums[ci]));
  }

  private renderDay(): void {
    const host = this.byId('oc-calendar');
    if (host) host.innerHTML = this.timeGrid(this.ROOMS.length, this.ROOMS, (ci) => this.EVENTS.filter((e) => e.day === this.curDay && e.room === this.ROOMS[ci]));
  }

  private renderResource(): void {
    const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
    const colW = 104;
    let html = `<div class="overflow-x-auto"><div class="oc-tgrid" style="grid-template-columns:110px repeat(${hours.length},minmax(${colW}px,1fr))">`;
    html += `<div class="oc-thead">OT Room</div>` + hours.map((h) => `<div class="oc-thead">${h}:00</div>`).join('');
    this.ROOMS.forEach((r) => {
      html += `<div class="oc-tcell flex items-center px-2 text-xs font-semibold oc-head" style="min-height:52px">${r}</div>`;
      html += `<div class="oc-tcell relative" style="grid-column:span ${hours.length}">`;
      this.EVENTS.filter((e) => e.day === this.curDay && e.room === r).forEach((e) => {
        const left = (e.startH - 8) * colW + 2;
        const width = e.dur * colW - 4;
        const cf = this.isConflict(e);
        html += `<div class="oc-block ${cf ? 'conflict' : ''}" draggable="true" data-evt="${e.id}" style="left:${left}px;width:${width}px;top:3px;height:44px;background:${this.PRIOC[e.prio]}"><p class="font-semibold truncate">${e.proc} · ${e.patient}</p><p class="opacity-75 truncate">${e.surgeon}</p></div>`;
        html += `<div class="oc-buffer" style="left:${left + width + 2}px;width:${colW * 0.5}px;top:3px;height:44px;background:color-mix(in srgb,#b7791f 16%,transparent);color:#b7791f"><i class="icon-spray-can text-[10px]"></i></div>`;
      });
      html += `</div>`;
    });
    html += `</div></div>`;
    html += `<div class="flex flex-wrap gap-3 mt-3 text-[11px]"><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="background:#0f766e"></span>Surgery</span><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="background:color-mix(in srgb,#b7791f 30%,transparent)"></span>Cleaning buffer</span><span class="flex items-center gap-1.5 oc-mut"><span class="w-3 h-3 rounded" style="box-shadow:0 0 0 2px #dc2626"></span>Conflict</span></div>`;
    const host = this.byId('oc-calendar');
    if (host) host.innerHTML = html;
  }

  /* ---------------- availability ---------------- */

  private renderAvail(): void {
    const host = this.byId('oc-avail');
    if (!host) return;
    host.innerHTML = this.ROOMS.map((r) => {
      const today = this.EVENTS.filter((e) => e.day === this.curDay && e.room === r).sort((a, b) => a.startH - b.startH);
      const cur = today[0];
      const next = today[1];
      const free = today.length === 0;
      const sc = free ? '#15803d' : '#e06c1f';
      return `<div class="oc-panel p-3.5">
                <div class="flex items-center justify-between mb-2"><span class="text-sm font-bold oc-head flex items-center gap-1.5"><span class="oc-iconbadge w-7 h-7" style="color:${sc}"><i class="icon-layout-grid text-sm"></i></span> ${r}</span><span class="oc-chip" style="background:color-mix(in srgb,${sc} 13%,transparent);color:${sc}">${free ? 'Available' : 'Booked'}</span></div>
                <div class="text-[11px] space-y-1">
                    <div class="flex justify-between"><span class="oc-mut">Current</span><span class="oc-head font-medium">${cur ? cur.proc + ' (' + cur.startH + ':00)' : '—'}</span></div>
                    <div class="flex justify-between"><span class="oc-mut">Next</span><span class="oc-head font-medium">${next ? next.proc + ' (' + next.startH + ':00)' : 'None'}</span></div>
                    <div class="flex justify-between"><span class="oc-mut">Equipment</span><span style="color:#15803d"><i class="icon-check text-[11px]"></i> Ready</span></div>
                    <div class="flex justify-between"><span class="oc-mut">Cleaning</span><span class="oc-head">${free ? 'Done' : 'Scheduled'}</span></div>
                </div>
                <button data-modal="schedule" class="oc-btn oc-btn-ghost w-full justify-center mt-2 !py-1.5 text-xs"><i class="icon-calendar-plus"></i> Book slot</button>
            </div>`;
    }).join('');
  }

  /* ---------------- planning panel ---------------- */

  private renderPlanning(): void {
    const e = this.EVENTS.find((x) => x.id === this.focusId) || this.EVENTS[0];
    if (!e) {
      const host = this.byId('oc-planning');
      if (host) host.innerHTML = '<p class="oc-mut text-sm">No surgery selected.</p>';
      return;
    }
    this.focusId = e.id;
    const idEl = this.byId('oc-plan-id');
    if (idEl) idEl.textContent = e.proc + ' · ' + this.MON[this.curM] + ' ' + e.day;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-1 border-b" style="border-color:var(--oc-border)"><span class="oc-mut">${k}</span><span class="font-medium oc-head">${v}</span></div>`;
    const host = this.byId('oc-planning');
    if (host) {
      host.innerHTML = `
                <div class="flex items-center gap-3 mb-3">
                    <span class="oc-avatar flex-none" style="width:42px;height:42px;background:${e.av};font-size:14px">${this.initials(e.patient)}</span>
                    <div class="min-w-0 flex-1"><p class="font-bold oc-head">${e.patient}</p><p class="text-[11px] oc-mut">${e.mrn} · ${e.proc}</p></div>
                    <span class="oc-chip pr-${e.prio}" style="background:color-mix(in srgb,${this.PRIOC[e.prio]} 13%,transparent);color:${this.PRIOC[e.prio]}">${this.PRIOL[e.prio]}</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-x-4">
                    <div>${row('Procedure', e.proc)}${row('OT Room', e.room)}${row('Date', this.MON[this.curM] + ' ' + e.day)}${row('Time', e.startH + ':00')}${row('Duration', e.dur + 'h')}</div>
                    <div>${row('Surgeon', e.surgeon)}${row('Anesthesiologist', e.anesth)}${row('OT Nurse', e.nurse)}${row('Status', e.status)}${row('Priority', this.PRIOL[e.prio])}</div>
                </div>
                <div class="mt-3">
                    <p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2">Pre-op Checklist</p>
                    <div class="grid sm:grid-cols-2 gap-x-4 gap-y-1">${['Consent signed', 'Fasting confirmed', 'Blood cross-matched', 'Equipment reserved', 'Anesthesia review', 'Team briefed'].map((x) => `<label class="flex items-center gap-2 text-xs oc-head"><input type="checkbox" class="accent-[var(--oc-c)]" checked> ${x}</label>`).join('')}</div>
                </div>`;
    }
  }

  /* ---------------- conflict center ---------------- */

  private renderConflicts(): void {
    const list = this.conflictList();
    const kinds = ['Double Booking', 'OT Occupied', 'Surgeon Busy', 'Equipment Conflict'];
    const host = this.byId('oc-conflicts');
    if (!host) return;
    host.innerHTML = list.length
      ? list.map(([a, b], i) => {
          const kind = a.surgeon === b.surgeon ? 'Surgeon Busy' : a.room === b.room ? 'OT Occupied' : kinds[i % kinds.length];
          return `<div class="oc-panel p-3" style="border-left:3px solid #dc2626">
                    <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold oc-head flex items-center gap-1.5"><i class="icon-alert-triangle text-rose-500 text-[13px]"></i> ${kind}</span><span class="oc-chip" style="background:color-mix(in srgb,#dc2626 12%,transparent);color:#dc2626">${a.room}</span></div>
                    <p class="text-[11px] oc-mut">${a.proc} (${a.startH}:00) &amp; ${b.proc} (${b.startH}:00) — ${this.MON[this.curM]} ${a.day}</p>
                    <div class="flex gap-1.5 mt-2">
                        <button data-resolve-move="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-move text-[11px]"></i> Move ${b.proc}</button>
                        <button data-resolve-room="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-layout-grid text-[11px]"></i> New OT</button>
                        <button data-resolve-time="${b.id}" class="oc-npill hover:bg-[var(--oc-hover)]"><i class="icon-clock text-[11px]"></i> Shift time</button>
                    </div>
                </div>`;
        }).join('')
      : '<div class="oc-panel p-4 text-center"><p class="text-sm oc-mut"><i class="icon-circle-check text-emerald-500"></i> No scheduling conflicts</p></div>';
  }

  /* ---------------- drawer ---------------- */

  private drawerHost(): HTMLElement {
    let d = this.byId('oc-drawer');
    if (!d) {
      d = this.document.createElement('div');
      d.id = 'oc-drawer';
      d.className = 'oc-drawer';
      this.document.body.appendChild(d);
    }
    return d;
  }

  private openDrawer(id: number): void {
    const e = this.EVENTS.find((x) => x.id === id);
    if (!e) return;
    const c = this.PRIOC[e.prio];
    const box = (t: string, ic: string, body: string) => `<div class="oc-panel p-3"><p class="text-[11px] font-bold oc-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} oc-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-0.5"><span class="oc-mut">${k}</span><span class="font-medium oc-head">${v}</span></div>`;
    const host = this.drawerHost();
    host.innerHTML = `
              <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--oc-elev);border-color:var(--oc-border)">
                <div class="flex items-center gap-3"><span class="oc-avatar flex-none" style="width:44px;height:44px;background:${e.av};font-size:14px">${this.initials(e.patient)}</span><div><p class="font-bold oc-head">${e.patient}</p><p class="text-[11px] oc-mut">${e.mrn} · ${e.proc}</p></div></div>
                <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--oc-hover)] flex items-center justify-center oc-mut"><i class="icon-x"></i></button>
              </div>
              <div class="p-4 space-y-3">
                <div class="flex items-center gap-2 flex-wrap"><span class="oc-chip" style="background:color-mix(in srgb,${c} 14%,transparent);color:${c}">${this.PRIOL[e.prio]}</span><span class="oc-npill">${e.status}</span>${this.isConflict(e) ? '<span class="oc-chip" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-[10px]"></i> Conflict</span>' : ''}</div>
                ${box('Schedule', 'icon-calendar', row('Date', this.MON[this.curM] + ' ' + e.day + ', ' + this.curY) + row('Time', e.startH + ':00') + row('Duration', e.dur + 'h') + row('OT Room', e.room))}
                ${box('Procedure', 'icon-slice', row('Surgery', e.proc) + row('Priority', this.PRIOL[e.prio]) + row('Status', e.status))}
                ${box('Surgical Team', 'icon-users', row('Surgeon', e.surgeon) + row('Anesthesiologist', e.anesth) + row('OT Nurse', e.nurse))}
                ${box('Equipment', 'icon-cpu', '<div class="flex flex-wrap gap-1">' + ['Anesthesia machine', 'Surgical lights', 'Electrocautery'].map((x) => `<span class="oc-npill">${x}</span>`).join('') + '</div>')}
                ${box('Checklist', 'icon-clipboard-check', ['Consent signed', 'Fasting confirmed', 'Cross-matched', 'Team briefed'].map((x) => `<label class="flex items-center gap-2 text-xs py-0.5 oc-head"><input type="checkbox" class="accent-[var(--oc-c)]" checked> ${x}</label>`).join(''))}
                <div class="grid grid-cols-2 gap-2">
                    <button data-modal="edit" class="oc-btn oc-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
                    <button data-modal="team" class="oc-btn oc-btn-ghost justify-center"><i class="icon-users"></i> Team</button>
                    <button data-modal="emergency" class="oc-btn oc-btn-ghost justify-center"><i class="icon-alert-triangle"></i> Escalate</button>
                    <button data-del-evt="${e.id}" class="oc-btn oc-btn-ghost justify-center"><i class="icon-trash-2"></i> Cancel</button>
                </div>
              </div>`;
    host.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeDrawer(): void {
    this.byId('oc-drawer')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  /* ---------------- context menu ---------------- */

  private readonly ACTIONS: [string, string, string][] = [
    ['Quick Edit', 'icon-edit', 'edit'], ['Assign Team', 'icon-users', 'team'], ['View Details', 'icon-eye', 'view'],
    ['Move Date', 'icon-move', 'move'], ['Duplicate', 'icon-copy', 'dup'], ['Mark Confirmed', 'icon-circle-check', 'confirm'],
    ['sep', '', ''], ['Delete', 'icon-trash-2', 'delete'],
  ];

  private menuHost(): HTMLElement {
    let m = this.byId('oc-menuhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'oc-menuhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="oc-menu" id="oc-openmenu">${this.ACTIONS.map((a) => (a[0] === 'sep' ? '<div class="oc-menu-sep"></div>' : `<button data-action="${a[2]}" data-eid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`)).join('')}</div>`;
    const m = this.byId('oc-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('oc-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ---------------- modals ---------------- */

  private MODALS: Record<string, { t: string; sub: string; ic: string; body: string; cta: string }> = {};

  private buildModals(): void {
    const fld = (l: string, el: string) => `<div><label class="oc-formlabel">${l}</label>${el}</div>`;
    const inp = (ph?: string) => `<input class="oc-in mt-1" placeholder="${ph || ''}">`;
    const selE = (o: string[]) => `<select class="oc-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
    const drop = (t: string) => `<div class="oc-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--oc-hover)]"><i class="icon-cloud-upload text-3xl oc-mut"></i><p class="text-sm font-semibold mt-1 oc-head">${t}</p></div>`;
    this.MODALS = {
      schedule: { t: 'Schedule Surgery', sub: 'Add a surgery to the calendar', ic: 'icon-calendar-plus', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN', inp('Search...'))}${fld('Procedure', selE(this.PROCS))}${fld('OT Room', selE(this.ROOMS))}${fld('Surgeon', selE(this.SURGEONS))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)', inp('2'))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Priority', selE(['Routine', 'Medium', 'High', 'Emergency']))}</div>`, cta: 'Schedule' },
      edit: { t: 'Edit Schedule', sub: 'Update surgery details', ic: 'icon-edit', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room', selE(this.ROOMS))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)', inp('2'))}${fld('Status', selE(['Scheduled', 'Confirmed', 'Tentative']))}</div>`, cta: 'Save Changes' },
      emergency: { t: 'Emergency Booking', sub: 'Insert an urgent case', ic: 'icon-alert-triangle', body: `<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Finds the next available emergency slot.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown', inp('Name or "Unknown"'))}${fld('Procedure', selE(this.PROCS))}${fld('OT', selE(['Auto — next free', 'OT-01', 'OT-02']))}${fld('Surgeon On-call', selE(this.SURGEONS))}</div>`, cta: 'Book Emergency' },
      team: { t: 'Assign Team', sub: 'Compose the surgical team', ic: 'icon-users', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Lead Surgeon', selE(this.SURGEONS))}${fld('Assistant', selE(this.SURGEONS))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Scrub Nurse', selE(this.NURSES))}${fld('Circulating Nurse', selE(this.NURSES))}${fld('Technician', selE(['Tech A', 'Tech B']))}</div>`, cta: 'Assign Team' },
      block: { t: 'Block OT', sub: 'Reserve a theater (no surgery)', ic: 'icon-ban', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room', selE(this.ROOMS))}${fld('Reason', selE(['Maintenance', 'Deep Cleaning', 'Equipment Install', 'Training']))}${fld('From', `<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('To', `<input type="text" placeholder="dd-mm-yyyy --:--" class="oc-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}</div>`, cta: 'Block OT' },
      import: { t: 'Import', sub: 'Bulk-load a surgery schedule', ic: 'icon-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Surgery Schedule'].map((f) => `<span class="oc-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--oc-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 24 surgeries · 2 conflicts flagged</div>`, cta: 'Import' },
      export: { t: 'Export', sub: 'Export the schedule', ic: 'icon-download', body: `<p class="text-xs oc-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV', 'Excel', 'PDF', 'Print', 'iCal (.ics)', 'Weekly Schedule', 'Surgeon Schedule', 'OT Utilization', 'Selected', 'All Records'].map((f) => `<button data-expfmt="${f}" class="oc-btn oc-btn-ghost justify-center">${f}</button>`).join('')}</div>`, cta: 'Export' },
    };
  }

  private modalHost(): HTMLElement {
    let m = this.byId('oc-modalhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'oc-modalhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    this.document.body.style.overflow = 'hidden';
    const host = this.modalHost();
    host.innerHTML = `<div class="oc-modal-wrap open"><div class="oc-modal-bg" data-close></div><div class="oc-modal">
            <div class="oc-modal-head"><span class="oc-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold oc-head leading-tight">${m.t}</h3><p class="text-[11px] oc-mut">${m.sub || ''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--oc-hover)] flex items-center justify-center oc-mut"><i class="icon-x"></i></button></div>
            <div class="oc-modal-body">${m.body}</div>
            <div class="oc-modal-foot"><button data-close class="oc-btn oc-btn-ghost">Cancel</button><button data-modalok="${key}" class="oc-btn oc-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
        </div></div>`;
    if (typeof flatpickr !== 'undefined') {
      this.qsa<HTMLElement>('[data-provider="flatpickr"]', host).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        if (el.hasAttribute('data-enable-time')) {
          config.enableTime = true;
          config.dateFormat = (config.dateFormat || 'Y-m-d') + ' H:i';
        }
        flatpickr(el, config);
      });
    }
  }

  private openDelete(msg: string, onOk: () => void): void {
    this.document.body.style.overflow = 'hidden';
    const host = this.modalHost();
    host.innerHTML = `<div class="oc-modal-wrap open"><div class="oc-modal-bg" data-close></div><div class="oc-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg oc-head">Confirm</h3><p class="text-xs oc-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="oc-btn oc-btn-ghost flex-1 justify-center">Cancel</button><button id="oc-delok" class="oc-btn oc-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`;
    const btn = this.byId('oc-delok');
    if (btn) btn.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('oc-modalhost');
    if (host) host.innerHTML = '';
    if (!this.byId('oc-drawer')?.classList.contains('open')) this.document.body.style.overflow = '';
  }

  /* ---------------- refresh ---------------- */

  private refreshSchedule(): void {
    this.renderCalendar();
    this.renderAvail();
    this.renderPlanning();
    this.renderConflicts();
    this.updateCounts();
  }

  /* ---------------- drag & drop ---------------- */

  private wireDragDrop(): void {
    this.document.addEventListener('dragstart', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-evt]') as HTMLElement | null;
      if (t) {
        this.dragEvtId = +t.dataset['evt']!;
        t.classList.add('drag');
      }
    });
    this.document.addEventListener('dragend', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-evt]') as HTMLElement | null;
      if (t) t.classList.remove('drag');
      this.qsa('.oc-daycell,.oc-tcell').forEach((c) => c.classList.remove('dragover'));
    });
    this.document.addEventListener('dragover', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-daydrop],[data-timedrop]') as HTMLElement | null;
      if (c) {
        e.preventDefault();
        this.qsa('.dragover').forEach((x) => x.classList.remove('dragover'));
        c.classList.add('dragover');
      }
    });
    this.document.addEventListener('drop', (e: Event) => {
      const target = e.target as HTMLElement;
      const dcell = target.closest('[data-daydrop]') as HTMLElement | null;
      const tcell = target.closest('[data-timedrop]') as HTMLElement | null;
      if (this.dragEvtId == null) return;
      const ev = this.EVENTS.find((x) => x.id === this.dragEvtId);
      if (!ev) {
        this.dragEvtId = null;
        return;
      }
      if (dcell && dcell.dataset['daydrop']) {
        e.preventDefault();
        ev.day = +dcell.dataset['daydrop'];
        this.refreshSchedule();
        this.toast('Surgery moved to ' + this.MON[this.curM] + ' ' + ev.day, 'icon-move');
      } else if (tcell) {
        e.preventDefault();
        const ci = +tcell.dataset['timedrop']!;
        if (this.curView === 'week') {
          const base = this.curDay - new Date(this.curY, this.curM, this.curDay).getDay();
          ev.day = base + ci;
        } else if (this.curView === 'day') {
          ev.room = this.ROOMS[ci];
        }
        this.refreshSchedule();
        this.toast('Surgery rescheduled', 'icon-move');
      }
      this.dragEvtId = null;
    });
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.buildModals();
    this.wireDragDrop();

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      const cv = target.closest('[data-cv]') as HTMLElement | null;
      if (cv) {
        this.curView = cv.dataset['cv'] as any;
        this.qsa('#oc-viewtabs button').forEach((x) => x.classList.toggle('on', x === cv));
        this.renderCalendar();
        return;
      }

      const nav = target.closest('[data-nav]') as HTMLElement | null;
      if (nav) {
        const v = nav.dataset['nav']!;
        if (v === 'today') {
          this.curM = 6; this.curY = 2026; this.curDay = 17;
        } else if (this.curView === 'month') {
          this.curM += +v;
          if (this.curM < 0) { this.curM = 11; this.curY--; }
          if (this.curM > 11) { this.curM = 0; this.curY++; }
        } else {
          this.curDay += +v * (this.curView === 'week' ? 7 : 1);
          if (this.curDay < 1) this.curDay = 1;
        }
        this.renderCalendar();
        return;
      }

      const rMove = target.closest('[data-resolve-move]') as HTMLElement | null;
      if (rMove) {
        const ev = this.EVENTS.find((x) => x.id === +rMove.dataset['resolveMove']!);
        if (ev) ev.day += 1;
        this.refreshSchedule();
        this.toast('Moved to next day', 'icon-move');
        return;
      }
      const rRoom = target.closest('[data-resolve-room]') as HTMLElement | null;
      if (rRoom) {
        const ev = this.EVENTS.find((x) => x.id === +rRoom.dataset['resolveRoom']!);
        if (ev) ev.room = this.ROOMS[(this.ROOMS.indexOf(ev.room) + 1) % this.ROOMS.length];
        this.refreshSchedule();
        this.toast('Reassigned OT', 'icon-layout-grid');
        return;
      }
      const rTime = target.closest('[data-resolve-time]') as HTMLElement | null;
      if (rTime) {
        const ev = this.EVENTS.find((x) => x.id === +rTime.dataset['resolveTime']!);
        if (ev) ev.startH = Math.min(16, ev.startH + ev.dur);
        this.refreshSchedule();
        this.toast('Shifted time slot', 'icon-clock');
        return;
      }

      const delEvt = target.closest('[data-del-evt]') as HTMLElement | null;
      if (delEvt) {
        const id = +delEvt.dataset['delEvt']!;
        this.openDelete('Cancel this scheduled surgery?', () => {
          this.EVENTS = this.EVENTS.filter((x) => x.id !== id);
          this.closeDrawer();
          this.refreshSchedule();
          this.toast('Surgery cancelled', 'icon-trash-2');
        });
        return;
      }

      const evEl = target.closest('[data-evt]') as HTMLElement | null;
      if (evEl) {
        this.focusId = +evEl.dataset['evt']!;
        this.renderPlanning();
        this.openDrawer(this.focusId);
        return;
      }

      const t = target.closest('[data-modal],[data-modalok],[data-close],[data-action],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.oc-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal']!);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        const k = t.dataset['modalok']!;
        if (k === 'schedule' || k === 'emergency') {
          const ev = this.mkEvent(this.curDay);
          ev.prio = k === 'emergency' ? 'emerg' : 'routine';
          this.EVENTS.push(ev);
          this.refreshSchedule();
        }
        this.toast(this.MODALS[k].cta + ' — done', 'icon-check');
        this.closeModal();
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast('Exported: ' + t.dataset['expfmt'], 'icon-download');
        this.closeModal();
        return;
      }
      if (t.dataset['close'] !== undefined) {
        this.closeModal();
        this.closeDrawer();
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'];
        const id = +t.dataset['eid']!;
        this.closeMenu();
        const ev = this.EVENTS.find((x) => x.id === id);
        this.focusId = id;
        if (a === 'view') {
          this.openDrawer(id);
        } else if (a === 'move') {
          if (ev) ev.day += 1;
          this.refreshSchedule();
          this.toast('Moved to next day', 'icon-move');
        } else if (a === 'dup') {
          if (ev) {
            const c = Object.assign({}, ev);
            c.id = this.seq++;
            c.startH = Math.min(16, ev.startH + ev.dur);
            this.EVENTS.push(c);
          }
          this.refreshSchedule();
          this.toast('Surgery duplicated', 'icon-copy');
        } else if (a === 'confirm') {
          if (ev) ev.status = 'Confirmed';
          this.refreshSchedule();
          this.toast('Marked confirmed', 'icon-circle-check');
        } else if (a === 'delete') {
          this.openDelete('Delete this surgery?', () => {
            this.EVENTS = this.EVENTS.filter((x) => x.id !== id);
            this.refreshSchedule();
            this.toast('Deleted', 'icon-trash-2');
          });
        } else if (this.MODALS[a!]) {
          this.openModal(a!);
        }
        return;
      }
    });

    this.document.addEventListener('contextmenu', (e: Event) => {
      const evEl = (e.target as HTMLElement).closest('[data-evt]') as HTMLElement | null;
      if (evEl) {
        e.preventDefault();
        this.openMenu(+evEl.dataset['evt']!, (e as MouseEvent).clientX, (e as MouseEvent).clientY);
      }
    });
  }
}
