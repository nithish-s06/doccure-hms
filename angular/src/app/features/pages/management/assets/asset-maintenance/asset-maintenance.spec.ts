import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetMaintenance } from './asset-maintenance';

describe('AssetMaintenance', () => {
  let component: AssetMaintenance;
  let fixture: ComponentFixture<AssetMaintenance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetMaintenance],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetMaintenance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
