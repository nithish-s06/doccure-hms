import { AfterViewInit, Component, DOCUMENT, Inject, OnDestroy } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Step {
  name: string;
  time: string;
  min: number;
  icon: string;
}

interface Token {
  no: string;
  patient: string;
  doctor: string;
  dept: string;
  waited: number;
  pri: 'Normal' | 'Emergency' | 'VIP';
  lane: 'waiting' | 'called' | 'consult' | 'done';
}

interface Lane {
  key: Token['lane'];
  label: string;
  tone: string;
}

interface Appointment {
  time: string;
  min: number;
  patient: string;
  doctor: string;
  kind: string;
  note: string;
}

interface Registration {
  name: string;
  kind: string;
  tone: string;
  icon: string;
  status: string;
  docs: string;
  time: string;
}

interface Doctor {
  name: string;
  dept: string;
  state: 'available' | 'consult' | 'surgery' | 'break' | 'offline';
  with_: string | null;
  next: string;
}

interface DocMeta {
  label: string;
  cls: string;
}

interface Visitor {
  name: string;
  visiting: string;
  kind: string;
  tone: string;
  pass: string;
  time: string;
}

interface Bill {
  label: string;
  val: string;
  n: string;
  tone: string;
  icon: string;
}

interface Note {
  id: string;
  kind: string;
  broadcast?: boolean;
  tone: string;
  icon: string;
  text: string;
  time: string;
}

interface Perf {
  label: string;
  val: string;
  pct: number;
  tone: string;
  icon: string;
  sub: string;
}

interface ActivityItem {
  time: string;
  cat: string;
  icon: string;
  tone: string;
  text: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "reception-dashboard".
 * The hero, front-desk flow, token queue, appointments, registration desk,
 * waiting area, doctor wall, visitor passes, billing, announcements,
 * performance meters and activity feed ship as static HTML matching the
 * seed data below; this only wires the interactive bits (queue drag/drop
 * and actions, registration quick actions, doctor filters, visitor
 * approval, announcements, activity filters, hero quick actions and the
 * floating dock) so every widget stays correctly interactive after a
 * state-mutating action.
 */
@Component({
  imports: [],
  selector: 'app-reception-dashboard',
  styleUrl: './reception-dashboard.css',
  templateUrl: './reception-dashboard.html',
})
export class ReceptionDashboard implements AfterViewInit, OnDestroy {
  private readonly NOW_MIN = 11 * 60 + 12;

  private readonly STEPS: Step[] = [
    { name: 'Patient Registration', time: '8:00 AM', min: 480, icon: 'icon-user-plus' },
    { name: 'Appointment Check-in', time: '8:30 AM', min: 510, icon: 'icon-calendar-check' },
    { name: 'Token Generation', time: '9:00 AM', min: 540, icon: 'icon-ticket' },
    { name: 'Doctor Assignment', time: '10:30 AM', min: 630, icon: 'icon-stethoscope' },
    { name: 'Billing', time: '12:00 PM', min: 720, icon: 'icon-receipt' },
    { name: 'Completion', time: '3:30 PM', min: 930, icon: 'icon-badge-check' },
  ];

  private tokenSeq = 47;
  private tokens: Token[] = [
    { no: 'A-38', patient: 'Miriam Adeyemi', doctor: 'Dr. Chen', dept: 'Cardiology', waited: 6, pri: 'Normal', lane: 'consult' },
    { no: 'A-41', patient: 'Peter Kowalski', doctor: 'Dr. Osei', dept: 'Orthopedics', waited: 12, pri: 'Normal', lane: 'called' },
    { no: 'E-04', patient: 'Fatima Al-Rashid', doctor: 'Dr. Ferreira', dept: 'Emergency', waited: 2, pri: 'Emergency', lane: 'called' },
    { no: 'A-42', patient: 'Johan Petersen', doctor: 'Dr. Chen', dept: 'Cardiology', waited: 18, pri: 'Normal', lane: 'waiting' },
    { no: 'V-07', patient: 'Amelia Hartley', doctor: 'Dr. Nakato', dept: 'Dermatology', waited: 9, pri: 'VIP', lane: 'waiting' },
    { no: 'A-43', patient: 'Rahul Krishnan', doctor: 'Dr. Osei', dept: 'Orthopedics', waited: 14, pri: 'Normal', lane: 'waiting' },
    { no: 'A-44', patient: 'Sofia Marino', doctor: 'Dr. Nakato', dept: 'Dermatology', waited: 5, pri: 'Normal', lane: 'waiting' },
    { no: 'A-35', patient: 'George Mensah', doctor: 'Dr. Chen', dept: 'Cardiology', waited: 0, pri: 'Normal', lane: 'done' },
    { no: 'A-36', patient: 'Hana Suzuki', doctor: 'Dr. Nakato', dept: 'Dermatology', waited: 0, pri: 'Normal', lane: 'done' },
    { no: 'A-37', patient: "Liam O'Connor", doctor: 'Dr. Osei', dept: 'Orthopedics', waited: 0, pri: 'Normal', lane: 'done' },
  ];
  private readonly LANES: Lane[] = [
    { key: 'waiting', label: 'Waiting', tone: 'rc-amber' },
    { key: 'called', label: 'Called', tone: 'rc-orange' },
    { key: 'consult', label: 'In Consultation', tone: 'rc-sky' },
    { key: 'done', label: 'Completed', tone: 'rc-emerald' },
  ];
  private readonly PRI_TONE: Record<string, string> = { Emergency: 'rc-rose', VIP: 'rc-violet', Normal: 'rc-sky' };

