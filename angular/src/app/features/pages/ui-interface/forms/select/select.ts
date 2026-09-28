import { Component } from '@angular/core';
import { CommonSelect } from '../../../../../shared/common-select/common-select';
import { formselectTwo } from '../../../../../core/json/selectData';
import {MatSelectModule} from '@angular/material/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagInputModule } from 'ngx-chips';
interface City {
    name: string;
    code: string;
}
@Component({
  selector: 'app-select',
  imports: [CommonSelect,MatSelectModule,MultiSelectModule,CommonModule,FormsModule,TagInputModule],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class Select {
    tags = ['red', 'Black'];
  selectOptions = formselectTwo;
  selectedData: string | null = null;
  cities!: City[];
    selectedCities!: City[];

    ngOnInit() {
        this.cities = [
            { name: 'Choice 1', code: '1' },
            { name: 'Choice 2', code: '2' },
            { name: 'Choice 3', code: '3' },
        ];
    }
}
