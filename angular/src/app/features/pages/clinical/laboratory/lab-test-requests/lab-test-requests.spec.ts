import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestRequests } from './lab-test-requests';

describe('LabTestRequests', () => {
  let component: LabTestRequests;
  let fixture: ComponentFixture<LabTestRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTestRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTestRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
