import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorAvailabilityDetail } from './doctor-availability-detail';

describe('DoctorAvailabilityDetail', () => {
  let component: DoctorAvailabilityDetail;
  let fixture: ComponentFixture<DoctorAvailabilityDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorAvailabilityDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorAvailabilityDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
