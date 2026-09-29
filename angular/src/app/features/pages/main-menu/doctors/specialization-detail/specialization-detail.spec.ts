import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpecializationDetail } from './specialization-detail';

describe('SpecializationDetail', () => {
  let component: SpecializationDetail;
  let fixture: ComponentFixture<SpecializationDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecializationDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
