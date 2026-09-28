import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Slot {
  t: string;
  taken: boolean;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "doctor-profile".
 * KPIs/specs/education/awards/weekly-hours ship as static markup matching
 * this seed data; this wires the today's-slot booking grid and the
 * book-appointment / message modals (tabs are handled by Preline natively).
 */
@Component({
  imports: [],
  selector: 'app-doctor-profile',
  styleUrl: './doctor-profile.css',
  templateUrl: './doctor-profile.html',
})
export class DoctorProfile implements AfterViewInit {
  private SLOTS: Slot[] = [
    { t: '09:00', taken: true },
    { t: '09:30', taken: true },
    { t: '10:00', taken: false },
    { t: '10:30', taken: false },
    { t: '11:00', taken: true },
    { t: '11:30', taken: false },
    { t: '14:00', taken: false },
    { t: '14:30', taken: true },
    { t: '15:00', taken: false },
    { t: '15:30', taken: false },
    { t: '16:00', taken: false },
    { t: '16:30', taken: true },
  ];

  private selSlot: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireSlots();
    this.wireModals();
    setTimeout(() => {
      this.byId('dp-skeleton')?.classList.add('hidden');
      this.byId('dp-content')?.classList.remove('hidden');
      requestAnimationFrame(() => {
        this.qsa('.dp-ring .bar').forEach((b) => {
          const p = b.style.getPropertyValue('--p');
          b.style.setProperty('--p', '0');
          requestAnimationFrame(() => b.style.setProperty('--p', p));
        });
      });
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

  private toast(msg: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, tone);
  }

  /* ---------- SLOTS ---------- */
  private renderSlots(): void {
    const el = this.byId('dp-slots');
    if (!el) return;
    el.innerHTML = this.SLOTS.map(
      (s, i) => `<div class="dp-slot${s.taken ? ' taken' : ''}${this.selSlot === i ? ' sel' : ''}" data-slot="${i}">${this.esc(s.t)}</div>`
    ).join('');
  }

  private wireSlots(): void {
    const slotsEl = this.byId('dp-slots');
    slotsEl?.addEventListener('click', (e: Event) => {
      const el = (e.target as HTMLElement).closest('[data-slot]') as HTMLElement | null;
      if (!el) return;
      const i = +el.getAttribute('data-slot')!;
      if (this.SLOTS[i].taken) return;
      this.selSlot = this.selSlot === i ? null : i;
      this.renderSlots();
      const b = this.byId('dp-slotbook') as HTMLButtonElement | null;
      if (b) {
        b.disabled = this.selSlot === null;
        b.style.opacity = this.selSlot === null ? '.5' : '1';
      }
    });

    this.byId('dp-slotbook')?.addEventListener('click', () => {
      if (this.selSlot === null) return;
      this.toast('Slot ' + this.SLOTS[this.selSlot].t + ' booked for today');
      this.SLOTS[this.selSlot].taken = true;
      this.selSlot = null;
      this.renderSlots();
      const b = this.byId('dp-slotbook') as HTMLButtonElement | null;
      if (b) {
        b.disabled = true;
        b.style.opacity = '.5';
      }
    });
  }

  /* ---------- MODALS ---------- */
  private openM(id: string): void {
    this.byId(id)?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }
  private closeM(el: Element): void {
    el.classList.remove('open');
    if (!this.document.querySelectorAll('.dp-modal.open').length) this.document.body.style.overflow = '';
  }

  private wireModals(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-book]')) this.openM('dp-bookmodal');
      if (target.closest('[data-msg]')) this.openM('dp-msgmodal');
      if (target.closest('[data-menu]')) this.toast('More actions menu');
      const c = target.closest('[data-close]') as HTMLElement | null;
      if (c) {
        const modal = c.closest('.dp-modal');
        if (modal) this.closeM(modal);
      }
    });
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.qsa('.dp-modal.open').forEach((m) => this.closeM(m));
      }
    });

    this.byId('dp-bk-submit')?.addEventListener('click', () => {
      const nameInp = this.byId('dp-bk-name') as HTMLInputElement | null;
      const reasonInp = this.byId('dp-bk-reason') as HTMLTextAreaElement | null;
      const n = nameInp?.value.trim() || '';
      if (!n) {
        this.toast('Enter patient name', 'error');
        return;
      }
      const modal = this.byId('dp-bookmodal');
      if (modal) this.closeM(modal);
      this.toast('Appointment booked for ' + n);
      if (nameInp) nameInp.value = '';
      if (reasonInp) reasonInp.value = '';
    });

    this.byId('dp-mg-submit')?.addEventListener('click', () => {
      const subInp = this.byId('dp-mg-sub') as HTMLInputElement | null;
      const bodyInp = this.byId('dp-mg-body') as HTMLTextAreaElement | null;
      const s = subInp?.value.trim() || '';
      if (!s) {
        this.toast('Enter a subject', 'error');
        return;
      }
      const modal = this.byId('dp-msgmodal');
      if (modal) this.closeM(modal);
      this.toast('Message sent to Dr. Roberts');
      if (subInp) subInp.value = '';
      if (bodyInp) bodyInp.value = '';
    });
  }
}
