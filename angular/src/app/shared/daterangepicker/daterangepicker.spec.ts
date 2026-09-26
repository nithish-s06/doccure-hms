import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Daterangepicker } from './daterangepicker';

describe('Daterangepicker', () => {
  let component: Daterangepicker;
  let fixture: ComponentFixture<Daterangepicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Daterangepicker],
    }).compileComponents();

    fixture = TestBed.createComponent(Daterangepicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
