import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetCategories } from './asset-categories';

describe('AssetCategories', () => {
  let component: AssetCategories;
  let fixture: ComponentFixture<AssetCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetCategories],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
