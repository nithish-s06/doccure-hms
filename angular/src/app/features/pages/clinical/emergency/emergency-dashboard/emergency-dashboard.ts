import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

declare const HSOverlay: any;

interface AlertItem {
  id: string;
  title: string;
  body: string;
  time: string;
  level: 'critical' | 'urgent' | 'warning';
  icon: string;
  acked?: boolean;
}

/**
 * Ported from tailwind/src/assets/js/script.js — "emergency-dashboard".
 * The KPI row, alert cards, bed zones, admissions table and doctor list
 * ship as static markup matching this same seed data; this wires the
 * mutation handlers (acknowledge alert / acknowledge all, refresh, print
 * handover, code blue) that re-run the small bits of rendering that
 * actually change (renderAlerts).
 */
@Component({
  imports: [],
  selector: 'app-emergency-dashboard',
  styleUrl: './emergency-dashboard.css',
  templateUrl: './emergency-dashboard.html',
})
export class EmergencyDashboard implements AfterViewInit {
  private readonly ALERTS: AlertItem[] = [
    {
      id: 'AL-01',
      title: 'STEMI activation — Bay 1',
      body: '12-lead confirms anterior ST elevation for Marcus Holloway (ER-4821). Cath lab notified, door-to-balloon clock started at 09:38.',
      time: '09:41 AM',
      level: 'critical',
      icon: 'icon-heart-pulse',
    },
    {
      id: 'AL-02',
      title: 'Stroke alert — Bay 4',
      body: 'Arthur Delgado (ER-4823) last known well 08:50. CT suite on standby, neurology paged for thrombolysis window.',
      time: '09:36 AM',
      level: 'critical',
      icon: 'icon-brain',
    },
    {
      id: 'AL-03',
      title: 'Sepsis screen positive',
      body: 'Kaitlyn Brewer (ER-4824) meets 2 of 3 qSOFA criteria. Lactate ordered, one-hour bundle initiated.',
      time: '09:29 AM',
      level: 'urgent',
      icon: 'icon-thermometer',
    },
    {
      id: 'AL-04',
      title: 'ER at 88% occupancy',
      body: 'Only 3 of 40 bays remain open, with 2 more in cleaning. Charge nurse advised to begin diversion protocol for non-trauma arrivals.',
      time: '09:22 AM',
      level: 'urgent',
      icon: 'icon-triangle-alert',
    },
    {
      id: 'AL-05',
      title: 'O-negative blood low',
      body: 'Blood bank reports 4 units of O-negative remaining. Restock requested from regional supply.',
      time: '09:04 AM',
      level: 'warning',
      icon: 'icon-droplet',
    },
  ];

  private readonly ALERT_STYLE: Record<string, { label: string }> = {
    critical: { label: 'Critical' },
    urgent: { label: 'Urgent' },
    warning: { label: 'Advisory' },
  };

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.byId('alerts-list')?.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('[data-alert]') as HTMLElement | null;
      if (btn) this.openAlert(btn.dataset['alert'] || '');
    });

    this.byId('btn-refresh')?.addEventListener('click', () => {
      this.renderAlerts();
      this.toastService.show('Board refreshed — data current as of 09:42 AM.', 'info');
    });

    this.byId('btn-handover')?.addEventListener('click', () => {
      this.toastService.show('Shift handover report sent to the printer.', 'info');
      window.print();
    });

    this.byId('btn-ack-all')?.addEventListener('click', () => {
      const open = this.ALERTS.filter((a) => !a.acked);
      if (!open.length) {
        this.toastService.show('No open alerts to acknowledge.', 'info');
        return;
      }
      open.forEach((a) => (a.acked = true));
      this.renderAlerts();
      this.toastService.show(open.length + ' alerts acknowledged.', 'success');
    });

    this.byId('am-ack')?.addEventListener('click', (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const a = this.ALERTS.find((x) => x.id === el.dataset['id']);
      if (a) a.acked = true;
      const modal = this.byId('alert-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      this.renderAlerts();
      this.toastService.show('Alert acknowledged.', 'success');
    });

    this.byId('cb-activate')?.addEventListener('click', () => {
      const modal = this.byId('code-modal');
      if (typeof HSOverlay !== 'undefined' && modal) HSOverlay.close(modal);
      const location = (this.byId('cb-location') as HTMLInputElement | null)?.value ?? '';
      this.toastService.show('Code Blue activated at ' + location + '. Team paged.', 'error');
      const details = this.byId('cb-details') as HTMLTextAreaElement | null;
      if (details) details.value = '';
    });
  }

  private renderAlerts(): void {
    let anyVisible = false;
    this.document.querySelectorAll('#alerts-list [data-row-id]').forEach((li) => {
      const el = li as HTMLElement;
      const a = this.ALERTS.find((x) => x.id === el.dataset['rowId']);
      const show = !!a && !a.acked;
      el.classList.toggle('hidden', !show);
      if (show) anyVisible = true;
    });
    const empty = this.byId('alerts-empty');
    if (empty) empty.classList.toggle('hidden', anyVisible);
  }

  private openAlert(id: string): void {
    const a = this.ALERTS.find((x) => x.id === id);
    if (!a) return;
    const title = this.byId('am-title');
    if (title) title.textContent = a.title;
    const time = this.byId('am-time');
    if (time) time.textContent = this.ALERT_STYLE[a.level].label + ' · raised ' + a.time;
    const body = this.byId('am-body');
    if (body) body.textContent = a.body;
    const note = this.byId('am-note') as HTMLTextAreaElement | null;
    if (note) note.value = '';
    const ack = this.byId('am-ack');
    if (ack) ack.dataset['id'] = a.id;
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
}
