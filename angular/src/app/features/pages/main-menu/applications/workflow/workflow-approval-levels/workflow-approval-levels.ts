import { Component } from '@angular/core';
import { WorkflowModal } from '../workflow-modal/workflow-modal';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../../core/helpers/routes';

@Component({
  selector: 'app-workflow-approval-levels',
  imports: [WorkflowModal,RouterLink],
  templateUrl: './workflow-approval-levels.html',
  styleUrl: './workflow-approval-levels.css',
})
export class WorkflowApprovalLevels {
  AllRoutes = All_Routes;
}
