import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormEditor } from './form-editor';

describe('FormEditor', () => {
  let component: FormEditor;
  let fixture: ComponentFixture<FormEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(FormEditor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
