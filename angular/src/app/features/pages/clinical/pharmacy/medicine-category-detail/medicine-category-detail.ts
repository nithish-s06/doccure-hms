import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-medicine-category-detail',
  styleUrl: './medicine-category-detail.css',
  templateUrl: './medicine-category-detail.html',
})
export class MedicineCategoryDetail {
  AllRoutes = All_Routes;
}
