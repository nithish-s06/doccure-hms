import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reimbursements } from './reimbursements';

describe('Reimbursements', () => {
  let component: Reimbursements;
  let fixture: ComponentFixture<Reimbursements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reimbursements],
    }).compileComponents();

    fixture = TestBed.createComponent(Reimbursements);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
