import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-insurance-claim-detail',
  styleUrl: './insurance-claim-detail.css',
  templateUrl: './insurance-claim-detail.html',
})
export class InsuranceClaimDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('icd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('icd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
