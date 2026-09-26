import { Injectable } from '@angular/core';
import { apiResultFormat, SideBar } from '../../model/model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { All_Routes } from '../../helpers/routes';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly initialSidebarData: SideBar[] = [
    {
      tittle: 'Overview',
      menu: [
        {
          menuValue: 'Dashboard',
          route: All_Routes.index,
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'layout-dashboard',
          base: 'index',
          subMenus: [],
        },
      ],
    },
    {
      tittle: 'Applications',
      menu: [
        {
          menuValue: 'Applications',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'layout-grid',
          base: 'applications',
          subMenus: [
            { menuValue: 'Chat', route: All_Routes.chat, base: 'chat' },
            { menuValue: 'Calls', base: 'calls'
              ,subMenusTwo:[
                { menuValue: 'Voice Call', route: All_Routes.voiceCall, base: 'voice-call' },
                { menuValue: 'Video Call', route: All_Routes.videoCall, base: 'video-call' },
              ]
             },
            { menuValue: 'Calendar', route: All_Routes.calendar, base: 'calendar' },
            { menuValue: 'Email', route: All_Routes.email, base: 'email' },
            { menuValue: 'File Manager', route: All_Routes.fileManager, base: 'file-manager' },
            { menuValue: 'Notes', route: All_Routes.notes, base: 'notes' },
            { menuValue: 'To Do', route: All_Routes.todo, base: 'todo' },
            { menuValue: 'Workflow & Approvals', route: All_Routes.workflowApprovals, base: 'workflow-approvals' },
            { menuValue: 'Workflow Requests', route: All_Routes.workflowRequests, base: 'workflow-requests' },
            { menuValue: 'Workflow Actions', route: All_Routes.workflowActions, base: 'workflow-actions' },
            { menuValue: 'Approval Levels', route: All_Routes.workflowApprovalLevels, base: 'workflow-approval-levels' },
          ],
        },
      ]
    },
    {
      tittle: 'Layouts',
      menu: [
        {
          menuValue: 'Layouts',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'cuboid',
          base: 'layouts',
          subMenus: [
            { menuValue: 'Mini Sidebar', route: All_Routes.layoutMini,base:'layout-mini' },
            { menuValue: 'Hover View', route: All_Routes.layoutHoverview,base:'layout-hoverview' },
            { menuValue: 'Hidden Menu', route: All_Routes.layoutHidden,base:'layout-hidden' },
            { menuValue: 'Full Width', route: All_Routes.layoutFullwidth,base:'layout-fullwidth' },
            { menuValue: 'RTL', route: All_Routes.layoutRTL,base:'layout-rtl' },
          ],
        },
      ],
    },
    // {
    //   tittle: 'Sales',
    //   menu: [
    //     { menuValue: 'Orders', route: All_Routes.salesOrders, hasSubRoute: false, showSubRoute: false, icon: 'receipt', base: 'sales-orders', subMenus: [] },
    //     { menuValue: 'Payments', route: All_Routes.payments, hasSubRoute: false, showSubRoute: false, icon: 'credit-card', base: 'payments', badgeText: '3', badgeClass: 'nb-red', subMenus: [] },
    //     { menuValue: 'Invoices', route: All_Routes.invoices, hasSubRoute: false, showSubRoute: false, icon: 'file-text', base: 'invoices', subMenus: [] },
    //     { menuValue: 'Offers & Coupons', route: All_Routes.offers, hasSubRoute: false, showSubRoute: false, icon: 'tag', base: 'offers', subMenus: [] },
    //   ],
    // },
    // {
    //   tittle: 'Members',
    //   menu: [
    //     { menuValue: 'Leads & Enquiries', route: All_Routes.leadsEnquiries, hasSubRoute: false, showSubRoute: false, icon: 'user-plus', base: 'leads-enquiries', subMenus: [] },
    //     { menuValue: 'Members', route: All_Routes.members, hasSubRoute: false, showSubRoute: false, icon: 'users', base: 'members', subMenus: [] },
    //     { menuValue: 'Membership Plans', route: All_Routes.membershipPlans, hasSubRoute: false, showSubRoute: false, icon: 'star', base: 'membership-plans', subMenus: [] },
    //     { menuValue: 'Renewals', route: All_Routes.renewals, hasSubRoute: false, showSubRoute: false, icon: 'refresh-cw', base: 'renewals', subMenus: [] },
    //     { menuValue: 'Check-In', route: All_Routes.checkin, hasSubRoute: false, showSubRoute: false, icon: 'scan-line', base: 'checkin', subMenus: [] },
    //     { menuValue: 'Day Passes', route: All_Routes.dayPasses, hasSubRoute: false, showSubRoute: false, icon: 'ticket', base: 'day-passes', subMenus: [] },
    //     { menuValue: 'Attendance', route: All_Routes.attendance, hasSubRoute: false, showSubRoute: false, icon: 'calendar-check', base: 'attendance', subMenus: [] },
    //     { menuValue: 'Feedback', route: All_Routes.feedback, hasSubRoute: false, showSubRoute: false, icon: 'message-square', base: 'feedback', subMenus: [] },
    //     { menuValue: 'Challenges', route: All_Routes.challenges, hasSubRoute: false, showSubRoute: false, icon: 'trophy', base: 'challenges', subMenus: [] },
    //     { menuValue: 'Referrals', route: All_Routes.referrals, hasSubRoute: false, showSubRoute: false, icon: 'share-2', base: 'referrals', subMenus: [] },
    //     { menuValue: 'Rewards', route: All_Routes.rewards, hasSubRoute: false, showSubRoute: false, icon: 'gift', base: 'rewards', subMenus: [] },
    //     { menuValue: 'Campaigns', route: All_Routes.campaigns, hasSubRoute: false, showSubRoute: false, icon: 'megaphone', base: 'campaigns', subMenus: [] },
    //   ],
    // },
    // {
    //   tittle: 'Fitness',
    //   menu: [
    //     { menuValue: 'Class Schedule', route: All_Routes.classes, hasSubRoute: false, showSubRoute: false, icon: 'dumbbell', base: 'class-schedule', subMenus: [] },
    //     { menuValue: 'Trainers', route: All_Routes.trainers, hasSubRoute: false, showSubRoute: false, icon: 'award', base: 'trainers', subMenus: [] },
    //     { menuValue: 'PT Sessions', route: All_Routes.ptSessions, hasSubRoute: false, showSubRoute: false, icon: 'calendar-check', base: 'pt-sessions', subMenus: [] },
    //     { menuValue: 'Workout Plans', route: All_Routes.workoutPlans, hasSubRoute: false, showSubRoute: false, icon: 'zap', base: 'workout-plans', subMenus: [] },
    //     { menuValue: 'Diet Plans', route: All_Routes.dietPlans, hasSubRoute: false, showSubRoute: false, icon: 'salad', base: 'diet-plans', subMenus: [] },
    //     { menuValue: 'Body Measurements', route: All_Routes.bodyMeasurements, hasSubRoute: false, showSubRoute: false, icon: 'ruler', base: 'body-measurements', subMenus: [] },
    //   ],
    // },
    // {
    //   tittle: 'Inventory',
    //   menu: [
    //     { menuValue: 'Products', route: All_Routes.products, hasSubRoute: false, showSubRoute: false, icon: 'package', base: 'products', subMenus: [] },
    //     { menuValue: 'Inventory', route: All_Routes.inventory, hasSubRoute: false, showSubRoute: false, icon: 'boxes', base: 'inventory', subMenus: [] },
    //     { menuValue: 'Suppliers', route: All_Routes.suppliers, hasSubRoute: false, showSubRoute: false, icon: 'truck', base: 'suppliers', subMenus: [] },
    //     { menuValue: 'Equipment', route: All_Routes.equipment, hasSubRoute: false, showSubRoute: false, icon: 'wrench', base: 'equipment', subMenus: [] },
    //   ],
    // },
    // {
    //   tittle: 'Finance',
    //   menu: [
    //     { menuValue: 'Expenses', route: All_Routes.expenses, hasSubRoute: false, showSubRoute: false, icon: 'trending-down', base: 'expenses', subMenus: [] },
    //     { menuValue: 'Payroll', route: All_Routes.payroll, hasSubRoute: false, showSubRoute: false, icon: 'banknote', base: 'payroll', subMenus: [] },
    //     { menuValue: 'Reports', route: All_Routes.reports, hasSubRoute: false, showSubRoute: false, icon: 'bar-chart-3', base: 'reports', subMenus: [] },
    //     { menuValue: 'Analytics', route: All_Routes.analytics, hasSubRoute: false, showSubRoute: false, icon: 'trending-up', base: 'analytics', subMenus: [] },
    //   ],
    // },
    // {
    //   tittle: 'Facility',
    //   menu: [
    //     { menuValue: 'Staff & Roster', route: All_Routes.staffRoster, hasSubRoute: false, showSubRoute: false, icon: 'id-card', base: 'staff-roster', subMenus: [] },
    //     { menuValue: 'Access Control', route: All_Routes.accessControl, hasSubRoute: false, showSubRoute: false, icon: 'door-open', base: 'access-control', subMenus: [] },
    //     { menuValue: 'Locker Management', route: All_Routes.lockers, hasSubRoute: false, showSubRoute: false, icon: 'lock', base: 'lockers', subMenus: [] },
    //     { menuValue: 'Branches', route: All_Routes.branches, hasSubRoute: false, showSubRoute: false, icon: 'building-2', base: 'branches', subMenus: [] },
    //     { menuValue: 'Calendar', route: All_Routes.calendarFacility, hasSubRoute: false, showSubRoute: false, icon: 'calendar', base: 'facility-calendar', subMenus: [] },
    //     { menuValue: 'Chat', route: All_Routes.chatFacility, hasSubRoute: false, showSubRoute: false, icon: 'message-circle', base: 'facility-chat', subMenus: [] },
    //     { menuValue: 'Announcements', route: All_Routes.announcements, hasSubRoute: false, showSubRoute: false, icon: 'megaphone', base: 'announcements', subMenus: [] },
    //     { menuValue: 'Settings', route: All_Routes.settings, hasSubRoute: false, showSubRoute: false, icon: 'settings', base: 'settings', subMenus: [] },
    //   ],
    // },
    {
      tittle: 'UI Interface',
      menu: [
        {
          menuValue: 'Base UI',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'squares-unite',
          base: 'base-ui',
          subMenus: [
            { menuValue: 'Alerts', route: All_Routes.uialerts, base: 'alerts' },
            { menuValue: 'Accordion', route: All_Routes.uiaccordion, base: 'accordion' },
            { menuValue: 'Avatar', route: All_Routes.uiavatar, base: 'avatar' },
            { menuValue: 'Badges', route: All_Routes.uibadges, base: 'badges' },
            { menuValue: 'Buttons', route: All_Routes.uibuttons, base: 'buttons' },
            { menuValue: 'Button Group', route: All_Routes.uibuttonsGroup, base: 'buttons-group' },
            { menuValue: 'Breadcrumb', route: All_Routes.uibreadcrumb, base: 'breadcrumb' },
            { menuValue: 'Card', route: All_Routes.uicards, base: 'cards' },
            { menuValue: 'Colors', route: All_Routes.uicolors, base: 'colors' },
            { menuValue: 'Collapse', route: All_Routes.uicollapse, base: 'collapse' },
            { menuValue: 'Dropdowns', route: All_Routes.uidropdowns, base: 'dropdowns' },
            { menuValue: 'Grid', route: All_Routes.uigrid, base: 'grid' },
            { menuValue: 'Images', route: All_Routes.uiimages, base: 'images' },
            { menuValue: 'Modals', route: All_Routes.uimodals, base: 'modals' },
            { menuValue: 'Offcanvas', route: All_Routes.uioffcanvas, base: 'offcanvas' },
            { menuValue: 'Pagination', route: All_Routes.uipagination, base: 'pagination' },
            { menuValue: 'Popovers', route: All_Routes.uipopovers, base: 'popovers' },
            { menuValue: 'Progress', route: All_Routes.uiprogress, base: 'progress' },
            { menuValue: 'Tabs', route: All_Routes.uinavTabs, base: 'nav-tabs' },
            { menuValue: 'Typography', route: All_Routes.uitypography, base: 'typography' },
          ],
        },
        {
          menuValue: 'Advanced UI',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'sparkles',
          base: 'advanced-ui',
          subMenus: [
            { menuValue: 'Dragula', route: All_Routes.uidragDrop, base: 'drag-drop' },
            { menuValue: 'Clipboard', route: All_Routes.uiclipboard, base: 'clipboard' },
            { menuValue: 'Range Slider', route: All_Routes.uirangeSlider, base: 'range-slider' },
            { menuValue: 'Lightbox', route: All_Routes.uilightbox, base: 'lightbox' },
          ],
        },
        {
          menuValue: 'Forms',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'square-pen',
          base: 'forms',
          subMenus: [
            { menuValue: 'Form Elements', route: All_Routes.uiformElement, base: 'form-element' },
            { menuValue: 'Select2', route: All_Routes.uiselect, base: 'select' },
            { menuValue: 'Form Editor', route: All_Routes.uiformEditor, base: 'form-editor' },
            { menuValue: 'Form Picker', route: All_Routes.uiformPicker, base: 'form-picker' },
          ],
        },
        {
          menuValue: 'Tables',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'table',
          base: 'tables',
          subMenus: [
            { menuValue: 'Basic Tables', route: All_Routes.uibasicTables, base: 'basic-tables' },
            { menuValue: 'Data Table', route: All_Routes.uidataTables, base: 'data-tables' },
          ],
        },
        {
          menuValue: 'Charts',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'chart-pie',
          base: 'charts',
          subMenus: [
            { menuValue: 'Apex Charts', route: All_Routes.uiapexChart, base: 'apexchart' },
            { menuValue: 'Chart Js', route: All_Routes.uichartjs, base: 'chartjs' },
          ],
        },
        {
          menuValue: 'Icons',
          route: 'javascript:void(0);',
          hasSubRoute: true,
          showSubRoute: false,
          icon: 'shapes',
          base: 'icons',
          subMenus: [
            { menuValue: 'Fontawesome Icons', route: All_Routes.uifontawesome, base: 'fontawesome' },
            { menuValue: 'Tabler Icons', route: All_Routes.uitabler, base: 'tabler' },
            { menuValue: 'Lucide', route: All_Routes.uilucide, base: 'lucide' },
            { menuValue: 'Phosphor', route: All_Routes.uiphosphor, base: 'phosphor' },
          ],
        },
      ],
    },
  ];

  private sidebarDataSubject = new BehaviorSubject<SideBar[]>(this.initialSidebarData);
  public sidebarData$ = this.sidebarDataSubject.asObservable();

  constructor(private http: HttpClient) { }
  public getDataTable(): Observable<apiResultFormat> {
    return this.http.get<apiResultFormat>('assets/json/data-tables.json').pipe(
      map((res: apiResultFormat) => {
        return res;
      })
    );
  }


}
