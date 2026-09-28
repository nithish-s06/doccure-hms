import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  selector: 'app-email',
  imports: [RouterLink],
  templateUrl: './email.html',
  styleUrl: './email.css',
})
export class Email {
  AllRoutes = All_Routes; 
}
