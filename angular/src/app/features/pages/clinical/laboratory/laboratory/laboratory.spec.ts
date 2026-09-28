import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Laboratory } from './laboratory';

describe('Laboratory', () => {
  let component: Laboratory;
  let fixture: ComponentFixture<Laboratory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Laboratory],
    }).compileComponents();

    fixture = TestBed.createComponent(Laboratory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
