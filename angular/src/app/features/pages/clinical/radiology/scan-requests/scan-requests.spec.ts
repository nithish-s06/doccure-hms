import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanRequests } from './scan-requests';

describe('ScanRequests', () => {
  let component: ScanRequests;
  let fixture: ComponentFixture<ScanRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanRequests],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanRequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
