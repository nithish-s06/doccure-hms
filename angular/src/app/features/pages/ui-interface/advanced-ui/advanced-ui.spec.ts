import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedUi } from './advanced-ui';

describe('AdvancedUi', () => {
  let component: AdvancedUi;
  let fixture: ComponentFixture<AdvancedUi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedUi],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedUi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
