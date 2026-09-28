import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Surgeons } from './surgeons';

describe('Surgeons', () => {
  let component: Surgeons;
  let fixture: ComponentFixture<Surgeons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Surgeons],
    }).compileComponents();

    fixture = TestBed.createComponent(Surgeons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
