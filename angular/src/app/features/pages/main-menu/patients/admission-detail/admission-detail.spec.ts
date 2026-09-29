import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdmissionDetail } from './admission-detail';

describe('AdmissionDetail', () => {
  let component: AdmissionDetail;
  let fixture: ComponentFixture<AdmissionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AdmissionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
