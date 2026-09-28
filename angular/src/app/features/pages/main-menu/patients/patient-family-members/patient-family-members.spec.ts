import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientFamilyMembers } from './patient-family-members';

describe('PatientFamilyMembers', () => {
  let component: PatientFamilyMembers;
  let fixture: ComponentFixture<PatientFamilyMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFamilyMembers],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFamilyMembers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
