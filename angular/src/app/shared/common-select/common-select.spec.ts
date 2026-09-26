import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSelect } from './common-select';

describe('CommonSelect', () => {
  let component: CommonSelect;
  let fixture: ComponentFixture<CommonSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(CommonSelect);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
