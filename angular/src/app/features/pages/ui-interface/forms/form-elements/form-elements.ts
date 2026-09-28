import { Component } from '@angular/core';
import { formselect } from '../../../../../core/json/selectData';
import { CommonSelect } from '../../../../../shared/common-select/common-select';

@Component({
  selector: 'app-form-elements',
  imports: [CommonSelect],
  templateUrl: './form-elements.html',
  styleUrl: './form-elements.css',
})
export class FormElements {
    formselect = formselect;
  selectedFormselect: string | null = null;
}
