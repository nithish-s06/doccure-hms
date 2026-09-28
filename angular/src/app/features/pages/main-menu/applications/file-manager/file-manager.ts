import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;

interface FmFolder {
  id: string;
  name: string;
  accent: string;
  parent: string | null;
}

interface FmFile {
  id: string;
  name: string;
  ext: string;
  folder: string | null;
  sizeKB: number;
  modified: string;
  shared: boolean;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "File Manager (file-manager.html)".
 * In-memory folder/file browser: breadcrumb navigation, grid/list views,
 * search/sort, new-folder + upload modals, preview modal, and delete via the
 * shared del-modal (MC.confirmDelete/MC.initDeleteModal reimplemented below).
 */
@Component({
  selector: 'app-file-manager',
  imports: [],
  templateUrl: './file-manager.html',
  styleUrl: './file-manager.css',
})
export class FileManager implements AfterViewInit {
  private readonly EXT_META: Record<string, [string, string]> = {
    pdf: ['rose', 'icon-file-text'],
    doc: ['sky', 'icon-file'],
    docx: ['sky', 'icon-file'],
    xls: ['emerald', 'icon-file-spreadsheet'],
    xlsx: ['emerald', 'icon-file-spreadsheet'],
    png: ['amber', 'icon-image'],
    jpg: ['amber', 'icon-image'],
    jpeg: ['amber', 'icon-image'],
    zip: ['violet', 'icon-file-archive'],
  };

  private readonly ACCENTS = ['primary', 'amber', 'emerald', 'sky', 'violet', 'rose'];
  private nextFolderId = 1;
  private nextFileId = 1;

  private FOLDERS: FmFolder[] = [
    { id: 'patient-records', name: 'Patient Records', accent: 'amber', parent: null },
    { id: 'discharge-summaries', name: 'Discharge Summaries', accent: 'amber', parent: 'patient-records' },
    { id: 'lab-reports', name: 'Lab Reports', accent: 'sky', parent: null },
    { id: 'invoices', name: 'Invoices & Billing', accent: 'emerald', parent: null },
    { id: 'hr-docs', name: 'HR Documents', accent: 'violet', parent: null },
    { id: 'insurance', name: 'Insurance Claims', accent: 'rose', parent: null },
    { id: 'shared-team', name: 'Shared with Team', accent: 'primary', parent: null },
  ];

  private FILES: FmFile[] = [];

  private readonly STORAGE_CATS: [string, string, number][] = [
    ['Documents', 'rose', 3.2],
    ['Images', 'amber', 1.9],
    ['Spreadsheets', 'emerald', 1.4],
    ['Archives', 'violet', 0.7],
    ['Other', 'slate', 0.4],
  ];
  private readonly STORAGE_TOTAL_GB = 20;

  private readonly UPLOAD_POOL: [string, string][] = [
    ['Site Visit Photo', 'jpg'],
    ['Meeting Notes', 'docx'],
    ['Budget Sheet', 'xlsx'],
    ['Scanned Report', 'pdf'],
    ['Backup Archive', 'zip'],
  ];

  private state: { folder: string | null; q: string; sort: string; view: 'grid' | 'list' } = {
    folder: null,
    q: '',
    sort: 'name',
    view: 'grid',
  };

