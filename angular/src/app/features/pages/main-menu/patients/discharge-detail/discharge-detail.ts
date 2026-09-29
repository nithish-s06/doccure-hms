import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-discharge-detail',
  styleUrl: './discharge-detail.css',
  templateUrl: './discharge-detail.html',
})
export class DischargeDetail {
  AllRoutes = All_Routes;
}
