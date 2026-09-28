import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IcuBeds } from './icu-beds';

describe('IcuBeds', () => {
  let component: IcuBeds;
  let fixture: ComponentFixture<IcuBeds>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IcuBeds],
    }).compileComponents();

    fixture = TestBed.createComponent(IcuBeds);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