  private delCallback: (() => void) | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    const seed: [string, string, string | null, number, string, boolean][] = [
      ['Hospital Accreditation Certificate.pdf', 'pdf', null, 2458, '2026-08-02', true],
      ['Fire Safety Compliance.docx', 'docx', null, 540, '2026-07-18', false],
      ['Org Chart 2026.png', 'png', null, 1126, '2026-06-30', true],
      ['Patient Intake Form Template.pdf', 'pdf', 'patient-records', 320, '2026-08-20', false],
      ['Consent Forms Bundle.zip', 'zip', 'patient-records', 4915, '2026-08-15', true],
      ['Immunization Records.xlsx', 'xlsx', 'patient-records', 780, '2026-08-10', false],
      ['Discharge Summary - R. Clark.pdf', 'pdf', 'discharge-summaries', 210, '2026-08-22', false],
      ['Discharge Summary - A. Mehta.pdf', 'pdf', 'discharge-summaries', 198, '2026-08-19', false],
      ['Discharge Checklist.docx', 'docx', 'discharge-summaries', 95, '2026-08-05', false],
      ['Q3 Lab Test Volume.xlsx', 'xlsx', 'lab-reports', 1331, '2026-08-21', true],
      ['CBC Panel Reference Ranges.pdf', 'pdf', 'lab-reports', 450, '2026-07-28', false],
      ['Radiology Scan - Chest X-Ray.png', 'png', 'lab-reports', 3277, '2026-08-18', false],
      ['August Invoices Export.xlsx', 'xlsx', 'invoices', 2150, '2026-08-25', true],
      ['Insurance Billing Summary.pdf', 'pdf', 'invoices', 680, '2026-08-12', false],
      ['Payment Receipts.zip', 'zip', 'invoices', 5734, '2026-08-01', false],
      ['Staff Onboarding Kit.pdf', 'pdf', 'hr-docs', 3482, '2026-06-15', false],
      ['Leave Policy 2026.docx', 'docx', 'hr-docs', 210, '2026-05-20', false],
      ['Payroll Sheet - July.xlsx', 'xlsx', 'hr-docs', 890, '2026-07-31', false],
      ['Insurance Claims Log.xlsx', 'xlsx', 'insurance', 1638, '2026-08-24', false],
      ['Pre-Authorization Template.docx', 'docx', 'insurance', 150, '2026-07-10', false],
      ['Team Handbook.pdf', 'pdf', 'shared-team', 1843, '2026-04-12', true],
      ['Department Directory.xlsx', 'xlsx', 'shared-team', 320, '2026-08-05', true],
    ];
    this.FILES = seed.map((a, i) => ({ id: 'file' + (i + 1), name: a[0], ext: a[1], folder: a[2], sizeKB: a[3], modified: a[4], shared: a[5] }));
    this.nextFileId = this.FILES.length + 1;
  }

