import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-patient-medical-history-detail',
  styleUrl: './patient-medical-history-detail.css',
  templateUrl: './patient-medical-history-detail.html',
})
export class PatientMedicalHistoryDetail {
  AllRoutes = All_Routes;
}
