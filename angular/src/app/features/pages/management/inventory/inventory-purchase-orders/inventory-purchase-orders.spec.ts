import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryPurchaseOrders } from './inventory-purchase-orders';

describe('InventoryPurchaseOrders', () => {
  let component: InventoryPurchaseOrders;
  let fixture: ComponentFixture<InventoryPurchaseOrders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPurchaseOrders],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryPurchaseOrders);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
