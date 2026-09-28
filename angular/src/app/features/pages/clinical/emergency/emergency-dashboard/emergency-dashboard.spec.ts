import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyDashboard } from './emergency-dashboard';

describe('EmergencyDashboard', () => {
  let component: EmergencyDashboard;
  let fixture: ComponentFixture<EmergencyDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
