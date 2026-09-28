import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Icu } from './icu';

describe('Icu', () => {
  let component: Icu;
  let fixture: ComponentFixture<Icu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Icu],
    }).compileComponents();

    fixture = TestBed.createComponent(Icu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
