import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpiryItemDetail } from './expiry-item-detail';

describe('ExpiryItemDetail', () => {
  let component: ExpiryItemDetail;
  let fixture: ComponentFixture<ExpiryItemDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpiryItemDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpiryItemDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
