import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorLeaveRequests } from './doctor-leave-requests';

describe('DoctorLeaveRequests', () => {
  let component: DoctorLeaveRequests;
  let fixture: ComponentFixture<DoctorLeaveRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorLeaveRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorLeaveRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
