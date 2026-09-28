import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Telemedicine } from './telemedicine';

describe('Telemedicine', () => {
  let component: Telemedicine;
  let fixture: ComponentFixture<Telemedicine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Telemedicine],
    }).compileComponents();

    fixture = TestBed.createComponent(Telemedicine);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
