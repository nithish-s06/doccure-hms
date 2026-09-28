import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfitLoss } from './profit-loss';

describe('ProfitLoss', () => {
  let component: ProfitLoss;
  let fixture: ComponentFixture<ProfitLoss>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitLoss],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfitLoss);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
