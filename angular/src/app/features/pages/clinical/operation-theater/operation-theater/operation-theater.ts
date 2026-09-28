import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const flatpickr: any;

interface OtRoom {
  id: number;
  room: string;
  type: string;
  status: string;
  sterile: string;
  equip: string;
  emergency: boolean;
  av: string;
  patient?: string;
  mrn?: string;
  proc?: string;
  surgeon?: string;
  anesth?: string;
  nurse?: string;
  start?: string;
  eta?: string;
  progress?: number;
  stage?: number;
  prio?: string;
  dur?: number;
}

interface SchedItem {
  id: number;
  room: string;
  patient?: string;
  proc: string;
  surgeon?: string;
  startH?: number;
  dur?: number;
  prio?: string;
  status?: string;
  av?: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "operation-theater".
 */
@Component({
  imports: [],
  selector: 'app-operation-theater',
  styleUrl: './operation-theater.css',
  templateUrl: './operation-theater.html',
})
export class OperationTheater implements AfterViewInit {
  private readonly STLABEL: Record<string, string> = { avail: 'Available', prep: 'Preparing', prog: 'In Surgery', emerg: 'Emergency', clean: 'Cleaning', maint: 'Maintenance' };
  private readonly STC: Record<string, string> = { avail: '#15803d', prep: '#1d4ed8', prog: '#e06c1f', emerg: '#dc2626', clean: '#b7791f', maint: '#64748b' };
  private readonly SURGEONS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao', 'Dr. V. Iyer'];
  private readonly ANESTH = ['Dr. K. Menon', 'Dr. T. Bose', 'Dr. M. Shah'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy'];
  private readonly PROCS = ['Coronary Bypass (CABG)', 'Total Knee Replacement', 'Craniotomy', 'Appendectomy', 'Cholecystectomy', 'Hip Replacement', 'Cataract Surgery', 'C-Section', 'Spinal Fusion', 'Hernia Repair', 'Angioplasty', 'Thyroidectomy'];
  private readonly NAMES = ['Rahul Sharma', 'Anita Reddy', 'Vikram Nair', 'Priya Patel', 'Suresh Gupta', 'Meera Singh', 'Arjun Menon', 'Kavya Das', 'Deepak Joshi', 'Neha Verma', 'Rohan Iyer', 'Sana Khan'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly STAGES = ['Patient Prepared', 'Shifted to OT', 'Anesthesia Started', 'Surgery Started', 'Critical Procedure', 'Closure', 'Recovery', 'Shift to ICU / Ward'];
  private readonly ROOMS: [string, string, string][] = [
    ['OT-01', 'General', 'avail'],
    ['OT-02', 'General', 'prep'],
    ['OT-03', 'General', 'prog'],
    ['OT-04', 'General', 'clean'],
    ['Emergency OT', 'Emergency', 'emerg'],
    ['Cardiac OT', 'Cardiac', 'prog'],
    ['Orthopedic OT', 'Orthopedic', 'prog'],
    ['Neuro OT', 'Neuro', 'maint'],
  ];

  private readonly FROZEN_PROGRESS: Record<number, number> = { 2: 55, 4: 68, 5: 42, 6: 77 };
  private readonly FROZEN_STAGE: Record<number, number> = { 2: 4, 4: 5, 5: 3, 6: 5 };
  private readonly FROZEN_DUR: Record<number, number> = { 1: 95, 2: 140, 4: 180, 5: 200, 6: 110 };
  private readonly FROZEN_SCHED_DUR = [1, 2, 1, 3, 2, 1, 2, 3];
  private readonly FROZEN_MAINT = [12, 15, 10, 18, 14, 11, 16, 13];
  private readonly FROZEN_ACT_AGO = [3, 9, 14, 22, 28, 35, 44, 52];

  private OTS: OtRoom[] = [];
  private focusId = 0;
  private sel = new Set<number>();
  private schedView: 'timeline' | 'daily' | 'weekly' | 'availability' = 'timeline';
  private SCHED: SchedItem[] = [];

  private readonly ACTIONS: [string, string, string][] = [
    ['View Surgery', 'icon-eye', 'view'],
    ['Edit Surgery', 'icon-edit', 'schedule'],
    ['Assign OT', 'icon-layout-grid', 'allocate'],
    ['Assign Surgeon', 'icon-stethoscope', 'surgeon'],
    ['Assign Nurse', 'icon-user-check', 'nurse'],
    ['Assign Anesthesiologist', 'icon-syringe', 'anesth'],
    ['View Patient', 'icon-user', 'patient'],
    ['Medical History', 'icon-history', 'history'],
    ['sep', '', ''],
    ['Start Surgery', 'icon-play', 'start'],
    ['Pause Surgery', 'icon-pause', 'pause'],
    ['Complete Surgery', 'icon-circle-check', 'complete'],
    ['Transfer to Recovery', 'icon-heart-pulse', 'recovery'],
    ['sep', '', ''],
    ['Print Report', 'icon-printer', 'print'],
    ['Download PDF', 'icon-file-down', 'pdf'],
    ['Archive', 'icon-archive', 'archive'],
    ['Delete', 'icon-trash-2', 'delete'],
  ];

  private MODALS: Record<string, { t: string; sub: string; ic: string; body: string; cta: string }> = {};
  private readonly SIMPLE: Record<string, string> = { patient: 'Loading patient...', history: 'Opening history...', start: 'Surgery started', recovery: 'Transferred to recovery', print: 'Printing report...', pdf: 'PDF downloaded', archive: 'Record archived' };

  private tickTimer: any;
  private clockTimer: any;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.buildOTS();
    this.focusId = this.OTS.find((o) => o.status === 'prog')?.id ?? 0;
    this.buildSchedule();
    this.buildModals();
    this.wireEvents();

    setTimeout(() => {
      const sk = this.byId('ot-skeleton');
      const ct = this.byId('ot-content');
      if (sk) sk.classList.add('hidden');
      if (ct) ct.classList.remove('hidden');
      this.animateRings();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
      this.tickTimer = setInterval(() => this.tick(), 3000);
    }, 1400);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qs<T extends Element = Element>(sel: string, r?: ParentNode): T | null {
    return (r || this.document).querySelector(sel);
  }

  private qsa<T extends Element = Element>(sel: string, r?: ParentNode): T[] {
    return Array.prototype.slice.call((r || this.document).querySelectorAll(sel));
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private toast(msg: string, _icon?: string): void {
    this.toastService.show(msg, 'success');
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  /* ---------------- data ---------------- */

  private buildOTS(): void {
    this.OTS = this.ROOMS.map((r, i): OtRoom => {
      const busy = r[2] === 'prog' || r[2] === 'emerg';
      const o: OtRoom = { id: i, room: r[0], type: r[1], status: r[2], sterile: r[2] === 'maint' ? 'Pending' : 'Sterile', equip: r[2] === 'maint' ? 'Servicing' : 'Ready', emergency: r[2] === 'emerg', av: this.AVC[i % this.AVC.length] };
      if (busy || r[2] === 'prep') {
        o.patient = this.NAMES[i % this.NAMES.length];
        o.mrn = 'MRN-' + (60700 + i);
        o.proc = this.PROCS[i % this.PROCS.length];
        o.surgeon = this.SURGEONS[i % this.SURGEONS.length];
        o.anesth = this.ANESTH[i % this.ANESTH.length];
        o.nurse = this.NURSES[i % this.NURSES.length];
        o.start = ['08:15', '09:00', '07:30', '10:20'][i % 4];
        o.eta = ['11:30', '12:15', '10:45', '13:00'][i % 4];
        o.progress = busy ? this.FROZEN_PROGRESS[i] : 0;
        o.stage = busy ? this.FROZEN_STAGE[i] : 1;
        o.prio = o.emergency ? 'Emergency' : ['High', 'Medium', 'Routine'][i % 3];
        o.dur = this.FROZEN_DUR[i];
      }
      return o;
    });
  }

  private buildSchedule(): void {
    this.SCHED = this.OTS.filter((o) => o.proc).map((o): SchedItem => ({
      id: o.id, room: o.room, patient: o.patient, proc: o.proc!, surgeon: o.surgeon,
      startH: undefined, dur: undefined, prio: undefined, status: o.status, av: o.av,
    })).concat(
      Array.from({ length: 8 }, (_, k): SchedItem => {
        const i = k + 20;
        return { id: 100 + k, room: this.ROOMS[k % 8][0], patient: this.NAMES[i % this.NAMES.length], proc: this.PROCS[i % this.PROCS.length], surgeon: this.SURGEONS[i % this.SURGEONS.length], startH: 8 + k, dur: this.FROZEN_SCHED_DUR[k], prio: ['High', 'Medium', 'Routine'][i % 3], status: 'Scheduled', av: this.AVC[i % this.AVC.length] };
      })
    );
  }

  /* ---------------- hero counts ---------------- */

  private updateCounts(): void {
    const c = (s: string) => this.OTS.filter((o) => o.status === s).length;
    const active = this.byId('ot-h-active');
    if (active) active.textContent = String(c('prog') + c('emerg'));
    const surg = this.byId('ot-h-surg');
    if (surg) surg.textContent = String(c('prog') + c('emerg'));
    const avail = this.byId('ot-h-avail');
    if (avail) avail.textContent = String(c('avail'));
    const emerg = this.byId('ot-h-emerg');
    if (emerg) emerg.textContent = String(c('emerg'));
  }

  /* ---------------- overview ---------------- */

  private trendSvg(data: number[], color: string): string {
    const w = 54, h = 18, mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * h}`).join(' ');
    return `<svg class="ot-trend" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  }

  private renderOverview(): void {
    const c = (s: string) => this.OTS.filter((o) => o.status === s).length;
    const W: [string, number, number, string, string, number[]][] = [
      ['Total OT Rooms', this.OTS.length, 100, '#0d9488', 'icon-layout-grid', [8, 8, 8, 8, 8, 8]],
      ['Active Rooms', c('prog') + c('emerg'), 56, '#e06c1f', 'icon-activity', [3, 4, 3, 5, 4, c('prog') + c('emerg')]],
      ['Available', c('avail'), 25, '#15803d', 'icon-circle-check', [3, 2, 3, 2, 2, c('avail')]],
      ['Emergency OT', c('emerg'), 20, '#dc2626', 'icon-alert-triangle', [1, 0, 1, 2, 1, c('emerg')]],
      ['Completed Today', 18, 80, '#1d4ed8', 'icon-clipboard-check', [12, 14, 15, 16, 17, 18]],
      ['Avg Duration', 124, 68, '#7c3aed', 'icon-timer', [130, 128, 126, 125, 124, 124]],
    ];
    const host = this.byId('ot-overview');
    if (host) {
      host.innerHTML = W.map(
        (w, i) => `
                      <div class="ot-card p-3.5">
                        <div class="flex items-start justify-between">
                          <span class="ot-iconbadge w-9 h-9" style="color:${w[3]}"><i class="${w[4]}"></i></span>
                          <div class="relative w-11 h-11"><svg viewBox="0 0 36 36" class="ot-ring w-11 h-11"><circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ot-track)" stroke-width="3.2"/><circle class="bar" cx="18" cy="18" r="15.9" fill="none" stroke="${w[3]}" stroke-width="3.2" stroke-linecap="round" pathLength="100" style="--p:${w[2]}"/></svg><span class="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style="color:${w[3]}">${w[2]}%</span></div>
                        </div>
                        <p class="text-2xl font-bold ot-head mt-2 tabular-nums">${w[1]}${i === 5 ? '<span class="text-sm ot-mut"> min</span>' : ''}</p>
                        <div class="flex items-center justify-between mt-1"><p class="text-[11px] ot-mut">${w[0]}</p>${this.trendSvg(w[5], w[3])}</div>
                      </div>`
      ).join('');
    }
  }

  private animateRings(): void {
    this.qsa<HTMLElement>('.ot-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  /* ---------------- control board ---------------- */

  private renderLegend(): void {
    const host = this.byId('ot-legend');
    if (host) host.innerHTML = Object.keys(this.STLABEL).map((k) => `<span class="flex items-center gap-1.5 ot-mut"><span class="ot-dot" style="background:${this.STC[k]}"></span>${this.STLABEL[k]}</span>`).join('');
  }

  private roomCard(o: OtRoom): string {
    const sc = this.STC[o.status];
    const stcls = 'st-' + o.status;
    const busy = o.status === 'prog' || o.status === 'emerg' || o.status === 'prep';
    return `<div class="ot-room ${stcls}" data-room="${o.id}">
                        <div class="flex items-center justify-between mb-1.5">
                            <label onclick="event.stopPropagation()" class="flex items-center gap-1.5"><input type="checkbox" data-sel="${o.id}" ${this.sel.has(o.id) ? 'checked' : ''} class="accent-[var(--ot-c)]"><span class="text-sm font-bold ot-head">${o.room}</span></label>
                            <span class="statpill ot-chip">${o.emergency ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}${this.STLABEL[o.status]}</span>
                        </div>
                        ${
                          busy
                            ? `<div class="flex items-center gap-2">
                            <span class="ot-avatar flex-none" style="width:32px;height:32px;background:${o.av};font-size:11px">${this.initials(o.patient!)}</span>
                            <div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${o.patient}</p><p class="text-[10px] ot-mut truncate">${o.proc}</p></div>
                            <button data-menu="${o.id}" onclick="event.stopPropagation()" class="w-6 h-6 rounded-md hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-more-vertical text-sm"></i></button>
                        </div>
                        <div class="flex items-center justify-between text-[10px] ot-mut mt-1.5"><span><i class="icon-stethoscope text-[10px]"></i> ${o.surgeon!.split('. ')[1] || o.surgeon}</span><span>${o.start} → ${o.eta}</span></div>
                        ${o.progress! > 0 ? `<div class="flex items-center gap-2 mt-1.5"><div class="ot-stab flex-1"><span style="width:${o.progress}%;background:${sc}"></span></div><span class="text-[10px] font-bold" style="color:${sc}">${o.progress}%</span></div><p class="text-[10px] ot-mut mt-1">Phase: ${this.STAGES[o.stage!]}</p>` : '<p class="text-[10px] ot-mut mt-2">Preparing theater...</p>'}`
                            : `<div class="flex flex-col items-center justify-center py-3 text-center">
                            <i class="icon-${o.status === 'avail' ? 'circle-check' : o.status === 'clean' ? 'spray-can' : 'wrench'} text-2xl" style="color:${sc}"></i>
                            <p class="text-[11px] ot-mut mt-1">${o.type} · ${o.status === 'avail' ? 'Ready for allocation' : o.status === 'clean' ? 'Turnover cleaning' : 'Under maintenance'}</p>
                            <button data-menu="${o.id}" onclick="event.stopPropagation()" class="absolute top-2.5 right-2.5 w-6 h-6 rounded-md hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-more-vertical text-sm"></i></button>
                        </div>`
                        }
                        <div class="flex items-center justify-between mt-2 pt-2 border-t text-[10px]" style="border-color:var(--ot-border)">
                            <span class="ot-mut"><i class="icon-shield-check text-[10px]" style="color:${o.sterile === 'Sterile' ? '#15803d' : '#b7791f'}"></i> ${o.sterile}</span>
                            <span class="ot-mut"><i class="icon-cpu text-[10px]"></i> ${o.equip}</span>
                        </div>
                        <div class="prev mt-1.5"><p class="text-[10px] ot-mut">${busy ? 'Anesthetist: ' + o.anesth + ' · Nurse: ' + o.nurse : 'Last used 40 min ago · turnover avg 22 min'}</p></div>
                    </div>`;
  }

  private renderBoard(): void {
    const host = this.byId('ot-board');
    if (host) host.innerHTML = this.OTS.map((o) => this.roomCard(o)).join('');
  }

  /* ---------------- workflow ---------------- */

  private renderWorkflow(): void {
    const o = this.OTS.find((x) => x.id === this.focusId) || this.OTS.find((x) => x.status === 'prog');
    const roomEl = this.byId('ot-wf-room');
    if (!o || !o.proc) {
      if (roomEl) roomEl.textContent = '—';
      const wf = this.byId('ot-workflow');
      if (wf) wf.innerHTML = '<p class="text-sm ot-mut text-center py-4">Select an active theater.</p>';
      return;
    }
    if (roomEl) roomEl.textContent = o.room;
    const cur = o.stage || 0;
    const host = this.byId('ot-workflow');
    if (host) {
      host.innerHTML =
        `<div class="space-y-0">` +
        this.STAGES.map((s, i) => {
          const state = i < cur ? 'done' : i === cur ? 'active' : '';
          const pct = i < cur ? 100 : i === cur ? o.progress || 60 : 0;
          return `<div class="ot-stage ${state} flex gap-3 ${i < this.STAGES.length - 1 ? 'pb-3' : ''}">
                            <div class="flex flex-col items-center"><div class="ot-stage-dot">${i < cur ? '<i class="icon-check text-[13px]"></i>' : i + 1}</div>${i < this.STAGES.length - 1 ? `<div class="w-0.5 flex-1 mt-1" style="background:${i < cur ? 'var(--ot-accent)' : 'var(--ot-border)'}"></div>` : ''}</div>
                            <div class="flex-1 pb-1"><div class="flex items-center justify-between"><p class="text-sm font-medium ${state ? 'ot-head' : 'ot-mut'}">${s}</p>${i === cur ? `<span class="ot-npill">In progress</span>` : i < cur ? `<span class="text-[10px]" style="color:var(--ot-accent)">Done</span>` : ''}</div>${state ? `<div class="ot-stab mt-1.5"><span style="width:${pct}%;background:var(--ot-accent)"></span></div>` : ''}</div>
                        </div>`;
        }).join('') +
        `</div>`;
    }
  }

  /* ---------------- schedule board ---------------- */

  private renderSchedule(): void {
    const host = this.byId('ot-schedule');
    if (!host) return;
    if (this.schedView === 'timeline' || this.schedView === 'daily') {
      const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
      const rooms = this.ROOMS.map((r) => r[0]);
      host.innerHTML = `<div class="ot-sched-grid" style="--cols:${rooms.length}">
                            <div class="ot-sched-cell !border-b-2 flex items-center justify-center text-[10px] ot-mut font-semibold" style="min-height:32px">Time</div>
                            ${rooms.map((r) => `<div class="ot-sched-cell !border-b-2 flex items-center justify-center text-[10px] font-semibold ot-head" style="min-height:32px">${r}</div>`).join('')}
                            ${hours
                              .map(
                                (h, hi) =>
                                  `<div class="ot-sched-cell flex items-center justify-center text-[10px] ot-mut">${h}</div>${rooms
                                    .map((r) => {
                                      const blk = this.SCHED.find((s) => s.room === r && (s.startH || 8) - 8 === hi);
                                      return `<div class="ot-sched-cell">${blk ? `<div class="ot-sched-block" data-sched="${blk.id}" style="top:2px;height:${(blk.dur || 1) * 44 - 6}px;background:${blk.prio === 'High' ? '#e06c1f' : blk.prio === 'Emergency' ? '#dc2626' : '#0f766e'}"><p class="font-semibold truncate">${blk.proc.split(' ')[0]}</p><p class="opacity-80 truncate">${(blk.surgeon || '').split('. ')[1] || ''}</p></div>` : ''}</div>`;
                                    })
                                    .join('')}`
                              )
                              .join('')}</div>`;
    } else if (this.schedView === 'weekly') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      host.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-7 gap-2">${days
        .map(
          (d, di) =>
            `<div class="ot-panel p-2.5"><p class="text-xs font-bold ot-head mb-2">${d}</p><div class="space-y-1.5">${
              this.SCHED.filter((_, i) => i % 7 === di)
                .slice(0, 3)
                .map((s) => `<div class="rounded-md p-1.5 text-[10px]" style="background:color-mix(in srgb,${s.prio === 'High' ? '#e06c1f' : '#0f766e'} 12%,transparent);border-left:2px solid ${s.prio === 'High' ? '#e06c1f' : '#0f766e'}"><p class="font-semibold ot-head truncate">${s.proc.split(' ')[0]}</p><p class="ot-mut truncate">${s.room}</p></div>`)
                .join('') || '<p class="text-[10px] ot-mut">—</p>'
            }</div></div>`
        )
        .join('')}</div>`;
    } else {
      host.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-4 gap-3">${this.OTS.map((o) => `<div class="ot-panel p-3"><div class="flex items-center justify-between mb-1"><span class="text-sm font-bold ot-head">${o.room}</span><span class="ot-chip" style="background:color-mix(in srgb,${this.STC[o.status]} 13%,transparent);color:${this.STC[o.status]}">${this.STLABEL[o.status]}</span></div><p class="text-[11px] ot-mut">${o.type} OT</p><p class="text-[11px] ot-mut mt-1">${o.status === 'avail' ? 'Free now' : o.proc ? 'Until ' + o.eta : '—'}</p></div>`).join('')}</div>`;
    }
  }

  /* ---------------- team ---------------- */

  private renderTeam(): void {
    const av = (nm: string, i: number) => `<span class="ot-avatar flex-none" style="width:36px;height:36px;background:${this.AVC[i % this.AVC.length]};font-size:12px">${this.initials(nm)}</span>`;
    const surg: [string, string, number, string, string, string, string][] = [
      ['Dr. A. Mehta', 'Cardiac Surgery', 3, '18y', 'In Surgery', 'Cardiac OT', '#e06c1f'],
      ['Dr. R. Nair', 'Orthopedics', 2, '12y', 'Available', '—', '#15803d'],
      ['Dr. S. Kapoor', 'Neurosurgery', 1, '15y', 'Scrubbing', 'Neuro OT', '#1d4ed8'],
    ];
    const anes: [string, string, string, string, string][] = [
      ['Dr. K. Menon', 'CABG · Cardiac OT', '2 rooms', 'Active', '#e06c1f'],
      ['Dr. T. Bose', 'Standby', '1 room', 'Available', '#15803d'],
    ];
    const nur: [string, string, string, string, string][] = [
      ['N. Fernandes', 'Cardiac OT', 'Day', 'Scrubbed', '#e06c1f'],
      ['N. Das', 'OT-03', 'Day', 'Available', '#15803d'],
    ];
    const host = this.byId('ot-team');
    if (!host) return;
    host.innerHTML = `
                        <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">Surgeons</p><div class="grid sm:grid-cols-3 gap-2">
                        ${surg.map((x, i) => `<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut">${x[1]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[6]} 13%,transparent);color:${x[6]}">${x[4]}</span></div><div class="flex justify-between text-[10px] ot-mut mt-2"><span>${x[2]} today · ${x[3]}</span><span>${x[5]}</span></div></div>`).join('')}
                        </div></div>
                        <div class="grid sm:grid-cols-2 gap-3">
                            <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">Anesthesiologists</p><div class="space-y-2">${anes.map((x, i) => `<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i + 3)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut truncate">${x[1]} · ${x[2]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[4]} 13%,transparent);color:${x[4]}">${x[3]}</span></div></div>`).join('')}</div></div>
                            <div><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2">OT Nurses</p><div class="space-y-2">${nur.map((x, i) => `<div class="ot-panel p-3"><div class="flex items-center gap-2.5">${av(x[0], i + 5)}<div class="min-w-0 flex-1"><p class="text-sm font-semibold ot-head truncate">${x[0]}</p><p class="text-[10px] ot-mut truncate">${x[1]} · ${x[2]}</p></div><span class="ot-chip" style="background:color-mix(in srgb,${x[4]} 13%,transparent);color:${x[4]}">${x[3]}</span></div></div>`).join('')}</div></div>
                        </div>`;
  }

  /* ---------------- equipment ---------------- */

  private renderEquipment(): void {
    const eq: [string, string, string, string, string][] = [
      ['Anesthesia Machine', 'ANES-04', 'Cardiac OT', 'In Use', '#e06c1f'],
      ['Surgical Lights', 'LGT-11', 'OT-03', 'In Use', '#e06c1f'],
      ['OT Table', 'TBL-07', 'Neuro OT', 'Idle', '#64748b'],
      ['Ventilator', 'VNT-09', 'Cardiac OT', 'In Use', '#e06c1f'],
      ['ECG Monitor', 'MON-15', 'OT-03', 'In Use', '#e06c1f'],
      ['Defibrillator', 'DEF-03', 'Standby', 'Ready', '#15803d'],
      ['Electrocautery', 'ECU-06', 'Ortho OT', 'In Use', '#e06c1f'],
      ['Suction Machine', 'SUC-12', 'Store', 'Ready', '#15803d'],
    ];
    const host = this.byId('ot-equipment');
    if (!host) return;
    host.innerHTML = eq
      .map(
        (e, i) => `<div class="ot-panel p-3">
                        <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold ot-head flex items-center gap-1.5"><span class="ot-iconbadge w-7 h-7" style="color:${e[4]}"><i class="icon-cpu text-sm"></i></span> ${e[0]}</span><span class="ot-chip" style="background:color-mix(in srgb,${e[4]} 13%,transparent);color:${e[4]}">${e[3]}</span></div>
                        <div class="flex justify-between text-[11px] ot-mut mt-1"><span>${e[1]} · ${e[2]}</span><span><i class="icon-shield-check text-[11px]" style="color:#15803d"></i> Sterile</span></div>
                        <p class="text-[10px] ot-mut mt-1">Last maintenance: Jul ${this.FROZEN_MAINT[i]}</p>
                    </div>`
      )
      .join('');
  }

  /* ---------------- analytics ---------------- */

  private bars(rows: [string, number, string][]): string {
    return rows.map((r) => `<div><div class="flex justify-between text-[11px] mb-1"><span class="ot-head font-medium">${r[0]}</span><span class="ot-mut">${r[1]}%</span></div><div class="ot-stab"><span style="width:${r[1]}%;background:${r[2]}"></span></div></div>`).join('');
  }

  private renderAnalytics(): void {
    const util = [68, 74, 71, 80, 77, 84, 79, 86];
    const host = this.byId('ot-analytics');
    if (!host) return;
    host.innerHTML = `
                        <div class="ot-panel p-3">
                            <div class="flex items-center justify-between mb-1"><p class="text-xs font-bold ot-head">Room Utilization · 8 days</p><span class="ot-chip" style="background:color-mix(in srgb,#0f766e 13%,transparent);color:#0f766e">79% avg</span></div>
                            <svg class="w-full h-14" viewBox="0 0 280 56" preserveAspectRatio="none"><defs><linearGradient id="otg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d9488" stop-opacity=".28"/><stop offset="100%" stop-color="#0d9488" stop-opacity="0"/></linearGradient></defs><polygon points="0,56 ${util.map((v, i) => `${(i / (util.length - 1)) * 280},${56 - (v / 100) * 50}`).join(' ')} 280,56" fill="url(#otg)"/><polyline points="${util.map((v, i) => `${(i / (util.length - 1)) * 280},${56 - (v / 100) * 50}`).join(' ')}" fill="none" stroke="#0d9488" stroke-width="2"/></svg>
                        </div>
                        <div class="grid sm:grid-cols-2 gap-3">
                            <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Surgery Types</p>${this.bars([
                              ['Orthopedic', 34, '#e06c1f'],
                              ['Cardiac', 26, '#dc2626'],
                              ['General', 22, '#0f766e'],
                              ['Neuro', 18, '#1d4ed8'],
                            ])}</div>
                            <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Department Utilization</p>${this.bars([
                              ['Cardiac OT', 88, '#dc2626'],
                              ['Ortho OT', 76, '#e06c1f'],
                              ['General', 64, '#0f766e'],
                              ['Neuro', 52, '#1d4ed8'],
                            ])}</div>
                            <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Turnaround Time</p>${this.bars([
                              ['< 20 min', 62, '#15803d'],
                              ['20–40 min', 28, '#b7791f'],
                              ['> 40 min', 10, '#dc2626'],
                            ])}</div>
                            <div class="ot-panel p-3"><p class="text-xs font-bold ot-head mb-2">Surgery Success</p>${this.bars([
                              ['Successful', 96, '#15803d'],
                              ['Complications', 3, '#b7791f'],
                              ['Re-operation', 1, '#dc2626'],
                            ])}</div>
                        </div>`;
  }

  /* ---------------- activity ---------------- */

  private readonly ACTS: [string, string, string, string][] = [
    ['Surgery Scheduled', 'CABG · Cardiac OT · 08:15', 'icon-calendar-plus', '#0e7490'],
    ['Surgery Started', 'Knee Replacement · OT-03', 'icon-slice', '#e06c1f'],
    ['OT Prepared', 'Neuro OT · sterile', 'icon-spray-can', '#1d4ed8'],
    ['Equipment Checked', 'Anesthesia machine · OK', 'icon-cpu', '#7c3aed'],
    ['Sterility Completed', 'OT-02 · verified', 'icon-shield-check', '#15803d'],
    ['Surgery Completed', 'Appendectomy · OT-01', 'icon-circle-check', '#15803d'],
    ['Recovery Started', 'C-Section · Ward 2', 'icon-heart', '#15803d'],
    ['Patient Shifted', 'CABG → Cardiac ICU', 'icon-bed', '#64748b'],
  ];

  private renderActivity(): void {
    const host = this.byId('ot-activity');
    if (!host) return;
    host.innerHTML = this.ACTS.map((a, i) => `<div class="ot-panel p-3 flex items-start gap-2.5"><span class="ot-iconbadge w-8 h-8 flex-none" style="color:${a[3]}"><i class="${a[2]}"></i></span><div class="min-w-0"><p class="text-sm font-semibold ot-head">${a[0]}</p><p class="text-[11px] ot-mut truncate">${a[1]}</p><p class="text-[10px] ot-mut mt-0.5">${this.FROZEN_ACT_AGO[i]}m ago</p></div></div>`).join('');
  }

  /* ---------------- drawer ---------------- */

  private drawerHost(): HTMLElement {
    let d = this.byId('ot-drawer');
    if (!d) {
      d = this.document.createElement('div');
      d.id = 'ot-drawer';
      d.className = 'ot-drawer';
      this.document.body.appendChild(d);
    }
    return d;
  }

  private openDrawer(id: number): void {
    const o = this.OTS.find((x) => x.id === id);
    if (!o) return;
    const sc = this.STC[o.status];
    const box = (t: string, ic: string, body: string) => `<div class="ot-panel p-3"><p class="text-[11px] font-bold ot-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} ot-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string) => `<div class="flex justify-between text-xs py-0.5"><span class="ot-mut">${k}</span><span class="font-medium ot-head">${v}</span></div>`;
    const chk = (items: [string, number][]) => items.map((x) => `<label class="flex items-center gap-2 text-xs py-0.5 ot-head"><input type="checkbox" class="accent-[var(--ot-c)]" ${x[1] ? 'checked' : ''}> ${x[0]}</label>`).join('');
    const busy = !!o.proc;
    const host = this.drawerHost();
    host.innerHTML = `
                      <div class="p-4 border-b sticky top-0 z-10 flex items-center justify-between" style="background:var(--ot-elev);border-color:var(--ot-border)">
                        <div class="flex items-center gap-3"><span class="ot-iconbadge w-11 h-11 flex-none" style="color:${sc};background:color-mix(in srgb,${sc} 12%,transparent)"><i class="icon-layout-grid text-lg"></i></span><div><p class="font-bold ot-head">${o.room}</p><p class="text-[11px] ot-mut">${o.type} OT · ${this.STLABEL[o.status]}</p></div></div>
                        <button data-close class="w-8 h-8 rounded-lg hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-x"></i></button>
                      </div>
                      <div class="p-4 space-y-3">
                        ${busy ? `<div class="ot-panel p-3" style="border-left:3px solid ${sc}"><div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold ot-head">Surgery Progress</span><span class="text-sm font-bold" style="color:${sc}">${o.progress}%</span></div><div class="ot-stab"><span style="width:${o.progress}%;background:${sc}"></span></div><p class="text-[11px] ot-mut mt-1">${this.STAGES[o.stage!]} · ${o.start} → ${o.eta}</p></div>` : ''}
                        ${busy ? box('Patient Information', 'icon-user', `<div class="flex items-center gap-2 mb-1.5"><span class="ot-avatar" style="width:34px;height:34px;background:${o.av};font-size:12px">${this.initials(o.patient!)}</span><div><p class="text-sm font-semibold ot-head">${o.patient}</p><p class="text-[11px] ot-mut">${o.mrn}</p></div></div>` + row('Diagnosis', o.proc!.split('(')[0]) + row('Priority', o.prio!)) : box('Room Status', 'icon-info', row('Type', o.type) + row('Status', this.STLABEL[o.status]) + row('Availability', o.status === 'avail' ? 'Free now' : 'Occupied'))}
                        ${busy ? box('Surgery Information', 'icon-slice', row('Procedure', o.proc!) + row('Start', o.start!) + row('Est. Completion', o.eta!) + row('Duration', o.dur + ' min')) : ''}
                        ${busy ? box('Surgical Team', 'icon-users', row('Surgeon', o.surgeon!) + row('Assistant', 'Dr. V. Iyer') + row('Anesthesiologist', o.anesth!) + row('OT Nurse', o.nurse!)) : ''}
                        ${box('Equipment Checklist', 'icon-cpu', chk([['Anesthesia machine', 1], ['Surgical lights', 1], ['OT table', 1], ['Electrocautery', busy ? 1 : 0], ['Suction ready', busy ? 1 : 0]]))}
                        ${box('Sterility Checklist', 'icon-shield-check', chk([['Instruments autoclaved', 1], ['Sterile drapes', 1], ['Air filtration verified', 1], ['Surface disinfection', o.sterile === 'Sterile' ? 1 : 0]]))}
                        ${box('Surgical Notes', 'icon-notebook', '<p class="text-xs ot-mut">' + (busy ? 'Procedure progressing without complication. Vitals stable.' : 'Theater idle — ready per protocol.') + '</p>')}
                        ${busy ? box('Recovery Plan', 'icon-heart-pulse', row('Destination', 'Cardiac ICU') + row('Monitoring', 'Continuous 24h') + row('Surgeon Review', 'Post-op 2h')) : ''}
                        <div class="grid grid-cols-2 gap-2">
                            ${busy ? `<button data-action="pause" data-oid="${o.id}" class="ot-btn ot-btn-ghost justify-center"><i class="icon-pause"></i> Pause</button><button data-action="complete" data-oid="${o.id}" class="ot-btn ot-btn-primary justify-center"><i class="icon-circle-check"></i> Complete</button>` : `<button data-modal="schedule" class="ot-btn ot-btn-ghost justify-center"><i class="icon-calendar-plus"></i> Schedule</button><button data-modal="allocate" class="ot-btn ot-btn-primary justify-center"><i class="icon-layout-grid"></i> Allocate</button>`}
                            <button data-modal="equipment" class="ot-btn ot-btn-ghost justify-center"><i class="icon-cpu"></i> Equipment</button>
                            <button data-modal="sterility" class="ot-btn ot-btn-ghost justify-center"><i class="icon-shield-check"></i> Sterility</button>
                        </div>
                      </div>`;
    host.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeDrawer(): void {
    this.byId('ot-drawer')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  /* ---------------- menu ---------------- */

  private menuHost(): HTMLElement {
    let m = this.byId('ot-menuhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'ot-menuhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="ot-menu" id="ot-openmenu">${this.ACTIONS.map((a) => (a[0] === 'sep' ? '<div class="ot-menu-sep"></div>' : `<button data-action="${a[2]}" data-oid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`)).join('')}</div>`;
    const m = this.byId('ot-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('ot-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ---------------- modals ---------------- */

  private buildModals(): void {
    const fld = (l: string, el: string) => `<div><label class="ot-formlabel">${l}</label>${el}</div>`;
    const inp = (ph?: string) => `<input class="ot-in mt-1" placeholder="${ph || ''}">`;
    const selE = (o: string[]) => `<select class="ot-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
    const drop = (t: string) => `<div class="ot-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--ot-hover)]"><i class="icon-cloud-upload text-3xl ot-mut"></i><p class="text-sm font-semibold mt-1 ot-head">${t}</p></div>`;
    const roomOpts = this.OTS.map((o) => o.room + ' · ' + this.STLABEL[o.status]);
    const chkBody = (items: string[]) => `<div class="space-y-1.5">${items.map((x) => `<label class="flex items-center gap-2 text-sm ot-head"><input type="checkbox" class="accent-[var(--ot-c)]" checked> ${x}</label>`).join('')}</div>`;
    this.MODALS = {
      schedule: { t: 'Schedule Surgery', sub: 'Book a new operation', ic: 'icon-calendar-plus', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Patient / MRN', inp('Search...'))}${fld('Procedure', selE(this.PROCS))}${fld('OT Room', selE(roomOpts))}${fld('Surgeon', selE(this.SURGEONS))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('OT Nurse', selE(this.NURSES))}${fld('Date & Time', `<input type="text" placeholder="dd-mm-yyyy --:--" class="ot-in mt-1" data-provider="flatpickr" data-date-format="d-m-Y" data-enable-time>`)}${fld('Est. Duration (min)', inp('120'))}${fld('Priority', selE(['Routine', 'Medium', 'High', 'Emergency']))}</div>`, cta: 'Schedule Surgery' },
      emergency: { t: 'Emergency Surgery', sub: 'Allocate an immediate theater', ic: 'icon-alert-triangle', body: `<div class="rounded-lg p-2.5 text-xs mb-3 flex items-center gap-2" style="background:color-mix(in srgb,#dc2626 11%,transparent);color:#dc2626;border:1px solid color-mix(in srgb,#dc2626 30%,transparent)"><i class="icon-alert-triangle"></i> Assigns the nearest available emergency OT.</div><div class="grid sm:grid-cols-2 gap-3">${fld('Patient / Unknown', inp('Name or "Unknown"'))}${fld('Procedure', selE(this.PROCS))}${fld('OT', selE(['Auto — Emergency OT', 'OT-01', 'OT-02']))}${fld('Surgeon On-call', selE(this.SURGEONS))}</div>`, cta: 'Activate Emergency OT' },
      allocate: { t: 'Allocate OT', sub: 'Assign a theater to a case', ic: 'icon-layout-grid', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room', selE(roomOpts))}${fld('Case / Patient', inp('Search...'))}${fld('Slot', selE(['08:00', '10:00', '12:00', '14:00']))}${fld('Duration', inp('120 min'))}</div>`, cta: 'Allocate OT' },
      team: { t: 'Assign Surgical Team', sub: 'Compose the OT team', ic: 'icon-users', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT Room', selE(roomOpts))}${fld('Lead Surgeon', selE(this.SURGEONS))}${fld('Assistant Surgeon', selE(this.SURGEONS))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Scrub Nurse', selE(this.NURSES))}${fld('Circulating Nurse', selE(this.NURSES))}</div>`, cta: 'Assign Team' },
      surgeon: { t: 'Assign Surgeon', sub: 'Attach a surgeon', ic: 'icon-stethoscope', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case', selE(roomOpts))}${fld('Surgeon', selE(this.SURGEONS))}${fld('Role', selE(['Lead', 'Assistant']))}${fld('Shift', selE(['Day', 'Night']))}</div>`, cta: 'Assign Surgeon' },
      nurse: { t: 'Assign Nurse', sub: 'Assign OT nursing', ic: 'icon-user-check', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case', selE(roomOpts))}${fld('Nurse', selE(this.NURSES))}${fld('Role', selE(['Scrub', 'Circulating']))}${fld('Shift', selE(['Day', 'Night']))}</div>`, cta: 'Assign Nurse' },
      anesth: { t: 'Assign Anesthesiologist', sub: 'Attach anesthesia cover', ic: 'icon-syringe', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('OT / Case', selE(roomOpts))}${fld('Anesthesiologist', selE(this.ANESTH))}${fld('Technique', selE(['General', 'Regional', 'Local', 'Spinal']))}${fld('Shift', selE(['Day', 'Night']))}</div>`, cta: 'Assign' },
      equipment: { t: 'Equipment Checklist', sub: 'Verify theater equipment', ic: 'icon-cpu', body: `<div class="mb-3">${fld('OT Room', selE(roomOpts))}</div><p class="text-[11px] font-semibold ot-mut uppercase mb-2">Checklist</p>${chkBody(['Anesthesia machine', 'Surgical lights', 'OT table', 'Ventilator', 'ECG monitor', 'Defibrillator', 'Electrocautery', 'Suction machine'])}`, cta: 'Confirm Equipment' },
      sterility: { t: 'Sterility Checklist', sub: 'Confirm sterility protocol', ic: 'icon-shield-check', body: `<div class="mb-3">${fld('OT Room', selE(roomOpts))}</div><p class="text-[11px] font-semibold ot-mut uppercase mb-2">Checklist</p>${chkBody(['Instruments autoclaved', 'Sterile drapes applied', 'Air filtration verified', 'Surface disinfection', 'Team scrubbed & gowned', 'Sterile field confirmed'])}`, cta: 'Confirm Sterility' },
      import: { t: 'Import', sub: 'Bulk-load schedule or OT config', ic: 'icon-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Surgery Schedule', 'OT Configuration'].map((f) => `<span class="ot-npill">${f}</span>`).join('')}</div>${drop('Drop CSV / Excel file')}<button class="text-xs font-semibold text-[color:var(--ot-accent)] hover:underline mt-2"><i class="icon-download"></i> Download sample template</button><div class="mt-3 rounded-lg p-3 text-xs flex items-center gap-2" style="background:color-mix(in srgb,#15803d 11%,transparent);color:#15803d;border:1px solid color-mix(in srgb,#15803d 28%,transparent)"><i class="icon-circle-check"></i> Validation passed · 19 surgeries · 0 errors</div>`, cta: 'Import' },
      export: { t: 'Export', sub: 'Generate an OT report', ic: 'icon-download', body: `<p class="text-xs ot-mut mb-2">Choose a format &amp; scope</p><div class="grid grid-cols-2 gap-2">${['CSV', 'Excel', 'PDF', 'Print', 'Surgery Report', 'OT Utilization Report', 'Surgeon Report', 'Equipment Report', 'Selected Records', 'All Records'].map((f) => `<button data-expfmt="${f}" class="ot-btn ot-btn-ghost justify-center">${f}</button>`).join('')}</div>`, cta: 'Export' },
    };
  }

  private modalHost(): HTMLElement {
    let m = this.byId('ot-modalhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'ot-modalhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    this.document.body.style.overflow = 'hidden';
    const host = this.modalHost();
    host.innerHTML = `<div class="ot-modal-wrap open"><div class="ot-modal-bg" data-close></div><div class="ot-modal">
                    <div class="ot-modal-head"><span class="ot-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold ot-head leading-tight">${m.t}</h3><p class="text-[11px] ot-mut">${m.sub || ''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--ot-hover)] flex items-center justify-center ot-mut"><i class="icon-x"></i></button></div>
                    <div class="ot-modal-body">${m.body}</div>
                    <div class="ot-modal-foot"><button data-close class="ot-btn ot-btn-ghost">Cancel</button><button data-modalok="${key}" class="ot-btn ot-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
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
    host.innerHTML = `<div class="ot-modal-wrap open"><div class="ot-modal-bg" data-close></div><div class="ot-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg ot-head">Confirm</h3><p class="text-xs ot-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="ot-btn ot-btn-ghost flex-1 justify-center">Cancel</button><button id="ot-delok" class="ot-btn ot-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`;
    const btn = this.byId('ot-delok');
    if (btn) btn.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('ot-modalhost');
    if (host) host.innerHTML = '';
    if (!this.byId('ot-drawer')?.classList.contains('open')) this.document.body.style.overflow = '';
  }

  /* ---------------- bulk / refresh helpers ---------------- */

  private updateBulk(): void {
    const cnt = this.byId('ot-selcount');
    if (cnt) cnt.textContent = String(this.sel.size);
    this.qsa<HTMLElement>('.ot-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private refreshAll(): void {
    this.renderOverview();
    this.renderBoard();
    this.renderWorkflow();
    this.updateCounts();
    this.animateRings();
  }

  private setFocus(id: number): void {
    this.focusId = id;
    this.renderWorkflow();
  }

  /* ---------------- live sim ---------------- */

  private tick(): void {
    this.OTS.forEach((o) => {
      if ((o.status === 'prog' || o.status === 'emerg') && (o.progress ?? 0) < 98) {
        o.progress = Math.min(98, (o.progress ?? 0) + this.rnd(0, 2));
        const ns = Math.min(this.STAGES.length - 1, Math.floor((o.progress / 100) * this.STAGES.length));
        if (ns > (o.stage ?? 0)) o.stage = ns;
      }
    });
    this.renderBoard();
    if (this.OTS.some((o) => o.id === this.focusId)) this.renderWorkflow();
  }

  private clock(): void {
    const el = this.byId('ot-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const sv = target.closest('[data-sv]') as HTMLElement | null;
      if (sv) {
        this.schedView = sv.dataset['sv'] as any;
        this.qsa('#ot-schedtabs button').forEach((x) => x.classList.toggle('on', x === sv));
        this.renderSchedule();
        return;
      }
      const schedEl = target.closest('[data-sched]') as HTMLElement | null;
      if (schedEl) {
        const id = +(schedEl.dataset['sched'] || 0);
        const o = this.OTS.find((x) => x.id === id);
        if (o) {
          this.setFocus(id);
          this.openDrawer(id);
        } else this.openModal('schedule');
        return;
      }
      const t = target.closest('[data-room],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-bulk],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.ot-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['room'] !== undefined) {
        this.setFocus(+t.dataset['room']);
        this.openDrawer(+t.dataset['room']);
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        const r = t.getBoundingClientRect();
        this.openMenu(+t.dataset['menu'], r.left - 200, r.bottom + 4);
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'];
        const id = +(t.dataset['oid'] || 0);
        this.closeMenu();
        const o = this.OTS.find((x) => x.id === id);
        if (o) this.focusId = id;
        if (a === 'view') {
          this.openDrawer(id);
        } else if (a === 'start') {
          if (o) {
            o.status = 'prog';
            o.progress = o.progress || 5;
            o.stage = 3;
          }
          this.refreshAll();
          this.toast('Surgery started', 'icon-play');
        } else if (a === 'pause') {
          this.toast('Surgery paused', 'icon-pause');
        } else if (a === 'complete') {
          if (o) {
            o.status = 'clean';
            o.progress = 100;
            o.stage = 7;
          }
          this.refreshAll();
          this.closeDrawer();
          this.toast('Surgery completed · theater turnover', 'icon-circle-check');
        } else if (a === 'recovery') {
          if (o) o.status = 'clean';
          this.refreshAll();
          this.toast('Patient transferred to recovery', 'icon-heart-pulse');
        } else if (this.MODALS[a!]) {
          this.openModal(a!);
        } else if (a === 'delete') {
          this.openDelete('Remove this OT record?', () => {
            this.OTS = this.OTS.filter((x) => x.id !== id);
            this.sel.delete(id);
            this.refreshAll();
            this.toast('Record removed', 'icon-trash-2');
          });
        } else if (this.SIMPLE[a!]) {
          this.toast(this.SIMPLE[a!]);
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal']!);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        this.toast(this.MODALS[t.dataset['modalok']].cta + ' — done', 'icon-check');
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
          this.openDelete(`Delete ${this.sel.size} selected record(s)?`, () => {
            this.OTS = this.OTS.filter((o) => !this.sel.has(o.id));
            this.sel.clear();
            this.refreshAll();
            this.updateBulk();
            this.toast('Records removed', 'icon-trash-2');
          });
        } else {
          const labels: Record<string, string> = { allocate: 'OT allocated', team: 'Team assigned', export: 'Exported', print: 'Printing', archive: 'Archived' };
          this.toast(labels[bk] + ' · ' + this.sel.size + ' records');
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
      }
    });

    // initial render (matches static pre-rendered markup, re-rendered here so
    // interactive state such as sel/schedView stay in sync going forward)
    this.renderLegend();
    this.renderTeam();
    this.renderEquipment();
    this.renderAnalytics();
    this.renderActivity();
    this.updateCounts();
  }
}
