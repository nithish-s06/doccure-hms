import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';

interface ScheduleSlot {
  time: string;
  min: number;
  patient: string;
  type: string;
  detail: string;
  done?: boolean;
  rounds?: boolean;
}

interface QueuePatient {
  name: string;
  waited: number;
  status: 'Ready' | 'Checked In' | 'Arriving';
  room: string;
}

interface LabResult {
  patient: string;
  test: string;
  flag: string;
  value: string;
  urgent: boolean;
}

interface AlertItem {
  id: string;
  text: string;
  tone: string;
  icon: string;
}

interface TaskItem {
  id: string;
  text: string;
  due: string;
  done: boolean;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "doctor-dashboard".
 * The hero, schedule rail, waiting room, census, analytics and activity
 * panels ship as static markup matching this seed data; this only wires
 * the mutation handlers (sign lab, dismiss/clear alerts, toggle tasks,
 * start next consult, and the quick-action buttons). The page has no
 * labs panel, so that part of the original script is skipped.
 */
@Component({
  imports: [],
  selector: 'app-doctor-dashboard',
  styleUrl: './doctor-dashboard.css',
  templateUrl: './doctor-dashboard.html',
})
export class DoctorDashboard implements AfterViewInit {
  private readonly now = 9 * 60 + 42;

  private schedule: ScheduleSlot[] = [
    { time: '8:00 AM', min: 480, patient: 'Rosalind Pierce', type: 'Follow-up', detail: 'Post-syncope review, tilt-table results', done: true },
    { time: '8:30 AM', min: 510, patient: 'Marcus Okoro', type: 'Urgent', detail: 'NSTEMI discharge planning', done: true },
    { time: '9:15 AM', min: 555, patient: 'Bernadette Cho', type: 'New Patient', detail: 'Palpitations, Holter fitted', done: true },
    { time: '9:45 AM', min: 585, patient: 'Grant Sutherland', type: 'Follow-up', detail: 'Hypertension titration, home BP diary' },
    { time: '10:30 AM', min: 630, patient: 'Ophelia Grant', type: 'Consult', detail: 'Pre-op cardiac clearance for hip surgery' },
    { time: '11:15 AM', min: 675, patient: 'Curtis Mbeki', type: 'Follow-up', detail: 'Post-stent 6-week review' },
    { time: '1:00 PM', min: 780, patient: 'Ward Rounds', type: 'Rounds', detail: 'Cardiac ICU + telemetry, 6 patients', rounds: true },
    { time: '2:30 PM', min: 870, patient: 'Priya Raghunathan', type: 'New Patient', detail: 'Exertional chest tightness, stress echo review' },
    { time: '3:15 PM', min: 915, patient: 'Emmett Sandoval', type: 'Consult', detail: 'AF rate control, warfarin bridging' },
    { time: '4:00 PM', min: 960, patient: 'MDT Meeting', type: 'Meeting', detail: 'Heart failure multidisciplinary board', rounds: true },
  ];

  private readonly typeTone: Record<string, string> = {
    Urgent: 'dr-rose',
    'New Patient': 'dr-violet',
    'Follow-up': 'dr-indigo',
    Consult: 'dr-sky',
    Rounds: 'dr-emerald',
    Meeting: 'dr-amber',
  };

  private queue: QueuePatient[] = [
    { name: 'Grant Sutherland', waited: 14, status: 'Ready', room: 'Exam 2' },
    { name: 'Ophelia Grant', waited: 6, status: 'Checked In', room: 'Waiting' },
    { name: 'Curtis Mbeki', waited: 0, status: 'Arriving', room: '—' },
  ];

  private labs: LabResult[] = [
    { patient: 'Marcus Okoro', test: 'Troponin I (serial)', flag: 'High', value: '0.42 ng/mL', urgent: true },
    { patient: 'Rosalind Pierce', test: 'Electrolyte panel', flag: 'Normal', value: 'K 4.1 mmol/L', urgent: false },
    { patient: 'Emmett Sandoval', test: 'INR', flag: 'High', value: '3.4', urgent: true },
  ];

  private readonly census = [
    { label: 'Stable', n: 4, tone: 'dr-emerald' },
    { label: 'Watch', n: 2, tone: 'dr-amber' },
    { label: 'Critical', n: 1, tone: 'dr-rose' },
  ];

  private readonly week = [
    { day: 'Mon', n: 11 },
    { day: 'Tue', n: 9 },
    { day: 'Wed', n: 13 },
    { day: 'Thu', n: 10 },
    { day: 'Fri', n: 6 },
  ];
  private readonly lastWeekTotal = 44;

