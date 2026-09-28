import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

interface Ward {
  id: number;
  code: string;
  name: string;
  type: string;
  dept: string;
  floor: string;
  cap: number;
  occ: number;
  avail: number;
  doc: string;
  nurse: string;
  av: string;
}

interface Bed {
  no: string;
  st: number;
  pt: string;
  gender: string;
  iso: boolean;
}

interface AllocItem {
  pt: string;
  mrn: string;
  dept: string;
  prio: string;
  ward: string;
  type: string;
  status: string;
  av: string;
}

@Component({
  imports: [],
  selector: 'app-wards',
  styleUrl: './wards.css',
  templateUrl: './wards.html',
})
export class Wards implements AfterViewInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private toastService: ToastService
  ) {}

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }
  private $(sel: string, r?: ParentNode): HTMLElement | null {
    return (r || this.document).querySelector(sel);
  }
  private $$(sel: string, r?: ParentNode): HTMLElement[] {
    return Array.from((r || this.document).querySelectorAll(sel));
  }
  private mix(c: string, n: number): string {
    return `color-mix(in srgb, ${c} ${n}%, transparent)`;
  }

  /* ============ DATA ============ */
  private readonly DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics', 'Emergency', 'Maternity', 'Nephrology'];
  private readonly TYPES = ['General', 'ICU', 'NICU', 'Isolation', 'Emergency', 'Maternity'];
  private readonly FLOORS = ['Ground', 'First', 'Second'];
  private readonly DOCS = ['Dr. A. Mehta', 'Dr. S. Kapoor', 'Dr. R. Nair', 'Dr. L. Khan', 'Dr. P. Rao', 'Dr. M. Iyer'];
  private readonly NURSES = ['N. Fernandes', 'N. Pillai', 'N. Sharma', 'N. Das', 'N. Reddy', 'N. Joseph'];
  private readonly AVC = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6'];
  private readonly WARDNAMES: [string, string, string][] = [
    ['ICU-A', 'Intensive Care A', 'ICU'], ['ICU-B', 'Intensive Care B', 'ICU'],
    ['GEN-1', 'General Ward 1', 'General'], ['GEN-2', 'General Ward 2', 'General'],
    ['CARD-1', 'Cardiac Care', 'General'], ['NEURO-1', 'Neuro Ward', 'General'],
    ['ORTHO-1', 'Orthopedic Ward', 'General'], ['ONCO-1', 'Oncology Ward', 'Isolation'],
    ['PEDS-1', 'Pediatric Ward', 'General'], ['NICU-1', 'Neonatal ICU', 'NICU'],
    ['MAT-1', 'Maternity Ward', 'Maternity'], ['ISO-1', 'Isolation Unit', 'Isolation'],
    ['ER-1', 'Emergency Bay', 'Emergency'], ['GEN-3', 'General Ward 3', 'General'],
  ];

  private mk(i: number): Ward {
    const [code, name, type] = this.WARDNAMES[i % this.WARDNAMES.length];
    const cap = type === 'ICU' ? 12 : type === 'NICU' ? 16 : type === 'Emergency' ? 14 : type === 'Isolation' ? 10 : type === 'Maternity' ? 20 : 30;
    const occ = Math.max(0, Math.min(cap, Math.round(cap * (0.55 + ((i * 13) % 45) / 100))));
    return {
      id: i, code: code + (i > 13 ? '-' + i : ''), name, type, dept: this.DEPTS[i % this.DEPTS.length],
      floor: this.FLOORS[i % 3], cap, occ, avail: cap - occ, doc: this.DOCS[i % this.DOCS.length],
      nurse: this.NURSES[i % this.NURSES.length], av: this.AVC[i % this.AVC.length],
    };
  }

  private WARDS: Ward[] = Array.from({ length: 18 }, (_, i) => this.mk(i));

  private detailUrl(w: Ward): string {
    return 'ward-detail.html?id=' + w.id + '&code=' + encodeURIComponent(w.code) + '&name=' + encodeURIComponent(w.name) +
      '&type=' + encodeURIComponent(w.type) + '&dept=' + encodeURIComponent(w.dept) + '&floor=' + encodeURIComponent(w.floor) +
      '&cap=' + w.cap + '&occ=' + w.occ + '&doc=' + encodeURIComponent(w.doc) + '&nurse=' + encodeURIComponent(w.nurse);
  }
  private occPct(w: Ward): number { return Math.round((w.occ / w.cap) * 100); }
  private occColor(w: Ward): string { const p = this.occPct(w); return p >= 95 ? '#ef4444' : p >= 80 ? '#f59e0b' : '#22c55e'; }
  private occLabel(w: Ward): string { const p = this.occPct(w); return p >= 95 ? 'Full' : p >= 80 ? 'Near Full' : 'Available'; }
  private statusB(w: Ward): string { const p = this.occPct(w); return p >= 95 ? 'wd-b-danger' : p >= 80 ? 'wd-b-warn' : 'wd-b-ok'; }

  /* ============ STATE ============ */
  private state: {
    view: string; q: string; type: string; dept: string; floor: string; status: string; sort: string;
    sel: Set<number>; cols: Record<string, number>; alloctab: string;
  } = {
    view: 'dashboard', q: '', type: '', dept: '', floor: '', status: '', sort: '', sel: new Set<number>(),
    cols: { code: 1, name: 1, dept: 1, floor: 1, cap: 1, occ: 1, avail: 1, type: 1, status: 1 },
    alloctab: 'All',
  };

  private filtered(): Ward[] {
    let r = this.WARDS.filter((w) => {
      if (this.state.q) {
        const q = this.state.q.toLowerCase();
        if (!(w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q) || w.dept.toLowerCase().includes(q))) return false;
      }
      if (this.state.type && w.type !== this.state.type) return false;
      if (this.state.dept && w.dept !== this.state.dept) return false;
      if (this.state.floor && w.floor !== this.state.floor) return false;
      if (this.state.status && this.occLabel(w) !== this.state.status) return false;
      return true;
    });
    if (this.state.sort === 'name') r.sort((a, b) => a.name.localeCompare(b.name));
    else if (this.state.sort === 'occ') r.sort((a, b) => this.occPct(b) - this.occPct(a));
    else if (this.state.sort === 'avail') r.sort((a, b) => b.avail - a.avail);
    return r;
  }

  /* ============ KPI ============ */
  private animateCounts(): void {
    this.$$('.wd-count').forEach((el) => {
      const to = +(el.dataset['to'] || '0');
      const st = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - st) / 1000);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  private animateRings(): void {
    this.$$('.wd-ring .bar').forEach((b) => {
      const p = b.style.getPropertyValue('--p');
      b.style.setProperty('--p', '0');
      requestAnimationFrame(() => requestAnimationFrame(() => b.style.setProperty('--p', p)));
    });
  }
  private bars(id: string, rows: [string, number, string, string?][]): void {
    const el = this.$(id);
    if (!el) return;
    el.innerHTML = rows
      .map(
        (r) =>
          `<div><div class="flex justify-between text-[11px] mb-1"><span class="font-medium">${r[0]}</span><span class="wd-muted">${r[1]}${r[3] || '%'}</span></div><div class="wd-barwrap"><span style="width:${r[1]}%;background:${r[2]}"></span></div></div>`
      )
      .join('');
  }

  /* ============ BED MANAGEMENT ============ */
  private readonly BEDSTATUS: [string, string, string][] = [
    ['Occupied', '#ef4444', 'ti-user'], ['Available', '#22c55e', 'ti-bed'], ['Reserved', '#6366f1', 'ti-bookmark'],
    ['Cleaning', '#0ea5e9', 'ti-spray'], ['Maintenance', '#f59e0b', 'ti-tool'], ['Isolation', '#a855f7', 'ti-door'],
  ];
  private genBeds(w: Ward): Bed[] {
    const arr: Bed[] = [];
    const names = ['R. Sharma', 'A. Reddy', 'V. Nair', 'P. Patel', 'S. Gupta', 'M. Singh', 'K. Menon', 'D. Das'];
    for (let i = 0; i < w.cap; i++) {
      let st: number;
      if (i < w.occ) st = 0;
      else if (i === w.occ) st = 3;
      else if (i === w.occ + 1) st = 4;
      else if (i === w.cap - 1 && w.type === 'Isolation') st = 5;
      else if (i % 7 === 0) st = 2;
      else st = 1;
      arr.push({ no: w.code + '-B' + (i + 1), st, pt: st === 0 ? names[i % names.length] : '', gender: i % 2 ? 'M' : 'F', iso: w.type === 'Isolation' });
    }
    return arr;
  }
  private renderBedCenter(): void {
    const sel = this.byId('wd-bedward') as HTMLSelectElement | null;
    if (!sel) return;
    const w = this.WARDS.find((x) => x.id === +sel.value) || this.WARDS[0];
    const beds = this.genBeds(w);
    const counts = [0, 0, 0, 0, 0, 0];
    beds.forEach((b) => counts[b.st]++);
    const bedstats = this.byId('wd-bedstats');
    if (bedstats) {
      bedstats.innerHTML = ([
        ['Total', w.cap, '#64748b'], ['Occupied', counts[0], '#ef4444'], ['Available', counts[1], '#22c55e'],
        ['Reserved', counts[2], '#6366f1'], ['Cleaning', counts[3], '#0ea5e9'], ['Maintenance', counts[4], '#f59e0b'],
      ] as [string, number, string][])
        .map((s) => `<div class="rounded-lg border wd-hairline p-2 text-center"><p class="text-lg font-bold" style="color:${s[2]}">${s[1]}</p><p class="text-[10px] wd-muted">${s[0]}</p></div>`)
        .join('');
    }
    const legend = this.byId('wd-bedlegend');
    if (legend) {
      legend.innerHTML = this.BEDSTATUS.map((s) => `<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full" style="background:${s[1]}"></span>${s[0]}</span>`).join('');
    }
    const grid = this.byId('wd-bedgrid');
    if (grid) {
      grid.innerHTML = beds
        .map((b, i) => {
          const s = this.BEDSTATUS[b.st];
          return `<button class="wd-bed" data-bed="${i}" style="background:${this.mix(s[1], 8)};border-color:${this.mix(s[1], 30)}" title="${b.no} · ${s[0]}${b.pt ? ' · ' + b.pt : ''}">
                        <i class="ti ${s[2]} ico" style="color:${s[1]}"></i>
                        <p class="text-[10px] font-bold mt-0.5">${b.no.split('-B')[1] ? 'B' + b.no.split('-B')[1] : b.no}</p>
                        <p class="text-[9px] wd-muted truncate">${b.pt || s[0]}</p>
                        ${b.iso ? '<span class="absolute top-1 right-1 text-[8px]" style="color:#a855f7"><i class="ti ti-shield"></i></span>' : ''}
                      </button>`;
        })
        .join('');
    }
  }

  /* ============ ALLOCATION BOARD ============ */
  private ALLOC: AllocItem[] = [
    { pt: 'Rahul Sharma', mrn: 'MRN-10428', dept: 'Cardiology', prio: 'Critical', ward: 'ICU-A', type: 'ICU', status: 'New', av: '#ef4444' },
    { pt: 'Anita Reddy', mrn: 'MRN-10431', dept: 'Neurology', prio: 'High', ward: 'NEURO-1', type: 'New', status: 'Waiting', av: '#a855f7' },
    { pt: 'Vikram Nair', mrn: 'MRN-10433', dept: 'Orthopedics', prio: 'Medium', ward: 'ORTHO-1', type: 'New', status: 'New', av: '#0ea5e9' },
    { pt: 'Priya Patel', mrn: 'MRN-10435', dept: 'Oncology', prio: 'High', ward: 'ISO-1', type: 'Isolation', status: 'Isolation', av: '#f59e0b' },
    { pt: 'Suresh Gupta', mrn: 'MRN-10438', dept: 'Emergency', prio: 'Critical', ward: 'ICU-B', type: 'ICU', status: 'ICU', av: '#22c55e' },
    { pt: 'Meera Singh', mrn: 'MRN-10440', dept: 'Maternity', prio: 'Medium', ward: 'MAT-1', type: 'New', status: 'Waiting', av: '#ec4899' },
  ];
  private renderAlloc(): void {
    const tab = this.state.alloctab;
    const list = this.ALLOC.filter(
      (a) =>
        tab === 'All' || a.status === tab ||
        (tab === 'New' && a.status === 'New') || (tab === 'Waiting' && a.status === 'Waiting') ||
        (tab === 'ICU' && a.status === 'ICU') || (tab === 'Isolation' && a.status === 'Isolation')
    );
    const pc = (p: string) => (p === 'Critical' ? 'wd-b-danger' : p === 'High' ? 'wd-b-warn' : 'wd-b-info');
    const el = this.byId('wd-alloc');
    if (!el) return;
    el.innerHTML = list.length
      ? list
          .map(
            (a) => `
                      <div class="rounded-xl border wd-hairline p-2.5 flex items-center gap-2.5 hover:shadow-md transition">
                        <span class="wd-av" style="width:38px;height:38px;background:${a.av};font-size:13px">${a.pt.split(' ').map((n) => n[0]).join('')}</span>
                        <div class="min-w-0 flex-1"><p class="text-sm font-semibold truncate">${a.pt}</p><p class="text-[11px] wd-muted">${a.mrn} · ${a.dept}</p><p class="text-[10px] wd-muted">Requested: ${a.ward}</p></div>
                        <div class="text-right"><span class="wd-b ${pc(a.prio)}">${a.prio}</span><button data-modal="allocate" class="block mt-1 text-[11px] font-semibold text-[var(--wd-c)] hover:underline">Allocate</button></div>
                      </div>`
          )
          .join('')
      : `<p class="text-sm wd-muted text-center py-4">No pending requests.</p>`;
  }

  /* ============ TIMELINE ============ */
  private readonly TLINE: [string, string, string, string, string, string][] = [
    ['Ward Created', 'Jan 12, 2024', 'Admin', 'ICU-A commissioned · 12 beds', 'ti-building-plus', '#6366f1'],
    ['Patient Admitted', '08:20 AM', 'Dr. Mehta', 'R. Sharma → Bed ICU-A-B3', 'ti-user-plus', '#22c55e'],
    ['Bed Allocated', '08:22 AM', 'Nurse J.', 'Bed ICU-A-B3 assigned', 'ti-bed', '#0ea5e9'],
    ['Bed Changed', '09:45 AM', 'Nurse J.', 'A. Reddy moved B5 → B7', 'ti-arrows-exchange', '#f59e0b'],
    ['Transfer', '10:30 AM', 'Dr. Kapoor', 'V. Nair → NEURO-1', 'ti-transfer', '#a855f7'],
    ['Cleaning', '11:15 AM', 'Housekeeping', 'Bed B2 sanitized', 'ti-spray', '#0ea5e9'],
    ['Maintenance', '12:00 PM', 'Facilities', 'Monitor B9 serviced', 'ti-tool', '#f59e0b'],
    ['Patient Discharged', '01:20 PM', 'Dr. Mehta', 'M. Singh discharged', 'ti-logout', '#ef4444'],
  ];

  /* ============ FLOOR MAP ============ */
  private renderFloor(): void {
    const legend = this.byId('wd-floorlegend');
    if (legend) {
      legend.innerHTML = ([['Available', '#22c55e'], ['Near Full', '#f59e0b'], ['Full', '#ef4444']] as [string, string][])
        .map((l) => `<span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full" style="background:${l[1]}"></span>${l[0]}</span>`)
        .join('');
    }
    const groups: [string, string[]][] = [['Ground Floor', ['Ground']], ['First Floor', ['First']], ['Second Floor', ['Second']]];
    let html = groups
      .map((g) => {
        const list = this.WARDS.filter((w) => g[1].includes(w.floor));
        return `<div><p class="text-xs font-bold wd-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ti ti-stairs text-[var(--wd-c)]"></i> ${g[0]} <span class="wd-b wd-b-info">${list.length}</span></p><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${list.map((w) => this.floorBlk(w)).join('') || '<p class="text-xs wd-muted">No wards</p>'}</div></div>`;
      })
      .join('');
    html += `<div><p class="text-xs font-bold wd-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ti ti-heart-rate-monitor text-rose-500"></i> Critical Units</p><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">${this.WARDS.filter((w) => ['ICU', 'NICU', 'Emergency', 'Isolation'].includes(w.type)).map((w) => this.floorBlk(w)).join('')}</div></div>`;
    const floors = this.byId('wd-floors');
    if (floors) floors.innerHTML = html;
  }
  private floorBlk(w: Ward): string {
    const c = this.occColor(w);
    return `<div class="wd-floorblk" style="--fc:${c}" data-drawer="${w.id}">
                        <div class="flex items-center justify-between"><p class="text-sm font-bold">${w.code}</p><span class="wd-b ${this.statusB(w)}">${this.occPct(w)}%</span></div>
                        <p class="text-[11px] wd-muted truncate">${w.name}</p>
                        <div class="wd-barwrap my-2"><span style="width:${this.occPct(w)}%;background:${c}"></span></div>
                        <div class="flex items-center justify-between text-[11px]"><span class="wd-muted">${w.occ}/${w.cap} beds</span><span class="font-semibold" style="color:${c}">${w.avail} free</span></div>
                        <div class="flex gap-1 mt-2"><button data-modal="allocate" onclick="event.stopPropagation()" class="flex-1 text-[10px] font-semibold border wd-hairline rounded-md py-1 hover:bg-gray-50 dark:hover:bg-slate-800">Allocate</button><button data-menu="${w.id}" onclick="event.stopPropagation()" class="text-[10px] font-semibold border wd-hairline rounded-md px-1.5 py-1 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-dots"></i></button></div>
                      </div>`;
  }

  /* ============ GRID ============ */
  private renderGrid(): void {
    const list = this.filtered();
    const grid = this.byId('wd-grid');
    if (!grid) return;
    grid.innerHTML = list
      .map((w) => {
        const c = this.occColor(w);
        return `
                      <div class="wd-wardcard">
                        <div class="p-4 pb-3" style="background:linear-gradient(135deg,${this.mix(w.av, 12)},transparent)">
                          <div class="flex items-start gap-2">
                            <label class="pt-1"><input type="checkbox" data-sel="${w.id}" ${this.state.sel.has(w.id) ? 'checked' : ''} class="accent-[var(--wd-c)]"></label>
                            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-none" style="background:${this.mix(w.av, 16)};color:${w.av}"><i class="ti ti-building-hospital text-lg"></i></div>
                            <div class="min-w-0 flex-1"><p class="font-bold truncate">${w.name}</p><p class="text-[11px] wd-muted">${w.code} · ${w.dept}</p></div>
                            <div class="relative"><button data-menu="${w.id}" class="w-8 h-8 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-dots-vertical wd-muted"></i></button></div>
                          </div>
                        </div>
                        <div class="px-4 pb-4 space-y-2">
                          <div class="flex flex-wrap items-center gap-1.5"><span class="wd-b wd-b-info">${w.type}</span><span class="wd-b" style="background:var(--color-gray-100)"><i class="ti ti-stairs text-[9px]"></i> ${w.floor}</span><span class="wd-b ${this.statusB(w)}">${this.occLabel(w)}</span></div>
                          <div class="flex items-center justify-between text-xs pt-1"><span class="wd-muted">Occupancy</span><span class="font-semibold" style="color:${c}">${w.occ}/${w.cap} · ${this.occPct(w)}%</span></div>
                          <div class="wd-barwrap"><span style="width:${this.occPct(w)}%;background:${c}"></span></div>
                          <div class="grid grid-cols-3 gap-2 pt-1 text-center">
                            <div class="rounded-lg bg-gray-50 dark:bg-slate-800 p-1.5"><p class="text-sm font-bold">${w.cap}</p><p class="text-[10px] wd-muted">Capacity</p></div>
                            <div class="rounded-lg bg-gray-50 dark:bg-slate-800 p-1.5"><p class="text-sm font-bold text-rose-500">${w.occ}</p><p class="text-[10px] wd-muted">Occupied</p></div>
                            <div class="rounded-lg bg-gray-50 dark:bg-slate-800 p-1.5"><p class="text-sm font-bold text-emerald-500">${w.avail}</p><p class="text-[10px] wd-muted">Free</p></div>
                          </div>
                          <div class="flex items-center justify-between text-[11px] pt-1"><span class="wd-muted"><i class="ti ti-stethoscope"></i> ${w.doc}</span><span class="wd-muted"><i class="ti ti-nurse"></i> ${w.nurse}</span></div>
                          <div class="flex gap-2 pt-1">
                            <a href="${this.detailUrl(w)}" class="flex-1 text-center text-xs font-semibold bg-[var(--wd-c)] text-white rounded-lg py-1.5 hover:opacity-90">View Ward</a>
                            <button data-modal="allocate" class="text-xs font-semibold border wd-hairline rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-bed"></i></button>
                            <button data-menu="${w.id}" class="text-xs font-semibold border wd-hairline rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-dots"></i></button>
                          </div>
                        </div>
                      </div>`;
      })
      .join('');
  }

  /* ============ LIST ============ */
  private readonly COLS: [string, string][] = [
    ['code', 'Code'], ['name', 'Ward Name'], ['dept', 'Department'], ['floor', 'Floor'], ['cap', 'Capacity'],
    ['occ', 'Occupied'], ['avail', 'Available'], ['type', 'Type'], ['status', 'Status'],
  ];
  private renderList(): void {
    const list = this.filtered();
    const head = this.byId('wd-listhead');
    if (head) {
      head.innerHTML =
        `<th style="width:36px"><input type="checkbox" data-selall class="accent-[var(--wd-c)]"></th>` +
        this.COLS.map((c) => `<th data-col="${c[0]}" class="${this.state.cols[c[0]] ? '' : 'wd-hidecol'}">${c[1]}</th>`).join('') +
        `<th class="text-right">Actions</th>`;
    }
    const body = this.byId('wd-listbody');
    if (!body) return;
    body.innerHTML =
      list
        .map((w) => {
          const c = this.occColor(w);
          return `<tr>
                        <td><input type="checkbox" data-sel="${w.id}" ${this.state.sel.has(w.id) ? 'checked' : ''} class="accent-[var(--wd-c)]"></td>
                        <td data-col="code" class="${this.state.cols['code'] ? '' : 'wd-hidecol'}"><span class="font-semibold">${w.code}</span></td>
                        <td data-col="name" class="${this.state.cols['name'] ? '' : 'wd-hidecol'}"><a href="${this.detailUrl(w)}" class="font-medium hover:text-[var(--wd-c)]">${w.name}</a></td>
                        <td data-col="dept" class="${this.state.cols['dept'] ? '' : 'wd-hidecol'}">${w.dept}</td>
                        <td data-col="floor" class="${this.state.cols['floor'] ? '' : 'wd-hidecol'}">${w.floor}</td>
                        <td data-col="cap" class="${this.state.cols['cap'] ? '' : 'wd-hidecol'}">${w.cap}</td>
                        <td data-col="occ" class="${this.state.cols['occ'] ? '' : 'wd-hidecol'}"><span class="font-semibold text-rose-500">${w.occ}</span></td>
                        <td data-col="avail" class="${this.state.cols['avail'] ? '' : 'wd-hidecol'}"><span class="font-semibold text-emerald-500">${w.avail}</span></td>
                        <td data-col="type" class="${this.state.cols['type'] ? '' : 'wd-hidecol'}"><span class="wd-b wd-b-info">${w.type}</span></td>
                        <td data-col="status" class="${this.state.cols['status'] ? '' : 'wd-hidecol'}"><span class="wd-b ${this.statusB(w)}">${this.occLabel(w)} · ${this.occPct(w)}%</span></td>
                        <td class="text-right"><div class="inline-flex gap-1"><a href="${this.detailUrl(w)}" class="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"><i class="ti ti-eye"></i></a><button data-menu="${w.id}" class="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 inline-flex items-center justify-center"><i class="ti ti-dots-vertical"></i></button></div></td>
                      </tr>`;
        })
        .join('') || `<tr><td colspan="11" class="text-center py-8 wd-muted">No wards match your filters.</td></tr>`;
  }

  private buildColMenu(): void {
    const menu = this.byId('wd-colmenu');
    if (!menu) return;
    menu.innerHTML = this.COLS.map(
      (c) => `<label class="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"><input type="checkbox" data-coltoggle="${c[0]}" ${this.state.cols[c[0]] ? 'checked' : ''} class="accent-[var(--wd-c)]"> ${c[1]}</label>`
    ).join('');
  }

  /* ============ DISPATCH ============ */
  private renderView(): void {
    const count = this.byId('wd-count');
    if (count) count.textContent = String(this.filtered().length);
    if (this.state.view === 'grid') this.renderGrid();
    else if (this.state.view === 'list') this.renderList();
    else if (this.state.view === 'floor') this.renderFloor();
    this.updateBulk();
  }
  private refreshAll(): void {
    this.renderBedCenter();
    this.renderView();
  }

  /* ============ MENU ============ */
  private readonly ACTIONS: [string, string, string][] = [
    ['View Ward', 'ti-eye', 'drawer'], ['Edit Ward', 'ti-edit', 'ward_edit'], ['Allocate Bed', 'ti-bed', 'allocate'],
    ['Transfer Patient', 'ti-transfer', 'transfer'], ['Release Bed', 'ti-bed-off', 'release'],
    ['Assign Doctor', 'ti-stethoscope', 'doctor'], ['Assign Nurse', 'ti-nurse', 'nurse'],
    ['View Occupancy', 'ti-chart-donut', 'occupancy'], ['Ward Timeline', 'ti-timeline', 'timeline'],
    ['Maintenance', 'ti-tool', 'maintenance'], ['Cleaning Schedule', 'ti-spray', 'cleaning'],
    ['Print Ward', 'ti-printer', 'print'], ['Download PDF', 'ti-file-download', 'pdf'],
    ['Archive', 'ti-archive', 'archive'], ['Delete', 'ti-trash', 'delete'],
  ];
  private menuHost(): HTMLElement {
    let host = this.byId('wd-menuhost');
    if (!host) {
      host = this.document.createElement('div');
      host.id = 'wd-menuhost';
      this.document.body.appendChild(host);
    }
    return host;
  }
  private openMenu(id: number, x: number, y: number): void {
    this.closeMenu();
    const host = this.menuHost();
    host.innerHTML = `<div class="wd-menu" id="wd-openmenu">${this.ACTIONS.map((a) => `<button data-action="${a[2]}" data-wid="${id}" class="${a[2] === 'delete' ? 'danger' : ''}"><i class="ti ${a[1]}"></i> ${a[0]}</button>`).join('')}</div>`;
    const m = this.byId('wd-openmenu');
    if (!m) return;
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(12, Math.min(x, window.innerWidth - r.width - 12)) + 'px';
    m.style.top = Math.max(12, Math.min(y, window.innerHeight - r.height - 12)) + 'px';
  }
  private closeMenu(): void {
    const host = this.byId('wd-menuhost');
    if (host) host.innerHTML = '';
  }

  /* ============ DRAWER ============ */
  private drawerHost(): HTMLElement {
    let el = this.byId('wd-drawer');
    if (!el) {
      el = this.document.createElement('div');
      el.id = 'wd-drawer';
      this.document.body.appendChild(el);
    }
    return el;
  }
  private openDrawer(id: number): void {
    const w = this.WARDS.find((x) => x.id === id);
    if (!w) return;
    const c = this.occColor(w);
    const sec = (t: string, ic: string, body: string) =>
      `<div class="rounded-xl border wd-hairline p-3"><p class="text-xs font-bold wd-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="ti ${ic} text-[var(--wd-c)]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string) => `<div class="flex justify-between text-xs py-0.5"><span class="wd-muted">${k}</span><span class="font-medium">${v}</span></div>`;
    const beds = this.genBeds(w);
    const drawer = this.drawerHost();
    drawer.innerHTML = `
                      <div class="p-4 border-b wd-hairline sticky top-0 bg-[var(--color-white)] z-10 flex items-center justify-between">
                        <div class="flex items-center gap-3"><div class="w-11 h-11 rounded-xl flex items-center justify-center" style="background:${this.mix(w.av, 16)};color:${w.av}"><i class="ti ti-building-hospital text-lg"></i></div><div><p class="font-bold">${w.name}</p><p class="text-[11px] wd-muted">${w.code} · ${w.type} · ${w.floor} Floor</p></div></div>
                        <button data-close class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-x"></i></button>
                      </div>
                      <div class="p-4 space-y-3">
                        <div class="rounded-xl p-3" style="background:${this.mix(c, 10)}">
                          <div class="flex items-center justify-between mb-1"><span class="text-sm font-semibold">Occupancy</span><span class="text-sm font-bold" style="color:${c}">${this.occPct(w)}%</span></div>
                          <div class="wd-barwrap"><span style="width:${this.occPct(w)}%;background:${c}"></span></div>
                          <div class="flex justify-between text-[11px] wd-muted mt-1"><span>${w.occ} occupied</span><span>${w.avail} available</span></div>
                        </div>
                        ${sec('Ward Summary', 'ti-info-circle', row('Department', w.dept) + row('Floor', w.floor) + row('Capacity', w.cap + ' beds') + row('Ward Type', w.type))}
                        ${sec('Assigned Staff', 'ti-users', row('Doctor In-charge', w.doc) + row('Nurse In-charge', w.nurse) + row('Support Staff', '4 assigned'))}
                        ${sec('Bed Layout', 'ti-layout-grid', `<div class="grid grid-cols-6 gap-1.5">${beds.slice(0, 18).map((b) => { const s = this.BEDSTATUS[b.st]; return `<span class="rounded-md p-1 text-center" style="background:${this.mix(s[1], 12)}" title="${b.no}"><i class="ti ${s[2]} text-xs" style="color:${s[1]}"></i></span>`; }).join('')}</div>`)}
                        ${sec('Recent Admissions', 'ti-user-plus', ['R. Sharma · Bed B3', 'A. Reddy · Bed B7', 'V. Nair · Bed B9'].map((x) => `<div class="flex items-center gap-2 text-xs py-0.5"><i class="ti ti-point text-emerald-500"></i> ${x}</div>`).join(''))}
                        ${sec('Pending Discharges', 'ti-logout', ['M. Singh · Today 4 PM', 'K. Menon · Tomorrow'].map((x) => `<div class="flex items-center gap-2 text-xs py-0.5"><i class="ti ti-point text-amber-500"></i> ${x}</div>`).join(''))}
                        ${sec('Ward Timeline', 'ti-timeline', this.TLINE.slice(0, 4).map((t) => `<div class="flex items-start gap-2 text-xs py-0.5"><i class="ti ${t[4]}" style="color:${t[5]}"></i> <div><span class="font-medium">${t[0]}</span> <span class="wd-muted">· ${t[1]}</span></div></div>`).join(''))}
                        ${sec('Notes', 'ti-note', `<p class="text-xs wd-muted">Deep-clean scheduled Sunday. 2 beds reserved for incoming ICU transfers.</p>`)}
                        <div class="grid grid-cols-2 gap-2">
                          <button data-modal="allocate" class="text-xs font-semibold border wd-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-bed"></i> Allocate</button>
                          <button data-modal="transfer" class="text-xs font-semibold border wd-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-transfer"></i> Transfer</button>
                          <button data-modal="doctor" class="text-xs font-semibold border wd-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-stethoscope"></i> Assign Dr</button>
                          <button data-modal="cleaning" class="text-xs font-semibold border wd-hairline rounded-lg py-2 hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-spray"></i> Cleaning</button>
                        </div>
                        <button data-modal="ward_edit" class="w-full text-sm font-semibold bg-[var(--wd-c)] text-white rounded-lg py-2.5 hover:opacity-90">Edit Ward Details</button>
                      </div>`;
    drawer.classList.add('open');
    this.syncBodyLock();
  }
  private closeDrawer(): void {
    const drawer = this.byId('wd-drawer');
    if (drawer) drawer.classList.remove('open');
    this.syncBodyLock();
  }
  private syncBodyLock(): void {
    const drawer = this.byId('wd-drawer');
    const modalHost = this.byId('wd-modalhost');
    this.document.body.style.overflow = (drawer && drawer.classList.contains('open')) || (modalHost && modalHost.innerHTML.trim()) ? 'hidden' : '';
  }

  /* ============ MODALS ============ */
  private fld(l: string, el: string): string {
    return `<div class="wd-field"><label>${l}</label>${el}</div>`;
  }
  private inp(ph?: string): string {
    return `<input class="wd-input mt-1" placeholder="${ph || ''}">`;
  }
  private selEl(opts: string[]): string {
    return `<select class="wd-input mt-1">${opts.map((o) => `<option>${o}</option>`).join('')}</select>`;
  }
  private drop(txt: string): string {
    return `<div class="wd-drop rounded-xl h-28 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800"><i class="ti ti-cloud-upload text-3xl wd-muted"></i><p class="text-sm font-semibold mt-1">${txt}</p></div>`;
  }
  private get wardOpts(): string[] {
    return this.WARDS.map((w) => w.code + ' — ' + w.name);
  }
  private get MODALS(): Record<string, { t: string; ic: string; body: string; cta: string }> {
    return {
      ward: { t: 'Add Ward', ic: 'ti-building-plus', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward Name', this.inp('e.g. General Ward 4'))}${this.fld('Ward Code', this.inp('e.g. GEN-4'))}${this.fld('Department', this.selEl(this.DEPTS))}${this.fld('Ward Type', this.selEl(this.TYPES))}${this.fld('Floor', this.selEl(this.FLOORS))}${this.fld('Capacity', this.inp('Number of beds'))}${this.fld('Doctor In-charge', this.selEl(this.DOCS))}${this.fld('Nurse In-charge', this.selEl(this.NURSES))}</div>`, cta: 'Create Ward' },
      ward_edit: { t: 'Edit Ward', ic: 'ti-edit', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward Name', this.inp('Ward name'))}${this.fld('Capacity', this.inp('Beds'))}${this.fld('Department', this.selEl(this.DEPTS))}${this.fld('Ward Type', this.selEl(this.TYPES))}</div>`, cta: 'Save Changes' },
      allocate: { t: 'Allocate Bed', ic: 'ti-bed', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Patient / MRN', this.inp('Search patient...'))}${this.fld('Ward', this.selEl(this.wardOpts))}${this.fld('Bed Number', this.selEl(['Auto-assign', 'B1', 'B2', 'B3', 'B4', 'B5']))}${this.fld('Admission Type', this.selEl(['General', 'ICU', 'Emergency', 'Isolation']))}</div>`, cta: 'Allocate Bed' },
      transfer: { t: 'Transfer Patient', ic: 'ti-transfer', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Patient / MRN', this.inp('Search patient...'))}${this.fld('From Ward', this.selEl(this.wardOpts))}${this.fld('To Ward', this.selEl(this.wardOpts))}${this.fld('Reason', this.selEl(['Step-down', 'Escalation', 'Isolation', 'Patient Request']))}</div>`, cta: 'Confirm Transfer' },
      doctor: { t: 'Assign Doctor', ic: 'ti-stethoscope', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward', this.selEl(this.wardOpts))}${this.fld('Doctor', this.selEl(this.DOCS))}${this.fld('Role', this.selEl(['In-charge', 'Consultant', 'Resident']))}${this.fld('Shift', this.selEl(['Morning', 'Evening', 'Night']))}</div>`, cta: 'Assign Doctor' },
      nurse: { t: 'Assign Nurse', ic: 'ti-nurse', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward', this.selEl(this.wardOpts))}${this.fld('Nurse', this.selEl(this.NURSES))}${this.fld('Shift', this.selEl(['Morning', 'Evening', 'Night']))}${this.fld('Beds Managed', this.inp('e.g. 8'))}</div>`, cta: 'Assign Nurse' },
      maintenance: { t: 'Maintenance Request', ic: 'ti-tool', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward / Bed', this.selEl(this.wardOpts))}${this.fld('Issue Type', this.selEl(['Equipment', 'Electrical', 'Plumbing', 'Furniture', 'Other']))}${this.fld('Priority', this.selEl(['Low', 'Medium', 'High', 'Urgent']))}${this.fld('Assign To', this.selEl(['Facilities Team', 'Bio-medical', 'Electrical']))}</div><div class="mt-3">${this.fld('Description', `<textarea class="wd-input mt-1" rows="2" placeholder="Describe the issue..."></textarea>`)}</div>`, cta: 'Submit Request' },
      cleaning: { t: 'Cleaning Schedule', ic: 'ti-spray', body: `<div class="grid sm:grid-cols-2 gap-3">${this.fld('Ward', this.selEl(this.wardOpts))}${this.fld('Type', this.selEl(['Routine', 'Deep Clean', 'Sanitization', 'Terminal Clean']))}${this.fld('Date', `<input type="text" placeholder="dd-mm-yyyy" class="wd-input mt-1" data-provider="flatpickr" data-date-format="d-m-Y">`)}${this.fld('Assign Team', this.selEl(['Housekeeping A', 'Housekeeping B', 'Contract']))}</div>`, cta: 'Schedule Cleaning' },
      import: { t: 'Import Wards', ic: 'ti-upload', body: `<div class="flex gap-2 mb-3">${['CSV', 'Excel', 'Ward Master'].map((f) => `<span class="wd-b wd-b-info">${f}</span>`).join('')}</div>${this.drop('Drop CSV / Excel / Ward Master file')}<button class="text-xs font-semibold text-[var(--wd-c)] hover:underline mt-2"><i class="ti ti-download"></i> Download sample template</button><div class="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"><i class="ti ti-circle-check"></i> Validation passed · 18 wards ready · 0 errors</div>`, cta: 'Import Wards' },
      export: { t: 'Export Wards', ic: 'ti-download', body: `<p class="text-xs wd-muted mb-2">Choose scope & format</p><div class="grid grid-cols-2 gap-2 mb-3">${['CSV', 'Excel', 'PDF', 'Print', 'Occupancy Report', 'Department Report', 'Floor Report', 'Selected Records', 'All Records'].map((f) => `<button data-expfmt="${f}" class="text-xs font-semibold border wd-hairline rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800">${f}</button>`).join('')}</div>`, cta: 'Export' },
      occupancy: { t: 'Ward Occupancy', ic: 'ti-chart-donut', body: `<div id="wd-occbars" class="space-y-2.5"></div>`, cta: 'Close' },
      timeline: { t: 'Ward Timeline', ic: 'ti-timeline', body: `<div class="wd-tl">${this.TLINE.map((t) => `<div class="wd-tl-item" style="--tc:${t[5]}"><p class="text-sm font-semibold"><i class="ti ${t[4]}" style="color:${t[5]}"></i> ${t[0]}</p><p class="text-[11px] wd-muted">${t[3]} · ${t[1]}</p></div>`).join('')}</div>`, cta: 'Close' },
    };
  }
  private readonly SIMPLE: Record<string, string> = { release: 'Bed released', pdf: 'PDF downloaded', print: 'Printing ward...', archive: 'Ward archived' };

  private modalHost(): HTMLElement {
    let host = this.byId('wd-modalhost');
    if (!host) {
      host = this.document.createElement('div');
      host.id = 'wd-modalhost';
      this.document.body.appendChild(host);
    }
    return host;
  }

  private openModal(key: string): void {
    const m = this.MODALS[key];
    if (!m) return;
    const host = this.modalHost();
    host.innerHTML = `<div class="wd-modal-wrap open"><div class="wd-modal-bg" data-close></div><div class="wd-modal">
                        <div class="flex items-center justify-between p-4 border-b wd-hairline"><h3 class="font-bold flex items-center gap-2"><i class="ti ${m.ic} text-[var(--wd-c)]"></i> ${m.t}</h3><button data-close class="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"><i class="ti ti-x"></i></button></div>
                        <div class="p-4">${m.body}</div>
                        <div class="flex justify-end gap-2 p-4 border-t wd-hairline"><button data-close class="text-sm font-semibold px-3 py-2 rounded-lg border wd-hairline hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button><button data-modalok="${key}" class="text-sm font-semibold px-4 py-2 rounded-lg bg-[var(--wd-c)] text-white hover:opacity-90">${m.cta}</button></div>
                    </div></div>`;
    this.syncBodyLock();
    const flatpickr = (window as any).flatpickr;
    if (typeof flatpickr !== 'undefined') {
      this.$$('[data-provider="flatpickr"]', host).forEach((el: any) => {
        if (el._flatpickr) return;
        const config: any = { disableMobile: true };
        if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
        flatpickr(el, config);
      });
    }
    if (key === 'occupancy') {
      this.bars('#wd-occbars', this.WARDS.slice(0, 8).map((w) => [w.code, this.occPct(w), this.occColor(w)] as [string, number, string]));
    }
  }
  private openDelete(msg: string, onOk: () => void): void {
    const host = this.modalHost();
    host.innerHTML = `<div class="wd-modal-wrap open"><div class="wd-modal-bg" data-close></div><div class="wd-modal" style="width:min(420px,94vw)"><div class="p-5 text-center"><div class="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto mb-3"><i class="ti ti-alert-triangle text-2xl"></i></div><h3 class="font-bold text-lg">Confirm Deletion</h3><p class="text-xs wd-muted mt-1">${msg}</p><div class="flex gap-2 mt-4"><button data-close class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border wd-hairline hover:bg-gray-50 dark:hover:bg-slate-800">Cancel</button><button id="wd-delok" class="flex-1 text-sm font-semibold px-3 py-2 rounded-lg bg-rose-500 text-white hover:opacity-90">Delete</button></div></div></div></div>`;
    this.syncBodyLock();
    const btn = this.byId('wd-delok');
    if (btn) {
      btn.onclick = () => {
        onOk();
        this.closeModal();
      };
    }
  }
  private closeModal(): void {
    const host = this.byId('wd-modalhost');
    if (host) host.innerHTML = '';
    this.syncBodyLock();
  }

  /* ============ BULK ============ */
  private updateBulk(): void {
    const el = this.byId('wd-selcount');
    if (el) el.textContent = String(this.state.sel.size);
    this.$$('.wd-bulk').forEach((b) => b.classList.toggle('show', this.state.sel.size > 0));
  }

  /* ============ EVENTS ============ */
  private bindEvents(): void {
    this.document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('#wd-viewtoggle button')) {
        const b = target.closest('button') as HTMLElement;
        this.state.view = b.dataset['view'] || 'dashboard';
        this.$$('#wd-viewtoggle button').forEach((x) => x.classList.toggle('on', x === b));
        this.$$('.wd-view').forEach((v) => v.classList.toggle('active', (v as HTMLElement).dataset['viewpanel'] === this.state.view));
        this.renderView();
        this.animateRings();
        return;
      }
      if (target.closest('[data-alloctab]')) {
        const b = target.closest('[data-alloctab]') as HTMLElement;
        this.state.alloctab = b.dataset['alloctab'] || 'All';
        this.$$('#wd-alloctabs [data-alloctab]').forEach((x) => {
          x.className = 'wd-b ' + (x === b ? 'wd-b-info' : '');
          if (x !== b) (x as HTMLElement).style.background = 'var(--color-gray-100)';
          else (x as HTMLElement).style.background = '';
        });
        this.renderAlloc();
        return;
      }
      const t = target.closest(
        '[data-drawer],[data-menu],[data-action],[data-modal],[data-modalok],[data-close],[data-refresh],[data-print],[data-clear],[data-cols-btn],[data-bulk],[data-expfmt],[data-bed]'
      ) as HTMLElement | null;
      if (!t) {
        if (!target.closest('.wd-menu')) this.closeMenu();
        if (!target.closest('#wd-colmenu') && !target.closest('[data-cols-btn]')) {
          const colmenu = this.byId('wd-colmenu');
          if (colmenu) colmenu.classList.add('hidden');
        }
        return;
      }

      if (t.dataset['bed'] !== undefined) {
        this.toastService.show('Bed ' + (+t.dataset['bed'] + 1) + ' — options', 'info');
        return;
      }
      if (t.dataset['drawer'] !== undefined) {
        this.openDrawer(+t.dataset['drawer']);
        return;
      }
      if (t.dataset['menu'] !== undefined) {
        const r = t.getBoundingClientRect();
        this.openMenu(+t.dataset['menu'], r.left - 195, r.bottom + 4);
        return;
      }
      if (t.dataset['action'] !== undefined) {
        const a = t.dataset['action'];
        const wid = +(t.dataset['wid'] || '0');
        this.closeMenu();
        if (a === 'drawer') this.openDrawer(wid);
        else if (a === 'ward_edit' || a === 'occupancy' || a === 'timeline' || this.MODALS[a as string]) this.openModal(a as string);
        else if (a === 'delete') {
          this.openDelete('Delete this ward permanently? All bed assignments will be cleared.', () => {
            this.WARDS = this.WARDS.filter((x) => x.id !== wid);
            this.state.sel.delete(wid);
            this.refreshAll();
            this.toastService.show('Ward deleted', 'success');
          });
        } else if (a && this.SIMPLE[a]) this.toastService.show(this.SIMPLE[a], 'info');
        return;
      }
      if (t.dataset['modal'] !== undefined) {
        this.openModal(t.dataset['modal'] as string);
        return;
      }
      if (t.dataset['modalok'] !== undefined) {
        const k = t.dataset['modalok'] as string;
        if (k === 'occupancy' || k === 'timeline') {
          this.closeModal();
          return;
        }
        this.toastService.show(this.MODALS[k].cta + ' — done', 'success');
        if (k === 'ward') {
          this.WARDS.push(this.mk(this.WARDS.length));
          this.refreshAll();
        }
        this.closeModal();
        return;
      }
      if (t.dataset['expfmt'] !== undefined) {
        this.toastService.show('Exported: ' + t.dataset['expfmt'], 'success');
        this.closeModal();
        return;
      }
      if (t.dataset['close'] !== undefined) {
        this.closeModal();
        this.closeDrawer();
        return;
      }
      if (t.dataset['refresh'] !== undefined) {
        const sync = this.byId('wd-sync');
        if (sync) sync.textContent = 'just now';
        this.refreshAll();
        this.animateRings();
        this.toastService.show('Data refreshed', 'success');
        return;
      }
      if (t.dataset['print'] !== undefined) {
        this.toastService.show('Preparing print view...', 'info');
        return;
      }
      if (t.dataset['clear'] !== undefined) {
        this.state.q = this.state.type = this.state.dept = this.state.floor = this.state.status = this.state.sort = '';
        const search = this.byId('wd-search') as HTMLInputElement | null;
        if (search) search.value = '';
        this.$$('[data-filter]').forEach((s) => ((s as HTMLInputElement).value = ''));
        this.refreshAll();
        return;
      }
      if (t.dataset['colsBtn'] !== undefined) {
        const menu = this.byId('wd-colmenu');
        if (!menu) return;
        menu.classList.toggle('hidden');
        const r = t.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.left = Math.max(12, r.right - 225) + 'px';
        menu.style.top = r.bottom + 4 + 'px';
        return;
      }
      if (t.dataset['bulk'] !== undefined) {
        const b = t.dataset['bulk'] as string;
        if (b === 'delete') {
          this.openDelete(`Delete ${this.state.sel.size} selected ward(s)?`, () => {
            this.WARDS = this.WARDS.filter((x) => !this.state.sel.has(x.id));
            this.state.sel.clear();
            this.refreshAll();
            this.toastService.show('Wards deleted', 'success');
          });
        } else {
          const labels: Record<string, string> = { allocate: 'Beds allocated', transfer: 'Transfers initiated', staff: 'Staff assigned', export: 'Exported', print: 'Printing', status: 'Status updated', archive: 'Archived' };
          this.toastService.show(labels[b] + ' · ' + this.state.sel.size + ' wards', 'success');
          if (b === 'archive') {
            this.state.sel.clear();
            this.refreshAll();
          }
        }
        return;
      }
    });

    this.document.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement;
      if ((target as HTMLInputElement).dataset && (target as HTMLElement).dataset['sel'] !== undefined) {
        const id = +((target as HTMLElement).dataset['sel'] as string);
        (target as HTMLInputElement).checked ? this.state.sel.add(id) : this.state.sel.delete(id);
        this.updateBulk();
        return;
      }
      if ((target as HTMLElement).dataset['selall'] !== undefined) {
        const on = (target as HTMLInputElement).checked;
        this.filtered().forEach((w) => (on ? this.state.sel.add(w.id) : this.state.sel.delete(w.id)));
        this.renderList();
        this.updateBulk();
        return;
      }
      if ((target as HTMLElement).dataset['coltoggle'] !== undefined) {
        this.state.cols[(target as HTMLElement).dataset['coltoggle'] as string] = (target as HTMLInputElement).checked ? 1 : 0;
        this.renderList();
        return;
      }
      if (target.id === 'wd-bedward') {
        this.renderBedCenter();
        return;
      }
      const f = target.closest('[data-filter]') as HTMLInputElement | null;
      if (f) {
        (this.state as any)[f.dataset['filter'] as string] = f.value;
        this.refreshAll();
      }
    });

    this.document.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.id === 'wd-search') {
        this.state.q = (target as HTMLInputElement).value;
        this.renderView();
      }
    });
  }

  /* ============ INIT ============ */
  private fillDepts(): void {
    const el = this.$('[data-filter="dept"]');
    if (!el) return;
    el.innerHTML = '<option value="">Department</option>' + this.DEPTS.map((d) => `<option>${d}</option>`).join('');
  }

  ngAfterViewInit(): void {
    this.bindEvents();
    setTimeout(() => {
      const skeleton = this.byId('wd-skeleton');
      const content = this.byId('wd-content');
      if (skeleton) skeleton.classList.add('hidden');
      if (content) content.classList.remove('hidden');
      this.fillDepts();
      this.buildColMenu();
      this.refreshAll();
      this.animateCounts();
      this.animateRings();
    }, 1500);
  }
}
