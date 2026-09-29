import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RadiologyOrderDetail } from './radiology-order-detail';

describe('RadiologyOrderDetail', () => {
  let component: RadiologyOrderDetail;
  let fixture: ComponentFixture<RadiologyOrderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadiologyOrderDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(RadiologyOrderDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
