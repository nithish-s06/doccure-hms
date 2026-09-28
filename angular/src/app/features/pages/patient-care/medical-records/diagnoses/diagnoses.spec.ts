import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Diagnoses } from './diagnoses';

describe('Diagnoses', () => {
  let component: Diagnoses;
  let fixture: ComponentFixture<Diagnoses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diagnoses],
    }).compileComponents();

    fixture = TestBed.createComponent(Diagnoses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
