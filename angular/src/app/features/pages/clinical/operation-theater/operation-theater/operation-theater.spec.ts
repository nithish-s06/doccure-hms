import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationTheater } from './operation-theater';

describe('OperationTheater', () => {
  let component: OperationTheater;
  let fixture: ComponentFixture<OperationTheater>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationTheater],
    }).compileComponents();

    fixture = TestBed.createComponent(OperationTheater);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
