import { Component } from '@angular/core';
import { WorkflowModal } from '../workflow-modal/workflow-modal';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../../core/helpers/routes';
import { Daterangepicker } from '../../../../../../shared/daterangepicker/daterangepicker';

@Component({
  selector: 'app-workflow-actions',
  imports: [WorkflowModal,RouterLink,Daterangepicker],
  templateUrl: './workflow-actions.html',
  styleUrl: './workflow-actions.css',
})
export class WorkflowActions {
  AllRoutes = All_Routes;
}
