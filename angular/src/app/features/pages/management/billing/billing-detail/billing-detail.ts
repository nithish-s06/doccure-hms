import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-billing-detail',
  styleUrl: './billing-detail.css',
  templateUrl: './billing-detail.html',
})
export class BillingDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('bld-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('bld-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('bld-download')?.addEventListener('click', () => this.toastService.show('Downloading invoice PDF.', 'info'));
    this.document.getElementById('bld-download-2')?.addEventListener('click', () => this.toastService.show('Downloading invoice PDF.', 'info'));
  }
}
