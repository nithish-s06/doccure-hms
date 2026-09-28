import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryCategories } from './inventory-categories';

describe('InventoryCategories', () => {
  let component: InventoryCategories;
  let fixture: ComponentFixture<InventoryCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
