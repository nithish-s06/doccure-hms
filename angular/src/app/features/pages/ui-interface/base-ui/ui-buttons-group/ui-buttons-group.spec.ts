import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiButtonsGroup } from './ui-buttons-group';

describe('UiButtonsGroup', () => {
  let component: UiButtonsGroup;
  let fixture: ComponentFixture<UiButtonsGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiButtonsGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(UiButtonsGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
