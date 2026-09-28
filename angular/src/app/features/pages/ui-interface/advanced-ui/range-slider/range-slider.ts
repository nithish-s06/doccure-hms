import { Component } from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-range-slider',
  imports: [MatSliderModule,SliderModule,FormsModule],
  templateUrl: './range-slider.html',
  styleUrl: './range-slider.css',
})
export class RangeSlider {
  value: number = 50;
   rangeValues: number[] = [20, 80];
  formatLabel(value: number): string {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return `${value}`;
  }
}
