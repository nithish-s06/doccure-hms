import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-datepicker',
  imports: [DatePicker,FormsModule],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.css',
})
export class Datepicker {
  date: Date | undefined=new Date();
}
