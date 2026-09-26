import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../core/services/common/common.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-common-counter',
  imports: [CommonModule,FormsModule],
  templateUrl: './common-counter.html',
  styleUrl: './common-counter.css',
})
export class CommonCounter {

  constructor(
    private common: CommonService,
  ) {

  }
  @Input() value: number = 0; // Default value if not provided
  @Output() quantityChange = new EventEmitter<number>();
  quantity: number = 1; // Default quantity


  ngOnInit(): void {
    this.quantity = this.value; // Set quantity from value input
  }
  incrementQuantity(): void {
    if (this.quantity>=100){
      this.quantity=100;
    }
    else{
    this.quantity = Number(this.quantity) + 1;
    }
  }

  // Decrement the quantity, but not below 0
  decrementQuantity(): void {
    if (this.quantity > 0) {
      this.quantity -= 1;
    }
  }
  validateQuantity(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;

    // Check if the input is a valid number
    if (!/^\d*$/.test(inputValue)) {
      this.quantity = 1; // Reset to 0 if invalid
    } else {
      this.quantity = Number(inputValue); // Convert valid input to a number
    }
  }
}
