import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-lab-test-requests',
  styleUrl: './lab-test-requests.css',
  templateUrl: './lab-test-requests.html',
})
export class LabTestRequests {
  AllRoutes = All_Routes;
}
