import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacySuppliers } from './pharmacy-suppliers';

describe('PharmacySuppliers', () => {
  let component: PharmacySuppliers;
  let fixture: ComponentFixture<PharmacySuppliers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacySuppliers],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacySuppliers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
