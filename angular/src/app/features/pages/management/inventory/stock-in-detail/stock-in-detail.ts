import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-stock-in-detail',
  styleUrl: './stock-in-detail.css',
  templateUrl: './stock-in-detail.html',
})
export class StockInDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('sid-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('sid-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('sid-download-btn')?.addEventListener('click', () => this.toastService.show('Downloading receipt PDF.', 'info'));
    this.document.getElementById('sid-download-btn-2')?.addEventListener('click', () => this.toastService.show('Downloading receipt PDF.', 'info'));
  }
}
