import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryReports } from './laboratory-reports';

describe('LaboratoryReports', () => {
  let component: LaboratoryReports;
  let fixture: ComponentFixture<LaboratoryReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaboratoryReports],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoryReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
