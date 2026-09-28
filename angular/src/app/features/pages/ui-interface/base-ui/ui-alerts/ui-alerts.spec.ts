import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAlerts } from './ui-alerts';

describe('UiAlerts', () => {
  let component: UiAlerts;
  let fixture: ComponentFixture<UiAlerts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiAlerts],
    }).compileComponents();

    fixture = TestBed.createComponent(UiAlerts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
