import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { All_Routes } from '../../../../../core/helpers/routes';

@Component({
  imports: [RouterLink],
  selector: 'app-kanban-board',
  styleUrl: './kanban-board.css',
  templateUrl: './kanban-board.html',
})
export class KanbanBoard implements AfterViewInit, OnDestroy {
  AllRoutes = All_Routes;
  private dragged: HTMLElement | null = null;
  private cleanupFns: Array<() => void> = [];

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const board = this.elementRef.nativeElement.querySelector<HTMLElement>('#kanbanBoard');
    if (!board) return;

    const lists = Array.from(board.querySelectorAll<HTMLElement>('.kanban-list'));

    const refreshColumn = (list: HTMLElement): void => {
      const col = list.closest<HTMLElement>('.kanban-col');
      if (!col) return;
      const countEl = col.querySelector<HTMLElement>('.kanban-count');
      if (countEl) countEl.textContent = String(list.children.length);
    };

    const onDragStart = (e: DragEvent): void => {
      const card = (e.target as HTMLElement).closest<HTMLElement>("[draggable='true']");
      if (!card) return;
      this.dragged = card;
      const list = card.closest<HTMLElement>('.kanban-list');
      if (list) card.dataset['originList'] = list.dataset['stage'];
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => card.classList.add('is-dragging'), 0);
    };

    const onDragEnd = (): void => {
      if (this.dragged) this.dragged.classList.remove('is-dragging');
      this.dragged = null;
      lists.forEach((l) => l.classList.remove('is-drop-target'));
    };

    board.addEventListener('dragstart', onDragStart);
    board.addEventListener('dragend', onDragEnd);
    this.cleanupFns.push(() => board.removeEventListener('dragstart', onDragStart));
    this.cleanupFns.push(() => board.removeEventListener('dragend', onDragEnd));

    lists.forEach((list) => {
      const onDragOver = (e: DragEvent): void => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
        list.classList.add('is-drop-target');

        if (!this.dragged) return;
        const afterEl = Array.from(list.querySelectorAll<HTMLElement>("[draggable='true']:not(.is-dragging)")).find((el) => {
          const rect = el.getBoundingClientRect();
          return e.clientY < rect.top + rect.height / 2;
        });
        if (afterEl) {
          list.insertBefore(this.dragged, afterEl);
        } else {
          list.appendChild(this.dragged);
        }
      };

      const onDragLeave = (e: DragEvent): void => {
        if (e.target === list) list.classList.remove('is-drop-target');
      };

      const onDrop = (e: DragEvent): void => {
        e.preventDefault();
        list.classList.remove('is-drop-target');
        if (!this.dragged) return;
        const originStage = this.dragged.dataset['originList'];
        refreshColumn(list);
        if (originStage && originStage !== list.dataset['stage']) {
          const originEl = lists.find((l) => l.dataset['stage'] === originStage);
          if (originEl) refreshColumn(originEl);
        }
      };

      list.addEventListener('dragover', onDragOver);
      list.addEventListener('dragleave', onDragLeave);
      list.addEventListener('drop', onDrop);
      this.cleanupFns.push(() => list.removeEventListener('dragover', onDragOver));
      this.cleanupFns.push(() => list.removeEventListener('dragleave', onDragLeave));
      this.cleanupFns.push(() => list.removeEventListener('drop', onDrop));
    });
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
