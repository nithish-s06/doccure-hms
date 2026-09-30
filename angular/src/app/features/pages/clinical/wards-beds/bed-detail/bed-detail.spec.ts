import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedDetail } from './bed-detail';

describe('BedDetail', () => {
  let component: BedDetail;
  let fixture: ComponentFixture<BedDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BedDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
