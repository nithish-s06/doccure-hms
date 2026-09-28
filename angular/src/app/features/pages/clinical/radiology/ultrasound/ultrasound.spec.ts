import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ultrasound } from './ultrasound';

describe('Ultrasound', () => {
  let component: Ultrasound;
  let fixture: ComponentFixture<Ultrasound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ultrasound],
    }).compileComponents();

    fixture = TestBed.createComponent(Ultrasound);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
