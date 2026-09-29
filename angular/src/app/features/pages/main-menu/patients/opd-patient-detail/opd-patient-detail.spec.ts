import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpdPatientDetail } from './opd-patient-detail';

describe('OpdPatientDetail', () => {
  let component: OpdPatientDetail;
  let fixture: ComponentFixture<OpdPatientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdPatientDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(OpdPatientDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
