import { DOCUMENT, Injectable, Inject } from '@angular/core';

/**
 * Ported from tailwind/src/assets/js/script.js — "Sidebar toggle,
 * page-action delegation (main.js core)".
 *
 * Wires the mobile sidebar toggle (#menu_btn / #mobile_btn), the
 * sidebar-close button and overlay, the shared data-action="print"/"reload"
 * and data-href delegated handlers, the global password-visibility toggle,
 * and the smooth-scroll to the active sidebar item on load.
 */
@Injectable({
  providedIn: 'root',
})
export class SidebarToggleService {
  private initialized = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.bindMobileMenuToggle();
    this.bindPageActionDelegation();
    this.bindNoopSubmitGuard();
    this.bindPasswordToggle();
    this.scrollActiveItemIntoView();
  }

  private bindMobileMenuToggle(): void {
    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const menuBtn = target.closest('#menu_btn') || target.closest('#mobile_btn');
      const sidebarClose = target.closest('.sidebar-close');
      const sidebarOverlayClick = target.closest('.sidebar-overlay');

      const wrapperEl = this.document.querySelector('.main-wrapper');
      const overlayEl = this.document.querySelector('.sidebar-overlay');
      const htmlEl = this.document.documentElement;

      if (menuBtn) {
        e.preventDefault();
        wrapperEl?.classList.toggle('slide-nav');
        overlayEl?.classList.toggle('opened');
        htmlEl.classList.toggle('menu-opened');
      }

      if (sidebarClose || sidebarOverlayClick) {
        wrapperEl?.classList.remove('slide-nav');
        overlayEl?.classList.remove('opened');
        htmlEl.classList.remove('menu-opened');
      }
    });
  }

  private bindPageActionDelegation(): void {
    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const printBtn = target.closest('[data-action="print"]');
      if (printBtn) {
        window.print();
        return;
      }

      const reloadBtn = target.closest('[data-action="reload"]');
      if (reloadBtn) {
        this.document.location.reload();
        return;
      }

      const navBtn = target.closest('[data-href]');
      if (navBtn) {
        this.document.location.href = navBtn.getAttribute('data-href') || '';
      }
    });
  }

  private bindNoopSubmitGuard(): void {
    this.document.addEventListener('submit', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-noop-submit]')) {
        e.preventDefault();
      }
    });
  }

  private bindPasswordToggle(): void {
    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('button');
      if (!btn) return;

      const eyeIcon = btn.querySelector('.icon-eye-off, .icon-eye');
      if (!eyeIcon) return;

      const container = btn.closest('.relative');
      if (!container) return;

      const input = container.querySelector('input') as HTMLInputElement | null;
      if (!input) return;

      if (input.type === 'password' || input.dataset['passwordToggle'] === 'true') {
        input.dataset['passwordToggle'] = 'true';
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';

        btn.innerHTML = isPassword
          ? '<i class="icon-eye text-base "></i>'
          : '<i class="icon-eye-off text-base"></i>';
      }
    });
  }

  private scrollActiveItemIntoView(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const activeItem = this.document.querySelector('#sidebar-menu .active');
        const scrollElement = this.document
          .querySelector('.sidebar-inner .simplebar-mask')
          ?.querySelector('.simplebar-content-wrapper');

        if (activeItem && scrollElement) {
          const activeRect = activeItem.getBoundingClientRect();
          const scrollRect = scrollElement.getBoundingClientRect();
          const targetScrollTop = scrollElement.scrollTop + (activeRect.top - scrollRect.top) - 100;

          scrollElement.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth',
          });
        }
      }, 500);
    });
  }
}
