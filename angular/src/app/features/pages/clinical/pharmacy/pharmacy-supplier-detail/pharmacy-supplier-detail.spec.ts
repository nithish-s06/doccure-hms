import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacySupplierDetail } from './pharmacy-supplier-detail';

describe('PharmacySupplierDetail', () => {
  let component: PharmacySupplierDetail;
  let fixture: ComponentFixture<PharmacySupplierDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacySupplierDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacySupplierDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
