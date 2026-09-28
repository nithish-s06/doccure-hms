import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientDocuments } from './patient-documents';

describe('PatientDocuments', () => {
  let component: PatientDocuments;
  let fixture: ComponentFixture<PatientDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDocuments],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDocuments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
