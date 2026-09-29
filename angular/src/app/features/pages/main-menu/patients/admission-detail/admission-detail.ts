import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-admission-detail',
  styleUrl: './admission-detail.css',
  templateUrl: './admission-detail.html',
})
export class AdmissionDetail {
  AllRoutes = All_Routes;
}
