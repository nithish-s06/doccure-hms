import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-sale-detail',
  styleUrl: './pharmacy-sale-detail.css',
  templateUrl: './pharmacy-sale-detail.html',
})
export class PharmacySaleDetail {
  AllRoutes = All_Routes;
}
