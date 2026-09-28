import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BloodDonors } from './blood-donors';

describe('BloodDonors', () => {
  let component: BloodDonors;
  let fixture: ComponentFixture<BloodDonors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloodDonors],
    }).compileComponents();

    fixture = TestBed.createComponent(BloodDonors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
