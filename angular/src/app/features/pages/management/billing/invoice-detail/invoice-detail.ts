import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-invoice-detail',
  styleUrl: './invoice-detail.css',
  templateUrl: './invoice-detail.html',
})
export class InvoiceDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('ivd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('ivd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
