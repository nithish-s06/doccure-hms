import { Component, ElementRef, Renderer2 } from '@angular/core';
import { CommonService } from '../../core/services/common/common.service';
import { NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'app-breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
    breadcrumbtitle='';
  base='';
  page='';
  currentUrl='';
  constructor(private el: ElementRef, private renderer: Renderer2,private common:CommonService,
    private router: Router,
   ) {
      router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getRoutes(event);
      }
    });
    this.getRoutes(this.router);

   }
   private getRoutes(route: { url: string }): void {
    const bodyTag = document.body;
    bodyTag.classList.remove('slide-nav');
    bodyTag.classList.remove('opened');

    const url = route.url.split('?')[0].split('#')[0];
    this.currentUrl = url;

    const splitVal = url.split('/');
    this.base = splitVal[1] || '';
    this.page = splitVal[2] || '';

    const titleSegment = this.page || this.base;
    this.breadcrumbtitle = this.formatTitle(titleSegment);
  }

  private formatTitle(value: string): string {
    return value
      .split('-')
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
