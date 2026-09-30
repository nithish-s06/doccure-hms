import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-emergency-call-detail',
  styleUrl: './emergency-call-detail.css',
  templateUrl: './emergency-call-detail.html',
})
export class EmergencyCallDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('ecd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('ecd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('ecd-callback-btn')?.addEventListener('click', () => this.toastService.show('Calling back the caller.', 'info'));
  }
}
