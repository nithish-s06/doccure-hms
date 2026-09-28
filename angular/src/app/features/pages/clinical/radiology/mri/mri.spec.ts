import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Mri } from './mri';

describe('Mri', () => {
  let component: Mri;
  let fixture: ComponentFixture<Mri>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Mri],
    }).compileComponents();

    fixture = TestBed.createComponent(Mri);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
