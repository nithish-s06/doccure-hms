import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentRequestDetail } from './appointment-request-detail';

describe('AppointmentRequestDetail', () => {
  let component: AppointmentRequestDetail;
  let fixture: ComponentFixture<AppointmentRequestDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRequestDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentRequestDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
