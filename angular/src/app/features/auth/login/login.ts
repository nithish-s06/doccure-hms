import { Component } from '@angular/core';
import { All_Routes } from '../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  AllRoutes = All_Routes;
}
