import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface Doc {
  id: number;
  name: string;
  dept: string;
  spec: string;
  exp: number;
  c: string;
  shift: string;
  time: string;
  status: string;
  slots: number;
  booked: number;
  patients: number;
  upcoming: number;
  dur: number;
  ctype: string;
  oncall: number;
  phone: string;
  load: number;
  week: number[];
}

interface Leave {
  name: string;
  type: string;
  range: string;
  c: string;
  status: string;
}

interface Activity {
  ic: string;
  c: string;
  t: string;
  s: string;
  tm: string;
}

interface Kpi {
  l: string;
  v: number;
  ic: string;
  c: string;
  p: number;
  ch: string;
  spark: number[];
}

interface ModalDef {
  t: string;
  ic: string;
  danger?: boolean;
  noValidate?: boolean;
  cta: string;
  body: (d?: Doc) => string;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "doctor-availability".
 * List/board views of doctor availability, a shift timeline, schedule tools,
 * leaves/activity sidebars, a right-side detail drawer, an action menu, a
 * generic modal engine (assign/leave/block/oncall/import/export/delete) and
 * bulk selection — all backed by in-memory seed data.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-doctor-availability',
  styleUrl: './doctor-availability.css',
  templateUrl: './doctor-availability.html',
})
export class DoctorAvailability implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STATUS: Record<string, { c: string }> = {
    Available: { c: '#10b981' },
    'In Consultation': { c: '#0ea5e9' },
    'On Leave': { c: '#f59e0b' },
    'Fully Booked': { c: '#8b5cf6' },
    'Off Duty': { c: '#94a3b8' },
  };
  private readonly DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  private DOCS: Doc[] = [
    { id: 1, name: 'Dr. Sarah Roberts', dept: 'Cardiology', spec: 'Interventional Cardiology', exp: 14, c: '#ef4444', shift: 'Morning', time: '09:00–17:00', status: 'Available', slots: 6, booked: 12, patients: 14, upcoming: 4, dur: 20, ctype: 'Both', oncall: 0, phone: '+91 98765 43210', load: 88, week: [1, 1, 1, 1, 1, 0, 0] },
    { id: 2, name: 'Dr. Vikram Nair', dept: 'Neurology', spec: 'Stroke & Neuro-diagnostics', exp: 11, c: '#8b5cf6', shift: 'Evening', time: '14:00–22:00', status: 'In Consultation', slots: 2, booked: 16, patients: 16, upcoming: 6, dur: 30, ctype: 'In-person', oncall: 1, phone: '+91 98765 11223', load: 82, week: [1, 1, 1, 1, 1, 1, 0] },
    { id: 3, name: 'Dr. Anita Desai', dept: 'Orthopedics', spec: 'Joint Replacement', exp: 9, c: '#0ea5e9', shift: 'Morning', time: '08:00–14:00', status: 'Fully Booked', slots: 0, booked: 18, patients: 18, upcoming: 8, dur: 25, ctype: 'In-person', oncall: 0, phone: '+91 98765 33445', load: 96, week: [1, 1, 1, 0, 1, 1, 0] },
    { id: 4, name: 'Dr. Meera Iyer', dept: 'Pediatrics', spec: 'Neonatology', exp: 7, c: '#f59e0b', shift: 'Morning', time: '09:00–15:00', status: 'Available', slots: 9, booked: 8, patients: 8, upcoming: 3, dur: 15, ctype: 'Both', oncall: 1, phone: '+91 98765 55667', load: 64, week: [1, 1, 1, 1, 0, 0, 1] },
    { id: 5, name: 'Dr. Rajesh Menon', dept: 'Oncology', spec: 'Medical Oncology', exp: 16, c: '#ec4899', shift: 'Afternoon', time: '12:00–18:00', status: 'In Consultation', slots: 3, booked: 14, patients: 14, upcoming: 5, dur: 30, ctype: 'In-person', oncall: 0, phone: '+91 98765 77889', load: 91, week: [1, 1, 1, 1, 1, 0, 0] },
    { id: 6, name: 'Dr. John Mathew', dept: 'Emergency', spec: 'Emergency Medicine', exp: 12, c: '#f43f5e', shift: 'Night', time: '22:00–06:00', status: 'On Leave', slots: 0, booked: 0, patients: 0, upcoming: 0, dur: 20, ctype: 'In-person', oncall: 1, phone: '+91 98765 99001', load: 0, week: [0, 0, 1, 1, 1, 1, 0] },
    { id: 7, name: 'Dr. Priya Sharma', dept: 'Gynecology', spec: 'Obstetrics', exp: 10, c: '#d946ef', shift: 'Morning', time: '09:00–17:00', status: 'Available', slots: 5, booked: 11, patients: 11, upcoming: 4, dur: 20, ctype: 'Both', oncall: 0, phone: '+91 98765 22110', load: 76, week: [1, 1, 1, 1, 1, 0, 0] },
    { id: 8, name: 'Dr. Deepak Nair', dept: 'Radiology', spec: 'Diagnostic Imaging', exp: 8, c: '#6366f1', shift: 'Morning', time: '08:00–16:00', status: 'Available', slots: 11, booked: 9, patients: 9, upcoming: 2, dur: 15, ctype: 'In-person', oncall: 0, phone: '+91 98765 44332', load: 58, week: [1, 1, 1, 1, 0, 1, 0] },
    { id: 9, name: 'Dr. Sunita Rao', dept: 'ENT', spec: 'Otolaryngology', exp: 6, c: '#14b8a6', shift: 'Evening', time: '15:00–21:00', status: 'Off Duty', slots: 0, booked: 0, patients: 0, upcoming: 0, dur: 20, ctype: 'Both', oncall: 1, phone: '+91 98765 66778', load: 0, week: [1, 0, 1, 1, 1, 0, 1] },
    { id: 10, name: 'Dr. Karan Malhotra', dept: 'Dermatology', spec: 'Cosmetic Dermatology', exp: 5, c: '#10b981', shift: 'Afternoon', time: '13:00–19:00', status: 'Available', slots: 8, booked: 7, patients: 7, upcoming: 3, dur: 15, ctype: 'Both', oncall: 0, phone: '+91 98765 88990', load: 52, week: [1, 1, 0, 1, 1, 1, 0] },
    { id: 11, name: 'Dr. Arjun Menon', dept: 'Nephrology', spec: 'Dialysis & Transplant', exp: 13, c: '#0891b2', shift: 'Morning', time: '09:00–16:00', status: 'Fully Booked', slots: 0, booked: 15, patients: 15, upcoming: 6, dur: 25, ctype: 'In-person', oncall: 1, phone: '+91 98765 10101', load: 90, week: [1, 1, 1, 1, 0, 1, 0] },
    { id: 12, name: 'Dr. Fatima Sheikh', dept: 'Psychiatry', spec: 'Behavioral Health', exp: 4, c: '#a855f7', shift: 'Morning', time: '10:00–16:00', status: 'Available', slots: 7, booked: 5, patients: 5, upcoming: 2, dur: 40, ctype: 'Video', oncall: 0, phone: '+91 98765 20202', load: 48, week: [1, 1, 1, 0, 1, 0, 0] },
  ];

  private readonly LEAVES: Leave[] = [
    { name: 'Dr. John Mathew', type: 'Sick Leave', range: 'Jul 17 – Jul 19', c: '#f43f5e', status: 'Approved' },
    { name: 'Dr. Robert Chen', type: 'Annual Leave', range: 'Jul 18 – Jul 25', c: '#0ea5e9', status: 'Pending' },
    { name: 'Independence Day', type: 'Public Holiday', range: 'Aug 15', c: '#8b5cf6', status: 'Holiday' },
    { name: 'Dr. Nina Roy', type: 'Conference', range: 'Jul 21 – Jul 23', c: '#14b8a6', status: 'Pending' },
  ];
  private readonly ACTIVITY: Activity[] = [
    { ic: 'ti-clock-share', c: '#0ea5e9', t: 'Shift assigned to Dr. Priya Sharma', s: 'Morning · 09:00–17:00', tm: '5m ago' },
    { ic: 'ti-plane', c: '#f59e0b', t: 'Leave approved for Dr. John Mathew', s: 'Sick leave · 3 days', tm: '22m ago' },
    { ic: 'ti-toggle-right', c: '#10b981', t: 'Dr. Deepak Nair marked Available', s: '08:00–16:00', tm: '1h ago' },
    { ic: 'ti-phone-call', c: '#8b5cf6', t: 'On-call assigned to Dr. Meera Iyer', s: 'Pediatrics', tm: '2h ago' },
    { ic: 'ti-calendar-cog', c: '#ec4899', t: 'Schedule modified — Cardiology', s: '3 doctors updated', tm: '3h ago' },
    { ic: 'ti-building-hospital', c: '#6366f1', t: 'Radiology department hours extended', s: 'Now open till 20:00', tm: '5h ago' },
  ];
  private readonly KPIS: Kpi[] = [
    { l: 'Available Doctors', v: 42, ic: 'ti-user-check', c: '#10b981', p: 72, ch: '+6', spark: [30, 34, 33, 38, 40, 39, 42] },
    { l: 'In Consultation', v: 23, ic: 'ti-stethoscope', c: '#0ea5e9', p: 55, ch: 'live', spark: [18, 20, 19, 22, 21, 24, 23] },
    { l: 'On Leave', v: 5, ic: 'ti-plane', c: '#f59e0b', p: 12, ch: '2 pending', spark: [3, 4, 4, 5, 4, 5, 5] },
    { l: 'Emergency On-call', v: 8, ic: 'ti-phone-call', c: '#ef4444', p: 33, ch: '3 depts', spark: [6, 7, 6, 8, 7, 8, 8] },
  ];

  private state: {
    q: string;
    view: 'list' | 'board';
    filters: Record<string, string>;
    sel: Record<string, boolean>;
  } = { q: '', view: 'list', filters: { dept: '', spec: '', shift: '', status: '', exp: '', ctype: '', date: '', sort: 'name' }, sel: {} };

  private DEPTS: string[] = [];
  private menuDoc: number | null = null;

  private readonly MODALS: Record<string, ModalDef> = {};

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.DEPTS = this.DOCS.map((d) => d.dept).filter((v, i, a) => a.indexOf(v) === i);
    const fld = (label: string, inner: string) => `<div><label class="da-lbl">${label}</label>${inner}</div>`;
    const selDoc = () => `<select class="da-inp">${this.DOCS.map((d) => `<option>${this.esc(d.name)}</option>`).join('')}</select>`;
    this.MODALS = {
      addavail: {
        t: 'Add Availability',
        ic: 'ti-calendar-plus',
        cta: 'Save Availability',
        body: () =>
          '<div class="space-y-3">' +
          fld('Doctor', selDoc()) +
          '<div class="grid grid-cols-2 gap-3">' +
          fld('Date', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          fld('Shift', '<select class="da-inp"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option></select>') +
          '</div><div class="grid grid-cols-2 gap-3">' +
          fld('From', '<input type="text" placeholder="--:-- --" class="da-inp" data-provider="timepickr" data-default-time="09:00">') +
          fld('To', '<input type="text" placeholder="--:-- --" class="da-inp" data-provider="timepickr" data-default-time="17:00">') +
          '</div>' +
          fld('Consultation Type', '<select class="da-inp"><option>In-person</option><option>Video</option><option>Both</option></select>') +
          '</div>',
      },
      assign: {
        t: 'Assign Shift',
        ic: 'ti-clock-share',
        cta: 'Assign Shift',
        body: () =>
          '<div class="space-y-3">' +
          fld('Doctor', selDoc()) +
          '<div class="grid grid-cols-2 gap-3">' +
          fld('Shift', '<select class="da-inp"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option><option>On-call</option></select>') +
          fld('Repeat', '<select class="da-inp"><option>This week</option><option>Every week</option><option>Weekdays</option><option>Custom</option></select>') +
          '</div>' +
          fld('Notes', '<input class="da-inp" placeholder="Optional">') +
          '</div>',
      },
      block: {
        t: 'Block Schedule',
        ic: 'ti-calendar-off',
        cta: 'Block Schedule',
        body: () =>
          '<div class="space-y-3">' +
          fld('Doctor', selDoc()) +
          '<div class="grid grid-cols-2 gap-3">' +
          fld('From', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          fld('To', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          '</div>' +
          fld('Reason', '<select class="da-inp"><option>Meeting</option><option>Surgery block</option><option>Administrative</option><option>Personal</option></select>') +
          '</div>',
      },
      addleave: {
        t: 'Add Leave',
        ic: 'ti-plane-departure',
        cta: 'Submit Leave',
        body: () =>
          '<div class="space-y-3">' +
          fld('Doctor', selDoc()) +
          '<div class="grid grid-cols-2 gap-3">' +
          fld('From', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          fld('To', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          '</div>' +
          fld('Type', '<select class="da-inp"><option>Annual Leave</option><option>Sick Leave</option><option>Conference</option><option>Emergency</option></select>') +
          fld('Reason', '<textarea class="da-inp" rows="2"></textarea>') +
          '</div>',
      },
      oncall: {
        t: 'Assign On-call',
        ic: 'ti-phone-call',
        cta: 'Assign On-call',
        body: () =>
          '<div class="space-y-3">' +
          fld('Doctor', selDoc()) +
          '<div class="grid grid-cols-2 gap-3">' +
          fld('Date', '<input type="text" placeholder="dd-mm-yyyy" class="da-inp" data-provider="flatpickr" data-date-format="d-m-Y">') +
          fld('Coverage', '<select class="da-inp"><option>24 hours</option><option>Night only</option><option>Weekend</option></select>') +
          '</div>' +
          fld('Department', `<select class="da-inp">${this.DEPTS.map((x) => `<option>${this.esc(x)}</option>`).join('')}</select>`) +
          '</div>',
      },
      appts: {
        t: 'Appointments',
        ic: 'ti-calendar-event',
        cta: 'Close',
        noValidate: true,
        body: () => {
          const rows = [
            { n: 'Ravi Kumar', t: '09:00', r: 'Follow-up' },
            { n: 'Anita Desai', t: '10:30', r: 'New patient' },
            { n: 'Mohammed Ali', t: '14:00', r: 'Review' },
          ];
          return (
            '<div class="space-y-2">' +
            rows
              .map(
                (r) =>
                  `<div class="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--color-border-color)]"><span class="da-tag" style="background:${this.mix('#0ea5e9')};color:#0284c7">${r.t}</span><span class="text-sm font-bold text-[var(--color-gray-900)] flex-1">${this.esc(r.n)}</span><span class="text-xs da-muted">${this.esc(r.r)}</span></div>`
              )
              .join('') +
            '</div>'
          );
        },
      },
      import: {
        t: 'Import Schedule',
        ic: 'ti-upload',
        cta: 'Start Import',
        body: () =>
          '<div class="space-y-3"><div class="da-drop" id="da-dropzone"><i class="ti ti-cloud-upload text-3xl da-muted"></i><p class="text-sm font-bold text-[var(--color-gray-900)] mt-2">Drag & drop CSV / Excel / Shift Schedule</p><p class="text-xs da-muted">or click to browse files</p><input type="file" class="hidden" id="da-file"></div><div class="flex items-center gap-2"><button class="da-btn da-btn-soft flex-1" data-toast="Sample template downloaded"><i class="ti ti-file-download"></i> Download Sample Template</button></div><div class="p-3 rounded-lg" style="background:' +
          this.mix('#0ea5e9', 8) +
          '"><div class="text-xs font-bold text-[var(--color-gray-900)] mb-1">Import Summary</div><div class="text-xs da-muted" id="da-import-sum">No file selected yet.</div></div></div>',
      },
      export: {
        t: 'Export Schedule',
        ic: 'ti-download',
        cta: 'Export Now',
        body: () => {
          const opts: [string, string][] = [
            ['CSV', 'ti-file-text'],
            ['Excel', 'ti-file-spreadsheet'],
            ['PDF', 'ti-file-typography'],
            ['Print', 'ti-printer'],
          ];
          const scope = ['Weekly Schedule', 'Monthly Schedule', 'Selected Records', 'All Records'];
          return (
            '<div class="space-y-4"><div><div class="da-lbl">Format</div><div class="grid grid-cols-2 gap-2">' +
            opts.map((o, i) => `<button class="da-btn da-btn-soft justify-start da-expfmt${i === 0 ? ' !border-[var(--color-primary)]' : ''}" data-fmt="${o[0]}"><i class="ti ${o[1]}"></i> ${o[0]}</button>`).join('') +
            '</div></div><div><div class="da-lbl">Scope</div><select class="da-inp">' +
            scope.map((s) => `<option>${s}</option>`).join('') +
            '</select></div></div>'
          );
        },
      },
      print: {
        t: 'Print Schedule',
        ic: 'ti-printer',
        cta: 'Print',
        body: () =>
          '<div class="space-y-3">' +
          fld('Range', '<select class="da-inp"><option>Today</option><option>This Week</option><option>This Month</option></select>') +
          fld('Include', '<select class="da-inp"><option>All doctors</option><option>By department</option><option>On-call only</option></select>') +
          '<p class="text-xs da-muted">A print-friendly schedule will open in a new dialog.</p></div>',
      },
      delete: {
        t: 'Delete Confirmation',
        ic: 'ti-trash',
        danger: true,
        cta: 'Delete',
        body: (d?: Doc) =>
          `<div class="text-center py-2"><div class="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3" style="background:${this.mix('#ef4444')};color:#ef4444"><i class="ti ti-alert-triangle text-2xl"></i></div><p class="font-bold text-[var(--color-gray-900)]">Remove ${
            d ? this.esc(d.name) : 'selected records'
          }?</p><p class="text-sm da-muted mt-1">This will remove the availability record. This action cannot be undone.</p></div>`,
      },
    };
  }

  ngAfterViewInit(): void {
    const page = this.byId('da-page');
    if (!page) return;
    if (this.document.body.dataset['page'] !== 'doctor-availability') return;

    /* events */
    this.byId('da-search')?.addEventListener('input', (e: Event) => {
      this.state.q = (e.target as HTMLInputElement).value;
      this.render();
    });
    this.byId('da-filter-toggle')?.addEventListener('click', () => this.byId('da-filters')?.classList.toggle('hidden'));
    this.byId('da-view')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-v]') as HTMLElement | null;
      if (!b) return;
      this.state.view = b.getAttribute('data-v') as 'list' | 'board';
      this.qsa('.da-segb', this.byId('da-view') || undefined).forEach((x) => x.classList.toggle('active', x === b));
      this.render();
    });
    this.qsa<HTMLElement>('[data-f]').forEach((sel) => {
      sel.addEventListener('change', () => {
        this.state.filters[sel.getAttribute('data-f') || ''] = (sel as HTMLInputElement | HTMLSelectElement).value;
        this.updateFilterCount();
        this.render();
      });
    });
    this.byId('da-clear')?.addEventListener('click', () => {
      Object.keys(this.state.filters).forEach((k) => {
        if (k !== 'sort') this.state.filters[k] = '';
      });
      this.qsa<HTMLInputElement | HTMLSelectElement>('[data-f]').forEach((s) => {
        if (s.getAttribute('data-f') !== 'sort') s.value = '';
      });
      this.updateFilterCount();
      this.render();
      this.toast('Filters cleared', 'ti-filter-off');
    });

    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const mo = target.closest('[data-modal]') as HTMLElement | null;
      if (mo) {
        this.openModal(mo.getAttribute('data-modal') || '');
        return;
      }
      const op = target.closest('[data-open]') as HTMLElement | null;
      if (op) {
        this.openDrawer(+(op.getAttribute('data-open') || 0));
        return;
      }
      const mb = target.closest('[data-menu]') as HTMLElement | null;
      if (mb) {
        const r = mb.getBoundingClientRect();
        this.openMenu(+(mb.getAttribute('data-menu') || 0), r.right - 210, r.bottom + 4);
        e.stopPropagation();
        return;
      }
      const ai = target.closest('[data-act]') as HTMLElement | null;
      if (ai) {
        this.doAction(ai.getAttribute('data-act') || '');
        return;
      }
      const tt = target.closest('[data-toast]') as HTMLElement | null;
      if (tt) {
        this.toast(tt.getAttribute('data-toast') || '', 'ti-info-circle');
        return;
      }
      if (target.closest('[data-refresh]')) {
        const upd = this.byId('da-h-updated');
        if (upd) upd.textContent = 'just now';
        this.render();
        this.renderKPIs();
        this.renderWidgets();
        this.animateRings();
        this.toast('Schedule refreshed', 'ti-refresh');
        return;
      }
      const rc = target.closest('.da-rowcb') as HTMLInputElement | null;
      if (rc) {
        this.state.sel[rc.getAttribute('data-id') || ''] = rc.checked;
        this.syncBulk();
        this.syncSelAll();
        return;
      }
      const cl = target.closest('[data-close]') as HTMLElement | null;
      if (cl) {
        const m = cl.closest('.da-drawer,.da-modal');
        if (m) m.classList.remove('open');
        if (!this.qsa('.da-drawer.open,.da-modal.open').length) this.document.body.style.overflow = '';
        return;
      }
      if (!target.closest('#da-menu')) this.closeMenu();
    });
    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeMenu();
        this.qsa('.da-drawer.open,.da-modal.open').forEach((m) => m.classList.remove('open'));
        this.document.body.style.overflow = '';
      }
    });
    window.addEventListener('scroll', () => this.closeMenu(), true);

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.id === 'da-selall') {
        const vis = this.filtered();
        vis.forEach((d) => (this.state.sel[String(d.id)] = target.checked));
        this.render();
        this.syncBulk();
      }
    });

    /* bulk bar */
    this.byId('da-bulk-x')?.addEventListener('click', () => {
      this.state.sel = {};
      this.render();
      this.syncBulk();
    });
    this.qsa<HTMLElement>('[data-bulk]').forEach((b) => {
      b.addEventListener('click', () => {
        const act = b.getAttribute('data-bulk') || '';
        const n = this.selCount();
        if (act === 'delete') {
          Object.keys(this.state.sel).forEach((k) => {
            if (this.state.sel[k]) {
              const i = this.DOCS.map((d) => String(d.id)).indexOf(k);
              if (i >= 0) this.DOCS.splice(i, 1);
            }
          });
          this.state.sel = {};
          this.render();
          this.renderKPIs();
          this.renderWidgets();
          this.animateRings();
          this.syncBulk();
          this.toast(`${n} records deleted`, 'ti-trash');
          return;
        }
        const names: Record<string, string> = { assign: 'Shift assigned to', avail: 'Availability changed for', oncall: 'On-call assigned to', notify: 'Notification sent to', export: 'Exported' };
        this.toast(`${names[act] || 'Updated'} ${n} doctor${n > 1 ? 's' : ''}`, 'ti-check');
      });
    });

    setTimeout(() => {
      this.byId('da-skeleton')?.classList.add('hidden');
      this.byId('da-content')?.classList.remove('hidden');
      requestAnimationFrame(() => this.animateRings());
    }, 1500);
  }

  /* ---------------- helpers ---------------- */

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private qs<T extends Element = Element>(selector: string, root?: ParentNode): T | null {
    return (root || this.document).querySelector(selector);
  }

  private qsa<T extends Element = Element>(selector: string, root?: ParentNode): T[] {
    return Array.prototype.slice.call((root || this.document).querySelectorAll(selector));
  }

  private esc(s: unknown): string {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
  }

  private toast(msg: string, ic?: string): void {
    // Source shows a custom icon per-call; ToastService only carries a tone,
    // so map the "check" icon family to success/info/error tones.
    const tone: 'success' | 'error' | 'info' = ic === 'ti-trash' ? 'error' : ic === 'ti-info-circle' || ic === 'ti-refresh' || ic === 'ti-filter-off' ? 'info' : 'success';
    this.toastService.show(msg, tone);
  }

  private mix(c: string, p?: number): string {
    return `color-mix(in srgb,${c} ${p || 15}%,transparent)`;
  }

  private ini(n: string): string {
    return n
      .replace(/^Dr\.?\s*/i, '')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  private did(n: number): string {
    return `DAV-${String(n).padStart(4, '0')}`;
  }

  private detailUrl(r: Doc): string {
    return `doctor-availability-detail.html?${new URLSearchParams({ id: String(r.id), name: r.name, dept: r.dept, status: r.status }).toString()}`;
  }

  /* ---------------- sparkline ---------------- */

  private spark(data: number[], c: string): string {
    const w = 90;
    const h = 26;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const rng = max - min || 1;
    const pts = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 4) - 2).toFixed(1)}`);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts.join(
      ' '
    )}"/><polyline fill="${this.mix(c, 14)}" stroke="none" points="0,${h} ${pts.join(' ')} ${w},${h}"/></svg>`;
  }

  /* ---------------- KPIs ---------------- */

  private renderKPIs(): void {
    const el = this.byId('da-kpis');
    if (!el) return;
    el.innerHTML = this.KPIS.map(
      (k) =>
        `<div class="da-kpi" style="--kc:${k.c}">` +
        `<div class="flex items-start justify-between mb-2"><div class="da-kpi-ic" style="background:${this.mix(k.c)};color:${k.c}"><i class="ti ${k.ic} text-lg"></i></div>` +
        `<svg viewBox="0 0 36 36" class="da-ring w-11 h-11"><circle cx="18" cy="18" r="15.9155" fill="none" stroke="var(--color-gray-200)" stroke-width="3.4"/><circle class="bar" cx="18" cy="18" r="15.9155" fill="none" stroke="${k.c}" stroke-width="3.4" stroke-linecap="round" pathLength="100" style="--p:${k.p}"/></svg></div>` +
        `<div class="da-kpi-v">${k.v}</div>` +
        `<div class="flex items-center justify-between mt-1"><span class="text-xs da-muted font-semibold">${this.esc(k.l)}</span><span class="da-chip" style="background:${this.mix(k.c)};color:${k.c}">${this.esc(k.ch)}</span></div>` +
        `<div class="mt-2 opacity-90">${this.spark(k.spark, k.c)}</div>` +
        '</div>'
    ).join('');
  }

  /* ---------------- dashboard widgets ---------------- */

  private renderWidgets(): void {
    const byDept: Record<string, { tot: number; av: number; c: string }> = {};
    this.DOCS.forEach((d) => {
      if (!byDept[d.dept]) byDept[d.dept] = { tot: 0, av: 0, c: d.c };
      byDept[d.dept].tot++;
      if (d.status === 'Available' || d.status === 'In Consultation') byDept[d.dept].av++;
    });
    const depts = Object.keys(byDept)
      .filter((k) => k !== 'Pediatrics')
      .slice(0, 6);
    const wDept = this.byId('da-w-dept');
    if (wDept) {
      wDept.innerHTML = depts
        .map((k) => {
          const o = byDept[k];
          const pct = Math.round((o.av / o.tot) * 100);
          return `<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)]">${this.esc(k)}</span><span class="text-xs font-bold da-muted">${o.av}/${o.tot} avail</span></div><div class="da-bar"><span style="width:${pct}%;background:linear-gradient(90deg,${o.c},${this.mix(o.c, 60)})"></span></div></div>`;
        })
        .join('');
    }

    const byLoad = this.DOCS.filter((d) => d.load > 0)
      .slice()
      .sort((a, b) => b.load - a.load)
      .slice(0, 5);
    const wLoad = this.byId('da-w-load');
    if (wLoad) {
      wLoad.innerHTML = byLoad
        .map((d) => {
          const col = d.load >= 90 ? '#ef4444' : d.load >= 75 ? '#f59e0b' : '#10b981';
          return `<div><div class="flex items-center justify-between mb-1"><span class="text-xs font-semibold text-[var(--color-gray-900)] truncate">${this.esc(d.name.replace('Dr. ', 'Dr '))}</span><span class="text-xs font-bold" style="color:${col}">${d.load}%</span></div><div class="da-bar"><span style="width:${d.load}%;background:linear-gradient(90deg,${col},${this.mix(col, 60)})"></span></div></div>`;
        })
        .join('');
    }

    const onc = this.DOCS.filter((d) => d.oncall);
    const wOncall = this.byId('da-w-oncall');
    if (wOncall) {
      wOncall.innerHTML = onc
        .slice(0, 5)
        .map(
          (d) =>
            `<div class="flex items-center gap-2.5"><div class="da-av" style="background:linear-gradient(135deg,${d.c},${this.mix(d.c, 60)})">${this.esc(this.ini(d.name))}</div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(d.name.replace('Dr. ', 'Dr '))}</div><div class="text-[11px] da-muted truncate">${this.esc(d.dept)}</div></div><span class="da-tag" style="background:${this.mix('#f59e0b')};color:#d97706"><i class="ti ti-point"></i>On-call</span></div>`
        )
        .join('');
    }
  }

  /* ---------------- filter ---------------- */

  private filtered(): Doc[] {
    const f = this.state.filters;
    const q = this.state.q.toLowerCase();
    let arr = this.DOCS.filter((d) => {
      if (q && `${d.name} ${d.dept} ${d.spec}`.toLowerCase().indexOf(q) < 0) return false;
      if (f['dept'] && d.dept !== f['dept']) return false;
      if (f['spec'] && d.spec !== f['spec']) return false;
      if (f['shift'] && d.shift !== f['shift']) return false;
      if (f['status'] && d.status !== f['status']) return false;
      if (f['ctype'] && d.ctype !== f['ctype']) return false;
      if (f['exp']) {
        const e = +f['exp'];
        if (e === 0 && d.exp >= 5) return false;
        if (e === 5 && (d.exp < 5 || d.exp >= 10)) return false;
        if (e === 10 && d.exp < 10) return false;
      }
      return true;
    });
    arr = arr.slice().sort((a, b) => {
      if (f['sort'] === 'exp') return b.exp - a.exp;
      if (f['sort'] === 'slots') return b.slots - a.slots;
      if (f['sort'] === 'load') return b.load - a.load;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }

  /* ---------------- list view ---------------- */

  private renderList(arr: Doc[]): void {
    const el = this.byId('da-tbody');
    if (!el) return;
    el.innerHTML = arr
      .map((d) => {
        const sc = (this.STATUS[d.status] || { c: '#94a3b8' }).c;
        const shc: Record<string, string> = { Morning: '#0ea5e9', Afternoon: '#10b981', Evening: '#8b5cf6', Night: '#1e293b', 'On-call': '#f59e0b', Off: '#94a3b8' };
        const shiftColor = shc[d.shift] || '#94a3b8';
        return (
          `<tr data-row="${d.id}">` +
          `<td><input type="checkbox" class="da-cb da-rowcb" data-id="${d.id}"${this.state.sel[d.id] ? ' checked' : ''}></td>` +
          `<td><div class="flex items-center gap-2.5"><div class="da-av" style="width:2.2rem;height:2.2rem;background:linear-gradient(135deg,${d.c},${this.mix(d.c, 60)})">${this.esc(this.ini(d.name))}</div><div><a href="${this.detailUrl(d)}" class="font-bold text-[var(--color-gray-900)] hover:text-[var(--color-primary)] hover:underline flex items-center gap-1.5">${this.esc(d.name)}${
            d.oncall ? '<i class="ti ti-phone-call text-amber-500 text-xs" title="On-call"></i>' : ''
          }</a><div class="text-xs da-muted">${this.esc(this.did(d.id))} · ${d.exp} yrs exp</div></div></div></td>` +
          `<td class="da-muted">${this.esc(d.dept)}</td>` +
          `<td class="da-muted">${this.esc(d.spec)}</td>` +
          `<td><span class="da-tag" style="background:${this.mix(shiftColor)};color:${shiftColor}">${this.esc(d.shift)}</span></td>` +
          `<td class="da-muted whitespace-nowrap">${this.esc(d.time)}</td>` +
          `<td><span class="font-bold" style="color:${d.slots > 0 ? '#059669' : '#dc2626'}">${d.slots}</span> <span class="da-muted text-xs">free</span></td>` +
          `<td><span class="da-tag" style="background:${this.mix(sc)};color:${sc}"><span class="da-dotstat" style="background:${sc}"></span>${this.esc(d.status)}</span></td>` +
          `<td><button class="da-btn da-btn-soft !p-1.5" data-menu="${d.id}"><i class="ti ti-dots-vertical"></i></button></td>` +
          '</tr>'
        );
      })
      .join('');
    this.syncSelAll();
  }

  /* ---------------- board view ---------------- */

  private renderBoard(arr: Doc[]): void {
    const el = this.byId('da-board');
    if (!el) return;
    el.innerHTML = arr
      .map((d) => {
        const sc = (this.STATUS[d.status] || { c: '#94a3b8' }).c;
        return (
          `<div class="da-dcard" style="--dc:${d.c}">` +
          `<div class="da-dhead" style="background:linear-gradient(135deg,${d.c},${this.mix(d.c, 55)})"><button class="da-btn da-btn-glass !p-1.5 absolute top-2 right-2" data-menu="${d.id}"><i class="ti ti-dots-vertical"></i></button><div class="da-dav" style="background:linear-gradient(135deg,${d.c},${this.mix(d.c, 65)})">${this.esc(this.ini(d.name))}</div></div>` +
          '<div class="p-4 pt-8">' +
          `<div class="flex items-start justify-between gap-2"><div class="min-w-0"><h3 class="font-bold text-[var(--color-gray-900)] truncate flex items-center gap-1.5">${this.esc(d.name)}${
            d.oncall ? '<i class="ti ti-phone-call text-amber-500 text-xs"></i>' : ''
          }</h3><p class="text-xs da-muted truncate">${this.esc(d.dept)} · ${this.esc(d.spec)}</p></div><span class="da-tag flex-none" style="background:${this.mix(sc)};color:${sc}"><span class="da-dotstat" style="background:${sc}"></span>${this.esc(d.status)}</span></div>` +
          `<div class="flex items-center gap-3 mt-3 text-xs da-muted"><span class="flex items-center gap-1"><i class="ti ti-briefcase"></i>${d.exp}y</span><span class="flex items-center gap-1"><i class="ti ti-clock"></i>${this.esc(d.time)}</span><span class="flex items-center gap-1"><i class="ti ti-hourglass"></i>${d.dur}min</span></div>` +
          '<div class="grid grid-cols-3 gap-1.5 mt-3">' +
          `<div class="da-dstat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">${d.patients}</div><div class="text-[10px] da-muted font-semibold">Patients</div></div>` +
          `<div class="da-dstat"><div class="text-base font-extrabold text-[var(--color-gray-900)]">${d.upcoming}</div><div class="text-[10px] da-muted font-semibold">Upcoming</div></div>` +
          `<div class="da-dstat"><div class="text-base font-extrabold" style="color:${d.slots > 0 ? '#059669' : '#dc2626'}">${d.slots}</div><div class="text-[10px] da-muted font-semibold">Free</div></div>` +
          '</div>' +
          `<div class="flex items-center gap-2 mt-3.5 pt-3 border-t border-[var(--color-border-color)]"><a href="${this.detailUrl(d)}" class="da-btn da-btn-soft flex-1 !py-1.5 text-xs"><i class="ti ti-eye"></i> Details</a><button class="da-btn da-btn-soft !p-2" data-toast="Calling ${this.esc(
            d.name
          )}"><i class="ti ti-phone"></i></button><button class="da-btn da-btn-soft !p-2" data-toast="Emailing ${this.esc(d.name)}"><i class="ti ti-mail"></i></button></div>` +
          '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  /* ---------------- shift timeline ---------------- */

  private renderTimeline(): void {
    const span = 24;
    let ticks = '';
    for (let t = 0; t <= 24; t += 3) {
      ticks += `<span>${t === 0 || t === 24 ? '12a' : t === 12 ? '12p' : t > 12 ? `${t - 12}p` : `${t}a`}</span>`;
    }
    const scale = this.byId('da-tl-scale');
    if (scale) scale.innerHTML = ticks;
    const bands = [
      { n: 'Morning', s: 8, e: 14, c: '#0ea5e9', docs: this.DOCS.filter((d) => d.shift === 'Morning').length },
      { n: 'Afternoon', s: 14, e: 18, c: '#10b981', docs: this.DOCS.filter((d) => d.shift === 'Afternoon').length },
      { n: 'Evening', s: 18, e: 22, c: '#8b5cf6', docs: this.DOCS.filter((d) => d.shift === 'Evening').length },
      { n: 'Night', s: 22, e: 24, c: '#1e293b', docs: this.DOCS.filter((d) => d.shift === 'Night').length },
      { n: 'Emergency On-call', s: 0, e: 24, c: '#f59e0b', docs: this.DOCS.filter((d) => d.oncall).length },
    ];
    const tl = this.byId('da-timeline');
    if (tl) {
      tl.innerHTML = bands
        .map((b) => {
          const left = (b.s / span) * 100;
          const width = ((b.e - b.s) / span) * 100;
          return `<div class="flex items-center gap-2"><span class="text-[11px] font-bold da-muted w-32 flex-none">${this.esc(b.n)}</span><div class="da-tl-band flex-1"><div class="da-tl-seg" style="left:${left}%;width:${width}%;background:linear-gradient(135deg,${b.c},${this.mix(b.c, 55)})">${b.docs} doctors · ${
            b.s === 0 && b.e === 24 ? '24h' : `${this.pad(b.s)}–${this.pad(b.e)}`
          }</div></div></div>`;
        })
        .join('');
    }
    const legend = this.byId('da-tl-legend');
    if (legend) {
      legend.innerHTML =
        bands.map((b) => `<span class="flex items-center gap-1.5 text-xs font-semibold da-muted"><span class="w-3 h-3 rounded" style="background:${b.c}"></span>${this.esc(b.n)}</span>`).join('') +
        '<span class="flex items-center gap-1.5 text-xs font-semibold da-muted"><span class="w-3 h-3 rounded" style="background:#94a3b8"></span>Off Duty</span>';
    }
  }

  private pad(n: number): string {
    return `${n < 10 ? '0' : ''}${n}:00`;
  }

  /* ---------------- schedule tools ---------------- */

  private renderSchedTools(): void {
    const tools = [
      { n: 'Weekly Planner', ic: 'ti-calendar-week', c: '#0ea5e9', m: 'assign' },
      { n: 'Monthly Planner', ic: 'ti-calendar-month', c: '#6366f1', m: 'assign' },
      { n: 'Shift Assignment', ic: 'ti-clock-share', c: '#10b981', m: 'assign' },
      { n: 'Leave Calendar', ic: 'ti-plane', c: '#f59e0b', m: 'addleave' },
      { n: 'Holiday Schedule', ic: 'ti-confetti', c: '#ec4899', m: 'block' },
      { n: 'Emergency Coverage', ic: 'ti-urgent', c: '#ef4444', m: 'oncall' },
    ];
    const el = this.byId('da-schedtools');
    if (!el) return;
    el.innerHTML = tools
      .map(
        (t) =>
          `<button class="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-[var(--color-border-color)] hover:border-[var(--color-primary)] transition text-left" data-modal="${t.m}"><span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${this.mix(t.c)};color:${t.c}"><i class="ti ${t.ic}"></i></span><span class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(t.n)}</span></button>`
      )
      .join('');
  }

  /* ---------------- sidebar leaves / activity ---------------- */

  private renderLeaves(): void {
    const el = this.byId('da-leaves');
    if (!el) return;
    el.innerHTML = this.LEAVES.map((l) => {
      const sc = l.status === 'Approved' ? '#10b981' : l.status === 'Holiday' ? '#8b5cf6' : '#f59e0b';
      return `<div class="flex items-center gap-2.5 p-2.5 rounded-lg border border-[var(--color-border-color)]"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:${this.mix(l.c)};color:${l.c}"><i class="ti ${
        l.status === 'Holiday' ? 'ti-confetti' : 'ti-plane'
      }"></i></div><div class="flex-1 min-w-0"><div class="text-xs font-bold text-[var(--color-gray-900)] truncate">${this.esc(l.name)}</div><div class="text-[11px] da-muted truncate">${this.esc(l.type)} · ${this.esc(l.range)}</div></div><span class="da-tag" style="background:${this.mix(sc)};color:${sc}">${this.esc(l.status)}</span></div>`;
    }).join('');
  }

  private renderActivity(): void {
    const el = this.byId('da-activity');
    if (!el) return;
    el.innerHTML = this.ACTIVITY.map(
      (a, i) =>
        `<div class="flex gap-3 ${i < this.ACTIVITY.length - 1 ? 'pb-3' : ''}"><div class="flex flex-col items-center"><div class="w-8 h-8 rounded-lg flex items-center justify-center flex-none" style="background:${this.mix(a.c)};color:${a.c}"><i class="ti ${a.ic} text-sm"></i></div>${
          i < this.ACTIVITY.length - 1 ? '<div class="w-px flex-1 bg-[var(--color-border-color)] mt-1"></div>' : ''
        }</div><div class="min-w-0 pb-1"><div class="text-xs font-bold text-[var(--color-gray-900)]">${this.esc(a.t)}</div><div class="text-[11px] da-muted">${this.esc(a.s)}</div><div class="text-[10px] da-muted mt-.5">${this.esc(a.tm)}</div></div></div>`
    ).join('');
  }

  /* ---------------- render ---------------- */

  private render(): void {
    const arr = this.filtered();
    ['list', 'board'].forEach((v) => this.byId(`da-view-${v}`)?.classList.toggle('hidden', this.state.view !== v));
    this.byId('da-empty')?.classList.toggle('hidden', arr.length > 0);
    if (this.state.view === 'list') this.renderList(arr);
    else this.renderBoard(arr);
  }

  /* ---------------- action menu ---------------- */

  private readonly ACTIONS: { a?: string; n?: string; ic?: string; danger?: number; sep?: number }[] = [
    { a: 'view', n: 'View Profile', ic: 'ti-user' },
    { a: 'editavail', n: 'Edit Availability', ic: 'ti-calendar-cog' },
    { a: 'assign', n: 'Assign Shift', ic: 'ti-clock-share' },
    { a: 'block', n: 'Block Schedule', ic: 'ti-calendar-off' },
    { sep: 1 },
    { a: 'unavail', n: 'Mark Unavailable', ic: 'ti-toggle-left' },
    { a: 'avail', n: 'Mark Available', ic: 'ti-toggle-right' },
    { a: 'addleave', n: 'Add Leave', ic: 'ti-plane-departure' },
    { a: 'editleave', n: 'Edit Leave', ic: 'ti-plane' },
    { a: 'oncall', n: 'Assign On-call', ic: 'ti-phone-call' },
    { a: 'appts', n: 'View Appointments', ic: 'ti-calendar-event' },
    { sep: 1 },
    { a: 'print', n: 'Print Schedule', ic: 'ti-printer' },
    { a: 'pdf', n: 'Download PDF', ic: 'ti-file-download' },
    { a: 'notify', n: 'Send Notification', ic: 'ti-bell' },
    { a: 'email', n: 'Send Email', ic: 'ti-mail' },
    { sep: 1 },
    { a: 'archive', n: 'Archive', ic: 'ti-archive' },
    { a: 'delete', n: 'Delete', ic: 'ti-trash', danger: 1 },
  ];

  private openMenu(id: number, x: number, y: number): void {
    this.menuDoc = id;
    const m = this.byId('da-menu');
    if (!m) return;
    m.innerHTML = this.ACTIONS.map((a) => (a.sep ? '<div class="da-sep"></div>' : `<div class="da-mi${a.danger ? ' danger' : ''}" data-act="${a.a}"><i class="ti ${a.ic}"></i>${this.esc(a.n)}</div>`)).join('');
    m.classList.add('open');
    const w = 210;
    const h = Math.min(m.scrollHeight, window.innerHeight * 0.7);
    const px = Math.min(x, window.innerWidth - w - 8);
    const py = Math.min(y, window.innerHeight - h - 8);
    m.style.left = `${Math.max(8, px)}px`;
    m.style.top = `${Math.max(8, py)}px`;
  }

  private closeMenu(): void {
    this.byId('da-menu')?.classList.remove('open');
    this.menuDoc = null;
  }

  private doAction(act: string): void {
    const d = this.DOCS.find((x) => x.id === this.menuDoc);
    const name = d ? d.name : 'doctor';
    if (act === 'view') {
      this.closeMenu();
      if (this.menuDoc != null) this.openDrawer(this.menuDoc);
      return;
    }
    if (act === 'avail' && d) {
      d.status = 'Available';
      if (d.slots === 0) d.slots = 5;
      this.render();
      this.renderKPIs();
      this.animateRings();
    }
    if (act === 'unavail' && d) {
      d.status = 'Off Duty';
      d.slots = 0;
      this.render();
      this.renderKPIs();
      this.animateRings();
    }
    if (act === 'oncall' && d) {
      d.oncall = d.oncall ? 0 : 1;
      this.render();
      this.renderWidgets();
      this.animateRings();
    }
    if (['editavail', 'assign', 'block', 'addleave', 'editleave'].indexOf(act) >= 0) {
      this.closeMenu();
      this.openModal(act === 'editavail' ? 'addavail' : act, d);
      return;
    }
    if (act === 'appts') {
      this.closeMenu();
      this.openModal('appts', d);
      return;
    }
    if (act === 'delete') {
      this.closeMenu();
      this.openModal('delete', d);
      return;
    }
    const msgs: Record<string, string> = { editavail: 'Editing availability', print: 'Printing schedule', pdf: 'Downloading PDF', notify: 'Notification sent', email: 'Email sent', archive: 'Doctor archived' };
    this.toast(`${msgs[act] || 'Action'} — ${name.replace('Dr. ', 'Dr ')}`, 'ti-check');
    this.closeMenu();
  }

  /* ---------------- drawer ---------------- */

  private openDrawer(id: number): void {
    const d = this.DOCS.find((x) => x.id === id);
    if (!d) return;
    const week = this.DAYS.map(
      (day, i) =>
        `<div class="da-calcol !rounded-lg"><div class="da-calhd !py-1 !text-[11px]">${day}</div><div class="py-1.5 text-center">${
          d.week[i] ? `<span class="da-tag" style="background:${this.mix('#10b981')};color:#059669"><i class="ti ti-check"></i></span>` : '<span class="text-[10px] da-muted">Off</span>'
        }</div></div>`
    ).join('');
    const slots = ['09:00', '09:20', '10:00', '11:00', '14:30', '15:00']
      .slice(0, Math.max(1, Math.min(6, d.slots || 3)))
      .map((t) => `<button class="da-tag" style="background:${this.mix(d.c)};color:${d.c}" data-toast="Slot ${t} selected">${t}</button>`)
      .join('');
    const appts = [
      { n: 'Ravi Kumar', t: '09:00 · Follow-up' },
      { n: 'Anita Desai', t: '10:30 · New patient' },
      { n: 'Mohammed Ali', t: '14:00 · Review' },
    ].slice(0, d.upcoming || 2);
    const hist = [
      { s: 'Morning', d: 'Mon–Fri', c: '#0ea5e9' },
      { s: 'On-call', d: 'Sat', c: '#f59e0b' },
      { s: 'Off', d: 'Sun', c: '#94a3b8' },
    ];
    const body = this.byId('da-drawer-body');
    if (body) {
      body.innerHTML =
        `<div class="relative p-5 pb-8" style="background:linear-gradient(135deg,${d.c},${this.mix(d.c, 55)})">` +
        `<div class="flex items-center justify-between"><button class="da-btn da-btn-glass !p-2" data-close><i class="ti ti-x"></i></button><span class="da-tag" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)"><span class="da-dotstat" style="background:#fff"></span>${this.esc(d.status)}</span></div>` +
        `<div class="flex items-center gap-3 mt-4 text-white"><div class="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-extrabold">${this.esc(this.ini(d.name))}</div><div><h2 class="text-xl font-extrabold">${this.esc(d.name)}</h2><p class="text-white/80 text-sm">${this.esc(d.dept)} · ${this.esc(d.spec)}</p><p class="text-white/70 text-xs mt-.5"><i class="ti ti-briefcase"></i> ${d.exp} yrs · <i class="ti ti-hourglass"></i> ${d.dur} min consults</p></div></div>` +
        '</div>' +
        '<div class="p-5 space-y-5">' +
        `<div class="grid grid-cols-3 gap-2"><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">${d.patients}</div><div class="text-[10px] da-muted font-semibold">Patients Today</div></div><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold text-[var(--color-gray-900)]">${d.upcoming}</div><div class="text-[10px] da-muted font-semibold">Upcoming</div></div><div class="da-dstat !bg-[var(--color-white)] border border-[var(--color-border-color)] !p-3"><div class="text-lg font-extrabold" style="color:${d.slots > 0 ? '#059669' : '#dc2626'}">${d.slots}</div><div class="text-[10px] da-muted font-semibold">Free Slots</div></div></div>` +
        `<div class="flex items-center gap-2.5 p-3 rounded-xl" style="background:${this.mix(d.c, 8)};border:1px solid ${this.mix(d.c, 22)}"><i class="ti ti-clock-hour-4 text-lg" style="color:${d.c}"></i><div><div class="text-xs da-muted font-semibold">Current Shift</div><div class="text-sm font-bold text-[var(--color-gray-900)]">${this.esc(d.shift)} · ${this.esc(d.time)}</div></div>${
          d.oncall ? `<span class="da-tag ml-auto" style="background:${this.mix('#f59e0b')};color:#d97706"><i class="ti ti-phone-call"></i>On-call</span>` : ''
        }</div>` +
        `<div><div class="text-xs da-muted font-semibold mb-2">Weekly Schedule</div><div class="grid grid-cols-7 gap-1">${week}</div></div>` +
        `<div><div class="text-xs da-muted font-semibold mb-2">Available Slots</div><div class="flex flex-wrap gap-1.5">${slots || '<span class="text-xs da-muted">No free slots</span>'}</div></div>` +
        `<div><div class="text-xs da-muted font-semibold mb-2">Upcoming Appointments</div><div class="space-y-1.5">${
          appts
            .map(
              (a) =>
                `<div class="flex items-center gap-2.5 p-2 rounded-lg border border-[var(--color-border-color)]"><div class="da-av" style="width:1.9rem;height:1.9rem;background:linear-gradient(135deg,${d.c},${this.mix(d.c, 60)})">${this.esc(this.ini(a.n))}</div><span class="text-xs font-bold text-[var(--color-gray-900)] flex-1">${this.esc(a.n)}</span><span class="text-[11px] da-muted">${this.esc(a.t)}</span></div>`
            )
            .join('') || '<span class="text-xs da-muted">None scheduled</span>'
        }</div></div>` +
        `<div><div class="text-xs da-muted font-semibold mb-2">Shift History / Timeline</div><div class="space-y-1.5">${hist
          .map((h) => `<div class="flex items-center gap-2 text-xs"><span class="da-dotstat" style="background:${h.c}"></span><span class="font-semibold text-[var(--color-gray-900)]">${this.esc(h.s)}</span><span class="da-muted ml-auto">${this.esc(h.d)}</span></div>`)
          .join('')}</div></div>` +
        `<div class="grid grid-cols-2 gap-2 pt-1"><button class="da-btn da-btn-primary" data-modal="assign"><i class="ti ti-clock-share"></i> Assign Shift</button><button class="da-btn da-btn-soft" data-modal="addleave"><i class="ti ti-plane"></i> Add Leave</button><button class="da-btn da-btn-soft" data-toast="Notification sent"><i class="ti ti-bell"></i> Notify</button><button class="da-btn da-btn-soft" data-toast="Calling ${this.esc(
          d.name
        )}"><i class="ti ti-phone"></i> Call</button></div>` +
        '</div>';
    }
    this.byId('da-drawer')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => this.animateRings());
  }

  /* ---------------- modals ---------------- */

  private openModal(key: string, d?: Doc): void {
    const m = this.MODALS[key];
    if (!m) return;
    const danger = m.danger;
    const dialog = this.byId('da-dialog');
    if (dialog) {
      dialog.innerHTML =
        '<div class="p-5">' +
        `<div class="flex items-center justify-between mb-4"><h3 class="font-bold text-lg text-[var(--color-gray-900)] flex items-center gap-2"><i class="ti ${m.ic}" style="color:${danger ? '#ef4444' : 'var(--color-primary)'}"></i> ${this.esc(m.t)}</h3><button class="da-btn da-btn-soft !p-2" data-close><i class="ti ti-x"></i></button></div>` +
        m.body(d) +
        `<div class="flex justify-end gap-2 mt-5"><button class="da-btn da-btn-soft" data-close>${m.noValidate ? 'Done' : 'Cancel'}</button>${
          m.noValidate ? '' : `<button class="da-btn ${danger ? 'da-btn-soft !bg-rose-500 !text-white' : 'da-btn-primary'}" id="da-modal-ok"><i class="ti ${danger ? 'ti-trash' : 'ti-check'}"></i> ${this.esc(m.cta)}</button>`
        }</div>` +
        '</div>';
    }
    this.byId('da-modal')?.classList.add('open');
    this.document.body.style.overflow = 'hidden';
    if (typeof flatpickr !== 'undefined') {
      this.qsa<any>('[data-provider="flatpickr"]', this.byId('da-dialog') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
      this.qsa<any>('[data-provider="timepickr"]', this.byId('da-dialog') || undefined).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { enableTime: true, noCalendar: true, dateFormat: 'H:i' };
        if (el.hasAttribute('data-default-time')) config.defaultDate = el.getAttribute('data-default-time');
        flatpickr(el, config);
      });
    }
    const ok = this.byId('da-modal-ok');
    if (ok)
      ok.addEventListener('click', () => {
        this.byId('da-modal')?.classList.remove('open');
        if (!this.qsa('.da-drawer.open,.da-modal.open').length) this.document.body.style.overflow = '';
        if (key === 'delete' && d) {
          const i = this.DOCS.indexOf(d);
          if (i >= 0) this.DOCS.splice(i, 1);
          this.render();
          this.renderKPIs();
          this.renderWidgets();
          this.animateRings();
        }
        if (key === 'oncall') this.renderWidgets();
        this.toast(`${m.t} completed`, danger ? 'ti-trash' : 'ti-check');
      });
    // import drop wiring
    const dz = this.byId('da-dropzone');
    if (dz) {
      dz.addEventListener('click', () => (this.byId('da-file') as HTMLInputElement)?.click());
      const fileInput = this.byId('da-file') as HTMLInputElement | null;
      fileInput?.addEventListener('change', function (this: HTMLInputElement) {
        if (this.files && this.files[0]) {
          const sum = document.getElementById('da-import-sum');
          if (sum) sum.innerHTML = `<b class="text-[var(--color-gray-900)]">${this.files[0].name}</b> ready · 24 rows detected · 0 errors`;
        }
      });
      ['dragover', 'dragenter'].forEach((ev) =>
        dz.addEventListener(ev, (e: Event) => {
          e.preventDefault();
          dz.classList.add('drag');
        })
      );
      ['dragleave', 'drop'].forEach((ev) =>
        dz.addEventListener(ev, (e: Event) => {
          e.preventDefault();
          dz.classList.remove('drag');
        })
      );
      dz.addEventListener('drop', (e: Event) => {
        const f = (e as DragEvent).dataTransfer?.files[0];
        const sum = this.byId('da-import-sum');
        if (f && sum) sum.innerHTML = `<b class="text-[var(--color-gray-900)]">${f.name}</b> ready · 24 rows detected · 0 errors`;
      });
    }
    // export format toggle
    this.qsa<HTMLElement>('.da-expfmt').forEach((b) => {
      b.addEventListener('click', function (this: HTMLElement) {
        Array.prototype.forEach.call(document.querySelectorAll('.da-expfmt'), (x: HTMLElement) => x.classList.remove('!border-[var(--color-primary)]'));
        this.classList.add('!border-[var(--color-primary)]');
      });
    });
  }

  /* ---------------- selection / bulk ---------------- */

  private selCount(): number {
    return Object.keys(this.state.sel).filter((k) => this.state.sel[k]).length;
  }

  private syncBulk(): void {
    const n = this.selCount();
    const nEl = this.byId('da-bulk-n');
    if (nEl) nEl.textContent = String(n);
    this.byId('da-bulk')?.classList.toggle('show', n > 0);
  }

  private syncSelAll(): void {
    const sa = this.byId('da-selall') as HTMLInputElement | null;
    if (!sa) return;
    const vis = this.filtered();
    sa.checked = vis.length > 0 && vis.every((d) => this.state.sel[d.id]);
  }

  private updateFilterCount(): void {
    const n = Object.keys(this.state.filters).filter((k) => k !== 'sort' && this.state.filters[k]).length;
    const el = this.byId('da-filter-n');
    if (el) {
      el.textContent = String(n);
      el.classList.toggle('hidden', n === 0);
    }
  }

  /* ---------------- rings ---------------- */

  private animateRings(): void {
    this.qsa<HTMLElement>('.da-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => b.style.setProperty('--p', p));
    });
  }
}
