import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloodIssueDetail } from './blood-issue-detail';

describe('BloodIssueDetail', () => {
  let component: BloodIssueDetail;
  let fixture: ComponentFixture<BloodIssueDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodIssueDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodIssueDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
