import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloodIssue } from './blood-issue';

describe('BloodIssue', () => {
  let component: BloodIssue;
  let fixture: ComponentFixture<BloodIssue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodIssue],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodIssue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
