import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientDocumentDetail } from './patient-document-detail';

describe('PatientDocumentDetail', () => {
  let component: PatientDocumentDetail;
  let fixture: ComponentFixture<PatientDocumentDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDocumentDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDocumentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
