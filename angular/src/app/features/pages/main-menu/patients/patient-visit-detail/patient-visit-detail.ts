import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-patient-visit-detail',
  styleUrl: './patient-visit-detail.css',
  templateUrl: './patient-visit-detail.html',
})
export class PatientVisitDetail {
  AllRoutes = All_Routes;
}
