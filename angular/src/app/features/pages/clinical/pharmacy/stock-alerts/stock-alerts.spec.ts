import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockAlerts } from './stock-alerts';

describe('StockAlerts', () => {
  let component: StockAlerts;
  let fixture: ComponentFixture<StockAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAlerts],
    }).compileComponents();

    fixture = TestBed.createComponent(StockAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
