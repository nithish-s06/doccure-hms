import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacySaleDetail } from './pharmacy-sale-detail';

describe('PharmacySaleDetail', () => {
  let component: PharmacySaleDetail;
  let fixture: ComponentFixture<PharmacySaleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacySaleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacySaleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
