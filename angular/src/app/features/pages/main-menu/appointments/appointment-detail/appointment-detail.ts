import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-appointment-detail',
  styleUrl: './appointment-detail.css',
  templateUrl: './appointment-detail.html',
})
export class AppointmentDetail {
  AllRoutes = All_Routes;
}
