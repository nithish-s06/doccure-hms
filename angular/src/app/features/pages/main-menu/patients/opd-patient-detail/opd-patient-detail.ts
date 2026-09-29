import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-opd-patient-detail',
  styleUrl: './opd-patient-detail.css',
  templateUrl: './opd-patient-detail.html',
})
export class OpdPatientDetail {
  AllRoutes = All_Routes;
}
