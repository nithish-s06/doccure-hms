import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpiryTracking } from './expiry-tracking';

describe('ExpiryTracking', () => {
  let component: ExpiryTracking;
  let fixture: ComponentFixture<ExpiryTracking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiryTracking],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiryTracking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