  private readonly load = [
    [2, 3, 4, 3, 1, 2, 3, 4, 2],
    [1, 2, 3, 2, 1, 1, 2, 3, 1],
    [3, 4, 4, 3, 2, 3, 4, 3, 2],
    [2, 3, 3, 2, 1, 2, 3, 2, 1],
    [2, 3, 2, 1, 1, 1, 2, 1, 0],
  ];
  private readonly days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  private readonly hours = ['8', '9', '10', '11', '12', '1', '2', '3', '4'];

  private readonly activity = [
    { time: '9:38 AM', icon: 'icon-file-text', text: 'Prescription signed — Metoprolol 50 mg for Bernadette Cho' },
    { time: '9:21 AM', icon: 'icon-flask-conical', text: 'Ordered serial troponins for Marcus Okoro' },
    { time: '8:55 AM', icon: 'icon-pen-line', text: 'Clinical note filed — Rosalind Pierce follow-up' },
    { time: '8:40 AM', icon: 'icon-check', text: 'Discharge summary approved — Kaitlyn Brewer' },
    { time: '8:12 AM', icon: 'icon-users', text: 'Morning handover completed with night registrar' },
  ];

  private alerts: AlertItem[] = [
    { id: 'A1', text: 'Critical troponin on Marcus Okoro — cath lab consult recommended.', tone: 'dr-rose', icon: 'icon-siren' },
    { id: 'A2', text: 'Telemetry: 12-beat NSVT run on bed CCU-3 overnight.', tone: 'dr-amber', icon: 'icon-activity' },
    { id: 'A3', text: "Pharmacy query on Ophelia Grant's ACE inhibitor dose.", tone: 'dr-sky', icon: 'icon-pill' },
  ];

