import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceDrivers } from './ambulance-drivers';

describe('AmbulanceDrivers', () => {
  let component: AmbulanceDrivers;
  let fixture: ComponentFixture<AmbulanceDrivers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceDrivers],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceDrivers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
