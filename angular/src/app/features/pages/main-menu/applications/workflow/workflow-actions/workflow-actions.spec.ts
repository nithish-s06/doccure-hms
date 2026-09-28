import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowActions } from './workflow-actions';

describe('WorkflowActions', () => {
  let component: WorkflowActions;
  let fixture: ComponentFixture<WorkflowActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowActions],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
