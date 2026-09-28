import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicationAdministration } from './medication-administration';

describe('MedicationAdministration', () => {
  let component: MedicationAdministration;
  let fixture: ComponentFixture<MedicationAdministration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicationAdministration],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicationAdministration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
