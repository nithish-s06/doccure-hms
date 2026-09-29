import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-cancelled-appointments',
  styleUrl: './cancelled-appointments.css',
  templateUrl: './cancelled-appointments.html',
})
export class CancelledAppointments {
  AllRoutes = All_Routes;
}
