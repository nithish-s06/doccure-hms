import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriticalAlerts } from './critical-alerts';

describe('CriticalAlerts', () => {
  let component: CriticalAlerts;
  let fixture: ComponentFixture<CriticalAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriticalAlerts],
    }).compileComponents();

    fixture = TestBed.createComponent(CriticalAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
