import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiOffcanvas } from './ui-offcanvas';

describe('UiOffcanvas', () => {
  let component: UiOffcanvas;
  let fixture: ComponentFixture<UiOffcanvas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiOffcanvas],
    }).compileComponents();

    fixture = TestBed.createComponent(UiOffcanvas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
