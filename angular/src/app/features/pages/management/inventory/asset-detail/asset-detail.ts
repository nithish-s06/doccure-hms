import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../../../core/services/toast/toast.service';

@Component({
  imports: [RouterLink],
  selector: 'app-asset-detail',
  styleUrl: './asset-detail.css',
  templateUrl: './asset-detail.html',
})
export class AssetDetail implements AfterViewInit {
  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.document.getElementById('asd-print')?.addEventListener('click', () => this.document.defaultView?.print());
    this.document.getElementById('asd-print-2')?.addEventListener('click', () => this.document.defaultView?.print());
  }
}
