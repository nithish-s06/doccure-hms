import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmergencyCallDetail } from './emergency-call-detail';

describe('EmergencyCallDetail', () => {
  let component: EmergencyCallDetail;
  let fixture: ComponentFixture<EmergencyCallDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencyCallDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(EmergencyCallDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
