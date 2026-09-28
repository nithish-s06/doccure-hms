import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventorySuppliers } from './inventory-suppliers';

describe('InventorySuppliers', () => {
  let component: InventorySuppliers;
  let fixture: ComponentFixture<InventorySuppliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventorySuppliers],
    }).compileComponents();

    fixture = TestBed.createComponent(InventorySuppliers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
