import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-session-expired',
  styleUrl: './session-expired.css',
  templateUrl: './session-expired.html',
})
export class SessionExpired {
  AllRoutes = All_Routes;
}
