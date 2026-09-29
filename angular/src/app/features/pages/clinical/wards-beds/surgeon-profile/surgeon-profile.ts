import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Slot {
  t: string;
  taken: boolean;
}

@Component({
  imports: [RouterLink],
  selector: 'app-surgeon-profile',
  styleUrl: './surgeon-profile.css',
  templateUrl: './surgeon-profile.html',
})
export class SurgeonProfile implements AfterViewInit {
  private SLOTS: Slot[] = [
    { t: '08:00', taken: true },
    { t: '08:30', taken: true },
    { t: '09:00', taken: false },
    { t: '09:30', taken: false },
    { t: '10:00', taken: true },
    { t: '10:30', taken: false },
    { t: '13:00', taken: false },
    { t: '13:30', taken: true },
    { t: '14:00', taken: false },
    { t: '14:30', taken: false },
    { t: '15:00', taken: false },
    { t: '15:30', taken: true },
  ];

  private selSlot: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.renderSlots();
    this.wireSlots();
    this.wireModals();
    this.document.getElementById('sup-menu')?.addEventListener('click', () => this.toast('More actions menu', 'info'));
    this.qsa('#sup-docs button[id^="sup-dl-"]').forEach((btn) => btn.addEventListener('click', () => this.toast('Downloading document...', 'info')));
    const hs = (this.document.defaultView as any)?.HSStaticMethods;
    if (hs) hs.autoInit();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa(sel: string): HTMLElement[] {
    return Array.prototype.slice.call(this.document.querySelectorAll(sel));
  }

  private toast(msg: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, tone);
  }

  private renderSlots(): void {
    const el = this.byId('sup-slots');
    if (!el) return;
    el.innerHTML = this.SLOTS.map(
      (s, i) => `<div class="sup-slot${s.taken ? ' taken' : ''}${this.selSlot === i ? ' sel' : ''}" data-slot="${i}">${s.t}</div>`
    ).join('');
  }

  private wireSlots(): void {
    const slotsEl = this.byId('sup-slots');
    slotsEl?.addEventListener('click', (e: Event) => {
      const el = (e.target as HTMLElement).closest('[data-slot]') as HTMLElement | null;
      if (!el) return;
      const i = +el.getAttribute('data-slot')!;
      if (this.SLOTS[i].taken) return;
      this.selSlot = this.selSlot === i ? null : i;
      this.renderSlots();
      const b = this.byId('sup-slotbook') as HTMLButtonElement | null;
      if (b) {
        b.disabled = this.selSlot === null;
        b.style.opacity = this.selSlot === null ? '.5' : '1';
      }
    });

    this.byId('sup-slotbook')?.addEventListener('click', () => {
      if (this.selSlot === null) return;
      this.toast('Slot ' + this.SLOTS[this.selSlot].t + ' booked for today');
      this.SLOTS[this.selSlot].taken = true;
      this.selSlot = null;
      this.renderSlots();
      const b = this.byId('sup-slotbook') as HTMLButtonElement | null;
      if (b) {
        b.disabled = true;
        b.style.opacity = '.5';
      }
    });
  }

  private wireModals(): void {
    this.byId('sup-bk-submit')?.addEventListener('click', () => {
      const nameInp = this.byId('sup-bk-name') as HTMLInputElement | null;
      const reasonInp = this.byId('sup-bk-reason') as HTMLTextAreaElement | null;
      const n = nameInp?.value.trim() || '';
      if (!n) {
        this.toast('Enter patient name', 'error');
        return;
      }
      this.toast('Surgery assigned for ' + n);
      if (nameInp) nameInp.value = '';
      if (reasonInp) reasonInp.value = '';
    });

    this.byId('sup-mg-submit')?.addEventListener('click', () => {
      const subInp = this.byId('sup-mg-sub') as HTMLInputElement | null;
      const bodyInp = this.byId('sup-mg-body') as HTMLTextAreaElement | null;
      const s = subInp?.value.trim() || '';
      if (!s) {
        this.toast('Enter a subject', 'error');
        return;
      }
      this.toast('Message sent to Dr. Mehta');
      if (subInp) subInp.value = '';
      if (bodyInp) bodyInp.value = '';
    });
  }
}
