import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowApprovals } from './workflow-approvals';

describe('WorkflowApprovals', () => {
  let component: WorkflowApprovals;
  let fixture: ComponentFixture<WorkflowApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
