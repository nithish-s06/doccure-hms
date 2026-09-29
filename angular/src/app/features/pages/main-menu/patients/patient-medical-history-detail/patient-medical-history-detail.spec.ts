import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientMedicalHistoryDetail } from './patient-medical-history-detail';

describe('PatientMedicalHistoryDetail', () => {
  let component: PatientMedicalHistoryDetail;
  let fixture: ComponentFixture<PatientMedicalHistoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientMedicalHistoryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMedicalHistoryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
