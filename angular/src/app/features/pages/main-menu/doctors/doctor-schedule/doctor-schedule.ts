import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface ShiftType {
  k: string;
  n: string;
  t: string;
  c: string;
  s: number;
  e: number;
}

interface DoctorSched {
  id: number;
  name: string;
  dept: string;
  c: string;
  pat: string[];
  oncall: number;
  load: number;
}

interface LeaveEntry {
  name: string;
  dept: string;
  c: string;
  type: string;
  range: string;
  status: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "doctor-schedule".
 * KPI tiles, shift legend, department filter options, the week grid, day
 * timeline axis, on-call list and leave list ship as static markup matching
 * this seed data for the default (This Week / week view) state; this wires
 * search/filter/view/week navigation, the assign-shift and request-leave
 * modals, and the reveal.
 */
@Component({
  imports: [],
  selector: 'app-doctor-schedule',
  styleUrl: './doctor-schedule.css',
  templateUrl: './doctor-schedule.html',
})
export class DoctorSchedule implements AfterViewInit {
  private readonly SHIFTS: Record<string, ShiftType> = {
    M: { k: 'M', n: 'Morning', t: '09:00–17:00', c: '#0ea5e9', s: 9, e: 17 },
    E: { k: 'E', n: 'Evening', t: '14:00–22:00', c: '#8b5cf6', s: 14, e: 22 },
    N: { k: 'N', n: 'Night', t: '22:00–06:00', c: '#1e293b', s: 22, e: 30 },
    C: { k: 'C', n: 'On-Call', t: '24h standby', c: '#f59e0b', s: 8, e: 20 },
    O: { k: 'O', n: 'Off', t: 'Day off', c: '#94a3b8', s: 0, e: 0 },
  };
  private readonly DAYNAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly TODAY_IDX = 3;

  private DOCS: DoctorSched[] = [
    { id: 1, name: 'Dr. Sarah Roberts', dept: 'Cardiology', c: '#ef4444', pat: ['M', 'M', 'E', 'M', 'M', 'O', 'O'], oncall: 0, load: 88 },
    { id: 2, name: 'Dr. Vikram Nair', dept: 'Neurology', c: '#8b5cf6', pat: ['E', 'E', 'M', 'E', 'E', 'C', 'O'], oncall: 1, load: 82 },
    { id: 3, name: 'Dr. Anita Desai', dept: 'Orthopedics', c: '#0ea5e9', pat: ['M', 'M', 'M', 'O', 'M', 'M', 'O'], oncall: 0, load: 76 },
    { id: 4, name: 'Dr. Meera Iyer', dept: 'Pediatrics', c: '#f59e0b', pat: ['M', 'E', 'M', 'M', 'O', 'O', 'C'], oncall: 1, load: 70 },
    { id: 5, name: 'Dr. Rajesh Menon', dept: 'Oncology', c: '#ec4899', pat: ['M', 'M', 'M', 'M', 'M', 'O', 'O'], oncall: 0, load: 91 },
    { id: 6, name: 'Dr. John Mathew', dept: 'Emergency', c: '#f43f5e', pat: ['N', 'N', 'O', 'N', 'N', 'N', 'O'], oncall: 1, load: 94 },
    { id: 7, name: 'Dr. Priya Sharma', dept: 'Gynecology', c: '#d946ef', pat: ['M', 'M', 'E', 'M', 'M', 'O', 'O'], oncall: 0, load: 79 },
    { id: 8, name: 'Dr. Deepak Nair', dept: 'Radiology', c: '#6366f1', pat: ['M', 'M', 'M', 'M', 'O', 'M', 'O'], oncall: 0, load: 64 },
    { id: 9, name: 'Dr. Sunita Rao', dept: 'ENT', c: '#14b8a6', pat: ['E', 'O', 'M', 'E', 'M', 'O', 'C'], oncall: 1, load: 58 },
    { id: 10, name: 'Dr. Karan Malhotra', dept: 'Dermatology', c: '#10b981', pat: ['M', 'M', 'O', 'M', 'M', 'M', 'O'], oncall: 0, load: 52 },
    { id: 11, name: 'Dr. Arjun Menon', dept: 'Nephrology', c: '#0891b2', pat: ['M', 'E', 'M', 'M', 'O', 'C', 'O'], oncall: 1, load: 85 },
    { id: 12, name: 'Dr. Fatima Sheikh', dept: 'Psychiatry', c: '#a855f7', pat: ['M', 'M', 'M', 'O', 'E', 'O', 'O'], oncall: 0, load: 48 },
  ];

