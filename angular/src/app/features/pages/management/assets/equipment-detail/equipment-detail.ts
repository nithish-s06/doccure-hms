import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-equipment-detail',
  styleUrl: './equipment-detail.css',
  templateUrl: './equipment-detail.html',
})
export class EquipmentDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('eqd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('eqd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
