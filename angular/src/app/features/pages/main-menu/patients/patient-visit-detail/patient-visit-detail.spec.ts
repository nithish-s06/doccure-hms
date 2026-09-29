import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientVisitDetail } from './patient-visit-detail';

describe('PatientVisitDetail', () => {
  let component: PatientVisitDetail;
  let fixture: ComponentFixture<PatientVisitDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVisitDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientVisitDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
