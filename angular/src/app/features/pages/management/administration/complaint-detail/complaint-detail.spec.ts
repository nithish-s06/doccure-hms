import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComplaintDetail } from './complaint-detail';

describe('ComplaintDetail', () => {
  let component: ComplaintDetail;
  let fixture: ComponentFixture<ComplaintDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComplaintDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ComplaintDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
