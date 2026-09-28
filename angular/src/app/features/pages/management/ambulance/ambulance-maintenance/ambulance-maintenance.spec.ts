import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceMaintenance } from './ambulance-maintenance';

describe('AmbulanceMaintenance', () => {
  let component: AmbulanceMaintenance;
  let fixture: ComponentFixture<AmbulanceMaintenance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceMaintenance],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceMaintenance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