  private appts: Appointment[] = [
    { time: '11:00 AM', min: 660, patient: 'Miriam Adeyemi', doctor: 'Dr. Chen', kind: 'Current', note: 'In consultation — room 4' },
    { time: '11:20 AM', min: 680, patient: 'Peter Kowalski', doctor: 'Dr. Osei', kind: 'Upcoming', note: 'Checked in · token A-41' },
    { time: '11:30 AM', min: 690, patient: 'Amelia Hartley', doctor: 'Dr. Nakato', kind: 'VIP', note: 'Private lounge · concierge notified' },
    { time: '11:40 AM', min: 700, patient: 'Fatima Al-Rashid', doctor: 'Dr. Ferreira', kind: 'Emergency', note: 'Fast-tracked from ED triage' },
    { time: '10:40 AM', min: 640, patient: 'Bruno Silva', doctor: 'Dr. Osei', kind: 'Delayed', note: 'Doctor running 25 min behind' },
    { time: '11:50 AM', min: 710, patient: 'Sofia Marino', doctor: 'Dr. Nakato', kind: 'Walk-in', note: 'Registered 10:58 AM · token A-44' },
    { time: '12:10 PM', min: 730, patient: 'Johan Petersen', doctor: 'Dr. Chen', kind: 'Upcoming', note: 'Awaiting call · token A-42' },
    { time: '12:30 PM', min: 750, patient: 'Rahul Krishnan', doctor: 'Dr. Osei', kind: 'Walk-in', note: 'X-ray review · token A-43' },
  ];
  private readonly KIND_TONE: Record<string, string> = {
    Current: 'rc-sky',
    Upcoming: 'rc-indigo',
    Delayed: 'rc-rose',
    'Walk-in': 'rc-amber',
    VIP: 'rc-violet',
    Emergency: 'rc-rose',
  };

  private readonly REGS: Registration[] = [
    { name: 'Sofia Marino', kind: 'New Registration', tone: 'rc-sky', icon: 'icon-user-plus', status: 'Insurance verifying', docs: 'ID captured · form 2 of 3', time: '10:58 AM' },
    { name: 'Rahul Krishnan', kind: 'Returning Patient', tone: 'rc-emerald', icon: 'icon-rotate-ccw', status: 'Records matched', docs: 'All documents on file', time: '10:45 AM' },
    { name: 'Amelia Hartley', kind: 'VIP Registration', tone: 'rc-violet', icon: 'icon-crown', status: 'Complete', docs: 'Concierge pack issued', time: '10:30 AM' },
    { name: 'Bruno Silva', kind: 'Insurance Update', tone: 'rc-amber', icon: 'icon-shield-check', status: 'Pending insurer reply', docs: 'Policy scan uploaded', time: '10:12 AM' },
    { name: 'Fatima Al-Rashid', kind: 'Emergency Intake', tone: 'rc-rose', icon: 'icon-siren', status: 'Fast-tracked', docs: 'Forms deferred — post-triage', time: '11:05 AM' },
  ];

  private readonly SEATS = 'ppfmppfmpfppmffpempfppmffppfmpff'.split('');
  private readonly SEAT_META: Record<string, { label: string; cls: string; icon: string }> = {
    f: { label: 'Available', cls: 'is-free', icon: '' },
    p: { label: 'Patient', cls: 'is-patient', icon: 'icon-user' },
    m: { label: 'Family', cls: 'is-family', icon: 'icon-users' },
    e: { label: 'Emergency', cls: 'is-emergency', icon: 'icon-siren' },
  };

  private readonly DOCTORS: Doctor[] = [
    { name: 'Dr. Sarah Chen', dept: 'Cardiology', state: 'consult', with_: 'Miriam Adeyemi', next: '11:20 AM' },
    { name: 'Dr. Kwame Osei', dept: 'Orthopedics', state: 'consult', with_: 'Bruno Silva', next: '11:35 AM' },
    { name: 'Dr. Inès Ferreira', dept: 'Emergency', state: 'available', with_: null, next: 'Now' },
    { name: 'Dr. Amina Nakato', dept: 'Dermatology', state: 'break', with_: null, next: '11:30 AM' },
    { name: 'Dr. Viktor Halvorsen', dept: 'General Surgery', state: 'surgery', with_: 'OT-2 · appendectomy', next: '1:30 PM' },
    { name: 'Dr. Elena Vasquez', dept: 'Pediatrics', state: 'offline', with_: null, next: 'Mon 9:00 AM' },
  ];
  private readonly DOC_META: Record<string, DocMeta> = {
    available: { label: 'Available', cls: 'is-available' },
    consult: { label: 'In Consultation', cls: 'is-consult' },
    surgery: { label: 'Surgery', cls: 'is-surgery' },
    break: { label: 'On Break', cls: 'is-break' },
    offline: { label: 'Offline', cls: 'is-offline' },
  };

  private visitors: Visitor[] = [
    { name: 'Rosa Delgado Jr.', visiting: 'Rosa Delgado · Ward 4B', kind: 'Approved', tone: 'rc-emerald', pass: 'V-118', time: '10:40 AM' },
    { name: 'Tunde Adeyemi', visiting: 'Miriam Adeyemi · OPD', kind: 'Waiting Approval', tone: 'rc-amber', pass: '—', time: '11:02 AM' },
    { name: 'Clara Petersen', visiting: 'Johan Petersen · OPD', kind: 'Approved', tone: 'rc-emerald', pass: 'V-119', time: '10:55 AM' },
    { name: 'Al-Rashid Family (2)', visiting: 'Fatima Al-Rashid · ED', kind: 'Emergency', tone: 'rc-rose', pass: 'E-12', time: '11:06 AM' },
  ];

