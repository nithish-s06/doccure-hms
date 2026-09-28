import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WalkInPatients } from './walk-in-patients';

describe('WalkInPatients', () => {
  let component: WalkInPatients;
  let fixture: ComponentFixture<WalkInPatients>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WalkInPatients],
    }).compileComponents();

    fixture = TestBed.createComponent(WalkInPatients);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
