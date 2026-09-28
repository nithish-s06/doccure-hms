import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedOccupancy } from './bed-occupancy';

describe('BedOccupancy', () => {
  let component: BedOccupancy;
  let fixture: ComponentFixture<BedOccupancy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedOccupancy],
    }).compileComponents();

    fixture = TestBed.createComponent(BedOccupancy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
