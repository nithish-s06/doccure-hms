import { AfterViewInit, Component, DOCUMENT, Inject, OnDestroy } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Dept {
  name: string;
  icon: string;
  state: 'optimal' | 'busy' | 'critical';
  cap: string;
  load: number;
  alerts: number;
  perf: string;
}

interface IntelItem {
  id: string;
  kind: string;
  urgent?: boolean;
  icon: string;
  tone: string;
  text: string;
  time: string;
}

interface ActivityItem {
  time: string;
  cat: string;
  icon: string;
  tone: string;
  text: string;
}

@Component({
  imports: [],
  selector: 'app-executive-dashboard',
  styleUrl: './executive-dashboard.css',
  templateUrl: './executive-dashboard.html',
})
export class ExecutiveDashboard implements AfterViewInit, OnDestroy {
  private depts: Dept[] = [
    { name: 'Emergency', icon: 'icon-siren', state: 'critical', cap: '28 bays', load: 92, alerts: 2, perf: 'Surge protocol ready' },
    { name: 'OPD', icon: 'icon-stethoscope', state: 'busy', cap: '14 clinics', load: 78, alerts: 0, perf: 'Avg wait 22 min' },
    { name: 'IPD', icon: 'icon-bed', state: 'optimal', cap: '412 beds', load: 81, alerts: 0, perf: 'Discharges on track' },
    { name: 'ICU', icon: 'icon-heart-pulse', state: 'busy', cap: '48 beds', load: 88, alerts: 1, perf: '2 step-downs pending' },
    { name: 'Operation Theatre', icon: 'icon-scissors', state: 'optimal', cap: '9 suites', load: 67, alerts: 0, perf: 'On schedule' },
    { name: 'Laboratory', icon: 'icon-flask-conical', state: 'optimal', cap: '6 benches', load: 74, alerts: 0, perf: 'TAT 2h 04m' },
    { name: 'Pharmacy', icon: 'icon-pill', state: 'busy', cap: '4 counters', load: 83, alerts: 1, perf: 'Insulin restock inbound' },
    { name: 'Radiology', icon: 'icon-scan-line', state: 'optimal', cap: '5 modalities', load: 58, alerts: 0, perf: 'MRI slots open' },
    { name: 'Billing', icon: 'icon-receipt', state: 'optimal', cap: '6 counters', load: 62, alerts: 0, perf: '93% collection' },
    { name: 'Reception', icon: 'icon-headset', state: 'busy', cap: '5 desks', load: 76, alerts: 0, perf: 'Queue 12 min' },
  ];

  private readonly deptMeta: Record<Dept['state'], [string, string]> = {
    optimal: ['Optimal', 'ex-emerald'],
    busy: ['Busy', 'ex-amber'],
    critical: ['Critical', 'ex-rose'],
  };

  private intel: IntelItem[] = [
    { id: 'i1', kind: 'Emergency Alert', urgent: true, icon: 'icon-siren', tone: 'ex-rose', text: 'ED at 92% capacity — surge wing decision needed within the hour.', time: '5:12 PM' },
    { id: 'i2', kind: 'VIP Admission', icon: 'icon-crown', tone: 'ex-fuchsia', text: "Board member's family admitted to Suite 7 — concierge protocol active.", time: '4:48 PM' },
    { id: 'i3', kind: 'Critical Lab Result', icon: 'icon-flask-conical', tone: 'ex-rose', text: 'Critical potassium flagged and resolved on Ward 4B — closed-loop confirmed.', time: '4:30 PM' },
    { id: 'i4', kind: 'Equipment Failure', icon: 'icon-wrench', tone: 'ex-amber', text: 'Lab refrigeration RF-2 fault — engineer on site, reagents relocated safely.', time: '3:55 PM' },
    { id: 'i5', kind: 'OT Delay', icon: 'icon-clock-alert', tone: 'ex-amber', text: 'OT-3 running 40 min behind — evening list compressed, no cancellations.', time: '3:20 PM' },
    { id: 'i6', kind: 'High Patient Volume', icon: 'icon-users', tone: 'ex-sky', text: 'OPD crossed 430 visits — 8% above forecast, staffing held.', time: '2:45 PM' },
    { id: 'i7', kind: 'Compliance Reminder', icon: 'icon-shield-check', tone: 'ex-emerald', text: 'NABH mock audit in 12 days — 3 open evidence items with quality team.', time: '1:30 PM' },
    { id: 'i8', kind: 'Revenue Milestone', icon: 'icon-trophy', tone: 'ex-gold', text: 'Network crossed $500k monthly revenue — 11.8% ahead of plan.', time: '12:10 PM' },
  ];

