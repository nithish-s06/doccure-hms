import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedTransfer } from './bed-transfer';

describe('BedTransfer', () => {
  let component: BedTransfer;
  let fixture: ComponentFixture<BedTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedTransfer],
    }).compileComponents();

    fixture = TestBed.createComponent(BedTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
