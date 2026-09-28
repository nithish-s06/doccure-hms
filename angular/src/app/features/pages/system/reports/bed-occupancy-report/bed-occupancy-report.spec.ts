import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedOccupancyReport } from './bed-occupancy-report';

describe('BedOccupancyReport', () => {
  let component: BedOccupancyReport;
  let fixture: ComponentFixture<BedOccupancyReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedOccupancyReport],
    }).compileComponents();

    fixture = TestBed.createComponent(BedOccupancyReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
