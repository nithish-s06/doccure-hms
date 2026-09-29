import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Script {
  id: string;
  patient: string;
  drug: string;
  prescriber: string;
  type: string;
  status: string;
  wait: number;
  ctrl: boolean;
  holdReason?: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "prescriptions" (prescriptions.html).
 * Dispensing queue: search/filter, advance/hold/release row actions, print.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-prescriptions',
  styleUrl: './prescriptions.css',
  templateUrl: './prescriptions.html',
})
export class Prescriptions implements AfterViewInit {
  private readonly STATUS: Record<string, string> = {
    Pending: 'badge-amber',
    Verified: 'badge-blue',
    Dispensed: 'badge-green',
    'On Hold': 'badge-red',
  };
  private readonly NEXT: Record<string, string> = { Pending: 'Verified', Verified: 'Dispensed' };
  private readonly AVATAR_COUNT = 30;

  private seq = 30440;

  private SCRIPTS: Script[] = [
    { patient: 'Harold Nakamura', drug: 'Amoxicillin 500 mg — 1 cap TDS, 7 days', prescriber: 'Dr. Sarah Chen', type: 'Inpatient', status: 'Pending', wait: 12, ctrl: false, id: '' },
    { patient: 'Rosalind Pierce', drug: 'Warfarin 5 mg — per INR schedule', prescriber: 'Dr. Elena Vasquez', type: 'Inpatient', status: 'Pending', wait: 24, ctrl: false, id: '' },
    { patient: 'Deshawn Pritchard', drug: 'Oxycodone 10 mg — 1 tab BD PRN', prescriber: 'Dr. Marissa Bloom', type: 'Discharge', status: 'On Hold', wait: 47, ctrl: true, holdReason: 'Controlled — awaiting second signature', id: '' },
    { patient: 'Camila Restrepo', drug: 'Ketorolac 10 mg — 1 tab QDS, 5 days', prescriber: 'Dr. Marissa Bloom', type: 'Discharge', status: 'Verified', wait: 18, ctrl: false, id: '' },
    { patient: 'Julian Alvarez', drug: 'Salbutamol inhaler — 2 puffs PRN', prescriber: 'Dr. Amara Osei', type: 'Outpatient', status: 'Verified', wait: 9, ctrl: false, id: '' },
    { patient: 'Yolanda Prescott', drug: 'Meropenem 1 g IV — q8h', prescriber: 'Dr. Rafael Contreras', type: 'Inpatient', status: 'Dispensed', wait: 31, ctrl: false, id: '' },
    { patient: 'Grant Sutherland', drug: 'Naproxen 250 mg — 1 tab BD with food', prescriber: 'Dr. Elena Vasquez', type: 'Outpatient', status: 'Dispensed', wait: 22, ctrl: false, id: '' },
    { patient: 'Bernadette Cho', drug: 'Ondansetron 4 mg — 1 tab TDS PRN', prescriber: 'Dr. Sarah Chen', type: 'Outpatient', status: 'Pending', wait: 6, ctrl: false, id: '' },
    { patient: 'Emmett Sandoval', drug: 'Enoxaparin 40 mg SC — OD', prescriber: 'Dr. Yusuf Karim', type: 'Inpatient', status: 'Verified', wait: 15, ctrl: false, id: '' },
  ].map((s) => this.mk(s));

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderGrid();

    this.byId('search')?.addEventListener('input', () => this.renderGrid());
    this.byId('filter-status')?.addEventListener('change', () => this.renderGrid());
    this.byId('filter-type')?.addEventListener('change', () => this.renderGrid());

    this.byId('grid-body')?.addEventListener('click', (e: Event) => {
      const btn = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
      if (!btn) return;
      const s = this.SCRIPTS.find((x) => x.id === btn.dataset['id']);
      if (!s) return;
      const act = btn.dataset['act'];

      if (act === 'advance') {
        if (s.ctrl && this.NEXT[s.status] === 'Dispensed') {
          const ok = this.document.defaultView?.confirm(s.id + ' — controlled dispense (witness confirmed)') ?? true;
          if (!ok) return;
          s.status = 'Dispensed';
          this.patchRow(s);
          this.reorderRows();
          this.renderAll();
          this.toast(s.id + ' dispensed with witness signature.', 'success');
          return;
        }
        s.status = this.NEXT[s.status];
        this.patchRow(s);
        this.reorderRows();
        this.renderAll();
        this.toast(s.id + ' → ' + s.status + '.', 'success');
      } else if (act === 'hold') {
        s.status = 'On Hold';
        s.holdReason = 'Pharmacist query raised';
        this.patchRow(s);
        this.reorderRows();
        this.renderAll();
        this.toast(s.id + ' placed on hold.', 'info');
      } else if (act === 'release') {
        s.status = 'Pending';
        delete s.holdReason;
        this.patchRow(s);
        this.reorderRows();
        this.renderAll();
        this.toast(s.id + ' released back to the queue.', 'success');
      } else if (act === 'print') {
        this.toast('Label printed for ' + s.id + '.', 'info');
      }
    });

