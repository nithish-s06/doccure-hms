import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BedStatus } from './bed-status';

describe('BedStatus', () => {
  let component: BedStatus;
  let fixture: ComponentFixture<BedStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BedStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(BedStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
