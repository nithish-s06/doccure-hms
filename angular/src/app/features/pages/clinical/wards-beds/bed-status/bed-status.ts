import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface RenderInfo {
  total: number;
  from: number;
  shown: number;
  pages: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "BED-STATUS (bed-status.html)".
 * The hero capacity strip, KPI row, floor plan, housekeeping queue,
 * turnaround-by-ward and bed-mix donut all ship as static HTML. This wires
 * interaction against that markup:
 *   - #search / #filter-ward / #filter-state drive search/filter/paginate
 *     over the static <tr> rows in #grid-body (MC.staticList, reimplemented
 *     as plain component methods — never rebuilds row markup).
 *   - Mark Ready updates the acted-on bed's own row + floor tile and
 *     removes its housekeeping task, exactly as the source does.
 *   - Request Clean / Block / Reserve / View normally open Preline modals
 *     keyed off the clicked bed's data-* attributes; this page's ported
 *     HTML has no such modal markup, so those actions surface their intent
 *     via a toast instead of collecting form input, and Release / Unblock
 *     (which use fixed values, no modal) still apply their real state
 *     change to the row + tile as the source does.
 */
@Component({
  imports: [],
  selector: 'app-bed-status',
  styleUrl: './bed-status.css',
  templateUrl: './bed-status.html',
})
export class BedStatus implements AfterViewInit {
  private page = 1;
  private readonly perPage = 10;

  private readonly STATE: Record<string, { cls: string; badge: string; icon: string }> = {
    Occupied: { cls: 'state-occupied', badge: 'badge-blue', icon: 'icon-user-round' },
    Available: { cls: 'state-available', badge: 'badge-green', icon: 'icon-check' },
    Cleaning: { cls: 'state-cleaning', badge: 'badge-amber', icon: 'icon-spray-can' },
    Reserved: { cls: 'state-reserved', badge: 'badge-blue', icon: 'icon-bookmark' },
    Blocked: { cls: 'state-blocked', badge: 'badge-gray', icon: 'icon-ban' },
    Maintenance: { cls: 'state-maintenance', badge: 'badge-purple', icon: 'icon-wrench' },
  };
  private readonly HOUSEKEEPERS = ['Rosa Villalobos', 'Dwayne Pickering', 'Anneke Brouwer', 'Tyrell Osei'];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireRegistry();
    this.wireFloorPlan();
    this.wireHousekeeping();
    this.wireGridActions();
    this.wireHero();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'info' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  private findRow(id: string): HTMLElement | null {
    return this.document.querySelector(`#grid-body tr[data-id="${id}"]`);
  }

  private findTile(id: string): HTMLElement | null {
    return this.document.querySelector(`#floor-plan [data-open="${id}"]`);
  }

  /* ---------------- Registry search/filter/paginate ---------------- */

  private matches(row: HTMLElement): boolean {
    const ward = (this.byId('filter-ward') as HTMLSelectElement | null)?.value || '';
    const state = (this.byId('filter-state') as HTMLSelectElement | null)?.value || '';
    return (!ward || row.dataset['ward'] === ward) && (!state || row.dataset['state'] === state);
  }

  private passes(row: HTMLElement): boolean {
    const search = this.byId('search') as HTMLInputElement | null;
    const term = search ? search.value.trim().toLowerCase() : '';
    if (term && !(row.textContent || '').toLowerCase().includes(term)) return false;
    return this.matches(row);
  }

  private render(): void {
    const body = this.byId('grid-body');
    if (!body) return;
    const all = Array.from(body.querySelectorAll<HTMLElement>('tr[data-id]'));
    let shown = all.filter((el) => this.passes(el));
    shown = shown.slice().sort((a, b) => (+(a.dataset['idx'] || 0)) - (+(b.dataset['idx'] || 0)));
    const pages = Math.max(1, Math.ceil(shown.length / this.perPage));
    if (this.page > pages) this.page = pages;
    const start = (this.page - 1) * this.perPage;
    const slice = shown.slice(start, start + this.perPage);
    all.forEach((el) => (el.hidden = slice.indexOf(el) === -1));
    slice.forEach((el) => body.appendChild(el));
    const info: RenderInfo = { total: shown.length, from: start, shown: slice.length, pages };
    this.onRender(info);
  }

