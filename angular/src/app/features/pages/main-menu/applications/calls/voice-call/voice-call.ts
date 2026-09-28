import { Component } from '@angular/core';
import { createIcons ,icons} from 'lucide';
@Component({
  selector: 'app-voice-call',
  imports: [],
  templateUrl: './voice-call.html',
  styleUrl: './voice-call.css',
})
export class VoiceCall{
  ngAfterViewInit() {
   createIcons({ icons });
  }
}
