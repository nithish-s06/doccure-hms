import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Phosphor } from './phosphor';

describe('Phosphor', () => {
  let component: Phosphor;
  let fixture: ComponentFixture<Phosphor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Phosphor],
    }).compileComponents();

    fixture = TestBed.createComponent(Phosphor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
