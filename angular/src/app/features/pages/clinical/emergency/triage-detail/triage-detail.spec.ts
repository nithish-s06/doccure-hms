import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TriageDetail } from './triage-detail';

describe('TriageDetail', () => {
  let component: TriageDetail;
  let fixture: ComponentFixture<TriageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TriageDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(TriageDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
