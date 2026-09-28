import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiGrid } from './ui-grid';

describe('UiGrid', () => {
  let component: UiGrid;
  let fixture: ComponentFixture<UiGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(UiGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
