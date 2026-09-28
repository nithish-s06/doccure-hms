import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Batch {
  id: string;
  med: string;
  batch: string;
  location: string;
  qty: number;
  days: number;
  expiry: string;
  price: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "Expiry Tracking" (expiry-tracking.html).
 * Watches batches approaching expiry, banded by urgency, with value-at-risk
 * and a disposal flow. Bands derive from days remaining. No API.
 */
@Component({
  imports: [],
  selector: 'app-expiry-tracking',
  styleUrl: './expiry-tracking.css',
  templateUrl: './expiry-tracking.html',
})
export class ExpiryTracking implements AfterViewInit {
  // days < 0 means already expired (relative to today, 17 Jul 2026).
  private BATCHES: Batch[] = [
    { id: 'EX-01', med: 'Insulin Glargine', batch: 'GLA26A2', location: 'Cold Chain', qty: 60, days: -12, expiry: '05 Jul 2026', price: 8.4 },
    { id: 'EX-02', med: 'Adrenaline 1:1000', batch: 'ADR25X9', location: 'ED Satellite', qty: 25, days: -4, expiry: '13 Jul 2026', price: 3.1 },
    { id: 'EX-03', med: 'Augmentin Syrup', batch: 'AUG26B4', location: 'Main Pharmacy', qty: 220, days: 41, expiry: '27 Aug 2026', price: 0.9 },
    { id: 'EX-04', med: 'Humulin R', batch: 'HUM26C8', location: 'Cold Chain', qty: 480, days: 58, expiry: '13 Sep 2026', price: 6.2 },
    { id: 'EX-05', med: 'Ventolin Inhaler', batch: 'VEN26K3', location: 'ED Satellite', qty: 310, days: 74, expiry: '29 Sep 2026', price: 4.6 },
    { id: 'EX-06', med: 'Coumadin 5 mg', batch: 'COU26A6', location: 'Main Pharmacy', qty: 1600, days: 85, expiry: '10 Oct 2026', price: 0.19 },
    { id: 'EX-07', med: 'Zofran 4 mg', batch: 'ZOF25Q1', location: 'OR Store', qty: 90, days: 22, expiry: '08 Aug 2026', price: 0.74 },
    { id: 'EX-08', med: 'Tylenol 500 mg', batch: 'TY26D077', location: 'ED Satellite', qty: 900, days: 168, expiry: '01 Jan 2027', price: 0.08 },
    { id: 'EX-09', med: 'Ativan 2 mg/mL', batch: 'ATV26F2', location: 'OR Store', qty: 140, days: 132, expiry: '26 Nov 2026', price: 1.12 },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderGrid();

    this.byId('search')?.addEventListener('input', () => this.renderGrid());
    this.byId('filter-band')?.addEventListener('change', () => this.renderGrid());

    this.byId('grid-body')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const b = this.BATCHES.find((x) => x.id === btn.dataset['id']);
      if (!b) return;
      const act = btn.dataset['act'];
      if (act === 'dispose') this.openDispose(b.id);
      else if (act === 'rotate') this.toast(b.batch + ' flagged first-out — pick before newer stock.', 'success');
      else if (act === 'return') this.toast('Return raised for ' + b.batch + ' — supplier credit requested.', 'info');
      else if (act === 'discount') this.toast(b.batch + ' marked for clearance pricing.', 'info');
    });

    this.byId('btn-dispose')?.addEventListener('click', () => {
      const expired = this.BATCHES.filter((b) => b.days < 0);
      if (!expired.length) return this.toast('No expired batches on the shelf.', 'info');
      this.openDispose(expired[0].id);
    });
    this.byId('btn-export')?.addEventListener('click', () =>
      this.toast('Expiry watchlist exported — ' + this.BATCHES.length + ' batches.', 'success'),
    );

    this.byId('dm-save')?.addEventListener('click', (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const b = this.BATCHES.find((x) => x.id === target.dataset['id']);
      if (!b) return;
      this.BATCHES = this.BATCHES.filter((x) => x.id !== b.id);
      const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + b.id + '"]');
      if (rowEl) rowEl.remove();
      const w = this.document.defaultView as any;
      if (w?.HSOverlay) w.HSOverlay.close('#dis-modal');
      this.renderAll();
      const method = this.getValue('dm-method').toLowerCase();
      this.toast(b.batch + ' disposed via ' + method + ' — logged in the register.', 'success');
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

  private band(b: Batch): { key: string; label: string; badge: string; tone: string; rank: number } {
    if (b.days < 0) return { key: 'expired', label: 'Expired', badge: 'badge-red', tone: 'stock-out', rank: 0 };
    if (b.days <= 30) return { key: '30', label: '≤ 30 days', badge: 'badge-red', tone: 'stock-out', rank: 1 };
    if (b.days <= 90) return { key: '90', label: '≤ 90 days', badge: 'badge-amber', tone: 'stock-low', rank: 2 };
    return { key: '180', label: '≤ 180 days', badge: 'badge-blue', tone: 'stock-ok', rank: 3 };
  }

  private money(n: number): string {
    return '$' + Math.round(n).toLocaleString();
  }

  private atRisk(b: Batch): number {
    return b.qty * b.price;
  }

  private renderHero(): void {
    const expired = this.BATCHES.filter((b) => b.days < 0).length;
    const soon = this.BATCHES.filter((b) => b.days >= 0 && b.days <= 30).length;
    const flag = expired
      ? { cls: 'tone-critical', text: expired + ' Expired On Shelf' }
      : soon
        ? { cls: 'tone-medium', text: 'Rotation Needed' }
        : { cls: 'tone-stable', text: 'No Imminent Expiries' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) {
      summary.textContent =
        this.BATCHES.length + ' batches watched · ' + this.money(this.BATCHES.reduce((s, b) => s + this.atRisk(b), 0)) + ' at risk';
    }
  }

  private renderKpis(): void {
    const inBand = (k: string) => this.BATCHES.filter((b) => this.band(b).key === k);
    const expired = inBand('expired');
    const risk30 = inBand('30').reduce((s, b) => s + this.atRisk(b), 0);
    const totalRisk = this.BATCHES.reduce((s, b) => s + this.atRisk(b), 0);

    const cards = [
      { id: 'kpi-watched', icon: 'icon-calendar-clock', label: 'Watched Batches', value: this.BATCHES.length, tone: 'ph-primary', meta: 'within 180 days' },
      { id: 'kpi-expired', icon: 'icon-circle-x', label: 'Expired', value: expired.length, tone: 'ph-danger', meta: 'remove from shelf' },
      { id: 'kpi-30', icon: 'icon-triangle-alert', label: '≤ 30 Days', value: inBand('30').length, tone: 'ph-amber', meta: this.money(risk30) + ' at risk' },
      { id: 'kpi-90', icon: 'icon-clock', label: '≤ 90 Days', value: inBand('90').length, tone: 'ph-sky', meta: 'rotate to front' },
      { id: 'kpi-180', icon: 'icon-calendar', label: '≤ 180 Days', value: inBand('180').length, tone: 'ph-violet', meta: 'on the horizon' },
      { id: 'kpi-risk', icon: 'icon-dollar-sign', label: 'Value at Risk', value: this.money(totalRisk), tone: 'ph-slate', meta: 'if all wasted' },
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

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const bd = this.getValue('filter-band');

    const matches = this.BATCHES.filter((b) => {
      const hit = !q || b.med.toLowerCase().includes(q) || b.batch.toLowerCase().includes(q);
      return hit && (!bd || this.band(b).key === bd);
    });
    const visible = new Set(matches.map((b) => b.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = matches.length + (matches.length === 1 ? ' batch' : ' batches');

    let anyVisible = false;
    this.byId('grid-body')
      ?.querySelectorAll<HTMLElement>('[data-row-id]')
      .forEach((tr) => {
        const show = visible.has(tr.dataset['rowId'] || '');
        tr.classList.toggle('hidden', !show);
        if (show) anyVisible = true;
      });
    this.byId('grid-empty-row')?.classList.toggle('hidden', anyVisible);
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderGrid();
  }

  private openDispose(id: string): void {
    const b = this.BATCHES.find((x) => x.id === id);
    if (!b) return;
    const sub = this.byId('dm-sub');
    if (sub) sub.textContent = b.med + ' · ' + b.batch + ' · ' + b.qty.toLocaleString() + ' units (' + this.money(this.atRisk(b)) + ')';
    const notes = this.byId('dm-notes') as HTMLTextAreaElement | null;
    if (notes) notes.value = '';
    const save = this.byId('dm-save');
    if (save) save.dataset['id'] = b.id;
    const w = this.document.defaultView as any;
    if (w?.HSOverlay) w.HSOverlay.open('#dis-modal');
  }
}
