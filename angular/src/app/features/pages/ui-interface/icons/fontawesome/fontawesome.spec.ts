import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fontawesome } from './fontawesome';

describe('Fontawesome', () => {
  let component: Fontawesome;
  let fixture: ComponentFixture<Fontawesome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fontawesome],
    }).compileComponents();

    fixture = TestBed.createComponent(Fontawesome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
