import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormPicker } from './form-picker';

describe('FormPicker', () => {
  let component: FormPicker;
  let fixture: ComponentFixture<FormPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormPicker],
    }).compileComponents();

    fixture = TestBed.createComponent(FormPicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
