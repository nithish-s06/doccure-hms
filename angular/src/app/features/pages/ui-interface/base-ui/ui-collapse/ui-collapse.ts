import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-collapse',
  imports: [],
  templateUrl: './ui-collapse.html',
  styleUrl: './ui-collapse.css',
})
export class UiCollapse {
  collapse:boolean[]=[false];
  toggleCollapse(i:number){
    this.collapse[i]=!this.collapse[i]
  }
}
