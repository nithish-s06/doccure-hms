import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AmbulanceCalls } from './ambulance-calls';

describe('AmbulanceCalls', () => {
  let component: AmbulanceCalls;
  let fixture: ComponentFixture<AmbulanceCalls>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbulanceCalls],
    }).compileComponents();

    fixture = TestBed.createComponent(AmbulanceCalls);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
