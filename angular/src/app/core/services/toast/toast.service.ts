import { DOCUMENT, Injectable, Inject } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

/**
 * Ported from tailwind/src/assets/js/script.js — "Shared CRUD utility"
 * (MC.toast). The dashboard scripts all call `window.MC.toast(...)`, but
 * `window.MC` is never defined in the Angular app, so those calls were
 * silently no-oping. This is the same lightweight DOM toast, wired through
 * Angular DI instead of a global. The `.mc-toast` styling already exists
 * in assets/css/style.css.
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly icons: Record<ToastTone, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  show(message: string, tone: ToastTone = 'success'): void {
    const el = this.document.createElement('div');
    el.className = `mc-toast ${tone}`;
    el.innerHTML = `<span>${this.icons[tone] || ''}</span> ${message}`;
    this.document.body.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.3s';
      setTimeout(() => el.remove(), 300);
    }, 2800);
  }
}
