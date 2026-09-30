import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceApprovalDetail } from './insurance-approval-detail';

describe('InsuranceApprovalDetail', () => {
  let component: InsuranceApprovalDetail;
  let fixture: ComponentFixture<InsuranceApprovalDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceApprovalDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceApprovalDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
