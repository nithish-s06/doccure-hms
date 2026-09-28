import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineCategories } from './medicine-categories';

describe('MedicineCategories', () => {
  let component: MedicineCategories;
  let fixture: ComponentFixture<MedicineCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
