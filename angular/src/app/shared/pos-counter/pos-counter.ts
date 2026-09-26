import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pos-counter',
  imports: [CommonModule],
  templateUrl: './pos-counter.html',
  styleUrl: './pos-counter.css',
})
export class PosCounter {
  @Input() quantity: number = 0;
  @Input() max: number = 100;
  @Output() quantityChange = new EventEmitter<number>();

  increment(event: Event): void {
    event.stopPropagation();
    const next = Math.min(this.max, Number(this.quantity) + 1);
    this.quantity = next;
    this.quantityChange.emit(next);
  }

  decrement(event: Event): void {
    event.stopPropagation();
    const next = Math.max(0, Number(this.quantity) - 1);
    this.quantity = next;
    this.quantityChange.emit(next);
  }
}
