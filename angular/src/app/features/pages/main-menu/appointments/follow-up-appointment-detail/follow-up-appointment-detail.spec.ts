import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowUpAppointmentDetail } from './follow-up-appointment-detail';

describe('FollowUpAppointmentDetail', () => {
  let component: FollowUpAppointmentDetail;
  let fixture: ComponentFixture<FollowUpAppointmentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpAppointmentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpAppointmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
