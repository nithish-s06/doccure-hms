import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';
import { All_Routes } from '../../../../../core/helpers/routes';
import { RouterLink } from '@angular/router';

declare const flatpickr: any;

interface DocModel {
  first?: string;
  last?: string;
  gender: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: string;
  blood?: string;
  langs?: string;
  spec?: string;
  dept: string;
  desig: string;
  exp?: string;
  reg?: string;
  license?: string;
  emp: string;
  degree?: string;
  higher?: string;
  univ?: string;
  gradyear?: string;
  certs?: string;
  awards?: string;
  days: Record<string, number>;
  start?: string;
  end?: string;
  slot: string;
  maxpat?: string;
  break?: string;
  fee?: string;
  fufee?: string;
  ctype: string;
  services: Record<string, boolean>;
  bio?: string;
  photo?: string;
  docs: { name: string; size: string; tag: string }[];
}

@Component({
  imports: [RouterLink],
  selector: 'app-add-doctor',
  styleUrl: './add-doctor.css',
  templateUrl: './add-doctor.html',
})
export class AddDoctor implements AfterViewInit {
  AllRoutes = All_Routes;
  private readonly STEPS: [string, string, string, string][] = [
    ['Personal', 'icon-user', 'Personal Information', 'Basic identity and contact details'],
    ['Professional', 'icon-stethoscope', 'Professional Details', 'Specialty, department and registration'],
    ['Education', 'icon-graduation-cap', 'Qualifications & Education', 'Degrees, institutes and certifications'],
    ['Schedule', 'icon-calendar-clock', 'Schedule & Availability', 'Working days, hours and slots'],
    ['Consultation', 'icon-video', 'Consultation Settings', 'Fees, type, services and bio'],
    ['Documents', 'icon-folder', 'Documents', 'License, certificates and ID proof'],
    ['Review', 'icon-clipboard-check', 'Review & Submit', 'Confirm and register the doctor'],
  ];
  private readonly DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly SERVICES = ['Consultation', 'Follow-up', 'Emergency', 'Procedures', 'Surgery', 'Diagnostics', 'Teleconsult', 'Home Visit'];
  private readonly REQDOCS = ['Medical License', 'Degree Certificate', 'ID Proof', 'Profile Photo'];

  private model: DocModel = {
    gender: 'Male',
    dept: 'Cardiology',
    desig: 'Consultant',
    emp: 'Full-time',
    ctype: 'In-person',
    slot: '20 min',
    days: { Mon: 1, Tue: 1, Wed: 1, Thu: 1, Fri: 1, Sat: 0, Sun: 0 },
    services: {},
    docs: [],
  };
  private step = 0;

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    const page = this.byId('adr-page');
    if (!page) return;

