import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-stock-out-detail',
  styleUrl: './stock-out-detail.css',
  templateUrl: './stock-out-detail.html',
})
export class StockOutDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('sod-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('sod-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('sod-download-btn')?.addEventListener('click', () => this.toastService.show('Downloading issue PDF.', 'info'));
    this.document.getElementById('sod-download-btn-2')?.addEventListener('click', () => this.toastService.show('Downloading issue PDF.', 'info'));
  }
}
