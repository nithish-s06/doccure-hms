import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduledSessions } from './scheduled-sessions';

describe('ScheduledSessions', () => {
  let component: ScheduledSessions;
  let fixture: ComponentFixture<ScheduledSessions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduledSessions],
    }).compileComponents();

    fixture = TestBed.createComponent(ScheduledSessions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
