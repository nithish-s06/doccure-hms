import { DOCUMENT, Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private renderer: Renderer2;
  base = '';
  page = '';
  last = '';
  // Layout Mode
  public layoutMode: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('layoutMode') || 'default'
  );
  // Theme Color
  public themeColor: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('themeColor') || 'light'
  );
  // Accent Color
  public accentColor: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('accentColor') || ''
  );
  // Surface Tint
  public surfaceTint: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('surfaceTint') || ''
  );

  public mobileOverlaySubject = new BehaviorSubject<boolean>(false);
  private fulloverlay = new BehaviorSubject<boolean>(false);
  private sidebarMini = new BehaviorSubject<boolean>(false);
  public sidebarHidden = new BehaviorSubject<boolean>(false);

  constructor(private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document, private router: Router) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetFullWidth();
        this.resethidden();
      });
    this.initTheme();
  }
  mobileOverlay$ = this.mobileOverlaySubject.asObservable();
  fulloverlay$ = this.fulloverlay.asObservable();
  subMenuClose = false;
  sidebarMini$ = this.sidebarMini.asObservable();
  sidebarHidden$ = this.sidebarHidden.asObservable();

  toggleMiniSidebar():void{
    this.sidebarMini.next(!this.sidebarMini.value);
  };
  toggleMenu(): void {
    const wrapper = document.querySelector('.main-wrapper');
    const fullwidth = document.body.classList.contains('full-width');
    this.mobileOverlaySubject.next(!this.mobileOverlaySubject.value);
    if (wrapper) {
      if (wrapper.classList.contains('slide-nav')) {
        this.renderer.removeClass(wrapper, 'slide-nav');
      } else {
        this.renderer.addClass(wrapper, 'slide-nav');
      }
    }
    if (fullwidth) {
      document.body.classList.remove('full-width')
    }
    const openedEls = document.querySelectorAll('.fullsidebaroverlay.opened');
    openedEls.forEach((el) => {
      el.classList.remove('opened');
    });
  };
  private initTheme(): void {
    const savedTheme = localStorage.getItem('themeColor') || 'light';

    // Update BehaviorSubject
    this.themeColor.next(savedTheme);

    // Apply to DOM
    this.renderer.setAttribute(
      document.documentElement,
      'class',
      savedTheme
    );
  };
  overlayClose(): void {
    this.mobileOverlaySubject.next(false);
    const wrapper = document.querySelector('.main-wrapper');
    if (wrapper) {
      if (wrapper.classList.contains('slide-nav')) {
        this.renderer.removeClass(wrapper, 'slide-nav');
      }
    }
  }
  public changeLayoutMode(layout: string): void {
    this.layoutMode.next(layout);
    localStorage.setItem('layoutMode', layout);
    this.renderer.setAttribute(
      document.documentElement,
      'class', layout
    );
    this.document.documentElement.classList.add(layout)
    if (layout === 'rtl') {
      this.renderer.setAttribute(document.documentElement, 'dir', 'rtl');
    } else {
      this.renderer.setAttribute(document.documentElement, 'dir', '');
    }
    if (layout !== 'hidden') {
      this.renderer.removeClass(document.body, 'hidden-layout')
    }
    this.renderer.setAttribute(document.documentElement, 'class', 'mode-light');

  }

  public changeThemeColor(themeColor: string): void {
    this.themeColor.next(themeColor);
    localStorage.setItem('themeColor', themeColor);
    this.renderer.setAttribute(
      document.documentElement,
      'class',
      themeColor
    );
    this.renderer.setAttribute(document.documentElement, 'data-layout', 'ltr');
    this.renderer.setAttribute(document.documentElement, 'dir', 'ltr');
  }

private currentAccent: string | null = null;
private currentSurfaceTint: string | null = null;

public changeAccentColor(accentColor: string): void {
  const root = this.document.documentElement;

  // ✅ remove previous accent class
  if (this.currentAccent) {
    root.classList.remove(this.currentAccent);
  }

  // ✅ add new accent class
  root.classList.add(accentColor);

  // ✅ persist + update state
  this.currentAccent = accentColor;
  this.accentColor.next(accentColor);
  localStorage.setItem('accentColor', accentColor);

  // optional
}
public changeSurfaceTint(surfaceTint: string): void {
  const root = this.document.documentElement;

  // ✅ remove previous accent class
  if (this.currentSurfaceTint) {
    root.classList.remove(this.currentSurfaceTint);
  }

  // ✅ add new accent class
  root.classList.add(surfaceTint);

  // ✅ persist + update state
  this.currentSurfaceTint = surfaceTint;
  this.surfaceTint.next(surfaceTint);
  localStorage.setItem('surfaceTint', surfaceTint);


}
  togglefull(): void {
    this.fulloverlay.next(!this.fulloverlay.value);
    if (this.document.body.classList.contains('hidden-layout')) {
      this.renderer.removeClass(this.document.body, 'hidden-layout');
    }
    else if (this.fulloverlay.value === true) {
      this.renderer.removeClass(this.document.body, 'hidden-layout');
      this.renderer.addClass(this.document.body, 'full-width');
    } else {
      this.renderer.removeClass(this.document.body, 'full-width');
    }
  }
  toggleHidden(): void {
    this.sidebarHidden.next(!this.sidebarHidden.value);
  }
  toggleMobile(): void {
    this.mobileOverlaySubject.next(!this.mobileOverlaySubject.value);
    this.sidebarHidden.next(!this.sidebarHidden.value);
  }
  resethidden(): void {

    this.renderer.removeClass(this.document.body, 'hidden-layout');
  }
  resetFullWidth(): void {
    this.fulloverlay.next(false);
    this.renderer.removeClass(this.document.body, 'full-width');
  }
}
