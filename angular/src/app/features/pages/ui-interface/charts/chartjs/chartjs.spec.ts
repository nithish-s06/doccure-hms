import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chartjs } from './chartjs';

describe('Chartjs', () => {
  let component: Chartjs;
  let fixture: ComponentFixture<Chartjs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chartjs],
    }).compileComponents();

    fixture = TestBed.createComponent(Chartjs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
