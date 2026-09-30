import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-insurance-detail',
  styleUrl: './insurance-detail.css',
  templateUrl: './insurance-detail.html',
})
export class InsuranceDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('isd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('isd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('isd-download')?.addEventListener('click', () => this.toastService.show('Claim PDF download started.', 'info'));
    this.document.getElementById('isd-download-2')?.addEventListener('click', () => this.toastService.show('Claim PDF download started.', 'info'));
  }
}
