import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-common-select',
  imports: [SelectModule,CommonModule,FormsModule],
  templateUrl: './common-select.html',
  styleUrl: './common-select.css',
})
export class CommonSelect {
 @Input() options: any[] = [];
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select';
  @Input() filter: boolean = true;

  @Input() model: any;
  @Output() modelChange = new EventEmitter<any>();

  onChange(value: any) {
    this.model = value;
    this.modelChange.emit(value);
  }
}
