import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-ambulance-trip-detail',
  styleUrl: './ambulance-trip-detail.css',
  templateUrl: './ambulance-trip-detail.html',
})
export class AmbulanceTripDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('atd-print')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
