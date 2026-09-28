import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Radiology } from './radiology';

describe('Radiology', () => {
  let component: Radiology;
  let fixture: ComponentFixture<Radiology>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Radiology],
    }).compileComponents();

    fixture = TestBed.createComponent(Radiology);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
