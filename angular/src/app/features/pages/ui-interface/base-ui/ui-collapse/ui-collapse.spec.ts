import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiCollapse } from './ui-collapse';

describe('UiCollapse', () => {
  let component: UiCollapse;
  let fixture: ComponentFixture<UiCollapse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiCollapse],
    }).compileComponents();

    fixture = TestBed.createComponent(UiCollapse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
