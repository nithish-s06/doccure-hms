import { Component } from '@angular/core';

@Component({
  selector: 'app-clipboard',
  imports: [],
  templateUrl: './clipboard.html',
  styleUrl: './clipboard.css',
})
export class Clipboard {
  copyInputMessage(inputElement: { select: () => void; setSelectionRange: (arg0: number, arg1: number) => void; }){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  cutInputMessage(inputElement: { select: () => void; setSelectionRange: (arg0: number, arg1: number) => void; }){
    inputElement.select();
    document.execCommand('cut');
    inputElement.setSelectionRange(0, 0);
  }
  copySpanContent(spanId: string) {
    const spanElement = document.getElementById(spanId);

    if (spanElement) {
        const range = document.createRange();
        range.selectNode(spanElement);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);

        document.execCommand('copy');
        
        // Clear the selection range
        window.getSelection()?.removeAllRanges();
    }
}

}
