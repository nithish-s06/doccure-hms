import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-ambulance-vehicle-detail',
  styleUrl: './ambulance-vehicle-detail.css',
  templateUrl: './ambulance-vehicle-detail.html',
})
export class AmbulanceVehicleDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('avd-print')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
