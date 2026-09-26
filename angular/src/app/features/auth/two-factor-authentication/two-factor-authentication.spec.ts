import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwoFactorAuthentication } from './two-factor-authentication';

describe('TwoFactorAuthentication', () => {
  let component: TwoFactorAuthentication;
  let fixture: ComponentFixture<TwoFactorAuthentication>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorAuthentication],
    }).compileComponents();

    fixture = TestBed.createComponent(TwoFactorAuthentication);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
