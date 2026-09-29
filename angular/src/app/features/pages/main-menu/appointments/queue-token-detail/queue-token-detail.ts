import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-queue-token-detail',
  styleUrl: './queue-token-detail.css',
  templateUrl: './queue-token-detail.html',
})
export class QueueTokenDetail {
  AllRoutes = All_Routes;
}
