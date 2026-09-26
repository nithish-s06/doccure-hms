import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-daterangepicker',
  imports: [DatePickerModule, FormsModule],
  templateUrl: './daterangepicker.html',
  styleUrl: './daterangepicker.css',
})
export class Daterangepicker {
  rangeDates: Date[] | undefined;
  constructor(){
    const today = new Date();

  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  this.rangeDates = [today, nextMonth];
  }
}
