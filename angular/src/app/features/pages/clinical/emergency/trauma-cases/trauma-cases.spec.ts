import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraumaCases } from './trauma-cases';

describe('TraumaCases', () => {
  let component: TraumaCases;
  let fixture: ComponentFixture<TraumaCases>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraumaCases],
    }).compileComponents();

    fixture = TestBed.createComponent(TraumaCases);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