  private activity: ActivityItem[] = [
    { time: '5:05 PM', cat: 'Finance', icon: 'icon-badge-dollar-sign', tone: 'ex-gold', text: 'Q3 capital budget revision approved — $2.4M for imaging upgrade' },
    { time: '4:40 PM', cat: 'Projects', icon: 'icon-building-2', tone: 'ex-violet', text: 'East Wing expansion updated — MEP fit-out milestone signed off' },
    { time: '4:15 PM', cat: 'Reviews', icon: 'icon-presentation', tone: 'ex-indigo', text: 'Pharmacy department review completed — margin plan accepted' },
    { time: '3:50 PM', cat: 'Governance', icon: 'icon-file-text', tone: 'ex-emerald', text: 'Updated infection-control policy published network-wide' },
    { time: '3:10 PM', cat: 'Incidents', icon: 'icon-shield-check', tone: 'ex-rose', text: 'Lab refrigeration incident resolved — corrective action logged' },
    { time: '2:30 PM', cat: 'Governance', icon: 'icon-clipboard-check', tone: 'ex-emerald', text: 'Fire-safety audit closed — zero critical findings' },
    { time: '1:45 PM', cat: 'Reviews', icon: 'icon-users', tone: 'ex-indigo', text: 'Executive committee meeting completed — 6 decisions minuted' },
    { time: '12:20 PM', cat: 'Finance', icon: 'icon-trophy', tone: 'ex-gold', text: 'Monthly revenue milestone acknowledged to all department heads' },
    { time: '11:30 AM', cat: 'Projects', icon: 'icon-cpu', tone: 'ex-violet', text: 'e-ICU vendor contract executed — go-live scheduled October' },
    { time: '10:15 AM', cat: 'Incidents', icon: 'icon-siren', tone: 'ex-rose', text: 'Overnight ED surge debrief — diversion protocol praised' },
  ];

