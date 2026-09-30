import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-scan-requests',
  styleUrl: './scan-requests.css',
  templateUrl: './scan-requests.html',
})
export class ScanRequests {
  AllRoutes = All_Routes;
}
