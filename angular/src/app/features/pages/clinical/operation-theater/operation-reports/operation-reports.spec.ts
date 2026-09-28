import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationReports } from './operation-reports';

describe('OperationReports', () => {
  let component: OperationReports;
  let fixture: ComponentFixture<OperationReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationReports],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
