import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiLightbox } from './ui-lightbox';

describe('UiLightbox', () => {
  let component: UiLightbox;
  let fixture: ComponentFixture<UiLightbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiLightbox],
    }).compileComponents();

    fixture = TestBed.createComponent(UiLightbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
