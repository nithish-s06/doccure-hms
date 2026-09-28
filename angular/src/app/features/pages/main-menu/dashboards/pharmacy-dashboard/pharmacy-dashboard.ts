import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface RxItem {
  id: string;
  patient: string;
  doctor: string;
  pri: string;
  meds: number;
  mins: number;
  pay: string;
  lane: string;
}

interface Lane {
  key: string;
  label: string;
  tone: string;
}

interface InventoryStat {
  label: string;
  val: string;
  pct: number;
  tone: string;
  icon: string;
  sub: string;
}

interface LowStockItem {
  name: string;
  cat: string;
  qty: number;
  min: number;
  supplier: string;
  next: string;
  tone: string;
}

interface ExpiryItem {
  name: string;
  qty: string;
  batch: string;
}

interface ExpiryWindow {
  window: string;
  tone: string;
  critical: boolean;
  items: ExpiryItem[];
}

interface VaultRow {
  label: string;
  val: string;
}

interface VaultAudit {
  due: string;
  items: number;
  last: string;
}

interface Supplier {
  name: string;
  kind: string;
  tone: string;
  eta: string;
  detail: string;
  late: boolean;
}

interface PoStat {
  label: string;
  n: number;
  tone: string;
  icon: string;
}

interface PoItem {
  id: string;
  detail: string;
  state: string;
  tone: string;
}

interface Category {
  name: string;
  icon: string;
  pct: number;
  tone: string;
  n: string;
}

interface FinItem {
  label: string;
  val: string;
  n: string;
  tone: string;
  icon: string;
}

interface ActivityItem {
  time: string;
  cat: string;
  icon: string;
  tone: string;
  text: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "pharmacy-dashboard".
 * The hero, workflow steps, kanban, inventory, low stock, expiry, vault,
 * suppliers, purchase center, categories, finance and activity panels
 * ship as static markup matching this seed data; this only wires the
 * mutation handlers (fast-track, drag/drop and button advance/hold on
 * the kanban, reorder, chase supplier, new PO, activity filter, hero
 * quick actions, and the floating dock).
 */
@Component({
  imports: [],
  selector: 'app-pharmacy-dashboard',
  styleUrl: './pharmacy-dashboard.css',
  templateUrl: './pharmacy-dashboard.html',
})
export class PharmacyDashboard implements AfterViewInit {
  private rx: RxItem[] = [
    { id: 'RX-2481', patient: 'Miriam Adeyemi', doctor: 'Dr. Chen', pri: 'Urgent', meds: 4, mins: 3, pay: 'Insurance', lane: 'new' },
    { id: 'RX-2482', patient: 'Peter Kowalski', doctor: 'Dr. Osei', pri: 'Normal', meds: 2, mins: 6, pay: 'Paid', lane: 'new' },
    { id: 'RX-2478', patient: 'Rosa Delgado', doctor: 'Dr. Chen', pri: 'Urgent', meds: 3, mins: 12, pay: 'Insurance', lane: 'verify' },
    { id: 'RX-2479', patient: 'Theo Lindqvist', doctor: 'Dr. Osei', pri: 'Normal', meds: 1, mins: 9, pay: 'Pending', lane: 'verify' },
    { id: 'RX-2475', patient: 'Harold Nakamura', doctor: 'Dr. Chen', pri: 'Normal', meds: 5, mins: 18, pay: 'Paid', lane: 'prep' },
    { id: 'RX-2476', patient: 'Sofia Marino', doctor: 'Dr. Nakato', pri: 'Normal', meds: 2, mins: 15, pay: 'Paid', lane: 'prep' },
    { id: 'RX-2472', patient: 'Fatima Al-Rashid', doctor: 'Dr. Ferreira', pri: 'Emergency', meds: 2, mins: 22, pay: 'Insurance', lane: 'ready' },
    { id: 'RX-2473', patient: 'Johan Petersen', doctor: 'Dr. Chen', pri: 'Normal', meds: 3, mins: 20, pay: 'Paid', lane: 'ready' },
    { id: 'RX-2468', patient: 'Margaret Whitfield', doctor: 'Dr. Ferreira', pri: 'Normal', meds: 6, mins: 0, pay: 'Paid', lane: 'done' },
    { id: 'RX-2469', patient: 'Hana Suzuki', doctor: 'Dr. Nakato', pri: 'Normal', meds: 1, mins: 0, pay: 'Paid', lane: 'done' },
    { id: 'RX-2470', patient: 'George Mensah', doctor: 'Dr. Chen', pri: 'VIP', meds: 2, mins: 0, pay: 'Paid', lane: 'done' },
  ];

  private readonly lanes: Lane[] = [
    { key: 'new', label: 'New', tone: 'rx-sky' },
    { key: 'verify', label: 'Verification', tone: 'rx-amber' },
    { key: 'prep', label: 'Preparing', tone: 'rx-violet' },
    { key: 'ready', label: 'Ready', tone: 'rx-lime' },
    { key: 'done', label: 'Dispensed', tone: 'rx-emerald' },
  ];

