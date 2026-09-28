import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface SavedReport {
  id: number;
  name: string;
  type: string;
  date: string;
  ic: string;
  c: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "operation-reports".
 */
@Component({
  imports: [],
  selector: 'app-operation-reports',
  styleUrl: './operation-reports.css',
  templateUrl: './operation-reports.html',
})
export class OperationReports implements AfterViewInit {
  private readonly PERF: Record<string, [string, number, number, string][]> = {
    Department: [['Cardiac Surgery', 312, 96, '#dc2626'], ['Orthopedics', 286, 97, '#e06c1f'], ['General Surgery', 264, 95, '#0f766e'], ['Neurosurgery', 198, 94, '#7c3aed'], ['Pediatric', 124, 98, '#1d4ed8'], ['Urology', 100, 96, '#0e7490']],
    Procedure: [['Knee Replacement', 188, 98, '#e06c1f'], ['CABG', 164, 95, '#dc2626'], ['Appendectomy', 142, 99, '#0f766e'], ['Cholecystectomy', 126, 97, '#1d4ed8'], ['Craniotomy', 98, 93, '#7c3aed'], ['C-Section', 156, 99, '#be185d']],
    'OT Room': [['OT-01', 248, 96, '#0f766e'], ['Cardiac OT', 224, 95, '#dc2626'], ['OT-02', 212, 97, '#1d4ed8'], ['Neuro OT', 186, 94, '#7c3aed'], ['OT-03', 204, 96, '#e06c1f'], ['OT-04', 210, 97, '#0e7490']],
    Priority: [['Routine', 742, 98, '#0f766e'], ['Medium', 268, 96, '#1d4ed8'], ['High', 186, 93, '#e06c1f'], ['Emergency', 168, 90, '#dc2626']],
  };
  private perfKey = 'Department';

  private REPORTS: SavedReport[] = [
    { id: 1, name: 'Monthly OT Utilization', type: 'Utilization', date: 'Jul 2026', ic: 'icon-layout-grid', c: '#1d4ed8' },
    { id: 2, name: 'Cardiac Dept Performance', type: 'Department', date: 'Q2 2026', ic: 'icon-heart-pulse', c: '#dc2626' },
    { id: 3, name: 'Surgeon Scorecard', type: 'Surgeon', date: 'Jul 2026', ic: 'icon-award', c: '#0f766e' },
    { id: 4, name: 'Emergency Surgery Trends', type: 'Trends', date: 'H1 2026', ic: 'icon-siren', c: '#e06c1f' },
    { id: 5, name: 'OT Turnover Time', type: 'Efficiency', date: 'Jul 2026', ic: 'icon-timer', c: '#7c3aed' },
    { id: 6, name: 'Post-Op Complication Rate', type: 'Outcomes', date: 'Q2 2026', ic: 'icon-shield-alert', c: '#b45309' },
  ];

  private readonly ACTIONS: [string, string, string][] = [
    ['View Report', 'icon-eye', 'view'], ['Generate', 'icon-file-chart-column', 'generate'], ['Save', 'icon-bookmark', 'save'],
    ['Export', 'icon-download', 'export'], ['Print', 'icon-printer', 'print'], ['Share', 'icon-share-2', 'share'],
    ['Schedule', 'icon-calendar-clock', 'schedule'], ['sep', '', ''], ['Archive', 'icon-archive', 'archive'], ['Delete', 'icon-trash-2', 'delete'],
  ];

  private readonly SIMPLE: Record<string, string> = { view: 'Opening report...', print: 'Printing report...', share: 'Share link copied', archive: 'Report archived', schedule: 'Report scheduled' };

  private MODALS: Record<string, { t: string; sub: string; ic: string; body: string; cta: string }> = {};
  private clockTimer: any;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.buildModals();
    this.wireEvents();
    setTimeout(() => {
      this.byId('or-skeleton')?.classList.add('hidden');
      this.byId('or-content')?.classList.remove('hidden');
      this.animateRings();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(sel: string, r?: ParentNode): T[] {
    return Array.prototype.slice.call((r || this.document).querySelectorAll(sel));
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private toast(msg: string, _icon?: string): void {
    this.toastService.show(msg, 'success');
  }

  private clock(): void {
    const el = this.byId('or-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  private animateRings(): void {
    this.qsa<HTMLElement>('.or-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }

  /* ---------------- performance tabs ---------------- */

  private renderPerf(): void {
    const rows = this.PERF[this.perfKey];
    const mx = Math.max(...rows.map((r) => r[1]));
    const host = this.byId('or-perfbars');
    if (host) {
      host.innerHTML = rows
        .map((r) => `<div><div class="flex justify-between text-xs mb-1"><span class="font-medium or-head">${r[0]}</span><span class="or-mut">${r[1]} · <span style="color:#15803d">${r[2]}%</span></span></div><div class="or-bar"><span style="width:${Math.round((+r[1] / mx) * 100)}%;background:${r[3]}"></span></div></div>`)
        .join('');
    }
  }

  /* ---------------- saved reports ---------------- */

  private renderReports(): void {
    const host = this.byId('or-reports');
    if (!host) return;
    host.innerHTML = this.REPORTS.map(
      (r) => `<div class="or-report" data-report="${r.id}">
                <div class="flex items-start justify-between mb-1.5"><span class="or-iconbadge w-9 h-9" style="color:${r.c}"><i class="${r.ic}"></i></span><button data-report-menu="${r.id}" onclick="event.stopPropagation()" class="w-7 h-7 rounded-md hover:bg-[var(--or-hover)] flex items-center justify-center or-mut"><i class="icon-more-vertical text-sm"></i></button></div>
                <p class="text-sm font-bold or-head">${r.name}</p>
                <p class="text-[11px] or-mut">${r.type} · ${r.date}</p>
                <div class="flex gap-1.5 mt-2"><button data-modal="export" onclick="event.stopPropagation()" class="or-npill hover:bg-[var(--or-hover)]"><i class="icon-download text-[11px]"></i> Export</button><button data-report-menu="${r.id}" onclick="event.stopPropagation()" class="or-npill hover:bg-[var(--or-hover)]"><i class="icon-eye text-[11px]"></i> View</button></div>
            </div>`
    ).join('');
  }

  /* ---------------- menu ---------------- */

  private menuHost(): HTMLElement {
    let m = this.byId('or-menuhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'or-menuhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="or-menu" id="or-openmenu">${this.ACTIONS.map((a) => (a[0] === 'sep' ? '<div class="or-menu-sep"></div>' : `<button data-action="${a[2]}" data-rid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="${a[1]}"></i> ${a[0]}</button>`)).join('')}</div>`;
    const m = this.byId('or-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }

  private closeMenu(): void {
    const host = this.byId('or-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ---------------- modals ---------------- */

  private buildModals(): void {
    const fld = (l: string, el: string) => `<div><label class="or-formlabel">${l}</label>${el}</div>`;
    const inp = (ph?: string) => `<input class="or-in mt-1" placeholder="${ph || ''}">`;
    const selE = (o: string[]) => `<select class="or-in mt-1">${o.map((x) => `<option>${x}</option>`).join('')}</select>`;
    this.MODALS = {
      generate: { t: 'Generate Report', sub: 'Build a surgical analytics report', ic: 'icon-file-chart-column', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Report Type', selE(['OT Utilization', 'Department Performance', 'Surgeon Scorecard', 'Surgical Trends', 'Outcome Analysis', 'Emergency Report']))}${fld('Period', selE(['This Week', 'This Month', 'This Quarter', 'This Year', 'Custom']))}${fld('Department', selE(['All', 'Cardiac', 'Neuro', 'Orthopedic', 'General']))}${fld('Format', selE(['PDF', 'Excel', 'CSV', 'Dashboard']))}</div><div class="mt-3">${fld('Include Sections', selE(['All sections', 'Summary only', 'Charts only', 'Tables only']))}</div>`, cta: 'Generate Report' },
      save: { t: 'Save Report', sub: 'Save the current configuration', ic: 'icon-bookmark', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Report Name', inp('e.g. Monthly OT Summary'))}${fld('Category', selE(['Utilization', 'Department', 'Surgeon', 'Trends']))}${fld('Visibility', selE(['Private', 'Team', 'Hospital-wide']))}${fld('Tags', inp('cardiac, monthly'))}</div>`, cta: 'Save Report' },
      schedule: { t: 'Schedule Report', sub: 'Automate recurring delivery', ic: 'icon-calendar-clock', body: `<div class="grid sm:grid-cols-2 gap-3">${fld('Report', selE(this.REPORTS.map((r) => r.name)))}${fld('Frequency', selE(['Daily', 'Weekly', 'Monthly', 'Quarterly']))}${fld('Delivery', selE(['Email', 'Dashboard', 'Both']))}${fld('Recipients', inp('admin@dreamscare.health'))}</div>`, cta: 'Schedule Report' },
      export: { t: 'Export', sub: 'Export report data', ic: 'icon-download', body: `<p class="text-xs or-mut mb-2">Choose a format</p><div class="grid grid-cols-2 gap-2">${['PDF', 'Excel', 'CSV', 'Print', 'Department Report', 'Surgeon Report', 'OT Utilization Report', 'Full Analytics'].map((f) => `<button data-expfmt="${f}" class="or-btn or-btn-ghost justify-center">${f}</button>`).join('')}</div>`, cta: 'Export' },
    };
  }

  private modalHost(): HTMLElement {
    let m = this.byId('or-modalhost');
    if (!m) {
      m = this.document.createElement('div');
      m.id = 'or-modalhost';
      this.document.body.appendChild(m);
    }
    return m;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    const host = this.modalHost();
    host.innerHTML = `<div class="or-modal-wrap open"><div class="or-modal-bg" data-close></div><div class="or-modal">
            <div class="or-modal-head"><span class="or-modal-badge"><i class="${m.ic}"></i></span><div class="min-w-0"><h3 class="font-bold or-head leading-tight">${m.t}</h3><p class="text-[11px] or-mut">${m.sub || ''}</p></div><button data-close class="ml-auto w-8 h-8 rounded-lg hover:bg-[var(--or-hover)] flex items-center justify-center or-mut"><i class="icon-x"></i></button></div>
            <div class="or-modal-body">${m.body}</div>
            <div class="or-modal-foot"><button data-close class="or-btn or-btn-ghost">Cancel</button><button data-modalok="${key}" class="or-btn or-btn-primary"><i class="${m.ic}"></i> ${m.cta}</button></div>
        </div></div>`;
    this.document.body.style.overflow = 'hidden';
  }

  private openDelete(msg: string, onOk: () => void): void {
    const host = this.modalHost();
    host.innerHTML = `<div class="or-modal-wrap open"><div class="or-modal-bg" data-close></div><div class="or-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style="background:color-mix(in srgb,#dc2626 13%,transparent);color:#dc2626"><i class="icon-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg or-head">Confirm</h3><p class="text-xs or-mut mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="or-btn or-btn-ghost flex-1 justify-center">Cancel</button><button id="or-delok" class="or-btn or-btn-danger flex-1 justify-center">Delete</button></div></div></div></div>`;
    this.document.body.style.overflow = 'hidden';
    const btn = this.byId('or-delok');
    if (btn) btn.onclick = () => { onOk(); this.closeModal(); };
  }

  private closeModal(): void {
    const host = this.byId('or-modalhost');
    if (host) host.innerHTML = '';
    this.document.body.style.overflow = '';
  }

  /* ---------------- events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      const pd = target.closest('[data-pd]') as HTMLElement | null;
      if (pd) {
        this.qsa('#or-periodtabs button').forEach((x) => x.classList.toggle('on', x === pd));
        const lbl = ({ week: 'This Week', month: 'This Month · Jul 2026', quarter: 'This Quarter · Q3', year: 'This Year · 2026' } as Record<string, string>)[pd.dataset['pd']!];
        const periodEl = this.byId('or-period');
        if (periodEl) periodEl.textContent = lbl;
        this.toast('Period: ' + lbl, 'icon-calendar-range');
        return;
      }

      const pf = target.closest('[data-pf]') as HTMLElement | null;
      if (pf) {
        this.perfKey = pf.dataset['pf']!;
        this.qsa('#or-perftabs button').forEach((x) => x.classList.toggle('on', x === pf));
        this.renderPerf();
        return;
      }

      const menuBtn = target.closest('[data-report-menu]') as HTMLElement | null;
      if (menuBtn) {
        const r = menuBtn.getBoundingClientRect();
        this.openMenu(+menuBtn.dataset['reportMenu']!, r.left - 180, r.bottom + 4);
        return;
      }

      const reportCard = target.closest('[data-report]') as HTMLElement | null;
      if (reportCard) {
        this.openModal('generate');
        return;
      }

      const t = target.closest('[data-modal],[data-modalok],[data-close],[data-action],[data-expfmt]') as HTMLElement | null;
      if (!t) {
        if (!target.closest('.or-menu')) this.closeMenu();
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal']!);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        const k = t.dataset['modalok']!;
        if (k === 'save') {
          this.REPORTS.unshift({ id: Date.now(), name: 'Custom Report', type: 'Custom', date: 'Jul 2026', ic: 'icon-file-chart-column', c: '#0d9488' });
          this.renderReports();
        }
        this.toast(this.MODALS[k].cta + ' — done', 'icon-check');
        this.closeModal();
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast('Exported: ' + t.dataset['expfmt'], 'icon-download');
        this.closeModal();
        return;
      }
      if (t.dataset['close'] !== undefined) {
        this.closeModal();
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action']!;
        const id = +t.dataset['rid']!;
        this.closeMenu();
        if (a === 'delete') {
          this.openDelete('Delete this saved report?', () => {
            this.REPORTS = this.REPORTS.filter((r) => r.id !== id);
            this.renderReports();
            this.toast('Report deleted', 'icon-trash-2');
          });
        } else if (this.MODALS[a]) {
          this.openModal(a);
        } else if (this.SIMPLE[a]) {
          this.toast(this.SIMPLE[a]);
        }
        return;
      }
    });

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.dataset['rb'] !== undefined) {
        const n = this.rnd(180, 1284);
        const countEl = this.byId('or-rb-count');
        if (countEl) countEl.textContent = n.toLocaleString('en-IN');
        const barEl = this.byId('or-rb-bar');
        if (barEl) barEl.style.width = Math.round((n / 1284) * 100) + '%';
      }
    });
  }
}
