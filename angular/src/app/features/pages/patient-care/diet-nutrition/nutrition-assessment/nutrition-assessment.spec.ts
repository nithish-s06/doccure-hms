import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutritionAssessment } from './nutrition-assessment';

describe('NutritionAssessment', () => {
  let component: NutritionAssessment;
  let fixture: ComponentFixture<NutritionAssessment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionAssessment],
    }).compileComponents();

    fixture = TestBed.createComponent(NutritionAssessment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
