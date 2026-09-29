import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineDetail } from './medicine-detail';

describe('MedicineDetail', () => {
  let component: MedicineDetail;
  let fixture: ComponentFixture<MedicineDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
