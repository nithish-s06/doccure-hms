import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemedicineSessionDetail } from './telemedicine-session-detail';

describe('TelemedicineSessionDetail', () => {
  let component: TelemedicineSessionDetail;
  let fixture: ComponentFixture<TelemedicineSessionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemedicineSessionDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemedicineSessionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
