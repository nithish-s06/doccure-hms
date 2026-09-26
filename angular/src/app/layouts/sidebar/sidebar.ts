import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../core/services/data/data.service';
import { SideBar, SideBarMenu, SideBarSubMenu } from '../../core/model/model';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive,NgScrollbarModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit {
  sidebarData: SideBar[] = [];

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.dataService.sidebarData$.subscribe((data) => {
      this.sidebarData = data;
    });
  }

  toggleSection(section: SideBar): void {
    section.showSubRoute = !section.showSubRoute;
  }

  toggleMenu(menu: SideBarMenu): void {
    menu.showSubRoute = !menu.showSubRoute;
  }

  isMenuActive(menu: SideBarMenu): boolean {
    return !!menu.base && this.router.url.includes(menu.base);
  }

  isSubMenuActive(subMenu: SideBarSubMenu): boolean {
    return !!subMenu.base && this.router.url.includes(subMenu.base);
  }
}
