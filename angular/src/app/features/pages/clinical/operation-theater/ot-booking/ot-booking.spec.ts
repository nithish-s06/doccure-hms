import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtBooking } from './ot-booking';

describe('OtBooking', () => {
  let component: OtBooking;
  let fixture: ComponentFixture<OtBooking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtBooking],
    }).compileComponents();

    fixture = TestBed.createComponent(OtBooking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
