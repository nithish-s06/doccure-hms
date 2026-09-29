import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CriticalCareDetail } from './critical-care-detail';

describe('CriticalCareDetail', () => {
  let component: CriticalCareDetail;
  let fixture: ComponentFixture<CriticalCareDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriticalCareDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(CriticalCareDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
