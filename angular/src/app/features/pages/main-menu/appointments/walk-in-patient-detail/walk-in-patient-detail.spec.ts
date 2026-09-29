import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalkInPatientDetail } from './walk-in-patient-detail';

describe('WalkInPatientDetail', () => {
  let component: WalkInPatientDetail;
  let fixture: ComponentFixture<WalkInPatientDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkInPatientDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(WalkInPatientDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
