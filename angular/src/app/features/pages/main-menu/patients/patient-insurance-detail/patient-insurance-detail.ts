import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-patient-insurance-detail',
  styleUrl: './patient-insurance-detail.css',
  templateUrl: './patient-insurance-detail.html',
})
export class PatientInsuranceDetail {
  AllRoutes = All_Routes;
}
