import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-account-detail',
  styleUrl: './account-detail.css',
  templateUrl: './account-detail.html',
})
export class AccountDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('acd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('acd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('acd-download')?.addEventListener('click', () => this.toastService.show('Statement download started.', 'info'));
    this.document.getElementById('acd-download-2')?.addEventListener('click', () => this.toastService.show('Statement download started.', 'info'));
  }
}
