import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtCalendar } from './ot-calendar';

describe('OtCalendar', () => {
  let component: OtCalendar;
  let fixture: ComponentFixture<OtCalendar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtCalendar],
    }).compileComponents();

    fixture = TestBed.createComponent(OtCalendar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
