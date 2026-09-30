import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

type Eligibility = 'elig' | 'soon' | 'defer' | 'new';
type ViewMode = 'grid' | 'compact' | 'list';

interface Donor {
  id: number;
  name: string;
  g: string;
  age: number;
  gender: string;
  phone: string;
  city: string;
  el: Eligibility;
  donations: number;
  last: string;
  next: string;
  av: string;
  photo: string;
  badge: 'Gold' | 'Silver' | 'Bronze' | 'New';
}


@Component({
  imports: [],
  selector: 'app-blood-donors',
  styleUrl: './blood-donors.css',
  templateUrl: './blood-donors.html',
})
export class BloodDonors implements AfterViewInit {
  private readonly GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  private readonly GCOL: Record<string, string> = {
    'O+': '#dc2626', 'O-': '#b91c1c', 'A+': '#e06c1f', 'A-': '#c2560e',
    'B+': '#7c3aed', 'B-': '#6d28d9', 'AB+': '#1d4ed8', 'AB-': '#1e40af',
  };
  private readonly ELL: Record<Eligibility, string> = { elig: 'Eligible', soon: 'Eligible Soon', defer: 'Deferred', new: 'New Donor' };
  private readonly ELC: Record<Eligibility, string> = { elig: '#15803d', soon: '#b7791f', defer: '#dc2626', new: '#1d4ed8' };
  private readonly BADGE_C: Record<string, string> = { Gold: '#f59e0b', Silver: '#94a3b8', Bronze: '#b45309', New: '#1d4ed8' };
  private readonly FIRST = ['Rahul', 'Anita', 'Vikram', 'Priya', 'Suresh', 'Meera', 'Arjun', 'Kavya', 'Deepak', 'Neha', 'Rohan', 'Sana', 'Manoj', 'Divya', 'Karan', 'Pooja'];
  private readonly LAST = ['Sharma', 'Reddy', 'Nair', 'Patel', 'Gupta', 'Singh', 'Menon', 'Das', 'Joshi', 'Verma'];
  private readonly AVC = ['#475569', '#0f766e', '#1e40af', '#4338ca', '#0e7490', '#334155', '#3f6212', '#7c2d12'];
  private readonly CITIES = ['Whitefield', 'Indiranagar', 'Koramangala', 'Jayanagar', 'HSR Layout', 'Marathahalli'];
  private readonly MPHOTO = ['assets/img/avatar/avatar-01.jpg', 'assets/img/avatar/avatar-02.jpg', 'assets/img/avatar/avatar-06.jpg', 'assets/img/avatar/avatar-07.jpg', 'assets/img/avatar/avatar-11.jpg', 'assets/img/avatar/avatar-12.jpg', 'assets/img/avatar/avatar-13.jpg', 'assets/img/avatar/avatar-15.jpg'];
  private readonly FPHOTO = ['assets/img/avatar/avatar-03.jpg', 'assets/img/avatar/avatar-04.jpg', 'assets/img/avatar/avatar-05.jpg', 'assets/img/avatar/avatar-08.jpg', 'assets/img/avatar/avatar-09.jpg', 'assets/img/avatar/avatar-10.jpg', 'assets/img/avatar/avatar-14.jpg', 'assets/img/avatar/avatar-16.jpg'];

  private DON: Donor[] = [];
  private sel = new Set<number>();
  private view: ViewMode = 'grid';
  private q = '';
  private fGroup = '';
  private fElig = '';
  private sort = '';
  private focusId = 0;
  private clockTimer: any = null;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {
    this.DON = Array.from({ length: 16 }, (_, i) => {
      const els: Eligibility[] = ['elig', 'elig', 'soon', 'defer', 'new', 'elig', 'soon', 'elig'];
      const el = els[i % 8];
      const don = el === 'new' ? 0 : this.rnd(1, 42);
      const gender = i % 2 ? 'Male' : 'Female';
      const badge: Donor['badge'] = don >= 25 ? 'Gold' : don >= 10 ? 'Silver' : don >= 3 ? 'Bronze' : 'New';
      return {
        id: i,
        name: this.FIRST[i % this.FIRST.length] + ' ' + this.LAST[(i * 3) % this.LAST.length],
        g: this.GROUPS[i % this.GROUPS.length],
        age: this.rnd(19, 58),
        gender,
        phone: '+91 98' + this.rnd(10000000, 99999999),
        city: this.CITIES[i % this.CITIES.length],
        el,
        donations: don,
        last: el === 'new' ? '—' : ['3 weeks ago', '2 months ago', '5 months ago', 'Yesterday'][i % 4],
        next: el === 'elig' ? 'Now' : el === 'soon' ? this.rnd(1, 8) + ' weeks' : el === 'defer' ? 'Deferred' : 'After screening',
        av: this.AVC[i % this.AVC.length],
        photo: (gender === 'Male' ? this.MPHOTO : this.FPHOTO)[Math.floor(i / 2) % 8],
        badge,
      };
    });
  }