  private readonly nextLane: Record<string, string> = { new: 'verify', verify: 'prep', prep: 'ready', ready: 'done' };
  private readonly priTone: Record<string, string> = { Emergency: 'rx-rose', Urgent: 'rx-amber', VIP: 'rx-violet', Normal: 'rx-sky' };
  private readonly payTone: Record<string, string> = { Paid: 'rx-emerald', Insurance: 'rx-sky', Pending: 'rx-amber' };

  private readonly inventory: InventoryStat[] = [
    { label: 'Total Medicines', val: '1,284', pct: 100, tone: 'rx-emerald', icon: 'icon-boxes', sub: 'SKUs on formulary' },
    { label: 'Low Stock', val: '17', pct: 22, tone: 'rx-amber', icon: 'icon-package-minus', sub: 'below minimum' },
    { label: 'Out of Stock', val: '4', pct: 8, tone: 'rx-rose', icon: 'icon-package-x', sub: 'substitutes flagged' },
    { label: 'Expiring Soon', val: '23', pct: 30, tone: 'rx-orange, rx-amber', icon: 'icon-calendar-x', sub: 'within 90 days' },
    { label: 'Controlled Drugs', val: '36', pct: 88, tone: 'rx-violet', icon: 'icon-vault', sub: 'vault stock healthy' },
    { label: 'Returned Today', val: '6', pct: 15, tone: 'rx-sky', icon: 'icon-rotate-ccw', sub: 'pending restock QC' },
    { label: 'Pending Reorders', val: '12', pct: 40, tone: 'rx-indigo', icon: 'icon-truck', sub: '5 arriving this week' },
    { label: 'Recalled Batches', val: '2', pct: 5, tone: 'rx-rose', icon: 'icon-triangle-alert', sub: 'quarantined, pending pickup' },
  ];

  private low: LowStockItem[] = [
    { name: 'Amoxicillin 500 mg', cat: 'Capsules', qty: 42, min: 200, supplier: 'MediSupply Co.', next: 'Jul 19', tone: 'rx-rose' },
    { name: 'Insulin Glargine 100 IU', cat: 'Injections', qty: 8, min: 40, supplier: 'BioPharm Labs', next: 'Jul 18', tone: 'rx-rose' },
    { name: 'Salbutamol Inhaler', cat: 'Respiratory', qty: 15, min: 60, supplier: 'AeroMed Ltd.', next: 'Jul 20', tone: 'rx-amber' },
    { name: 'Paracetamol Syrup 125 mg', cat: 'Syrups', qty: 34, min: 100, supplier: 'MediSupply Co.', next: 'Jul 19', tone: 'rx-amber' },
    { name: 'Enoxaparin 40 mg', cat: 'Injections', qty: 22, min: 80, supplier: 'BioPharm Labs', next: 'Jul 21', tone: 'rx-amber' },
    { name: 'ORS Sachets', cat: 'Supplies', qty: 55, min: 150, supplier: 'GlobalCare Dist.', next: 'Jul 22', tone: 'rx-lime' },
  ];

  private readonly expiry: ExpiryWindow[] = [
    {
      window: 'Today', tone: 'rx-rose', critical: true, items: [
        { name: 'Adrenaline 1 mg amp', qty: '6 amps', batch: 'B-4417' },
        { name: 'Cefuroxime 750 mg inj', qty: '12 vials', batch: 'B-3921' },
      ],
    },
    {
      window: '7 Days', tone: 'rx-amber', critical: false, items: [
        { name: 'Metronidazole IV 500 mg', qty: '18 bags', batch: 'B-4102' },
        { name: 'Vitamin K amp', qty: '9 amps', batch: 'B-4230' },
        { name: 'Lidocaine 2% vial', qty: '14 vials', batch: 'B-4055' },
      ],
    },
    {
      window: '30 Days', tone: 'rx-lime', critical: false, items: [
        { name: 'Omeprazole 20 mg caps', qty: '240 caps', batch: 'B-3877' },
        { name: 'Hepatitis B vaccine', qty: '20 doses', batch: 'B-4310' },
        { name: 'Diazepam 5 mg tabs', qty: '90 tabs', batch: 'B-3990' },
      ],
    },
    {
      window: '90 Days', tone: 'rx-sky', critical: false, items: [
        { name: 'Atorvastatin 20 mg', qty: '600 tabs', batch: 'B-3712' },
        { name: 'Ibuprofen susp 100 mg', qty: '45 btls', batch: 'B-3844' },
      ],
    },
  ];

