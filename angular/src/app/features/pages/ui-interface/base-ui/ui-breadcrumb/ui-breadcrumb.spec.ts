import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiBreadcrumb } from './ui-breadcrumb';

describe('UiBreadcrumb', () => {
  let component: UiBreadcrumb;
  let fixture: ComponentFixture<UiBreadcrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiBreadcrumb],
    }).compileComponents();

    fixture = TestBed.createComponent(UiBreadcrumb);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
