import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiToasts } from './ui-toasts';

describe('UiToasts', () => {
  let component: UiToasts;
  let fixture: ComponentFixture<UiToasts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiToasts],
    }).compileComponents();

    fixture = TestBed.createComponent(UiToasts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
