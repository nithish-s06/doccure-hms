import { Component } from '@angular/core';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notes',
  imports: [Datepicker,RouterLink],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class Notes {
  AllRoutes = All_Routes;
}
