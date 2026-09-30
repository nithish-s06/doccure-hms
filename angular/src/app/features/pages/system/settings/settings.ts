import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('st-skeleton')?.classList.add('hidden');
    this.document.getElementById('st-content')?.classList.remove('hidden');

    this.document.addEventListener('click', (e: Event) => this.onClick(e));
  }

  private toast(msg: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(msg, tone);
  }

  private markDirty(): void {
    const dot = this.document.getElementById('st-dirtydot');
    const txt = this.document.getElementById('st-dirtytxt');
    dot?.classList.replace('bg-emerald-500', 'bg-amber-500');
    if (txt) txt.textContent = 'Unsaved changes';
  }

  private markSaved(): void {
    const dot = this.document.getElementById('st-dirtydot');
    const txt = this.document.getElementById('st-dirtytxt');
    dot?.classList.replace('bg-amber-500', 'bg-emerald-500');
    if (txt) txt.textContent = 'All changes saved';
  }

  private onClick(e: Event): void {
    const target = e.target as HTMLElement;

    // Nav group collapse
    const grpToggle = target.closest('[data-grptoggle]');
    if (grpToggle) {
      grpToggle.closest('[data-grp]')?.classList.toggle('collapsed');
      return;
    }

    // Section nav
    const navBtn = target.closest('[data-nav]') as HTMLElement | null;
    if (navBtn) {
      const panel = navBtn.getAttribute('data-nav');
      this.document.querySelectorAll('.st-navlink').forEach((el) => el.classList.remove('active'));
      navBtn.classList.add('active');
      this.document.querySelectorAll('.st-panel').forEach((el) => el.classList.remove('active'));
      this.document.querySelector(`.st-panel[data-panel="${panel}"]`)?.classList.add('active');
      return;
    }

    // Save
    if (target.closest('[data-save]')) {
      this.markSaved();
      const lastUpd = this.document.getElementById('st-lastupd');
      if (lastUpd) lastUpd.textContent = 'Just now';
      this.toast('Settings saved successfully.', 'success');
      return;
    }

    // Restore defaults
    if (target.closest('[data-act="restore"]')) {
      this.markDirty();
      this.toast('Defaults restored. Review and save to apply.', 'info');
      return;
    }

    // Modal triggers (no modal implemented yet)
    const modalBtn = target.closest('[data-modal]') as HTMLElement | null;
    if (modalBtn) {
      const name = modalBtn.getAttribute('data-modal');
      this.toast(`${this.titleCase(name || '')} dialog opened.`, 'info');
      return;
    }

    // Theme mode segmented control
    const modeBtn = target.closest('#st-thememode [data-mode]') as HTMLElement | null;
    if (modeBtn) {
      modeBtn.parentElement?.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
      modeBtn.classList.add('on');
      this.markDirty();
      this.toast(`Theme mode set to ${modeBtn.getAttribute('data-mode')}.`, 'success');
      return;
    }

    // Accent color swatch
    const swatch = target.closest('[data-accent]') as HTMLElement | null;
    if (swatch) {
      this.document.querySelectorAll('#st-accents .st-sw').forEach((b) => b.classList.remove('on'));
      swatch.classList.add('on');
      const color = swatch.getAttribute('data-accent');
      if (color) this.document.documentElement.style.setProperty('--st-c', color);
      this.markDirty();
      this.toast('Accent color updated.', 'success');
      return;
    }

    // Generic segmented option buttons (sidebar style, header style, radius, density, font, animation, shadow, time format)
    const segBtn = target.closest('[data-opt] button') as HTMLElement | null;
    if (segBtn) {
      segBtn.parentElement?.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
      segBtn.classList.add('on');
      this.markDirty();
      this.toast('Preference updated.', 'success');
      return;
    }

    // Generic on/off toggles (glass, notifications, security, backup)
    const toggle = target.closest('.st-tg') as HTMLElement | null;
    if (toggle) {
      toggle.classList.toggle('on');
      this.markDirty();
      this.toast(toggle.classList.contains('on') ? 'Enabled.' : 'Disabled.', 'success');
      return;
    }

    // Role permission matrix grant cell
    const grantBtn = target.closest('[data-grant]') as HTMLElement | null;
    if (grantBtn) {
      const granted = grantBtn.classList.contains('bg-[var(--st-c)]');
      grantBtn.classList.toggle('bg-[var(--st-c)]', !granted);
      grantBtn.classList.toggle('text-white', !granted);
      grantBtn.classList.toggle('bg-gray-100', granted);
      grantBtn.classList.toggle('dark:bg-slate-800', granted);
      grantBtn.classList.toggle('text-gray-300', granted);
      const icon = grantBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('ti-check', !granted);
        icon.classList.toggle('ti-minus', granted);
      }
      this.markDirty();
      this.toast('Permission updated.', 'success');
      return;
    }

    // Integration connect / disconnect
    const intBtn = target.closest('[data-intoggle]') as HTMLElement | null;
    if (intBtn) {
      const card = intBtn.closest('.st-int');
      const badge = card?.querySelector('.st-b');
      const connecting = intBtn.textContent?.trim() === 'Connect';
      intBtn.textContent = connecting ? 'Disconnect' : 'Connect';
      intBtn.classList.toggle('bg-[var(--st-c)]', !connecting);
      intBtn.classList.toggle('text-white', !connecting);
      intBtn.classList.toggle('border', connecting);
      intBtn.classList.toggle('st-hairline', connecting);
      if (badge) {
        badge.textContent = connecting ? 'Connected' : 'Not connected';
        badge.classList.toggle('st-b-ok', connecting);
        badge.classList.toggle('st-b-warn', !connecting);
      }
      this.toast(connecting ? 'Integration connected.' : 'Integration disconnected.', connecting ? 'success' : 'info');
      return;
    }

    // Department edit / delete
    if (target.closest('[data-editdept]')) {
      this.toast('Department editor opened.', 'info');
      return;
    }
    if (target.closest('[data-deldept]')) {
      this.toast('Department removed.', 'success');
      return;
    }
  }

  private titleCase(s: string): string {
    return s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  }
}
