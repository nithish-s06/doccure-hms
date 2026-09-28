import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabTests } from './lab-tests';

describe('LabTests', () => {
  let component: LabTests;
  let fixture: ComponentFixture<LabTests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabTests],
    }).compileComponents();

    fixture = TestBed.createComponent(LabTests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
