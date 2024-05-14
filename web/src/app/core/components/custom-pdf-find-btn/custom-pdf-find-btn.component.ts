// Some code taken from
// https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/main/projects/ngx-extended-pdf-viewer/src/lib/toolbar/pdf-find-button/pdf-find-button.component.ts
// which is licensed under Apache 2.0, created by `stephanrauh`

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-custom-pdf-find-btn',
  templateUrl: './custom-pdf-find-btn.component.html',
  styleUrl: './custom-pdf-find-btn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomPdfFindBtnComponent {

  public toggleFindBar(): void {
    const pdfViewerApp: any = (window as any).PDFViewerApplication;
    console.log(pdfViewerApp.findBar);
    if (pdfViewerApp.findBar.opened) {
      pdfViewerApp.findBar.close();
    } else {
      pdfViewerApp.findBar.open();
    }
  }

}