  private readonly vaultRows: VaultRow[] = [
    { label: 'Controlled medicines', val: '36 SKUs' },
    { label: 'Dispensed today', val: '11 doses' },
    { label: 'Remaining vault stock', val: '412 units' },
    { label: 'Register entries today', val: '22 · dual-signed' },
    { label: 'Discrepancies flagged', val: '0 open' },
    { label: 'Next reconciliation', val: 'Jul 18 · 9:00 AM' },
  ];
  private readonly vaultAudit: VaultAudit = { due: '2:00 PM', items: 3, last: 'Jul 15 · clean' };

  private suppliers: Supplier[] = [
    { name: 'MediSupply Co.', kind: 'Delivery inbound', tone: 'rx-sky', eta: 'ETA 1:30 PM', detail: 'PO-1142 · 18 lines · antibiotics restock', late: false },
    { name: 'BioPharm Labs', kind: 'Late delivery', tone: 'rx-rose', eta: '1 day late', detail: 'PO-1138 · insulin cold-chain — escalated', late: true },
    { name: 'AeroMed Ltd.', kind: 'PO confirmed', tone: 'rx-lime', eta: 'Ships Jul 19', detail: 'PO-1145 · respiratory line', late: false },
  ];

  private readonly poStats: PoStat[] = [
    { label: 'Purchase requests', n: 6, tone: 'rx-sky', icon: 'icon-file-plus' },
    { label: 'Pending approval', n: 3, tone: 'rx-amber', icon: 'icon-hourglass' },
    { label: 'Approved orders', n: 4, tone: 'rx-lime', icon: 'icon-check' },
    { label: 'Received today', n: 2, tone: 'rx-emerald', icon: 'icon-package-check' },
  ];

  private poList: PoItem[] = [
    { id: 'PO-1146', detail: 'Emergency insulin restock · BioPharm', state: 'Awaiting approval', tone: 'rx-amber' },
    { id: 'PO-1145', detail: 'Respiratory line · AeroMed', state: 'Approved', tone: 'rx-lime' },
    { id: 'PO-1144', detail: 'IV fluids bulk · GlobalCare', state: 'Received', tone: 'rx-emerald' },
  ];

  private readonly cats: Category[] = [
    { name: 'Tablets', icon: 'icon-tablets', pct: 84, tone: 'rx-emerald', n: '486 SKUs' },
    { name: 'Capsules', icon: 'icon-pill', pct: 71, tone: 'rx-lime', n: '302 SKUs' },
    { name: 'Syrups', icon: 'icon-flask-round', pct: 58, tone: 'rx-amber', n: '124 SKUs' },
    { name: 'Injections', icon: 'icon-syringe', pct: 43, tone: 'rx-rose', n: '168 SKUs' },
    { name: 'Vaccines', icon: 'icon-shield-plus', pct: 77, tone: 'rx-sky', n: '38 SKUs' },
    { name: 'Supplies', icon: 'icon-briefcase-medical', pct: 66, tone: 'rx-violet', n: '166 SKUs' },
  ];

  private readonly fin: FinItem[] = [
    { label: 'Daily Sales', val: '$6,240', n: '142 receipts', tone: 'rx-lime', icon: 'icon-receipt' },
    { label: 'Insurance Claims', val: '$3,910', n: '31 claims filed', tone: 'rx-sky', icon: 'icon-shield-check' },
    { label: 'Refunds', val: '$180', n: '4 processed', tone: 'rx-rose', icon: 'icon-rotate-ccw' },
    { label: 'Purchase Cost', val: '$4,860', n: '3 POs paid', tone: 'rx-amber', icon: 'icon-shopping-cart' },
  ];

  private activity: ActivityItem[] = [
    { time: '12:36 PM', cat: 'Prescriptions', icon: 'icon-file-check', tone: 'rx-emerald', text: 'RX-2478 verified — interaction check clear for Rosa Delgado' },
    { time: '12:32 PM', cat: 'Dispensing', icon: 'icon-pill', tone: 'rx-lime', text: 'RX-2470 dispensed to George Mensah — counselling done at Counter 3' },
    { time: '12:28 PM', cat: 'Stock', icon: 'icon-package-minus', tone: 'rx-amber', text: 'Low stock alert — Insulin Glargine below minimum (8 left)' },
    { time: '12:20 PM', cat: 'Controlled', icon: 'icon-vault', tone: 'rx-violet', text: 'Morphine 10 mg issued to ICU — dual signature logged' },
    { time: '12:12 PM', cat: 'Purchases', icon: 'icon-shopping-cart', tone: 'rx-sky', text: 'PO-1146 raised — emergency insulin restock sent for approval' },
    { time: '12:05 PM', cat: 'Stock', icon: 'icon-rotate-ccw', tone: 'rx-amber', text: '6 units of Ceftriaxone returned from Ward 4B — QC pending' },
    { time: '11:58 AM', cat: 'Dispensing', icon: 'icon-pill', tone: 'rx-lime', text: 'RX-2469 dispensed to Hana Suzuki — insurance co-pay collected' },
    { time: '11:45 AM', cat: 'Prescriptions', icon: 'icon-inbox', tone: 'rx-emerald', text: '4 new e-prescriptions received from OPD clinics' },
    { time: '11:30 AM', cat: 'Purchases', icon: 'icon-package-check', tone: 'rx-sky', text: 'PO-1144 received — 24 lines checked into main store' },
    { time: '11:10 AM', cat: 'Controlled', icon: 'icon-clipboard-check', tone: 'rx-violet', text: 'Vault count reconciled — no variance across 36 SKUs' },
  ];

