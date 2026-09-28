import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apexchart } from './apexchart';

describe('Apexchart', () => {
  let component: Apexchart;
  let fixture: ComponentFixture<Apexchart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Apexchart],
    }).compileComponents();

    fixture = TestBed.createComponent(Apexchart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