  private actFilter = 'All';
  private outsideClickHandler = (e: MouseEvent) => this.onOutsideDockClick(e);

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireIntelFeed();
    this.wireActivityFilters();
    this.wireHeroActions();
    this.wireDock();
    this.renderHero();
    this.renderTwin();
    this.renderIntel();
    this.renderActivity();
  }

  ngOnDestroy(): void {
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

  public toast(message: string): void {
    this.toastService.show(message, 'success');
  }

  /* ---------------- Hero alert strip ---------------- */

  private renderHero(): void {
    const crit = this.depts.filter((d) => d.state === 'critical').length;
    const fact = this.byId('fact-emerg');
    if (fact) fact.textContent = crit ? `${crit} dept critical` : 'Stable';

    const loads = this.depts.reduce((s, d) => s + d.load, 0) / this.depts.length;
    const health = Math.round(100 - (loads - 60) * 0.9 - crit * 4);
    const C = 2 * Math.PI * 52;
    const fill = this.byId('health-fill');
    if (fill) {
      fill.setAttribute('stroke-dasharray', C.toFixed(1));
      fill.setAttribute('stroke-dashoffset', (C * (1 - health / 100)).toFixed(1));
    }
    const healthVal = this.byId('health-val');
    if (healthVal) healthVal.textContent = `${health}%`;

    const strip = this.byId('alert-strip');
    if (!strip) return;
    const urgent = this.intel.find((i) => i.urgent);
    if (urgent) {
      strip.classList.add('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
        `<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Executive decision required — ${this.escapeHtml(urgent.kind)}</p>` +
        `<p class="mt-0.5 text-xs font-medium text-white/70">${this.escapeHtml(urgent.text)}</p></div>` +
        '<button type="button" id="btn-approve-surge" class="ex-action shrink-0"><i class="icon-check" aria-hidden="true"></i>Approve surge wing</button>';
      this.byId('btn-approve-surge')?.addEventListener('click', () => {
        this.intel = this.intel.filter((i) => !i.urgent);
        const ed = this.depts.find((d) => d.name === 'Emergency');
        if (ed) {
          ed.state = 'busy';
          ed.load = 74;
          ed.alerts = 0;
          ed.perf = 'Surge wing open · 8 bays added';
        }
        this.renderHero();
        this.renderTwin();
        this.renderIntel();
        this.toast('Surge wing approved — 8 bays opening, bed management notified.');
      });
    } else {
      strip.classList.remove('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Network stable — no executive decisions pending</p>' +
        '<p class="mt-0.5 text-xs font-medium text-white/70">All campuses operating within thresholds. Next scheduled review: 6:00 PM ops call.</p></div>';
    }
  }

  /* ---------------- Digital twin ---------------- */

  private renderTwin(): void {
    const legend = this.byId('twin-legend');
    if (legend) {
      legend.innerHTML = (Object.entries(this.deptMeta) as [Dept['state'], [string, string]][])
        .map(
          ([state, [label, tone]]) =>
            `<span class="ex-chip ${tone} text-[9px]">${label} · ${this.depts.filter((d) => d.state === state).length}</span>`
        )
        .join('');
    }
    const twin = this.byId('twin');
    if (twin) {
      twin.innerHTML = this.depts
        .map((d) => {
          const [label] = this.deptMeta[d.state];
          return (
            `<div class="ex-dept is-${d.state}">` +
            `<div class="flex items-center gap-2"><span class="ex-panel-icon !size-8 shrink-0 text-xs" style="--ex-accent:var(--ex-dept-c)"><i class="${d.icon}" aria-hidden="true"></i></span>` +
            `<div class="min-w-0 flex-1"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(d.name)}</p>` +
            `<p class="text-[9px] font-bold text-gray-400">${this.escapeHtml(d.cap)}</p></div>` +
            (d.alerts ? `<span class="ex-chip ex-rose shrink-0 text-[9px]">${d.alerts}</span>` : '') +
            '</div>' +
            `<div class="mt-2 flex items-center justify-between"><span class="ex-dept-status">${label}</span>` +
            `<span class="text-[10px] font-extrabold text-gray-500 tabular-nums">${d.load}% load</span></div>` +
            `<div class="ex-dept-track"><span class="ex-dept-fill" style="width:0%" data-w="${d.load}"></span></div>` +
            `<p class="mt-1.5 truncate text-[9px] font-semibold text-gray-400">${this.escapeHtml(d.perf)}</p></div>`
          );
        })
        .join('');
      requestAnimationFrame(() =>
        this.document.querySelectorAll<HTMLElement>('.ex-dept-fill').forEach((f) => {
          f.style.width = `${f.dataset['w']}%`;
        })
      );
    }
  }

  /* ---------------- Intelligence feed ---------------- */

  private renderIntel(): void {
    const wrap = this.byId('intel');
    if (!wrap) return;
    wrap.innerHTML =
      this.intel
        .map(
          (i) =>
            `<div class="ex-intel ${i.tone}${i.urgent ? ' is-urgent' : ''}">` +
            `<span class="ex-panel-icon !size-8 shrink-0 text-xs"><i class="${i.icon}" aria-hidden="true"></i></span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="text-[11px] font-extrabold text-gray-900">${this.escapeHtml(i.kind)}</p><span class="ml-auto text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(i.time)}</span></div>` +
            `<p class="mt-0.5 text-[11px] leading-relaxed text-gray-500">${this.escapeHtml(i.text)}</p></div>` +
            `<button type="button" data-dismiss="${i.id}" class="shrink-0 self-center rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10" aria-label="Dismiss"><i class="icon-check text-xs" aria-hidden="true"></i></button>` +
            '</div>'
        )
        .join('') ||
      '<div class="grid place-items-center py-8 text-center"><span class="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500"><i class="icon-brain-circuit" aria-hidden="true"></i></span><p class="mt-3 text-xs font-bold text-gray-500">Feed clear</p><p class="text-[10px] text-gray-400">No open intelligence items.</p></div>';
  }

  private wireIntelFeed(): void {
    this.byId('intel')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-dismiss]') as HTMLElement | null;
      if (!btn) return;
      this.intel = this.intel.filter((i) => i.id !== btn.dataset['dismiss']);
      this.renderIntel();
      this.renderHero();
    });

    this.byId('btn-intel-clear')?.addEventListener('click', () => {
      if (!this.intel.length) {
        this.toast('Intelligence feed is already clear.');
        return;
      }
      this.intel = [];
      this.renderIntel();
      this.renderHero();
      this.toast('All intelligence items dismissed and archived.');
    });
  }

  /* ---------------- Activity filters ---------------- */

  private renderActivity(): void {
    const filters = this.byId('act-filters');
    if (filters) {
      const cats = ['All', ...new Set(this.activity.map((a) => a.cat))];
      filters.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" data-cat="${c}" aria-pressed="${this.actFilter === c}" class="ex-chip ex-violet cursor-pointer${this.actFilter === c ? '' : ' opacity-50'}">${c}</button>`
        )
        .join('');
    }
    const wrap = this.byId('activity');
    if (!wrap) return;
    wrap.innerHTML = this.activity
      .filter((a) => this.actFilter === 'All' || a.cat === this.actFilter)
      .map(
        (a) =>
          `<div class="ex-tl ${a.tone}"><span class="ex-tl-icon"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="ex-chip ${a.tone} text-[9px]">${a.cat}</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(a.time)}</span></div>` +
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
    this.byId('btn-brief')?.addEventListener('click', () =>
      this.toast('Executive brief compiled — occupancy, revenue and risk summary exported to PDF.')
    );
    this.byId('btn-review')?.addEventListener('click', () =>
      this.toast('Department review workspace opened — Emergency queued first.')
    );
    this.byId('btn-broadcast')?.addEventListener('click', () =>
      this.toast('Broadcast composer opened — reaches all department heads.')
    );
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
      this.toast(act + (act === 'Incident Center' ? ' opened — 1 incident awaiting closure.' : ' opened.'));
    });

    this.document.addEventListener('click', this.outsideClickHandler);
  }

  private onOutsideDockClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.closest('.ex-dock')) return;
    const fab = this.byId('dock-fab');
    const menu = this.byId('dock-menu');
    menu?.classList.add('is-closed');
    fab?.classList.remove('is-open');
    fab?.setAttribute('aria-expanded', 'false');
  }
}
