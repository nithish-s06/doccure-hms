import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelledAppointments } from './cancelled-appointments';

describe('CancelledAppointments', () => {
  let component: CancelledAppointments;
  let fixture: ComponentFixture<CancelledAppointments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelledAppointments],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelledAppointments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
