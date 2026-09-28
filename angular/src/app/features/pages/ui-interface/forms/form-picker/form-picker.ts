import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { Daterangepicker } from '../../../../../shared/daterangepicker/daterangepicker';
@Component({
  selector: 'app-form-picker',
  imports: [DatePickerModule, FormsModule,Daterangepicker],
  templateUrl: './form-picker.html',
  styleUrl: './form-picker.css',
})
export class FormPicker {
  date: Date | undefined;
  datetime12h: Date[] | undefined;
  datetime24h: Date[] | undefined;
  time: Date[] | undefined;
}
