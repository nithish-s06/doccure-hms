import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-product-detail',
  styleUrl: './product-detail.css',
  templateUrl: './product-detail.html',
})
export class ProductDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('prd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('prd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
