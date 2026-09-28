import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Bed {
  id: number;
  zone: string;
  label: string;
  risk: string;
  empty: boolean;
  name?: string;
  hr?: number;
  sys?: number;
  dia?: number;
  spo2?: number;
  temp?: number;
  rr?: number;
  stab?: number;
}

/**
 * Ported from tailwind/src/assets/js/script.js's clinical-module bundle —
 * "icu.js" (icu.html, the ICU command-center landing page). The zone
 * legend, bed floor map, monitoring wall, emergency-ops tiles, ventilator
 * panel, workload heatmap, equipment grid, events list and alert ribbon
 * all ship as static markup for the frozen seed snapshot the source
 * writes into the page. This wires the genuine follow-up interactions the
 * source keeps: the live vitals tick against the six monitored beds'
 * already-rendered tiles (#ic-monitors, via their data-v/data-bid
 * attributes), the clock, and dismissing the alert ribbon. This page's
 * ported HTML drops the zone-filter tabs and has no bed-detail drawer or
 * menu/modal hosts (#ic-drawer / #ic-menuhost / #ic-modalhost / Code
 * Blue), so a bed click and its row-action menu surface their intent via
 * a toast instead of opening a panel/form.
 */
@Component({
  imports: [],
  selector: 'app-icu',
  styleUrl: './icu.css',
  templateUrl: './icu.html',
})
export class Icu implements AfterViewInit {
  private readonly BEDS: Bed[] = [
    { id: 0, zone: 'ICU-A', label: 'ICU-A-01', risk: 'yellow', empty: false, name: 'Rahul Sharma', hr: 75, sys: 89, dia: 69, spo2: 95, temp: 37.6, rr: 27, stab: 74 },
    { id: 1, zone: 'ICU-A', label: 'ICU-A-02', risk: 'orange', empty: false, name: 'Anita Reddy', hr: 70, sys: 109, dia: 75, spo2: 90, temp: 39.7, rr: 17, stab: 47 },
    { id: 2, zone: 'ICU-A', label: 'ICU-A-03', risk: 'red', empty: false, name: 'Vikram Nair', hr: 65, sys: 137, dia: 56, spo2: 88, temp: 36, rr: 25, stab: 20 },
    { id: 3, zone: 'ICU-A', label: 'ICU-A-04', risk: 'green', empty: false, name: 'Priya Patel', hr: 87, sys: 103, dia: 63, spo2: 98, temp: 39.4, rr: 21, stab: 92 },
    { id: 4, zone: 'ICU-A', label: 'ICU-A-05', risk: 'red', empty: false, name: 'Suresh Gupta', hr: 113, sys: 93, dia: 70, spo2: 92, temp: 39.4, rr: 27, stab: 27 },
    { id: 5, zone: 'ICU-A', label: 'ICU-A-06', risk: 'yellow', empty: false, name: 'Meera Singh', hr: 71, sys: 120, dia: 84, spo2: 94, temp: 36.6, rr: 15, stab: 82 },
    { id: 6, zone: 'ICU-B', label: 'ICU-B-01', risk: 'yellow', empty: false, name: 'Arjun Menon', hr: 86, sys: 105, dia: 86, spo2: 92, temp: 36, rr: 30, stab: 67 },
    { id: 7, zone: 'ICU-B', label: 'ICU-B-02', risk: 'gray', empty: true },
    { id: 8, zone: 'ICU-B', label: 'ICU-B-03', risk: 'green', empty: false, name: 'Deepak Joshi', hr: 84, sys: 98, dia: 93, spo2: 97, temp: 39.1, rr: 32, stab: 89 },
    { id: 9, zone: 'ICU-B', label: 'ICU-B-04', risk: 'yellow', empty: false, name: 'Neha Verma', hr: 118, sys: 149, dia: 75, spo2: 86, temp: 36.2, rr: 26, stab: 73 },
    { id: 10, zone: 'ICU-B', label: 'ICU-B-05', risk: 'yellow', empty: false, name: 'Rohan Iyer', hr: 90, sys: 146, dia: 75, spo2: 88, temp: 39.1, rr: 29, stab: 78 },
    { id: 11, zone: 'NICU', label: 'NICU-01', risk: 'yellow', empty: false, name: 'Sana Khan', hr: 126, sys: 132, dia: 72, spo2: 90, temp: 38.7, rr: 27, stab: 66 },
    { id: 12, zone: 'NICU', label: 'NICU-02', risk: 'yellow', empty: false, name: 'Rahul Sharma', hr: 58, sys: 128, dia: 58, spo2: 98, temp: 37.7, rr: 22, stab: 76 },
    { id: 13, zone: 'NICU', label: 'NICU-03', risk: 'green', empty: false, name: 'Anita Reddy', hr: 117, sys: 106, dia: 75, spo2: 89, temp: 39.4, rr: 25, stab: 92 },
    { id: 14, zone: 'NICU', label: 'NICU-04', risk: 'gray', empty: true },
    { id: 15, zone: 'NICU', label: 'NICU-05', risk: 'green', empty: false, name: 'Priya Patel', hr: 101, sys: 109, dia: 84, spo2: 87, temp: 36.3, rr: 29, stab: 86 },
    { id: 16, zone: 'PICU', label: 'PICU-01', risk: 'green', empty: false, name: 'Suresh Gupta', hr: 89, sys: 147, dia: 92, spo2: 92, temp: 37.5, rr: 15, stab: 83 },
    { id: 17, zone: 'PICU', label: 'PICU-02', risk: 'yellow', empty: false, name: 'Meera Singh', hr: 119, sys: 106, dia: 71, spo2: 91, temp: 37.6, rr: 28, stab: 67 },
    { id: 18, zone: 'PICU', label: 'PICU-03', risk: 'yellow', empty: false, name: 'Arjun Menon', hr: 90, sys: 133, dia: 82, spo2: 89, temp: 39.7, rr: 16, stab: 76 },
    { id: 19, zone: 'PICU', label: 'PICU-04', risk: 'green', empty: false, name: 'Kavya Das', hr: 99, sys: 118, dia: 62, spo2: 95, temp: 40, rr: 23, stab: 86 },
    { id: 20, zone: 'CCU', label: 'CCU-01', risk: 'green', empty: false, name: 'Deepak Joshi', hr: 68, sys: 103, dia: 78, spo2: 91, temp: 36, rr: 28, stab: 96 },
    { id: 21, zone: 'CCU', label: 'CCU-02', risk: 'gray', empty: true },
    { id: 22, zone: 'CCU', label: 'CCU-03', risk: 'red', empty: false, name: 'Rohan Iyer', hr: 112, sys: 122, dia: 88, spo2: 91, temp: 36.9, rr: 21, stab: 29 },
    { id: 23, zone: 'CCU', label: 'CCU-04', risk: 'green', empty: false, name: 'Sana Khan', hr: 103, sys: 98, dia: 95, spo2: 96, temp: 37, rr: 27, stab: 90 },
    { id: 24, zone: 'CCU', label: 'CCU-05', risk: 'yellow', empty: false, name: 'Rahul Sharma', hr: 107, sys: 158, dia: 61, spo2: 86, temp: 36.1, rr: 17, stab: 67 },
    { id: 25, zone: 'CCU', label: 'CCU-06', risk: 'yellow', empty: false, name: 'Anita Reddy', hr: 86, sys: 119, dia: 83, spo2: 87, temp: 37.4, rr: 27, stab: 67 },
  ];

