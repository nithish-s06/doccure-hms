import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-email-view',
  styleUrl: './email-view.css',
  templateUrl: './email-view.html',
})
export class EmailView {
  AllRoutes = All_Routes;
}
