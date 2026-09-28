import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiProgress } from './ui-progress';

describe('UiProgress', () => {
  let component: UiProgress;
  let fixture: ComponentFixture<UiProgress>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiProgress],
    }).compileComponents();

    fixture = TestBed.createComponent(UiProgress);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
