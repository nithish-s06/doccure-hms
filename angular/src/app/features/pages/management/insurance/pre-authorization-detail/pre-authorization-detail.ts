import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-pre-authorization-detail',
  styleUrl: './pre-authorization-detail.css',
  templateUrl: './pre-authorization-detail.html',
})
export class PreAuthorizationDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('pad-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('pad-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('pad-download-btn')?.addEventListener('click', () => this.toastService.show('Authorization PDF download started.', 'info'));
    this.document.getElementById('pad-side-download')?.addEventListener('click', () => this.toastService.show('Authorization PDF download started.', 'info'));
  }
}
