import { ChangeDetectorRef, Component, Renderer2, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, Event as RouterEvent, RouterOutlet } from '@angular/router';
import { HSStaticMethods } from 'preline';
import { CommonService } from './core/services/common/common.service';
import { TitleCasePipe } from '@angular/common';
import { SettingsService } from './core/services/settings/settings.service';
import { createIcons, icons } from 'lucide';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,TitleCasePipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('angular');

  base='';
  page='';
  tittle ='';
  constructor(private settings:SettingsService, private cdr: ChangeDetectorRef,private router: Router,private renderer:Renderer2)
   {
      this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        const URL = event.url.split('/');
        this.base = URL[1]?.replaceAll('-',' ')+' ';
        this.page = URL[2]?.replaceAll('-',' ')+' ';
        if (this.base.includes('index') || this.base.includes('employee-dashboard')) {
          this.base = 'Dashboard ';
        }
        if(this.base === 'base-ui'){
          this.base === this.page;
        }
      }
      // if (event instanceof NavigationEnd){}
    });
  }

 formatTitle(value: string): string {
  if (!value) return '';

  return value
    .split('-') // split by -
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
    .join(' '); // join with space
}
ngAfterViewInit() {
  createIcons({ icons });
}
  ngOnInit() {
  this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      setTimeout(() => {
        HSStaticMethods.autoInit();
      });
    }
  });
  this.settings.changeThemeColor('light')
}
}
