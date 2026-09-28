import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationHistory } from './consultation-history';

describe('ConsultationHistory', () => {
  let component: ConsultationHistory;
  let fixture: ComponentFixture<ConsultationHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
