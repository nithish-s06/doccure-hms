import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NursingNotes } from './nursing-notes';

describe('NursingNotes', () => {
  let component: NursingNotes;
  let fixture: ComponentFixture<NursingNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NursingNotes],
    }).compileComponents();

    fixture = TestBed.createComponent(NursingNotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
