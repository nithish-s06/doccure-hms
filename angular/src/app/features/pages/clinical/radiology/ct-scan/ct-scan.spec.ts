import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CtScan } from './ct-scan';

describe('CtScan', () => {
  let component: CtScan;
  let fixture: ComponentFixture<CtScan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CtScan],
    }).compileComponents();

    fixture = TestBed.createComponent(CtScan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
