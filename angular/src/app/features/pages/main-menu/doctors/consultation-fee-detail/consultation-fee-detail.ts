import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-consultation-fee-detail',
  styleUrl: './consultation-fee-detail.css',
  templateUrl: './consultation-fee-detail.html',
})
export class ConsultationFeeDetail {
  AllRoutes = All_Routes;
}
