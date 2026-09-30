import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-reimbursement-detail',
  styleUrl: './reimbursement-detail.css',
  templateUrl: './reimbursement-detail.html',
})
export class ReimbursementDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('rmd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('rmd-download-btn')?.addEventListener('click', () => this.toastService.show('Reimbursement receipt download started.', 'info'));
  }
}
