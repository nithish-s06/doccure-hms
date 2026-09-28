import { ComponentFixture, TestBed } from '@angular/core/testing';
import { XRay } from './x-ray';

describe('XRay', () => {
  let component: XRay;
  let fixture: ComponentFixture<XRay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XRay],
    }).compileComponents();

    fixture = TestBed.createComponent(XRay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
