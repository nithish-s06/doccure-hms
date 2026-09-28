import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Invoice {
  no: string;
  patient: string;
  dept: string;
  amount: number;
  method: string;
  due: string;
  ins: string;
  pri: string;
  lane: string;
}

interface Claim {
  no: string;
  provider: string;
  patient: string;
  amount: number;
  status: string;
  tone: string;
  expiring: boolean;
}

interface CollectionRow {
  patient: string;
  amount: number;
  due: string;
  days: number;
  reminded: string;
  phone: string;
  tone: string;
}

interface Refund {
  id: string;
  patient: string;
  amount: number;
  reason: string;
  state: string;
  tone: string;
  icon: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "BILLING-DASHBOARD
 * (billing-dashboard.html)". Pipeline, kanban, analytics, payments, claims,
 * collections, departments, refunds, performance dials and the activity
 * feed all ship as static HTML matching the seed data below, so this only
 * wires the interactive/mutating bits: kanban invoice ops, claim filters +
 * resubmit, collection reminders, refund approvals, activity filters, hero
 * quick actions and the floating dock.
 */
@Component({
  imports: [],
  selector: 'app-billing-dashboard',
  styleUrl: './billing-dashboard.css',
  templateUrl: './billing-dashboard.html',
})
export class BillingDashboard implements AfterViewInit {
  private invoices: Invoice[] = [
    { no: 'INV-9218', patient: 'Amelia Hartley', dept: 'Radiology', amount: 1240, method: 'Card', due: 'Jul 17', ins: 'Not covered', pri: 'VIP', lane: 'draft' },
    { no: 'INV-9219', patient: 'Dmitri Volkov', dept: 'OPD', amount: 180, method: 'Cash', due: 'Jul 17', ins: '—', pri: 'Normal', lane: 'draft' },
    { no: 'INV-9214', patient: 'Harold Nakamura', dept: 'IPD · Cardiology', amount: 4820, method: 'Insurance', due: 'Jul 19', ins: 'Verifying', pri: 'High', lane: 'pending' },
    { no: 'INV-9215', patient: 'Sofia Marino', dept: 'Laboratory', amount: 320, method: 'UPI', due: 'Jul 17', ins: '—', pri: 'Normal', lane: 'pending' },
    { no: 'INV-9211', patient: 'Rosa Delgado', dept: 'IPD · Med-Surg', amount: 6140, method: 'Insurance', due: 'Jul 21', ins: 'Claim filed', pri: 'High', lane: 'insurance' },
    { no: 'INV-9208', patient: 'Fatima Al-Rashid', dept: 'Emergency', amount: 2210, method: 'Insurance', due: 'Jul 20', ins: 'Pre-auth OK', pri: 'Urgent', lane: 'insurance' },
    { no: 'INV-9209', patient: 'Johan Petersen', dept: 'OPD · Cardiology', amount: 260, method: 'Card', due: 'Paid 2:40 PM', ins: '—', pri: 'Normal', lane: 'paid' },
    { no: 'INV-9206', patient: 'Hana Suzuki', dept: 'Laboratory', amount: 145, method: 'UPI', due: 'Paid 1:15 PM', ins: '—', pri: 'Normal', lane: 'paid' },
    { no: 'INV-9187', patient: 'Bruno Silva', dept: 'Orthopedics', amount: 890, method: 'Card', due: 'Jul 10', ins: 'Rejected', pri: 'High', lane: 'overdue' },
    { no: 'INV-9171', patient: 'George Mensah', dept: 'Pharmacy', amount: 210, method: 'Cash', due: 'Jul 5', ins: '—', pri: 'Normal', lane: 'overdue' },
  ];

  private readonly lanes = [
    { key: 'draft', label: 'Draft', tone: 'bl-indigo' },
    { key: 'pending', label: 'Pending Payment', tone: 'bl-amber' },
    { key: 'insurance', label: 'Insurance Review', tone: 'bl-sky' },
    { key: 'paid', label: 'Paid', tone: 'bl-emerald' },
    { key: 'overdue', label: 'Overdue', tone: 'bl-rose' },
  ];

