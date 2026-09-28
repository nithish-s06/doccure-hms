import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NursingDashboard } from './nursing-dashboard';

describe('NursingDashboard', () => {
  let component: NursingDashboard;
  let fixture: ComponentFixture<NursingDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NursingDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(NursingDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
