import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiImages } from './ui-images';

describe('UiImages', () => {
  let component: UiImages;
  let fixture: ComponentFixture<UiImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiImages],
    }).compileComponents();

    fixture = TestBed.createComponent(UiImages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
