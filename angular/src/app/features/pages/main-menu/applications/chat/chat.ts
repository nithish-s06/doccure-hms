import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { createIcons ,icons} from 'lucide';
import { All_Routes } from '../../../../../core/helpers/routes';
@Component({
  selector: 'app-chat',
  imports: [RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat{
  AllRoutes = All_Routes;
  ngAfterViewInit() {
   createIcons({ icons });
  }
}
