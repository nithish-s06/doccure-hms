import { Component } from '@angular/core';
import { WorkflowModal } from '../workflow-modal/workflow-modal';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../../core/helpers/routes';

@Component({
  selector: 'app-workflow-approvals',
  imports: [WorkflowModal,RouterLink],
  templateUrl: './workflow-approvals.html',
  styleUrl: './workflow-approvals.css',
})
export class WorkflowApprovals {
  AllRoutes = All_Routes;
}
