import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-pharmacy-purchase-order-detail',
  styleUrl: './pharmacy-purchase-order-detail.css',
  templateUrl: './pharmacy-purchase-order-detail.html',
})
export class PharmacyPurchaseOrderDetail {
  AllRoutes = All_Routes;
}
