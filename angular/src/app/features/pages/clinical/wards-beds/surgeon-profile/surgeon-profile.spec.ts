import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurgeonProfile } from './surgeon-profile';

describe('SurgeonProfile', () => {
  let component: SurgeonProfile;
  let fixture: ComponentFixture<SurgeonProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurgeonProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(SurgeonProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
