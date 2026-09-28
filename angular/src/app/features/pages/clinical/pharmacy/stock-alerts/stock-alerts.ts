import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Alert {
  id: string;
  type: 'out' | 'low' | 'expiry' | 'cold' | 'controlled';
  title: string;
  body: string;
  time: string;
  state: 'open' | 'ack' | 'resolved';
  severity: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "stock-alerts" (stock-alerts.html).
 * Alert feed: filter by type/state, acknowledge/resolve/raise-PO row actions.
 */
@Component({
  imports: [],
  selector: 'app-stock-alerts',
  styleUrl: './stock-alerts.css',
  templateUrl: './stock-alerts.html',
})
export class StockAlerts implements AfterViewInit {
  private readonly TYPE: Record<string, { label: string; icon: string; tone: string; chip: string }> = {
    out: { label: 'Out of Stock', icon: 'icon-circle-x', tone: 'ph-danger', chip: 'tone-critical' },
    low: { label: 'Low Stock', icon: 'icon-triangle-alert', tone: 'ph-amber', chip: 'tone-medium' },
    expiry: { label: 'Expiry', icon: 'icon-calendar-clock', tone: 'ph-amber', chip: 'tone-medium' },
    cold: { label: 'Cold Chain', icon: 'icon-thermometer', tone: 'ph-sky', chip: 'tone-info' },
    controlled: { label: 'Controlled Count', icon: 'icon-shield', tone: 'ph-violet', chip: 'tone-critical' },
  };

  private ALERTS: Alert[] = [
    { id: 'AL-101', type: 'out', title: 'Xanax 0.5 mg out of stock', body: 'Main Pharmacy shows zero on hand. 3 scripts waiting. Reorder level 250.', time: '09:36 AM', state: 'open', severity: 3 },
    { id: 'AL-102', type: 'controlled', title: 'C-II count variance — OxyContin', body: 'Witness count found 318 tablets; register expects 320. Variance of 2 requires investigation and DEA log entry.', time: '09:20 AM', state: 'open', severity: 3 },
    { id: 'AL-103', type: 'cold', title: 'Cold room excursion — 22 minutes', body: 'Cold Chain store logged 9.4 °C peak overnight. Insulin stock quarantined pending stability check.', time: '08:47 AM', state: 'open', severity: 3 },
    { id: 'AL-104', type: 'low', title: 'Adderall 20 mg below reorder', body: '180 on hand against a reorder level of 300. Preferred supplier Cardinal Health, lead time 3 days.', time: '08:15 AM', state: 'ack', severity: 2 },
    { id: 'AL-105', type: 'expiry', title: 'Adrenaline 1:1000 expired', body: 'Batch ADR25X9 in ED Satellite passed expiry 4 days ago — 25 ampoules to withdraw.', time: '07:58 AM', state: 'open', severity: 3 },
    { id: 'AL-106', type: 'low', title: 'Ativan injection below reorder', body: '140 on hand against a reorder level of 180 in OR Store.', time: '07:40 AM', state: 'ack', severity: 2 },
    { id: 'AL-107', type: 'expiry', title: 'Zofran batch inside 30 days', body: 'Batch ZOF25Q1 expires 08 Aug — 90 units. Rotate to front and use first.', time: '07:12 AM', state: 'open', severity: 1 },
    { id: 'AL-108', type: 'cold', title: 'Fridge 2 door ajar 6 minutes', body: 'Within the 15-minute tolerance. Logged for trend only, no action needed.', time: '06:50 AM', state: 'resolved', severity: 1 },
    { id: 'AL-109', type: 'low', title: 'Codeine Linctus near reorder', body: '260 on hand, reorder at 150 — approaching threshold at current usage.', time: '06:31 AM', state: 'resolved', severity: 1 },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderFeed();

    this.byId('filter-type')?.addEventListener('change', () => this.renderFeed());
    this.byId('filter-state')?.addEventListener('change', () => this.renderFeed());

    this.byId('feed')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const ack = target.closest('[data-ack]') as HTMLElement | null;
      if (ack) {
        const a = this.ALERTS.find((x) => x.id === ack.dataset['ack']);
        if (!a) return;
        a.state = 'ack';
        this.patchAlert(a);
        this.reorderRows();
        this.renderAll();
        this.toast(a.id + ' acknowledged — assigned to the duty pharmacist.', 'info');
        return;
      }
      const res = target.closest('[data-resolve]') as HTMLElement | null;
      if (res) {
        const a = this.ALERTS.find((x) => x.id === res.dataset['resolve']);
        if (!a) return;
        a.state = 'resolved';
        this.patchAlert(a);
        this.reorderRows();
        this.renderAll();
        this.toast(a.id + ' resolved.', 'success');
        return;
      }
      const ro = target.closest('[data-reorder]') as HTMLElement | null;
      if (ro) {
        const a = this.ALERTS.find((x) => x.id === ro.dataset['reorder']);
        if (!a) return;
        this.toast('Draft PO raised from ' + a.id + ' — continue on Purchase Orders.', 'success');
      }
    });

    this.byId('btn-ack-all')?.addEventListener('click', () => {
      const open = this.ALERTS.filter((a) => a.state === 'open');
      if (!open.length) return this.toast('No open alerts to acknowledge.', 'info');
      open.forEach((a) => {
        a.state = 'ack';
        this.patchAlert(a);
      });
      this.reorderRows();
      this.renderAll();
      this.toast(open.length + ' alerts acknowledged.', 'success');
    });

    this.byId('rl-save')?.addEventListener('click', () => {
      const w = this.document.defaultView as any;
      if (w?.HSOverlay) w.HSOverlay.close('#rules-modal');
      this.toast(
        'Alert rules saved — low @ ' + this.getValue('rl-low') + '%, expiry ' + this.getValue('rl-expiry') + 'd, cold chain ' + this.getValue('rl-cold') + 'm.',
        'success',
      );
    });
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private getValue(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
  }

  private renderHero(): void {
    const open = this.ALERTS.filter((a) => a.state === 'open').length;
    const critical = this.ALERTS.filter((a) => a.state === 'open' && a.severity === 3).length;
    const flag =
      critical >= 3
        ? { cls: 'tone-critical', text: critical + ' Critical Alerts' }
        : open
          ? { cls: 'tone-medium', text: open + ' Alerts Open' }
          : { cls: 'tone-stable', text: 'All Clear' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = open + ' open alerts · ' + this.ALERTS.filter((a) => a.state === 'resolved').length + ' resolved today';
  }

  private renderKpis(): void {
    const open = this.ALERTS.filter((a) => a.state === 'open');
    const byType = (t: string) => this.ALERTS.filter((a) => a.type === t && a.state !== 'resolved').length;

    const cards = [
      { id: 'kpi-open', icon: 'icon-bell-ring', label: 'Open Alerts', value: open.length, tone: 'ph-danger', meta: 'need action' },
      { id: 'kpi-out', icon: 'icon-circle-x', label: 'Out of Stock', value: byType('out'), tone: 'ph-danger', meta: 'dispensing blocked' },
      { id: 'kpi-low', icon: 'icon-triangle-alert', label: 'Low Stock', value: byType('low'), tone: 'ph-amber', meta: 'reorder due' },
      { id: 'kpi-expiry', icon: 'icon-calendar-clock', label: 'Expiry', value: byType('expiry'), tone: 'ph-sky', meta: 'rotation / withdrawal' },
      { id: 'kpi-cold', icon: 'icon-thermometer', label: 'Cold Chain', value: byType('cold'), tone: 'ph-violet', meta: 'temperature events' },
      { id: 'kpi-controlled', icon: 'icon-shield', label: 'Controlled', value: byType('controlled'), tone: 'ph-primary', meta: 'count variances' },
    ];

    const row = this.byId('kpi-row');
    if (row) {
      row.innerHTML = cards
        .map(
          (c) =>
            '<article class="ph-kpi ' + c.tone + '"><div class="ph-kpi-head"><span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span></div>' +
            '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p><p class="ph-kpi-label">' + c.label + '</p>' +
            '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + '</p></article>',
        )
        .join('');
    }
  }

  private rowHTML(a: Alert): string {
    const t = this.TYPE[a.type];
    const stateBadge =
      a.state === 'open'
        ? '<span class="badge badge-red">Open</span>'
        : a.state === 'ack'
          ? '<span class="badge badge-amber">Acknowledged</span>'
          : '<span class="badge badge-green">Resolved</span>';

    const btns =
      a.state === 'open'
        ? '<button type="button" data-ack="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-warning/10 text-warning text-[10px] font-bold hover:bg-warning/20 transition-colors">Acknowledge</button>'
        : a.state === 'ack'
          ? '<button type="button" data-resolve="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-success/10 text-success text-[10px] font-bold hover:bg-success/20 transition-colors">Resolve</button>'
          : '';
    const reorder =
      (a.type === 'out' || a.type === 'low') && a.state !== 'resolved'
        ? '<button type="button" data-reorder="' + a.id + '" class="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition-colors">Raise PO</button>'
        : '';

    return (
      '<article class="flex gap-3 p-4' + (a.state === 'resolved' ? ' opacity-60' : '') + '" data-row-id="' + this.esc(a.id) + '">' +
      '<span class="ph-kpi-icon ' + t.tone + ' shrink-0"><i class="' + t.icon + '" aria-hidden="true"></i></span>' +
      '<div class="min-w-0 flex-1">' +
      '<div class="flex flex-wrap items-center gap-2">' +
      '<p class="text-xs font-bold text-gray-900 mr-auto">' + this.esc(a.title) + '</p>' +
      '<span class="hms-chip ' + t.chip + '">' + t.label + '</span>' + stateBadge + '</div>' +
      '<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">' + this.esc(a.body) + '</p>' +
      '<div class="mt-2 flex flex-wrap items-center gap-2">' +
      '<span class="text-[10px] font-semibold text-gray-400 tabular-nums mr-auto">' + this.esc(a.time) + ' · ' + this.esc(a.id) + '</span>' +
      reorder + btns +
      '</div></div></article>'
    );
  }

  private sortedAlerts(): Alert[] {
    return this.ALERTS.slice().sort(
      (a, b) => (a.state === 'open' ? -1 : 0) - (b.state === 'open' ? -1 : 0) || b.severity - a.severity,
    );
  }

  private renderFeed(): void {
    const type = this.getValue('filter-type');
    const stateSel = this.getValue('filter-state');

    const rows = this.ALERTS.filter((a) => {
      const okType = !type || a.type === type;
      const okState = stateSel ? a.state === stateSel : a.state !== 'resolved';
      return okType && okState;
    });
    const visible = new Set(rows.map((a) => a.id));

    const count = this.byId('feed-count');
    if (count) count.textContent = this.ALERTS.filter((a) => a.state === 'open').length + ' open';

    let anyVisible = false;
    this.byId('feed')
      ?.querySelectorAll<HTMLElement>('[data-row-id]')
      .forEach((el) => {
        const show = visible.has(el.dataset['rowId'] || '');
        el.classList.toggle('hidden', !show);
        if (show) anyVisible = true;
      });
    this.byId('feed-empty-row')?.classList.toggle('hidden', anyVisible);
  }

  private reorderRows(): void {
    const feed = this.byId('feed');
    if (!feed) return;
    this.sortedAlerts().forEach((a) => {
      const el = feed.querySelector('[data-row-id="' + a.id + '"]');
      if (el) feed.appendChild(el);
    });
    const emptyRow = this.byId('feed-empty-row');
    if (emptyRow) feed.appendChild(emptyRow);
  }

  private patchAlert(a: Alert): void {
    const el = this.byId('feed')?.querySelector('[data-row-id="' + a.id + '"]');
    if (el) el.outerHTML = this.rowHTML(a);
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderFeed();
  }
}
