import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Complaints } from './complaints';

describe('Complaints', () => {
  let component: Complaints;
  let fixture: ComponentFixture<Complaints>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complaints],
    }).compileComponents();

    fixture = TestBed.createComponent(Complaints);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
