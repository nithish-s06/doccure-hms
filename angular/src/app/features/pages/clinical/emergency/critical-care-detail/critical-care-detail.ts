import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-critical-care-detail',
  styleUrl: './critical-care-detail.css',
  templateUrl: './critical-care-detail.html',
})
export class CriticalCareDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('ccd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('ccd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
