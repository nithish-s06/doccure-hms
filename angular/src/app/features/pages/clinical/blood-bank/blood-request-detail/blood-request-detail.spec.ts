import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloodRequestDetail } from './blood-request-detail';

describe('BloodRequestDetail', () => {
  let component: BloodRequestDetail;
  let fixture: ComponentFixture<BloodRequestDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodRequestDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodRequestDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
