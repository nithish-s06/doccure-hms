import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-telemedicine-session-detail',
  styleUrl: './telemedicine-session-detail.css',
  templateUrl: './telemedicine-session-detail.html',
})
export class TelemedicineSessionDetail {
  AllRoutes = All_Routes;
}
