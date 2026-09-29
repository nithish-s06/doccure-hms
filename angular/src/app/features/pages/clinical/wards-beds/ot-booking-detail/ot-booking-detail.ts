import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-ot-booking-detail',
  styleUrl: './ot-booking-detail.css',
  templateUrl: './ot-booking-detail.html',
})
export class OtBookingDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('obd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('obd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
