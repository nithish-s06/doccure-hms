import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Medicine {
  code: string;
  active: boolean;
  brand: string;
  generic: string;
  category: string;
  form: string;
  strength: string;
  sched: string;
  price: number;
  stock: number;
  reorder: number;
  supplier: string;
  indications: string;
  dosage: string[];
  warnings: string[];
}

/**
 * Ported from tailwind/src/assets/js/script.js — "medicines" (medicines.html).
 * Dreams HMS Medicine Formulary: dosage forms, controlled-substance schedules,
 * stock status, pricing and a detail drawer. Static demo data — no API.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-medicines',
  styleUrl: './medicines.css',
  templateUrl: './medicines.html',
})
export class Medicines implements AfterViewInit {
  private readonly FORM: Record<string, { icon: string; cls: string }> = {
    Tablet: { icon: 'icon-pill', cls: 'form-tablet' },
    Capsule: { icon: 'icon-tablets', cls: 'form-capsule' },
    Syrup: { icon: 'icon-flask-round', cls: 'form-syrup' },
    Injection: { icon: 'icon-syringe', cls: 'form-injection' },
    Topical: { icon: 'icon-hand', cls: 'form-topical' },
    Drops: { icon: 'icon-droplet', cls: 'form-drops' },
    Inhaler: { icon: 'icon-wind', cls: 'form-inhaler' },
  };
  private readonly FORM_FALLBACK = { icon: 'icon-pill', cls: 'form-tablet' };

  private readonly SCHEDULE: Record<string, { label: string; cls: string; name: string }> = {
    '2': { label: 'C-II', cls: 'sched-2', name: 'Schedule II — high abuse potential' },
    '3': { label: 'C-III', cls: 'sched-3', name: 'Schedule III' },
    '4': { label: 'C-IV', cls: 'sched-4', name: 'Schedule IV' },
    '5': { label: 'C-V', cls: 'sched-5', name: 'Schedule V' },
  };

  private readonly CATEGORIES = ['Analgesics', 'Antibiotics', 'Cardiovascular', 'Respiratory', 'Endocrine', 'Gastrointestinal', 'CNS', 'Anticoagulants'];
  private readonly SUPPLIERS = ['McKesson', 'Cardinal Health', 'AmerisourceBergen', 'Cencora', 'Morris & Dickson'];
  private readonly LOCATIONS = ['Main Pharmacy', 'ED Satellite', 'OR Store', 'Ward Cabinets'];

  private counter = 0;
  private mk(o: Partial<Medicine>): Medicine {
    this.counter++;
    return Object.assign({ code: 'MED-' + String(this.counter).padStart(4, '0'), active: true } as Medicine, o);
  }

  private MEDS: Medicine[] = [];

  private activeCat = '';
  private page = 1;
  private readonly PAGE_SIZE = 8;
  private editingCode: string | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.MEDS = [
      this.mk({ brand: 'Tylenol', generic: 'Acetaminophen', category: 'Analgesics', form: 'Tablet', strength: '500 mg', sched: 'OTC', price: 0.08, stock: 8400, reorder: 2000, supplier: 'McKesson', indications: 'Mild to moderate pain and fever reduction.', dosage: ['Adults: 500–1000 mg every 4–6h', 'Max 3000 mg / 24h', 'Hepatic impairment: reduce dose'], warnings: ['Hepatotoxic in overdose', 'Avoid with chronic alcohol use'] }),
      this.mk({ brand: 'Amoxil', generic: 'Amoxicillin', category: 'Antibiotics', form: 'Capsule', strength: '500 mg', sched: 'OTC', price: 0.22, stock: 6100, reorder: 1500, supplier: 'Cardinal Health', indications: 'Bacterial infections of the ear, nose, throat and urinary tract.', dosage: ['Adults: 500 mg every 8h', 'Severe: 875 mg every 12h', 'Complete full course'], warnings: ['Penicillin allergy — contraindicated', 'May reduce oral contraceptive efficacy'] }),
      this.mk({ brand: 'OxyContin', generic: 'Oxycodone', category: 'Analgesics', form: 'Tablet', strength: '10 mg', sched: '2', price: 1.85, stock: 320, reorder: 400, supplier: 'AmerisourceBergen', indications: 'Severe pain requiring an opioid analgesic.', dosage: ['Individualise to response', 'Extended-release: every 12h', 'Do not crush or chew'], warnings: ['High abuse and dependence risk', 'Respiratory depression', 'Controlled — witness count required'] }),
      this.mk({ brand: 'Lipitor', generic: 'Atorvastatin', category: 'Cardiovascular', form: 'Tablet', strength: '20 mg', sched: 'OTC', price: 0.31, stock: 5200, reorder: 1200, supplier: 'Cencora', indications: 'Hypercholesterolaemia and cardiovascular risk reduction.', dosage: ['Initial: 10–20 mg once daily', 'Range: 10–80 mg daily', 'Take in the evening'], warnings: ['Myopathy risk with fibrates', 'Monitor liver enzymes'] }),
      this.mk({ brand: 'Ventolin', generic: 'Salbutamol', category: 'Respiratory', form: 'Inhaler', strength: '100 mcg/dose', sched: 'OTC', price: 4.6, stock: 890, reorder: 300, supplier: 'McKesson', indications: 'Relief of bronchospasm in asthma and COPD.', dosage: ['1–2 puffs every 4–6h as needed', 'Max 8 puffs / 24h', 'Spacer improves delivery'], warnings: ['Overuse signals poor control', 'Tachycardia at high doses'] }),
      this.mk({ brand: 'Xanax', generic: 'Alprazolam', category: 'CNS', form: 'Tablet', strength: '0.5 mg', sched: '4', price: 0.44, stock: 0, reorder: 250, supplier: 'Cardinal Health', indications: 'Anxiety and panic disorder.', dosage: ['Initial: 0.25–0.5 mg three times daily', 'Taper to discontinue', 'Avoid abrupt cessation'], warnings: ['Dependence with prolonged use', 'Sedation — avoid driving', 'Controlled — witness count required'] }),
      this.mk({ brand: 'Coumadin', generic: 'Warfarin', category: 'Anticoagulants', form: 'Tablet', strength: '5 mg', sched: 'OTC', price: 0.19, stock: 2100, reorder: 800, supplier: 'Cencora', indications: 'Prophylaxis and treatment of thromboembolic disorders.', dosage: ['Dose to target INR 2–3', 'Review INR regularly', 'Consistent vitamin K intake'], warnings: ['Numerous drug and food interactions', 'Bleeding risk — monitor INR'] }),
      this.mk({ brand: 'Nexium', generic: 'Esomeprazole', category: 'Gastrointestinal', form: 'Capsule', strength: '40 mg', sched: 'OTC', price: 0.52, stock: 3300, reorder: 900, supplier: 'Morris & Dickson', indications: 'GERD and erosive oesophagitis.', dosage: ['20–40 mg once daily', 'Before food', 'Course 4–8 weeks'], warnings: ['Long-term use — B12 and magnesium', 'Reduces clopidogrel effect'] }),
      this.mk({ brand: 'Glucophage', generic: 'Metformin', category: 'Endocrine', form: 'Tablet', strength: '850 mg', sched: 'OTC', price: 0.06, stock: 7600, reorder: 2000, supplier: 'McKesson', indications: 'Type 2 diabetes mellitus, first-line.', dosage: ['Initial: 500 mg twice daily', 'Titrate weekly', 'Take with meals'], warnings: ['Hold before contrast imaging', 'Rare lactic acidosis in renal impairment'] }),
      this.mk({ brand: 'Ativan', generic: 'Lorazepam', category: 'CNS', form: 'Injection', strength: '2 mg/mL', sched: '4', price: 1.12, stock: 540, reorder: 200, supplier: 'AmerisourceBergen', indications: 'Status epilepticus and acute agitation.', dosage: ['4 mg IV over 2 min, may repeat', 'Dilute before IV', 'Monitor respiration'], warnings: ['Respiratory depression', 'Controlled — witness count required'] }),
      this.mk({ brand: 'Zofran', generic: 'Ondansetron', category: 'Gastrointestinal', form: 'Injection', strength: '4 mg/2mL', sched: 'OTC', price: 0.74, stock: 1450, reorder: 500, supplier: 'Cardinal Health', indications: 'Prevention of nausea and vomiting.', dosage: ['4–8 mg IV before chemotherapy', 'Slow IV push', 'Max 16 mg/dose'], warnings: ['QT prolongation at high doses', 'Caution with other QT drugs'] }),
      this.mk({ brand: 'Augmentin', generic: 'Amoxicillin/Clavulanate', category: 'Antibiotics', form: 'Syrup', strength: '228 mg/5mL', sched: 'OTC', price: 0.9, stock: 610, reorder: 250, supplier: 'Cencora', indications: 'Respiratory and skin infections.', dosage: ['Weight-based in children', 'Every 8–12h', 'Refrigerate suspension'], warnings: ['Penicillin allergy — contraindicated', 'GI upset common'] }),
      this.mk({ brand: 'Norvasc', generic: 'Amlodipine', category: 'Cardiovascular', form: 'Tablet', strength: '5 mg', sched: 'OTC', price: 0.11, stock: 4800, reorder: 1200, supplier: 'Morris & Dickson', indications: 'Hypertension and angina.', dosage: ['5–10 mg once daily', 'Elderly: start 2.5 mg', 'Any time of day'], warnings: ['Peripheral oedema', 'Caution in severe aortic stenosis'] }),
      this.mk({ brand: 'Codeine Linctus', generic: 'Codeine', category: 'Respiratory', form: 'Syrup', strength: '15 mg/5mL', sched: '5', price: 0.38, stock: 260, reorder: 150, supplier: 'McKesson', indications: 'Dry cough suppression.', dosage: ['5–10 mL every 4–6h', 'Max per 24h per label', 'Not under 12 years'], warnings: ['Dependence potential', 'Controlled — record in register'] }),
      this.mk({ brand: 'Cortisone Cream', generic: 'Hydrocortisone', category: 'Analgesics', form: 'Topical', strength: '1%', sched: 'OTC', price: 0.28, stock: 1900, reorder: 600, supplier: 'Cardinal Health', indications: 'Inflammatory skin conditions.', dosage: ['Apply thin film 1–2 times daily', 'Short courses only', 'Avoid broken skin'], warnings: ['Skin thinning with prolonged use', 'Avoid facial use unless directed'] }),
      this.mk({ brand: 'Timoptic', generic: 'Timolol', category: 'Cardiovascular', form: 'Drops', strength: '0.5%', sched: 'OTC', price: 1.4, stock: 430, reorder: 150, supplier: 'Cencora', indications: 'Open-angle glaucoma, raised intraocular pressure.', dosage: ['1 drop twice daily', 'Punctal occlusion reduces absorption', 'Space from other drops'], warnings: ['Systemic beta-blockade', 'Caution in asthma'] }),
      this.mk({ brand: 'Humulin R', generic: 'Insulin (regular)', category: 'Endocrine', form: 'Injection', strength: '100 units/mL', sched: 'OTC', price: 6.2, stock: 720, reorder: 250, supplier: 'AmerisourceBergen', indications: 'Diabetes mellitus glycaemic control.', dosage: ['Individualised subcutaneous dosing', '30 min before meals', 'Refrigerate stock vials'], warnings: ['Hypoglycaemia risk', 'Do not freeze'] }),
      this.mk({ brand: 'Ciprobay', generic: 'Ciprofloxacin', category: 'Antibiotics', form: 'Tablet', strength: '500 mg', sched: 'OTC', price: 0.34, stock: 3100, reorder: 900, supplier: 'Morris & Dickson', indications: 'Urinary, respiratory and GI bacterial infections.', dosage: ['250–750 mg every 12h', 'Avoid with dairy or antacids', 'Complete full course'], warnings: ['Tendon rupture risk', 'QT prolongation'] }),
      this.mk({ brand: 'Adderall', generic: 'Amphetamine/Dextroamphetamine', category: 'CNS', form: 'Tablet', strength: '20 mg', sched: '2', price: 1.05, stock: 180, reorder: 300, supplier: 'Cardinal Health', indications: 'ADHD and narcolepsy.', dosage: ['Individualise, lowest effective dose', 'Morning dosing', 'Assess cardiac history first'], warnings: ['High abuse potential', 'Controlled — witness count required', 'Cardiovascular risk'] }),
      this.mk({ brand: 'Salofalk', generic: 'Mesalazine', category: 'Gastrointestinal', form: 'Tablet', strength: '500 mg', sched: 'OTC', price: 0.63, stock: 1200, reorder: 400, supplier: 'Cencora', indications: 'Ulcerative colitis, maintenance of remission.', dosage: ['1.5–3 g daily in divided doses', 'Swallow whole', 'With plenty of water'], warnings: ['Renal monitoring advised', 'Salicylate sensitivity'] }),
      this.mk({ brand: 'Panadol', generic: 'Paracetamol', category: 'Analgesics', form: 'Syrup', strength: '120 mg/5mL', sched: 'OTC', price: 0.15, stock: 2600, reorder: 700, supplier: 'McKesson', indications: 'Paediatric pain and fever.', dosage: ['Weight-based dosing', 'Every 4–6h, max 4 doses/day', 'Use measuring syringe'], warnings: ['Do not exceed labelled dose', 'Check other paracetamol sources'] }),
      this.mk({ brand: 'Eliquis', generic: 'Apixaban', category: 'Anticoagulants', form: 'Tablet', strength: '5 mg', sched: 'OTC', price: 3.1, stock: 940, reorder: 300, supplier: 'Cardinal Health', indications: 'Stroke prevention in atrial fibrillation, VTE.', dosage: ['5 mg twice daily', 'Reduce to 2.5 mg if criteria met', 'No routine INR needed'], warnings: ['Bleeding risk', 'No specific antidote in most settings'] }),
    ];
  }

  ngAfterViewInit(): void {
    this.renderCategories();
    this.renderGrid();

    (['search', 'filter-form', 'filter-sched', 'filter-stock'] as const).forEach((id) => {
      const el = this.byId(id);
      if (!el) return;
      el.addEventListener(id === 'search' ? 'input' : 'change', () => {
        this.page = 1;
        this.renderGrid();
      });
    });

    const catChips = this.byId('cat-chips');
    if (catChips) {
      catChips.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-cat]') as HTMLElement | null;
        if (!btn) return;
        this.activeCat = btn.dataset['cat'] || '';
        this.page = 1;
        this.renderCategories();
        this.renderGrid();
      });
    }

    const pager = this.byId('pager');
    if (pager) {
      pager.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-page]') as HTMLButtonElement | null;
        if (!btn || btn.disabled) return;
        const p = parseInt(btn.dataset['page'] || '0', 10);
        if (p >= 1) {
          this.page = p;
          this.renderGrid();
        }
      });
    }

    const gridBody = this.byId('grid-body');
    if (gridBody) {
      gridBody.addEventListener('click', (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
        if (!btn) return;
        const code = btn.dataset['id'] || '';
        const act = btn.dataset['act'];
        if (act === 'view') this.openDrawer(code);
        else if (act === 'edit') this.openMed(code);
        else if (act === 'reorder') this.openReorder(code);
        else if (act === 'toggle') {
          const m = this.MEDS.find((x) => x.code === code);
          if (m && m.active) {
            this.confirmDelete(m.brand + ' (' + m.code + ')', () => this.toggleMed(code));
          } else this.toggleMed(code);
        }
      });
    }

    const btnAdd = this.byId('btn-add');
    if (btnAdd) btnAdd.addEventListener('click', () => this.openMed(null));
    const btnImport = this.byId('btn-import');
    if (btnImport) btnImport.addEventListener('click', () => this.toast('Formulary import — upload a CSV to bulk-add medicines.', 'info'));
    const btnExport = this.byId('btn-export');
    if (btnExport) btnExport.addEventListener('click', () => this.toast('Formulary exported — ' + this.MEDS.length + ' medicines.', 'success'));

    const dwClose = this.byId('dw-close');
    if (dwClose) dwClose.addEventListener('click', () => this.closeDrawer());
    const dwBackdrop = this.byId('dw-backdrop');
    if (dwBackdrop) dwBackdrop.addEventListener('click', () => this.closeDrawer());
    const dwActEdit = this.byId('dw-act-edit');
    if (dwActEdit) {
      dwActEdit.addEventListener('click', () => {
        const code = dwActEdit.dataset['code'] || '';
        this.closeDrawer();
        this.openMed(code);
      });
    }
    const dwActReorder = this.byId('dw-act-reorder');
    if (dwActReorder) {
      dwActReorder.addEventListener('click', () => {
        const code = dwActReorder.dataset['code'] || '';
        this.closeDrawer();
        this.openReorder(code);
      });
    }
    const dwActToggle = this.byId('dw-act-toggle');
    if (dwActToggle) {
      dwActToggle.addEventListener('click', () => {
        const code = dwActToggle.dataset['code'] || '';
        const m = this.MEDS.find((x) => x.code === code);
        this.closeDrawer();
        if (m && m.active) this.confirmDelete(m.brand + ' (' + m.code + ')', () => this.toggleMed(code));
        else this.toggleMed(code);
      });
    }

    const mmSave = this.byId('mm-save');
    if (mmSave) {
      mmSave.addEventListener('click', () => {
        const brand = this.getValue('mm-brand').trim();
        const generic = this.getValue('mm-generic').trim();
        if (!brand) return this.toast('Enter a brand name.', 'error');
        if (!generic) return this.toast('Enter a generic name.', 'error');

        const data = {
          brand,
          generic,
          category: this.getValue('mm-category'),
          form: this.getValue('mm-dosage-form'),
          strength: this.getValue('mm-strength').trim() || '—',
          sched: this.getValue('mm-sched'),
          price: parseFloat(this.getValue('mm-price')) || 0,
          stock: parseInt(this.getValue('mm-stock'), 10) || 0,
          reorder: parseInt(this.getValue('mm-reorder'), 10) || 0,
          supplier: this.getValue('mm-supplier').trim() || '—',
          indications: this.getValue('mm-indications').trim() || 'Not specified.',
        };

        if (this.editingCode) {
          const m = this.MEDS.find((x) => x.code === this.editingCode);
          if (m) {
            Object.assign(m, data);
            const existingEl = this.byId('grid-body')?.querySelector('[data-row-id="' + m.code + '"]');
            if (existingEl) existingEl.outerHTML = this.rowHTML(m);
            this.toast(brand + ' updated.', 'success');
          }
        } else {
          const newRec = this.mk(Object.assign({ dosage: ['As directed by the prescriber'], warnings: ['Review full prescribing information'] }, data));
          this.MEDS.unshift(newRec);
          this.byId('grid-body')?.insertAdjacentHTML('afterbegin', this.rowHTML(newRec));
          const w = window as any;
          if (w.HSStaticMethods) w.HSStaticMethods.autoInit();
          this.toast(brand + ' added to the formulary.', 'success');
        }
        const w = window as any;
        if (w.HSOverlay) w.HSOverlay.close(this.byId('med-modal'));
        this.renderAll();
        return undefined;
      });
    }

    const roSave = this.byId('ro-save');
    if (roSave) {
      roSave.addEventListener('click', () => {
        const m = this.MEDS.find((x) => x.code === roSave.dataset['code']);
        if (!m) return;
        const qty = parseInt(this.getValue('ro-qty'), 10);
        if (!qty || qty < 1) return this.toast('Enter an order quantity.', 'error');
        const w = window as any;
        if (w.HSOverlay) w.HSOverlay.close(this.byId('reorder-modal'));
        this.toast('PO raised — ' + qty.toLocaleString() + ' units of ' + m.brand + ' from ' + this.getValue('ro-supplier') + '.', 'success');
        return undefined;
      });
    }

    this.initDeleteModal();
    this.closeOnBackdrop('del-modal');

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      this.closeDrawer();
      this.closeModal('del-modal');
    });
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private getValue(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)?.value ?? '';
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private money(n: number): string {
    return '$' + Number(n).toFixed(2);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): undefined {
    this.toastService.show(message, tone);
    return undefined;
  }

  /* ---------------- shared MC-style modal helpers ---------------- */

  private delCallback: (() => void) | null = null;

  private openModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    const w = window as any;
    if (el.classList.contains('hs-overlay') && w.HSOverlay) {
      w.HSOverlay.open(el);
      return;
    }
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    const w = window as any;
    if (el.classList.contains('hs-overlay') && w.HSOverlay) {
      w.HSOverlay.close(el);
      return;
    }
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private confirmDelete(name: string, onConfirm: () => void): void {
    const delName = this.byId('del-name');
    if (delName) delName.textContent = name;
    this.delCallback = onConfirm;
    this.openModal('del-modal');
  }

  private initDeleteModal(): void {
    const btn = this.byId('del-confirm-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
        this.closeModal('del-modal');
      });
    }
    const cancel = this.byId('del-cancel-btn');
    if (cancel) cancel.addEventListener('click', () => this.closeModal('del-modal'));
  }

  private closeOnBackdrop(id: string): void {
    const el = this.byId(id);
    if (el) {
      el.addEventListener('mousedown', (e: Event) => {
        if (e.target === el) this.closeModal(id);
      });
    }
  }

  private actions(id: string, items: { label: string; icon: string; act: string; danger?: boolean }[]): string {
    let html =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]">' +
      '<button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">' +
      '<i class="icon-ellipsis-vertical text-sm"></i></button>' +
      '<div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">';
    items.forEach((it) => {
      html +=
        '<button type="button" role="menuitem" data-act="' + it.act + '" data-id="' + id + '" ' +
        'class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
        (it.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
        '"><i class="' + it.icon + ' text-sm"></i>' + it.label + '</button>';
    });
    return html + '</div></div>';
  }

  /* ---------------- derived ---------------- */

  private stockStatus(m: Medicine): { key: string; label: string; cls: string; badge: string } {
    if (m.stock <= 0) return { key: 'out', label: 'Out of Stock', cls: 'stock-out', badge: 'badge-red' };
    if (m.stock <= m.reorder) return { key: 'low', label: 'Low Stock', cls: 'stock-low', badge: 'badge-amber' };
    return { key: 'ok', label: 'In Stock', cls: 'stock-ok', badge: 'badge-green' };
  }

  private isControlled(m: Medicine): boolean {
    return m.sched !== 'OTC';
  }

  private filtered(): Medicine[] {
    const q = this.getValue('search').trim().toLowerCase();
    const form = this.getValue('filter-form');
    const sched = this.getValue('filter-sched');
    const stock = this.getValue('filter-stock');

    return this.MEDS.filter((m) => {
      const hit = !q || m.brand.toLowerCase().includes(q) || m.generic.toLowerCase().includes(q) || m.code.toLowerCase().includes(q);
      const okCat = !this.activeCat || m.category === this.activeCat;
      const okForm = !form || m.form === form;
      const okSched = !sched || (sched === 'OTC' ? m.sched === 'OTC' : m.sched === sched);
      const okStock = !stock || this.stockStatus(m).key === stock;
      return hit && okCat && okForm && okSched && okStock;
    });
  }

  /* ---------------- hero + KPIs ---------------- */

  private renderHero(): void {
    const active = this.MEDS.filter((m) => m.active).length;
    const out = this.MEDS.filter((m) => this.stockStatus(m).key === 'out').length;
    const flag =
      out >= 3
        ? { cls: 'tone-critical', text: out + ' Out of Stock' }
        : this.MEDS.filter((m) => this.stockStatus(m).key === 'low').length >= 4
          ? { cls: 'tone-medium', text: 'Stock Watch' }
          : { cls: 'tone-stable', text: 'Formulary Active' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = active + ' active medicines · ' + this.CATEGORIES.length + ' categories';
  }

  private renderKpis(): void {
    const total = this.MEDS.length;
    const controlled = this.MEDS.filter((m) => this.isControlled(m)).length;
    const low = this.MEDS.filter((m) => this.stockStatus(m).key === 'low').length;
    const out = this.MEDS.filter((m) => this.stockStatus(m).key === 'out').length;
    const value = this.MEDS.reduce((s, m) => s + m.price * m.stock, 0);

    const cards = [
      { id: 'kpi-total', icon: 'icon-pill', label: 'Total Medicines', value: total, tone: 'ph-primary', meta: 'in formulary' },
      { id: 'kpi-active', icon: 'icon-circle-check', label: 'Active', value: this.MEDS.filter((m) => m.active).length, tone: 'ph-sky', meta: 'dispensable' },
      { id: 'kpi-controlled', icon: 'icon-shield', label: 'Controlled', value: controlled, tone: 'ph-violet', meta: 'scheduled drugs' },
      { id: 'kpi-low', icon: 'icon-triangle-alert', label: 'Low Stock', value: low, tone: 'ph-amber', meta: 'at/below reorder' },
      { id: 'kpi-out', icon: 'icon-circle-x', label: 'Out of Stock', value: out, tone: 'ph-danger', meta: 'needs ordering' },
      { id: 'kpi-value', icon: 'icon-dollar-sign', label: 'Stock Value', value: '$' + Math.round(value / 1000) + 'k', tone: 'ph-slate', meta: 'at unit cost' },
    ];

    const kpiRow = this.byId('kpi-row');
    if (kpiRow) {
      kpiRow.innerHTML = cards
        .map(
          (c) =>
            '<article class="ph-kpi ' + c.tone + '">' +
            '<div class="ph-kpi-head">' +
            '<span class="ph-kpi-icon"><i class="' + c.icon + '" aria-hidden="true"></i></span>' +
            '</div>' +
            '<p class="ph-kpi-value"><span id="' + c.id + '">' + c.value + '</span></p>' +
            '<p class="ph-kpi-label">' + c.label + '</p>' +
            '<p class="ph-kpi-meta"><i class="icon-circle-dot text-[8px]" aria-hidden="true"></i>' + c.meta + '</p>' +
            '</article>',
        )
        .join('');
    }
  }

  /* ---------------- category quick filter ---------------- */

  private renderCategories(): void {
    const chip = (label: string, value: string) => {
      const count = value ? this.MEDS.filter((m) => m.category === value).length : this.MEDS.length;
      const on = this.activeCat === value;
      return (
        '<button type="button" data-cat="' + this.esc(value) + '" ' +
        'class="hms-chip ' + (on ? 'ph-primary' : 'tone-slate') + ' transition-colors" aria-pressed="' + on + '">' +
        this.esc(label) + '<span class="opacity-60">' + count + '</span></button>'
      );
    };
    const catChips = this.byId('cat-chips');
    if (catChips) catChips.innerHTML = chip('All', '') + this.CATEGORIES.map((c) => chip(c, c)).join('');
  }

  /* ---------------- catalog table + pagination ---------------- */

  private stockBar(m: Medicine): string {
    const st = this.stockStatus(m);
    const ceiling = Math.max(m.reorder * 2, 1);
    const pct = Math.min(100, Math.round((m.stock / ceiling) * 100));
    return (
      '<div class="min-w-28"><div class="flex items-center gap-2">' +
      '<svg class="ph-stock ' + st.cls + '" viewBox="0 0 100 6" preserveAspectRatio="none" role="img" aria-label="' + m.stock + ' units, ' + st.label + '">' +
      '<rect x="0" y="0" width="100" height="6" rx="3" fill="currentColor" opacity="0.15"></rect>' +
      '<rect x="0" y="0" width="' + pct + '" height="6" rx="3" fill="currentColor"></rect></svg>' +
      '<span class="text-xs font-bold text-gray-900 tabular-nums w-12 text-right">' + m.stock.toLocaleString() + '</span></div>' +
      '<p class="mt-0.5 text-[10px] font-semibold text-gray-400">reorder @ ' + m.reorder.toLocaleString() + '</p></div>'
    );
  }

  private schedBadge(m: Medicine): string {
    if (!this.isControlled(m)) return '<span class="hms-chip tone-slate">Rx</span>';
    const s = this.SCHEDULE[m.sched];
    return '<span class="ph-sched ' + s.cls + '" title="' + this.esc(s.name) + '"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + s.label + '</span>';
  }

  private detailUrl(m: Medicine): string {
    return (
      'medicine-detail.html?' +
      new URLSearchParams({ id: m.code, name: m.brand, code: m.code, brand: m.brand, generic: m.generic, strength: m.strength, category: m.category, stock: String(m.stock), price: String(m.price) }).toString()
    );
  }

  private rowHTML(m: Medicine): string {
    const f = this.FORM[m.form] || this.FORM_FALLBACK;
    const st = this.stockStatus(m);
    return (
      '<tr class="hms-row' + (m.active ? '' : ' opacity-60') + '" data-row-id="' + this.esc(m.code) + '">' +
      '<td class="hms-cell"><div class="flex items-center gap-3">' +
      '<span class="ph-form ' + f.cls + '"><i class="' + f.icon + '" aria-hidden="true"></i></span>' +
      '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate"><a href="' + this.detailUrl(m) + '" class="hover:underline">' + this.esc(m.brand) + '</a></p>' +
      '<p class="text-[10px] text-gray-400 truncate">' + this.esc(m.generic) + ' · ' + this.esc(m.code) + '</p></div></div></td>' +
      '<td class="hms-cell"><span class="hms-chip tone-info">' + this.esc(m.category) + '</span></td>' +
      '<td class="hms-cell"><p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(m.form) + '</p>' +
      '<p class="text-[10px] text-gray-400">' + this.esc(m.strength) + '</p></td>' +
      '<td class="hms-cell">' + this.schedBadge(m) + '</td>' +
      '<td class="hms-cell">' + this.stockBar(m) + '</td>' +
      '<td class="hms-cell"><span class="text-xs font-bold text-gray-900 tabular-nums">' + this.money(m.price) + '</span></td>' +
      '<td class="hms-cell">' +
      (m.active ? '<span class="badge ' + st.badge + '">' + st.label + '</span>' : '<span class="badge badge-gray">Discontinued</span>') +
      '</td>' +
      '<td class="hms-cell text-right">' +
      this.actions(m.code, [
        { label: 'View', icon: 'icon-eye', act: 'view' },
        { label: 'Edit', icon: 'icon-pencil', act: 'edit' },
        { label: 'Reorder', icon: 'icon-shopping-cart', act: 'reorder' },
        { label: m.active ? 'Discontinue' : 'Reactivate', icon: 'icon-power', act: 'toggle', danger: m.active },
      ]) +
      '</td></tr>'
    );
  }

  private renderGrid(): void {
    const rows = this.filtered();
    const pages = Math.max(1, Math.ceil(rows.length / this.PAGE_SIZE));
    if (this.page > pages) this.page = pages;

    const gridCount = this.byId('grid-count');
    if (gridCount) gridCount.textContent = rows.length + (rows.length === 1 ? ' item' : ' items');

    const emptyRow = this.byId('grid-empty-row');
    if (!rows.length) {
      this.byId('grid-body')
        ?.querySelectorAll('[data-row-id]')
        .forEach((tr) => tr.classList.add('hidden'));
      if (emptyRow) emptyRow.classList.remove('hidden');
      const pagerEl = this.byId('pager');
      if (pagerEl) pagerEl.innerHTML = '';
      return;
    }
    if (emptyRow) emptyRow.classList.add('hidden');

    const slice = rows.slice((this.page - 1) * this.PAGE_SIZE, this.page * this.PAGE_SIZE);
    const visible = new Set(slice.map((m) => m.code));
    this.byId('grid-body')
      ?.querySelectorAll('[data-row-id]')
      .forEach((tr) => {
        tr.classList.toggle('hidden', !visible.has((tr as HTMLElement).dataset['rowId'] || ''));
      });

    this.renderPager(rows.length, pages);
  }

  private renderPager(count: number, pages: number): void {
    const from = (this.page - 1) * this.PAGE_SIZE + 1;
    const to = Math.min(this.page * this.PAGE_SIZE, count);
    const btn = (label: string | number, target: number, disabled: boolean, current: boolean) =>
      '<button type="button" data-page="' + target + '" ' + (disabled ? 'disabled ' : '') +
      'class="min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-colors ' +
      (current ? 'bg-primary text-white' : disabled ? 'text-gray-300 dark:text-slate-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
      '">' + label + '</button>';

    let nums = '';
    for (let p = 1; p <= pages; p++) nums += btn(p, p, false, p === this.page);

    const pagerEl = this.byId('pager');
    if (pagerEl) {
      pagerEl.innerHTML =
        '<p class="text-xs text-gray-500 dark:text-gray-400">Showing <strong class="text-gray-900">' + from + '–' + to + '</strong> of <strong class="text-gray-900">' + count + '</strong></p>' +
        '<div class="flex items-center gap-1">' +
        btn('<i class="icon-chevron-left"></i>', this.page - 1, this.page === 1, false) +
        nums +
        btn('<i class="icon-chevron-right"></i>', this.page + 1, this.page === pages, false) +
        '</div>';
    }
  }

  /* ---------------- drawer ---------------- */

  private ov(term: string, value: string | number): string {
    return (
      '<div><dt class="text-[10px] font-bold uppercase tracking-wider text-gray-400">' + term + '</dt>' +
      '<dd class="mt-0.5 text-xs font-bold text-gray-900">' + value + '</dd></div>'
    );
  }

  private openDrawer(code: string): void {
    const m = this.MEDS.find((x) => x.code === code);
    if (!m) return;
    const f = this.FORM[m.form] || this.FORM_FALLBACK;
    const st = this.stockStatus(m);

    const dwForm = this.byId('dw-form');
    if (dwForm) {
      dwForm.className = 'ph-form ' + f.cls + ' grid size-12 shrink-0 place-items-center rounded-2xl';
      dwForm.innerHTML = '<i class="' + f.icon + ' text-xl" aria-hidden="true"></i>';
    }
    const dwTitle = this.byId('dw-title');
    if (dwTitle) dwTitle.textContent = m.brand;
    const dwSub = this.byId('dw-sub');
    if (dwSub) dwSub.textContent = m.generic + ' · ' + m.code;

    const dwChips = this.byId('dw-chips');
    if (dwChips) {
      dwChips.innerHTML =
        '<span class="hms-chip tone-info">' + this.esc(m.category) + '</span>' +
        '<span class="hms-chip tone-slate">' + this.esc(m.form) + ' · ' + this.esc(m.strength) + '</span>' +
        (this.isControlled(m) ? '<span class="ph-sched ' + this.SCHEDULE[m.sched].cls + '"><i class="icon-shield text-[9px]" aria-hidden="true"></i>' + this.SCHEDULE[m.sched].label + '</span>' : '') +
        '<span class="hms-chip ' + st.cls.replace('stock-ok', 'tone-stable').replace('stock-low', 'tone-medium').replace('stock-out', 'tone-critical') + '">' + st.label + '</span>';
    }

    const dwOverview = this.byId('dw-overview');
    if (dwOverview) {
      dwOverview.innerHTML =
        this.ov('Brand', this.esc(m.brand)) +
        this.ov('Generic', this.esc(m.generic)) +
        this.ov('Code', this.esc(m.code)) +
        this.ov('Category', this.esc(m.category)) +
        this.ov('Form', this.esc(m.form)) +
        this.ov('Strength', this.esc(m.strength)) +
        this.ov('Schedule', this.isControlled(m) ? this.SCHEDULE[m.sched].label : 'Non-controlled (Rx)') +
        this.ov('Status', m.active ? 'Active' : 'Discontinued');
    }

    const dwComposition = this.byId('dw-composition');
    if (dwComposition) {
      dwComposition.innerHTML =
        '<p class="text-xs font-semibold text-gray-700 dark:text-gray-300">' + this.esc(m.generic) + ' ' + this.esc(m.strength) + '</p>' +
        '<p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">' + this.esc(m.indications) + '</p>';
    }

    const dwDosage = this.byId('dw-dosage');
    if (dwDosage) {
      dwDosage.innerHTML = m.dosage
        .map((d) => '<li class="flex items-start gap-2 rounded-lg border border-border-color dark:border-white/10 px-3 py-2"><i class="icon-check text-teal-500 text-sm shrink-0 mt-0.5" aria-hidden="true"></i><span class="text-xs text-gray-600 dark:text-gray-300">' + this.esc(d) + '</span></li>')
        .join('');
    }

    const dwWarnings = this.byId('dw-warnings');
    if (dwWarnings) {
      dwWarnings.innerHTML = m.warnings
        .map((w) => '<li class="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2"><i class="icon-triangle-alert text-danger text-sm shrink-0 mt-0.5" aria-hidden="true"></i><span class="text-xs text-gray-600 dark:text-gray-300">' + this.esc(w) + '</span></li>')
        .join('');
    }

    const shares = [0.55, 0.2, 0.15, 0.1];
    const dwStock = this.byId('dw-stock');
    if (dwStock) {
      dwStock.innerHTML = this.LOCATIONS.map((loc, i) => {
        const qty = Math.round(m.stock * shares[i]);
        return (
          '<li class="flex items-center gap-2.5 rounded-lg border border-border-color dark:border-white/10 px-3 py-2">' +
          '<i class="icon-map-pin text-gray-400 text-sm shrink-0" aria-hidden="true"></i>' +
          '<span class="text-xs font-semibold text-gray-700 dark:text-gray-300 mr-auto">' + this.esc(loc) + '</span>' +
          '<span class="text-xs font-bold text-gray-900 tabular-nums">' + qty.toLocaleString() + '</span></li>'
        );
      }).join('');
    }

    const dwSupply = this.byId('dw-supply');
    if (dwSupply) {
      dwSupply.innerHTML =
        this.ov('Unit Price', this.money(m.price)) +
        this.ov('Stock Value', this.money(m.price * m.stock)) +
        this.ov('Reorder Level', m.reorder.toLocaleString()) +
        this.ov('On Hand', m.stock.toLocaleString()) +
        this.ov('Supplier', this.esc(m.supplier)) +
        this.ov('Reorder Qty', (m.reorder * 3).toLocaleString());
    }

    const tgl = this.byId('dw-act-toggle');
    if (tgl) tgl.innerHTML = '<i class="icon-power" aria-hidden="true"></i>' + (m.active ? 'Discontinue' : 'Reactivate');
    ['dw-act-edit', 'dw-act-reorder', 'dw-act-toggle'].forEach((b) => {
      const el = this.byId(b);
      if (el) el.dataset['code'] = m.code;
    });

    this.byId('drawer')?.classList.add('is-open');
    this.document.body.style.overflow = 'hidden';
    this.byId('dw-close')?.focus();
  }

  private closeDrawer(): void {
    this.byId('drawer')?.classList.remove('is-open');
    this.document.body.style.overflow = '';
  }

  /* ---------------- modals ---------------- */

  private openMed(code: string | null): void {
    this.editingCode = code || null;
    const m = code ? this.MEDS.find((x) => x.code === code) : null;

    const title = this.byId('mm-title');
    if (title) title.textContent = m ? 'Edit Medicine' : 'Add Medicine';
    (this.byId('mm-form') as HTMLFormElement | null)?.reset();

    if (m) {
      this.setValue('mm-brand', m.brand);
      this.setValue('mm-generic', m.generic);
      this.setValue('mm-category', m.category);
      this.setValue('mm-dosage-form', m.form);
      this.setValue('mm-strength', m.strength);
      this.setValue('mm-sched', m.sched);
      this.setValue('mm-price', String(m.price));
      this.setValue('mm-stock', String(m.stock));
      this.setValue('mm-reorder', String(m.reorder));
      this.setValue('mm-supplier', m.supplier);
      this.setValue('mm-indications', m.indications);
    }
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.open(this.byId('med-modal'));
  }

  private setValue(id: string, value: string): void {
    const el = this.byId(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    if (el) el.value = value;
  }

  private openReorder(code: string): void {
    const m = this.MEDS.find((x) => x.code === code);
    if (!m) return;
    const st = this.stockStatus(m);
    const roSub = this.byId('ro-sub');
    if (roSub) roSub.textContent = m.brand + ' · ' + m.code;
    const f = this.FORM[m.form] || this.FORM_FALLBACK;
    const roSummary = this.byId('ro-summary');
    if (roSummary) {
      roSummary.innerHTML =
        '<div class="flex items-center gap-3">' +
        '<span class="ph-form ' + f.cls + '"><i class="' + f.icon + '" aria-hidden="true"></i></span>' +
        '<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900">' + this.esc(m.brand) + ' ' + this.esc(m.strength) + '</p>' +
        '<p class="text-[10px] text-gray-400">On hand ' + m.stock.toLocaleString() + ' · reorder @ ' + m.reorder.toLocaleString() + '</p></div>' +
        '<span class="hms-chip ' + st.cls.replace('stock-ok', 'tone-stable').replace('stock-low', 'tone-medium').replace('stock-out', 'tone-critical') + '">' + st.label + '</span></div>';
    }
    this.setValue('ro-qty', String(m.reorder * 3));
    const roSupplier = this.byId('ro-supplier');
    if (roSupplier) roSupplier.innerHTML = this.SUPPLIERS.map((s) => '<option' + (s === m.supplier ? ' selected' : '') + '>' + this.esc(s) + '</option>').join('');
    this.setValue('ro-notes', '');
    const roSave = this.byId('ro-save');
    if (roSave) roSave.dataset['code'] = m.code;
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.open(this.byId('reorder-modal'));
  }

  private toggleMed(code: string): void {
    const m = this.MEDS.find((x) => x.code === code);
    if (!m) return;
    m.active = !m.active;
    const existingEl = this.byId('grid-body')?.querySelector('[data-row-id="' + code + '"]');
    if (existingEl) existingEl.outerHTML = this.rowHTML(m);
    this.renderAll();
    this.toast(m.brand + (m.active ? ' reactivated.' : ' discontinued from the formulary.'), m.active ? 'success' : 'info');
  }

  /* ---------------- render + wiring ---------------- */

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderCategories();
    this.renderGrid();
  }
}
