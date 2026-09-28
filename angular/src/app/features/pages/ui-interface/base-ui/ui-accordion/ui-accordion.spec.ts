import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAccordion } from './ui-accordion';

describe('UiAccordion', () => {
  let component: UiAccordion;
  let fixture: ComponentFixture<UiAccordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAccordion],
    }).compileComponents();

    fixture = TestBed.createComponent(UiAccordion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
