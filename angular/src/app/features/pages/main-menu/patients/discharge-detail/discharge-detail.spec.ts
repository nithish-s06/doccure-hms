import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DischargeDetail } from './discharge-detail';

describe('DischargeDetail', () => {
  let component: DischargeDetail;
  let fixture: ComponentFixture<DischargeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DischargeDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(DischargeDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
