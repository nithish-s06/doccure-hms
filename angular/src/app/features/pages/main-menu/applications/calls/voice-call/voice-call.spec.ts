import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoiceCall } from './voice-call';

describe('VoiceCall', () => {
  let component: VoiceCall;
  let fixture: ComponentFixture<VoiceCall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoiceCall],
    }).compileComponents();

    fixture = TestBed.createComponent(VoiceCall);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
