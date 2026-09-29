import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientFeedbackDetail } from './patient-feedback-detail';

describe('PatientFeedbackDetail', () => {
  let component: PatientFeedbackDetail;
  let fixture: ComponentFixture<PatientFeedbackDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFeedbackDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFeedbackDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
