import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-lab-test-results',
  styleUrl: './lab-test-results.css',
  templateUrl: './lab-test-results.html',
})
export class LabTestResults {
  AllRoutes = All_Routes;
}
