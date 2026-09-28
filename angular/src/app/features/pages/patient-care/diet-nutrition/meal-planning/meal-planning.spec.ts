import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MealPlanning } from './meal-planning';

describe('MealPlanning', () => {
  let component: MealPlanning;
  let fixture: ComponentFixture<MealPlanning>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlanning],
    }).compileComponents();

    fixture = TestBed.createComponent(MealPlanning);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
