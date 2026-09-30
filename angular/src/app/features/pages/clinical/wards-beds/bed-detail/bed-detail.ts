import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-bed-detail',
  styleUrl: './bed-detail.css',
  templateUrl: './bed-detail.html',
})
export class BedDetail {
  AllRoutes = All_Routes;
}
