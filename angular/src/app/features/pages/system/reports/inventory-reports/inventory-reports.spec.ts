import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryReports } from './inventory-reports';

describe('InventoryReports', () => {
  let component: InventoryReports;
  let fixture: ComponentFixture<InventoryReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryReports],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
