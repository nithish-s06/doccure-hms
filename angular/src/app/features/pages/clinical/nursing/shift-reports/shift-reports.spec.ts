import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftReports } from './shift-reports';

describe('ShiftReports', () => {
  let component: ShiftReports;
  let fixture: ComponentFixture<ShiftReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftReports],
    }).compileComponents();

    fixture = TestBed.createComponent(ShiftReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
