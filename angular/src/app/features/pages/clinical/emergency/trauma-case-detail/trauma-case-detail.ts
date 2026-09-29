import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-trauma-case-detail',
  styleUrl: './trauma-case-detail.css',
  templateUrl: './trauma-case-detail.html',
})
export class TraumaCaseDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('tcd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('tcd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('tcd-update-status')?.addEventListener('click', () => this.toastService.show('Status update opened.', 'info'));
    this.document.getElementById('tcd-schedule-surgery')?.addEventListener('click', () => this.toastService.show('Surgery scheduling opened.', 'info'));
    this.document.getElementById('tcd-emergency-transfer')?.addEventListener('click', () => this.toastService.show('Emergency transfer initiated.', 'info'));
  }
}
