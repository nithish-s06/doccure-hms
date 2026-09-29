import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TraumaCaseDetail } from './trauma-case-detail';

describe('TraumaCaseDetail', () => {
  let component: TraumaCaseDetail;
  let fixture: ComponentFixture<TraumaCaseDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraumaCaseDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(TraumaCaseDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
