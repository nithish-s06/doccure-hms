import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LightgalleryModule } from 'lightgallery/angular';
@Component({
  selector: 'app-ui-lightbox',
  imports: [LightgalleryModule,FormsModule],
  templateUrl: './ui-lightbox.html',
  styleUrl: './ui-lightbox.css',
})
export class UiLightbox {
  public albumsOne: any = [];
  public albumsTwo: any = [];

  constructor() {
    
  }

codeSnippet = `
&lt;div class="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4"&gt;
  @for (image of albumsOne; track image; let i = $index) {
    @if (i >= 3) {
      &lt;div class="image-popup"&gt;
        &lt;img [src]="image.thumb" (click)="open(i, albumsOne)" /&gt;
      &lt;/div&gt;
    }
  }
&lt;/div&gt;
`;
codeSnippet2 = `
&lt;div class="preview-content grid grid-cols-1 sm:grid-cols-3 gap-4"&gt;
  @for (image of albumsTwo; track image; let i = $index) {
    @if (i >= 3) {
      &lt;div class="image-popup"&gt;
        &lt;img [src]="image.thumb" (click)="open(i, albumsTwo)" /&gt;
      &lt;/div&gt;
    }
  }
&lt;/div&gt;
`;

}
