import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtBookingDetail } from './ot-booking-detail';

describe('OtBookingDetail', () => {
  let component: OtBookingDetail;
  let fixture: ComponentFixture<OtBookingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtBookingDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(OtBookingDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
