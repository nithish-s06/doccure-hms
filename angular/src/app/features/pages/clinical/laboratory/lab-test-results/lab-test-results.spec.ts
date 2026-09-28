import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestResults } from './lab-test-results';

describe('LabTestResults', () => {
  let component: LabTestResults;
  let fixture: ComponentFixture<LabTestResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTestResults],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTestResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
