import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-triage-detail',
  styleUrl: './triage-detail.css',
  templateUrl: './triage-detail.html',
})
export class TriageDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('tgd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('tgd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('tgd-reassess')?.addEventListener('click', () => this.toastService.show('Reassessment scheduled.', 'success'));
  }
}
