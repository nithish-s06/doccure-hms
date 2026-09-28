import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowApprovalLevels } from './workflow-approval-levels';

describe('WorkflowApprovalLevels', () => {
  let component: WorkflowApprovalLevels;
  let fixture: ComponentFixture<WorkflowApprovalLevels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowApprovalLevels],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowApprovalLevels);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
