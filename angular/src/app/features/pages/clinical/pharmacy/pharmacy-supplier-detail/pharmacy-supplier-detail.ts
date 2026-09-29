import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-supplier-detail',
  styleUrl: './pharmacy-supplier-detail.css',
  templateUrl: './pharmacy-supplier-detail.html',
})
export class PharmacySupplierDetail {
  AllRoutes = All_Routes;
}
