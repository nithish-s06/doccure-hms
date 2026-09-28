import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadiologyReports } from './radiology-reports';

describe('RadiologyReports', () => {
  let component: RadiologyReports;
  let fixture: ComponentFixture<RadiologyReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyReports],
    }).compileComponents();

    fixture = TestBed.createComponent(RadiologyReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
