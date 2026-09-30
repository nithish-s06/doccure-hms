import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceVehicleDetail } from './ambulance-vehicle-detail';

describe('AmbulanceVehicleDetail', () => {
  let component: AmbulanceVehicleDetail;
  let fixture: ComponentFixture<AmbulanceVehicleDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceVehicleDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceVehicleDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
