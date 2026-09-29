import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-scan-request-detail',
  styleUrl: './scan-request-detail.css',
  templateUrl: './scan-request-detail.html',
})
export class ScanRequestDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('srd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('srd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
