import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmsTemplates } from './sms-templates';

describe('SmsTemplates', () => {
  let component: SmsTemplates;
  let fixture: ComponentFixture<SmsTemplates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsTemplates],
    }).compileComponents();

    fixture = TestBed.createComponent(SmsTemplates);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
