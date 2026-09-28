import { Component } from '@angular/core';
import { Datepicker } from '../../../../../shared/datepicker/datepicker';

@Component({
  selector: 'app-notes',
  imports: [Datepicker],
  templateUrl: './notes.html',
  styleUrl: './notes.css',
})
export class Notes {}
