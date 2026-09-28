import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceClaims } from './insurance-claims';

describe('InsuranceClaims', () => {
  let component: InsuranceClaims;
  let fixture: ComponentFixture<InsuranceClaims>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceClaims],
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceClaims);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
