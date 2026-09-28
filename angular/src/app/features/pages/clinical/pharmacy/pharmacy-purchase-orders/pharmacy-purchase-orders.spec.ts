import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyPurchaseOrders } from './pharmacy-purchase-orders';

describe('PharmacyPurchaseOrders', () => {
  let component: PharmacyPurchaseOrders;
  let fixture: ComponentFixture<PharmacyPurchaseOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyPurchaseOrders],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyPurchaseOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
