import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackupDetail } from './backup-detail';

describe('BackupDetail', () => {
  let component: BackupDetail;
  let fixture: ComponentFixture<BackupDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BackupDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
