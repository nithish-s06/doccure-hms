import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-insurance-approval-detail',
  styleUrl: './insurance-approval-detail.css',
  templateUrl: './insurance-approval-detail.html',
})
export class InsuranceApprovalDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('iad-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('iad-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('iad-download')?.addEventListener('click', () => this.toastService.show('Approval PDF download started.', 'info'));
    this.document.getElementById('iad-download-2')?.addEventListener('click', () => this.toastService.show('Approval PDF download started.', 'info'));
  }
}
