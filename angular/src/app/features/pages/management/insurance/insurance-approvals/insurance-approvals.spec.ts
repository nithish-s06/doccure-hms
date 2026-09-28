import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceApprovals } from './insurance-approvals';

describe('InsuranceApprovals', () => {
  let component: InsuranceApprovals;
  let fixture: ComponentFixture<InsuranceApprovals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceApprovals],
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceApprovals);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
