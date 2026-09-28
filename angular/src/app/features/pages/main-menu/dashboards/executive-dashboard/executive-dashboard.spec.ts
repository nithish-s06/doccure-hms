import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutiveDashboard } from './executive-dashboard';

describe('ExecutiveDashboard', () => {
  let component: ExecutiveDashboard;
  let fixture: ComponentFixture<ExecutiveDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutiveDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
