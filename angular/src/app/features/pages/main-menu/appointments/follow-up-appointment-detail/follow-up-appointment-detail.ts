import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-follow-up-appointment-detail',
  styleUrl: './follow-up-appointment-detail.css',
  templateUrl: './follow-up-appointment-detail.html',
})
export class FollowUpAppointmentDetail {
  AllRoutes = All_Routes;
}
