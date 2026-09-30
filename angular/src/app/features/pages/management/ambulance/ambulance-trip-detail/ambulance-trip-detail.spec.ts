import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceTripDetail } from './ambulance-trip-detail';

describe('AmbulanceTripDetail', () => {
  let component: AmbulanceTripDetail;
  let fixture: ComponentFixture<AmbulanceTripDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceTripDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceTripDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
