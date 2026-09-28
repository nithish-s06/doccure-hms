import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTestCategories } from './lab-test-categories';

describe('LabTestCategories', () => {
  let component: LabTestCategories;
  let fixture: ComponentFixture<LabTestCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTestCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTestCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
