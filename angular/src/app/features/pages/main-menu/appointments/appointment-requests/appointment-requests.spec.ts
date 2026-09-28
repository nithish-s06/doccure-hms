import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentRequests } from './appointment-requests';

describe('AppointmentRequests', () => {
  let component: AppointmentRequests;
  let fixture: ComponentFixture<AppointmentRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