  private LEAVES: LeaveEntry[] = [
    { name: 'Dr. Robert Chen', dept: 'Surgery', c: '#f43f5e', type: 'Annual Leave', range: 'Jul 18 – Jul 25', status: 'Pending' },
    { name: 'Dr. Laila Ahmed', dept: 'Pediatrics', c: '#f59e0b', type: 'Conference', range: 'Jul 20 – Jul 22', status: 'Approved' },
    { name: 'Dr. Sam Wesley', dept: 'Radiology', c: '#6366f1', type: 'Sick Leave', range: 'Jul 19', status: 'Approved' },
    { name: 'Dr. Nina Roy', dept: 'ENT', c: '#14b8a6', type: 'Emergency', range: 'Jul 21 – Jul 23', status: 'Pending' },
  ];

  private state = { q: '', dept: '', view: 'week' as 'week' | 'day', week: 0 };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireEvents();
    setTimeout(() => {
      this.byId('ds-skeleton')?.classList.add('hidden');
      this.byId('ds-content')?.classList.remove('hidden');
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private qsa(sel: string, root?: ParentNode): HTMLElement[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(sel));
  }
  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c]);
  }
  private mix(c: string, p = 15): string {
    return `color-mix(in srgb,${c} ${p}%,transparent)`;
  }
  private ini(n: string): string {
    return n.replace(/^Dr\.?\s*/i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  }
  private toast(msg: string): void {
    this.toastService.show(msg, 'success');
  }

  private docs(): DoctorSched[] {
    const q = this.state.q.toLowerCase();
    return this.DOCS.filter((d) => {
      if (this.state.dept && d.dept !== this.state.dept) return false;
      if (q && (d.name + ' ' + d.dept).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  private weekRange(): string {
    const base = 13 + this.state.week * 7;
    return `Jul ${base} – ${base + 6}, 2026`;
  }
  private updateRange(): void {
    const rangeEl = this.byId('ds-range');
    if (rangeEl) rangeEl.textContent = this.weekRange();
    const labelEl = this.byId('ds-weeklabel');
    if (labelEl) {
      labelEl.innerHTML =
        '<i class="ti ti-calendar"></i> ' + (this.state.week === 0 ? 'This Week' : this.state.week < 0 ? Math.abs(this.state.week) + 'w ago' : this.state.week + 'w ahead');
    }
  }

  private renderWeek(): void {
    const arr = this.docs();
    let h = '<div class="ds-wc ds-whd" style="text-align:left">Doctor</div>';
    this.DAYNAMES.forEach((d, i) => {
      h += `<div class="ds-wc ds-whd${i === this.TODAY_IDX && this.state.week === 0 ? ' today' : ''}">${d}</div>`;
    });
    arr.forEach((doc) => {
      h += `<div class="ds-wc ds-doccell"><div class="ds-av" style="background:linear-gradient(135deg,${doc.c},${this.mix(doc.c, 60)})">${this.esc(this.ini(doc.name))}</div><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(doc.name.replace('Dr. ', 'Dr '))}</div><div class="text-[10px] ds-muted truncate">${this.esc(doc.dept)}</div></div></div>`;
      doc.pat.forEach((k, di) => {
        const s = this.SHIFTS[k];
        if (k === 'O') {
          h += '<div class="ds-wc"><div class="ds-off">— off —</div></div>';
        } else {
          h += `<div class="ds-wc"><span class="ds-shift" style="background:${s.c};color:#fff" data-shift="${doc.id}-${di}" title="${this.esc(doc.name)} · ${this.esc(s.n)} ${this.esc(s.t)}">${s.k}<div style="font-size:.54rem;opacity:.85;font-weight:600">${s.t.split('–')[0]}</div></span></div>`;
        }
      });
    });
    if (!arr.length) h += '<div class="ds-wc" style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--color-gray-400)">No doctors match your filters.</div>';
    const el = this.byId('ds-weekgrid');
    if (el) el.innerHTML = h;
  }

  private renderDay(): void {
    const arr = this.docs();
    const START = 6;
    const END = 24;
    const span = END - START;
    let ticks = '';
    for (let t = START; t <= END; t += 3) ticks += `<span>${t % 24 === 0 ? '12a' : t > 12 ? t - 12 + 'p' : t + 'a'}</span>`;
    const ticksEl = this.byId('ds-ticks');
    if (ticksEl) ticksEl.innerHTML = ticks;
    let h = '';
    arr.forEach((doc) => {
      const k = doc.pat[this.TODAY_IDX];
      let track = '';
      if (k !== 'O') {
        const s = this.SHIFTS[k];
        let st = Math.max(s.s, START);
        let en = Math.min(s.e > 24 ? 24 : s.e, END);
        if (k === 'N') {
          st = 22;
          en = 24;
        }
        const left = ((st - START) / span) * 100;
        const width = ((en - st) / span) * 100;
        track = `<div class="ds-tl-block" style="left:${left}%;width:${width}%;background:linear-gradient(135deg,${s.c},${this.mix(s.c, 55)})" data-shift="${doc.id}" title="${this.esc(s.n)} ${this.esc(s.t)}">${this.esc(s.n)} · ${this.esc(s.t)}</div>`;
      } else {
        track = '<div class="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style="color:var(--color-gray-400)">Day Off</div>';
      }
      h += `<div class="ds-tl-row"><div class="flex items-center gap-2 min-w-0"><div class="ds-av" style="background:linear-gradient(135deg,${doc.c},${this.mix(doc.c, 60)})">${this.esc(this.ini(doc.name))}</div><div class="min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(doc.name.replace('Dr. ', 'Dr '))}</div><div class="text-[10px] ds-muted truncate">${this.esc(doc.dept)}</div></div></div><div class="ds-tl-track">${track}</div></div>`;
    });
    if (!arr.length) h = '<div style="text-align:center;padding:2rem;color:var(--color-gray-400)">No doctors match your filters.</div>';
    const el = this.byId('ds-daylist');
    if (el) el.innerHTML = h;
  }

  private render(): void {
    this.byId('ds-weekwrap')?.classList.toggle('hidden', this.state.view !== 'week');
    this.byId('ds-daywrap')?.classList.toggle('hidden', this.state.view !== 'day');
    if (this.state.view === 'week') this.renderWeek();
    else this.renderDay();
  }

  private renderSide(): void {
    const oncall = this.DOCS.filter((d) => d.oncall);
    const oncallEl = this.byId('ds-oncall');
    if (oncallEl) {
      oncallEl.innerHTML = oncall
        .map(
          (d) =>
            `<div class="ds-row"><div class="ds-av" style="width:2.4rem;height:2.4rem;background:linear-gradient(135deg,${d.c},${this.mix(d.c, 60)})">${this.esc(this.ini(d.name))}</div><div class="flex-1 min-w-0"><div class="text-sm font-bold text-[var(--color-gray-900)] truncate">${this.esc(d.name)}</div><div class="text-xs ds-muted truncate">${this.esc(d.dept)}</div></div><a href="#" class="ds-btn ds-btn-soft !p-2" title="Call" onclick="return false"><i class="ti ti-phone"></i></a></div>`
        )
        .join('');
    }

    const leavesEl = this.byId('ds-leaves');
    if (leavesEl) {
      leavesEl.innerHTML = this.LEAVES.map((l) => {
        const sc = l.status === 'Approved' ? '#10b981' : '#f59e0b';
        return `<div class="ds-row !gap-2.5"><div class="ds-av" style="width:2.2rem;height:2.2rem;background:linear-gradient(135deg,${l.c},${this.mix(l.c, 60)})">${this.esc(this.ini(l.name))}</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(l.name)}</div><div class="text-[11px] ds-muted truncate">${this.esc(l.type)} · ${this.esc(l.range)}</div></div><span class="ds-tag" style="background:${this.mix(sc)};color:${sc}">${this.esc(l.status)}</span></div>`;
      }).join('');
    }
  }

  private wireEvents(): void {
    const search = this.byId('ds-search') as HTMLInputElement | null;
    search?.addEventListener('input', () => {
      this.state.q = search.value;
      this.render();
    });
    const dept = this.byId('ds-dept') as HTMLSelectElement | null;
    dept?.addEventListener('change', () => {
      this.state.dept = dept.value;
      this.render();
    });
    const viewEl = this.byId('ds-view');
    viewEl?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') as 'week' | 'day';
      this.qsa('.ds-segb', viewEl).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.byId('ds-prev')?.addEventListener('click', () => {
      this.state.week--;
      this.updateRange();
      this.render();
    });
    this.byId('ds-next')?.addEventListener('click', () => {
      this.state.week++;
      this.updateRange();
      this.render();
    });
    this.byId('ds-today-btn')?.addEventListener('click', () => {
      this.state.week = 0;
      this.updateRange();
      this.render();
    });

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const sh = target.closest('[data-shift]') as HTMLElement | null;
      if (sh) {
        const t = sh.getAttribute('title');
        if (t) this.toast(t);
        return;
      }
      if (target.closest('[data-assign]')) {
        this.byId('ds-assignmodal')?.classList.add('open');
        this.document.body.style.overflow = 'hidden';
        return;
      }
      if (target.closest('[data-leave]')) {
        this.byId('ds-leavemodal')?.classList.add('open');
        this.document.body.style.overflow = 'hidden';
        return;
      }
      if (target.closest('[data-export]')) {
        this.toast('Exporting weekly roster...');
        return;
      }
      const c = target.closest('[data-close]') as HTMLElement | null;
      if (c) {
        const m = c.closest('.ds-modal');
        m?.classList.remove('open');
        if (!this.document.querySelectorAll('.ds-modal.open').length) this.document.body.style.overflow = '';
        return;
      }
    });
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.qsa('.ds-modal.open').forEach((m) => m.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });

    this.byId('ds-a-submit')?.addEventListener('click', () => {
      const id = +(this.byId('ds-a-doc') as HTMLSelectElement).value;
      const day = +(this.byId('ds-a-day') as HTMLSelectElement).value;
      const type = (this.byId('ds-a-type') as HTMLSelectElement).value;
      const doc = this.DOCS.find((d) => d.id === id);
      if (!doc) return;
      doc.pat[day] = type;
      this.byId('ds-assignmodal')?.classList.remove('open');
      if (!this.document.querySelectorAll('.ds-modal.open').length) this.document.body.style.overflow = '';
      if (this.state.view !== 'week') {
        this.state.view = 'week';
        this.qsa('.ds-segb', this.byId('ds-view')!).forEach((x) => x.classList.toggle('active', x.getAttribute('data-v') === 'week'));
      }
      this.render();
      this.toast(this.SHIFTS[type].n + ' shift assigned to ' + doc.name.replace('Dr. ', 'Dr ') + ' on ' + this.DAYNAMES[day]);
    });

    this.byId('ds-l-submit')?.addEventListener('click', () => {
      const id = +(this.byId('ds-l-doc') as HTMLSelectElement).value;
      const doc = this.DOCS.find((d) => d.id === id);
      const from = (this.byId('ds-l-from') as HTMLInputElement).value;
      const to = (this.byId('ds-l-to') as HTMLInputElement).value;
      if (!from) {
        this.toast('Select a start date');
        return;
      }
      if (!doc) return;
      this.LEAVES.unshift({
        name: doc.name,
        dept: doc.dept,
        c: doc.c,
        type: (this.byId('ds-l-type') as HTMLSelectElement).value,
        range: from + (to ? ' – ' + to : ''),
        status: 'Pending',
      });
      this.byId('ds-leavemodal')?.classList.remove('open');
      if (!this.document.querySelectorAll('.ds-modal.open').length) this.document.body.style.overflow = '';
      const reasonEl = this.byId('ds-l-reason') as HTMLTextAreaElement | null;
      if (reasonEl) reasonEl.value = '';
      this.renderSide();
      this.toast('Leave request submitted for ' + doc.name.replace('Dr. ', 'Dr '));
    });
  }
}
