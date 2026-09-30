import { Component } from '@angular/core';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-medical-record-detail',
  styleUrl: './medical-record-detail.css',
  templateUrl: './medical-record-detail.html',
})
export class MedicalRecordDetail {
  AllRoutes = All_Routes;
}
