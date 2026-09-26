import { Component } from '@angular/core';
import { All_Routes } from '../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  AllRoutes = All_Routes;
}
