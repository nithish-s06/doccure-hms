import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-laboratory',
  styleUrl: './laboratory.css',
  templateUrl: './laboratory.html',
})
export class Laboratory {
  AllRoutes = All_Routes;
}
