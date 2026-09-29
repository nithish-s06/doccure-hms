import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestResultDetail } from './lab-test-result-detail';

describe('LabTestResultDetail', () => {
  let component: LabTestResultDetail;
  let fixture: ComponentFixture<LabTestResultDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTestResultDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTestResultDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
