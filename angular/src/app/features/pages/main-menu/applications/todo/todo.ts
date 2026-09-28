import { Component } from '@angular/core';
import { Daterangepicker } from '../../../../../shared/daterangepicker/daterangepicker';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';

@Component({
  selector: 'app-todo',
  imports: [Daterangepicker,Datepicker],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {}
