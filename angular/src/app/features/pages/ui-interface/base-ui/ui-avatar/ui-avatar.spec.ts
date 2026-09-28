import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAvatar } from './ui-avatar';

describe('UiAvatar', () => {
  let component: UiAvatar;
  let fixture: ComponentFixture<UiAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAvatar],
    }).compileComponents();

    fixture = TestBed.createComponent(UiAvatar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
