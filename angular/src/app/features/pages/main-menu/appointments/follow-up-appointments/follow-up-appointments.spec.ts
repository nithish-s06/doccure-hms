import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FollowUpAppointments } from './follow-up-appointments';

describe('FollowUpAppointments', () => {
  let component: FollowUpAppointments;
  let fixture: ComponentFixture<FollowUpAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUpAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
