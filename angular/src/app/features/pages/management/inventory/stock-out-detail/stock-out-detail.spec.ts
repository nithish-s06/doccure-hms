import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockOutDetail } from './stock-out-detail';

describe('StockOutDetail', () => {
  let component: StockOutDetail;
  let fixture: ComponentFixture<StockOutDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOutDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(StockOutDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
