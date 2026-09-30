import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillingDetail } from './billing-detail';

describe('BillingDetail', () => {
  let component: BillingDetail;
  let fixture: ComponentFixture<BillingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillingDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BillingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