  private readonly BILLS: Bill[] = [
    { label: 'Pending Payments', val: '$1,840', n: '7 invoices', tone: 'rc-amber', icon: 'icon-hourglass' },
    { label: 'Insurance Pending', val: '$3,120', n: '4 claims', tone: 'rc-violet', icon: 'icon-shield-check' },
    { label: 'Refund Requests', val: '$260', n: '2 requests', tone: 'rc-rose', icon: 'icon-rotate-ccw' },
    { label: 'Paid Today', val: '$5,430', n: '23 receipts', tone: 'rc-sky', icon: 'icon-check' },
  ];

  private notes: Note[] = [
    { id: 'n1', kind: 'Emergency Broadcast', broadcast: true, tone: 'rc-rose', icon: 'icon-siren', text: 'Code Blue drill at 2:00 PM — lobby announcements will pause for 10 minutes.', time: '10:50 AM' },
    { id: 'n3', kind: 'Doctor Announcement', tone: 'rc-violet', icon: 'icon-stethoscope', text: "Dr. Nakato's afternoon clinic moves to Room 12 — redirect checked-in patients.", time: '10:15 AM' },
    { id: 'n4', kind: 'System Alert', tone: 'rc-amber', icon: 'icon-monitor-cog', text: 'Token display board 2 rebooting at 11:30 AM — announce tokens verbally for 5 min.', time: '11:00 AM' },
    { id: 'n5', kind: 'Facilities Notice', tone: 'rc-sky', icon: 'icon-wrench', text: 'Main lobby elevator under maintenance until 1:00 PM — direct visitors to the east stairwell.', time: '9:40 AM' },
  ];

  private readonly PERF: Perf[] = [
    { label: 'Patients Registered', val: '23', pct: 77, tone: 'rc-amber', icon: 'icon-user-plus', sub: 'target 30 / shift' },
    { label: 'Avg Registration Time', val: '4m 10s', pct: 84, tone: 'rc-sky', icon: 'icon-timer', sub: 'target < 5m' },
    { label: 'Check-ins Completed', val: '31', pct: 89, tone: 'rc-indigo', icon: 'icon-calendar-check', sub: '35 booked today' },
    { label: 'Walk-ins Managed', val: '9', pct: 100, tone: 'rc-orange', icon: 'icon-footprints', sub: 'all tokened < 6m' },
    { label: 'Token Efficiency', val: '92%', pct: 92, tone: 'rc-emerald', icon: 'icon-ticket', sub: 'called on schedule' },
    { label: 'Calls Answered', val: '18', pct: 90, tone: 'rc-violet', icon: 'icon-phone-call', sub: 'avg pickup < 15s' },
    { label: 'ID Verifications', val: '27', pct: 90, tone: 'rc-rose', icon: 'icon-shield-check', sub: '27 of 30 checked' },
    { label: 'Avg Wait Time', val: '6m 40s', pct: 70, tone: 'rc-slate', icon: 'icon-hourglass', sub: 'target < 8m' },
  ];

  private activity: ActivityItem[] = [
    { time: '11:08 AM', cat: 'Tokens', icon: 'icon-ticket', tone: 'rc-orange', text: 'Token A-44 generated for Sofia Marino — Dermatology' },
    { time: '11:06 AM', cat: 'Visitors', icon: 'icon-id-card', tone: 'rc-sky', text: 'Emergency pass E-12 issued to Al-Rashid family' },
    { time: '11:05 AM', cat: 'Emergency', icon: 'icon-siren', tone: 'rc-rose', text: 'Emergency intake fast-tracked — Fatima Al-Rashid to ED' },
    { time: '10:58 AM', cat: 'Registrations', icon: 'icon-user-plus', tone: 'rc-amber', text: 'New patient registered — Sofia Marino (walk-in)' },
    { time: '10:55 AM', cat: 'Check-ins', icon: 'icon-calendar-check', tone: 'rc-indigo', text: 'Johan Petersen checked in for 12:10 PM with Dr. Chen' },
    { time: '10:52 AM', cat: 'Billing', icon: 'icon-receipt', tone: 'rc-emerald', text: 'Invoice #4821 settled — $180 card payment' },
    { time: '10:45 AM', cat: 'Registrations', icon: 'icon-rotate-ccw', tone: 'rc-amber', text: 'Returning patient matched — Rahul Krishnan' },
    { time: '10:40 AM', cat: 'Visitors', icon: 'icon-id-card', tone: 'rc-sky', text: 'Visitor pass V-118 approved for Ward 4B' },
    { time: '10:30 AM', cat: 'Check-ins', icon: 'icon-crown', tone: 'rc-indigo', text: 'VIP arrival — Amelia Hartley escorted to private lounge' },
    { time: '10:12 AM', cat: 'Billing', icon: 'icon-shield-check', tone: 'rc-emerald', text: 'Insurance claim submitted for Bruno Silva — $940' },
  ];

  private docFilter = 'all';
  private actFilter = 'All';
  private clockTimer: ReturnType<typeof setInterval> | null = null;
  private outsideClickHandler = (e: MouseEvent) => this.onOutsideDockClick(e);

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderHero();
    this.wireCallNext();
    this.wireQueue();
    this.wireRegActions();
    this.wireDoctorWall();
    this.wireVisitors();
    this.wireAnnouncements();
    this.wireActivityFilters();
    this.wireHeroActions();
    this.wireDock();
  }

