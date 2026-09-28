import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IpdPatients } from './ipd-patients';

describe('IpdPatients', () => {
  let component: IpdPatients;
  let fixture: ComponentFixture<IpdPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IpdPatients],
    }).compileComponents();

    fixture = TestBed.createComponent(IpdPatients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
