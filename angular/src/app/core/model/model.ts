export interface apiResultFormat {
  data: [];
  totalData: number;
}
export interface SidebarTab {
  title: string;
  icon: string;
  tabId: string;
  active?: boolean;
  badge?: string;
}
export interface SidebarItem {
  menuValue?: string;
  sectionTitle?: string;
  icon?: string;
  routes?: string;
  dataParent?: string;
  badge?: string;
  base?:string;
  children?: SidebarItem[];
}
export interface SidebarPanel {
  id: string;
  active: boolean;
  hasSubRoute:boolean;
  menus: menuItem[];
}
export interface menuItem{
  title:string;
  items:SidebarItem[];
}
export interface SidebarData {
  tabGroups: SidebarTab[][];
  mainData: SidebarPanel[];
}

export interface SideBarSubMenu {
  menuValue: string;
  route?: string;
  base?: string;
  href?: string;
  external?: boolean;
  subMenusTwo?:SideBarSubMenu[]
}

export interface SideBarMenu {
  menuValue: string;
  route?: string;
  href?: string;
  external?: boolean;
  hasSubRoute: boolean;
  showSubRoute: boolean;
  badgeText?: string;
  badgeClass?: string;
  icon: string;
  base: string;
  subMenus: SideBarSubMenu[];
}

export interface SideBar {
  tittle: string;
  menu: SideBarMenu[];
}

export interface dataTables {
  isSelected: boolean;
  sNo?: number;
  name?: string;
  position?: string;
  office?: string;
  age?: string;
  salary?: string;
  startDate?: string;
  id?: string;
}