  private readonly priTone: Record<string, string> = { Urgent: 'bl-rose', High: 'bl-amber', VIP: 'bl-violet', Normal: 'bl-sky' };

  private readonly revenueBase = 24280;

  private claims: Claim[] = [
    { no: 'CLM-4471', provider: 'MediShield Plus', patient: 'Rosa Delgado', amount: 6140, status: 'Under Review', tone: 'bl-amber', expiring: false },
    { no: 'CLM-4468', provider: 'HealthFirst', patient: 'Harold Nakamura', amount: 4820, status: 'Pending', tone: 'bl-sky', expiring: false },
    { no: 'CLM-4462', provider: 'CarePlus Assurance', patient: 'Fatima Al-Rashid', amount: 2210, status: 'Approved', tone: 'bl-emerald', expiring: false },
    { no: 'CLM-4455', provider: 'MediShield Plus', patient: 'Bruno Silva', amount: 890, status: 'Rejected', tone: 'bl-rose', expiring: false },
    { no: 'CLM-4449', provider: 'HealthFirst', patient: 'Emmett Sandoval', amount: 3480, status: 'Reimbursed', tone: 'bl-violet', expiring: false },
    { no: 'CLM-4431', provider: 'CarePlus Assurance', patient: 'Miriam Adeyemi', amount: 1750, status: 'Expiring', tone: 'bl-rose', expiring: true },
  ];

  private collections: CollectionRow[] = [
    { patient: 'Bruno Silva', amount: 890, due: 'Jul 10', days: 7, reminded: '2 reminders sent', phone: '+1 555-0142', tone: 'bl-rose' },
    { patient: 'George Mensah', amount: 210, due: 'Jul 5', days: 12, reminded: 'Final notice sent', phone: '+1 555-0177', tone: 'bl-rose' },
    { patient: 'Peter Kowalski', amount: 460, due: 'Jul 14', days: 3, reminded: '1 reminder sent', phone: '+1 555-0129', tone: 'bl-amber' },
    { patient: 'Selma Björk', amount: 1120, due: 'Jul 16', days: 1, reminded: 'Not reminded yet', phone: '+1 555-0158', tone: 'bl-amber' },
  ];

  private refunds: Refund[] = [
    { id: 'RFD-312', patient: 'Sofia Marino', amount: 85, reason: 'Duplicate lab charge', state: 'Pending Approval', tone: 'bl-amber', icon: 'icon-hourglass' },
    { id: 'RFD-311', patient: 'Amelia Hartley', amount: 220, reason: 'Cancelled radiology slot', state: 'Approved', tone: 'bl-sky', icon: 'icon-check' },
    { id: 'RFD-309', patient: 'Johan Petersen', amount: 60, reason: 'Overpayment at counter', state: 'Completed', tone: 'bl-emerald', icon: 'icon-badge-check' },
    { id: 'RFD-308', patient: 'Hana Suzuki', amount: 145, reason: 'Test not performed', state: 'Requested', tone: 'bl-violet', icon: 'icon-inbox' },
  ];

  private claimFilter = 'All';
  private actFilter = 'All';

