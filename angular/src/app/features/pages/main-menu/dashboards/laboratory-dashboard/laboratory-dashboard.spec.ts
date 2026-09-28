import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryDashboard } from './laboratory-dashboard';

describe('LaboratoryDashboard', () => {
  let component: LaboratoryDashboard;
  let fixture: ComponentFixture<LaboratoryDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
