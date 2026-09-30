import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceClaimDetail } from './insurance-claim-detail';

describe('InsuranceClaimDetail', () => {
  let component: InsuranceClaimDetail;
  let fixture: ComponentFixture<InsuranceClaimDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceClaimDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceClaimDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
