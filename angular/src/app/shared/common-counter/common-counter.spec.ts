import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonCounter } from './common-counter';

describe('CommonCounter', () => {
  let component: CommonCounter;
  let fixture: ComponentFixture<CommonCounter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonCounter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonCounter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
