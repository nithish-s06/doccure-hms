import { Component } from '@angular/core';
import { createIcons ,icons} from 'lucide';

@Component({
  selector: 'app-phosphor',
  imports: [],
  templateUrl: './phosphor.html',
  styleUrl: './phosphor.css',
})
export class Phosphor {
  ngAfterViewInit() {
   createIcons({ icons });
  }
}
