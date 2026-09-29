import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-sample-tracking',
  styleUrl: './sample-tracking.css',
  templateUrl: './sample-tracking.html',
})
export class SampleTracking {
  AllRoutes = All_Routes;
}
