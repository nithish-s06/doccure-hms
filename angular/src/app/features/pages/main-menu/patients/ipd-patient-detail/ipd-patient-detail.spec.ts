import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IpdPatientDetail } from './ipd-patient-detail';

describe('IpdPatientDetail', () => {
  let component: IpdPatientDetail;
  let fixture: ComponentFixture<IpdPatientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdPatientDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(IpdPatientDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
