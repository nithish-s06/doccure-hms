import { DOCUMENT, Injectable, Inject } from '@angular/core';

interface SidebarIndexItem {
  href: string;
  label: string;
  accent: string;
  icon?: string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "Sidebar enhancements —
 * workspace switcher, search, favorites, recents".
 *
 * Drives the enterprise navigation workspace block in sidebar.html
 * (#sb-ws, #sb-search-input, #sb-favorites, #sb-recent).
 */
@Injectable({
  providedIn: 'root',
})
export class SidebarEnhancementsService {
  private initialized = false;
  private index: SidebarIndexItem[] = [];

  private readonly defaultFavorites: SidebarIndexItem[] = [
    { href: '/patients', label: 'All Patients', accent: 'sky', icon: 'icon-user' },
    { href: '/appointments', label: 'Appointments', accent: 'violet', icon: 'icon-calendar-check' },
    { href: '/emergency', label: 'Emergency', accent: 'rose', icon: 'icon-siren' },
    { href: '/billing', label: 'Billing', accent: 'gold', icon: 'icon-receipt' },
    { href: '/laboratory', label: 'Laboratory', accent: 'cyan', icon: 'icon-flask-conical' },
  ];

  constructor(@Inject(DOCUMENT) private document: Document) {}

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    this.buildIndex();
    this.recordVisit();
    this.renderFavorites();
    this.renderRecent();
    this.setupWorkspace();

    const input = this.byId('sb-search-input') as HTMLInputElement | null;
    if (input) {
      input.addEventListener('input', () => this.renderResults(input.value));
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          input.value = '';
          this.renderResults('');
          input.blur();
        }
      });
    }

    const enh = this.document.querySelector('.sidebar-inner');
    enh?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const star = target.closest('[data-fav]') as HTMLElement | null;
      if (!star) return;
      e.preventDefault();
      this.toggleFavorite({
        href: star.dataset['fav'] || '',
        label: star.dataset['label'] || '',
        accent: star.dataset['accent'] || 'primary',
      });
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const active = this.document.activeElement as HTMLElement | null;
      const tag = active?.tagName || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || active?.isContentEditable) return;
      if (input) {
        e.preventDefault();
        input.focus();
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

  private getStore<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  private setStore<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }

  private accentFor(link: Element): string {
    let node: Element | null = link.parentElement;
    while (node && !node.classList.contains('sidebar-menu')) {
      if (node.tagName === 'LI' && node.classList.contains('submenu')) {
        const a = node.querySelector(':scope > a[data-accent]');
        if (a) return a.getAttribute('data-accent') || 'primary';
      }
      node = node.parentElement;
    }
    return 'primary';
  }

  private buildIndex(): void {
    const seen = new Set<string>();
    this.index = [];
    this.document.querySelectorAll('#sidebar-menu a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || href === 'javascript:void(0);' || seen.has(href)) return;
      seen.add(href);
      const span = a.querySelector('span');
      const label = (span ? span.textContent : a.textContent)?.trim();
      if (label) this.index.push({ href, label, accent: this.accentFor(a) });
    });
  }

  private favorites(): SidebarIndexItem[] {
    let favs = this.getStore<SidebarIndexItem[] | null>('sb-favorites', null);
    if (favs === null) {
      favs = this.defaultFavorites.slice();
      this.setStore('sb-favorites', favs);
    }
    return favs;
  }

  private isFavorite(href: string): boolean {
    return this.favorites().some((x) => x.href === href);
  }

  private toggleFavorite(item: SidebarIndexItem): void {
    let favs = this.favorites();
    if (favs.some((x) => x.href === item.href)) {
      favs = favs.filter((x) => x.href !== item.href);
    } else {
      favs.unshift({ href: item.href, label: item.label, accent: item.accent || 'primary', icon: item.icon || 'icon-star' });
    }
    this.setStore('sb-favorites', favs.slice(0, 8));
    this.renderFavorites();
    this.renderRecent();
    const input = this.byId('sb-search-input') as HTMLInputElement | null;
    this.renderResults(input ? input.value : '');
  }

  private rowHtml(item: SidebarIndexItem, icon?: string): string {
    const fav = this.isFavorite(item.href);
    return (
      `<div class="flex items-center" data-accent="${this.escapeHtml(item.accent || 'primary')}">` +
      `<a href="${this.escapeHtml(item.href)}" class="sb-row min-w-0 flex-1"><span class="sb-row-ico"><i class="${item.icon || icon || 'icon-file-text'}"></i></span>` +
      `<span class="truncate">${this.escapeHtml(item.label)}</span></a>` +
      `<button type="button" class="sb-star ${fav ? 'is-fav' : ''}" data-fav="${this.escapeHtml(item.href)}" data-label="${this.escapeHtml(item.label)}" data-accent="${this.escapeHtml(item.accent || 'primary')}" aria-label="Toggle favorite"><i class="icon-star text-xs"></i></button>` +
      `</div>`
    );
  }

  private renderFavorites(): void {
    const wrap = this.byId('sb-favorites');
    if (!wrap) return;
    const favs = this.favorites();
    const count = this.byId('sb-fav-count');
    if (count) count.textContent = String(favs.length);
    wrap.innerHTML = favs.length
      ? favs.map((it) => this.rowHtml(it)).join('')
      : '<p class="sb-empty">Star pages to pin them here.</p>';
  }

  private recents(): SidebarIndexItem[] {
    return this.getStore<SidebarIndexItem[]>('sb-recent', []);
  }

  private recordVisit(): void {
    const page = this.document.location.pathname;
    const hit = this.index.find((x) => x.href === page);
    if (!hit) return;
    let recent = this.recents().filter((x) => x.href !== page);
    recent.unshift(hit);
    this.setStore('sb-recent', recent.slice(0, 5));
  }

  private renderRecent(): void {
    const wrap = this.byId('sb-recent');
    if (!wrap) return;
    const recent = this.recents();
    wrap.innerHTML = recent.length
      ? recent.map((it) => this.rowHtml(it, 'icon-history')).join('')
      : '<p class="sb-empty">Pages you open appear here.</p>';
  }

  private renderResults(query: string): void {
    const box = this.byId('sb-results');
    if (!box) return;
    const q = (query || '').trim();
    if (!q) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    const rx = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    const matches = this.index.filter((x) => x.label.toLowerCase().includes(q.toLowerCase())).slice(0, 12);
    box.hidden = false;
    box.innerHTML = matches.length
      ? matches
          .map(
            (m) =>
              `<a href="${this.escapeHtml(m.href)}" class="sb-result" data-accent="${this.escapeHtml(m.accent)}">` +
              `<span class="sb-row-ico !size-6 !text-[11px]"><i class="icon-corner-down-right"></i></span>` +
              `<span class="truncate">${this.escapeHtml(m.label).replace(rx, '<mark>$1</mark>')}</span>` +
              `<span class="sb-result-path">${this.escapeHtml(m.href)}</span></a>`
          )
          .join('')
      : `<p class="sb-empty">No pages match "${this.escapeHtml(q)}".</p>`;
  }

  private setupWorkspace(): void {
    const card = this.byId('sb-ws');
    const toggle = this.byId('sb-ws-toggle');
    const panel = this.byId('sb-ws-panel') as HTMLElement | null;
    if (!card || !toggle || !panel) return;

    const saved = this.getStore<{ name: string; icon: string; accent?: string } | null>('sb-workspace', null);
    if (saved) {
      const name = this.byId('sb-ws-name');
      const icon = this.byId('sb-ws-ico');
      if (name) name.textContent = saved.name;
      if (icon) icon.innerHTML = `<i class="${saved.icon}"></i>`;
      if (saved.accent) card.setAttribute('data-accent', saved.accent);
      panel.querySelectorAll('[data-ws]').forEach((a) => a.classList.toggle('is-active', (a as HTMLElement).dataset['ws'] === saved.name));
    }

    toggle.addEventListener('click', () => {
      const open = !!panel.hidden;
      panel.hidden = !open;
      card.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    panel.querySelectorAll('[data-ws]').forEach((a) =>
      a.addEventListener('click', () => {
        const el = a as HTMLElement;
        this.setStore('sb-workspace', {
          name: el.dataset['ws'],
          icon: el.dataset['wsIcon'],
          accent: el.getAttribute('data-accent'),
        });
      })
    );
  }
}
