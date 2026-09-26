import { DOCUMENT, Injectable, Inject } from '@angular/core';

interface CommandItem {
  group: string;
  icon: string;
  c: string;
  label: string;
  href: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "Enterprise Command Bar —
 * global search, Ctrl+K palette, notifications, activity drawer, live
 * clock, appearance switcher (partials/topbar.html)".
 *
 * Drives header.html's `hc-*` hooks.
 */
@Injectable({
  providedIn: 'root',
})
export class CommandBarService {
  private initialized = false;
  private cmdActive = 0;
  private clockTimer?: ReturnType<typeof setInterval>;
  private readonly themeKey = 'medicore-theme';
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  private readonly commands: CommandItem[] = [
    { group: 'Navigation', icon: 'icon-layout-grid', c: 'hc-c-fuchsia', label: 'Executive Dashboard', href: '/executive-dashboard' },
    { group: 'Navigation', icon: 'icon-stethoscope', c: 'hc-c-indigo', label: 'Doctor Dashboard', href: '/doctor-dashboard' },
    { group: 'Navigation', icon: 'icon-heart-pulse', c: 'hc-c-teal', label: 'Nurse Dashboard', href: '/nurse-dashboard' },
    { group: 'Navigation', icon: 'icon-headset', c: 'hc-c-amber', label: 'Reception Dashboard', href: '/reception-dashboard' },
    { group: 'Navigation', icon: 'icon-microscope', c: 'hc-c-sky', label: 'Laboratory Dashboard', href: '/laboratory-dashboard' },
    { group: 'Navigation', icon: 'icon-pill', c: 'hc-c-emerald', label: 'Pharmacy Dashboard', href: '/pharmacy-dashboard' },
    { group: 'Navigation', icon: 'icon-receipt', c: 'hc-c-gold', label: 'Billing Dashboard', href: '/billing-dashboard' },
    { group: 'Actions', icon: 'icon-user-plus', c: 'hc-c-indigo', label: 'Register new patient', href: '/patients' },
    { group: 'Actions', icon: 'icon-calendar-plus', c: 'hc-c-sky', label: 'Book an appointment', href: '/appointments' },
    { group: 'Actions', icon: 'icon-siren', c: 'hc-c-rose', label: 'Open emergency case', href: '/emergency' },
    { group: 'Actions', icon: 'icon-flask-conical', c: 'hc-c-violet', label: 'Create lab request', href: '/laboratory' },
    { group: 'Actions', icon: 'icon-truck', c: 'hc-c-emerald', label: 'Dispatch ambulance', href: '/ambulance' },
    { group: 'Records', icon: 'icon-users', c: 'hc-c-sky', label: 'Patients directory', href: '/patients' },
    { group: 'Records', icon: 'icon-user-round', c: 'hc-c-indigo', label: 'Doctors directory', href: '/doctors' },
    { group: 'Records', icon: 'icon-bed', c: 'hc-c-teal', label: 'Ward & bed status', href: '/wards' },
    { group: 'Records', icon: 'icon-file-text', c: 'hc-c-violet', label: 'Medical records', href: '/medical-records' },
    { group: 'Settings', icon: 'icon-settings', c: 'hc-c-primary', label: 'Open settings', href: '/settings' },
    { group: 'Settings', icon: 'icon-user-circle', c: 'hc-c-primary', label: 'My profile', href: '/profile' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.tickClock();
    this.clockTimer = setInterval(() => this.tickClock(), 30000);
    this.setupAppearance();
    this.setupNotifications();
    this.setupWorkspace();
    this.setupScroll();

    const openBtn = this.byId('hc-cmd-open');
    openBtn?.addEventListener('click', () => this.openCommandPalette());

    const cmdInput = this.byId('hc-cmd-input') as HTMLInputElement | null;
    cmdInput?.addEventListener('input', (e) => this.renderCommands((e.target as HTMLInputElement).value));

    const cmdBox = this.byId('hc-cmd');
    cmdBox?.addEventListener('click', (e: Event) => {
      if (e.target === cmdBox) this.closeCommandPalette();
    });

    const searchInput = this.byId('hc-search-input') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.addEventListener('focus', () => this.openSearch());
      searchInput.addEventListener('input', () => {
        const panel = this.byId('hc-search-panel') as HTMLElement | null;
        if (panel?.hidden) this.openSearch();
      });
      searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          this.pushRecentSearch(searchInput.value.trim());
          this.closeSearch();
          searchInput.blur();
        }
        if (e.key === 'Escape') {
          this.closeSearch();
          searchInput.blur();
        }
      });
    }

    const recentClear = this.byId('hc-recent-clear');
    recentClear?.addEventListener('click', () => {
      localStorage.removeItem('hc-recent');
      this.renderRecentSearches();
    });

    const searchPanel = this.byId('hc-search-panel');
    searchPanel?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const r = target.closest('[data-recent]') as HTMLElement | null;
      if (r && searchInput) {
        searchInput.value = r.dataset['recent'] || '';
        searchInput.focus();
      }
    });

    const actOpen = this.byId('hc-activity-open');
    actOpen?.addEventListener('click', () => this.openActivityDrawer());
    this.document.querySelectorAll('[data-hc-drawer-close]').forEach((b) => b.addEventListener('click', () => this.closeActivityDrawer()));

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (this.byId('hc-search') && !target.closest('#hc-search')) this.closeSearch();
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const box = this.byId('hc-cmd') as HTMLElement | null;
        if (box?.hidden) this.openCommandPalette();
        else this.closeCommandPalette();
        return;
      }
      const box = this.byId('hc-cmd') as HTMLElement | null;
      if (!box || box.hidden) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        this.closeCommandPalette();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.setActiveCommand(this.cmdActive + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.setActiveCommand(this.cmdActive - 1);
      } else if (e.key === 'Enter') {
        const item = this.commandItems()[this.cmdActive];
        if (item) this.document.location.href = item.getAttribute('href') || '';
      }
    });
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private escapeHtml(value: string | null | undefined): string {
    return String(value ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
    );
  }

  /* ---------------- Live clock ---------------- */

  private pad(n: number): string {
    return String(n).padStart(2, '0');
  }

  private shiftName(h: number): string {
    return h >= 7 && h < 15 ? 'Day Shift' : h >= 15 && h < 23 ? 'Evening Shift' : 'Night Shift';
  }

  private tickClock(): void {
    const timeEl = this.byId('hc-clock-time');
    const metaEl = this.byId('hc-clock-meta');
    if (!timeEl) return;
    const now = new Date();
    const h = now.getHours();
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = ((h + 11) % 12) + 1;
    timeEl.textContent = `${h12}:${this.pad(now.getMinutes())} ${ampm}`;
    if (metaEl) {
      metaEl.textContent = `${this.shiftName(h)} · ${now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}`;
    }
  }

  /* ---------------- Appearance switcher ---------------- */

  private applyAppearance(mode: string): void {
    const dark = mode === 'dark' || (mode === 'system' && this.mediaQuery.matches);
    this.document.documentElement.classList.toggle('dark', dark);
    const iconClass = dark ? 'icon-sun text-base!' : 'icon-moon text-base!';
    const appIcon = this.byId('hc-appearance-icon');
    if (appIcon) appIcon.className = iconClass;
    this.document.querySelectorAll('.light-dark-mode i').forEach((el) => (el.className = iconClass));
    this.document.querySelectorAll('[data-theme-set]').forEach((b) => {
      const el = b as HTMLElement;
      el.classList.toggle('is-active', el.dataset['themeSet'] === mode);
    });
  }

  private currentAppearanceMode(): string {
    const v = localStorage.getItem(this.themeKey);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'light';
  }

  private setupAppearance(): void {
    this.applyAppearance(this.currentAppearanceMode());
    this.document.querySelectorAll('[data-theme-set]').forEach((b) =>
      b.addEventListener('click', () => {
        const mode = (b as HTMLElement).dataset['themeSet'] || 'light';
        localStorage.setItem(this.themeKey, mode);
        this.applyAppearance(mode);
      })
    );
    this.document.querySelectorAll('.light-dark-mode').forEach((btn) =>
      btn.addEventListener('click', () => {
        setTimeout(() => {
          const mode = this.document.documentElement.classList.contains('dark') ? 'dark' : 'light';
          localStorage.setItem(this.themeKey, mode);
          this.applyAppearance(mode);
        }, 0);
      })
    );
    this.mediaQuery.addEventListener('change', () => {
      if (this.currentAppearanceMode() === 'system') this.applyAppearance('system');
    });
  }

  /* ---------------- Command palette ---------------- */

  private renderCommands(query: string): void {
    const list = this.byId('hc-cmd-list');
    if (!list) return;
    const q = query || '';
    const filtered = this.commands.filter((c) => !q || `${c.label} ${c.group}`.toLowerCase().includes(q.toLowerCase()));
    this.cmdActive = 0;
    if (!filtered.length) {
      list.innerHTML = `<p class="px-3 py-8 text-center text-sm font-semibold text-gray-400">No matches for "${this.escapeHtml(q)}".</p>`;
      return;
    }
    let html = '';
    let lastGroup = '';
    let idx = 0;
    filtered.forEach((c) => {
      if (c.group !== lastGroup) {
        html += `<p class="hc-cmd-group">${c.group}</p>`;
        lastGroup = c.group;
      }
      html +=
        `<a href="${c.href}" class="hc-cmd-item ${c.c}${idx === 0 ? ' is-active' : ''}" data-idx="${idx}">` +
        `<span class="hc-cmd-ico"><i class="${c.icon}"></i></span>` +
        `<span class="min-w-0 flex-1 text-sm font-semibold text-gray-900">${this.escapeHtml(c.label)}</span>` +
        `<i class="icon-corner-down-left text-xs text-gray-300"></i></a>`;
      idx++;
    });
    list.innerHTML = html;
  }

  private commandItems(): HTMLElement[] {
    return Array.from(this.document.querySelectorAll('#hc-cmd-list .hc-cmd-item'));
  }

  private setActiveCommand(i: number): void {
    const items = this.commandItems();
    if (!items.length) return;
    this.cmdActive = ((i % items.length) + items.length) % items.length;
    items.forEach((el, n) => el.classList.toggle('is-active', n === this.cmdActive));
    items[this.cmdActive].scrollIntoView({ block: 'nearest' });
  }

  private openCommandPalette(): void {
    const box = this.byId('hc-cmd') as HTMLElement | null;
    if (!box) return;
    this.renderCommands('');
    box.hidden = false;
    const input = this.byId('hc-cmd-input') as HTMLInputElement | null;
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 30);
    }
  }

  private closeCommandPalette(): void {
    const box = this.byId('hc-cmd') as HTMLElement | null;
    if (box) box.hidden = true;
  }

  /* ---------------- Global search ---------------- */

  private recentSearches(): string[] {
    try {
      return JSON.parse(localStorage.getItem('hc-recent') || '[]');
    } catch {
      return [];
    }
  }

  private pushRecentSearch(term: string): void {
    if (!term) return;
    const r = this.recentSearches().filter((x) => x.toLowerCase() !== term.toLowerCase());
    r.unshift(term);
    localStorage.setItem('hc-recent', JSON.stringify(r.slice(0, 5)));
  }

  private renderRecentSearches(): void {
    const wrap = this.byId('hc-recent');
    if (!wrap) return;
    const r = this.recentSearches();
    wrap.innerHTML = r.length
      ? r
          .map(
            (t) =>
              `<button type="button" class="hc-dock-item hc-c-primary w-full text-left" data-recent="${this.escapeHtml(t)}"><span class="grid size-8 place-items-center rounded-lg bg-gray-100 text-gray-400 dark:bg-slate-700"><i class="icon-clock text-sm"></i></span><span class="text-xs font-semibold text-gray-700 dark:text-gray-200">${this.escapeHtml(t)}</span></button>`
          )
          .join('')
      : '<p class="px-2 py-1 text-[11px] text-gray-400">No recent searches yet.</p>';
  }

  private openSearch(): void {
    const search = this.byId('hc-search');
    const panel = this.byId('hc-search-panel') as HTMLElement | null;
    if (panel) {
      this.renderRecentSearches();
      panel.hidden = false;
      search?.classList.add('is-open');
    }
  }

  private closeSearch(): void {
    const search = this.byId('hc-search');
    const panel = this.byId('hc-search-panel') as HTMLElement | null;
    if (panel) {
      panel.hidden = true;
      search?.classList.remove('is-open');
    }
  }

  /* ---------------- Notification tabs ---------------- */

  private setupNotifications(): void {
    const markRead = this.byId('hc-noti-mark-read');
    const count = this.byId('hc-noti-count') as HTMLElement | null;
    if (markRead && count) {
      markRead.addEventListener('click', () => {
        count.hidden = true;
      });
    }
    const tabs = this.byId('hc-noti-tabs');
    if (!tabs) return;
    const items = () => Array.from(this.document.querySelectorAll<HTMLElement>('#all-notifications .hc-noti'));
    tabs.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const t = target.closest('[data-noti-tab]') as HTMLElement | null;
      if (!t) return;
      tabs.querySelectorAll('.hc-noti-tab').forEach((x) => x.classList.toggle('is-active', x === t));
      const tab = t.dataset['notiTab'];
      let shown = 0;
      items().forEach((it) => {
        const ok = tab === 'all' || it.dataset['notiCat'] === tab;
        it.hidden = !ok;
        if (ok) shown++;
      });
      const empty = this.byId('hc-noti-empty');
      empty?.classList.toggle('hidden', shown > 0);
    });
  }

  /* ---------------- Activity drawer ---------------- */

  private openActivityDrawer(): void {
    const d = this.byId('hc-activity') as HTMLElement | null;
    if (d) d.hidden = false;
  }

  private closeActivityDrawer(): void {
    const d = this.byId('hc-activity') as HTMLElement | null;
    if (d) d.hidden = true;
  }

  /* ---------------- Workspace label persistence ---------------- */

  private setupWorkspace(): void {
    const saved = localStorage.getItem('hc-workspace');
    if (saved) {
      try {
        const w = JSON.parse(saved);
        const name = this.byId('hc-ws-name');
        const icon = this.byId('hc-ws-icon');
        if (name) name.textContent = w.name;
        if (icon) icon.className = w.icon;
      } catch {
        /* ignore malformed data */
      }
    }
    this.document.querySelectorAll('[data-ws]').forEach((a) =>
      a.addEventListener('click', () => {
        const el = a as HTMLElement;
        localStorage.setItem('hc-workspace', JSON.stringify({ name: el.dataset['ws'], icon: el.dataset['wsIcon'] }));
      })
    );
  }

  /* ---------------- Scroll condense ---------------- */

  private setupScroll(): void {
    const bar = this.document.querySelector('.hc-bar');
    if (!bar) return;
    const scroller: Element | Window =
      this.document.querySelector('main.hms-scope, main.overflow-y-auto, main') || window;
    const onScroll = () => {
      const y = scroller === window ? window.scrollY : (scroller as Element).scrollTop;
      bar.classList.toggle('hc-scrolled', y > 8);
    };
    scroller.addEventListener('scroll', onScroll, { passive: true } as AddEventListenerOptions);
    onScroll();
  }
}
