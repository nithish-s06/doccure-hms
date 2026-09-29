import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueueTokenDetail } from './queue-token-detail';

describe('QueueTokenDetail', () => {
  let component: QueueTokenDetail;
  let fixture: ComponentFixture<QueueTokenDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QueueTokenDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(QueueTokenDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
