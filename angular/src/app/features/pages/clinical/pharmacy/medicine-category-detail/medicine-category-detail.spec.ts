import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineCategoryDetail } from './medicine-category-detail';

describe('MedicineCategoryDetail', () => {
  let component: MedicineCategoryDetail;
  let fixture: ComponentFixture<MedicineCategoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineCategoryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineCategoryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