  private actFilter = 'All';
  private dragRxId: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireKanbanOps();
    this.wireLowStock();
    this.wireSuppliers();
    this.wirePurchases();
    this.wireActivityFilters();
    this.wireHeroActions();
    this.wireKanbanDrag();
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

  private initials(name: string): string {
    return name
      .replace(/^(Dr|Mr|Mrs|Ms)\.?\s+/i, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  private toast(message: string, tone: 'success' | 'info' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  /* ---------------- Hero (emergency strip) ---------------- */

  private renderHero(): void {
    const strip = this.byId('urgent-strip');
    if (!strip) return;
    const e = this.rx.find((r) => r.pri === 'Emergency' && r.lane !== 'done');
    if (e) {
      strip.classList.add('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-500/25 text-rose-200"><i class="icon-siren" aria-hidden="true"></i></span>' +
        `<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-rose-200">Emergency order — ${this.escapeHtml(e.id)}</p>` +
        `<p class="mt-0.5 text-xs font-medium text-white/70">${this.escapeHtml(e.patient)} · ${this.escapeHtml(e.doctor)} · ${e.meds} items · waiting ${e.mins} min — ready for handoff at Counter 1.</p></div>` +
        '<button type="button" id="btn-rush" class="rx-action shrink-0"><i class="icon-zap" aria-hidden="true"></i>Fast-track</button>';
      this.byId('btn-rush')?.addEventListener('click', () => {
        e.lane = 'done';
        this.renderAll();
        this.toast(`${e.id} fast-tracked and dispensed — porter notified.`, 'success');
      });
    } else {
      strip.classList.remove('is-alert');
      strip.innerHTML =
        '<span class="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-200"><i class="icon-shield-check" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-extrabold uppercase tracking-wider text-emerald-200">No emergency orders</p>' +
        '<p class="mt-0.5 text-xs font-medium text-white/70">All urgent prescriptions cleared. Crash-cart stock verified at 12:00 PM.</p></div>';
    }
  }

  /* ---------------- Kanban ---------------- */

  private renderKanban(): void {
    const wrap = this.byId('kanban');
    if (!wrap) return;
    wrap.innerHTML = this.lanes
      .map((l) => {
        const items = this.rx.filter((r) => r.lane === l.key);
        const cards =
          items
            .map((r) => {
              const priChip = r.pri !== 'Normal' ? `<span class="rx-chip ${this.priTone[r.pri]} text-[9px]">${r.pri}</span>` : '';
              const minsChip =
                r.mins && l.key !== 'done'
                  ? `<span class="ml-auto text-[9px] font-bold text-gray-400 tabular-nums"><i class="icon-clock text-[9px]" aria-hidden="true"></i> ${r.mins}m</span>`
                  : '';
              const actions =
                l.key !== 'done'
                  ? '<div class="mt-2 flex items-center gap-0.5 border-t border-dashed border-border-color pt-1.5 dark:border-white/10" role="group" aria-label="' +
                    this.escapeHtml(r.id) +
                    ' actions">' +
                    `<button type="button" class="rx-card-btn" data-rx="view" data-id="${this.escapeHtml(r.id)}" title="View" aria-label="View prescription"><i class="icon-eye" aria-hidden="true"></i></button>` +
                    (l.key === 'new' ? `<button type="button" class="rx-card-btn" data-rx="advance" data-id="${this.escapeHtml(r.id)}" title="Verify" aria-label="Verify"><i class="icon-file-check" aria-hidden="true"></i></button>` : '') +
                    (l.key === 'verify' || l.key === 'prep' ? `<button type="button" class="rx-card-btn" data-rx="advance" data-id="${this.escapeHtml(r.id)}" title="Advance" aria-label="Advance stage"><i class="icon-arrow-right" aria-hidden="true"></i></button>` : '') +
                    (l.key === 'ready' ? `<button type="button" class="rx-card-btn" data-rx="advance" data-id="${this.escapeHtml(r.id)}" title="Dispense" aria-label="Dispense"><i class="icon-pill" aria-hidden="true"></i></button>` : '') +
                    `<button type="button" class="rx-card-btn" data-rx="hold" data-id="${this.escapeHtml(r.id)}" title="Hold" aria-label="Hold"><i class="icon-pause" aria-hidden="true"></i></button>` +
                    `<button type="button" class="rx-card-btn" data-rx="label" data-id="${this.escapeHtml(r.id)}" title="Print label" aria-label="Print label"><i class="icon-printer" aria-hidden="true"></i></button>` +
                    '</div>'
                  : '';
              return (
                `<div class="rx-card ${l.tone}${r.pri === 'Emergency' && l.key !== 'done' ? ' is-stat' : ''}" draggable="true" data-id="${this.escapeHtml(r.id)}">` +
                '<div class="flex items-center gap-1.5">' +
                `<span class="rx-id">${this.escapeHtml(r.id)}</span>` +
                priChip +
                minsChip +
                '</div>' +
                `<p class="mt-1.5 truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(r.patient)}</p>` +
                `<p class="mt-0.5 text-[10px] font-semibold text-gray-500">${this.escapeHtml(r.doctor)} · ${r.meds} item${r.meds > 1 ? 's' : ''}</p>` +
                `<span class="mt-1 rx-chip ${this.payTone[r.pay]} text-[9px]">${r.pay}</span>` +
                actions +
                '</div>'
              );
            })
            .join('') || '<p class="py-4 text-center text-[10px] font-semibold text-gray-400">Empty</p>';
        return (
          `<div class="rx-lane ${l.tone}" data-lane="${l.key}"><div class="mb-2 flex items-center justify-between px-1">` +
          `<p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${l.label}</p><span class="rx-chip ${l.tone}">${items.length}</span></div>` +
          cards +
          '</div>'
        );
      })
      .join('');
    const active = this.rx.filter((r) => r.lane !== 'done').length;
    const avg = Math.round(this.rx.filter((r) => r.lane !== 'done').reduce((s, r) => s + r.mins, 0) / Math.max(1, active));
    const chip = this.byId('queue-chip');
    if (chip) chip.textContent = `${active} active · avg ${avg}m in queue`;
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKanban();
  }

  private wireKanbanOps(): void {
    this.byId('kanban')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-rx]') as HTMLElement | null;
      if (!btn) return;
      const r = this.rx.find((x) => x.id === btn.dataset['id']);
      if (!r) return;
      const op = btn.dataset['rx'];
      if (op === 'view') {
        this.toast(`${r.id} opened — ${r.meds} items for ${r.patient}.`, 'info');
        return;
      }
      if (op === 'label') {
        this.toast(`Label printed for ${r.id} — ${r.patient}.`, 'success');
        return;
      }
      if (op === 'hold') {
        r.lane = 'new';
        this.renderAll();
        this.toast(`${r.id} placed on hold — returned to New.`, 'info');
        return;
      }
      if (op === 'advance') {
        const to = this.nextLane[r.lane];
        r.lane = to;
        if (to === 'done') r.mins = 0;
        this.renderAll();
        const msgs: Record<string, string> = {
          verify: 'sent to verification',
          prep: 'verified — picking started',
          ready: 'reviewed — ready at counter',
          done: `dispensed to ${r.patient}`,
        };
        this.toast(`${r.id} ${msgs[to]}.`, 'success');
      }
    });
  }

  private wireKanbanDrag(): void {
    this.document.addEventListener('dragstart', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('#kanban [data-id]') as HTMLElement | null;
      if (!card) return;
      this.dragRxId = card.dataset['id'] || null;
      card.classList.add('is-dragging');
    });
    this.document.addEventListener('dragend', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('#kanban [data-id]') as HTMLElement | null;
      if (card) card.classList.remove('is-dragging');
      this.document.querySelectorAll('#kanban .rx-lane').forEach((l) => l.classList.remove('is-drop-target'));
    });
    this.document.addEventListener('dragover', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const lane = target.closest('#kanban [data-lane]') as HTMLElement | null;
      if (!lane) return;
      e.preventDefault();
      this.document.querySelectorAll('#kanban .rx-lane').forEach((l) => l.classList.toggle('is-drop-target', l === lane));
    });
    this.document.addEventListener('drop', (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const lane = target.closest('#kanban [data-lane]') as HTMLElement | null;
      if (!lane || this.dragRxId == null) return;
      e.preventDefault();
      const r = this.rx.find((x) => x.id === this.dragRxId);
      const laneKey = lane.dataset['lane'] || '';
      if (r && r.lane !== laneKey) {
        r.lane = laneKey;
        if (r.lane === 'done') r.mins = 0;
        this.renderAll();
        const laneDef = this.lanes.find((l) => l.key === r.lane);
        this.toast(`${r.id} moved to ${laneDef?.label ?? r.lane}.`, 'success');
      }
      this.dragRxId = null;
    });
  }

  /* ---------------- Inventory monitor ---------------- */

  private renderInventory(): void {
    const wrap = this.byId('inventory');
    if (!wrap) return;
    wrap.innerHTML = this.inventory
      .map((v) => {
        const tone = v.tone.split(',').pop()!.trim();
        const C = 2 * Math.PI * 20;
        return (
          `<div class="rx-inv ${tone}">` +
          '<span class="rx-ring"><svg viewBox="0 0 48 48"><circle class="rx-ring-track" cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="4"/>' +
          `<circle class="rx-ring-fill" cx="24" cy="24" r="20" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - v.pct / 100)).toFixed(1)}"/></svg>` +
          `<span class="rx-ring-label"><i class="${v.icon}" aria-hidden="true"></i></span></span>` +
          `<div class="min-w-0"><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">${v.val}</p>` +
          `<p class="mt-0.5 text-[10px] font-bold text-gray-500">${v.label}</p>` +
          `<p class="text-[9px] font-semibold text-gray-400">${v.sub}</p></div></div>`
        );
      })
      .join('');
  }

  /* ---------------- Low stock ---------------- */

  private renderLow(): void {
    const wrap = this.byId('lowstock');
    if (wrap) {
      wrap.innerHTML = this.low
        .map((m, i) => {
          const pct = Math.min(100, Math.round((m.qty / m.min) * 100));
          return (
            `<div class="rx-med ${m.tone}"><div class="flex items-start justify-between gap-2">` +
            `<div class="min-w-0"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(m.name)}</p>` +
            `<p class="mt-0.5 text-[10px] font-bold text-gray-500">${this.escapeHtml(m.cat)} · ${this.escapeHtml(m.supplier)}</p></div>` +
            `<button type="button" data-po="${i}" class="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300">Reorder</button></div>` +
            `<div class="rx-med-track"><div class="rx-med-fill" style="width:0%" data-w="${pct}"></div></div>` +
            '<div class="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-gray-400">' +
            `<span class="tabular-nums"><b class="font-extrabold text-gray-700 dark:text-gray-200">${m.qty}</b> of ${m.min} min</span>` +
            `<span><i class="icon-calendar text-[10px]" aria-hidden="true"></i> Next PO ${this.escapeHtml(m.next)}</span></div></div>`
          );
        })
        .join('');
      requestAnimationFrame(() =>
        this.document.querySelectorAll<HTMLElement>('.rx-med-fill').forEach((f) => (f.style.width = `${f.dataset['w']}%`))
      );
    }
    const chip = this.byId('low-chip');
    if (chip) chip.textContent = `${this.low.length} below minimum`;
  }

  private wireLowStock(): void {
    this.byId('lowstock')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-po]') as HTMLElement | null;
      if (!b) return;
      const m = this.low[parseInt(b.dataset['po'] || '-1', 10)];
      if (!m) return;
      this.toast(`Purchase request raised for ${m.name} — ${m.supplier}.`, 'success');
    });
    this.byId('btn-po-all')?.addEventListener('click', () =>
      this.toast(`Bulk purchase order drafted for ${this.low.length} low-stock lines.`, 'success')
    );
  }

  /* ---------------- Expiry ---------------- */

  private renderExpiry(): void {
    const wrap = this.byId('expiry');
    if (wrap) {
      wrap.innerHTML = this.expiry
        .map(
          (w) =>
            `<div class="rx-exp ${w.tone}${w.critical ? ' is-critical' : ''}">` +
            `<div class="mb-2 flex items-center justify-between"><p class="text-[11px] font-extrabold uppercase tracking-wider text-gray-500">${w.window}</p>` +
            `<span class="rx-chip ${w.tone}">${w.items.length}${w.critical ? ' · act now' : ''}</span></div>` +
            w.items
              .map(
                (it) =>
                  `<div class="rx-exp-item"><div class="min-w-0"><p class="truncate font-extrabold text-gray-800 dark:text-gray-200">${this.escapeHtml(it.name)}</p>` +
                  `<p class="text-[9px] text-gray-400">Batch ${this.escapeHtml(it.batch)}</p></div>` +
                  `<span class="shrink-0 tabular-nums text-[10px] font-bold text-gray-500">${this.escapeHtml(it.qty)}</span></div>`
              )
              .join('') +
            '</div>'
        )
        .join('');
    }
    const chip = this.byId('exp-chip');
    if (chip) chip.textContent = `${this.expiry[0].items.length} expiring today`;
  }

  /* ---------------- Controlled drug vault ---------------- */

  private renderVault(): void {
    const rows = this.byId('vault');
    if (rows) {
      rows.innerHTML = this.vaultRows
        .map((r) => `<div class="rx-vault-row"><span>${r.label}</span><b class="font-extrabold text-gray-900 tabular-nums">${r.val}</b></div>`)
        .join('');
    }
    const audit = this.byId('vault-audit');
    if (audit) {
      audit.innerHTML =
        '<div class="flex items-center gap-2.5"><span class="rx-panel-icon rx-amber !size-8 text-xs"><i class="icon-clipboard-check" aria-hidden="true"></i></span>' +
        `<div class="min-w-0 flex-1"><p class="text-[11px] font-extrabold text-gray-900">Audit pending — ${this.vaultAudit.items} schedules</p>` +
        `<p class="text-[10px] font-semibold text-gray-400">Due ${this.vaultAudit.due} · last audit ${this.vaultAudit.last}</p></div>` +
        '<button type="button" id="btn-vault-audit" class="shrink-0 rounded-lg bg-violet-500/10 px-2 py-1 text-[10px] font-extrabold text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-300">Start</button></div>';
      this.byId('btn-vault-audit')?.addEventListener('click', () =>
        this.toast('Controlled-drug audit opened — second pharmacist signature required.', 'info')
      );
    }
  }

  /* ---------------- Suppliers ---------------- */

  private renderSuppliers(): void {
    const wrap = this.byId('suppliers');
    if (wrap) {
      wrap.innerHTML = this.suppliers
        .map(
          (s, i) =>
            `<div class="rx-sup ${s.tone}"><span class="rx-sup-logo">${this.escapeHtml(this.initials(s.name))}</span>` +
            `<div class="min-w-0 flex-1"><div class="flex items-center gap-2"><p class="truncate text-xs font-extrabold text-gray-900">${this.escapeHtml(s.name)}</p>` +
            `<span class="ml-auto shrink-0 text-[10px] font-bold ${s.late ? 'text-rose-500' : 'text-gray-400'} tabular-nums">${this.escapeHtml(s.eta)}</span></div>` +
            `<span class="mt-0.5 rx-chip ${s.tone} text-[9px]">${s.kind}</span>` +
            `<p class="mt-1 truncate text-[10px] font-semibold text-gray-400">${this.escapeHtml(s.detail)}</p></div>` +
            (s.late
              ? `<button type="button" data-chase="${i}" class="shrink-0 self-center rounded-lg bg-rose-500/10 px-2 py-1 text-[10px] font-extrabold text-rose-600 transition-colors hover:bg-rose-500/20 dark:text-rose-300">Chase</button>`
              : '') +
            '</div>'
        )
        .join('');
    }
    const chip = this.byId('sup-chip');
    if (chip) chip.textContent = `${this.suppliers.length} active · ${this.suppliers.filter((s) => s.late).length} late`;
  }

  private wireSuppliers(): void {
    this.byId('suppliers')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-chase]') as HTMLElement | null;
      if (!b) return;
      const s = this.suppliers[parseInt(b.dataset['chase'] || '-1', 10)];
      if (!s) return;
      s.late = false;
      s.kind = 'Escalated — replied';
      s.tone = 'rx-amber';
      s.eta = 'ETA 4:00 PM';
      this.renderSuppliers();
      this.toast(`${s.name} chased — cold-chain delivery confirmed for 4:00 PM.`, 'success');
    });
  }

  /* ---------------- Purchase center ---------------- */

  private renderPo(): void {
    const stats = this.byId('po-stats');
    if (stats) {
      stats.innerHTML = this.poStats
        .map(
          (s) =>
            `<div class="rx-panel ${s.tone} !flex-row items-center gap-2.5 !rounded-2xl p-2.5"><span class="rx-panel-icon !size-8 text-xs"><i class="${s.icon}" aria-hidden="true"></i></span>` +
            `<div><p class="text-base font-extrabold leading-none text-gray-900 tabular-nums">${s.n}</p><p class="mt-0.5 text-[10px] font-bold text-gray-400">${s.label}</p></div></div>`
        )
        .join('');
    }
    const list = this.byId('po-list');
    if (list) {
      list.innerHTML = this.poList
        .map(
          (p) =>
            '<div class="flex items-center gap-2.5 rounded-xl border border-border-color p-2.5 dark:border-white/10">' +
            `<span class="rx-id ${p.tone}">${this.escapeHtml(p.id)}</span>` +
            `<p class="min-w-0 flex-1 truncate text-[11px] font-semibold text-gray-600 dark:text-gray-300">${this.escapeHtml(p.detail)}</p>` +
            `<span class="rx-chip ${p.tone} text-[9px]">${p.state}</span></div>`
        )
        .join('');
    }
  }

  private wirePurchases(): void {
    this.byId('btn-new-po')?.addEventListener('click', () => {
      this.poList.unshift({ id: 'PO-1147', detail: 'Draft — add lines from low stock', state: 'Awaiting approval', tone: 'rx-amber' });
      this.renderPo();
      this.toast('PO-1147 drafted — add lines and submit for approval.', 'success');
    });
  }

  /* ---------------- Categories ---------------- */

  private renderCats(): void {
    const wrap = this.byId('categories');
    if (!wrap) return;
    wrap.innerHTML = this.cats
      .map((c) => {
        const C = 2 * Math.PI * 24;
        return (
          `<div class="rx-shelf ${c.tone}">` +
          '<div class="relative mx-auto grid size-16 place-items-center">' +
          '<svg class="absolute inset-0 size-16 -rotate-90" viewBox="0 0 56 56"><circle class="rx-ring-track" cx="28" cy="28" r="24" fill="none" stroke="currentColor" stroke-width="4"/>' +
          `<circle class="rx-ring-fill" cx="28" cy="28" r="24" fill="none" stroke-width="4" stroke-linecap="round" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - c.pct / 100)).toFixed(1)}"/></svg>` +
          `<span class="rx-shelf-icon !size-9 !text-sm"><i class="${c.icon}" aria-hidden="true"></i></span></div>` +
          `<p class="mt-2 text-xs font-extrabold text-gray-900">${c.name}</p>` +
          `<p class="text-[10px] font-bold text-gray-400">${c.n}</p>` +
          `<p class="mt-0.5 text-[11px] font-extrabold tabular-nums" style="color:var(--rx-accent)">${c.pct}% stocked</p></div>`
        );
      })
      .join('');
  }

  /* ---------------- Finance ---------------- */

  private renderFin(): void {
    const hero = this.byId('fin-hero');
    if (hero) {
      hero.innerHTML =
        '<div class="flex items-center justify-between"><p class="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Pharmacy Revenue · Today</p>' +
        '<span class="rx-chip rx-emerald text-[9px]"><i class="icon-trending-up text-[9px]" aria-hidden="true"></i>Margin 28.4%</span></div>' +
        '<p class="mt-1.5 text-3xl font-extrabold text-gray-900 tabular-nums">$10,150</p>' +
        '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">Sales + claims − refunds · vs $9,320 yesterday</p>';
    }
    const wrap = this.byId('finance');
    if (wrap) {
      wrap.innerHTML = this.fin
        .map(
          (f) =>
            `<div class="rx-fin ${f.tone}"><div class="flex items-center gap-2"><span class="rx-panel-icon !size-7 text-[11px]"><i class="${f.icon}" aria-hidden="true"></i></span>` +
            `<p class="text-[10px] font-extrabold uppercase tracking-wide text-gray-400">${f.label}</p></div>` +
            `<p class="mt-1.5 text-xl font-extrabold text-gray-900 tabular-nums">${f.val}</p><p class="text-[10px] font-semibold text-gray-400">${f.n}</p></div>`
        )
        .join('');
    }
  }

  /* ---------------- Activity feed ---------------- */

  private renderActivity(): void {
    const filters = this.byId('act-filters');
    if (filters) {
      const cats = ['All', ...new Set(this.activity.map((a) => a.cat))];
      filters.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" data-cat="${c}" aria-pressed="${this.actFilter === c}" class="rx-chip rx-sky cursor-pointer${this.actFilter === c ? '' : ' opacity-50'}">${c}</button>`
        )
        .join('');
    }
    const wrap = this.byId('activity');
    if (!wrap) return;
    wrap.innerHTML = this.activity
      .filter((a) => this.actFilter === 'All' || a.cat === this.actFilter)
      .map(
        (a) =>
          `<div class="rx-tl ${a.tone}"><span class="rx-tl-icon"><i class="${a.icon}" aria-hidden="true"></i></span>` +
          `<div class="min-w-0 flex-1 pb-1"><div class="flex items-center gap-2"><span class="rx-chip ${a.tone} text-[9px]">${a.cat}</span><span class="text-[10px] font-semibold text-gray-400 tabular-nums">${this.escapeHtml(a.time)}</span></div>` +
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
    this.byId('btn-newrx')?.addEventListener('click', () => {
      const id = 'RX-' + (2483 + this.rx.filter((r) => r.id.startsWith('RX-24') && parseInt(r.id.slice(3), 10) > 2482).length);
      this.rx.unshift({ id, patient: 'Walk-in Patient', doctor: 'Dr. Ferreira', pri: 'Normal', meds: 1, mins: 0, pay: 'Pending', lane: 'new' });
      this.renderAll();
      this.toast(`${id} added to the queue.`, 'success');
    });

    this.byId('btn-dispense')?.addEventListener('click', () => {
      const r = this.rx.find((x) => x.lane === 'ready');
      if (!r) {
        this.toast('Nothing in Ready — advance a prescription first.', 'info');
        return;
      }
      r.lane = 'done';
      r.mins = 0;
      this.renderAll();
      this.toast(`${r.id} dispensed to ${r.patient} at Counter 1.`, 'success');
    });

    this.byId('btn-audit')?.addEventListener('click', () =>
      this.toast('Cycle count started — shelf A1–A6 assigned to technician.', 'info')
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
      const isEmergency = act === 'Emergency Medicine Issue';
      this.toast(act + (isEmergency ? ' — vault access requested, dual signature needed.' : ' opened.'), isEmergency ? 'error' : 'success');
    });

    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.rx-dock')) return;
      menu.classList.add('is-closed');
      fab.classList.remove('is-open');
      fab.setAttribute('aria-expanded', 'false');
    });
  }
}