  private tasks: TaskItem[] = [
    { id: 'T1', text: 'Countersign registrar\'s echo reports (3)', due: 'By noon', done: false },
    { id: 'T2', text: 'Call Dr. Whitlock re: pre-op clearance', due: 'Today', done: false },
    { id: 'T3', text: 'Complete mortality review paperwork', due: 'Fri', done: false },
    { id: 'T4', text: 'Renew BLS certification', due: 'Jul 30', done: true },
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.wireLabs();
    this.wireAlerts();
    this.wireTasks();
    this.wireHeroButtons();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private escapeHtml(value: string | null | undefined): string {
    return String(value ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
    );
  }

  private toast(message: string, tone: 'success' | 'info' = 'info'): void {
    const mc = (window as any).MC;
    if (mc?.toast) mc.toast(message, tone);
  }

  /* ---------------- Hero ---------------- */

  private renderHero(): void {
    const remaining = this.schedule.filter((s) => !s.done && s.min >= this.now).length;
    const line = this.byId('hero-line');
    if (line) line.innerHTML = `<i class="icon-calendar text-[13px]" aria-hidden="true"></i>${this.schedule.length} appointments · ${remaining} remaining`;

    const seen = this.schedule.filter((s) => s.done).length;
    const rail = [
      { label: 'Seen', value: seen, icon: 'icon-check' },
      { label: 'Waiting', value: this.queue.length, icon: 'icon-users' },
      { label: 'To Sign', value: this.labs.length, icon: 'icon-flask-conical' },
      { label: 'Inpatients', value: this.census.reduce((a, c) => a + c.n, 0), icon: 'icon-heart-pulse' },
    ];
    const railEl = this.byId('hero-rail');
    if (railEl) {
      railEl.innerHTML = rail
        .map(
          (r) =>
            '<div class="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md">' +
            `<i class="${r.icon} text-white/40 text-sm" aria-hidden="true"></i>` +
            `<div><dt class="text-[9px] font-bold uppercase tracking-wider text-white/40">${r.label}</dt>` +
            `<dd class="text-base font-extrabold text-white tabular-nums">${r.value}</dd></div></div>`
        )
        .join('');
    }
  }

  /* ---------------- Schedule rail ---------------- */

  private nowSlotIndex(): number {
    return this.schedule.findIndex((s) => !s.done);
  }

  private renderSchedule(): void {
    const nowIdx = this.nowSlotIndex();
    const remaining = this.schedule.filter((s) => !s.done).length;
    const chip = this.byId('sched-chip');
    if (chip) chip.textContent = `${remaining} left`;

    const wrap = this.byId('schedule');
    if (!wrap) return;
    wrap.innerHTML = this.schedule
      .map((s, i) => {
        const tone = this.typeTone[s.type] || 'dr-indigo';
        const isNow = i === nowIdx;
        return (
          `<div class="dr-slot ${tone}${isNow ? ' is-now' : ''}">` +
          '<span class="dr-slot-dot" aria-hidden="true"></span>' +
          `<div class="dr-slot-card${s.done ? ' opacity-55' : ''}">` +
          '<div class="flex items-center gap-2">' +
          `<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">${s.time}</p>` +
          `<span class="dr-chip ${tone}">${s.type}</span>` +
          (isNow ? '<span class="dr-chip dr-rose">Next</span>' : '') +
          (s.done ? '<i class="icon-check text-success text-xs ml-auto" aria-hidden="true"></i>' : '') +
          '</div>' +
          `<p class="mt-1 text-xs font-bold text-gray-900 truncate">${this.escapeHtml(s.patient)}</p>` +
          `<p class="text-[10px] text-gray-400 truncate">${this.escapeHtml(s.detail)}</p>` +
          '</div></div>'
        );
      })
      .join('');
  }

  /* ---------------- Waiting room & census ---------------- */

  private renderQueue(): void {
    const chip = this.byId('queue-chip');
    if (chip) chip.textContent = `${this.queue.length} waiting`;
    const wrap = this.byId('queue');
    if (!wrap) return;
    if (!this.queue.length) {
      wrap.innerHTML =
        '<div class="py-8 text-center"><i class="icon-armchair text-3xl text-gray-200 dark:text-slate-700" aria-hidden="true"></i>' +
        '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Waiting room clear</p>' +
        '<p class="text-[10px] text-gray-400">Next arrival expected 10:15 AM.</p></div>';
      return;
    }
    const tone: Record<string, string> = { Ready: 'dr-emerald', 'Checked In': 'dr-sky', Arriving: 'dr-amber' };
    wrap.innerHTML = this.queue
      .map(
        (p) =>
          `<div class="dr-row ${tone[p.status]} items-start">` +
          `<span class="hms-member-avatar size-8! text-[9px]! shrink-0 ${tone[p.status]}">${this.escapeHtml(this.initials(p.name))}</span>` +
          '<div class="min-w-0 flex-1">' +
          `<p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.escapeHtml(p.name)}</p>` +
          '<div class="mt-1 flex items-center justify-between gap-2">' +
          `<p class="min-w-0 truncate text-[10px] text-gray-400">${this.escapeHtml(p.room)}${p.waited ? ` · waited ${p.waited}m` : ''}</p>` +
          `<span class="dr-chip ${tone[p.status]} shrink-0">${p.status}</span>` +
          '</div></div></div>'
      )
      .join('');
  }

  private initials(name: string): string {
    return name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  private ring(pct: number, cls: string): string {
    return (
      `<div class="relative grid place-items-center ${cls}">` +
      '<svg class="dr-ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false">' +
      '<circle class="dr-ring-track" cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3.4"></circle>' +
      `<circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="${pct} 100"></circle></svg>` +
      `<span class="dr-ring-label">${pct}%</span></div>`
    );
  }

  private renderCensus(): void {
    const wrap = this.byId('census');
    if (!wrap) return;
    const total = this.census.reduce((a, c) => a + c.n, 0);
    wrap.innerHTML =
      '<div class="flex items-center justify-around">' +
      this.census
        .map((c) => {
          const pct = Math.round((c.n / total) * 100);
          return `<div class="text-center">${this.ring(pct, c.tone)}<p class="mt-1.5 text-sm font-extrabold text-gray-900 tabular-nums">${c.n}</p><p class="text-[10px] font-semibold text-gray-400">${c.label}</p></div>`;
        })
        .join('') +
      '</div>' +
      `<p class="mt-3 text-center text-[10px] font-semibold text-gray-400">${total} admitted under your care</p>`;
  }

  /* ---------------- Analytics ---------------- */

  private renderPerf(): void {
    const total = this.week.reduce((a, d) => a + d.n, 0);
    const delta = Math.round(((total - this.lastWeekTotal) / this.lastWeekTotal) * 100);
    const totalEl = this.byId('perf-total');
    if (totalEl) totalEl.textContent = String(total);
    const dEl = this.byId('perf-delta');
    if (dEl) {
      dEl.className = `dr-delta ${delta >= 0 ? 'is-up' : 'is-down'}`;
      dEl.textContent = `${delta >= 0 ? '+' : ''}${delta}%`;
    }

    const W = 220, H = 90, n = this.week.length, slot = W / n, bw = slot * 0.55;
    const max = Math.max(...this.week.map((d) => d.n));
    const chart = this.byId('perf-chart');
    if (chart) {
      chart.innerHTML = this.week
        .map((d, i) => {
          const bh = Math.max(3, (d.n / max) * (H - 8));
          const x = i * slot + (slot - bw) / 2;
          return `<rect class="dr-bar${d.n === max ? ' is-peak' : ''}" x="${x.toFixed(1)}" y="${(H - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4"><title>${d.day}: ${d.n} consults</title></rect>`;
        })
        .join('');
    }
    const axis = this.byId('perf-axis');
    if (axis) axis.innerHTML = this.week.map((d) => `<span>${d.day}</span>`).join('');
  }

  private heatLevel(v: number): number {
    return v >= 4 ? 4 : v;
  }

  private renderHeat(): void {
    const labelW = 34, cell = 20, rowH = 28, gap = 3, top = 14;
    const W = labelW + this.hours.length * (cell + gap);
    const H = top + this.days.length * (rowH + gap);
    let svg = '';
    this.hours.forEach((h, c) => {
      svg += `<text class="wb-heat-val" x="${labelW + c * (cell + gap) + cell / 2}" y="9" text-anchor="middle">${h}</text>`;
    });
    let peak = { v: -1, d: '', h: '' };
    this.days.forEach((d, r) => {
      const y = top + r * (rowH + gap);
      svg += `<text class="wb-heat-val" x="0" y="${y + rowH / 2 + 3}">${d}</text>`;
      this.load[r].forEach((v, c) => {
        if (v > peak.v) peak = { v, d, h: this.hours[c] };
        const x = labelW + c * (cell + gap);
        svg += `<rect class="dr-heat lv-${this.heatLevel(v)}" x="${x}" y="${y}" width="${cell}" height="${rowH}" rx="4"><title>${d} ${this.hours[c]}:00 — ${v} appointments</title></rect>`;
      });
    });
    const heat = this.byId('heat');
    if (heat) heat.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Appointment load by day and hour">${svg}</svg>`;
    const heatPeak = this.byId('heat-peak');
    if (heatPeak) heatPeak.textContent = `${peak.d} ${peak.h}:00 (${peak.v} appts)`;
  }

  private renderActivity(): void {
    const wrap = this.byId('activity');
    if (!wrap) return;
    wrap.innerHTML = this.activity
      .map(
        (a) =>
          '<li class="hms-tl-item is-done">' +
          `<span class="hms-tl-node"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          '<div class="min-w-0 flex-1 -mt-0.5">' +
          `<span class="text-[10px] font-bold text-gray-400 tabular-nums">${a.time}</span>` +
          `<p class="text-xs text-gray-600 dark:text-gray-300">${this.escapeHtml(a.text)}</p></div></li>`
      )
      .join('');
  }

  /* ---------------- Labs (no-op: page has no labs panel) ---------------- */

  private renderLabs(): void {
    const chip = this.byId('labs-chip');
    if (chip) chip.textContent = `${this.labs.length} waiting`;
    const wrap = this.byId('labs');
    if (!wrap) return;
    if (!this.labs.length) {
      wrap.innerHTML =
        '<div class="py-8 text-center"><i class="icon-check-check text-3xl text-success" aria-hidden="true"></i>' +
        '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Inbox zero</p>' +
        '<p class="text-[10px] text-gray-400">All results reviewed and signed.</p></div>';
      return;
    }
    wrap.innerHTML = this.labs
      .map(
        (l, i) =>
          `<div class="dr-row${l.urgent ? ' is-flagged' : ''}" style="display:block">` +
          '<div class="flex items-center gap-2">' +
          `<p class="min-w-0 flex-1 truncate text-xs font-bold text-gray-900 dark:text-white">${this.escapeHtml(l.test)}</p>` +
          `<span class="badge shrink-0 ${l.flag === 'High' ? 'badge-red' : 'badge-green'}">${l.flag}</span>` +
          '</div>' +
          '<div class="mt-1.5 flex items-center justify-between gap-2">' +
          `<p class="min-w-0 flex-1 truncate text-[10px] text-gray-400">${this.escapeHtml(l.patient)} · ${this.escapeHtml(l.value)}</p>` +
          `<button type="button" data-sign="${i}" class="shrink-0 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20">Sign</button>` +
          '</div></div>'
      )
      .join('');
  }

  private wireLabs(): void {
    this.byId('labs')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-sign]') as HTMLElement | null;
      if (!btn) return;
      const idx = parseInt(btn.dataset['sign'] || '-1', 10);
      const [l] = this.labs.splice(idx, 1);
      this.renderHero();
      this.renderLabs();
      if (l) this.toast(`${l.test} signed for ${l.patient}.`, 'success');
    });
  }

  /* ---------------- Alerts ---------------- */

  private renderAlerts(): void {
    const wrap = this.byId('alerts');
    if (!wrap) return;
    if (!this.alerts.length) {
      wrap.innerHTML =
        '<div class="py-8 text-center"><i class="icon-bell-off text-3xl text-gray-200 dark:text-slate-700" aria-hidden="true"></i>' +
        '<p class="mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400">No active alerts</p>' +
        '<p class="text-[10px] text-gray-400">You are all caught up.</p></div>';
      return;
    }
    wrap.innerHTML = this.alerts
      .map(
        (a) =>
          `<div class="${a.tone} flex items-start gap-2.5 rounded-xl border border-border-color dark:border-white/10 p-2.5">` +
          `<span class="dr-tile-icon size-8! text-xs!"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<p class="min-w-0 flex-1 text-xs text-gray-600 dark:text-gray-300">${this.escapeHtml(a.text)}</p>` +
          `<button type="button" data-dismiss="${a.id}" aria-label="Dismiss alert" class="text-gray-300 hover:text-gray-500 dark:text-slate-600"><i class="icon-x text-xs" aria-hidden="true"></i></button>` +
          '</div>'
      )
      .join('');
  }

  private wireAlerts(): void {
    this.byId('alerts')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-dismiss]') as HTMLElement | null;
      if (!btn) return;
      this.alerts = this.alerts.filter((a) => a.id !== btn.dataset['dismiss']);
      this.renderAlerts();
    });

    this.byId('btn-clear-alerts')?.addEventListener('click', () => {
      if (!this.alerts.length) {
        this.toast('No alerts to clear.');
        return;
      }
      this.alerts = [];
      this.renderAlerts();
      this.toast('All alerts cleared.', 'success');
    });
  }

  /* ---------------- Tasks ---------------- */

  private renderTasks(): void {
    const open = this.tasks.filter((t) => !t.done).length;
    const chip = this.byId('tasks-chip');
    if (chip) chip.textContent = `${open} open`;
    const wrap = this.byId('tasks');
    if (!wrap) return;
    wrap.innerHTML = this.tasks
      .map(
        (t) =>
          `<label class="flex items-center gap-2.5 rounded-xl border border-border-color dark:border-white/10 p-2.5 cursor-pointer${t.done ? ' opacity-55' : ''}" for="task-${t.id}">` +
          `<input type="checkbox" id="task-${t.id}" data-task="${t.id}" class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"${t.done ? ' checked' : ''}>` +
          `<span class="min-w-0 flex-1 truncate text-xs font-semibold text-gray-700 dark:text-gray-300${t.done ? ' line-through' : ''}">${this.escapeHtml(t.text)}</span>` +
          `<span class="dr-chip dr-amber shrink-0">${this.escapeHtml(t.due)}</span></label>`
      )
      .join('');
  }

  private wireTasks(): void {
    this.byId('tasks')?.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      const cb = target.closest('[data-task]') as HTMLInputElement | null;
      if (!cb) return;
      const t = this.tasks.find((x) => x.id === cb.dataset['task']);
      if (!t) return;
      t.done = cb.checked;
      this.renderTasks();
      if (t.done) this.toast(`Task completed — ${t.text}`, 'success');
    });
  }

  /* ---------------- Hero quick actions ---------------- */

  private renderAll(): void {
    this.renderHero();
    this.renderSchedule();
    this.renderQueue();
    this.renderLabs();
    this.renderCensus();
    this.renderPerf();
    this.renderHeat();
    this.renderActivity();
    this.renderAlerts();
    this.renderTasks();
  }

  private wireHeroButtons(): void {
    this.byId('btn-consult')?.addEventListener('click', () => {
      const next = this.schedule.find((s) => !s.done && !s.rounds);
      if (!next) {
        this.toast('No consultations remaining today.');
        return;
      }
      next.done = true;
      const q = this.queue.findIndex((p) => p.name === next.patient);
      if (q !== -1) this.queue.splice(q, 1);
      this.renderAll();
      this.toast(`Consultation started — ${next.patient} (${next.time}).`, 'success');
    });

    this.byId('btn-rx')?.addEventListener('click', () => this.toast('Prescription pad opened — continue on the Prescriptions page.'));
    this.byId('btn-note')?.addEventListener('click', () => this.toast('Clinical note template opened.'));
    this.byId('btn-break')?.addEventListener('click', () => this.toast('15-minute break blocked at 11:45 AM.', 'success'));
  }
}
