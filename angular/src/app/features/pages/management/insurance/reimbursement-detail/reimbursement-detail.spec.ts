import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReimbursementDetail } from './reimbursement-detail';

describe('ReimbursementDetail', () => {
  let component: ReimbursementDetail;
  let fixture: ComponentFixture<ReimbursementDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReimbursementDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ReimbursementDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
