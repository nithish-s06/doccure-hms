import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  selector: 'app-email-compose',
  imports: [RouterLink],
  templateUrl: './email-compose.html',
  styleUrl: './email-compose.css',
})
export class EmailCompose {
  AllRoutes = All_Routes;
}
