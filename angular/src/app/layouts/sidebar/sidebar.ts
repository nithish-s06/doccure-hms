import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from '../../core/services/data/data.service';
import { SideBar, SideBarMenu, SideBarSubMenu } from '../../core/model/model';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SidebarToggleService } from '../../core/services/layout/sidebar-toggle.service';
import { SidebarEnhancementsService } from '../../core/services/layout/sidebar-enhancements.service';

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive,NgScrollbarModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit, AfterViewInit {
  sidebarData: SideBar[] = [];

  constructor(
    private dataService: DataService,
    private router: Router,
    private sidebarToggleService: SidebarToggleService,
    private sidebarEnhancementsService: SidebarEnhancementsService
  ) {}

  ngOnInit(): void {
    this.dataService.sidebarData$.subscribe((data) => {
      this.sidebarData = data;
    });
  }

  ngAfterViewInit(): void {
    this.sidebarToggleService.init();
    // Sidebar menu links render asynchronously from sidebarData$, so defer
    // building the search index until the current microtask has flushed.
    setTimeout(() => this.sidebarEnhancementsService.init());
  }

  toggleSection(section: SideBar): void {
    const opening = !section.showSubRoute;
    this.sidebarData.forEach((s) => (s.showSubRoute = false));
    section.showSubRoute = opening;
  }

  toggleMenu(menu: SideBarMenu): void {
    const opening = !menu.showSubRoute;
    const section = this.sidebarData.find((s) => s.menu.includes(menu));
    section?.menu.forEach((m) => (m.showSubRoute = false));
    menu.showSubRoute = opening;
  }

  isMenuActive(menu: SideBarMenu): boolean {
    return !!menu.base && this.router.url.includes(menu.base);
  }

  isSubMenuActive(subMenu: SideBarSubMenu): boolean {
    return !!subMenu.base && this.router.url.includes(subMenu.base);
  }
}
