import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentReports } from './appointment-reports';

describe('AppointmentReports', () => {
  let component: AppointmentReports;
  let fixture: ComponentFixture<AppointmentReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentReports],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
