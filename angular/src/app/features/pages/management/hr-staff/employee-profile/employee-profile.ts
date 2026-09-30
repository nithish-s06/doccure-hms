import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-employee-profile',
  styleUrl: './employee-profile.css',
  templateUrl: './employee-profile.html',
})
export class EmployeeProfile implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('emp-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('emp-msg')?.addEventListener('click', () => this.toastService.show('Message dialog opened.', 'info'));
    ['emp-dl-0', 'emp-dl-1', 'emp-dl-2', 'emp-dl-3'].forEach((id) =>
      this.document.getElementById(id)?.addEventListener('click', () => this.toastService.show('Downloading document...', 'info'))
    );
    const hs = (this.document.defaultView as any)?.HSStaticMethods;
    if (hs) hs.autoInit();
  }
}
