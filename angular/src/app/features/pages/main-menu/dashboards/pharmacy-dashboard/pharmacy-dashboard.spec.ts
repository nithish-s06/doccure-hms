import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyDashboard } from './pharmacy-dashboard';

describe('PharmacyDashboard', () => {
  let component: PharmacyDashboard;
  let fixture: ComponentFixture<PharmacyDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
