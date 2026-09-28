import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmrPrescriptions } from './emr-prescriptions';

describe('EmrPrescriptions', () => {
  let component: EmrPrescriptions;
  let fixture: ComponentFixture<EmrPrescriptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmrPrescriptions],
    }).compileComponents();

    fixture = TestBed.createComponent(EmrPrescriptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
