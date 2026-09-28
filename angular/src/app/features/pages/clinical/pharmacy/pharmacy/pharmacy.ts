import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Medicine {
  id: number;
  name: string;
  generic: string;
  cat: string;
  unit: string;
  stock: number;
  reorder: number;
  price: number;
  supplier: string;
  expiry: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "pharmacy" (pharmacy.html).
 * A simple CRUD-list page: search/filter, add/edit modal, delete-confirm modal.
 */
@Component({
  imports: [],
  selector: 'app-pharmacy',
  styleUrl: './pharmacy.css',
  templateUrl: './pharmacy.html',
})
export class Pharmacy implements AfterViewInit {
  private readonly SBADGE: Record<string, string> = {
    'In Stock': 'text-success bg-success/10',
    'Low Stock': 'text-warning bg-warning/10',
    'Out of Stock': 'text-danger bg-danger/10',
  };

  private data: Medicine[] = [
    { id: 1, name: 'Amoxicillin 500mg', generic: 'Amoxicillin', cat: 'Antibiotics', unit: 'Capsule', stock: 820, reorder: 100, price: 1.2, supplier: 'MedSupply Co.', expiry: '2025-06-30', status: 'In Stock' },
    { id: 2, name: 'Paracetamol 500mg', generic: 'Acetaminophen', cat: 'Analgesics', unit: 'Tablet', stock: 3200, reorder: 500, price: 0.15, supplier: 'PharmaDist Ltd.', expiry: '2026-01-15', status: 'In Stock' },
    { id: 3, name: 'Metformin 500mg', generic: 'Metformin HCl', cat: 'Antidiabetics', unit: 'Tablet', stock: 45, reorder: 200, price: 0.8, supplier: 'DiabCare Inc.', expiry: '2025-09-20', status: 'Low Stock' },
    { id: 4, name: 'Amlodipine 5mg', generic: 'Amlodipine', cat: 'Antihypertensives', unit: 'Tablet', stock: 680, reorder: 100, price: 0.6, supplier: 'CardioPharm', expiry: '2025-12-31', status: 'In Stock' },
    { id: 5, name: 'Omeprazole 20mg', generic: 'Omeprazole', cat: 'Antacids', unit: 'Capsule', stock: 0, reorder: 150, price: 0.9, supplier: 'GastroMed', expiry: '2025-08-10', status: 'Out of Stock' },
    { id: 6, name: 'Cetirizine 10mg', generic: 'Cetirizine HCl', cat: 'Antihistamines', unit: 'Tablet', stock: 350, reorder: 80, price: 0.4, supplier: 'AllergyCare', expiry: '2026-03-28', status: 'In Stock' },
    { id: 7, name: 'Vitamin D3 1000IU', generic: 'Cholecalciferol', cat: 'Vitamins', unit: 'Tablet', stock: 30, reorder: 100, price: 0.25, supplier: 'NutriPharma', expiry: '2025-11-15', status: 'Low Stock' },
    { id: 8, name: 'Azithromycin 250mg', generic: 'Azithromycin', cat: 'Antibiotics', unit: 'Tablet', stock: 210, reorder: 50, price: 2.1, supplier: 'MedSupply Co.', expiry: '2025-07-22', status: 'In Stock' },
  ];

  private nextId = 9;
  private editingId: number | null = null;
  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const btnAdd = this.byId('btn-add');
    if (btnAdd) btnAdd.addEventListener('click', () => this.openAdd());

    const btnSave = this.byId('btn-save');
    if (btnSave) btnSave.onclick = () => this.saveRecord();

    const delConfirm = this.byId('del-confirm-btn');
    if (delConfirm) {
      delConfirm.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
      });
    }

    const search = this.byId('search') as HTMLInputElement | null;
    if (search) {
      search.addEventListener('input', () =>
        this.render(search.value, (this.byId('filter-cat') as HTMLSelectElement | null)?.value || '', (this.byId('filter-status') as HTMLSelectElement | null)?.value || ''),
      );
    }

    const filterCat = this.byId('filter-cat') as HTMLSelectElement | null;
    if (filterCat) {
      filterCat.addEventListener('change', () =>
        this.render((this.byId('search') as HTMLInputElement | null)?.value || '', filterCat.value, (this.byId('filter-status') as HTMLSelectElement | null)?.value || ''),
      );
    }

    const filterStatus = this.byId('filter-status') as HTMLSelectElement | null;
    if (filterStatus) {
      filterStatus.addEventListener('change', () =>
        this.render((this.byId('search') as HTMLInputElement | null)?.value || '', (this.byId('filter-cat') as HTMLSelectElement | null)?.value || '', filterStatus.value),
      );
    }

    this.qsa<HTMLElement>('#tbody [data-row-id] [onclick]').forEach((el) => el.removeAttribute('onclick'));
    this.wireRowActions();

    this.render();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private wireRowActions(): void {
    const tbody = this.byId('tbody');
    if (!tbody) return;
    tbody.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest('button[title="Edit"]') as HTMLElement | null;
      const delBtn = target.closest('button[title="Delete"]') as HTMLElement | null;
      if (editBtn) {
        const row = editBtn.closest('[data-row-id]') as HTMLElement | null;
        const id = row ? Number(row.dataset['rowId']) : NaN;
        if (!Number.isNaN(id)) this.openEdit(id);
        return;
      }
      if (delBtn) {
        const row = delBtn.closest('[data-row-id]') as HTMLElement | null;
        const id = row ? Number(row.dataset['rowId']) : NaN;
        const rec = this.data.find((x) => x.id === id);
        if (rec) this.deleteRecord(rec.id, rec.name);
      }
    });
  }

  private rowHTML(r: Medicine): string {
    const stockCls =
      r.stock <= r.reorder && r.stock > 0
        ? 'text-amber-600 font-semibold'
        : r.stock === 0
          ? 'text-red-600 font-semibold'
          : 'text-gray-700 dark:text-gray-300';
    const badgeCls = this.SBADGE[r.status] || 'text-gray-900 bg-light/60';
    return `<tr data-row-id="${r.id}"><td><p class="font-medium text-gray-900">${r.name}</p><p class="text-xs text-gray-400">${r.unit}</p></td><td class="text-gray-600 dark:text-gray-300">${r.generic}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap text-primary bg-primary/10">${r.cat}</span></td><td><span class="${stockCls}">${r.stock}</span> <span class="text-xs text-gray-400">${r.unit}s</span></td><td class="text-gray-600 dark:text-gray-300">$${r.price.toFixed(2)}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.supplier}</td><td class="text-gray-500 dark:text-gray-400 text-sm">${r.expiry}</td><td><span class="inline-block px-2 py-1 text-xs font-semibold rounded-lg whitespace-nowrap ${badgeCls}">${r.status}</span></td><td><div class="flex gap-1"><button class="p-1.5 size-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400" title="Edit"><i class="icon-edit text-base"></i></button><button class="p-1.5 size-7 flex items-center justify-center rounded hover:bg-danger/20 dark:hover:bg-red-900/20 text-danger" title="Delete"><i class="icon-trash-2 text-base"></i></button></div></td></tr>`;
  }

  private updateStats(): void {
    const total = this.byId('stat-total');
    if (total) total.textContent = String(this.data.length);
    const inStock = this.byId('stat-instock');
    if (inStock) inStock.textContent = String(this.data.filter((r) => r.status === 'In Stock').length);
    const low = this.byId('stat-low');
    if (low) low.textContent = String(this.data.filter((r) => r.status === 'Low Stock').length);
    const out = this.byId('stat-out');
    if (out) out.textContent = String(this.data.filter((r) => r.status === 'Out of Stock').length);
  }

  private render(q = '', cat = '', status = ''): void {
    const rows = this.data.filter((r) => {
      const m = q ? r.name.toLowerCase().includes(q.toLowerCase()) || r.generic.toLowerCase().includes(q.toLowerCase()) || r.supplier.toLowerCase().includes(q.toLowerCase()) : true;
      return m && (cat ? r.cat === cat : true) && (status ? r.status === status : true);
    });
    const count = this.byId('count');
    if (count) count.textContent = `${rows.length} of ${this.data.length}`;

    const visible = new Set(rows.map((r) => r.id));
    let anyVisible = false;
    this.qsa<HTMLElement>('#tbody [data-row-id]').forEach((tr) => {
      const show = visible.has(Number(tr.dataset['rowId']));
      tr.classList.toggle('hidden', !show);
      if (show) anyVisible = true;
    });
    const emptyRow = this.byId('tbody-empty-row');
    if (emptyRow) emptyRow.classList.toggle('hidden', anyVisible);
  }

  private openAdd(): void {
    this.editingId = null;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Add Medicine';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Add Medicine';
    (this.byId('m-form') as HTMLFormElement | null)?.reset();
  }

  private openEdit(id: number): void {
    const r = this.data.find((x) => x.id === id);
    if (!r) return;
    this.editingId = id;
    const title = this.byId('m-title');
    if (title) title.textContent = 'Edit Medicine';
    const save = this.byId('btn-save');
    if (save) save.textContent = 'Update';
    this.setValue('f-name', r.name);
    this.setValue('f-generic', r.generic);
    this.setValue('f-cat', r.cat);
    this.setValue('f-unit', r.unit);
    this.setValue('f-stock', String(r.stock));
    this.setValue('f-reorder', String(r.reorder));
    this.setValue('f-price', String(r.price));
    this.setValue('f-supplier', r.supplier);
    this.setValue('f-expiry', r.expiry);
    this.setValue('f-status', r.status);
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.open('#form-modal');
  }

  private setValue(id: string, value: string): void {
    const el = this.byId(id) as HTMLInputElement | HTMLSelectElement | null;
    if (el) el.value = value;
  }

  private getValue(id: string): string {
    return (this.byId(id) as HTMLInputElement | HTMLSelectElement | null)?.value ?? '';
  }

  private saveRecord(): void {
    const name = this.getValue('f-name').trim();
    if (!name) {
      this.toast('Medicine name required', 'error');
      return;
    }
    const stock = parseInt(this.getValue('f-stock'), 10) || 0;
    const reorder = parseInt(this.getValue('f-reorder'), 10) || 0;
    const status = this.getValue('f-status');
    const rec = {
      name,
      generic: this.getValue('f-generic').trim(),
      cat: this.getValue('f-cat'),
      unit: this.getValue('f-unit'),
      stock,
      reorder,
      price: parseFloat(this.getValue('f-price')) || 0,
      supplier: this.getValue('f-supplier').trim(),
      expiry: this.getValue('f-expiry'),
      status,
    };
    if (this.editingId) {
      const idx = this.data.findIndex((x) => x.id === this.editingId);
      this.data[idx] = { ...this.data[idx], ...rec };
      const existingEl = this.document.querySelector('#tbody [data-row-id="' + this.editingId + '"]');
      if (existingEl) existingEl.outerHTML = this.rowHTML(this.data[idx]);
      this.wireRowActions();
      this.toast('Medicine updated', 'success');
    } else {
      const newRec: Medicine = { id: this.nextId++, ...rec };
      this.data.push(newRec);
      const emptyRow = this.byId('tbody-empty-row');
      if (emptyRow) emptyRow.insertAdjacentHTML('beforebegin', this.rowHTML(newRec));
      else this.byId('tbody')?.insertAdjacentHTML('beforeend', this.rowHTML(newRec));
      this.toast('Medicine added', 'success');
    }
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.close('#form-modal');
    this.render(this.getValue('search'), this.getValue('filter-cat'), this.getValue('filter-status'));
    this.updateStats();
  }

  private deleteRecord(id: number, name: string): void {
    const delName = this.byId('del-name');
    if (delName) delName.textContent = name;
    this.delCallback = () => {
      this.data = this.data.filter((x) => x.id !== id);
      const rowEl = this.document.querySelector('#tbody [data-row-id="' + id + '"]');
      if (rowEl) rowEl.remove();
      this.render(this.getValue('search'), this.getValue('filter-cat'), this.getValue('filter-status'));
      this.updateStats();
      this.toast('Medicine removed', 'success');
    };
    const w = window as any;
    if (w.HSOverlay) w.HSOverlay.open('#del-modal');
  }
}
