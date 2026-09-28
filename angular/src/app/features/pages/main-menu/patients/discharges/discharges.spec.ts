import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Discharges } from './discharges';

describe('Discharges', () => {
  let component: Discharges;
  let fixture: ComponentFixture<Discharges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Discharges],
    }).compileComponents();

    fixture = TestBed.createComponent(Discharges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
