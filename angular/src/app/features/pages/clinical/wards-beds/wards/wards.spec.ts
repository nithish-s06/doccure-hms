import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Wards } from './wards';

describe('Wards', () => {
  let component: Wards;
  let fixture: ComponentFixture<Wards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wards],
    }).compileComponents();

    fixture = TestBed.createComponent(Wards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
