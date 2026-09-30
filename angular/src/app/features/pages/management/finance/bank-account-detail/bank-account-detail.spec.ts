import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BankAccountDetail } from './bank-account-detail';

describe('BankAccountDetail', () => {
  let component: BankAccountDetail;
  let fixture: ComponentFixture<BankAccountDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankAccountDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BankAccountDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
