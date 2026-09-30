import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-purchase-order-detail',
  styleUrl: './purchase-order-detail.css',
  templateUrl: './purchase-order-detail.html',
})
export class PurchaseOrderDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('pod-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('pod-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
