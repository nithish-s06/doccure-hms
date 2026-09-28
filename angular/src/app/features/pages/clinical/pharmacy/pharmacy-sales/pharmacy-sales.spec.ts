import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacySales } from './pharmacy-sales';

describe('PharmacySales', () => {
  let component: PharmacySales;
  let fixture: ComponentFixture<PharmacySales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacySales],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacySales);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
