import { Component } from '@angular/core';
import { All_Routes } from '../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-otp-verification',
  styleUrl: './otp-verification.css',
  templateUrl: './otp-verification.html',
})
export class OtpVerification {
  AllRoutes = All_Routes;
}
