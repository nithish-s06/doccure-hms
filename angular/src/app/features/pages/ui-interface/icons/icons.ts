import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Breadcrumb } from '../../../../shared/breadcrumb/breadcrumb';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-icons',
  imports: [Breadcrumb,RouterModule],
  templateUrl: './icons.html',
  styleUrl: './icons.css',
})
export class Icons {
    constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.renderer.listen(this.el.nativeElement, 'click', (e: any) => {

      const btn = e.target.closest('[data-toggle="code"]');
      if (!btn) return;

      const card = btn.closest('.preview-card');
      const preview = card?.querySelector('.preview-content');
      const code = card?.querySelector('.code');
      const text = btn.querySelector('.code-btn');

      if (!preview || !code || !text) return;

      // Toggle classes
      preview.classList.toggle('hidden');
      code.classList.toggle('hidden');

      // Toggle text
      text.textContent =
        text.textContent.trim() === 'Show Code'
          ? 'Show Preview'
          : 'Show Code';
    });
     this.renderer.listen(this.el.nativeElement, 'click', (e: Event) => {
      const target = e.target as HTMLElement;

      const copyBtn = target.closest('[data-copy]') as HTMLElement;
      if (!copyBtn) return;

      const pre = copyBtn.closest('pre');
      const code = pre?.querySelector('code') as HTMLElement;
      if (!code) return;

      const text = code.innerText;

      navigator.clipboard.writeText(text).then(() => {
        const span = copyBtn.querySelector('span');
        if (!span) return;

        const oldText = span.textContent;
        span.textContent = 'Copied!';

        setTimeout(() => {
          span.textContent = oldText;
        }, 1500);
      });
    });
  }
}
