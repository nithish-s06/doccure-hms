import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tabler } from './tabler';

describe('Tabler', () => {
  let component: Tabler;
  let fixture: ComponentFixture<Tabler>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabler],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabler);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
