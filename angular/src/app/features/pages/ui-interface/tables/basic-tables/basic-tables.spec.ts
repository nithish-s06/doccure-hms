import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicTables } from './basic-tables';

describe('BasicTables', () => {
  let component: BasicTables;
  let fixture: ComponentFixture<BasicTables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicTables],
    }).compileComponents();

    fixture = TestBed.createComponent(BasicTables);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