    page.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLElement;
      const el = target.closest('.adr-live') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (!el) return;
      (this.model as any)[el.getAttribute('data-k') || ''] = el.value;
      el.classList.remove('err');
      this.updateProgress();
    });
    page.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLElement;
      const el = target.closest('.adr-live') as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (el) {
        (this.model as any)[el.getAttribute('data-k') || ''] = el.value;
        this.updateProgress();
      }
    });

    this.byId('adr-stepper')?.addEventListener('click', (e: Event) => {
      const s = (e.target as HTMLElement).closest('[data-step]') as HTMLElement | null;
      if (s) {
        const n = +(s.getAttribute('data-step') || 0);
        if (n <= this.step || this.validateStep()) this.goStep(n);
      }
    });
    this.byId('adr-days')?.addEventListener('click', (e: Event) => {
      const d = (e.target as HTMLElement).closest('[data-day]') as HTMLElement | null;
      if (!d) return;
      const k = d.getAttribute('data-day') || '';
      this.model.days[k] = this.model.days[k] ? 0 : 1;
      this.buildDays();
      this.updateProgress();
    });
    this.byId('adr-services')?.addEventListener('click', (e: Event) => {
      const s = (e.target as HTMLElement).closest('[data-service]') as HTMLElement | null;
      if (!s) return;
      const k = s.getAttribute('data-service') || '';
      this.model.services[k] = !this.model.services[k];
      this.buildServices();
    });
    this.byId('f-emp')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-emp]') as HTMLElement | null;
      if (!b) return;
      this.qsa('#f-emp button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      this.model.emp = b.getAttribute('data-emp') || '';
    });
    this.byId('f-ctype')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-ctype]') as HTMLElement | null;
      if (!b) return;
      this.qsa('#f-ctype button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
      this.model.ctype = b.getAttribute('data-ctype') || '';
    });

    // photo
    this.byId('adr-photo')?.addEventListener('change', (e: Event) => {
      const input = e.target as HTMLInputElement;
      const f = input.files && input.files[0];
      if (!f) return;
      const rd = new FileReader();
      rd.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result as string;
        this.model.photo = result;
        const inner = this.byId('adr-avaup-inner');
        if (inner) inner.outerHTML = `<img id="adr-avaup-inner" src="${result}" alt="">`;
      };
      rd.readAsDataURL(f);
    });

    // documents
    const drop = this.byId('adr-drop');
    const fileInput = this.byId('adr-files') as HTMLInputElement | null;
    drop?.addEventListener('click', () => fileInput?.click());
    fileInput?.addEventListener('change', (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;
      Array.from(files).forEach((f) => this.addDoc(f.name));
      this.toast(`${files.length} document(s) added`);
    });
    ['dragover', 'dragenter'].forEach((ev) =>
      drop?.addEventListener(ev, (e: Event) => {
        e.preventDefault();
        drop.classList.add('drag');
      })
    );
    ['dragleave', 'drop'].forEach((ev) =>
      drop?.addEventListener(ev, (e: Event) => {
        e.preventDefault();
        drop.classList.remove('drag');
      })
    );
    drop?.addEventListener('drop', (e: Event) => {
      const dt = (e as DragEvent).dataTransfer;
      const fs = dt && dt.files;
      if (fs && fs.length) {
        Array.from(fs).forEach((f) => this.addDoc(f.name));
        this.toast(`${fs.length} document(s) added`);
      }
    });
    this.byId('adr-doclist')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-rmdoc]') as HTMLElement | null;
      if (!b) return;
      this.model.docs.splice(+(b.getAttribute('data-rmdoc') || 0), 1);
      this.buildDocList();
      this.buildReqDocs();
      this.updateProgress();
    });

    this.byId('adr-review')?.addEventListener('click', (e: Event) => {
      const b = (e.target as HTMLElement).closest('[data-goto]') as HTMLElement | null;
      if (b) this.goStep(+(b.getAttribute('data-goto') || 0));
    });

    this.byId('adr-next')?.addEventListener('click', () => {
      if (this.validateStep()) this.goStep(this.step + 1);
    });
    this.byId('adr-back')?.addEventListener('click', () => this.goStep(this.step - 1));
    const saveDraft = () => this.toast(`Draft saved · ${this.pct()}% complete`, 'info');
    this.byId('adr-save-draft')?.addEventListener('click', saveDraft);
    this.byId('adr-save-draft-2')?.addEventListener('click', saveDraft);
    this.byId('adr-submit')?.addEventListener('click', () => {
      if (!this.validateStep()) return;
      const consent = this.byId('adr-consent') as HTMLInputElement | null;
      if (!consent?.checked) {
        this.toast('Please confirm the verification consent', 'error');
        return;
      }
      const btn = this.byId('adr-submit') as HTMLButtonElement;
      btn.innerHTML = '<i class="icon-loader"></i>Registering…';
      btn.disabled = true;
      setTimeout(() => {
        this.toast(`${this.fullName()} registered successfully`);
        btn.innerHTML = '<i class="icon-check"></i>Registered';
        setTimeout(() => {
          window.location.href = 'doctors.html';
        }, 900);
      }, 900);
    });

    this.document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        /* no-op, kept for parity with source */
      }
    });

    setTimeout(() => {
      const sk = this.byId('adr-skeleton');
      const ct = this.byId('adr-content');
      if (sk) sk.style.display = 'none';
      if (ct) {
        ct.classList.remove('hidden');
        ct.style.animation = 'adr-slide .4s ease';
      }
      this.buildStepper();
      this.buildDays();
      this.buildServices();
      this.buildReqDocs();
      this.goStep(0);
      this.updateProgress();
      if (typeof flatpickr !== 'undefined') {
        this.qsa('[data-provider="flatpickr"]').forEach((el: any) => {
          if (el._flatpickr) return;
          const config: any = { disableMobile: true };
          if (el.hasAttribute('data-date-format')) config.dateFormat = el.getAttribute('data-date-format');
          flatpickr(el, config);
        });
      }
    }, 1400);
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

  private toast(message: string, tone: 'success' | 'error' | 'info' = 'success'): void {
    this.toastService.show(message, tone);
  }

  private fullName(): string {
    const f = (this.model.first || '').trim();
    const l = (this.model.last || '').trim();
    const n = `${f} ${l}`.trim();
    return n ? `Dr. ${n}` : 'Dr. New Doctor';
  }

  private money(n: unknown): string {
    return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  }

  /* ---------------- builders ---------------- */

  private buildStepper(): void {
    let h = '';
    this.STEPS.forEach((s, i) => {
      h += `<div class="adr-step${i === this.step ? ' active' : i < this.step ? ' done' : ''}" data-step="${i}"><span class="adr-step-node">${
        i < this.step ? '<i class="icon-check"></i>' : i + 1
      }</span><span class="adr-step-lbl">${s[0]}</span></div>`;
      if (i < this.STEPS.length - 1) h += `<span class="adr-step-line${i < this.step ? ' done' : ''}"></span>`;
    });
    const el = this.byId('adr-stepper');
    if (el) el.innerHTML = h;
  }

  private buildDays(): void {
    const el = this.byId('adr-days');
    if (!el) return;
    el.innerHTML = this.DAYS.map(
      (d) =>
        `<button type="button" class="adr-day${this.model.days[d] ? ' on' : ''}" data-day="${d}"><div class="d">${d}</div><i class="mark icon-${
          this.model.days[d] ? 'check' : 'x'
        }"></i></button>`
    ).join('');
  }

  private buildServices(): void {
    const el = this.byId('adr-services');
    if (!el) return;
    el.innerHTML = this.SERVICES.map(
      (s) =>
        `<button type="button" class="adr-chipsel${this.model.services[s] ? ' on' : ''}" data-service="${s}">${
          this.model.services[s] ? '<i class="icon-check text-[10px]"></i>' : ''
        }${s}</button>`
    ).join('');
  }

  private buildReqDocs(): void {
    const el = this.byId('adr-reqdocs');
    if (!el) return;
    el.innerHTML = this.REQDOCS.map((d) => {
      const has = this.model.docs.some((f) => f.tag === d);
      return `<div class="adr-doc ${has ? 'adr-c-emerald' : 'adr-c-amber'}" style="justify-content:center;flex-direction:column;gap:.2rem;text-align:center;padding:.6rem"><span class="adr-doc-ico"><i class="icon-${
        has ? 'check' : 'file'
      }"></i></span><span class="text-[10px] font-bold ${has ? 'text-emerald-600' : 'text-gray-500'}">${d}</span></div>`;
    }).join('');
  }

  private buildDocList(): void {
    const el = this.byId('adr-doclist');
    if (!el) return;
    el.innerHTML = this.model.docs.length
      ? this.model.docs
          .map(
            (f, i) =>
              `<div class="adr-doc adr-c-primary"><span class="adr-doc-ico"><i class="icon-file-text"></i></span><div class="min-w-0 flex-1"><p class="font-bold text-gray-900 dark:text-white truncate">${this.esc(
                f.name
              )}</p><p class="text-[10px] text-gray-400">${f.size} · ${this.esc(f.tag)}</p></div><button type="button" class="adr-icobtn" style="width:1.8rem;height:1.8rem" data-rmdoc="${i}"><i class="icon-x text-xs"></i></button></div>`
          )
          .join('')
      : '';
  }

  private addDoc(name: string): void {
    const lower = name.toLowerCase();
    let tag = 'Other';
    if (lower.indexOf('licen') > -1) tag = 'Medical License';
    else if (lower.indexOf('degree') > -1 || lower.indexOf('cert') > -1 || lower.indexOf('mbbs') > -1) tag = 'Degree Certificate';
    else if (lower.indexOf('id') > -1 || lower.indexOf('aadha') > -1 || lower.indexOf('passport') > -1) tag = 'ID Proof';
    else if (lower.indexOf('photo') > -1 || lower.indexOf('jpg') > -1 || lower.indexOf('png') > -1) tag = 'Profile Photo';
    this.model.docs.push({ name, size: `${80 + name.length * 4} KB`, tag });
    this.buildDocList();
    this.buildReqDocs();
    this.updateProgress();
  }

  private readonly CHECKS: [string, () => boolean | string | undefined][] = [
    ['Personal info', () => !!(this.model.first && this.model.last && this.model.phone && this.model.email)],
    ['Professional details', () => !!(this.model.spec && this.model.dept && this.model.exp)],
    ['Qualifications', () => !!this.model.degree],
    ['Schedule set', () => Object.keys(this.model.days).some((d) => this.model.days[d])],
    ['Consultation fee', () => !!this.model.fee],
    ['Documents uploaded', () => this.model.docs.length >= 2],
  ];

  private pct(): number {
    const done = this.CHECKS.filter((c) => c[1]()).length;
    return Math.round((done / this.CHECKS.length) * 100);
  }

  private updateProgress(): void {
    const p = this.pct();
    const pctBadge = this.byId('adr-pct-badge');
    if (pctBadge) pctBadge.textContent = String(p);
    const miniPct = this.byId('adr-mini-pct');
    if (miniPct) miniPct.textContent = `${p}%`;
    const bigPct = this.byId('adr-big-pct');
    if (bigPct) bigPct.textContent = `${p}%`;
    const miniMeter = this.byId('adr-mini-meter');
    if (miniMeter) miniMeter.style.width = `${p}%`;
    const bigMeter = this.byId('adr-big-meter');
    if (bigMeter) bigMeter.style.width = `${p}%`;
    const checklist = this.byId('adr-checklist');
    if (checklist) {
      checklist.innerHTML = this.CHECKS.map((c) => {
        const ok = !!c[1]();
        return `<div class="flex items-center gap-2 text-xs"><span class="grid place-items-center w-4 h-4 rounded-full ${
          ok ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
        }"><i class="icon-${ok ? 'check' : 'minus'} text-[9px]"></i></span><span class="${ok ? 'text-gray-700 dark:text-gray-200 font-semibold' : 'text-gray-400'}">${c[0]}</span></div>`;
      }).join('');
    }
  }

  /* ---------------- step navigation ---------------- */

  private goStep(n: number): void {
    if (n < 0 || n > this.STEPS.length - 1) return;
    this.step = n;
    this.qsa('.adr-panel').forEach((p) => p.classList.toggle('active', +(p.getAttribute('data-panel') || -1) === this.step));
    this.buildStepper();
    const s = this.STEPS[this.step];
    const title = this.byId('adr-form-title');
    if (title) title.textContent = s[2];
    const sub = this.byId('adr-form-sub');
    if (sub) sub.textContent = s[3];
    const ico = this.qs('#adr-form-head .ico');
    if (ico) ico.innerHTML = `<i class="${s[1]}"></i>`;
    const count = this.byId('adr-form-count');
    if (count) count.textContent = `${this.step + 1} / ${this.STEPS.length}`;
    const badge = this.byId('adr-step-badge');
    if (badge) badge.textContent = String(this.step + 1);
    const back = this.byId('adr-back') as HTMLButtonElement | null;
    if (back) back.disabled = this.step === 0;
    this.byId('adr-next')?.classList.toggle('hidden', this.step === this.STEPS.length - 1);
    this.byId('adr-submit')?.classList.toggle('hidden', this.step !== this.STEPS.length - 1);
    if (this.step === this.STEPS.length - 1) this.buildReview();
    this.byId('adr-page')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private validateStep(): boolean {
    const reqBy: Record<number, string[]> = { 0: ['first', 'last', 'phone', 'email'], 1: ['spec', 'exp'], 2: ['degree'], 4: ['fee'] };
    const req = reqBy[this.step];
    if (!req) return true;
    let ok = true;
    let first: HTMLElement | null = null;
    req.forEach((k) => {
      const el = this.qs(`[data-k="${k}"]`) as HTMLInputElement | null;
      const v = ((this.model as any)[k] || '').toString().trim();
      if (!v) {
        ok = false;
        if (el) {
          el.classList.add('err');
          if (!first) first = el;
        }
      }
    });
    if (!ok) {
      this.toast('Please fill the required fields', 'error');
      if (first) (first as HTMLElement).focus();
    }
    return ok;
  }

  /* ---------------- review ---------------- */

  private buildReview(): void {
    const row = (k: string, v?: string | number) =>
      `<div class="flex items-center justify-between px-4 py-2 border-b border-border-color text-xs" style="border-bottom-style:dashed"><span class="text-gray-500 dark:text-gray-400">${k}</span><span class="font-bold text-gray-900 dark:text-white text-right">${this.esc(
        v || '—'
      )}</span></div>`;
    const sec = (ico: string, title: string, s: number, rows: string) =>
      `<div class="adr-review-sec"><div class="adr-review-head"><span class="grid place-items-center w-6 h-6 rounded-lg text-white" style="background:linear-gradient(135deg,var(--color-primary),#6366f1)"><i class="${ico} text-[11px]"></i></span>${title}<button type="button" class="ml-auto text-[11px] font-bold text-primary hover:underline" data-goto="${s}">Edit</button></div>${rows}</div>`;
    const days = Object.keys(this.model.days).filter((d) => this.model.days[d]).join(', ') || '—';
    const services = Object.keys(this.model.services).filter((s) => this.model.services[s]).join(', ') || '—';
    const el = this.byId('adr-review');
    if (!el) return;
    el.innerHTML =
      sec('icon-user', 'Personal', 0, row('Name', this.fullName()) + row('Gender', this.model.gender) + row('Phone', this.model.phone) + row('Email', this.model.email) + row('Blood Group', this.model.blood) + row('Languages', this.model.langs)) +
      sec('icon-stethoscope', 'Professional', 1, row('Specialty', this.model.spec) + row('Department', this.model.dept) + row('Designation', this.model.desig) + row('Experience', `${this.model.exp || 0} yrs`) + row('Reg. No', this.model.reg) + row('Employment', this.model.emp)) +
      sec('icon-graduation-cap', 'Education', 2, row('Degree', this.model.degree) + row('Higher', this.model.higher) + row('University', this.model.univ) + row('Certifications', this.model.certs)) +
      sec('icon-calendar-clock', 'Schedule', 3, row('Working Days', days) + row('Hours', `${this.model.start || '—'} – ${this.model.end || '—'}`) + row('Slot', this.model.slot) + row('Max/Day', this.model.maxpat)) +
      sec('icon-video', 'Consultation', 4, row('Fee', this.money(this.model.fee)) + row('Follow-up Fee', this.money(this.model.fufee)) + row('Type', this.model.ctype) + row('Services', services)) +
      sec('icon-folder', 'Documents', 5, row('Uploaded', `${this.model.docs.length} file(s)`) + this.model.docs.map((f) => row(f.tag, f.name)).join(''));
  }
}
