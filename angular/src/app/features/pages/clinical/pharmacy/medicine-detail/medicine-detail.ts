import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-medicine-detail',
  styleUrl: './medicine-detail.css',
  templateUrl: './medicine-detail.html',
})
export class MedicineDetail {
  AllRoutes = All_Routes;
}
