import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IcuPatients } from './icu-patients';

describe('IcuPatients', () => {
  let component: IcuPatients;
  let fixture: ComponentFixture<IcuPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcuPatients],
    }).compileComponents();

    fixture = TestBed.createComponent(IcuPatients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
