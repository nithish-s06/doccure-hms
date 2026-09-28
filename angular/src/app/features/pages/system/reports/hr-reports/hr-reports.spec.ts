import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HrReports } from './hr-reports';

describe('HrReports', () => {
  let component: HrReports;
  let fixture: ComponentFixture<HrReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrReports],
    }).compileComponents();

    fixture = TestBed.createComponent(HrReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
