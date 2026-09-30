import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockInDetail } from './stock-in-detail';

describe('StockInDetail', () => {
  let component: StockInDetail;
  let fixture: ComponentFixture<StockInDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockInDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(StockInDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
