import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoctorPerformance } from './doctor-performance';

describe('DoctorPerformance', () => {
  let component: DoctorPerformance;
  let fixture: ComponentFixture<DoctorPerformance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPerformance],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorPerformance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
