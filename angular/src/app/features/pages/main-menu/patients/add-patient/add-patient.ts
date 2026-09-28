import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js — "ADD-PATIENT".
 * A single-page multi-section patient registration form: live clock,
 * animated completion rings, a stepper that scrolls to sections, a
 * completion-percentage meter mirrored into an overview sidebar, avatar
 * upload preview, document drag & drop zones, and a set of toast-only
 * action buttons (save / admit / print / reset / cancel) — all client-side.
 */
@Component({
  imports: [],
  selector: 'app-add-patient',
  styleUrl: './add-patient.css',
  templateUrl: './add-patient.html',
})
export class AddPatient implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const root = this.byId('ap-page');
    if (!root) return;

    /* ---- Live date & time ---- */
    const clock = this.byId('ap-clock');
    const tick = () => {
      if (!clock) return;
      const now = new Date();
      clock.textContent =
        now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' +
        now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };
    tick();
    setInterval(tick, 30000);

    /* ---- Circular rings ---- */
    requestAnimationFrame(() => {
      this.qsa<HTMLElement>('.ap-ring[data-p]', root).forEach((r) => {
        const p = Math.max(0, Math.min(100, parseFloat(r.getAttribute('data-p') || '0') || 0));
        r.style.setProperty('--p', String(p));
      });
    });

    /* ---- Stepper ---- */
    const steps = this.qsa<HTMLElement>('.ap-step', root);
    const goToStep = (target: string) => {
      let reached = true;
      steps.forEach((s) => {
        const isTarget = s.getAttribute('data-step') === target;
        s.classList.toggle('is-active', isTarget && reached);
        s.classList.toggle('is-done', reached && !isTarget && steps.indexOf(s) < steps.findIndex((x) => x.getAttribute('data-step') === target));
        if (isTarget) reached = false;
      });
      const sec = this.byId(`sec-${target}`);
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    steps.forEach((s) => {
      s.addEventListener('click', () => goToStep(s.getAttribute('data-step') || ''));
    });

    /* ---- Completion meter + overview mirror ---- */
    const form = this.byId('ap-form') as HTMLFormElement | null;
    const pctEls = this.qsa<HTMLElement>('[data-ap-pct]', root);
    const meter = this.byId('ap-meter-fill');

    const required = (): HTMLElement[] => (form ? this.qsa<HTMLElement>('[data-req]', form) : []);
    const field = (name: string): string => {
      const el = form?.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement | null;
      return el ? el.value : '';
    };
    const mirror = (name: string, targetId: string, fmt?: (v: string) => string) => {
      const t = this.byId(targetId);
      if (!t) return;
      const v = field(name);
      const out = fmt ? fmt(v) : v;
      if (out && String(out).trim() !== '') t.textContent = out;
    };
    const recompute = () => {
      const reqs = required();
      if (!reqs.length) return;
      const done = reqs.filter((el) => {
        const input = el as HTMLInputElement;
        if (input.type === 'checkbox' || input.type === 'radio') {
          const group = form!.querySelectorAll(`[name="${input.name}"]`);
          return Array.prototype.some.call(group, (g: HTMLInputElement) => g.checked);
        }
        return String(input.value || '').trim() !== '';
      }).length;
      const pct = Math.round((done / reqs.length) * 100);
      pctEls.forEach((e) => (e.textContent = `${pct}%`));
      if (meter) meter.style.width = `${pct}%`;

      mirror('first_name', 'ov-name', (v) => {
        const last = field('last_name');
        return `${v} ${last || ''}`.trim() || 'New Patient';
      });
      mirror('dept', 'ov-dept');
      mirror('doctor', 'ov-doctor');
    };
    if (form) {
      form.addEventListener('input', recompute);
      form.addEventListener('change', recompute);
      recompute();
    }

    /* ---- Avatar upload preview ---- */
    const bindImage = (dropId: string, inputId: string, imgId: string, placeholderId: string) => {
      const drop = this.byId(dropId);
      const input = this.byId(inputId) as HTMLInputElement | null;
      if (!drop || !input) return;
      drop.addEventListener('click', () => input.click());
      input.addEventListener('change', () => {
        const f = input.files && input.files[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        const img = this.byId(imgId) as HTMLImageElement | null;
        if (img) {
          img.src = url;
          img.classList.remove('hidden');
        }
        const ph = this.byId(placeholderId);
        if (ph) ph.classList.add('hidden');
        const ov = this.byId('ov-avatar') as HTMLImageElement | null;
        if (ov && imgId === 'ap-avatar-img') ov.src = url;
      });
    };
    bindImage('ap-avatar-drop', 'ap-avatar-input', 'ap-avatar-img', 'ap-avatar-ph');

    /* ---- Document drag & drop cards (UI only) ---- */
    this.qsa<HTMLElement>('.ap-upload', root).forEach((zone) => {
      const input = zone.querySelector('input[type="file"]') as HTMLInputElement | null;
      const label = zone.querySelector('[data-u-label]') as HTMLElement | null;
      const defaultText = label ? label.textContent : '';
      if (input) {
        zone.addEventListener('click', (e: Event) => {
          if ((e.target as HTMLElement).tagName !== 'INPUT') input.click();
        });
        input.addEventListener('change', () => {
          const f = input.files && input.files[0];
          if (f && label) {
            label.textContent = f.name;
            zone.classList.add('is-filled');
          } else if (label) {
            label.textContent = defaultText;
            zone.classList.remove('is-filled');
          }
          recompute();
        });
      }
      ['dragenter', 'dragover'].forEach((ev) =>
        zone.addEventListener(ev, (e: Event) => {
          e.preventDefault();
          zone.classList.add('is-drag');
        })
      );
      ['dragleave', 'drop'].forEach((ev) =>
        zone.addEventListener(ev, (e: Event) => {
          e.preventDefault();
          zone.classList.remove('is-drag');
        })
      );
      zone.addEventListener('drop', (e: Event) => {
        const files = (e as DragEvent).dataTransfer?.files;
        if (files && files.length && input) {
          try {
            input.files = files;
          } catch {
            /* older browsers */
          }
          if (label) {
            label.textContent = files[0].name;
            zone.classList.add('is-filled');
          }
          recompute();
        }
      });
    });

    /* ---- Action buttons ---- */
    this.qsa<HTMLElement>('[data-ap-action]', root).forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-ap-action');
        switch (action) {
          case 'save':
            this.toast('Patient registration saved as draft.');
            break;
          case 'save-new':
            this.toast('Patient saved. Ready for the next registration.');
            break;
          case 'admit':
            this.toast('Patient admitted successfully.');
            break;
          case 'print':
            window.print();
            break;
          case 'reset':
            if (form) form.reset();
            this.qsa<HTMLElement>('.ap-upload.is-filled', root).forEach((z) => {
              z.classList.remove('is-filled');
              const l = z.querySelector('[data-u-label]') as HTMLElement & { dataset: { default?: string } } | null;
              if (l && l.dataset['default']) l.textContent = l.dataset['default'] as string;
            });
            const img = this.byId('ap-avatar-img');
            if (img) img.classList.add('hidden');
            const ph = this.byId('ap-avatar-ph');
            if (ph) ph.classList.remove('hidden');
            recompute();
            this.toast('Form reset.', 'info');
            break;
          case 'cancel':
            this.toast('Registration cancelled.', 'info');
            break;
        }
      });
    });
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }
}
