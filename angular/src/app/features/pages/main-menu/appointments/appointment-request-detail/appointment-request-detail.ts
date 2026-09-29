import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-appointment-request-detail',
  styleUrl: './appointment-request-detail.css',
  templateUrl: './appointment-request-detail.html',
})
export class AppointmentRequestDetail {
  AllRoutes = All_Routes;
}
