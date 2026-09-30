import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-visitor-detail',
  styleUrl: './visitor-detail.css',
  templateUrl: './visitor-detail.html',
})
export class VisitorDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('vtd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('vtd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