    this.byId('btn-add')?.addEventListener('click', () => {
      (this.byId('rx-form') as HTMLFormElement | null)?.reset();
    });
    this.byId('btn-print')?.addEventListener('click', () => {
      this.toast('Dispensing queue sent to the printer.', 'info');
      this.document.defaultView?.print();
    });

    this.byId('rx-save')?.addEventListener('click', () => {
      const patient = this.getValue('rx-patient').trim();
      const drug = this.getValue('rx-drug').trim();
      if (!patient) return this.toast('Enter the patient name.', 'error');
      if (!drug) return this.toast('Enter the medication and directions.', 'error');
      const s = this.mk({
        patient,
        drug,
        prescriber: this.getValue('rx-prescriber').trim() || '—',
        type: this.getValue('rx-type'),
        status: 'Pending',
        wait: 0,
        ctrl: !!this.getValue('rx-controlled'),
        id: '',
      });
      this.SCRIPTS.unshift(s);
      const emptyRow = this.byId('grid-empty-row');
      if (emptyRow) emptyRow.insertAdjacentHTML('beforebegin', this.rowHTML(s));
      else this.byId('grid-body')?.insertAdjacentHTML('beforeend', this.rowHTML(s));
      this.reorderRows();
      const w = this.document.defaultView as any;
      if (w?.HSOverlay) w.HSOverlay.close('#rx-modal');
      this.renderAll();
      this.toast('Prescription added for ' + patient + '.', 'success');
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

  private avatarSrc(name: string): string {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return 'assets/img/avatar/avatar-' + String((h % this.AVATAR_COUNT) + 1).padStart(2, '0') + '.jpg';
  }

  private mk(o: Omit<Script, 'id'> & { id: string }): Script {
    this.seq++;
    return { ...o, id: 'RX-' + this.seq };
  }

  private detailUrl(s: Script): string {
    return 'prescription-detail.html?' + new URLSearchParams({ id: s.id, patient: s.patient, drug: s.drug, status: s.status }).toString();
  }

  private renderHero(): void {
    const pending = this.SCRIPTS.filter((s) => s.status === 'Pending').length;
    const held = this.SCRIPTS.filter((s) => s.status === 'On Hold').length;
    const flag =
      held >= 2
        ? { cls: 'tone-critical', text: held + ' Scripts Held' }
        : pending >= 5
          ? { cls: 'tone-medium', text: 'Queue Building' }
          : { cls: 'tone-stable', text: 'Queue Moving' };
    const flagEl = this.byId('ph-flag');
    if (flagEl) flagEl.className = 'hms-chip ' + flag.cls;
    const flagText = this.byId('ph-flag-text');
    if (flagText) flagText.textContent = flag.text;
    const summary = this.byId('hero-summary');
    if (summary) summary.textContent = this.SCRIPTS.length + ' scripts today · ' + pending + ' pending';
  }

  private renderKpis(): void {
    const by = (st: string) => this.SCRIPTS.filter((s) => s.status === st).length;
    const ctrl = this.SCRIPTS.filter((s) => s.ctrl).length;
    const avgWait = Math.round(this.SCRIPTS.reduce((s, x) => s + x.wait, 0) / this.SCRIPTS.length);

    const cards = [
      { id: 'kpi-total', icon: 'icon-file-text', label: 'Scripts Today', value: this.SCRIPTS.length, tone: 'ph-primary', meta: 'all sources' },
      { id: 'kpi-pending', icon: 'icon-clock', label: 'Pending', value: by('Pending'), tone: 'ph-amber', meta: 'awaiting review' },
      { id: 'kpi-verified', icon: 'icon-circle-check', label: 'Verified', value: by('Verified'), tone: 'ph-sky', meta: 'ready to dispense' },
      { id: 'kpi-dispensed', icon: 'icon-package-check', label: 'Dispensed', value: by('Dispensed'), tone: 'ph-primary', meta: 'completed' },
      { id: 'kpi-hold', icon: 'icon-pause', label: 'On Hold', value: by('On Hold'), tone: 'ph-danger', meta: 'query raised' },
      { id: 'kpi-wait', icon: 'icon-timer', label: 'Avg Wait', value: avgWait + 'm', tone: 'ph-slate', meta: ctrl + ' controlled in queue' },
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

  private rowHTML(s: Script): string {
    const acts: { label: string; icon: string; act: string; danger?: boolean }[] = [];
    if (this.NEXT[s.status]) acts.push({ label: 'Mark ' + this.NEXT[s.status], icon: 'icon-check', act: 'advance' });
    if (s.status !== 'On Hold' && s.status !== 'Dispensed') acts.push({ label: 'Put On Hold', icon: 'icon-pause', act: 'hold', danger: true });
    if (s.status === 'On Hold') acts.push({ label: 'Release Hold', icon: 'icon-play', act: 'release' });
    acts.push({ label: 'Print Label', icon: 'icon-printer', act: 'print' });

    const actionsHtml =
      '<div class="hs-dropdown relative inline-flex [--placement:bottom-right]"><button type="button" aria-label="Row actions" class="hs-dropdown-toggle p-2 rounded-lg text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"><i class="icon-ellipsis-vertical text-sm"></i></button><div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">' +
      acts
        .map(
          (a) =>
            '<button type="button" role="menuitem" data-act="' + a.act + '" data-id="' + this.esc(s.id) + '" class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm ' +
            (a.danger ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700') +
            '"><i class="' + a.icon + ' text-sm"></i>' + a.label + '</button>',
        )
        .join('') +
      '</div></div>';

    return (
      '<tr class="hms-row" data-row-id="' + this.esc(s.id) + '">' +
      '<td class="hms-cell"><div class="flex items-center gap-3">' +
      '<span class="hms-member-avatar ph-primary size-9! overflow-hidden!"><img src="' + this.avatarSrc(s.patient) + '" alt="" class="size-full object-cover" loading="lazy"></span>' +
      '<div class="min-w-0"><p class="text-xs font-bold text-gray-900 truncate"><a href="' + this.detailUrl(s) + '" class="hover:underline">' + this.esc(s.patient) + '</a></p>' +
      '<p class="text-[10px] text-gray-400 font-mono">' + this.esc(s.id) + '</p></div></div></td>' +
      '<td class="hms-cell"><div class="flex items-center gap-2 max-w-64">' +
      (s.ctrl ? '<span class="ph-sched sched-2 shrink-0" title="Controlled substance"><i class="icon-shield text-[9px]" aria-hidden="true"></i>C</span>' : '') +
      '<p class="text-xs text-gray-600 dark:text-gray-300 truncate" title="' + this.esc(s.drug) + '">' + this.esc(s.drug) + '</p></div>' +
      (s.holdReason ? '<p class="mt-0.5 text-[10px] font-bold text-danger">' + this.esc(s.holdReason) + '</p>' : '') + '</td>' +
      '<td class="hms-cell"><span class="text-xs text-gray-600 dark:text-gray-300">' + this.esc(s.prescriber) + '</span></td>' +
      '<td class="hms-cell"><span class="hms-chip tone-info">' + s.type + '</span></td>' +
      '<td class="hms-cell"><span class="text-xs font-bold tabular-nums ' + (s.wait >= 30 ? 'text-danger' : 'text-gray-900') + '">' + s.wait + 'm</span></td>' +
      '<td class="hms-cell"><span class="badge ' + this.STATUS[s.status] + '">' + s.status + '</span></td>' +
      '<td class="hms-cell text-right">' + actionsHtml + '</td></tr>'
    );
  }

  private sortedScripts(): Script[] {
    return this.SCRIPTS.slice().sort(
      (a, b) => (a.status === 'On Hold' ? -1 : 0) - (b.status === 'On Hold' ? -1 : 0) || b.wait - a.wait,
    );
  }

  private renderGrid(): void {
    const q = this.getValue('search').trim().toLowerCase();
    const st = this.getValue('filter-status');
    const type = this.getValue('filter-type');

    const rows = this.SCRIPTS.filter((s) => {
      const hit = !q || s.id.toLowerCase().includes(q) || s.patient.toLowerCase().includes(q) || s.drug.toLowerCase().includes(q);
      return hit && (!st || s.status === st) && (!type || s.type === type);
    });
    const visible = new Set(rows.map((s) => s.id));

    const count = this.byId('grid-count');
    if (count) count.textContent = rows.length + (rows.length === 1 ? ' script' : ' scripts');

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

  private reorderRows(): void {
    const tbody = this.byId('grid-body');
    if (!tbody) return;
    this.sortedScripts().forEach((s) => {
      const el = tbody.querySelector('[data-row-id="' + s.id + '"]');
      if (el) tbody.appendChild(el);
    });
    const emptyRow = this.byId('grid-empty-row');
    if (emptyRow) tbody.appendChild(emptyRow);
  }

  private patchRow(s: Script): void {
    const rowEl = this.byId('grid-body')?.querySelector('[data-row-id="' + s.id + '"]');
    if (rowEl) rowEl.outerHTML = this.rowHTML(s);
  }

  private renderAll(): void {
    this.renderHero();
    this.renderKpis();
    this.renderGrid();
  }
}
