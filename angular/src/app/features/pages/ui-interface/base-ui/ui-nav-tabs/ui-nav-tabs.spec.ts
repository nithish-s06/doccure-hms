import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiNavTabs } from './ui-nav-tabs';

describe('UiNavTabs', () => {
  let component: UiNavTabs;
  let fixture: ComponentFixture<UiNavTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiNavTabs],
    }).compileComponents();

    fixture = TestBed.createComponent(UiNavTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
