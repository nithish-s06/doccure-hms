import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-lab-test-result-detail',
  styleUrl: './lab-test-result-detail.css',
  templateUrl: './lab-test-result-detail.html',
})
export class LabTestResultDetail {
  AllRoutes = All_Routes;
}
