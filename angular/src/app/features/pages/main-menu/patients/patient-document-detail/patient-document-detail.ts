import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-patient-document-detail',
  styleUrl: './patient-document-detail.css',
  templateUrl: './patient-document-detail.html',
})
export class PatientDocumentDetail {
  AllRoutes = All_Routes;
}
