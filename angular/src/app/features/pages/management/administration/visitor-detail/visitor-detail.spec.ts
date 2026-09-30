import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisitorDetail } from './visitor-detail';

describe('VisitorDetail', () => {
  let component: VisitorDetail;
  let fixture: ComponentFixture<VisitorDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitorDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
