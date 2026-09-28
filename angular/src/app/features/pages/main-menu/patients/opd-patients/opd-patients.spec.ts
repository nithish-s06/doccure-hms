import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpdPatients } from './opd-patients';

describe('OpdPatients', () => {
  let component: OpdPatients;
  let fixture: ComponentFixture<OpdPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpdPatients],
    }).compileComponents();

    fixture = TestBed.createComponent(OpdPatients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
