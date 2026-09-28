import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloodCamps } from './blood-camps';

describe('BloodCamps', () => {
  let component: BloodCamps;
  let fixture: ComponentFixture<BloodCamps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodCamps],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodCamps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
