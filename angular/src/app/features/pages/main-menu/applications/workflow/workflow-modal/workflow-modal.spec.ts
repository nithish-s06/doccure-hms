import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowModal } from './workflow-modal';

describe('WorkflowModal', () => {
  let component: WorkflowModal;
  let fixture: ComponentFixture<WorkflowModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowModal],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkflowModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
