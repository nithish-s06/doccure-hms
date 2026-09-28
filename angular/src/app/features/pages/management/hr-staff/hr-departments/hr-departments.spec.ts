import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HrDepartments } from './hr-departments';

describe('HrDepartments', () => {
  let component: HrDepartments;
  let fixture: ComponentFixture<HrDepartments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HrDepartments],
    }).compileComponents();

    fixture = TestBed.createComponent(HrDepartments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
