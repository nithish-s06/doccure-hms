import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Medicines } from './medicines';

describe('Medicines', () => {
  let component: Medicines;
  let fixture: ComponentFixture<Medicines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Medicines],
    }).compileComponents();

    fixture = TestBed.createComponent(Medicines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
