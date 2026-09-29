import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-sample-detail',
  styleUrl: './sample-detail.css',
  templateUrl: './sample-detail.html',
})
export class SampleDetail {
  AllRoutes = All_Routes;
}