  ngOnDestroy(): void {
    if (this.clockTimer) clearInterval(this.clockTimer);
    this.document.removeEventListener('click', this.outsideClickHandler);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private escapeHtml(value: string | null | undefined): string {
    return String(value ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
    );
  }

  private initials(name: string): string {
    return name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  private toast(message: string, tone: 'info' | 'success' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  /* ---------------- Hero / serving strip ---------------- */

  private renderHero(): void {
    const waiting = this.byId('fact-waiting');
    if (waiting) waiting.textContent = this.tokens.filter((t) => t.lane === 'waiting').length + ' in queue';
    const active = this.byId('fact-tokens');
    if (active) active.textContent = this.tokens.filter((t) => t.lane !== 'done').length + ' active';
    const emerg = this.byId('fact-emerg');
    if (emerg) emerg.textContent = this.tokens.some((t) => t.pri === 'Emergency' && t.lane !== 'done') ? '1 active' : 'Clear';

    const called = this.tokens.filter((t) => t.lane === 'called').sort((a, b) => (a.pri === 'Emergency' ? -1 : 1));
    const s = this.byId('serving');
    if (!s) return;
    if (called.length) {
      const t = called[0];
      s.innerHTML =
        `<span class="rc-serving-token">${this.escapeHtml(t.no)}</span>` +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-amber-200">Now calling · Counter 3</p>' +
        `<p class="mt-0.5 truncate text-xs font-medium text-white/70">${this.escapeHtml(t.patient)} → ${this.escapeHtml(t.doctor)} · ${this.escapeHtml(t.dept)}${t.pri !== 'Normal' ? ' · ' + t.pri : ''}</p></div>` +
        '<button type="button" id="btn-announce" class="rc-action shrink-0"><i class="icon-megaphone" aria-hidden="true"></i>Announce again</button>';
      this.byId('btn-announce')?.addEventListener('click', () =>
        this.toast('Token ' + t.no + ' announced on lobby displays.', 'info')
      );
    } else {
      s.innerHTML =
        '<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-check" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Queue clear at Counter 3</p>' +
        '<p class="mt-0.5 text-xs font-medium text-white/70">No token being called — press Call next to serve the queue.</p></div>';
    }
  }

  /* ---------------- Front desk flow ---------------- */

  private renderSteps(): void {
    let current = 0;
    this.STEPS.forEach((s, i) => {
      if (s.min <= this.NOW_MIN) current = i;
    });
    const wrap = this.byId('steps');
    if (wrap) {
      wrap.innerHTML = this.STEPS.map((s, i) => {
        const state = i < current ? 'is-done' : i === current ? 'is-now' : '';
        return (
          `<li class="rc-step ${state}">` +
          `<span class="rc-step-node"><i class="${s.icon}" aria-hidden="true"></i></span>` +
          `<div><p class="rc-step-name">${this.escapeHtml(s.name)}</p><p class="rc-step-time">${this.escapeHtml(s.time)}</p></div>` +
          (i === current ? '<span class="rc-chip rc-orange">Now</span>' : '') +
          '</li>'
        );
      }).join('');
    }
    const chip = this.byId('steps-chip');
    if (chip) chip.textContent = this.STEPS[current].name + ' stage';
  }

  /* ---------------- Token queue board ---------------- */

  private renderQueue(): void {
    const wrap = this.byId('queue');
    if (wrap) {
      wrap.innerHTML = this.LANES.map((l) => {
        const items = this.tokens.filter((t) => t.lane === l.key);
        return (
          `<div class="rc-lane ${l.tone}"><div class="mb-2 flex items-center justify-between px-1">` +
          `<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${l.label}</p><span class="rc-chip ${l.tone}">${items.length}</span></div>` +
          `<div class="rc-lane-items" data-lane="${l.key}">` +
          (items
            .map(
              (t, pos) =>
                `<div class="rc-token ${l.tone}${l.key === 'called' ? ' is-called' : ''}" draggable="true" data-token="${this.escapeHtml(t.no)}">` +
                '<div class="flex items-start gap-2.5">' +
                `<span class="rc-token-no">${this.escapeHtml(t.no)}</span>` +
                `<div class="min-w-0 flex-1"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(t.patient)}</p>` +
                `<p class="mt-0.5 text-[10px] font-semibold text-gray-500">${this.escapeHtml(t.doctor)} · ${this.escapeHtml(t.dept)}</p>` +
                '<div class="mt-1 flex flex-wrap items-center gap-1">' +
                (t.pri !== 'Normal' ? `<span class="rc-chip ${this.PRI_TONE[t.pri]} text-[9px]">${t.pri}</span>` : '') +
                (l.key === 'waiting' ? `<span class="rc-chip rc-amber text-[9px]">#${pos + 1} in line</span>` : '') +
                (t.waited && l.key !== 'done'
                  ? `<span class="text-[9px] font-bold text-gray-400 tabular-nums"><i class="icon-clock text-[9px]" aria-hidden="true"></i> ${t.waited}m</span>`
                  : '') +
                '</div></div></div>' +
                (l.key !== 'done'
                  ? `<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="Token ${this.escapeHtml(t.no)} actions">` +
                    (l.key === 'waiting'
                      ? `<button type="button" class="rc-token-btn" data-tk="call" data-no="${this.escapeHtml(t.no)}" title="Call" aria-label="Call token"><i class="icon-megaphone" aria-hidden="true"></i></button>`
                      : '') +
                    (l.key === 'called'
                      ? `<button type="button" class="rc-token-btn" data-tk="start" data-no="${this.escapeHtml(t.no)}" title="Start consultation" aria-label="Start consultation"><i class="icon-play" aria-hidden="true"></i></button>`
                      : '') +
                    (l.key === 'consult'
                      ? `<button type="button" class="rc-token-btn" data-tk="complete" data-no="${this.escapeHtml(t.no)}" title="Complete" aria-label="Complete token"><i class="icon-check" aria-hidden="true"></i></button>`
                      : '') +
                    `<button type="button" class="rc-token-btn" data-tk="skip" data-no="${this.escapeHtml(t.no)}" title="Skip" aria-label="Skip token"><i class="icon-skip-forward" aria-hidden="true"></i></button>` +
                    `<button type="button" class="rc-token-btn" data-tk="hold" data-no="${this.escapeHtml(t.no)}" title="Hold" aria-label="Hold token"><i class="icon-pause" aria-hidden="true"></i></button>` +
                    `<button type="button" class="rc-token-btn" data-tk="reassign" data-no="${this.escapeHtml(t.no)}" title="Reassign doctor" aria-label="Reassign doctor"><i class="icon-shuffle" aria-hidden="true"></i></button>` +
                    '</div>'
                  : '') +
                '</div>'
            )
            .join('') || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
          '</div></div>'
        );
      }).join('');
    }
    const active = this.tokens.filter((t) => t.lane !== 'done').length;
    const waiting = this.tokens.filter((t) => t.lane === 'waiting');
    const avg = Math.round(waiting.reduce((s, t) => s + t.waited, 0) / Math.max(1, waiting.length));
    const chip = this.byId('queue-chip');
    if (chip) chip.textContent = `${active} active · avg wait ${avg}m`;
  }

  private findToken(no: string): Token | undefined {
    return this.tokens.find((t) => t.no === no);
  }

  private refreshQueue(): void {
    this.renderQueue();
    this.renderHero();
  }

  private callNext(): void {
    const next = this.tokens
      .filter((t) => t.lane === 'waiting')
      .sort((a, b) => (a.pri === 'Emergency' ? -1 : b.pri === 'Emergency' ? 1 : 0))[0];
    if (!next) {
      this.toast('Queue is empty — no tokens waiting.', 'info');
      return;
    }
    next.lane = 'called';
    this.refreshQueue();
    this.toast('Token ' + next.no + ' called — ' + next.patient + ' to Counter 3.', 'success');
  }

  private wireCallNext(): void {
    this.byId('btn-call-next')?.addEventListener('click', () => this.callNext());
  }

  private wireQueue(): void {
    const queue = this.byId('queue');
    if (!queue) return;

    queue.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-tk]') as HTMLElement | null;
      if (!btn) return;
      const t = this.findToken(btn.dataset['no'] || '');
      if (!t) return;
      const op = btn.dataset['tk'];
      if (op === 'call') {
        t.lane = 'called';
        this.toast('Token ' + t.no + ' called — ' + t.patient + '.', 'success');
      } else if (op === 'start') {
        t.lane = 'consult';
        this.toast(t.patient + ' sent to ' + t.doctor + ' — consultation started.', 'success');
      } else if (op === 'complete') {
        t.lane = 'done';
        t.waited = 0;
        this.toast('Token ' + t.no + ' completed — routed to billing.', 'success');
      } else if (op === 'skip') {
        t.lane = 'waiting';
        t.waited += 5;
        this.toast('Token ' + t.no + ' skipped — moved back to waiting.', 'info');
      } else if (op === 'hold') {
        t.lane = 'waiting';
        this.toast('Token ' + t.no + ' on hold — patient will be re-called.', 'info');
      } else if (op === 'reassign') {
        t.doctor = t.doctor === 'Dr. Chen' ? 'Dr. Ferreira' : 'Dr. Chen';
        this.toast('Token ' + t.no + ' reassigned to ' + t.doctor + '.', 'success');
      }
      this.refreshQueue();
    });

    queue.addEventListener('dragstart', (e: DragEvent) => {
      const card = (e.target as HTMLElement).closest('[data-token]') as HTMLElement | null;
      if (!card) return;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset['token'] || '');
      }
      card.classList.add('is-dragging');
    });

