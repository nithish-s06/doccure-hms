import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-sample-collection',
  styleUrl: './sample-collection.css',
  templateUrl: './sample-collection.html',
})
export class SampleCollection {
  AllRoutes = All_Routes;
}
