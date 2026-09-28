import { Component } from '@angular/core';
import { WorkflowModal } from '../workflow-modal/workflow-modal';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../../core/helpers/routes';
import { Daterangepicker } from '../../../../../../shared/daterangepicker/daterangepicker';

@Component({
  selector: 'app-workflow-requests',
  imports: [WorkflowModal,RouterLink,Daterangepicker],
  templateUrl: './workflow-requests.html',
  styleUrl: './workflow-requests.css',
})
export class WorkflowRequests {
  AllRoutes = All_Routes;
}
