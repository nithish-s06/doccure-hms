import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSearch } from './common-search';

describe('CommonSearch', () => {
  let component: CommonSearch;
  let fixture: ComponentFixture<CommonSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
