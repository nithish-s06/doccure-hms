import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[data-dropdown]',
  standalone: true,
})
export class DropdownTriggerDirective {
  @Input('data-dropdown') menuId!: string;

  private closeAllMenus(): void {
    document.querySelectorAll('.dropdown-menu.open, .dropup-menu.open').forEach((menu) => {
      menu.classList.remove('open');
    });
  }

  @HostListener('click', ['$event'])
  onTriggerClick(event: MouseEvent): void {
    event.stopPropagation();
    const menu = document.getElementById(this.menuId);
    if (!menu) return;
    const wasOpen = menu.classList.contains('open');
    this.closeAllMenus();
    if (!wasOpen) menu.classList.add('open');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) this.closeAllMenus();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAllMenus();
  }
}
