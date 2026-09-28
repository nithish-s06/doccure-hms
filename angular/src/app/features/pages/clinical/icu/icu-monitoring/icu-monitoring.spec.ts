import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IcuMonitoring } from './icu-monitoring';

describe('IcuMonitoring', () => {
  let component: IcuMonitoring;
  let fixture: ComponentFixture<IcuMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcuMonitoring],
    }).compileComponents();

    fixture = TestBed.createComponent(IcuMonitoring);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
