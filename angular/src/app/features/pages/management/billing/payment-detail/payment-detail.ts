import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-payment-detail',
  styleUrl: './payment-detail.css',
  templateUrl: './payment-detail.html',
})
export class PaymentDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('pmd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('pmd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
