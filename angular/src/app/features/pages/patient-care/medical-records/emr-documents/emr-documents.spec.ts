import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmrDocuments } from './emr-documents';

describe('EmrDocuments', () => {
  let component: EmrDocuments;
  let fixture: ComponentFixture<EmrDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmrDocuments],
    }).compileComponents();

    fixture = TestBed.createComponent(EmrDocuments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
