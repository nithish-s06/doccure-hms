import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-inventory-detail',
  styleUrl: './pharmacy-inventory-detail.css',
  templateUrl: './pharmacy-inventory-detail.html',
})
export class PharmacyInventoryDetail {
  AllRoutes = All_Routes;
}
