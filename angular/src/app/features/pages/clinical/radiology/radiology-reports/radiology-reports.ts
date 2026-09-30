import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-radiology-reports',
  styleUrl: './radiology-reports.css',
  templateUrl: './radiology-reports.html',
})
export class RadiologyReports {
  AllRoutes = All_Routes;
}
