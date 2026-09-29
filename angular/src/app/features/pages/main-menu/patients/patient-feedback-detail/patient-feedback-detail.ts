import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-patient-feedback-detail',
  styleUrl: './patient-feedback-detail.css',
  templateUrl: './patient-feedback-detail.html',
})
export class PatientFeedbackDetail {
  AllRoutes = All_Routes;
}
