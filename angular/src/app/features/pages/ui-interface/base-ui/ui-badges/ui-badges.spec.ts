import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiBadges } from './ui-badges';

describe('UiBadges', () => {
  let component: UiBadges;
  let fixture: ComponentFixture<UiBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBadges],
    }).compileComponents();

    fixture = TestBed.createComponent(UiBadges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
