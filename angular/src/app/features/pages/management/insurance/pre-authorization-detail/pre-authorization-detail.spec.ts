import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreAuthorizationDetail } from './pre-authorization-detail';

describe('PreAuthorizationDetail', () => {
  let component: PreAuthorizationDetail;
  let fixture: ComponentFixture<PreAuthorizationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreAuthorizationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(PreAuthorizationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
