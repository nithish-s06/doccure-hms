import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyDetail } from './emergency-detail';

describe('EmergencyDetail', () => {
  let component: EmergencyDetail;
  let fixture: ComponentFixture<EmergencyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
