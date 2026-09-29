import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationFeeDetail } from './consultation-fee-detail';

describe('ConsultationFeeDetail', () => {
  let component: ConsultationFeeDetail;
  let fixture: ComponentFixture<ConsultationFeeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationFeeDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationFeeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
