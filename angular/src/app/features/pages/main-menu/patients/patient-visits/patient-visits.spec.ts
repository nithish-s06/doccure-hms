import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientVisits } from './patient-visits';

describe('PatientVisits', () => {
  let component: PatientVisits;
  let fixture: ComponentFixture<PatientVisits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientVisits],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientVisits);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
