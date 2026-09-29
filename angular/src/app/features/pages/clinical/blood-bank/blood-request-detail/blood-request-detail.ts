import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-blood-request-detail',
  styleUrl: './blood-request-detail.css',
  templateUrl: './blood-request-detail.html',
})
export class BloodRequestDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('bqd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('bqd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
