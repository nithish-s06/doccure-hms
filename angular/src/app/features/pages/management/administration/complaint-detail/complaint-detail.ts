import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-complaint-detail',
  styleUrl: './complaint-detail.css',
  templateUrl: './complaint-detail.html',
})
export class ComplaintDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('cpd-print')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
