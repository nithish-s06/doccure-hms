import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SampleCollection } from './sample-collection';

describe('SampleCollection', () => {
  let component: SampleCollection;
  let fixture: ComponentFixture<SampleCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SampleCollection],
    }).compileComponents();

    fixture = TestBed.createComponent(SampleCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
