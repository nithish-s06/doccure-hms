import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Visitors } from './visitors';

describe('Visitors', () => {
  let component: Visitors;
  let fixture: ComponentFixture<Visitors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Visitors],
    }).compileComponents();

    fixture = TestBed.createComponent(Visitors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
