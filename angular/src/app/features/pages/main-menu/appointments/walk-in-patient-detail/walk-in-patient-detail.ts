import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-walk-in-patient-detail',
  styleUrl: './walk-in-patient-detail.css',
  templateUrl: './walk-in-patient-detail.html',
})
export class WalkInPatientDetail {
  AllRoutes = All_Routes;
}
