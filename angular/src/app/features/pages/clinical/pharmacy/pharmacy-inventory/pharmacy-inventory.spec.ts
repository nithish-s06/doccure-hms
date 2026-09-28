import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyInventory } from './pharmacy-inventory';

describe('PharmacyInventory', () => {
  let component: PharmacyInventory;
  let fixture: ComponentFixture<PharmacyInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyInventory],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyInventory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
