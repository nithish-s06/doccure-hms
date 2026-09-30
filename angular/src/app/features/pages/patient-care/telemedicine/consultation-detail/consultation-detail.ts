import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-consultation-detail',
  styleUrl: './consultation-detail.css',
  templateUrl: './consultation-detail.html',
})
export class ConsultationDetail {
  AllRoutes = All_Routes;
}
