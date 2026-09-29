import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-specialization-detail',
  styleUrl: './specialization-detail.css',
  templateUrl: './specialization-detail.html',
})
export class SpecializationDetail {
  AllRoutes = All_Routes;
}
