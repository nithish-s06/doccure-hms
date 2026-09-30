import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-bank-account-detail',
  styleUrl: './bank-account-detail.css',
  templateUrl: './bank-account-detail.html',
})
export class BankAccountDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('bnd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('bnd-download')?.addEventListener('click', () => this.toastService.show('Statement download started.', 'info'));
  }
}
