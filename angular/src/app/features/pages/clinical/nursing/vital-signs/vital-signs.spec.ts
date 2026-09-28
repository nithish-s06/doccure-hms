import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VitalSigns } from './vital-signs';

describe('VitalSigns', () => {
  let component: VitalSigns;
  let fixture: ComponentFixture<VitalSigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VitalSigns],
    }).compileComponents();

    fixture = TestBed.createComponent(VitalSigns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
