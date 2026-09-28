import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyReports } from './pharmacy-reports';

describe('PharmacyReports', () => {
  let component: PharmacyReports;
  let fixture: ComponentFixture<PharmacyReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyReports],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
