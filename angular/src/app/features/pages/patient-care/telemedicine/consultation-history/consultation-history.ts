import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js —
 * "// CONSULTATION-HISTORY (consultation-history.html)" IIFE.
 *
 * Every consultation record ships as static markup in all three views
 * (Timeline, Grid, #ch-tbody) — see consultation-history.html. This only
 * wires search/filter/sort against the existing nodes; there is no data
 * array and no innerHTML rebuild of records. Grid + List share one
 * "static list" filter/sort pass (re-ordering + hiding existing nodes,
 * a reimplementation of the source's shared MC.staticList helper since
 * there is no global MC in Angular); Timeline is day-grouped so it gets
 * its own small filter/sort pass that reorders cards within each existing
 * .ch-tl-group instead of flattening the groups. The 9 dialogs (New/Edit,
 * Prescription, Follow-up, Share, Upload, Import, Export, Print, Delete)
 * are the Preline hs-overlay modals ported into the HTML; their Confirm
 * buttons just close (native to Preline via data-hs-overlay) and toast, no
 * data mutation. There is no quick-view drawer — "view" actions link
 * straight to consultation-detail.html.
 */
@Component({
  imports: [],
  selector: 'app-consultation-history',
  styleUrl: './consultation-history.css',
  templateUrl: './consultation-history.html',
})
export class ConsultationHistory implements AfterViewInit {
  private view = 'timeline';

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
    setTimeout(() => {
      this.byId('ch-skeleton')?.classList.add('hidden');
      this.byId('ch-content')?.classList.remove('hidden');
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }

  private byId(id: string): HTMLElement | null { return this.document.getElementById(id); }
  private qs(sel: string, root: ParentNode = this.document): HTMLElement | null { return root.querySelector(sel); }
  private qsa(sel: string, root: ParentNode = this.document): HTMLElement[] { return Array.from(root.querySelectorAll(sel)); }
  private toast(message: string): void { this.toastService.show(message, 'success'); }

  private fDoctor(): HTMLSelectElement | null { return this.qs('[data-f="doctor"]') as HTMLSelectElement | null; }
  private fDept(): HTMLSelectElement | null { return this.qs('[data-f="dept"]') as HTMLSelectElement | null; }
  private fCtype(): HTMLSelectElement | null { return this.qs('[data-f="ctype"]') as HTMLSelectElement | null; }
  private fPstatus(): HTMLSelectElement | null { return this.qs('[data-f="pstatus"]') as HTMLSelectElement | null; }
  private fStatus(): HTMLSelectElement | null { return this.qs('[data-f="status"]') as HTMLSelectElement | null; }
  private sortSel(): HTMLSelectElement | null { return this.qs('[data-f="sort"]') as HTMLSelectElement | null; }
  private search(): HTMLInputElement | null { return this.byId('ch-search') as HTMLInputElement | null; }

  private matches(el: HTMLElement): boolean {
    const fd = this.fDoctor(), fdep = this.fDept(), fc = this.fCtype(), fp = this.fPstatus(), fs = this.fStatus();
    if (fd?.value && el.dataset['doctor'] !== fd.value) return false;
    if (fdep?.value && el.dataset['dept'] !== fdep.value) return false;
    if (fc?.value && el.dataset['ctype'] !== fc.value) return false;
    if (fp?.value && el.dataset['pstatus'] !== fp.value) return false;
    if (fs?.value && el.dataset['status'] !== fs.value) return false;
    return true;
  }

  private compare(a: HTMLElement, b: HTMLElement): number {
    switch (this.sortSel()?.value) {
      case 'dateold': return Number(b.dataset['idx']) - Number(a.dataset['idx']);
      case 'dur': return Number(b.dataset['dur']) - Number(a.dataset['dur']);
      case 'name': return (a.dataset['name'] || '').localeCompare(b.dataset['name'] || '');
      default: return Number(a.dataset['idx']) - Number(b.dataset['idx']); // "date" — newest first (array order)
    }
  }

  /* ---------------- Static list (grid + table rows) ---------------- */

  private refreshStaticList(): void {
    const term = (this.search()?.value || '').trim().toLowerCase();
    const grid = this.byId('ch-grid');
    const tbody = this.byId('ch-tbody');
    let total = 0;

    [{ container: grid, itemSelector: '.ch-ccard' }, { container: tbody, itemSelector: 'tr' }].forEach(({ container, itemSelector }) => {
      if (!container) return;
      const items = this.qsa(itemSelector, container);
      const visible: HTMLElement[] = [];
      items.forEach((el) => {
        const textOk = !term || (el.textContent || '').toLowerCase().indexOf(term) !== -1;
        const show = textOk && this.matches(el);
        el.hidden = !show;
        if (show) visible.push(el);
      });
      visible.sort((a, b) => this.compare(a, b)).forEach((el) => container.appendChild(el));
      total = Math.max(total, visible.length);
    });

    const empty = this.byId('ch-empty');
    empty?.classList.toggle('hidden', total !== 0);
    this.byId('ch-view-timeline')?.classList.toggle('hidden', this.view !== 'timeline' || total === 0);
    this.byId('ch-view-grid')?.classList.toggle('hidden', this.view !== 'grid' || total === 0);
    this.byId('ch-view-list')?.classList.toggle('hidden', this.view !== 'list' || total === 0);
    this.syncSelAll();
  }

  /* ---------------- Timeline (day-grouped) ---------------- */

  private refreshTimeline(): void {
    const term = (this.search()?.value || '').trim().toLowerCase();
    this.qsa('.ch-tl-group').forEach((group) => {
      const cards = this.qsa('.ch-tl-card', group);
      cards.forEach((el) => {
        const textOk = !term || (el.textContent || '').toLowerCase().indexOf(term) !== -1;
        el.hidden = !(textOk && this.matches(el));
      });
      [...cards].sort((a, b) => this.compare(a, b)).forEach((el) => group.appendChild(el));
      (group as HTMLElement).hidden = cards.every((el) => el.hidden);
    });
  }

  private refreshAll(): void {
    this.refreshStaticList();
    this.refreshTimeline();
  }

  /* ---------------- Rings ---------------- */

  private animateRings(): void {
    this.qsa('.ch-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }

  /* ---------------- Selection / bulk ---------------- */

  private selectedBoxes(): HTMLInputElement[] { return this.qsa('.ch-rowcb') as HTMLInputElement[]; }
  private selCount(): number { return this.selectedBoxes().filter((b) => b.checked).length; }
  private syncBulk(): void {
    const n = this.selCount();
    const el = this.byId('ch-bulk-n'); if (el) el.textContent = String(n);
    this.byId('ch-bulk')?.classList.toggle('show', n > 0);
  }
  private syncSelAll(): void {
    const sa = this.byId('ch-selall') as HTMLInputElement | null;
    if (!sa) return;
    const boxes = this.selectedBoxes().filter((b) => !(b.closest('tr') as HTMLElement | null)?.hidden);
    sa.checked = boxes.length > 0 && boxes.every((b) => b.checked);
  }

  private updateFilterCount(): void {
    const sels = [this.fDoctor(), this.fDept(), this.fCtype(), this.fPstatus(), this.fStatus()];
    const n = sels.filter((s) => s?.value).length;
    const el = this.byId('ch-filter-n');
    if (el) { el.textContent = String(n); el.classList.toggle('hidden', n === 0); }
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e) => {
      const tt = (e.target as HTMLElement).closest('[data-toast]') as HTMLElement | null;
      if (tt) this.toast(tt.getAttribute('data-toast') || '');
    });

    this.refreshTimeline();
    this.search()?.addEventListener('input', () => this.refreshAll());
    [this.fDoctor(), this.fDept(), this.fCtype(), this.fPstatus(), this.fStatus(), this.sortSel()].forEach((el) => el?.addEventListener('change', () => this.refreshAll()));

    this.byId('ch-view')?.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.view = b.getAttribute('data-v') || 'timeline';
      this.qsa('.ch-segb', this.byId('ch-view') as HTMLElement).forEach((x) => x.classList.toggle('active', x === b));
      this.refreshAll();
    });

    this.byId('ch-filter-toggle')?.addEventListener('click', () => this.byId('ch-filters')?.classList.toggle('hidden'));
    this.byId('ch-cols-toggle')?.addEventListener('click', () => this.byId('ch-cols')?.classList.toggle('hidden'));
    this.qs('[data-adv]')?.addEventListener('click', () => {
      this.byId('ch-filters')?.classList.remove('hidden');
      this.search()?.focus();
      this.toast('Advanced search enabled');
    });

    this.qsa('[data-f]').forEach((sel) => sel.addEventListener('change', () => this.updateFilterCount()));
    this.byId('ch-clear')?.addEventListener('click', () => {
      this.qsa('[data-f]').forEach((s) => { if (s.getAttribute('data-f') !== 'sort') (s as HTMLSelectElement).value = ''; });
      this.updateFilterCount();
      this.refreshAll();
      this.toast('Filters cleared');
    });

    this.document.addEventListener('change', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('ch-rowcb')) { this.syncBulk(); this.syncSelAll(); }
      if (target.id === 'ch-selall') {
        this.selectedBoxes().forEach((b) => { if (!(b.closest('tr') as HTMLElement | null)?.hidden) b.checked = (target as HTMLInputElement).checked; });
        this.syncBulk();
      }
    });
    this.byId('ch-bulk-x')?.addEventListener('click', () => {
      this.selectedBoxes().forEach((b) => (b.checked = false));
      this.syncBulk();
      this.syncSelAll();
    });
    this.qsa('[data-bulk]').forEach((b) => b.addEventListener('click', () => {
      const act = b.getAttribute('data-bulk') || '';
      const n = this.selCount();
      const names: Record<string, string> = { followup: 'Follow-up scheduled for', notify: 'Notifications sent to', export: 'Exported', print: 'Printed', archive: 'record(s) archived for', delete: 'record(s) deleted for' };
      this.toast(`${names[act] || 'Updated'} ${n} record${n === 1 ? '' : 's'}`);
    }));

    this.qs('[data-refresh]')?.addEventListener('click', () => {
      const upd = this.byId('ch-h-updated'); if (upd) upd.textContent = 'just now';
      this.refreshAll();
      this.animateRings();
      this.toast('History refreshed');
    });

    this.qsa('.ch-drop').forEach((dz) => {
      const fi = this.qs('input[type=file]', dz) as HTMLInputElement | null;
      if (!fi) return;
      dz.addEventListener('click', () => fi.click());
      fi.addEventListener('change', () => {
        if (!fi.files?.[0]) return;
        const host = dz.closest('[id^="ch-modal-"]');
        const sumEl = (host?.querySelector('#ch-import-sum') || host?.querySelector('#ch-upload-sum')) as HTMLElement | null;
        if (sumEl) sumEl.innerHTML = `<b class="text-[var(--color-gray-900)]">${fi.files[0].name}</b> ready${sumEl.id === 'ch-import-sum' ? ' · 24 rows · 0 errors' : ''}`;
      });
      ['dragover', 'dragenter'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
      ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    });

    this.qsa('.ch-expfmt').forEach((b) => b.addEventListener('click', () => {
      this.qsa('.ch-expfmt').forEach((x) => x.classList.remove('!border-[var(--color-primary)]'));
      b.classList.add('!border-[var(--color-primary)]');
    }));
  }
}
