import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-expiry-item-detail',
  styleUrl: './expiry-item-detail.css',
  templateUrl: './expiry-item-detail.html',
})
export class ExpiryItemDetail {
  AllRoutes = All_Routes;
}
