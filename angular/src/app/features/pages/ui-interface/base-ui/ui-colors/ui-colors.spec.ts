import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiColors } from './ui-colors';

describe('UiColors', () => {
  let component: UiColors;
  let fixture: ComponentFixture<UiColors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiColors],
    }).compileComponents();

    fixture = TestBed.createComponent(UiColors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
