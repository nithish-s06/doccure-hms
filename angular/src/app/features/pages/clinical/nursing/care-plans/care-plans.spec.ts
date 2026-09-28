import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarePlans } from './care-plans';

describe('CarePlans', () => {
  let component: CarePlans;
  let fixture: ComponentFixture<CarePlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarePlans],
    }).compileComponents();

    fixture = TestBed.createComponent(CarePlans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
