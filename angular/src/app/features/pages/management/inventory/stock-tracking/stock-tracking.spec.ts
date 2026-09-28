import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockTracking } from './stock-tracking';

describe('StockTracking', () => {
  let component: StockTracking;
  let fixture: ComponentFixture<StockTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(StockTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