    queue.addEventListener('dragend', (e: DragEvent) => {
      const card = (e.target as HTMLElement).closest('[data-token]') as HTMLElement | null;
      card?.classList.remove('is-dragging');
    });

    queue.addEventListener('dragover', (e: DragEvent) => {
      const zone = (e.target as HTMLElement).closest('.rc-lane-items') as HTMLElement | null;
      if (!zone) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
      zone.classList.add('is-over');
    });

    queue.addEventListener('dragleave', (e: DragEvent) => {
      const zone = (e.target as HTMLElement).closest('.rc-lane-items') as HTMLElement | null;
      if (zone && !zone.contains(e.relatedTarget as Node | null)) zone.classList.remove('is-over');
    });

    queue.addEventListener('drop', (e: DragEvent) => {
      const zone = (e.target as HTMLElement).closest('.rc-lane-items') as HTMLElement | null;
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove('is-over');
      const no = e.dataTransfer?.getData('text/plain') || '';
      const t = this.findToken(no);
      const laneKey = zone.dataset['lane'] as Token['lane'] | undefined;
      if (!t || !laneKey || t.lane === laneKey) return;
      t.lane = laneKey;
      if (t.lane === 'done') t.waited = 0;
      this.refreshQueue();
      const lane = this.LANES.find((l) => l.key === t.lane);
      this.toast('Token ' + t.no + ' moved to ' + (lane ? lane.label : t.lane) + '.', 'info');
    });
  }

  /* ---------------- Appointments ---------------- */

  private renderAppts(): void {
    const wrap = this.byId('appts');
    if (wrap) {
      const list = this.appts.slice().sort((a, b) => a.min - b.min);
      wrap.innerHTML = list
        .map((a) => {
          const tone = this.KIND_TONE[a.kind];
          const now = a.kind === 'Current';
          return (
            `<div class="rc-appt ${tone}${now ? ' is-now' : ''}">` +
            `<span class="rc-appt-dot"><i class="${now ? 'icon-play' : a.kind === 'Delayed' ? 'icon-clock-alert' : 'icon-clock'}" aria-hidden="true"></i></span>` +
            '<div class="rc-appt-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
            `<p class="text-[11px] font-extrabold text-gray-900 tabular-nums">${this.escapeHtml(a.time)}</p>` +
            `<span class="rc-chip ${tone} text-[9px]">${a.kind}</span></div>` +
            `<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">${this.escapeHtml(a.patient)} <span class="font-semibold text-gray-400">→ ${this.escapeHtml(a.doctor)}</span></p>` +
            `<p class="mt-0.5 text-[10px] font-semibold text-gray-500">${this.escapeHtml(a.note)}</p></div></div>`
          );
        })
        .join('');
    }
    const chip = this.byId('appt-chip');
    if (chip) {
      chip.textContent =
        this.appts.filter((a) => ['Upcoming', 'Walk-in', 'VIP', 'Emergency'].includes(a.kind)).length + ' to seat';
    }
  }

  /* ---------------- Registration desk ---------------- */

  private renderRegs(): void {
    const list = this.byId('reg-list');
    if (list) {
      list.innerHTML = this.REGS.map(
        (r) =>
          `<div class="rc-reg ${r.tone}"><div class="flex items-center gap-2.5">` +
          `<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="${r.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(r.name)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(r.time)}</span></div>` +
          `<p class="mt-0.5 text-[10px] font-bold text-gray-500">${this.escapeHtml(r.kind)} · ${this.escapeHtml(r.status)}</p>` +
          `<p class="mt-0.5 text-[10px] font-semibold text-gray-400"><i class="icon-file-text text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(r.docs)}</p></div></div></div>`
      ).join('');
    }
    const stats = [
      { label: 'New today', n: 14, tone: 'rc-sky', icon: 'icon-user-plus' },
      { label: 'Returning', n: 9, tone: 'rc-emerald', icon: 'icon-rotate-ccw' },
      { label: 'Insurance checks', n: 4, tone: 'rc-violet', icon: 'icon-shield-check' },
      { label: 'Pending forms', n: 3, tone: 'rc-amber', icon: 'icon-file-warning' },
    ];
    const statsEl = this.byId('reg-stats');
    if (statsEl) {
      statsEl.innerHTML = stats
        .map(
          (s) =>
            `<div class="rc-panel ${s.tone} !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="rc-panel-icon !size-8 text-xs"><i class="${s.icon}" aria-hidden="true"></i></span>` +
            `<div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">${s.n}</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">${s.label}</p></div></div>`
        )
        .join('');
    }
    const chip = this.byId('reg-chip');
    if (chip) chip.textContent = this.REGS.length + ' in progress';
  }

  private wireRegActions(): void {
    this.document.querySelectorAll('[data-reg]').forEach((b) =>
      b.addEventListener('click', () => this.toast((b as HTMLElement).dataset['reg'] + ' workspace opened.', 'success'))
    );
  }

  /* ---------------- Waiting area / seats ---------------- */

  private renderSeats(): void {
    const seatsEl = this.byId('seats');
    if (seatsEl) {
      seatsEl.innerHTML = this.SEATS.map((s, i) => {
        const m = this.SEAT_META[s];
        return `<div class="rc-seat ${m.cls}" title="${this.escapeHtml('Seat ' + (i + 1) + ' — ' + m.label)}">${m.icon ? `<i class="${m.icon}" aria-hidden="true"></i>` : ''}</div>`;
      }).join('');
    }
    const legend = this.byId('seat-legend');
    if (legend) {
      legend.innerHTML = Object.values(this.SEAT_META)
        .map(
          (m) =>
            `<span class="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-500"><span class="rc-seat ${m.cls} !aspect-auto !size-3 !rounded"></span>${m.label}</span>`
        )
        .join('');
    }
    const free = this.SEATS.filter((s) => s === 'f').length;
    const fam = this.SEATS.filter((s) => s === 'm').length;
    const emerg = this.SEATS.filter((s) => s === 'e').length;
    const waitChip = this.byId('wait-chip');
    if (waitChip) waitChip.textContent = this.SEATS.length - free + ' of ' + this.SEATS.length + ' seated';
    const stats = [
      { label: 'Avg wait', v: '16m', tone: 'text-amber-500' },
      { label: 'Family waiting', v: fam, tone: 'text-violet-500' },
      { label: 'Emergency queue', v: emerg, tone: 'text-rose-500' },
    ];
    const statsEl = this.byId('wait-stats');
    if (statsEl) {
      statsEl.innerHTML = stats
        .map(
          (s) =>
            `<div class="rounded-xl bg-gray-50 p-2.5 text-center dark:bg-white/5"><p class="text-lg font-extrabold tabular-nums ${s.tone}">${s.v}</p><p class="text-[10px] font-bold text-gray-400">${s.label}</p></div>`
        )
        .join('');
    }
  }

  /* ---------------- Doctor availability wall ---------------- */

  private renderDoctors(): void {
    const keys = ['all', ...Object.keys(this.DOC_META)];
    const filters = this.byId('doc-filters');
    if (filters) {
      filters.innerHTML = keys
        .map((k) => {
          const n = k === 'all' ? this.DOCTORS.length : this.DOCTORS.filter((d) => d.state === k).length;
          return `<button type="button" data-doc-f="${k}" aria-pressed="${this.docFilter === k}" class="rc-chip rc-emerald cursor-pointer${this.docFilter === k ? '' : ' opacity-50'}">${k === 'all' ? 'All' : this.DOC_META[k].label} · ${n}</button>`;
        })
        .join('');
    }
    const wrap = this.byId('doctors');
    if (!wrap) return;
    const filtered = this.DOCTORS.filter((d) => this.docFilter === 'all' || d.state === this.docFilter);
    wrap.innerHTML =
      filtered
        .map((d) => {
          const m = this.DOC_META[d.state];
          return (
            `<div class="rc-doc ${m.cls}"><div class="flex items-center gap-3">` +
            `<span class="rc-doc-avatar">${this.escapeHtml(this.initials(d.name))}<span class="rc-doc-dot" aria-hidden="true"></span></span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(d.name)}</p><span class="rc-doc-status">${m.label}</span></div>` +
            `<p class="mt-0.5 text-[10px] font-bold text-gray-500">${this.escapeHtml(d.dept)}</p>` +
            `<p class="mt-0.5 text-[10px] font-semibold text-gray-400">${d.with_ ? `<i class="icon-user text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(d.with_)} · ` : ''}Next free: ${this.escapeHtml(d.next)}</p></div>` +
            `<button type="button" data-doc="${this.escapeHtml(d.name)}" class="rc-token-btn shrink-0" title="Contact" aria-label="Contact doctor"><i class="icon-phone" aria-hidden="true"></i></button>` +
            '</div></div>'
          );
        })
        .join('') || '<p class="col-span-full py-6 text-center text-xs font-semibold text-gray-400">No doctors in this status.</p>';
  }

  private wireDoctorWall(): void {
    this.byId('doc-filters')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const f = target.closest('[data-doc-f]') as HTMLElement | null;
      if (!f) return;
      this.docFilter = f.dataset['docF'] || 'all';
      this.renderDoctors();
    });
    this.byId('doctors')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const d = target.closest('[data-doc]') as HTMLElement | null;
      if (d) this.toast('Calling ' + d.dataset['doc'] + "'s consultation room…", 'info');
    });
  }

  /* ---------------- Visitor passes ---------------- */

  private renderVisitors(): void {
    const wrap = this.byId('visitors');
    if (wrap) {
      wrap.innerHTML = this.visitors
        .map(
          (v, i) =>
            `<div class="rc-pass ${v.tone}"><span class="rc-pass-badge">${this.escapeHtml(v.pass !== '—' ? v.pass : this.initials(v.name))}</span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(v.name)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(v.time)}</span></div>` +
            `<p class="mt-0.5 truncate text-[10px] font-semibold text-gray-500">${this.escapeHtml(v.visiting)}</p>` +
            `<span class="mt-1 rc-chip ${v.tone} text-[9px]">${v.kind}</span></div>` +
            (v.kind === 'Waiting Approval'
              ? `<button type="button" data-approve="${i}" class="shrink-0 self-center rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Approve</button>`
              : '') +
            '</div>'
        )
        .join('');
    }
    const chip = this.byId('vis-chip');
    if (chip) chip.textContent = this.visitors.filter((v) => v.kind !== 'Checked Out').length + ' on site';
  }

  private wireVisitors(): void {
    this.byId('visitors')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const a = target.closest('[data-approve]') as HTMLElement | null;
      if (!a) return;
      const v = this.visitors[parseInt(a.dataset['approve'] || '-1', 10)];
      if (!v) return;
      v.kind = 'Approved';
      v.tone = 'rc-emerald';
      v.pass = 'V-120';
      this.renderVisitors();
      this.toast('Visitor pass ' + v.pass + ' printed for ' + v.name + '.', 'success');
    });
  }

  /* ---------------- Billing ---------------- */

  private renderBills(): void {
    const hero = this.byId('bill-hero');
    if (hero) {
      hero.innerHTML =
        '<div class="flex items-center justify-between"><p class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Daily Collection</p>' +
        '<span class="rc-chip rc-emerald text-[9px]"><i class="icon-trending-up text-[9px]" aria-hidden="true"></i>+12% vs yesterday</span></div>' +
        '<p class="mt-1.5 text-3xl font-extrabold text-gray-900 tabular-nums">$8,550</p>' +
        '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">30 transactions · counter + kiosk</p>';
    }
    const bills = this.byId('bills');
    if (bills) {
      bills.innerHTML = this.BILLS.map(
        (b) =>
          `<div class="rc-bill ${b.tone}"><div class="flex items-center gap-2"><span class="rc-panel-icon !size-7 text-[11px]"><i class="${b.icon}" aria-hidden="true"></i></span>` +
          `<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">${b.label}</p></div>` +
          `<p class="mt-1.5 rc-bill-val">${b.val}</p><p class="text-[10px] font-semibold text-gray-400">${b.n}</p></div>`
      ).join('');
    }
  }

  /* ---------------- Announcements ---------------- */

  private renderNotes(): void {
    const wrap = this.byId('announcements');
    if (!wrap) return;
    wrap.innerHTML =
      this.notes
        .map(
          (n) =>
            `<div class="rc-note ${n.tone}${n.broadcast ? ' is-broadcast' : ''}"><div class="flex items-start gap-2.5">` +
            `<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="${n.icon}" aria-hidden="true"></i></span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">${this.escapeHtml(n.kind)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(n.time)}</span></div>` +
            `<p class="mt-0.5 text-[11px] leading-relaxed text-gray-500 line-clamp-2">${this.escapeHtml(n.text)}</p></div>` +
            `<button type="button" data-read="${n.id}" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Mark read"><i class="icon-check text-xs" aria-hidden="true"></i></button>` +
            '</div></div>'
        )
        .join('') ||
      '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-inbox" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">All caught up</p><p class="text-[10px] text-gray-400">No unread announcements.</p></div>';
  }

  private wireAnnouncements(): void {
    this.byId('announcements')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const r = target.closest('[data-read]') as HTMLElement | null;
      if (!r) return;
      this.notes = this.notes.filter((n) => n.id !== r.dataset['read']);
      this.renderNotes();
    });

    this.byId('btn-read-all')?.addEventListener('click', () => {
      if (!this.notes.length) {
        this.toast('No unread announcements.', 'info');
        return;
      }
      this.notes = [];
      this.renderNotes();
      this.toast('All announcements marked as read.', 'success');
    });
  }

  /* ---------------- Performance ---------------- */

  private renderPerf(): void {
    const wrap = this.byId('perf');
    if (wrap) {
      wrap.innerHTML = this.PERF.map(
        (p) =>
          `<div class="rc-meter ${p.tone}"><div class="flex items-center gap-2.5">` +
          `<span class="rc-panel-icon !size-8 shrink-0 text-xs"><i class="${p.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1"><div class="flex items-baseline justify-between gap-2"><p class="text-[11px] font-bold text-gray-500">${p.label}</p><p class="text-sm font-extrabold text-gray-900 tabular-nums">${p.val}</p></div>` +
          `<div class="rc-meter-track"><div class="rc-meter-fill" style="width:0%" data-w="${p.pct}"></div></div>` +
          `<p class="mt-1 text-[9px] font-semibold text-gray-400">${p.sub}</p></div></div></div>`
      ).join('');
      requestAnimationFrame(() =>
        this.document.querySelectorAll<HTMLElement>('.rc-meter-fill').forEach((f) => {
          f.style.width = (f.dataset['w'] || '0') + '%';
        })
      );
    }
    const satVal = this.byId('sat-val');
    if (satVal) satVal.textContent = '4.7 / 5';
    requestAnimationFrame(() => {
      const bar = this.byId('sat-bar');
      if (bar) bar.style.width = '94%';
    });
  }

  /* ---------------- Activity feed ---------------- */

  private renderActivity(): void {
    const filters = this.byId('act-filters');
    if (filters) {
      const cats = ['All', ...new Set(this.activity.map((a) => a.cat))];
      filters.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" data-cat="${c}" aria-pressed="${this.actFilter === c}" class="rc-chip rc-orange cursor-pointer${this.actFilter === c ? '' : ' opacity-50'}">${c}</button>`
        )
        .join('');
    }
    const wrap = this.byId('activity');
    if (!wrap) return;
    wrap.innerHTML = this.activity
      .filter((a) => this.actFilter === 'All' || a.cat === this.actFilter)
      .map(
        (a) =>
          `<div class="rc-tl ${a.tone}"><span class="rc-tl-icon"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="rc-chip ${a.tone} text-[9px]">${a.cat}</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(a.time)}</span></div>` +
          `<p class="mt-1 text-[11px] font-semibold leading-relaxed text-gray-700 dark:text-gray-300">${this.escapeHtml(a.text)}</p></div></div>`
      )
      .join('');
  }

  private wireActivityFilters(): void {
    this.byId('act-filters')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const c = target.closest('[data-cat]') as HTMLElement | null;
      if (!c) return;
      this.actFilter = c.dataset['cat'] || 'All';
      this.renderActivity();
    });
  }

  /* ---------------- Hero quick actions ---------------- */

  private wireHeroActions(): void {
    this.byId('btn-register')?.addEventListener('click', () =>
      this.toast('New patient registration form opened.', 'success')
    );
    this.byId('btn-checkin')?.addEventListener('click', () =>
      this.toast('Appointment check-in scanner ready — scan booking QR.', 'info')
    );
    this.byId('btn-token')?.addEventListener('click', () => {
      this.tokenSeq += 1;
      const no = 'A-' + this.tokenSeq;
      this.tokens.push({ no, patient: 'Walk-in Patient', doctor: 'Dr. Ferreira', dept: 'General OPD', waited: 0, pri: 'Normal', lane: 'waiting' });
      this.activity.unshift({ time: '11:12 AM', cat: 'Tokens', icon: 'icon-ticket', tone: 'rc-orange', text: 'Token ' + no + ' generated at Counter 3 (walk-in)' });
      this.refreshQueue();
      this.renderActivity();
      this.toast('Token ' + no + ' generated and sent to the printer.', 'success');
    });
  }

  /* ---------------- Floating dock ---------------- */

  private wireDock(): void {
    const fab = this.byId('dock-fab');
    const menu = this.byId('dock-menu');
    if (!fab || !menu) return;

    fab.addEventListener('click', () => {
      const open = menu.classList.toggle('is-closed');
      fab.classList.toggle('is-open', !open);
      fab.setAttribute('aria-expanded', String(!open));
    });

    menu.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const item = target.closest('[data-act]') as HTMLElement | null;
      if (!item) return;
      menu.classList.add('is-closed');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
      const act = item.dataset['act'] || '';
      this.toast(
        act + (act === 'Emergency Registration' ? ' — fast-track intake opened.' : ' opened.'),
        act === 'Emergency Registration' ? 'error' : 'success'
      );
    });

    this.document.addEventListener('click', this.outsideClickHandler);
  }

  private onOutsideDockClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('.rc-dock')) return;
    const fab = this.byId('dock-fab');
    const menu = this.byId('dock-menu');
    menu?.classList.add('is-closed');
    fab?.classList.remove('is-open');
    fab?.setAttribute('aria-expanded', 'false');
  }
}
