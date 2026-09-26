import { Component } from '@angular/core';
import { All_Routes } from '../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-lock-screen',
  styleUrl: './lock-screen.css',
  templateUrl: './lock-screen.html',
})
export class LockScreen {
  AllRoutes = All_Routes;
}
