import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Estimates } from './estimates';

describe('Estimates', () => {
  let component: Estimates;
  let fixture: ComponentFixture<Estimates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estimates],
    }).compileComponents();

    fixture = TestBed.createComponent(Estimates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
