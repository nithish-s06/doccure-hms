import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyPurchaseOrderDetail } from './pharmacy-purchase-order-detail';

describe('PharmacyPurchaseOrderDetail', () => {
  let component: PharmacyPurchaseOrderDetail;
  let fixture: ComponentFixture<PharmacyPurchaseOrderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyPurchaseOrderDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyPurchaseOrderDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
