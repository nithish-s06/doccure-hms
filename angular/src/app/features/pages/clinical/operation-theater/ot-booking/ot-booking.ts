import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const flatpickr: any;

interface Booking {
  id: number;
  code: string;
  patient: string;
  mrn: string;
  surgeon: string;
  anesth: string;
  nurse: string;
  proc: string;
  room: string;
  date: string;
  time: string;
  dur: number;
  prio: 'emerg' | 'high' | 'med' | 'routine';
  stage: string;
  av: string;
  photo: string;
  equip: string[];
  recBed: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "ot-booking".
 */
@Component({
  imports: [],
  selector: 'app-ot-booking',
  styleUrl: './ot-booking.css',
  templateUrl: './ot-booking.html',
})
export class OtBooking implements AfterViewInit {
  private readonly PRIOC: Record<string, string> = { emerg: '#dc2626', high: '#e06c1f', med: '#1d4ed8', routine: '#0f766e' };
  private readonly PRIOL: Record<string, string> = { emerg: 'Emergency', high: 'High', med: 'Medium', routine: 'Routine' };
  private readonly STAGES = ['Draft', 'Pending Approval', 'Approved', 'Scheduled', 'In Progress', 'Completed', 'Cancelled'];
  private readonly STAGEC: Record<string, string> = { Draft: '#64748b', 'Pending Approval': '#e06c1f', Approved: '#1d4ed8', Scheduled: '#0f766e', 'In Progress': '#7c3aed', Completed: '#15803d', Cancelled: '#dc2626' };
  private readonly APPROVAL: Record<string, string> = { Draft: 'Not submitted', 'Pending Approval': 'Awaiting', Approved: 'Approved', Scheduled: 'Approved', 'In Progress': 'Approved', Completed: 'Approved', Cancelled: 'Rejected' };
  private readonly SURGEONS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao', 'Dr. V. Iyer'];
  private readonly ANESTH = ['Dr. K. Menon', 'Dr. T. Bose', 'Dr. M. Shah'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy'];
  private readonly PROCS = ['CABG', 'Knee Replacement', 'Craniotomy', 'Appendectomy', 'Cholecystectomy', 'Hip Replacement', 'C-Section', 'Spinal Fusion', 'Angioplasty', 'Thyroidectomy'];
  private readonly NAMES = ['Rahul Sharma', 'Anita Reddy', 'Vikram Nair', 'Priya Patel', 'Suresh Gupta', 'Meera Singh', 'Arjun Menon', 'Kavya Das', 'Deepak Joshi', 'Neha Verma', 'Rohan Iyer', 'Sana Khan'];
  private readonly PHOTOS = ['assets/img/avatar/avatar-01.jpg', 'assets/img/avatar/avatar-03.jpg', 'assets/img/avatar/avatar-02.jpg', 'assets/img/avatar/avatar-04.jpg', 'assets/img/avatar/avatar-06.jpg', 'assets/img/avatar/avatar-05.jpg', 'assets/img/avatar/avatar-07.jpg', 'assets/img/avatar/avatar-08.jpg', 'assets/img/avatar/avatar-11.jpg', 'assets/img/avatar/avatar-09.jpg', 'assets/img/avatar/avatar-12.jpg', 'assets/img/avatar/avatar-10.jpg'];
  private readonly ROOMS = ['OT-01', 'OT-02', 'OT-03', 'OT-04', 'Cardiac OT', 'Neuro OT'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly EQUIP = ['Anesthesia Machine', 'Surgical Lights', 'Electrocautery', 'C-Arm', 'Ventilator'];
  private readonly PRIOS: Booking['prio'][] = ['emerg', 'high', 'med', 'routine', 'routine', 'med', 'high', 'routine', 'med', 'high'];
  private readonly OTSTATES: [string, string][] = [['OT-01', 'avail'], ['OT-02', 'inuse'], ['OT-03', 'clean'], ['OT-04', 'reserved']];
  private readonly RSL: Record<string, string> = { avail: 'Available', reserved: 'Reserved', inuse: 'In Use', clean: 'Cleaning', maint: 'Maintenance' };
  private readonly RSC: Record<string, string> = { avail: '#15803d', reserved: '#1d4ed8', inuse: '#e06c1f', clean: '#b7791f', maint: '#64748b' };
  private readonly FROZEN_STAGE_IDX = [1, 3, 4, 2, 0, 5, 1, 3, 4, 2, 0, 5];
  private readonly FROZEN_DATE_OFF = [20, 21, 22, 23, 24, 25, 26, 27, 20, 21, 22, 23];
  private readonly FROZEN_RECBED = [3, 7, 12, 18, 5, 9, 14, 2, 16, 11, 6, 19];
  private readonly FROZEN_NEXT: Record<string, string> = { 'OT-02': '14:00', 'OT-03': '11:30', 'OT-04': '15:45' };
  private readonly FROZEN_INUSE_PROC = 'Knee Replacement';
  private readonly FROZEN_RESERVED_SURGEON = 'Dr. R. Nair';
  private readonly FROZEN_ETA = [8, 15, 20, 12];
  private readonly ACTIONS: [string, string, string][] = [
    ['View Booking', 'icon-eye', 'view'], ['Edit', 'icon-edit', 'edit'], ['Approve', 'icon-check', 'approve'], ['Reject', 'icon-x', 'reject'],
    ['Assign OT', 'icon-layout-grid', 'allocate'], ['Assign Team', 'icon-users', 'team'], ['Reschedule', 'icon-calendar-clock', 'edit'],
    ['sep', '', ''], ['Cancel', 'icon-x-circle', 'cancel'], ['Print', 'icon-printer', 'print'], ['Download PDF', 'icon-file-down', 'pdf'],
    ['Archive', 'icon-archive', 'archive'], ['Delete', 'icon-trash-2', 'delete'],
  ];
  private readonly SIMPLE: Record<string, string> = { print: 'Printing booking...', pdf: 'PDF downloaded', archive: 'Booking archived' };

  private seq = 12;
  private BOOKINGS: Booking[] = Array.from({ length: 12 }, (_, i) => this.mkBookingFrozen(i));
  private focusId = this.BOOKINGS[0].id;
  private sel = new Set<number>();
  private view: 'card' | 'timeline' | 'list' = 'card';
  private q = '';
  private fStatus = '';
  private fPrio = '';
  private MODALS: Record<string, { t: string; sub: string; ic: string; body: string; cta: string }> = {};
  private dragId: number | null = null;
  private clockTimer: any;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.buildModals();
    this.wireEvents();
    setTimeout(() => {
      this.byId('ob-skeleton')?.classList.add('hidden');
      this.byId('ob-content')?.classList.remove('hidden');
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

  private detailUrl(): string {
    return 'ot-booking-detail.html';
  }

  private clock(): void {
    const el = this.byId('ob-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  private mkBooking(stage?: string): Booking {
    const id = this.seq++;
    const st = stage || this.STAGES[Math.floor(Math.random() * 6)];
    return {
      id, code: 'BKG-' + (4300 + id), patient: this.NAMES[id % this.NAMES.length], mrn: 'MRN-' + (80500 + id),
      surgeon: this.SURGEONS[id % this.SURGEONS.length], anesth: this.ANESTH[id % this.ANESTH.length], nurse: this.NURSES[id % this.NURSES.length],
      proc: this.PROCS[id % this.PROCS.length], room: this.ROOMS[id % this.ROOMS.length], date: 'Jul ' + (20 + Math.floor(Math.random() * 8)), time: ['08:00', '10:30', '13:00', '15:30'][id % 4],
      dur: [1, 2, 2, 3][id % 4], prio: this.PRIOS[id % this.PRIOS.length], stage: st, av: this.AVC[id % this.AVC.length], photo: this.PHOTOS[id % this.PHOTOS.length],
      equip: [this.EQUIP[id % this.EQUIP.length], this.EQUIP[(id + 2) % this.EQUIP.length]], recBed: 'RB-' + String(1 + Math.floor(Math.random() * 20)).padStart(2, '0'),
    };
  }

  private mkBookingFrozen(id: number): Booking {
    return {
      id, code: 'BKG-' + (4300 + id), patient: this.NAMES[id % this.NAMES.length], mrn: 'MRN-' + (80500 + id),
      surgeon: this.SURGEONS[id % this.SURGEONS.length], anesth: this.ANESTH[id % this.ANESTH.length], nurse: this.NURSES[id % this.NURSES.length],
      proc: this.PROCS[id % this.PROCS.length], room: this.ROOMS[id % this.ROOMS.length], date: 'Jul ' + this.FROZEN_DATE_OFF[id], time: ['08:00', '10:30', '13:00', '15:30'][id % 4],
      dur: [1, 2, 2, 3][id % 4], prio: this.PRIOS[id % this.PRIOS.length], stage: this.STAGES[this.FROZEN_STAGE_IDX[id]], av: this.AVC[id % this.AVC.length], photo: this.PHOTOS[id % this.PHOTOS.length],
      equip: [this.EQUIP[id % this.EQUIP.length], this.EQUIP[(id + 2) % this.EQUIP.length]], recBed: 'RB-' + String(this.FROZEN_RECBED[id]).padStart(2, '0'),
    };
  }

  private filtered(): Booking[] {
    return this.BOOKINGS.filter((b) => {
      if (this.q) {
        const t = this.q.toLowerCase();
        if (!(b.patient.toLowerCase().includes(t) || b.code.toLowerCase().includes(t) || b.surgeon.toLowerCase().includes(t) || b.proc.toLowerCase().includes(t))) return false;
      }
      if (this.fStatus && b.stage !== this.fStatus) return false;
      if (this.fPrio && b.prio !== this.fPrio) return false;
      return true;
    });
  }

  /* ---------------- hero counts ---------------- */

  private updateCounts(): void {
    const pend = this.BOOKINGS.filter((b) => b.stage === 'Pending Approval').length;
    const pendEl = this.byId('ob-h-pend');
    if (pendEl) pendEl.textContent = String(pend);
    const pend2El = this.byId('ob-h-pend2');
    if (pend2El) pend2El.textContent = String(pend);
    const todayEl = this.byId('ob-h-today');
    if (todayEl) todayEl.textContent = String(this.BOOKINGS.filter((b) => b.stage !== 'Cancelled').length);
    const emergEl = this.byId('ob-h-emerg');
    if (emergEl) emergEl.textContent = String(this.BOOKINGS.filter((b) => b.prio === 'emerg').length);
    const availEl = this.byId('ob-h-avail');
    if (availEl) availEl.textContent = String(this.OTSTATES.filter((o) => o[1] === 'avail').length);
  }

  /* ---------------- booking board ---------------- */

  private bookingCard(b: Booking): string {
    return `<div class="ob-book pr-${b.prio}" data-book="${b.id}">
                <div class="flex items-center gap-2 mb-2">
                    <label onclick="event.stopPropagation()" class="flex items-center"><input type="checkbox" data-sel="${b.id}" ${this.sel.has(b.id) ? 'checked' : ''} class="accent-[var(--ob-c)]"></label>
                    <a href="${this.detailUrl()}" onclick="event.stopPropagation()" class="text-[11px] font-bold ob-mut hover:underline">${b.code}</a>
                    <span class="prpill ob-chip ml-auto">${b.prio === 'emerg' ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}${this.PRIOL[b.prio]}</span>
                    <button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-more-vertical text-sm"></i></button>
                </div>
                <div class="flex items-center gap-2.5">
                    <img class="ob-avatar flex-none" style="width:36px;height:36px" src="${b.photo}" alt="${b.patient}">
                    <div class="min-w-0 flex-1"><p class="text-sm font-semibold ob-head truncate">${b.patient}</p><p class="text-[11px] ob-mut truncate">${b.mrn} · ${b.proc}</p></div>
                </div>
                <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5 text-[11px]">
                    <div class="flex items-center gap-1 ob-mut"><i class="icon-stethoscope text-[11px]"></i> ${b.surgeon.split('. ')[1] || b.surgeon}</div>
                    <div class="flex items-center gap-1 ob-mut"><i class="icon-layout-grid text-[11px]"></i> ${b.room}</div>
                    <div class="flex items-center gap-1 ob-mut"><i class="icon-calendar text-[11px]"></i> ${b.date} · ${b.time}</div>
                    <div class="flex items-center gap-1 ob-mut"><i class="icon-clock text-[11px]"></i> ~${b.dur}h</div>
                </div>
                <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t" style="border-color:var(--ob-border)">
                    <span class="ob-chip" style="background:color-mix(in srgb,${this.STAGEC[b.stage]} 13%,transparent);color:${this.STAGEC[b.stage]}"><span class="ob-dot" style="background:${this.STAGEC[b.stage]}"></span> ${b.stage}</span>
                    <span class="text-[10px] ob-mut">${b.stage === 'Pending Approval' ? '<i class="icon-clock text-[10px]"></i> Awaiting approval' : '<i class="icon-shield-check text-[10px]"></i> ' + this.APPROVAL[b.stage]}</span>
                </div>
                ${b.stage === 'Pending Approval' ? `<div class="flex gap-1.5 mt-2"><button data-quick-approve="${b.id}" onclick="event.stopPropagation()" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-check text-[11px]" style="color:#15803d"></i> Approve</button><button data-quick-reject="${b.id}" onclick="event.stopPropagation()" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-x text-[11px]" style="color:#dc2626"></i> Reject</button></div>` : ''}
            </div>`;
  }

  private renderBoard(): void {
    const list = this.filtered();
    const cnt = this.byId('ob-count');
    if (cnt) cnt.textContent = String(list.length);
    const host = this.byId('ob-board');
    if (!host) return;

    if (this.view === 'card') {
      host.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">${list.map((b) => this.bookingCard(b)).join('') || '<p class="text-sm ob-mut text-center py-6 col-span-3">No bookings found.</p>'}</div>`;
    } else if (this.view === 'timeline') {
      const byDate: Record<string, Booking[]> = {};
      list.forEach((b) => { (byDate[b.date] = byDate[b.date] || []).push(b); });
      host.innerHTML = `<div class="ob-card p-5"><div class="ob-tlv">${Object.keys(byDate).sort().map((d) => `<div class="ob-tlv-item" style="--pv:var(--ob-accent)"><p class="text-sm font-bold ob-head mb-2">${d}</p><div class="space-y-2">${byDate[d].sort((a, b) => a.time.localeCompare(b.time)).map((b) => `<div class="ob-panel p-2.5 flex items-center gap-2.5 pr-${b.prio}" data-book="${b.id}" style="cursor:pointer;border-left:3px solid ${this.PRIOC[b.prio]}"><span class="text-[11px] font-bold ob-mut w-12">${b.time}</span><img class="ob-avatar flex-none" style="width:30px;height:30px" src="${b.photo}" alt="${b.patient}"><div class="min-w-0 flex-1"><p class="text-sm font-semibold ob-head truncate">${b.proc} · ${b.patient}</p><p class="text-[10px] ob-mut">${b.room} · ${b.surgeon}</p></div><span class="ob-chip" style="background:color-mix(in srgb,${this.STAGEC[b.stage]} 13%,transparent);color:${this.STAGEC[b.stage]}">${b.stage}</span></div>`).join('')}</div></div>`).join('') || '<p class="text-sm ob-mut text-center py-4">No bookings.</p>'}</div></div>`;
    } else {
      host.innerHTML = `<div class="ob-card overflow-hidden"><div class="overflow-x-auto"><table class="ob-tbl"><thead><tr><th></th><th>Booking</th><th>Patient</th><th>Surgeon</th><th>OT</th><th>Date</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>${list.map((b) => `<tr data-book="${b.id}" style="cursor:pointer"><td><input type="checkbox" data-sel="${b.id}" ${this.sel.has(b.id) ? 'checked' : ''} class="accent-[var(--ob-c)]" onclick="event.stopPropagation()"></td><td class="font-semibold"><a href="${this.detailUrl()}" onclick="event.stopPropagation()" class="hover:underline">${b.code}</a></td><td>${b.patient}</td><td>${b.surgeon}</td><td>${b.room}</td><td>${b.date} ${b.time}</td><td><span class="ob-chip" style="background:color-mix(in srgb,${this.PRIOC[b.prio]} 13%,transparent);color:${this.PRIOC[b.prio]}">${this.PRIOL[b.prio]}</span></td><td><span class="ob-chip" style="background:color-mix(in srgb,${this.STAGEC[b.stage]} 13%,transparent);color:${this.STAGEC[b.stage]}">${b.stage}</span></td><td class="text-right"><button data-menu="${b.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--ob-hover)] inline-flex items-center justify-center ob-mut"><i class="icon-more-vertical"></i></button></td></tr>`).join('') || '<tr><td colspan="9" class="text-center py-6 ob-mut">No bookings found.</td></tr>'}</tbody></table></div></div>`;
    }
  }

  /* ---------------- OT availability ---------------- */

  private renderOtRooms(): void {
    const legend = this.byId('ob-otlegend');
    if (legend) legend.innerHTML = Object.keys(this.RSL).map((k) => `<span class="flex items-center gap-1.5 ob-mut"><span class="ob-dot" style="background:${this.RSC[k]}"></span>${this.RSL[k]}</span>`).join('');
    const host = this.byId('ob-otrooms');
    if (!host) return;
    host.innerHTML = this.OTSTATES.map(([r, st]) => {
      const next = st === 'avail' ? 'Now' : this.FROZEN_NEXT[r];
      return `<div class="ob-otc rs-${st}">
                <div class="flex items-center justify-between mb-1.5"><span class="text-sm font-bold ob-head">${r}</span><span class="ob-chip" style="background:color-mix(in srgb,${this.RSC[st]} 13%,transparent);color:${this.RSC[st]}">${this.RSL[st]}</span></div>
                <p class="text-[11px] ob-mut">${st === 'inuse' ? 'Current: ' + this.FROZEN_INUSE_PROC : st === 'clean' ? 'Turnover in progress' : st === 'maint' ? 'Under service' : st === 'reserved' ? 'Held for ' + this.FROZEN_RESERVED_SURGEON.split('. ')[1] : 'Ready for booking'}</p>
                <div class="flex items-center justify-between mt-2 text-[11px]"><span class="ob-mut">Next available</span><span class="font-semibold" style="color:${this.RSC[st]}">${next}</span></div>
                <button data-modal="allocate" class="ob-btn ob-btn-ghost w-full justify-center mt-2 !py-1 text-xs"><i class="icon-calendar-plus"></i> Book</button>
            </div>`;
    }).join('');
  }

  /* ---------------- workflow kanban ---------------- */

  private renderKanban(): void {
    const host = this.byId('ob-kanban');
    if (!host) return;
    host.innerHTML = this.STAGES.map((st) => {
      const items = this.BOOKINGS.filter((b) => b.stage === st);
      return `<div class="ob-kcol p-2.5" data-kcol="${st}">
                <div class="flex items-center justify-between mb-2 px-1"><span class="text-xs font-bold ob-head flex items-center gap-1.5"><span class="ob-dot" style="background:${this.STAGEC[st]}"></span> ${st}</span><span class="ob-npill">${items.length}</span></div>
                <div class="space-y-2 min-h-[40px]" data-kbody="${st}">
                ${items.slice(0, 5).map((b) => `<div class="ob-ktask" draggable="true" data-task="${b.id}" style="border-left:3px solid ${this.PRIOC[b.prio]}">
                    <div class="flex items-center justify-between"><span class="text-[10px] font-bold ob-mut">${b.code}</span><span class="ob-chip" style="background:color-mix(in srgb,${this.PRIOC[b.prio]} 12%,transparent);color:${this.PRIOC[b.prio]}">${this.PRIOL[b.prio]}</span></div>
                    <p class="text-xs font-semibold ob-head mt-1 leading-tight">${b.proc}</p>
                    <p class="text-[10px] ob-mut mt-0.5">${b.patient} · ${b.room}</p>
                    <div class="flex items-center justify-between text-[10px] ob-mut mt-1"><span><i class="icon-calendar"></i> ${b.date}</span><i class="icon-grip-vertical"></i></div>
                </div>`).join('') || `<p class="text-[11px] ob-mut text-center py-2">Drop here</p>`}
                </div></div>`;
    }).join('');
  }

  /* ---------------- emergency panel ---------------- */

  private renderEmergency(): void {
    const list = this.BOOKINGS.filter((b) => b.prio === 'emerg').slice(0, 4);
    const host = this.byId('ob-emergency');
    if (!host) return;
    host.innerHTML = list.map((b, i) => `<div class="ob-panel p-3" style="border-left:3px solid #dc2626">
                <div class="flex items-center justify-between mb-1"><span class="ob-chip" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><span class="ob-dot ob-live" style="background:#dc2626"></span> ${this.PRIOL[b.prio]}</span><span class="text-[11px] ob-mut">ETA ${this.FROZEN_ETA[i % this.FROZEN_ETA.length]} min</span></div>
                <p class="text-sm font-semibold ob-head">${b.proc}</p><p class="text-[11px] ob-mut">${b.patient} · Suggested: ${b.room} · ${b.surgeon}</p>
                <div class="flex gap-1.5 mt-2"><button data-quick-approve="${b.id}" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-check text-[11px]" style="color:#15803d"></i> Approve</button><button data-modal="allocate" class="ob-npill hover:bg-[var(--ob-hover)]"><i class="icon-layout-grid text-[11px]"></i> Assign OT</button></div>
            </div>`).join('');
  }

  /* ---------------- planning summary ---------------- */

  private renderPlanning(): void {
    const b = this.BOOKINGS.find((x) => x.id === this.focusId) || this.BOOKINGS[0];
    if (!b) {
      const host = this.byId('ob-planning');
      if (host) host.innerHTML = '<p class="ob-mut text-sm">No booking selected.</p>';
      return;
    }
    this.focusId = b.id;
    const idEl = this.byId('ob-plan-id');
    if (idEl) idEl.textContent = b.code;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-1 border-b" style="border-color:var(--ob-border)"><span class="ob-mut">${k}</span><span class="font-medium ob-head">${v}</span></div>`;
    const host = this.byId('ob-planning');
    if (host) {
      host.innerHTML = `
                <div class="flex items-center gap-3 mb-3">
                    <img class="ob-avatar flex-none" style="width:42px;height:42px" src="${b.photo}" alt="${b.patient}">
                    <div class="min-w-0 flex-1"><p class="font-bold ob-head">${b.patient}</p><p class="text-[11px] ob-mut">${b.mrn} · ${b.proc}</p></div>
                    <span class="ob-chip pr-${b.prio}" style="background:color-mix(in srgb,${this.PRIOC[b.prio]} 13%,transparent);color:${this.PRIOC[b.prio]}">${this.PRIOL[b.prio]}</span>
                </div>
                <div class="grid sm:grid-cols-2 gap-x-4">
                    <div>${row('Procedure', b.proc)}${row('Surgeon', b.surgeon)}${row('Anesthesiologist', b.anesth)}${row('OT Team', b.nurse + ' +2')}${row('Priority', this.PRIOL[b.prio])}${row('MRN', b.mrn)}</div>
                    <div>${row('OT Room', b.room)}${row('Date / Time', b.date + ' · ' + b.time)}${row('Est. Duration', b.dur + 'h')}${row('Status', b.stage)}${row('Recovery Bed', b.recBed)}${row('Equipment', b.equip.join(', '))}</div>
                </div>
                <div class="flex flex-wrap gap-2 mt-3">
                    ${b.stage === 'Pending Approval' ? `<button data-modal="approve" class="ob-btn ob-btn-primary"><i class="icon-check"></i> Approve</button><button data-modal="reject" class="ob-btn ob-btn-ghost"><i class="icon-x"></i> Reject</button>` : `<button data-modal="edit" class="ob-btn ob-btn-primary"><i class="icon-edit"></i> Edit Booking</button>`}
                    <button data-modal="team" class="ob-btn ob-btn-ghost"><i class="icon-users"></i> Assign Team</button>
                    <button data-open-drawer="${b.id}" class="ob-btn ob-btn-ghost"><i class="icon-eye"></i> Details</button>
                </div>`;
    }
  }

  /* ---------------- drawer ---------------- */

  private drawerHost(): HTMLElement {
    let d = this.byId('ob-drawer');
    if (!d) {
      d = this.document.createElement('div');
      d.id = 'ob-drawer';
      d.className = 'ob-drawer';
      this.document.body.appendChild(d);
    }
    return d;
  }

  private openDrawer(id: number): void {
    const b = this.BOOKINGS.find((x) => x.id === id);
    if (!b) return;
    const c = this.PRIOC[b.prio];
    const box = (t: string, ic: string, body: string) => `<div class="ob-panel p-3"><p class="text-[11px] font-bold ob-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} ob-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string | number) => `<div class="flex justify-between text-xs py-0.5"><span class="ob-mut">${k}</span><span class="font-medium ob-head">${v}</span></div>`;
    const steps = this.STAGES.slice(0, 6);
    const ci = steps.indexOf(b.stage);
    const host = this.drawerHost();
    host.innerHTML = `
              <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ob-elev);border-color:var(--ob-border)">
                <div class="flex items-center gap-3"><span class="ob-iconbadge w-11 h-11 flex-none" style="color:${c};background:color-mix(in srgb,${c} 12%,transparent)"><i class="icon-clipboard-check text-lg"></i></span><div><p class="font-bold ob-head">${b.code}</p><p class="text-[11px] ob-mut">${b.proc} · ${b.room}</p></div></div>
                <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-x"></i></button>
              </div>
              <div class="p-4 space-y-3">
                <div class="flex items-center gap-2 flex-wrap"><span class="ob-chip" style="background:color-mix(in srgb,${c} 14%,transparent);color:${c}">${this.PRIOL[b.prio]}</span><span class="ob-chip" style="background:color-mix(in srgb,${this.STAGEC[b.stage]} 13%,transparent);color:${this.STAGEC[b.stage]}">${b.stage}</span><span class="ob-npill"><i class="icon-shield-check text-[11px]"></i> ${this.APPROVAL[b.stage]}</span></div>
                <div class="ob-panel p-3"><p class="text-[11px] font-bold ob-mut uppercase tracking-wide mb-2">Booking Progress</p><div class="flex items-center gap-1">${steps.map((s, i) => `<div class="flex-1"><div class="ob-stab"><span style="width:${i <= ci ? 100 : 0}%;background:${i < ci ? '#15803d' : i === ci ? this.STAGEC[b.stage] : 'var(--ob-track)'}"></span></div><p class="text-[8px] ob-mut mt-1 text-center truncate">${s.split(' ')[0]}</p></div>`).join('')}</div></div>
                ${box('Patient', 'icon-user', `<div class="flex items-center gap-2 mb-1.5"><img class="ob-avatar" style="width:34px;height:34px" src="${b.photo}" alt="${b.patient}"><div><p class="text-sm font-semibold ob-head">${b.patient}</p><p class="text-[11px] ob-mut">${b.mrn}</p></div></div>`)}
                ${box('Booking Details', 'icon-clipboard-list', row('Procedure', b.proc) + row('Date / Time', b.date + ' · ' + b.time) + row('Duration', b.dur + 'h') + row('Priority', this.PRIOL[b.prio]))}
                ${box('Resources', 'icon-boxes', row('OT Room', b.room) + row('Surgeon', b.surgeon) + row('Anesthesiologist', b.anesth) + row('OT Nurse', b.nurse) + row('Recovery Bed', b.recBed))}
                ${box('Equipment', 'icon-cpu', '<div class="flex flex-wrap gap-1">' + b.equip.map((x) => `<span class="ob-npill">${x}</span>`).join('') + '</div>')}
                <div class="grid grid-cols-2 gap-2">
                    ${b.stage === 'Pending Approval' ? `<button data-modal="approve" class="ob-btn ob-btn-primary justify-center"><i class="icon-check"></i> Approve</button><button data-modal="reject" class="ob-btn ob-btn-ghost justify-center"><i class="icon-x"></i> Reject</button>` : `<button data-modal="edit" class="ob-btn ob-btn-primary justify-center"><i class="icon-edit"></i> Edit</button><button data-modal="allocate" class="ob-btn ob-btn-ghost justify-center"><i class="icon-layout-grid"></i> Assign OT</button>`}
                    <button data-modal="team" class="ob-btn ob-btn-ghost justify-center"><i class="icon-users"></i> Team</button>
                    <button data-del-book="${b.id}" class="ob-btn ob-btn-ghost justify-center"><i class="icon-x-circle"></i> Cancel</button>
                </div>
              </div>`;
    host.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeDrawer(): void {
    this.byId('ob-drawer')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  /* ---------------- menu ---------------- */

  private menuHost(): HTMLElement {
    let m = this.byId('ob-menuhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'ob-menuhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="ob-menu" id="ob-openmenu">${this.ACTIONS.map((a) => (a[0] === 'sep' ? '<div class="ob-menu-sep"></div>' : `<button data-action="${a[2]}" data-bid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`)).join('')}</div>`;
    const m = this.byId('ob-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('ob-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ---------------- modals ---------------- */

  private buildModals(): void {
    const fld = (l: string, el: string) => `<div><label class="ob-formlabel">${l}</label>${el}</div>`;
    const inp = (ph?: string) => `<input class="ob-in mt-1" placeholder="${ph || ''}">`;
    const selE = (o: string[]) => `<select class="ob-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
    const drop = (t: string) => `<div class="ob-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ob-hover)]"><i class="icon-cloud-upload text-3xl ob-mut"></i><p class="text-sm font-semibold mt-1 ob-head">${t}</p></div>`;
    this.MODALS = {
      new: { t: 'New Booking', sub: 'Reserve an operation theater', ic: 'icon-plus', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN', inp('Search...'))}${fld('Procedure', selE(this.PROCS))}${fld('Surgeon', selE(this.SURGEONS))}${fld('OT Room', selE(this.ROOMS))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="ob-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Est. Duration (h)', inp('2'))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Priority', selE(['Routine', 'Medium', 'High', 'Emergency']))}</div>`, cta: 'Create Booking' },
      edit: { t: 'Edit Booking', sub: 'Update the reservation', ic: 'icon-edit', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room', selE(this.ROOMS))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="ob-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Duration (h)', inp('2'))}${fld('Priority', selE(['Routine', 'Medium', 'High', 'Emergency']))}</div>`, cta: 'Save Changes' },
      approve: { t: 'Approve Booking', sub: 'Grant OT approval', ic: 'icon-check', body: `<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-shield-check"></i> Confirms OT, team &amp; equipment availability.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Approver', selE(['OT Coordinator', 'Dept. Head', 'Chief Surgeon']))}${fld('Confirm OT', selE(this.ROOMS))}</div><div class="mt-3">${fld('Notes', `<textarea class="ob-in mt-1" rows="2" placeholder="Approval notes..."></textarea>`)}</div>`, cta: 'Approve Booking' },
      reject: { t: 'Reject Booking', sub: 'Decline with a reason', ic: 'icon-x', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Reason', selE(['OT unavailable', 'Surgeon conflict', 'Equipment shortage', 'Incomplete pre-op', 'Reschedule needed']))}${fld('Notify', selE(['Surgeon', 'Coordinator', 'Both']))}</div><div class="mt-3">${fld('Notes', `<textarea class="ob-in mt-1" rows="2" placeholder="Rejection notes..."></textarea>`)}</div>`, cta: 'Reject Booking' },
      emergency: { t: 'Emergency Booking', sub: 'Insert an urgent reservation', ic: 'icon-alert-triangle', body: `<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Auto-approves &amp; grabs the nearest free OT.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown', inp('Name or "Unknown"'))}${fld('Procedure', selE(this.PROCS))}${fld('OT', selE(['Auto — next free', 'OT-01', 'OT-02']))}${fld('Surgeon On-call', selE(this.SURGEONS))}</div>`, cta: 'Book Emergency' },
      allocate: { t: 'Assign OT', sub: 'Allocate a theater to the booking', ic: 'icon-layout-grid', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Booking', inp('BKG-...'))}${fld('OT Room', selE(this.ROOMS))}${fld('Slot', selE(['08:00', '10:30', '13:00', '15:30']))}${fld('Recovery Bed', selE(['Auto', 'RB-01', 'RB-02']))}</div>`, cta: 'Assign OT' },
      team: { t: 'Assign Team', sub: 'Compose the surgical team', ic: 'icon-users', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Lead Surgeon', selE(this.SURGEONS))}${fld('Assistant', selE(this.SURGEONS))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Scrub Nurse', selE(this.NURSES))}${fld('Circulating Nurse', selE(this.NURSES))}${fld('Technician', selE(['Tech A', 'Tech B']))}</div>`, cta: 'Assign Team' },
      import: { t: 'Import', sub: 'Bulk-load bookings', ic: 'icon-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Booking Sheet'].map((f) => `<span class="ob-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--ob-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 12 bookings · 1 needs approval</div>`, cta: 'Import' },
      export: { t: 'Export', sub: 'Export bookings', ic: 'icon-download', body: `<p class="text-xs ob-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV', 'Excel', 'PDF', 'Print', 'Booking Report', 'Approval Report', 'OT Utilization', 'Selected', 'All Records'].map((f) => `<button data-expfmt="${f}" class="ob-btn ob-btn-ghost justify-center">${f}</button>`).join('')}</div>`, cta: 'Export' },
    };
  }

  private modalHost(): HTMLElement {
    let m = this.byId('ob-modalhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'ob-modalhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    this.document.body.style.overflow = 'hidden';
    const host = this.modalHost();
    host.innerHTML = `<div class="ob-modal-wrap open"><div class="ob-modal-bg" data-close></div><div class="ob-modal">
            <div class="ob-modal-head"><span class="ob-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ob-head leading-tight">${m.t}</h3><p class="text-[11px] ob-mut">${m.sub || ''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ob-hover)] flex items-center justify-center ob-mut"><i class="icon-x"></i></button></div>
            <div class="ob-modal-body">${m.body}</div>
            <div class="ob-modal-foot"><button data-close class="ob-btn ob-btn-ghost">Cancel</button><button data-modalok="${key}" class="ob-btn ${key === 'reject' ? 'ob-btn-danger' : 'ob-btn-primary'}"><i class="${m.ic}"></i> ${m.cta}</button></div>
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
    host.innerHTML = `<div class="ob-modal-wrap open"><div class="ob-modal-bg" data-close></div><div class="ob-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ob-head">Confirm</h3><p class="text-xs ob-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="ob-btn ob-btn-ghost flex-1 justify-center">Cancel</button><button id="ob-delok" class="ob-btn ob-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`;
    const btn = this.byId('ob-delok');
    if (btn) btn.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('ob-modalhost');
    if (host) host.innerHTML = '';
    if (!this.byId('ob-drawer')?.classList.contains('open')) this.document.body.style.overflow = '';
  }

  /* ---------------- bulk / refresh ---------------- */

  private updateBulk(): void {
    const cnt = this.byId('ob-selcount');
    if (cnt) cnt.textContent = String(this.sel.size);
    this.qsa<HTMLElement>('.ob-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private refreshAll(): void {
    this.renderBoard();
    this.renderKanban();
    this.renderEmergency();
    this.renderPlanning();
    this.updateCounts();
  }

  private setStage(id: number, st: string): void {
    const b = this.BOOKINGS.find((x) => x.id === id);
    if (b) b.stage = st;
  }

  /* ---------------- drag & drop (kanban) ---------------- */

  private wireDragDrop(): void {
    this.document.addEventListener('dragstart', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) {
        this.dragId = +t.dataset['task']!;
        t.classList.add('drag');
      }
    });
    this.document.addEventListener('dragend', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-task]') as HTMLElement | null;
      if (t) t.classList.remove('drag');
      this.qsa('.ob-kcol').forEach((c) => c.classList.remove('over'));
    });
    this.document.addEventListener('dragover', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c) {
        e.preventDefault();
        this.qsa('.ob-kcol').forEach((x) => x.classList.toggle('over', x === c));
      }
    });
    this.document.addEventListener('drop', (e: Event) => {
      const c = (e.target as HTMLElement).closest('[data-kcol]') as HTMLElement | null;
      if (c && this.dragId != null) {
        e.preventDefault();
        const b = this.BOOKINGS.find((x) => x.id === this.dragId);
        if (b) {
          b.stage = c.dataset['kcol']!;
          this.refreshAll();
          this.toast(b.code + ' → ' + b.stage, 'icon-git-branch');
        }
        this.dragId = null;
      }
    });
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.wireDragDrop();

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      const vw = target.closest('[data-vw]') as HTMLElement | null;
      if (vw) {
        this.view = vw.dataset['vw'] as any;
        this.qsa('#ob-viewtabs button').forEach((x) => x.classList.toggle('on', x === vw));
        this.renderBoard();
        return;
      }
      const qa = target.closest('[data-quick-approve]') as HTMLElement | null;
      if (qa) {
        this.setStage(+qa.dataset['quickApprove']!, 'Approved');
        this.refreshAll();
        this.toast('Booking approved', 'icon-check');
        return;
      }
      const qr = target.closest('[data-quick-reject]') as HTMLElement | null;
      if (qr) {
        this.setStage(+qr.dataset['quickReject']!, 'Cancelled');
        this.refreshAll();
        this.toast('Booking rejected', 'icon-x');
        return;
      }
      const openDr = target.closest('[data-open-drawer]') as HTMLElement | null;
      if (openDr) {
        this.openDrawer(+openDr.dataset['openDrawer']!);
        return;
      }
      const delBook = target.closest('[data-del-book]') as HTMLElement | null;
      if (delBook) {
        const id = +delBook.dataset['delBook']!;
        this.openDelete('Cancel this booking?', () => {
          this.setStage(id, 'Cancelled');
          this.closeDrawer();
          this.refreshAll();
          this.toast('Booking cancelled', 'icon-x-circle');
        });
        return;
      }

      const t = target.closest('[data-book],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.ob-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['book'] !== undefined) {
        this.focusId = +t.dataset['book'];
        this.renderPlanning();
        this.openDrawer(this.focusId);
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        const r = t.getBoundingClientRect();
        this.openMenu(+t.dataset['menu'], r.left - 185, r.bottom + 4);
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action']!;
        const id = +t.dataset['bid']!;
        this.closeMenu();
        this.focusId = id;
        const b = this.BOOKINGS.find((x) => x.id === id);
        if (a === 'view') {
          this.openDrawer(id);
        } else if (a === 'approve') {
          if (b && b.stage === 'Pending Approval') {
            this.setStage(id, 'Approved');
            this.refreshAll();
            this.toast('Booking approved', 'icon-check');
          } else {
            this.openModal('approve');
          }
        } else if (a === 'cancel') {
          this.openDelete('Cancel this booking?', () => {
            this.setStage(id, 'Cancelled');
            this.refreshAll();
            this.toast('Booking cancelled', 'icon-x-circle');
          });
        } else if (this.MODALS[a]) {
          this.openModal(a);
        } else if (a === 'delete') {
          this.openDelete('Delete this booking record?', () => {
            this.BOOKINGS = this.BOOKINGS.filter((x) => x.id !== id);
            this.sel.delete(id);
            this.refreshAll();
            this.toast('Booking deleted', 'icon-trash-2');
          });
        } else if (this.SIMPLE[a]) {
          this.toast(this.SIMPLE[a]);
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal']!);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        const k = t.dataset['modalok']!;
        const b = this.BOOKINGS.find((x) => x.id === this.focusId);
        if (k === 'new' || k === 'emergency') {
          const nb = this.mkBooking(k === 'emergency' ? 'Approved' : 'Pending Approval');
          if (k === 'emergency') nb.prio = 'emerg';
          this.BOOKINGS.unshift(nb);
          this.refreshAll();
        } else if (k === 'approve' && b) {
          this.setStage(b.id, 'Approved');
          this.refreshAll();
        } else if (k === 'reject' && b) {
          this.setStage(b.id, 'Cancelled');
          this.refreshAll();
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
      if (t.dataset['bulk'] !== undefined) {
        const bk = t.dataset['bulk']!;
        if (bk === 'delete') {
          this.openDelete(`Delete ${this.sel.size} selected booking(s)?`, () => {
            this.BOOKINGS = this.BOOKINGS.filter((b) => !this.sel.has(b.id));
            this.sel.clear();
            this.refreshAll();
            this.updateBulk();
            this.toast('Bookings deleted', 'icon-trash-2');
          });
        } else if (bk === 'approve') {
          this.BOOKINGS.forEach((b) => { if (this.sel.has(b.id) && b.stage === 'Pending Approval') b.stage = 'Approved'; });
          this.sel.clear();
          this.refreshAll();
          this.updateBulk();
          this.toast('Bookings approved', 'icon-check');
        } else {
          const labels: Record<string, string> = { allocate: 'OT assigned', team: 'Team assigned', export: 'Exported', print: 'Printing', archive: 'Archived' };
          this.toast(labels[bk] + ' · ' + this.sel.size + ' bookings');
          if (bk === 'archive') {
            this.sel.clear();
            this.refreshAll();
            this.updateBulk();
          }
        }
        return;
      }
    });

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.dataset['sel'] !== undefined) {
        const id = +target.dataset['sel'];
        target.checked ? this.sel.add(id) : this.sel.delete(id);
        this.updateBulk();
        return;
      }
      if (target.id === 'ob-fstatus') {
        this.fStatus = target.value;
        this.renderBoard();
      }
      if (target.id === 'ob-fprio') {
        this.fPrio = target.value;
        this.renderBoard();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'ob-search') {
        this.q = target.value;
        this.renderBoard();
      }
    });
  }
}
