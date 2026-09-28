import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriticalCare } from './critical-care';

describe('CriticalCare', () => {
  let component: CriticalCare;
  let fixture: ComponentFixture<CriticalCare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriticalCare],
    }).compileComponents();

    fixture = TestBed.createComponent(CriticalCare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
