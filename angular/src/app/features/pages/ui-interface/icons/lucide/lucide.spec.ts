import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lucide } from './lucide';

describe('Lucide', () => {
  let component: Lucide;
  let fixture: ComponentFixture<Lucide>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Lucide],
    }).compileComponents();

    fixture = TestBed.createComponent(Lucide);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
