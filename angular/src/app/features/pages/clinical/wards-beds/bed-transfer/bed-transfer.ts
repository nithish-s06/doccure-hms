import { AfterViewInit, Component, DOCUMENT, Inject } from '@angular/core';
import { ToastService } from '../../../../../core/services/toast/toast.service';

/**
 * Ported from tailwind/src/assets/js/script.js — "BED-TRANSFER (bed-transfer.html)".
 * The hero, KPIs, Kanban tracker cards and Completed Today table ship as
 * static markup. This wires interaction against that existing markup: the
 * Completed Today search filter, the Kanban drag-and-drop / stage-advance
 * that physically relocates existing cards between lanes, and the hero
 * quick-action buttons. The source's move-modal/detail-modal (Preline
 * overlays keyed off card data-* attributes) have no corresponding markup
 * in this page's ported HTML, so opening a card only surfaces its summary
 * via a toast instead of a modal, and "New Transfer" confirms with a toast.
 */
@Component({
  imports: [],
  selector: 'app-bed-transfer',
  styleUrl: './bed-transfer.css',
  templateUrl: './bed-transfer.html',
})
export class BedTransfer implements AfterViewInit {
  private readonly STAGES = ['requested', 'porter', 'transit', 'settling'];

  constructor(@Inject(DOCUMENT) private document: Document, private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.wireSearch();
    this.wireTracker();
    this.wireHero();
  }

  private byId(id: string): HTMLElement | null {
    return this.document.getElementById(id);
  }

  private toast(message: string, tone: 'success' | 'info' | 'error' = 'info'): void {
    this.toastService.show(message, tone);
  }

  /* ---------------- Completed Today search ---------------- */

  private wireSearch(): void {
    const search = this.byId('search') as HTMLInputElement | null;
    const body = this.byId('recent-body');
    const count = this.byId('recent-count');
    const empty = this.byId('recent-empty');
    if (!search || !body) return;

    const apply = () => {
      const term = search.value.trim().toLowerCase();
      const rows = Array.from(body.querySelectorAll<HTMLElement>('.hms-row'));
      let shown = 0;
      rows.forEach((row) => {
        const match = !term || (row.textContent || '').toLowerCase().includes(term);
        row.hidden = !match;
        if (match) shown++;
      });
      if (count) count.textContent = `${shown} done`;
      if (empty) empty.hidden = shown !== 0;
    };

    search.addEventListener('input', apply);
    apply();
  }

  /* ---------------- Kanban tracker ---------------- */

  private laneBodyFor(stageKey: string): HTMLElement | null {
    return this.document.querySelector(`.wb-lane-body[data-stage="${stageKey}"]`);
  }

  private stageOf(card: HTMLElement): string | null {
    const body = card.closest('.wb-lane-body') as HTMLElement | null;
    return body ? body.dataset['stage'] || null : null;
  }

  private updateLaneCount(body: HTMLElement | null): void {
    if (!body) return;
    const lane = body.closest('.wb-lane');
    const count = body.querySelectorAll('.wb-move').length;
    if (lane) {
      const badge = lane.querySelector('.wb-lane-count');
      if (badge) badge.textContent = String(count);
    }
    const empty = body.querySelector('.wb-lane-empty') as HTMLElement | null;
    if (empty) empty.hidden = count > 0;
  }

  private moveCardTo(card: HTMLElement, stageKey: string): boolean {
    const from = card.closest('.wb-lane-body') as HTMLElement | null;
    const to = this.laneBodyFor(stageKey);
    if (!to || to === from) return false;
    to.appendChild(card);
    this.updateLaneCount(from);
    this.updateLaneCount(to);
    return true;
  }

  private completeCard(card: HTMLElement): void {
    const from = card.closest('.wb-lane-body') as HTMLElement | null;
    const patient = card.dataset['patient'];
    const to = card.dataset['to'];
    card.remove();
    this.updateLaneCount(from);
    this.toast(`${patient} settled in ${to} — transfer complete.`, 'success');
  }

