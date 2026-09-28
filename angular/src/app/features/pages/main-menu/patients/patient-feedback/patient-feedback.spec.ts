import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientFeedback } from './patient-feedback';

describe('PatientFeedback', () => {
  let component: PatientFeedback;
  let fixture: ComponentFixture<PatientFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFeedback],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFeedback);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
