import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressNotes } from './progress-notes';

describe('ProgressNotes', () => {
  let component: ProgressNotes;
  let fixture: ComponentFixture<ProgressNotes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressNotes],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressNotes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
