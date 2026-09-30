import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';

interface EsiLevel {
  label: string;
  name: string;
  badge: string;
  bar: string;
  desc: string;
}
interface DoneRow {
  id: string;
  name: string;
  esi: number;
  vitals: string;
  nurse: string;
  time: string;
  disposition: string;
}


@Component({
  imports: [RouterLink],
  selector: 'app-triage',
  styleUrl: './triage.css',
  templateUrl: './triage.html',
})
export class Triage implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly ESI: Record<number, EsiLevel> = {
    1: { label: 'ESI 1', name: 'Resuscitation', badge: 'badge-red', bar: 'text-danger', desc: 'Requires immediate life-saving intervention. Unresponsive, intubated, apneic, or pulseless.' },
    2: { label: 'ESI 2', name: 'Emergent', badge: 'badge-red', bar: 'text-danger', desc: 'High-risk situation, severe pain or distress, or confused / lethargic / disoriented. Cannot wait.' },
    3: { label: 'ESI 3', name: 'Urgent', badge: 'badge-amber', bar: 'text-warning', desc: 'Stable, but two or more resources expected (labs, imaging, IV fluids, specialty consult).' },
    4: { label: 'ESI 4', name: 'Less Urgent', badge: 'badge-blue', bar: 'text-info', desc: 'Stable, one resource expected (a single X-ray, simple laceration repair, or prescription).' },
    5: { label: 'ESI 5', name: 'Non Urgent', badge: 'badge-green', bar: 'text-success', desc: 'Stable, no resources expected beyond a focused exam. Prescription refill, suture removal.' },
  };

  private readonly NURSES = ['Alicia Barnett, RN', 'Devon Marsh, RN', 'Camille Ortega, RN', 'Preston Vaughn, RN', 'Nadia Whitmore, RN'];

  private readonly DONE: DoneRow[] = [
    { id: 'ER-4821', name: 'Marcus Holloway', esi: 1, vitals: 'BP 88/54 · HR 122 · SpO2 91%', nurse: 'Alicia Barnett, RN', time: '09:38 AM', disposition: 'Resuscitation' },
    { id: 'ER-4823', name: 'Arthur Delgado', esi: 2, vitals: 'BP 178/96 · HR 88 · SpO2 96%', nurse: 'Devon Marsh, RN', time: '09:34 AM', disposition: 'Resuscitation' },
    { id: 'ER-4822', name: 'Denise Okafor', esi: 2, vitals: 'BP 132/86 · HR 108 · SpO2 89%', nurse: 'Alicia Barnett, RN', time: '09:31 AM', disposition: 'Acute Care' },
    { id: 'ER-4826', name: 'Rosalind Pierce', esi: 3, vitals: 'BP 104/62 · HR 58 · SpO2 97%', nurse: 'Camille Ortega, RN', time: '09:20 AM', disposition: 'Acute Care' },
    { id: 'ER-4825', name: 'Terrence Whitfield', esi: 3, vitals: 'BP 128/80 · HR 84 · SpO2 99%', nurse: 'Devon Marsh, RN', time: '09:12 AM', disposition: 'Fast Track' },
    { id: 'ER-4824', name: 'Kaitlyn Brewer', esi: 3, vitals: 'BP 118/74 · HR 96 · Temp 100.8°F', nurse: 'Camille Ortega, RN', time: '09:04 AM', disposition: 'Observation' },
    { id: 'ER-4827', name: 'Julian Alvarez', esi: 4, vitals: 'HR 104 · Temp 102.1°F · SpO2 98%', nurse: 'Preston Vaughn, RN', time: '08:57 AM', disposition: 'Fast Track' },
    { id: 'ER-4828', name: 'Bernadette Cho', esi: 4, vitals: 'BP 124/78 · HR 76', nurse: 'Preston Vaughn, RN', time: '08:52 AM', disposition: 'Fast Track' },
    { id: 'ER-4829', name: 'Grant Sutherland', esi: 5, vitals: 'BP 130/82 · HR 72', nurse: 'Nadia Whitmore, RN', time: '08:36 AM', disposition: 'Waiting Room' },
    { id: 'ER-4816', name: 'Harold Nakamura', esi: 3, vitals: 'BP 142/88 · HR 90 · SpO2 95%', nurse: 'Alicia Barnett, RN', time: '08:21 AM', disposition: 'Observation' },
    { id: 'ER-4814', name: 'Simone Ferraro', esi: 4, vitals: 'BP 120/76 · HR 80', nurse: 'Nadia Whitmore, RN', time: '08:05 AM', disposition: 'Fast Track' },
    { id: 'ER-4811', name: 'Cedric Lawson', esi: 5, vitals: 'BP 126/80 · HR 74', nurse: 'Camille Ortega, RN', time: '07:33 AM', disposition: 'Waiting Room' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderDone();
    this.wireEvents();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private esc(v: unknown): string {
    return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }

  /* --- completed triage filter --- */

  private renderDone(): void {
    const filterEl = this.byId('filter-esi') as HTMLSelectElement | null;
    const level = filterEl?.value || '';
    const rows = this.DONE.filter((d) => !level || String(d.esi) === level);

    const countEl = this.byId('done-count');
    if (countEl) countEl.textContent = String(rows.length);

    const visible = new Set(rows.map((d) => d.id));
    const tbody = this.byId('done-body');
    let anyVisible = false;
    tbody?.querySelectorAll<HTMLElement>('[data-row-id]').forEach((tr) => {
      const isVisible = visible.has(tr.dataset['rowId'] || '');
      tr.classList.toggle('hidden', !isVisible);
      if (isVisible) anyVisible = true;
    });

    const empty = this.byId('done-empty-row');
    if (empty) empty.classList.toggle('hidden', anyVisible);
  }

  /* --- ESI decision support (assessment modal) --- */

  private suggestEsi(): void {
    const hr = parseFloat((this.byId('cc-as-hr') as HTMLInputElement)?.value || '');
    const spo2 = parseFloat((this.byId('cc-as-spo2') as HTMLInputElement)?.value || '');
    const rr = parseFloat((this.byId('cc-as-rr') as HTMLInputElement)?.value || '');
    const pain = parseFloat((this.byId('cc-as-pain') as HTMLInputElement)?.value || '');

    const reasons: string[] = [];
    let level: number | null = null;

    if (!isNaN(spo2) && spo2 < 90) { level = 1; reasons.push('SpO2 below 90%'); }
    else if (!isNaN(hr) && (hr > 130 || hr < 40)) { level = 1; reasons.push('heart rate outside 40–130'); }
    else if (!isNaN(rr) && (rr > 30 || rr < 8)) { level = 1; reasons.push('respiratory rate outside 8–30'); }
    else if (!isNaN(spo2) && spo2 < 94) { level = 2; reasons.push('SpO2 below 94%'); }
    else if (!isNaN(hr) && (hr > 110 || hr < 50)) { level = 2; reasons.push('heart rate outside 50–110'); }
    else if (!isNaN(pain) && pain >= 7) { level = 2; reasons.push('severe pain (' + pain + '/10)'); }
    else if (!isNaN(hr) || !isNaN(spo2) || !isNaN(rr)) { level = 3; reasons.push('vitals within normal limits'); }

    const box = this.byId('cc-as-suggest');
    const icon = this.byId('cc-as-suggest-icon');
    const text = this.byId('cc-as-suggest-text');
    if (!box || !icon || !text) return;

    box.classList.remove('border-danger', 'border-warning', 'border-border-color');
    icon.className = 'shrink-0';

    if (!level) {
      box.classList.add('border-border-color');
      icon.classList.add('icon-info', 'text-info');
      text.textContent = "Enter vitals for a suggested ESI level. The nurse's assessment always overrides the suggestion.";
      return;
    }

    if (level <= 1) {
      box.classList.add('border-danger');
      icon.classList.add('icon-siren', 'text-danger');
    } else if (level === 2) {
      box.classList.add('border-warning');
      icon.classList.add('icon-triangle-alert', 'text-warning');
    } else {
      box.classList.add('border-border-color');
      icon.classList.add('icon-info', 'text-info');
    }

    const e = this.ESI[level];
    text.textContent = 'Suggested ' + e.label + ' — ' + e.name + ' (' + reasons.join(', ') + '). Confirm or override below.';

    const esiEl = this.byId('cc-as-esi') as HTMLSelectElement | null;
    if (esiEl && !esiEl.dataset['touched']) esiEl.value = String(level);
  }

  /* --- modals (built dynamically — no matching markup ships in this page's HTML) --- */

  private modalHost(): HTMLElement {
    let host = this.byId('cc-modalhost');
    if (!host) {
      host = this.document.createElement('div');
      host.id = 'cc-modalhost';
      this.document.body.appendChild(host);
    }
    return host;
  }

  private closeModal(): void {
    const host = this.byId('cc-modalhost');
    if (host) host.innerHTML = '';
    this.document.body.style.overflow = '';
  }

  private openAssess(): void {
    const host = this.modalHost();
    const nurseOpts = this.NURSES.map((n) => '<option>' + this.esc(n) + '</option>').join('');
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">New Assessment</h3><p class="text-[11px] text-gray-400">Unregistered arrival · triage first, register after</p>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3 space-y-2">' +
      '<textarea id="cc-as-complaint" class="form-control" rows="2" placeholder="Chief complaint"></textarea>' +
      '<div class="grid grid-cols-2 gap-2">' +
      '<input id="cc-as-hr" type="number" class="form-control" placeholder="Heart rate (bpm)">' +
      '<input id="cc-as-spo2" type="number" class="form-control" placeholder="SpO2 (%)">' +
      '<input id="cc-as-rr" type="number" class="form-control" placeholder="Resp. rate">' +
      '<input id="cc-as-pain" type="number" class="form-control" placeholder="Pain (0-10)">' +
      '</div>' +
      '<div id="cc-as-suggest" class="rounded-lg border p-2.5 text-xs flex items-start gap-2">' +
      '<i id="cc-as-suggest-icon" class="shrink-0"></i><span id="cc-as-suggest-text"></span></div>' +
      '<select id="cc-as-esi" class="form-select"><option value="">Select ESI level</option>' +
      Object.keys(this.ESI).map((k) => '<option value="' + k + '">' + this.ESI[+k].label + ' — ' + this.ESI[+k].name + '</option>').join('') +
      '</select>' +
      '<select id="cc-as-nurse" class="form-select">' + nurseOpts + '</select>' +
      '<select id="cc-as-disposition" class="form-select"><option>Resuscitation</option><option>Acute Care</option><option>Fast Track</option><option>Observation</option><option>Waiting Room</option></select>' +
      '</div>' +
      '<div class="cc-modal-foot p-3 flex justify-end gap-2"><button type="button" data-cc-close class="btn btn-outline-secondary">Cancel</button><button type="button" id="cc-as-save" class="btn btn-primary">Complete Triage</button></div>' +
      '</div></div>';

    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
    ['cc-as-hr', 'cc-as-spo2', 'cc-as-rr', 'cc-as-pain'].forEach((id) => this.byId(id)?.addEventListener('input', () => this.suggestEsi()));
    const esiEl = this.byId('cc-as-esi') as HTMLSelectElement | null;
    if (esiEl) esiEl.addEventListener('change', () => { esiEl.dataset['touched'] = '1'; });

    this.byId('cc-as-save')?.addEventListener('click', () => {
      const level = (this.byId('cc-as-esi') as HTMLSelectElement).value;
      if (!level) {
        this.toastService.show('Select an ESI level before completing triage.', 'error');
        return;
      }
      const complaint = (this.byId('cc-as-complaint') as HTMLTextAreaElement).value.trim();
      if (!complaint) {
        this.toastService.show('A chief complaint is required.', 'error');
        return;
      }
      const disposition = (this.byId('cc-as-disposition') as HTMLSelectElement).value;
      this.closeModal();
      this.toastService.show('Walk-in patient triaged as ' + this.ESI[+level].label + ' → ' + disposition + '.', 'success');
    });

    this.suggestEsi();
  }

  private openGuide(): void {
    const host = this.modalHost();
    const items = Object.keys(this.ESI)
      .map((level) => {
        const e = this.ESI[+level];
        return (
          '<li class="rounded-lg border border-border-color p-3 flex gap-3">' +
          '<span class="badge ' + e.badge + ' shrink-0 h-fit">' + e.label + '</span>' +
          '<div>' +
          '<p class="font-semibold text-sm text-gray-900">' + this.esc(e.name) + '</p>' +
          '<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">' + this.esc(e.desc) + '</p>' +
          '</div></li>'
        );
      })
      .join('');
    host.innerHTML =
      '<div class="cc-modal-wrap open"><div class="cc-modal-bg" data-cc-close></div><div class="cc-modal">' +
      '<div class="cc-modal-head"><h3 class="font-bold text-gray-900">ESI Guide</h3>' +
      '<button type="button" data-cc-close class="ml-auto w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><i class="icon-x"></i></button></div>' +
      '<div class="cc-modal-body p-3"><ul class="space-y-2">' + items + '</ul></div>' +
      '<div class="cc-modal-foot p-3 flex justify-end"><button type="button" data-cc-close class="btn btn-primary">Done</button></div>' +
      '</div></div>';
    this.document.body.style.overflow = 'hidden';
    host.querySelectorAll('[data-cc-close]').forEach((el) => el.addEventListener('click', () => this.closeModal()));
  }

  /* --- events --- */

  private wireEvents(): void {
    this.byId('filter-esi')?.addEventListener('change', () => this.renderDone());
    this.byId('btn-new')?.addEventListener('click', () => this.openAssess());
    this.byId('btn-esi-guide')?.addEventListener('click', () => this.openGuide());
    this.byId('btn-export')?.addEventListener('click', () => {
      this.toastService.show('Triage log exported — ' + this.DONE.length + ' assessments.', 'success');
    });

    this.document.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape') this.closeModal();
    });
  }
}
