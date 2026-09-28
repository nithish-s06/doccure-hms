import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Ambulance } from './ambulance';

describe('Ambulance', () => {
  let component: Ambulance;
  let fixture: ComponentFixture<Ambulance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ambulance],
    }).compileComponents();

    fixture = TestBed.createComponent(Ambulance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
