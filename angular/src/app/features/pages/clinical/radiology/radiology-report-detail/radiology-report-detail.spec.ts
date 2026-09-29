import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadiologyReportDetail } from './radiology-report-detail';

describe('RadiologyReportDetail', () => {
  let component: RadiologyReportDetail;
  let fixture: ComponentFixture<RadiologyReportDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyReportDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RadiologyReportDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
