import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientInsurance } from './patient-insurance';

describe('PatientInsurance', () => {
  let component: PatientInsurance;
  let fixture: ComponentFixture<PatientInsurance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientInsurance],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientInsurance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
