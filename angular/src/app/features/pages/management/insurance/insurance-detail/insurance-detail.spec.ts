import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceDetail } from './insurance-detail';

describe('InsuranceDetail', () => {
  let component: InsuranceDetail;
  let fixture: ComponentFixture<InsuranceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(InsuranceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
