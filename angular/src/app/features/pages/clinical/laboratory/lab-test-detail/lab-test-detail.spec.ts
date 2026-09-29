import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestDetail } from './lab-test-detail';

describe('LabTestDetail', () => {
  let component: LabTestDetail;
  let fixture: ComponentFixture<LabTestDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTestDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTestDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
