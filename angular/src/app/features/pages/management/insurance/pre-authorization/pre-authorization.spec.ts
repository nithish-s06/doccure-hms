import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreAuthorization } from './pre-authorization';

describe('PreAuthorization', () => {
  let component: PreAuthorization;
  let fixture: ComponentFixture<PreAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreAuthorization],
    }).compileComponents();

    fixture = TestBed.createComponent(PreAuthorization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