  private advanceCard(card: HTMLElement): void {
    const stage = this.stageOf(card);
    const idx = stage ? this.STAGES.indexOf(stage) : -1;
    if (idx === -1) return;
    if (idx >= this.STAGES.length - 1) {
      this.completeCard(card);
      return;
    }
    const next = this.STAGES[idx + 1];
    if (this.moveCardTo(card, next)) {
      this.toast(`${card.dataset['patient']} → ${this.laneLabel(next)}.`);
    }
  }

  private laneLabel(stageKey: string): string {
    const lane = this.laneBodyFor(stageKey)?.closest('.wb-lane');
    return lane?.querySelector('.wb-lane-title')?.textContent?.trim() || stageKey;
  }

  private cardByOpenId(id: string): HTMLElement | null {
    return this.document.querySelector(`#tracker .wb-move[data-open="${id}"]`);
  }

  private openDetail(card: HTMLElement): void {
    const ds = card.dataset;
    this.toast(
      `${ds['patient']} (${ds['open']}) — ${ds['from']} → ${ds['to']}, ${ds['type']}, escort: ${ds['escort']}.`
    );
  }

  private wireTracker(): void {
    const tracker = this.byId('tracker');
    if (!tracker) return;

    tracker.addEventListener('click', (e: Event) => {
      const card = (e.target as HTMLElement).closest('.wb-move') as HTMLElement | null;
      if (card) this.openDetail(card);
    });
    tracker.addEventListener('keydown', (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key !== 'Enter' && ke.key !== ' ') return;
      const card = (e.target as HTMLElement).closest('.wb-move') as HTMLElement | null;
      if (!card) return;
      ke.preventDefault();
      this.openDetail(card);
    });

    let dragCard: HTMLElement | null = null;
    tracker.addEventListener('dragstart', (e: Event) => {
      const de = e as DragEvent;
      const card = (e.target as HTMLElement).closest('.wb-move') as HTMLElement | null;
      if (!card) return;
      dragCard = card;
      card.classList.add('is-dragging');
      if (de.dataTransfer) {
        de.dataTransfer.effectAllowed = 'move';
        de.dataTransfer.setData('text/plain', card.dataset['open'] || '');
      }
    });
    tracker.addEventListener('dragend', (e: Event) => {
      const card = (e.target as HTMLElement).closest('.wb-move') as HTMLElement | null;
      if (card) card.classList.remove('is-dragging');
      tracker.querySelectorAll('.wb-lane-body.is-drop-target').forEach((el) => el.classList.remove('is-drop-target'));
      dragCard = null;
    });
    tracker.addEventListener('dragover', (e: Event) => {
      const de = e as DragEvent;
      const lane = (e.target as HTMLElement).closest('.wb-lane-body') as HTMLElement | null;
      if (!lane) return;
      de.preventDefault();
      if (de.dataTransfer) de.dataTransfer.dropEffect = 'move';
      lane.classList.add('is-drop-target');
    });
    tracker.addEventListener('dragleave', (e: Event) => {
      const de = e as DragEvent;
      const lane = (e.target as HTMLElement).closest('.wb-lane-body') as HTMLElement | null;
      if (!lane || (de.relatedTarget && lane.contains(de.relatedTarget as Node))) return;
      lane.classList.remove('is-drop-target');
    });
    tracker.addEventListener('drop', (e: Event) => {
      const de = e as DragEvent;
      const lane = (e.target as HTMLElement).closest('.wb-lane-body') as HTMLElement | null;
      if (!lane) return;
      de.preventDefault();
      lane.classList.remove('is-drop-target');
      const id = de.dataTransfer?.getData('text/plain') || '';
      const card = dragCard || (id ? this.cardByOpenId(id) : null);
      dragCard = null;
      if (card) this.moveCardTo(card, lane.dataset['stage'] || '');
    });
  }

  /* ---------------- Hero actions ---------------- */

  private wireHero(): void {
    this.byId('btn-new')?.addEventListener('click', () => {
      this.toast('New transfer request form opened.');
    });
    this.byId('btn-advance')?.addEventListener('click', () => {
      const cards = Array.from(this.document.querySelectorAll<HTMLElement>('#tracker .wb-move'));
      if (!cards.length) {
        this.toast('No active transfers to advance.');
        return;
      }
      cards.forEach((c) => this.advanceCard(c));
      this.toast('All transfers advanced one stage.', 'success');
    });
  }
}
