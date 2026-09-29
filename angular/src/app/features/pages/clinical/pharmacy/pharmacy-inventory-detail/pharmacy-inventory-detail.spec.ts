import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyInventoryDetail } from './pharmacy-inventory-detail';

describe('PharmacyInventoryDetail', () => {
  let component: PharmacyInventoryDetail;
  let fixture: ComponentFixture<PharmacyInventoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyInventoryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyInventoryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
