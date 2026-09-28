import { Component } from '@angular/core';
import { createIcons ,icons} from 'lucide';
@Component({
  selector: 'app-video-call',
  imports: [],
  templateUrl: './video-call.html',
  styleUrl: './video-call.css',
})
export class VideoCall{
  ngAfterViewInit() {
   createIcons({ icons });
  }
}
