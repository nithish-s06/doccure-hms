import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-radiology-report-detail',
  styleUrl: './radiology-report-detail.css',
  templateUrl: './radiology-report-detail.html',
})
export class RadiologyReportDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('rrd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('rrd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
