import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiDropdowns } from './ui-dropdowns';

describe('UiDropdowns', () => {
  let component: UiDropdowns;
  let fixture: ComponentFixture<UiDropdowns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiDropdowns],
    }).compileComponents();

    fixture = TestBed.createComponent(UiDropdowns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
