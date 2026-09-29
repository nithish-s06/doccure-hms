import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-blood-issue-detail',
  styleUrl: './blood-issue-detail.css',
  templateUrl: './blood-issue-detail.html',
})
export class BloodIssueDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit(): void {
    this.document.getElementById('bid-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('bid-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
