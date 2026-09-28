import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiPopovers } from './ui-popovers';

describe('UiPopovers', () => {
  let component: UiPopovers;
  let fixture: ComponentFixture<UiPopovers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPopovers],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPopovers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
