import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiTypography } from './ui-typography';

describe('UiTypography', () => {
  let component: UiTypography;
  let fixture: ComponentFixture<UiTypography>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTypography],
    }).compileComponents();

    fixture = TestBed.createComponent(UiTypography);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
