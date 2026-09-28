import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowRequests } from './workflow-requests';

describe('WorkflowRequests', () => {
  let component: WorkflowRequests;
  let fixture: ComponentFixture<WorkflowRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
