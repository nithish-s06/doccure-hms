import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-doctor-availability-detail',
  styleUrl: './doctor-availability-detail.css',
  templateUrl: './doctor-availability-detail.html',
})
export class DoctorAvailabilityDetail {
  AllRoutes = All_Routes;
}
