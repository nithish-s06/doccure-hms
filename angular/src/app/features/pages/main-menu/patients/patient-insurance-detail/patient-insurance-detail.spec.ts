import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientInsuranceDetail } from './patient-insurance-detail';

describe('PatientInsuranceDetail', () => {
  let component: PatientInsuranceDetail;
  let fixture: ComponentFixture<PatientInsuranceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInsuranceDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientInsuranceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
