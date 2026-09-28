import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailView } from './email-view';

describe('EmailView', () => {
  let component: EmailView;
  let fixture: ComponentFixture<EmailView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailView],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
