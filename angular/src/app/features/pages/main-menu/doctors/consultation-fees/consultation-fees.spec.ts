import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationFees } from './consultation-fees';

describe('ConsultationFees', () => {
  let component: ConsultationFees;
  let fixture: ComponentFixture<ConsultationFees>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationFees],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationFees);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
