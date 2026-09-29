import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-prescription-detail',
  styleUrl: './prescription-detail.css',
  templateUrl: './prescription-detail.html',
})
export class PrescriptionDetail {
  AllRoutes = All_Routes;
}
