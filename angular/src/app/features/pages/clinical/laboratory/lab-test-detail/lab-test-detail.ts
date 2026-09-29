import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-lab-test-detail',
  styleUrl: './lab-test-detail.css',
  templateUrl: './lab-test-detail.html',
})
export class LabTestDetail {
  AllRoutes = All_Routes;
}
