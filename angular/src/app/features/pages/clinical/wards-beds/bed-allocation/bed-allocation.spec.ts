import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedAllocation } from './bed-allocation';

describe('BedAllocation', () => {
  let component: BedAllocation;
  let fixture: ComponentFixture<BedAllocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedAllocation],
    }).compileComponents();

    fixture = TestBed.createComponent(BedAllocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
