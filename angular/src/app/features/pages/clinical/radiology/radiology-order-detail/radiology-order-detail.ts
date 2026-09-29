import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-radiology-order-detail',
  styleUrl: './radiology-order-detail.css',
  templateUrl: './radiology-order-detail.html',
})
export class RadiologyOrderDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('rod-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('rod-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