  private onRender(info: RenderInfo): void {
    const count = this.byId('grid-count');
    if (count) count.textContent = `${info.total}${info.total === 1 ? ' bed' : ' beds'}`;
    const gridInfo = this.byId('grid-info');
    if (gridInfo) {
      gridInfo.textContent = info.total
        ? `Showing ${info.from + 1} to ${info.from + info.shown} of ${info.total} entries`
        : 'Showing 0 to 0 of 0 entries';
    }
    const emptyRow = this.byId('grid-empty-row') as HTMLTableRowElement | null;
    if (emptyRow) emptyRow.hidden = info.total !== 0;
    this.renderPager(info.pages);
  }

  private renderPager(pages: number): void {
    const pager = this.byId('grid-pager');
    if (!pager) return;
    pager.textContent = '';
    pager.appendChild(this.pageButton(this.page - 1, { icon: 'icon-chevron-left', disabled: this.page === 1, ariaLabel: 'Previous page' }));
    let start = Math.max(1, this.page - 2);
    const end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    for (let p = start; p <= end; p++) pager.appendChild(this.pageButton(p, { active: p === this.page }));
    pager.appendChild(this.pageButton(this.page + 1, { icon: 'icon-chevron-right', disabled: this.page === pages, ariaLabel: 'Next page' }));
  }

  private pageButton(target: number, opts: { active?: boolean; disabled?: boolean; icon?: string; ariaLabel?: string }): HTMLButtonElement {
    const b = this.document.createElement('button');
    b.type = 'button';
    b.className = opts.active ? 'pm-page-btn is-active' : 'pm-page-btn';
    b.disabled = !!opts.disabled;
    if (opts.ariaLabel) b.setAttribute('aria-label', opts.ariaLabel);
    if (opts.icon) {
      const i = this.document.createElement('i');
      i.className = opts.icon + ' text-xs';
      i.setAttribute('aria-hidden', 'true');
      b.appendChild(i);
    } else {
      b.textContent = String(target);
    }
    b.addEventListener('click', () => {
      if (opts.disabled) return;
      this.page = target;
      this.render();
    });
    return b;
  }

  private wireRegistry(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const wardSel = this.byId('filter-ward');
    const stateSel = this.byId('filter-state');
    search?.addEventListener('input', () => { this.page = 1; this.render(); });
    wardSel?.addEventListener('change', () => { this.page = 1; this.render(); });
    stateSel?.addEventListener('change', () => { this.page = 1; this.render(); });
    this.render();
  }

  /* ---------------- State changes ---------------- */

  private badgeHTML(state: string): string {
    const st = this.STATE[state];
    return `<span class="badge ${st.badge}"><i class="${st.icon} text-[9px]" aria-hidden="true"></i>${state}</span>`;
  }

  private chipHTML(tone: string, text: string): string {
    return `<span class="hms-chip ${tone}">${text}</span>`;
  }

  private applyState(
    id: string,
    state: string,
    readyText: string,
    readyTone: string,
    occ: { type: string; for?: string; reason?: string; until?: string; cleaning?: { type: string; assignee: string; pct: number; target: number } }
  ): void {
    const r = this.findRow(id);
    if (r) {
      r.className = `hms-row ${this.STATE[state].cls}`;
      r.dataset['state'] = state;
      r.dataset['sinceText'] = '0m';
      r.dataset['readyText'] = readyText;
      r.dataset['readyTone'] = readyTone;
      r.dataset['stateTone'] = `tone-${state.toLowerCase()}`;
      r.dataset['occupant'] = occ.type;
      delete r.dataset['patient'];
      delete r.dataset['age'];
      delete r.dataset['gender'];
      delete r.dataset['consultant'];
      delete r.dataset['reservedFor'];
      delete r.dataset['reason'];
      delete r.dataset['until'];
      if (occ.type === 'reserved' && occ.for) r.dataset['reservedFor'] = occ.for;
      if (occ.type === 'reason') {
        if (occ.reason) r.dataset['reason'] = occ.reason;
        if (occ.until) r.dataset['until'] = occ.until;
      }
      delete r.dataset['cleanType'];
      delete r.dataset['assignee'];
      delete r.dataset['cleanPct'];
      delete r.dataset['cleanTarget'];
      delete r.dataset['cleanOver'];
      if (occ.cleaning) {
        r.dataset['cleaning'] = 'yes';
        r.dataset['cleanType'] = occ.cleaning.type;
        r.dataset['assignee'] = occ.cleaning.assignee;
        r.dataset['cleanPct'] = String(occ.cleaning.pct);
        r.dataset['cleanTarget'] = String(occ.cleaning.target);
        r.dataset['cleanOver'] = 'no';
      } else {
        r.dataset['cleaning'] = 'no';
      }

      const cells = r.children;
      if (cells[3]) cells[3].innerHTML = this.badgeHTML(state);
      if (cells[4]) cells[4].innerHTML = occ.type === 'reserved' && occ.for
        ? `<span class="text-[11px] text-gray-500 dark:text-gray-400 truncate">Held · ${(occ.for.split(' — ')[0])}</span>`
        : '<span class="text-[11px] text-gray-300 dark:text-slate-600">—</span>';
      if (cells[5]) cells[5].innerHTML = '<span class="text-xs text-gray-600 dark:text-gray-300 tabular-nums">0m</span>';
      if (cells[6]) cells[6].innerHTML = this.chipHTML(readyTone, readyText);
    }
    const t = this.findTile(id);
    if (t) {
      t.className = `wb-bed ${this.STATE[state].cls}`;
      t.title = `${id} — ${state} · ${state}`;
      const sr = t.querySelector('.sr-only');
      if (sr) sr.textContent = `${id}, ${state}`;
    }
  }

