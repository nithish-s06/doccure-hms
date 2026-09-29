import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanRequestDetail } from './scan-request-detail';

describe('ScanRequestDetail', () => {
  let component: ScanRequestDetail;
  let fixture: ComponentFixture<ScanRequestDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanRequestDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanRequestDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
