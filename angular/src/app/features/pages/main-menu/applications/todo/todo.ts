import { Component } from '@angular/core';
import { Daterangepicker } from '../../../../../shared/daterangepicker/daterangepicker';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-todo',
  imports: [Daterangepicker,Datepicker,RouterLink],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  AllRoutes = All_Routes;
}