  private readonly monIds: number[];
  private clockTimer: ReturnType<typeof setInterval> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.monIds = this.BEDS.filter((b) => !b.empty)
      .sort((a, b) => a.stab! - b.stab!)
      .slice(0, 6)
      .map((b) => b.id);
  }

  ngAfterViewInit(): void {
    this.wireEvents();

    setTimeout(() => {
      this.byId('ic-skeleton')?.classList.add('hidden');
      this.byId('ic-content')?.classList.remove('hidden');
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
      this.tickTimer = setInterval(() => this.tick(), 2000);
    }, 1500);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(msg: string): void {
    this.toastService.show(msg, 'info');
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private clock(): void {
    const el = this.byId('ic-clock');
    if (el) el.textContent = new Date().toLocaleTimeString('en-GB');
  }

  /* ---------------- Live vitals tick on the monitoring wall ---------------- */

  private tick(): void {
    this.monIds.forEach((id) => {
      const b = this.BEDS.find((x) => x.id === id);
      if (!b) return;
      b.hr = Math.max(50, Math.min(150, b.hr! + this.rnd(-3, 3)));
      b.spo2 = Math.max(82, Math.min(100, b.spo2! + this.rnd(-1, 1)));
      b.rr = Math.max(10, Math.min(36, b.rr! + this.rnd(-1, 1)));
      b.sys = Math.max(85, Math.min(165, b.sys! + this.rnd(-2, 2)));
      b.dia = Math.max(50, Math.min(100, b.dia! + this.rnd(-2, 2)));
      b.temp = Math.max(35, Math.min(41, b.temp! + this.rnd(-1, 1) / 10));

      const set = (v: string, val: string | number) => {
        const el = this.document.querySelector<HTMLElement>(`[data-v="${v}"][data-bid="${id}"]`);
        if (el) {
          const suf = el.querySelector('span')?.outerHTML || '';
          el.innerHTML = val + suf;
        }
      };
      set('hr', b.hr!);
      set('pulse', b.hr!);
      set('spo2', b.spo2!);
      set('rr', b.rr!);
      set('bp', `${b.sys}/${b.dia}`);
      set('temp', b.temp!.toFixed(1));
    });
  }

  /* ---------------- Floor (delete removes a bed) ---------------- */

  private readonly ZONES: [string, string, number][] = [['ICU-A', 'ICU A', 6], ['ICU-B', 'ICU B', 5], ['NICU', 'NICU', 5], ['PICU', 'PICU', 4], ['CCU', 'CCU', 6]];

  private bedTile(b: Bed): string {
    if (b.empty) {
      return `<div class="ic-bed ic-bed-empty st-gray">
        <div class="flex items-center justify-between"><span class="text-xs font-bold ic-mut">${b.label}</span><span class="ic-chip risk">Available</span></div>
        <div class="flex flex-col items-center justify-center py-3 ic-mut"><i class="icon-bed text-2xl"></i><p class="text-[11px] mt-1">Assign patient</p></div></div>`;
    }
    return `<div class="ic-bed st-${b.risk}" data-bed="${b.id}">
      <div class="flex items-center justify-between mb-1.5"><span class="text-xs font-bold ic-head">${b.label}</span><span class="ic-chip risk">${b.risk === 'red' ? '<i class="icon-alert-triangle text-[9px]"></i> ' : ''}${b.risk}</span></div>
      <div class="min-w-0"><p class="text-sm font-semibold ic-head truncate">${b.name}</p></div>
    </div>`;
  }

  private renderFloor(): void {
    const el = this.byId('ic-floor');
    if (!el) return;
    el.innerHTML = this.ZONES.map((z) => {
      const list = this.BEDS.filter((b) => b.zone === z[0]);
      const occ = list.filter((b) => !b.empty).length;
      return `<div>
        <div class="flex items-center gap-2 mb-2"><span class="ic-chip" style="background:color-mix(in srgb,#0ea5e9 14%,transparent);color:#0284c7"><i class="icon-hospital"></i> ${z[1]}</span><span class="text-[11px] ic-mut">${occ}/${list.length} occupied</span><div class="flex-1 h-px" style="background:var(--ic-border)"></div></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">${list.map((b) => this.bedTile(b)).join('')}</div>
      </div>`;
    }).join('');
  }

  /* ---------------- Events ---------------- */

  private wireEvents(): void {
    this.document.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;

      const t = target.closest('[data-bed],[data-mon],[data-menu-d],[data-action],[data-modal],[data-codeblue],[data-dismiss-alerts],[data-expfmt]') as HTMLElement | null;
      if (!t) return;

      if (t.dataset['bed'] !== undefined) {
        const b = this.BEDS.find((x) => x.id === +t.dataset['bed']!);
        this.toast(`${b?.label} · ${b?.name} opened.`);
        return;
      }
      if (t.dataset['menuD'] !== undefined) {
        this.toast('Bed actions menu opened.');
        return;
      }
      if (t.dataset['codeblue'] !== undefined) {
        this.toast('Code Blue panel opened.');
        return;
      }
      if (t.dataset['dismissAlerts'] !== undefined) {
        const wrap = this.byId('ic-ribbonwrap');
        if (wrap) wrap.style.display = 'none';
        this.toast('Alerts dismissed');
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'];
        const id = +(t.dataset['bid'] || -1);
        if (a === 'view') {
          const b = this.BEDS.find((x) => x.id === id);
          this.toast(`${b?.label} opened.`);
        } else if (a === 'delete') {
          const b = this.BEDS.find((x) => x.id === id);
          if (b) {
            b.empty = true;
            b.risk = 'gray';
          }
          this.renderFloor();
          this.toast('Record removed');
        } else {
          const SIMPLE: Record<string, string> = { doctor: 'Doctor assigned', nurse: 'Nurse assigned', lab: 'Lab ordered', radio: 'Radiology ordered', print: 'Printing summary...', pdf: 'PDF downloaded', archive: 'Record archived' };
          this.toast(SIMPLE[a!] || 'Form opened.');
        }
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.toast('Form opened.');
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toast(`Exported: ${t.dataset['expfmt']}`);
        return;
      }
    });
  }
}
