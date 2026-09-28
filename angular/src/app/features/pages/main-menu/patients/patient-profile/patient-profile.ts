import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js — "patient-profile".
 * Every tab, modal and menu is static markup (rule: no JS-generated content).
 * This only wires generic show/hide interactions: tabs, accordions, the
 * custom .pp-modal/.pp-drawer overlays (open/close by class, matching this
 * page's own existing overlay system), and the hero "more" Preline dropdown
 * (handled entirely by Preline's own hs-dropdown JS, so nothing to wire here).
 */
@Component({
  imports: [],
  selector: 'app-patient-profile',
  styleUrl: './patient-profile.css',
  templateUrl: './patient-profile.html',
})
export class PatientProfile implements AfterViewInit {
  private admitted = true;

  private readonly modalForAction: Record<string, string> = {
    edit: 'pp-edit-modal',
    assign: 'pp-assign-modal',
    transfer: 'pp-transfer-modal',
    schedule: 'pp-schedule-modal',
    upload: 'pp-upload-modal',
    email: 'pp-email-modal',
    sms: 'pp-sms-modal',
    'delete-doc': 'pp-deletedoc-modal',
  };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireSkeletonReveal();
    this.wireTabsScroll();
    this.wireAccordions();
    this.wireModals();
    this.wireConfirmButtons();
    this.wireAdmitToggle();
    this.wireDrawer();
    this.wireNotes();
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

  /* ---------- skeleton reveal ---------- */
  private wireSkeletonReveal(): void {
    setTimeout(() => {
      const sk = this.byId('pp-skeleton');
      const ct = this.byId('pp-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'pp-fade .4s ease';
      }
      requestAnimationFrame(() => {
        this.qsa<HTMLElement>('.pp-ring[data-p]').forEach((r) => {
          r.style.setProperty('--p', String(Math.max(0, Math.min(100, +(r.getAttribute('data-p') || 0) || 0))));
        });
      });
    }, 1400);
  }

  /* ---------- tabs: Preline's native tab component (data-hs-tab) owns
     switching + aria-selected. The strip itself overflows on narrow
     widths, so it only needs scroll help: wheel -> horizontal scroll, and
     the clicked tab is brought fully into view. ---------- */
  private wireTabsScroll(): void {
    this.qsa<HTMLElement>('.pp-tabs').forEach((strip) => {
      strip.addEventListener(
        'wheel',
        (e: Event) => {
          const we = e as WheelEvent;
          const max = strip.scrollWidth - strip.clientWidth;
          if (max <= 0 || Math.abs(we.deltaX) >= Math.abs(we.deltaY)) return;
          if ((we.deltaY < 0 && strip.scrollLeft <= 0) || (we.deltaY > 0 && strip.scrollLeft >= max - 1)) return;
          we.preventDefault();
          strip.scrollLeft += we.deltaY;
        },
        { passive: false }
      );
      strip.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const tab = target.closest('.pp-tab') as HTMLElement | null;
        if (tab) tab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
      });
    });
  }

  /* ---------- accordions ---------- */
  private wireAccordions(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const h = target.closest('.pp-acc-head') as HTMLElement | null;
      if (!h) return;
      h.parentElement?.classList.toggle('open');
    });
  }

  /* ---------- modal open/close (existing .pp-modal/.open system) ------- */
  private openModal(id: string): void {
    const m = this.byId(id);
    if (!m) return;
    m.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeModal(m: HTMLElement | null): void {
    if (!m) return;
    m.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private wireModals(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const b = target.closest('[data-act]') as HTMLElement | null;
      if (b) {
        const act = b.getAttribute('data-act') || '';
        if (act === 'print') {
          this.toast('Preparing print view…', 'info');
          setTimeout(() => window.print(), 400);
          return;
        }
        if (act === 'pdf') {
          this.toast('Generating PDF…', 'info');
          return;
        }
        if (act === 'toggle-admit') {
          this.openModal(this.admitted ? 'pp-discharge-modal' : 'pp-readmit-modal');
          return;
        }
        if (this.modalForAction[act]) {
          this.openModal(this.modalForAction[act]);
        }
        return;
      }
      const close = target.closest('[data-close]') as HTMLElement | null;
      if (close) {
        const modal = close.closest('.pp-modal') as HTMLElement | null;
        if (modal) this.closeModal(modal);
        this.qsa<HTMLElement>('.pp-drawer.open').forEach((d) => d.classList.remove('open'));
      }
    });

    this.qsa<HTMLElement>('.pp-modal').forEach((m) => {
      m.addEventListener('mousedown', (e: Event) => {
        const target = e.target as HTMLElement;
        if (target === m || target.classList.contains('pp-modal-back')) this.closeModal(m);
      });
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      this.qsa<HTMLElement>('.pp-modal.open').forEach((m) => this.closeModal(m));
      this.qsa<HTMLElement>('.pp-drawer.open').forEach((d) => d.classList.remove('open'));
    });
  }

  /* ---------- confirm buttons: no backend, so just close + toast ------- */
  private confirmCloses(id: string, toModal: string, msg: () => string): void {
    const btn = this.byId(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.closeModal(this.byId(toModal));
      this.toast(msg());
    });
  }

  private wireConfirmButtons(): void {
    this.confirmCloses('pp-edit-confirm', 'pp-edit-modal', () => 'Patient profile updated');
    this.confirmCloses('pp-assign-confirm', 'pp-assign-modal', () => `${(this.byId('a-doc') as HTMLSelectElement | null)?.value} assigned`);
    this.confirmCloses('pp-transfer-confirm', 'pp-transfer-modal', () => `Patient transferred to ${(this.byId('t-dept') as HTMLSelectElement | null)?.value}`);
    this.confirmCloses('pp-schedule-confirm', 'pp-schedule-modal', () => 'Appointment scheduled');
    this.confirmCloses('pp-upload-confirm', 'pp-upload-modal', () => 'Document uploaded');
    this.confirmCloses('pp-email-confirm', 'pp-email-modal', () => 'Email sent');
    this.confirmCloses('pp-sms-confirm', 'pp-sms-modal', () => 'SMS sent');
    this.confirmCloses('pp-deletedoc-confirm', 'pp-deletedoc-modal', () => 'Document deleted');
  }

  private wireAdmitToggle(): void {
    const dischargeConfirm = this.byId('pp-discharge-confirm');
    dischargeConfirm?.addEventListener('click', () => {
      this.admitted = false;
      const statusBadge = this.byId('pp-status-badge');
      if (statusBadge) statusBadge.textContent = 'Discharged';
      const sideStatus = this.byId('pp-side-status');
      if (sideStatus) sideStatus.textContent = 'Discharged';
      const admitBtn = this.byId('pp-admit-btn');
      if (admitBtn) admitBtn.innerHTML = '<i class="icon-bed"></i>Admit';
      this.closeModal(this.byId('pp-discharge-modal'));
      this.toast('Patient discharged');
    });

    const readmitConfirm = this.byId('pp-readmit-confirm');
    readmitConfirm?.addEventListener('click', () => {
      this.admitted = true;
      const statusBadge = this.byId('pp-status-badge');
      if (statusBadge) statusBadge.textContent = 'Admitted';
      const sideStatus = this.byId('pp-side-status');
      if (sideStatus) sideStatus.textContent = 'Admitted';
      const admitBtn = this.byId('pp-admit-btn');
      if (admitBtn) admitBtn.innerHTML = '<i class="icon-log-out"></i>Discharge';
      this.closeModal(this.byId('pp-readmit-modal'));
      this.toast('Patient admitted');
    });
  }

  /* ---------- drawer ---------- */
  private wireDrawer(): void {
    this.byId('pp-open-activity')?.addEventListener('click', () => {
      this.byId('pp-activity-drawer')?.classList.add('open');
      this.document.body.style.overflow = 'hidden';
    });
  }

  /* ---------- notes: no backend to persist a new note to, so the
     button just clears the input with feedback rather than fabricating
     a new note element ---------- */
  private wireNotes(): void {
    this.byId('pp-note-add')?.addEventListener('click', () => {
      const i = this.byId('pp-note-input') as HTMLInputElement | null;
      const v = (i?.value || '').trim();
      if (!v) {
        this.toast('Enter a note first', 'error');
        return;
      }
      if (i) i.value = '';
      this.toast('Note added');
    });
  }
}
