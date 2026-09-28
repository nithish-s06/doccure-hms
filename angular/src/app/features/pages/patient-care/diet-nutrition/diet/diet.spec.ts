import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Diet } from './diet';

describe('Diet', () => {
  let component: Diet;
  let fixture: ComponentFixture<Diet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diet],
    }).compileComponents();

    fixture = TestBed.createComponent(Diet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
