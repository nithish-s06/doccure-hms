import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceVehicles } from './ambulance-vehicles';

describe('AmbulanceVehicles', () => {
  let component: AmbulanceVehicles;
  let fixture: ComponentFixture<AmbulanceVehicles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceVehicles],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceVehicles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
