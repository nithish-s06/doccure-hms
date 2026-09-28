import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceTrips } from './ambulance-trips';

describe('AmbulanceTrips', () => {
  let component: AmbulanceTrips;
  let fixture: ComponentFixture<AmbulanceTrips>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceTrips],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceTrips);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