  private removeHkTask(id: string): void {
    const btn = this.document.querySelector(`#hk-list [data-ready="${id}"]`);
    const task = btn?.closest('.wb-task') as HTMLElement | null;
    if (!task) return;
    task.remove();
    const list = this.byId('hk-list');
    const remaining = list?.querySelectorAll('.wb-task').length || 0;
    const count = this.byId('hk-count');
    if (count) count.textContent = `${remaining} pending`;
    if (!remaining && list) {
      list.innerHTML =
        '<div class="py-10 text-center">' +
        '<i class="icon-check text-3xl text-success" aria-hidden="true"></i>' +
        '<p class="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Housekeeping queue clear</p>' +
        '<p class="text-xs text-gray-400">Every bed is turned around.</p></div>';
    }
  }

  private markReady(id: string): void {
    this.applyState(id, 'Available', 'Ready now', 'tone-stable', { type: 'empty' });
    this.removeHkTask(id);
    this.toast(`${id} signed off as ready — now available.`, 'success');
  }

  /* ---------------- Floor plan / housekeeping ---------------- */

  private openDetail(id: string): void {
    const r = this.findRow(id);
    if (!r) {
      this.toast(id);
      return;
    }
    const d = r.dataset;
    this.toast(`${d['id'] || id} — ${d['ward']} · ${d['type']} · ${d['state']}${d['patient'] ? ' · ' + d['patient'] : ''}.`);
  }

  private wireFloorPlan(): void {
    this.byId('floor-plan')?.addEventListener('click', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
      if (t) this.openDetail(t.dataset['open'] || '');
    });
  }

  private wireHousekeeping(): void {
    this.byId('hk-list')?.addEventListener('click', (e: Event) => {
      const ready = (e.target as HTMLElement).closest('[data-ready]') as HTMLElement | null;
      if (ready) {
        this.markReady(ready.dataset['ready'] || '');
        return;
      }
      const t = (e.target as HTMLElement).closest('[data-open]') as HTMLElement | null;
      if (t) this.openDetail(t.dataset['open'] || '');
    });
  }

  /* ---------------- Registry row actions ---------------- */

  private wireGridActions(): void {
    this.byId('grid-body')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const id = btn.dataset['id'] || '';
      const row = this.findRow(id);
      if (!row) return;
      const act = btn.dataset['act'];

      if (act === 'view') this.openDetail(id);
      else if (act === 'ready') this.markReady(id);
      else if (act === 'clean') this.toast(`Request Clean opened for ${id}.`);
      else if (act === 'reserve') this.toast(`Reserve Bed opened for ${id}.`);
      else if (act === 'block') this.toast(`Block Bed opened for ${id}.`);
      else if (act === 'release') {
        this.applyState(id, 'Available', 'Ready now', 'tone-stable', { type: 'empty' });
        this.toast(`${id} hold released — back in the available pool.`, 'success');
      } else if (act === 'unblock') {
        this.applyState(id, 'Cleaning', '~45m left', 'tone-medium', {
          type: 'empty',
          cleaning: { type: 'Standard', assignee: this.HOUSEKEEPERS[0], pct: 0, target: 45 },
        });
        this.toast(`${id} unblocked — sent for a standard clean before reuse.`, 'success');
      }
    });
  }

  /* ---------------- Hero actions ---------------- */

  private wireHero(): void {
    this.byId('btn-housekeeping')?.addEventListener('click', () => this.toast('Request Clean opened.'));
    this.byId('btn-block')?.addEventListener('click', () => this.toast('Block Bed opened.'));
  }
}
