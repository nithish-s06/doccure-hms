import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationDetail } from './consultation-detail';

describe('ConsultationDetail', () => {
  let component: ConsultationDetail;
  let fixture: ComponentFixture<ConsultationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