  ngAfterViewInit(): void {
    const page = this.byId('fm-page');
    if (!page) return;

    this.on('fm-search', 'input', (e: Event) => { this.state.q = (e.target as HTMLInputElement).value; this.render(); });
    this.on('fm-sort', 'change', (e: Event) => { this.state.sort = (e.target as HTMLSelectElement).value; this.render(); });
    this.on('fm-view-grid', 'click', () => {
      this.state.view = 'grid';
      this.byId('fm-view-grid')?.classList.add('is-active');
      this.byId('fm-view-list')?.classList.remove('is-active');
      this.render();
    });
    this.on('fm-view-list', 'click', () => {
      this.state.view = 'list';
      this.byId('fm-view-list')?.classList.add('is-active');
      this.byId('fm-view-grid')?.classList.remove('is-active');
      this.render();
    });

    this.on('fm-new-folder', 'click', () => this.openFolderModal());
    this.on('fm-folder-save', 'click', () => {
      const nameEl = this.byId('fm-f-name') as HTMLInputElement | null;
      const name = (nameEl?.value || '').trim();
      if (!name) {
        this.toast('Folder name is required', 'error');
        return;
      }
      this.FOLDERS.push({ id: 'nf' + this.nextFolderId++, name, accent: this.ACCENTS[this.FOLDERS.length % this.ACCENTS.length], parent: this.state.folder });
      this.closeOverlay('fm-folder-modal');
      this.toast(`Folder "${name}" created`);
      this.refreshAll();
    });

    this.on('fm-upload', 'click', () => {
      const cur = this.state.folder ? this.FOLDERS.find((f) => f.id === this.state.folder) : null;
      const target = this.byId('fm-upload-target');
      if (target) target.textContent = cur ? cur.name : 'Home';
      this.openOverlay('fm-upload-modal');
    });
    this.on('fm-upload-confirm', 'click', () => {
      const pick = this.UPLOAD_POOL[Math.floor(Math.random() * this.UPLOAD_POOL.length)];
      const f: FmFile = {
        id: 'file' + this.nextFileId++,
        name: `${pick[0]} ${Math.floor(Math.random() * 900 + 100)}.${pick[1]}`,
        ext: pick[1],
        folder: this.state.folder,
        sizeKB: Math.floor(Math.random() * 2400) + 80,
        modified: new Date().toISOString().slice(0, 10),
        shared: false,
      };
      this.FILES.unshift(f);
      this.closeOverlay('fm-upload-modal');
      this.toast(`"${f.name}" uploaded`);
      this.refreshAll();
    });

    this.byId('fm-breadcrumb')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-nav]');
      if (b) this.navigateTo(b.getAttribute('data-nav'));
    });
    this.byId('fm-folder-nav')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-nav]');
      if (b) this.navigateTo(b.getAttribute('data-nav'));
    });
    this.byId('fm-recent-list')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-file]');
      if (b) this.openPreview(b.getAttribute('data-file') || '');
    });

    const gridListDelegate = (e: Event) => {
      const target = e.target as HTMLElement;
      const dl = target.closest('.fm-dl');
      if (dl) {
        e.stopPropagation();
        const r = this.FILES.find((x) => x.id === dl.getAttribute('data-id'));
        if (r) this.toast(`Downloading ${r.name}`, 'info');
        return;
      }
      const del = target.closest('.fm-del');
      if (del) {
        e.stopPropagation();
        const kind = del.getAttribute('data-kind');
        const id = del.getAttribute('data-id') || '';
        if (kind === 'file') this.deleteFile(id);
        else this.deleteFolder(id);
        return;
      }
      const folderEl = target.closest('[data-folder]');
      if (folderEl) return this.navigateTo(folderEl.getAttribute('data-folder'));
      const fileEl = target.closest('[data-file]');
      if (fileEl) return this.openPreview(fileEl.getAttribute('data-file') || '');
    };
    this.byId('fm-grid')?.addEventListener('click', gridListDelegate);
    this.byId('fm-list-body')?.addEventListener('click', gridListDelegate);

    this.initDeleteModal();
    this.document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      this.closeOverlay('del-modal');
    });

    // Initial state (Home folder, grid view, no search/sort applied) is already
    // present as static markup in the HTML, so no initial refreshAll() render is
    // needed here. refreshAll() still runs after every mutation.
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private on(id: string, ev: string, fn: (e: Event) => void): void {
    this.byId(id)?.addEventListener(ev, fn);
  }

  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private openOverlay(id: string): void {
    if (typeof HSOverlay !== 'undefined') HSOverlay.open('#' + id);
  }

  private closeOverlay(id: string): void {
    if (typeof HSOverlay !== 'undefined') HSOverlay.close('#' + id);
  }

  private fileMeta(ext: string): [string, string] {
    return this.EXT_META[ext] || ['slate', 'icon-file'];
  }

  private fmtSize(kb: number): string {
    return kb >= 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
  }

  private fmtDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private itemCount(folderId: string | null): number {
    return this.FOLDERS.filter((f) => f.parent === folderId).length + this.FILES.filter((r) => r.folder === folderId).length;
  }

  private pathTo(folderId: string | null): FmFolder[] {
    const path: FmFolder[] = [];
    let f = folderId ? this.FOLDERS.find((x) => x.id === folderId) : undefined;
    while (f) {
      path.unshift(f);
      f = f.parent ? this.FOLDERS.find((x) => x.id === f!.parent) : undefined;
    }
    return path;
  }

  private isDescendantOf(folderId: string | null, ancestorId: string): boolean {
    let f = folderId ? this.FOLDERS.find((x) => x.id === folderId) : undefined;
    while (f) {
      if (f.parent === ancestorId) return true;
      f = f.parent ? this.FOLDERS.find((x) => x.id === f!.parent) : undefined;
    }
    return false;
  }

  private visibleItems(): { folders: FmFolder[]; files: FmFile[] } {
    let subF = this.FOLDERS.filter((f) => f.parent === this.state.folder);
    let subFiles = this.FILES.filter((r) => r.folder === this.state.folder);
    const q = this.state.q.trim().toLowerCase();
    if (q) {
      subF = subF.filter((f) => f.name.toLowerCase().indexOf(q) > -1);
      subFiles = subFiles.filter((r) => r.name.toLowerCase().indexOf(q) > -1);
    }
    subF = subF.slice().sort((a, b) => a.name.localeCompare(b.name));
    subFiles = subFiles.slice().sort((a, b) => {
      switch (this.state.sort) {
        case 'recent':
          return b.modified.localeCompare(a.modified);
        case 'size':
          return b.sizeKB - a.sizeKB;
        case 'type':
          return a.ext.localeCompare(b.ext) || a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return { folders: subF, files: subFiles };
  }

  private folderCardHTML(f: FmFolder): string {
    return (
      `<article class="fm-card fm-c-${f.accent}" data-folder="${f.id}">` +
      '<div class="fm-thumb"><i class="icon-folder big"></i>' +
      `<div style="position:absolute;top:.5rem;right:.5rem;display:flex;gap:.35rem"><button class="fm-mini fm-del" data-kind="folder" data-id="${f.id}" title="Delete"><i class="icon-trash-2 text-xs"></i></button></div>` +
      `</div><div class="p-3"><p class="text-sm font-bold text-gray-900 dark:text-white truncate">${this.esc(f.name)}</p>` +
      `<p class="text-[11px] text-gray-400 mt-0.5">${this.itemCount(f.id)} items</p></div></article>`
    );
  }

  private fileCardHTML(r: FmFile): string {
    const m = this.fileMeta(r.ext);
    return (
      `<article class="fm-card fm-c-${m[0]}" data-file="${r.id}">` +
      `<div class="fm-thumb"><i class="${m[1]} big"></i>` +
      (r.shared ? '<span class="fm-badge" style="position:absolute;top:.5rem;left:.5rem"><i class="icon-share-2 text-[9px]"></i>Shared</span>' : '') +
      '<div style="position:absolute;top:.5rem;right:.5rem;display:flex;gap:.35rem">' +
      `<button class="fm-mini fm-dl" data-id="${r.id}" title="Download"><i class="icon-download text-xs"></i></button>` +
      `<button class="fm-mini fm-del" data-kind="file" data-id="${r.id}" title="Delete"><i class="icon-trash-2 text-xs"></i></button></div>` +
      `</div><div class="p-3"><p class="text-sm font-bold text-gray-900 dark:text-white truncate" title="${this.esc(r.name)}">${this.esc(r.name)}</p>` +
      `<p class="text-[11px] text-gray-400 mt-0.5">${this.fmtSize(r.sizeKB)} · ${this.fmtDate(r.modified)}</p></div></article>`
    );
  }

  private rowFolderHTML(f: FmFolder): string {
    return (
      `<tr data-folder="${f.id}"><td><div class="flex items-center gap-2.5"><span class="fm-fileico fm-c-${f.accent}"><i class="icon-folder"></i></span>` +
      `<span class="font-semibold text-gray-900 dark:text-white">${this.esc(f.name)}</span></div></td>` +
      `<td class="text-gray-500">Folder</td><td class="text-gray-500">${this.itemCount(f.id)} items</td><td class="text-gray-500">—</td>` +
      `<td class="text-right"><button class="fm-mini fm-del" data-kind="folder" data-id="${f.id}" title="Delete"><i class="icon-trash-2 text-sm"></i></button></td></tr>`
    );
  }

  private rowFileHTML(r: FmFile): string {
    const m = this.fileMeta(r.ext);
    return (
      `<tr data-file="${r.id}"><td><div class="flex items-center gap-2.5"><span class="fm-fileico fm-c-${m[0]}"><i class="${m[1]}"></i></span>` +
      `<span class="font-semibold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</span>` +
      (r.shared ? ' <i class="icon-share-2 text-[11px] text-gray-400" title="Shared"></i>' : '') +
      `</div></td><td class="text-gray-500 uppercase">${r.ext}</td><td class="text-gray-500">${this.fmtSize(r.sizeKB)}</td><td class="text-gray-500">${this.fmtDate(r.modified)}</td>` +
      `<td class="text-right"><div class="inline-flex gap-1.5"><button class="fm-mini fm-dl" data-id="${r.id}" title="Download"><i class="icon-download text-sm"></i></button>` +
      `<button class="fm-mini fm-del" data-kind="file" data-id="${r.id}" title="Delete"><i class="icon-trash-2 text-sm"></i></button></div></td></tr>`
    );
  }

  private render(): void {
    const items = this.visibleItems();
    const total = items.folders.length + items.files.length;
    const countEl = this.byId('fm-count');
    if (countEl) countEl.textContent = total + (total === 1 ? ' item' : ' items');
    this.byId('fm-empty')?.classList.toggle('hidden', total !== 0);
    const gridEl = this.byId('fm-grid');
    const listWrap = this.byId('fm-list-wrap');
    const tbody = this.byId('fm-list-body');
    if (!gridEl || !listWrap || !tbody) return;
    if (total === 0) {
      gridEl.classList.add('hidden');
      listWrap.classList.add('hidden');
      gridEl.innerHTML = '';
      tbody.innerHTML = '';
    } else if (this.state.view === 'grid') {
      gridEl.classList.remove('hidden');
      listWrap.classList.add('hidden');
      gridEl.innerHTML = items.folders.map((f) => this.folderCardHTML(f)).join('') + items.files.map((r) => this.fileCardHTML(r)).join('');
    } else {
      gridEl.classList.add('hidden');
      listWrap.classList.remove('hidden');
      tbody.innerHTML = items.folders.map((f) => this.rowFolderHTML(f)).join('') + items.files.map((r) => this.rowFileHTML(r)).join('');
    }
    this.renderBreadcrumb();
  }

  private renderBreadcrumb(): void {
    const path = this.pathTo(this.state.folder);
    let html = path.length
      ? '<button type="button" data-nav="" class="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">Home</button>'
      : '<span class="font-medium text-gray-900 dark:text-gray-200">Home</span>';
    path.forEach((f, i) => {
      html += '<i class="icon-chevron-right text-[10px] text-gray-300" aria-hidden="true"></i>';
      html +=
        i === path.length - 1
          ? `<span class="font-medium text-gray-900 dark:text-gray-200">${this.esc(f.name)}</span>`
          : `<button type="button" data-nav="${f.id}" class="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">${this.esc(f.name)}</button>`;
    });
    const bc = this.byId('fm-breadcrumb');
    if (bc) bc.innerHTML = html;
  }

  private renderFolderNav(): void {
    const roots = this.FOLDERS.filter((f) => f.parent === null);
    const nav = this.byId('fm-folder-nav');
    if (!nav) return;
    nav.innerHTML = roots
      .map(
        (f) =>
          `<div class="fm-fold fm-c-${f.accent}${this.state.folder === f.id ? ' is-active' : ''}" data-nav="${f.id}">` +
          '<span class="fm-fold-ico"><i class="icon-folder"></i></span>' +
          `<div class="min-w-0 flex-1"><p class="text-sm font-bold text-gray-900 dark:text-white truncate">${this.esc(f.name)}</p><p class="text-[11px] text-gray-400">${this.itemCount(f.id)} items</p></div></div>`
      )
      .join('');
  }

  private renderRecent(): void {
    const recent = this.FILES.slice().sort((a, b) => b.modified.localeCompare(a.modified)).slice(0, 6);
    const el = this.byId('fm-recent-list');
    if (!el) return;
    el.innerHTML = recent.length
      ? recent
          .map((r) => {
            const m = this.fileMeta(r.ext);
            return (
              `<div class="fm-recent" data-file="${r.id}"><span class="fm-doc-ico fm-c-${m[0]}"><i class="${m[1]}"></i></span>` +
              `<div class="min-w-0 flex-1"><p class="text-xs font-bold text-gray-900 dark:text-white truncate">${this.esc(r.name)}</p><p class="text-[10px] text-gray-400">${this.fmtSize(r.sizeKB)} · ${this.fmtDate(r.modified)}</p></div></div>`
            );
          })
          .join('')
      : '<p class="text-xs text-gray-400 text-center py-3">No recent files</p>';
  }

  private renderStorage(): void {
    const used = this.STORAGE_CATS.reduce((s, c) => s + c[2], 0);
    const segs = this.byId('fm-storage-segs');
    if (segs) {
      segs.innerHTML = this.STORAGE_CATS.map(
        (c) => `<span class="fm-c-${c[1]}" style="display:inline-block;height:100%;width:${((c[2] / this.STORAGE_TOTAL_GB) * 100).toFixed(1)}%;background:var(--fm-c)"></span>`
      ).join('');
    }
    const legend = this.byId('fm-storage-legend');
    if (legend) {
      legend.innerHTML = this.STORAGE_CATS.map(
        (c) =>
          `<div class="flex items-center justify-between text-xs"><span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300"><span class="w-2 h-2 rounded-full fm-c-${c[1]}" style="background:var(--fm-c)"></span>${c[0]}</span><span class="font-semibold text-gray-900 dark:text-white">${c[2].toFixed(1)} GB</span></div>`
      ).join('');
    }
    const totalEl = this.byId('fm-storage-total');
    if (totalEl) totalEl.textContent = `${used.toFixed(1)} GB of ${this.STORAGE_TOTAL_GB} GB used · ${Math.round(((this.STORAGE_TOTAL_GB - used) / this.STORAGE_TOTAL_GB) * 100)}% free`;
  }

  private renderKPIs(): void {
    const shared = this.FILES.filter((r) => r.shared).length;
    const set = (id: string, v: string | number) => {
      const el = this.byId(id);
      if (el) el.textContent = String(v);
    };
    set('fm-kpi-files', this.FILES.length);
    set('fm-kpi-folders', this.FOLDERS.length);
    set('fm-kpi-shared', shared);
    set('fm-total-badge', this.FILES.length);
    set('fm-shared-badge', shared);
  }

  private refreshAll(): void {
    this.renderKPIs();
    this.renderStorage();
    this.renderFolderNav();
    this.renderRecent();
    this.render();
  }

  private navigateTo(id: string | null): void {
    this.state.folder = id || null;
    this.state.q = '';
    const s = this.byId('fm-search') as HTMLInputElement | null;
    if (s) s.value = '';
    this.render();
    this.renderFolderNav();
  }

  private deleteFile(id: string): void {
    const r = this.FILES.find((x) => x.id === id);
    if (!r) return;
    this.confirmDelete(r.name, () => {
      this.FILES = this.FILES.filter((x) => x.id !== id);
      this.toast('File deleted');
      this.refreshAll();
    });
  }

  private removeFolderRecursive(id: string): void {
    this.FOLDERS.filter((x) => x.parent === id).forEach((cf) => this.removeFolderRecursive(cf.id));
    this.FILES = this.FILES.filter((x) => x.folder !== id);
    this.FOLDERS = this.FOLDERS.filter((x) => x.id !== id);
  }

  private deleteFolder(id: string): void {
    const f = this.FOLDERS.find((x) => x.id === id);
    if (!f) return;
    const parent = f.parent;
    const affectsCurrent = this.state.folder === id || this.isDescendantOf(this.state.folder, id);
    this.confirmDelete(f.name, () => {
      this.removeFolderRecursive(id);
      if (affectsCurrent) this.state.folder = parent;
      this.toast('Folder deleted');
      this.refreshAll();
    });
  }

  private openPreview(id: string): void {
    const r = this.FILES.find((x) => x.id === id);
    if (!r) return;
    const m = this.fileMeta(r.ext);
    const icon = this.byId('fm-preview-icon');
    if (icon) {
      icon.className = `fm-doc-ico fm-c-${m[0]}`;
      icon.innerHTML = `<i class="${m[1]}"></i>`;
    }
    const nameEl = this.byId('fm-preview-name');
    if (nameEl) nameEl.textContent = r.name;
    const folderName = r.folder ? (this.FOLDERS.find((f) => f.id === r.folder)?.name || 'Home') : 'Home';
    const metaEl = this.byId('fm-preview-meta');
    if (metaEl) metaEl.textContent = `${this.fmtSize(r.sizeKB)} · Modified ${this.fmtDate(r.modified)} · ${folderName}`;
    this.byId('fm-preview-shared')?.classList.toggle('hidden', !r.shared);
    const dl = this.byId('fm-preview-download');
    if (dl) dl.onclick = () => this.toast(`Downloading ${r.name}`, 'info');
    const del = this.byId('fm-preview-delete');
    if (del) del.onclick = () => { this.closeOverlay('fm-preview-modal'); this.deleteFile(id); };
    this.openOverlay('fm-preview-modal');
  }

  private openFolderModal(): void {
    const cur = this.state.folder ? this.FOLDERS.find((f) => f.id === this.state.folder) : null;
    const target = this.byId('fm-folder-target');
    if (target) target.textContent = cur ? cur.name : 'Home';
    const nameInput = this.byId('fm-f-name') as HTMLInputElement | null;
    if (nameInput) nameInput.value = '';
    this.openOverlay('fm-folder-modal');
    setTimeout(() => nameInput?.focus(), 50);
  }

  /* ---------------- shared delete modal (ported from MC.confirmDelete/initDeleteModal) ---------------- */

  private confirmDelete(name: string, onConfirm: () => void): void {
    const nameEl = this.byId('del-name');
    if (nameEl) nameEl.textContent = name;
    this.delCallback = onConfirm;
    this.openOverlayLegacy('del-modal');
  }

  private openOverlayLegacy(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    el.classList.remove('hidden');
    this.document.body.style.overflow = 'hidden';
  }

  private closeOverlayLegacy(id: string): void {
    const el = this.byId(id);
    if (!el) return;
    el.classList.add('hidden');
    this.document.body.style.overflow = '';
  }

  private initDeleteModal(): void {
    const btn = this.byId('del-confirm-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        if (this.delCallback) this.delCallback();
        this.closeOverlayLegacy('del-modal');
      });
    }
    const cancel = this.byId('del-cancel-btn');
    if (cancel) cancel.addEventListener('click', () => this.closeOverlayLegacy('del-modal'));
  }
}
