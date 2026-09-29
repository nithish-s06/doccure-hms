import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-emergency-detail',
  styleUrl: './emergency-detail.css',
  templateUrl: './emergency-detail.html',
})
export class EmergencyDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('erd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('erd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
