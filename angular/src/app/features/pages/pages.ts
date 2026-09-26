import { Component } from '@angular/core';
import { Sidebar } from '../../layouts/sidebar/sidebar';
import { Header } from '../../layouts/header/header';
import { RouterModule } from '@angular/router';
import { createIcons ,icons} from 'lucide';
import { SettingsService } from '../../core/services/settings/settings.service';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-pages',
  imports: [Sidebar,Header,RouterModule,AsyncPipe],
  templateUrl: './pages.html',
  styleUrl: './pages.css',
})
export class Pages{
  constructor(public settings:SettingsService){}
  ngAfterViewInit() {
   createIcons({ icons });
  }
}