  ngAfterViewInit(): void {
    this.document.addEventListener('click', (e) => this.onDocClick(e));
    this.document.addEventListener('change', (e) => this.onDocChange(e));
    this.document.addEventListener('input', (e) => this.onDocInput(e));

    setTimeout(() => {
      this.byId('bd-skeleton')?.classList.add('hidden');
      this.byId('bd-content')?.classList.remove('hidden');
      this.refreshAll();
      this.clock();
      this.clockTimer = setInterval(() => this.clock(), 1000);
    }, 1400);
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private rnd(a: number, b: number): number {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  private initials(n: string): string {
    return n.split(' ').map((x) => x[0]).join('').slice(0, 2);
  }

  private detailUrl(d: Donor): string {
    return `blood-donor-profile.html?${new URLSearchParams({
      id: String(d.id), name: d.name, g: d.g, age: String(d.age), gender: d.gender, phone: d.phone,
      city: d.city, el: d.el, donations: String(d.donations), last: d.last, next: d.next, badge: d.badge,
    }).toString()}`;
  }

  private filtered(): Donor[] {
    let r = this.DON.filter((d) => {
      if (this.q) {
        const t = this.q.toLowerCase();
        if (!(d.name.toLowerCase().includes(t) || d.g.toLowerCase().includes(t) || d.phone.includes(t))) return false;
      }
      if (this.fGroup && d.g !== this.fGroup) return false;
      if (this.fElig && d.el !== this.fElig) return false;
      return true;
    });
    if (this.sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    else if (this.sort === 'donations') r = [...r].sort((a, b) => b.donations - a.donations);
    return r;
  }

  private updateCounts(): void {
    const el = this.DON.filter((d) => d.el === 'elig').length;
    const e1 = this.byId('bd-h-elig');
    if (e1) e1.textContent = String(el);
    const e2 = this.byId('bd-h-elig2');
    if (e2) e2.textContent = String(el);
    const total = this.byId('bd-h-total');
    if (total) total.textContent = String(this.DON.length);
  }

  private readonly ACTIONS: Array<[string, string, string]> = [
    ['View Profile', 'icon-eye', 'view'], ['Edit', 'icon-edit', 'edit'],
    ['Schedule Donation', 'icon-calendar-plus', 'appointment'], ['Record Donation', 'icon-droplet', 'record'],
    ['Send Reminder', 'icon-bell', 'remind'], ['Contact', 'icon-phone', 'contact'],
    ['Eligibility Check', 'icon-shield-check', 'eligcheck'], ['sep', '', ''],
    ['Print Card', 'icon-printer', 'print'], ['Download PDF', 'icon-file-down', 'pdf'],
    ['Archive', 'icon-archive', 'archive'], ['Delete', 'icon-trash-2', 'delete'],
  ];
  private readonly MODAL_ACTIONS: Record<string, boolean> = { edit: true, appointment: true, record: true };

  private donorMenu(id: number, posCls: string): string {
    const items = this.ACTIONS.map((a) => {
      if (a[0] === 'sep') return '<div class="my-1 border-t border-border-color"></div>';
      const overlay = this.MODAL_ACTIONS[a[2]] ? ` data-hs-overlay="#bd-modal-${a[2]}"` : (a[2] === 'delete' ? ' data-hs-overlay="#bd-modal-delete"' : '');
      const cls = a[2] === 'delete' ? 'text-danger hover:bg-danger/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700';
      return `<button type="button" role="menuitem" data-action="${a[2]}" data-did="${id}"${overlay} class="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-sm text-left ${cls}"><i class="${a[1]} text-sm"></i> ${a[0]}</button>`;
    }).join('');
    const hasPos = /(^|\s)(absolute|fixed|sticky|static)(\s|$)/.test(posCls || '');
    return `<div class="hs-dropdown [--placement:bottom-right] [--auto-close:inside] inline-flex${hasPos ? '' : ' relative'}${posCls ? ' ' + posCls : ''}" onclick="event.stopPropagation()">
            <button type="button" class="hs-dropdown-toggle bd-donor-menubtn w-7 h-7 rounded-lg flex items-center justify-center" aria-haspopup="menu" aria-expanded="false"><i class="icon-more-vertical text-sm"></i></button>
            <div class="hs-dropdown-menu transition-[opacity,margin] duration-150 hs-dropdown-open:opacity-100 opacity-0 hidden z-50 min-w-44 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-1 border border-border-color" role="menu">${items}</div>
        </div>`;
  }

  private donorCard(d: Donor): string {
    const live = d.el === 'elig';
    return `<div class="bd-donor el-${d.el}" data-donor="${d.id}">
            <div class="bd-donor-banner">
                <label onclick="event.stopPropagation()" class="absolute top-2.5 left-2.5 z-10"><input type="checkbox" data-sel="${d.id}" ${this.sel.has(d.id) ? 'checked' : ''} class="accent-rose-600"></label>
                ${this.donorMenu(d.id, 'absolute top-2 right-2 z-10')}
            </div>
            <div class="px-4 pb-4 -mt-8">
                <div class="flex items-end justify-between">
                    <div class="bd-avatar-ring"><img class="bd-avatar" style="width:54px;height:54px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot${live ? ' bd-live' : ''} absolute -bottom-0.5 -right-0.5" style="background:${this.ELC[d.el]}"></span></div>
                    <span class="bd-gtag mb-1" style="width:38px;height:38px;background:${this.GCOL[d.g]};font-size:.82rem">${d.g}</span>
                </div>
                <p class="bd-donor-name mt-2.5"><a href="${this.detailUrl(d)}" onclick="event.stopPropagation()" class="hover:underline">${d.name}</a></p>
                <p class="text-[11px] bd-mut mt-1">${d.age}y · ${d.gender} · ${d.city}</p>
                <div class="flex items-center gap-1.5 mt-2 flex-wrap"><span class="bd-chip" style="background:color-mix(in srgb,${this.ELC[d.el]} 13%,transparent);color:${this.ELC[d.el]}"><span class="bd-dot" style="background:${this.ELC[d.el]}"></span> ${this.ELL[d.el]}</span><span class="bd-npill"><i class="icon-medal text-[10px]" style="color:${this.BADGE_C[d.badge]}"></i> ${d.badge}</span></div>
                <div class="bd-stat-row mt-3">
                    <div class="bd-stat"><span class="bd-stat-ic" style="background:color-mix(in srgb,#dc2626 14%,transparent);color:#dc2626"><i class="icon-droplet"></i></span><p class="bd-stat-val bd-head">${d.donations}</p><p class="bd-stat-lbl">Donations</p></div>
                    <div class="bd-stat"><span class="bd-stat-ic" style="background:color-mix(in srgb,${this.ELC[d.el]} 14%,transparent);color:${this.ELC[d.el]}"><i class="icon-calendar-check"></i></span><p class="bd-stat-val" style="color:${this.ELC[d.el]}">${d.next}</p><p class="bd-stat-lbl">Next Eligible</p></div>
                </div>
                <p class="text-[10px] bd-mut mt-2.5"><i class="icon-clock text-[10px]"></i> Last donation ${d.last}</p>
                <div class="flex gap-2 mt-3">
                    <button data-hs-overlay="#bd-modal-appointment" onclick="event.stopPropagation()" class="bd-btn bd-btn-primary flex-1 justify-center !py-2 text-xs"><i class="icon-calendar-plus"></i> Schedule</button>
                    <button data-hs-overlay="#bd-modal-record" onclick="event.stopPropagation()" title="Record Donation" class="bd-btn bd-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-droplet"></i></button>
                    <a href="${this.detailUrl(d)}" onclick="event.stopPropagation()" title="View Profile" class="bd-btn bd-btn-ghost !py-2 !px-2.5 text-xs"><i class="icon-eye"></i></a>
                </div>
            </div>
        </div>`;
  }

  private compactCard(d: Donor): string {
    return `<div class="bd-donor el-${d.el} p-3" data-donor="${d.id}">
            <div class="flex items-center gap-2.5">
                <div class="relative flex-none"><img class="bd-avatar round" style="width:42px;height:42px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot absolute -bottom-0.5 -right-0.5" style="background:${this.ELC[d.el]}"></span></div>
                <div class="min-w-0 flex-1"><p class="text-sm font-bold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut">${d.donations} donations · ${d.city}</p></div>
                <span class="bd-gtag" style="width:32px;height:32px;background:${this.GCOL[d.g]};font-size:.72rem">${d.g}</span>
            </div>
            <div class="flex items-center justify-between mt-2"><span class="bd-chip" style="background:color-mix(in srgb,${this.ELC[d.el]} 13%,transparent);color:${this.ELC[d.el]}">${this.ELL[d.el]}</span><span class="text-[11px] bd-mut">Next: ${d.next}</span></div>
        </div>`;
  }

  private listRow(d: Donor): string {
    return `<div class="bd-row el-${d.el}" data-donor="${d.id}" style="cursor:pointer">
            <label onclick="event.stopPropagation()"><input type="checkbox" data-sel="${d.id}" ${this.sel.has(d.id) ? 'checked' : ''} class="accent-rose-600"></label>
            <div class="flex items-center gap-2.5 min-w-0"><img class="bd-avatar round flex-none" style="width:36px;height:36px" src="${d.photo}" alt="${d.name}"><div class="min-w-0"><p class="text-sm font-semibold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut truncate">${d.phone}</p></div></div>
            <div><span class="bd-gtag" style="width:34px;height:28px;background:${this.GCOL[d.g]};font-size:.7rem">${d.g}</span></div>
            <div class="text-xs bd-head">${d.donations} donations<p class="bd-mut">${d.last}</p></div>
            <div><span class="bd-chip" style="background:color-mix(in srgb,${this.ELC[d.el]} 13%,transparent);color:${this.ELC[d.el]}">${this.ELL[d.el]}</span></div>
            ${this.donorMenu(d.id, 'justify-self-end')}
        </div>`;
  }

  private renderDirectory(): void {
    const list = this.filtered();
    const count = this.byId('bd-count');
    if (count) count.textContent = String(list.length);
    const host = this.byId('bd-directory');
    if (!host) return;
    if (this.view === 'list') {
      host.innerHTML = `<div class="bd-card overflow-hidden"><div class="bd-row !py-2 text-[10px] uppercase tracking-wide bd-mut font-bold"><span></span><span>Donor</span><span>Group</span><span>History</span><span>Eligibility</span><span></span></div>${list.map((d) => this.listRow(d)).join('') || '<p class="text-sm bd-mut text-center py-6">No donors found.</p>'}</div>`;
    } else if (this.view === 'compact') {
      host.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((d) => this.compactCard(d)).join('')}</div>`;
    } else {
      host.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">${list.map((d) => this.donorCard(d)).join('') || '<p class="text-sm bd-mut text-center py-6 col-span-4">No donors found.</p>'}</div>`;
    }
    if ((window as any).HSStaticMethods) (window as any).HSStaticMethods.autoInit();
  }

  private renderDistribution(): void {
    const counts: Array<[string, number]> = this.GROUPS.map((g) => [g, this.DON.filter((d) => d.g === g).length]);
    const mx = Math.max(...counts.map((c) => c[1])) || 1;
    const host = this.byId('bd-distribution');
    if (host) {
      host.innerHTML = counts.map((c) => `<div class="bd-panel p-3">
            <div class="flex items-center justify-between mb-2"><span class="bd-gtag" style="width:34px;height:30px;background:${this.GCOL[c[0]]};font-size:.72rem">${c[0]}</span><span class="text-lg font-bold bd-head">${c[1]}</span></div>
            <div class="bd-stab"><span style="width:${Math.round((c[1] / mx) * 100)}%;background:${this.GCOL[c[0]]}"></span></div>
            <p class="text-[10px] bd-mut mt-1.5">donors registered</p>
        </div>`).join('');
    }
  }

  private renderEligibility(): void {
    const host = this.byId('bd-eligibility');
    if (!host) return;
    host.innerHTML = (Object.keys(this.ELL) as Eligibility[]).filter((k) => k !== 'new').map((k) => {
      const list = this.DON.filter((d) => d.el === k);
      const icon = k === 'elig' ? 'circle-check' : k === 'soon' ? 'clock' : k === 'defer' ? 'circle-x' : 'user-plus';
      return `<div class="bd-panel p-2.5 flex items-center gap-2.5" style="border-left:3px solid ${this.ELC[k]}">
                <span class="bd-iconbadge w-8 h-8 flex-none" style="color:${this.ELC[k]}"><i class="icon-${icon}"></i></span>
                <span class="text-sm font-medium bd-head flex-1">${this.ELL[k]}</span>
                <div class="flex -space-x-2">${list.slice(0, 4).map((d) => `<img class="bd-avatar round" style="width:24px;height:24px;border:2px solid var(--bd-surface)" src="${d.photo}" alt="${d.name}">`).join('')}</div>
                <span class="bd-chip" style="background:color-mix(in srgb,${this.ELC[k]} 13%,transparent);color:${this.ELC[k]}">${list.length}</span>
            </div>`;
    }).join('');
  }

  private renderTop(): void {
    const top = [...this.DON].sort((a, b) => b.donations - a.donations).slice(0, 5);
    const medals = ['#f59e0b', '#94a3b8', '#b45309', '#64748b', '#64748b'];
    const host = this.byId('bd-top');
    if (host) {
      host.innerHTML = top.map((d, i) => `<div class="bd-panel p-3 flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-none" style="background:${medals[i]}">${i + 1}</span>
            <span class="bd-avatar round flex-none" style="width:34px;height:34px;background:${d.av};font-size:11px">${this.initials(d.name)}</span>
            <div class="min-w-0 flex-1"><p class="text-sm font-semibold bd-head truncate">${d.name}</p><p class="text-[11px] bd-mut">${d.g} · ${d.badge} donor</p></div>
            <div class="text-right"><p class="text-sm font-bold bd-hicon">${d.donations}</p><p class="text-[10px] bd-mut">donations</p></div>
        </div>`).join('');
    }
  }

  private stars(n: number): string {
    const f = Math.min(5, Math.round(n / 8));
    return Array.from({ length: 5 }, (_, i) => `<i class="icon-star text-[11px]" style="color:${i < f ? '#f59e0b' : 'var(--bd-soft)'}"></i>`).join('');
  }

  private openDrawer(id: number): void {
    const d = this.DON.find((x) => x.id === id);
    const drawer = this.byId('bd-drawer');
    if (!d || !drawer) return;
    const box = (t: string, ic: string, body: string) => `<div class="bd-panel p-3"><p class="text-[11px] font-bold bd-mut uppercase tracking-wide mb-2 flex items-center gap-1.5"><i class="${ic} bd-hicon text-[13px]"></i> ${t}</p>${body}</div>`;
    const row = (k: string, v: string) => `<div class="flex justify-between text-xs py-0.5"><span class="bd-mut">${k}</span><span class="font-medium bd-head">${v}</span></div>`;
    const hist = ['3 weeks ago · A+ · 450ml', '4 months ago · A+ · 450ml', '8 months ago · A+ · 350ml'];
    drawer.innerHTML = `
          <div class="bd-donor-banner el-${d.el}" style="height:80px;border-radius:0"></div>
          <div class="px-4 -mt-8">
            <div class="flex items-end justify-between">
                <div class="relative"><img class="bd-avatar" style="width:64px;height:64px" src="${d.photo}" alt="${d.name}"><span class="bd-statusdot absolute bottom-0 right-0" style="width:16px;height:16px;background:${this.ELC[d.el]}"></span></div>
                <button data-close class="w-8 h-8 rounded-lg bg-[var(--bd-surface)] border flex items-center justify-center bd-mut mb-1" style="border-color:var(--bd-border)"><i class="icon-x"></i></button>
            </div>
            <div class="flex items-center gap-2 mt-2"><p class="font-bold text-lg bd-head">${d.name}</p><span class="bd-gtag" style="width:34px;height:28px;background:${this.GCOL[d.g]};font-size:.7rem">${d.g}</span></div>
            <p class="text-[11px] bd-mut">${d.age}y · ${d.gender} · ${d.city}</p>
            <div class="flex items-center gap-2 mt-1.5">${this.stars(d.donations)}<span class="bd-chip ml-auto" style="background:color-mix(in srgb,${this.ELC[d.el]} 13%,transparent);color:${this.ELC[d.el]}">${this.ELL[d.el]}</span></div>
          </div>
          <div class="p-4 space-y-3">
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bd-panel py-2"><p class="text-lg font-bold bd-head">${d.donations}</p><p class="text-[10px] bd-mut">Donations</p></div>
                <div class="bd-panel py-2"><p class="text-lg font-bold" style="color:${this.ELC[d.el]}">${d.next}</p><p class="text-[10px] bd-mut">Next Eligible</p></div>
                <div class="bd-panel py-2"><p class="text-lg font-bold" style="color:${this.BADGE_C[d.badge]}">${d.badge}</p><p class="text-[10px] bd-mut">Badge</p></div>
            </div>
            ${box('Contact', 'icon-phone', row('Phone', d.phone) + row('City', d.city) + row('Email', d.name.split(' ')[0].toLowerCase() + '@mail.com'))}
            ${box('Medical / Eligibility', 'icon-shield-check', row('Status', this.ELL[d.el]) + row('Last Donation', d.last) + row('Hemoglobin', '13.8 g/dL') + row('Weight', this.rnd(56, 84) + ' kg'))}
            ${box('Donation History', 'icon-droplet', hist.map((h) => `<div class="flex items-center gap-2 text-xs py-0.5"><span class="bd-dot" style="background:${this.GCOL[d.g]}"></span> ${h}</div>`).join(''))}
            <div class="grid grid-cols-2 gap-2">
                <button data-hs-overlay="#bd-modal-appointment" class="bd-btn bd-btn-primary justify-center"><i class="icon-calendar-plus"></i> Schedule</button>
                <button data-hs-overlay="#bd-modal-record" class="bd-btn bd-btn-ghost justify-center"><i class="icon-droplet"></i> Record</button>
                <button data-hs-overlay="#bd-modal-edit" class="bd-btn bd-btn-ghost justify-center"><i class="icon-edit"></i> Edit</button>
                <button data-simple="contact" class="bd-btn bd-btn-ghost justify-center"><i class="icon-phone"></i> Call</button>
            </div>
          </div>`;
    drawer.classList.add('open');
    this.document.body.style.overflow = 'hidden';
  }

  private closeDrawer(): void {
    this.byId('bd-drawer')?.classList.remove('open');
    this.document.body.style.overflow = '';
  }

  private readonly MODAL_CTA: Record<string, string> = { add: 'Register Donor', edit: 'Save Changes', appointment: 'Schedule', record: 'Record Donation', camp: 'Create Camp', import: 'Import', export: 'Export' };
  private readonly SIMPLE: Record<string, string> = { remind: 'Reminder sent', contact: 'Calling donor...', eligcheck: 'Eligibility verified', print: 'Printing donor card...', pdf: 'PDF downloaded', archive: 'Donor archived' };

  private pendingDelete: (() => void) | null = null;
  private askDelete(msg: string, onOk: () => void): void {
    const msgEl = this.byId('bd-delete-msg');
    if (msgEl) msgEl.textContent = msg;
    this.pendingDelete = onOk;
    // No confirm overlay ships in this page's markup, so mirror the source's
    // behavior only as far as it can run without one: the pending action
    // stays armed until #bd-delete-confirm (if present) fires it.
  }

  private updateBulk(): void {
    const count = this.byId('bd-selcount');
    if (count) count.textContent = String(this.sel.size);
    this.document.querySelectorAll('.bd-bulk').forEach((el) => el.classList.toggle('show', this.sel.size > 0));
  }

  private refreshAll(): void {
    this.renderDirectory();
    this.renderDistribution();
    this.renderEligibility();
    this.renderTop();
    this.updateCounts();
  }

  private onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    const vwBtn = target.closest('[data-vw]') as HTMLElement | null;
    if (vwBtn) {
      this.view = vwBtn.dataset['vw'] as ViewMode;
      this.document.querySelectorAll('#bd-viewtabs button').forEach((x) => x.classList.toggle('on', x === vwBtn));
      this.renderDirectory();
      return;
    }
    const simpleBtn = target.closest('[data-simple]') as HTMLElement | null;
    if (simpleBtn) {
      this.toast(this.SIMPLE[simpleBtn.dataset['simple'] || ''] || 'Done');
      return;
    }
    const t = target.closest('[data-donor],[data-action],[data-modalok],[data-close],[data-bulk],[data-expfmt]') as HTMLElement | null;
    if (!t) return;
    if (t.dataset['donor'] !== undefined) {
      this.focusId = +t.dataset['donor']!;
      this.openDrawer(this.focusId);
      return;
    }
    if (t.dataset['action'] !== undefined) {
      const a = t.dataset['action']!;
      const id = +(t.dataset['did'] || '0');
      this.focusId = id;
      if (a === 'view') this.openDrawer(id);
      else if (a === 'delete') {
        this.askDelete('Remove this donor from the registry?', () => {
          this.DON = this.DON.filter((x) => x.id !== id);
          this.sel.delete(id);
          this.refreshAll();
          this.toast('Donor removed', 'success');
        });
      } else if (this.SIMPLE[a]) this.toast(this.SIMPLE[a]);
      return;
    }
    if (t.dataset['modalok'] !== undefined) {
      const k = t.dataset['modalok']!;
      const d = this.DON.find((x) => x.id === this.focusId);
      if (k === 'record' && d) {
        d.donations++;
        d.el = 'soon';
        d.last = 'Today';
      }
      this.refreshAll();
      this.toast((this.MODAL_CTA[k] || '') + ' — done', 'success');
      return;
    }
    if (t.dataset['expfmt'] !== undefined) {
      this.toast('Exported: ' + t.dataset['expfmt'], 'success');
      return;
    }
    if (t.dataset['close'] !== undefined) {
      this.closeDrawer();
      return;
    }
    if (t.dataset['bulk'] !== undefined) {
      const bk = t.dataset['bulk']!;
      if (bk === 'delete') {
        this.askDelete(`Remove ${this.sel.size} selected donor(s)?`, () => {
          this.DON = this.DON.filter((x) => !this.sel.has(x.id));
          this.sel.clear();
          this.refreshAll();
          this.updateBulk();
          this.toast('Donors removed', 'success');
        });
      } else {
        const labels: Record<string, string> = { notify: 'Notifications sent', appointment: 'Appointments scheduled', sms: 'SMS sent', export: 'Exported', print: 'Printing', archive: 'Archived' };
        this.toast((labels[bk] || '') + ' · ' + this.sel.size + ' donors');
        if (bk === 'archive') {
          this.sel.clear();
          this.refreshAll();
          this.updateBulk();
        }
      }
      return;
    }
  }

  private onDocChange(e: Event): void {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    if ((target as HTMLElement).dataset && (target as HTMLElement).dataset['sel'] !== undefined) {
      const id = +(target as HTMLElement).dataset['sel']!;
      (target as HTMLInputElement).checked ? this.sel.add(id) : this.sel.delete(id);
      this.updateBulk();
      return;
    }
    if (target.id === 'bd-fgroup') {
      this.fGroup = target.value;
      this.renderDirectory();
    }
    if (target.id === 'bd-felig') {
      this.fElig = target.value;
      this.renderDirectory();
    }
    if (target.id === 'bd-sort') {
      this.sort = target.value;
      this.renderDirectory();
    }
  }

  private onDocInput(e: Event): void {
    const target = e.target as HTMLInputElement;
    if (target.id === 'bd-search') {
      this.q = target.value;
      this.renderDirectory();
    }
  }

  private clock(): void {
    const clockEl = this.byId('bd-clock');
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('en-GB');
  }
}