  private readonly activity = [
    { time: '4:02 PM', cat: 'Payments', text: 'Payment received — $260 card settlement for INV-9209' },
    { time: '3:55 PM', cat: 'Invoices', text: 'INV-9219 created — OPD consultation for Dmitri Volkov' },
    { time: '3:48 PM', cat: 'Insurance', text: 'CLM-4462 approved — CarePlus pre-auth for $2,210' },
    { time: '3:30 PM', cat: 'Reminders', text: 'Collection reminder sent to Bruno Silva — $890, 7 days overdue' },
    { time: '3:12 PM', cat: 'Refunds', text: 'RFD-309 processed — $60 refunded to Johan Petersen' },
    { time: '2:58 PM', cat: 'Invoices', text: 'INV-9201 cancelled — duplicate registration charge voided' },
    { time: '2:40 PM', cat: 'Payments', text: 'UPI payment — $145 for INV-9206, receipt auto-emailed' },
    { time: '2:15 PM', cat: 'Insurance', text: 'CLM-4471 filed with MediShield Plus — $6,140 inpatient stay' },
    { time: '1:50 PM', cat: 'Reminders', text: 'Final notice issued to George Mensah — $210, 12 days overdue' },
    { time: '1:20 PM', cat: 'Refunds', text: 'RFD-312 requested — duplicate lab charge flagged by front desk' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderHero();
    this.animateFills();

    const payChip = this.byId('pay-chip');
    if (payChip) payChip.textContent = '101 tx today';

    this.wireKanban();
    this.wireClaims();
    this.wireCollections();
    this.wireRefunds();
    this.wireActivityFilters();
    this.wireHeroActions();
    this.wireDock();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private escapeHtml(value: string | null | undefined): string {
    return String(value ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
    );
  }

  private toast(message: string, tone: string = 'info'): void {
    this.toastService.show(message, tone as any);
  }

  private money(n: number): string {
    return '$' + n.toLocaleString('en-US');
  }

  private initials(name: string): string {
    return name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  private laneTone(l: { tone: string }): string {
    return l.tone.split(',').pop()!.trim();
  }

  private findInv(no: string): Invoice | undefined {
    return this.invoices.find((i) => i.no === no);
  }

  /* ---------------- Entrance animation for pre-rendered bars ---------------- */

  private animateFills(): void {
    requestAnimationFrame(() => {
      this.document
        .querySelectorAll<HTMLElement>('.bl-stage-bar span[data-w], .bl-pay-fill, .bl-dept-fill')
        .forEach((b) => (b.style.width = (b.dataset['w'] || '0') + '%'));
    });
  }

  /* ---------------- Hero ---------------- */

  private renderHero(): void {
    const pendingSum = this.invoices.filter((i) => i.lane === 'pending').reduce((s, i) => s + i.amount, 0);
    const overdueSum = this.invoices.filter((i) => i.lane === 'overdue').reduce((s, i) => s + i.amount, 0);

    const factCollect = this.byId('fact-collect');
    if (factCollect) factCollect.textContent = this.money(pendingSum);

    const factOutstanding = this.byId('fact-outstanding');
    if (factOutstanding) {
      factOutstanding.textContent = this.money(
        overdueSum + this.collections.reduce((s, c) => s + c.amount, 0) - overdueSum
      );
    }

    const factRefunds = this.byId('fact-refunds');
    if (factRefunds) factRefunds.textContent = this.refunds.filter((r) => r.state !== 'Completed').length + ' open';

    const paidToday = this.revenueBase + this.invoices.filter((i) => i.lane === 'paid').reduce((s, i) => s + i.amount, 0);
    const tickerVal = this.byId('ticker-val');
    if (tickerVal) tickerVal.textContent = this.money(paidToday);
    const tickerSub = this.byId('ticker-sub');
    if (tickerSub) tickerSub.textContent = '171 transactions · +9.2% vs yesterday';

    const strip = this.byId('close-strip');
    if (!strip) return;
    const gap = this.invoices.filter((i) => i.lane === 'overdue').length;
    if (gap) {
      strip.classList.add('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-clock-alert" aria-hidden="true"></i></span>' +
        `<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Day closing blocked — ${gap} overdue invoices</p>` +
        `<p class="mt-0.5 text-xs font-medium text-white/70">${this.money(overdueSum)} must be collected, written off or escalated before the 6 PM reconciliation.</p></div>` +
        '<button type="button" id="btn-review-overdue" class="bl-action shrink-0"><i class="icon-eye" aria-hidden="true"></i>Review overdue</button>';
      this.byId('btn-review-overdue')?.addEventListener('click', () =>
        this.toast('Overdue worklist opened — 2 invoices assigned to collections.', 'info')
      );
    } else {
      strip.classList.remove('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-badge-check" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">Ready for day closing</p>' +
        '<p class="mt-0.5 text-xs font-medium text-white/70">No overdue invoices on the board — reconciliation can start at 6 PM.</p></div>';
    }
  }

  /* ---------------- Kanban ---------------- */

  private renderKanban(): void {
    const wrap = this.byId('kanban');
    if (!wrap) return;
    wrap.innerHTML = this.lanes
      .map((l) => {
        const tone = this.laneTone(l);
        const items = this.invoices.filter((i) => i.lane === l.key);
        const sum = items.reduce((s, i) => s + i.amount, 0);
        return (
          `<div class="bl-lane ${tone}"><div class="mb-2 flex items-center justify-between px-1">` +
          `<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${l.label}</p>` +
          `<span class="bl-chip ${tone}">${items.length} · ${this.money(sum)}</span></div>` +
          (items
            .map(
              (v) =>
                `<div class="bl-inv ${tone}${l.key === 'overdue' ? ' is-overdue' : ''}" data-row-id="${this.escapeHtml(v.no)}">` +
                '<div class="flex items-center gap-1.5">' +
                `<span class="bl-inv-no">${this.escapeHtml(v.no)}</span>` +
                (v.pri !== 'Normal' ? `<span class="bl-chip ${this.priTone[v.pri]} text-[9px]">${v.pri}</span>` : '') +
                `<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">${this.money(v.amount)}</span></div>` +
                `<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(v.patient)}</p>` +
                `<p class="mt-0.5 text-[10px] font-semibold text-gray-500">${this.escapeHtml(v.dept)}</p>` +
                '<div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] font-bold text-gray-400">' +
                `<span><i class="icon-credit-card text-[9px]" aria-hidden="true"></i> ${this.escapeHtml(v.method)}</span>` +
                `<span class="tabular-nums"><i class="icon-calendar text-[9px]" aria-hidden="true"></i> ${this.escapeHtml(v.due)}</span>` +
                (v.ins !== '—' ? `<span class="bl-chip bl-sky text-[8px]">${this.escapeHtml(v.ins)}</span>` : '') +
                '</div>' +
                (l.key !== 'paid'
                  ? `<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="${this.escapeHtml(v.no)} actions">` +
                    `<button type="button" class="bl-inv-btn" data-i="view" data-no="${this.escapeHtml(v.no)}" title="View" aria-label="View invoice"><i class="icon-eye" aria-hidden="true"></i></button>` +
                    (l.key === 'draft'
                      ? `<button type="button" class="bl-inv-btn" data-i="edit" data-no="${this.escapeHtml(v.no)}" title="Edit" aria-label="Edit invoice"><i class="icon-pen-line" aria-hidden="true"></i></button>`
                      : '') +
                    `<button type="button" class="bl-inv-btn" data-i="collect" data-no="${this.escapeHtml(v.no)}" title="Collect payment" aria-label="Collect payment"><i class="icon-hand-coins" aria-hidden="true"></i></button>` +
                    `<button type="button" class="bl-inv-btn" data-i="print" data-no="${this.escapeHtml(v.no)}" title="Print invoice" aria-label="Print invoice"><i class="icon-printer" aria-hidden="true"></i></button>` +
                    (l.key === 'pending' || l.key === 'overdue'
                      ? `<button type="button" class="bl-inv-btn" data-i="remind" data-no="${this.escapeHtml(v.no)}" title="Send reminder" aria-label="Send reminder"><i class="icon-bell-ring" aria-hidden="true"></i></button>`
                      : '') +
                    '</div>'
                  : '<p class="mt-2 border-t border-dashed border-border-color pt-1.5 text-[9px] font-bold text-emerald-500 dark:border-white/10"><i class="icon-badge-check text-[9px]" aria-hidden="true"></i> Settled · receipt emailed</p>') +
                '</div>'
            )
            .join('') || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>') +
          '</div>'
        );
      })
      .join('');
    const open = this.invoices.filter((i) => i.lane !== 'paid').length;
    const chip = this.byId('board-chip');
    if (chip) {
      chip.textContent =
        open + ' open · ' + this.money(this.invoices.filter((i) => i.lane !== 'paid').reduce((s, i) => s + i.amount, 0)) + ' in play';
    }
  }

  private wireKanban(): void {
    this.byId('kanban')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-i]') as HTMLElement | null;
      if (!btn) return;
      const v = this.findInv(btn.dataset['no'] || '');
      if (!v) return;
      const op = btn.dataset['i'];
      if (op === 'view') return this.toast(`${v.no} — ${this.money(v.amount)} · ${v.dept} · due ${v.due}.`, 'info');
      if (op === 'edit') return this.toast(`${v.no} opened in the invoice editor.`, 'info');
      if (op === 'print') return this.toast(`${v.no} sent to the printer.`, 'success');
      if (op === 'remind') return this.toast(`Payment reminder sent to ${v.patient} for ${this.money(v.amount)}.`, 'success');
      if (op === 'collect') {
        v.lane = 'paid';
        v.due = 'Paid 4:05 PM';
        this.renderKanban();
        this.renderHero();
        this.toast(`${this.money(v.amount)} collected from ${v.patient} — receipt printed.`, 'success');
      }
    });
  }

  /* ---------------- Claims ---------------- */

  private claimCardHTML(c: Claim): string {
    const idx = this.claims.indexOf(c);
    return (
      `<div class="bl-claim ${c.tone}${c.expiring ? ' is-expiring' : ''}" data-row-id="${this.escapeHtml(c.no)}">` +
      `<div class="flex items-center gap-2"><span class="bl-inv-no ${c.tone}">${this.escapeHtml(c.no)}</span>` +
      `<span class="bl-chip ${c.tone} text-[9px]">${c.status}</span>` +
      `<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">${this.money(c.amount)}</span></div>` +
      `<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(c.patient)}</p>` +
      `<p class="mt-0.5 text-[10px] font-semibold text-gray-500"><i class="icon-building-2 text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(c.provider)}</p>` +
      (c.expiring
        ? `<button type="button" data-resub="${idx}" class="mt-2 w-full rounded-lg bg-rose-500/10 py-1 text-[10px] font-extrabold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-300">Resubmit before Jul 20</button>`
        : '') +
      '</div>'
    );
  }

  private renderClaimFilters(): void {
    const wrap = this.byId('claim-filters');
    if (!wrap) return;
    const states = ['All', ...new Set(this.claims.map((c) => c.status))];
    wrap.innerHTML = states
      .map(
        (s) =>
          `<button type="button" data-cf="${s}" aria-pressed="${this.claimFilter === s}" class="bl-chip bl-sky cursor-pointer${this.claimFilter === s ? '' : ' opacity-50'}">${s}</button>`
      )
      .join('');
  }

  private applyClaimFilter(): void {
    const visible = new Set(
      this.claims.filter((c) => this.claimFilter === 'All' || c.status === this.claimFilter).map((c) => c.no)
    );
    let shown = 0;
    this.byId('claims')
      ?.querySelectorAll<HTMLElement>('[data-row-id]')
      .forEach((el) => {
        const isVisible = visible.has(el.dataset['rowId'] || '');
        el.classList.toggle('hidden', !isVisible);
        if (isVisible) shown++;
      });
    const empty = this.byId('claims-empty');
    if (empty) empty.classList.toggle('hidden', shown !== 0);
  }

  private wireClaims(): void {
    this.byId('claim-filters')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const f = target.closest('[data-cf]') as HTMLElement | null;
      if (!f) return;
      this.claimFilter = f.dataset['cf'] || 'All';
      this.renderClaimFilters();
      this.applyClaimFilter();
    });

    this.byId('claims')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-resub]') as HTMLElement | null;
      if (!b) return;
      const c = this.claims[parseInt(b.dataset['resub'] || '-1', 10)];
      if (!c) return;
      c.status = 'Under Review';
      c.tone = 'bl-amber';
      c.expiring = false;
      const existing = this.byId('claims')?.querySelector(`[data-row-id="${c.no}"]`);
      if (existing) existing.outerHTML = this.claimCardHTML(c);
      this.renderClaimFilters();
      this.applyClaimFilter();
      this.renderHero();
      this.toast(`${c.no} resubmitted to ${c.provider} — expiry window reset.`, 'success');
    });
  }

  /* ---------------- Collections ---------------- */

  private collectionRowHTML(c: CollectionRow, i: number): string {
    return (
      `<div class="bl-col ${c.tone}" data-row-id="${i}"><span class="bl-col-avatar">${this.escapeHtml(this.initials(c.patient))}</span>` +
      `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(c.patient)}</p>` +
      `<span class="ml-auto text-sm font-extrabold text-gray-900 tabular-nums">${this.money(c.amount)}</span></div>` +
      `<p class="mt-0.5 text-[10px] font-semibold text-gray-500 tabular-nums">Due ${this.escapeHtml(c.due)} · ${this.escapeHtml(c.reminded)}</p>` +
      `<p class="mt-0.5 text-[10px] font-semibold text-gray-400"><i class="icon-phone text-[10px]" aria-hidden="true"></i> ${this.escapeHtml(c.phone)}</p></div>` +
      `<div class="bl-col-days"><p class="text-xs font-extrabold tabular-nums" style="color:var(--bl-accent)">${c.days}</p><p class="text-[7px] font-bold uppercase text-gray-400">days</p></div>` +
      `<button type="button" data-remind="${i}" class="shrink-0 self-center rounded-lg bg-rose-500/10 p-1.5 text-rose-500 transition-colors hover:bg-rose-500/20" title="Send reminder" aria-label="Send reminder"><i class="icon-bell-ring text-xs" aria-hidden="true"></i></button>` +
      '</div>'
    );
  }

  private wireCollections(): void {
    this.byId('collections')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-remind]') as HTMLElement | null;
      if (!b) return;
      const idx = parseInt(b.dataset['remind'] || '-1', 10);
      const c = this.collections[idx];
      if (!c) return;
      c.reminded = 'Reminder sent 4:05 PM';
      const existing = this.byId('collections')?.querySelector(`[data-row-id="${idx}"]`);
      if (existing) existing.outerHTML = this.collectionRowHTML(c, idx);
      this.toast(`SMS + email reminder sent to ${c.patient} for ${this.money(c.amount)}.`, 'success');
    });
  }

  /* ---------------- Refunds ---------------- */

  private refundCardHTML(r: Refund): string {
    const i = this.refunds.indexOf(r);
    return (
      `<div class="bl-ref ${r.tone}" data-row-id="${this.escapeHtml(r.id)}"><span class="bl-ref-dot"><i class="${r.icon}" aria-hidden="true"></i></span>` +
      '<div class="bl-ref-card"><div class="flex flex-wrap items-center gap-x-2 gap-y-1">' +
      `<span class="bl-inv-no ${r.tone}">${this.escapeHtml(r.id)}</span><span class="bl-chip ${r.tone} text-[9px]">${r.state}</span>` +
      `<span class="ml-auto text-xs font-extrabold text-gray-900 tabular-nums">${this.money(r.amount)}</span></div>` +
      `<p class="mt-1 text-xs font-bold text-gray-800 dark:text-gray-200">${this.escapeHtml(r.patient)}</p>` +
      `<p class="mt-0.5 text-[10px] font-semibold text-gray-500">${this.escapeHtml(r.reason)}</p>` +
      (r.state === 'Pending Approval' ? `<button type="button" data-appr="${i}" class="mt-1.5 text-[10px] font-extrabold text-primary hover:underline">Approve refund</button>` : '') +
      '</div></div>'
    );
  }

  private updateRefChip(): void {
    const chip = this.byId('ref-chip');
    if (chip) chip.textContent = this.refunds.filter((r) => r.state !== 'Completed').length + ' in workflow';
  }

  private wireRefunds(): void {
    this.byId('refunds')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-appr]') as HTMLElement | null;
      if (!b) return;
      const r = this.refunds[parseInt(b.dataset['appr'] || '-1', 10)];
      if (!r) return;
      r.state = 'Approved';
      r.tone = 'bl-sky';
      r.icon = 'icon-check';
      const existing = this.byId('refunds')?.querySelector(`[data-row-id="${r.id}"]`);
      if (existing) existing.outerHTML = this.refundCardHTML(r);
      this.updateRefChip();
      this.renderHero();
      this.toast(`${r.id} approved — ${this.money(r.amount)} queued for payout.`, 'success');
    });
  }

  /* ---------------- Activity filters ---------------- */

  private applyActivityFilter(): void {
    this.byId('act-filters')
      ?.querySelectorAll<HTMLElement>('[data-cat]')
      .forEach((btn) => {
        const active = btn.dataset['cat'] === this.actFilter;
        btn.setAttribute('aria-pressed', String(active));
        btn.classList.toggle('opacity-50', !active);
      });
    this.byId('activity')
      ?.querySelectorAll<HTMLElement>('[data-row-id]')
      .forEach((el) => {
        const a = this.activity[Number(el.dataset['rowId'])];
        el.classList.toggle('hidden', !(this.actFilter === 'All' || (a && a.cat === this.actFilter)));
      });
  }

  private wireActivityFilters(): void {
    this.byId('act-filters')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const c = target.closest('[data-cat]') as HTMLElement | null;
      if (!c) return;
      this.actFilter = c.dataset['cat'] || 'All';
      this.applyActivityFilter();
    });
  }

  /* ---------------- Hero quick actions ---------------- */

  private wireHeroActions(): void {
    this.byId('btn-invoice')?.addEventListener('click', () => {
      const no = 'INV-92' + (20 + this.invoices.filter((i) => i.no > 'INV-9219').length);
      this.invoices.unshift({ no, patient: 'Walk-in Patient', dept: 'OPD', amount: 150, method: 'Cash', due: 'Jul 17', ins: '—', pri: 'Normal', lane: 'draft' });
      this.renderKanban();
      this.renderHero();
      this.toast(`${no} drafted — add line items to issue.`, 'success');
    });

    this.byId('btn-collect')?.addEventListener('click', () => {
      const v = this.invoices.find((i) => i.lane === 'pending');
      if (!v) {
        this.toast('No pending invoices — queue is clear.', 'info');
        return;
      }
      v.lane = 'paid';
      v.due = 'Paid 4:05 PM';
      this.renderKanban();
      this.renderHero();
      this.toast(`${this.money(v.amount)} collected from ${v.patient} (${v.no}).`, 'success');
    });

    this.byId('btn-closing')?.addEventListener('click', () => {
      const gap = this.invoices.filter((i) => i.lane === 'overdue').length;
      this.toast(
        gap ? `Closing blocked — ${gap} overdue invoices need action first.` : 'Daily closing started — cash drawer reconciliation in progress.',
        gap ? 'error' : 'success'
      );
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
        act + (act === 'Export Revenue' ? " — CSV of today's ledger downloading." : act === 'Daily Closing' ? ' checklist opened.' : ' opened.'),
        'success'
      );
    });

    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.bl-dock')) {
        menu.classList.add('is-closed');
        fab.classList.remove('is-open');
        fab.setAttribute('aria-expanded', 'false');
      }
    });
  }
}
