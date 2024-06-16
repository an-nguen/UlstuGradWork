import { ChangeDetectionStrategy, Component, computed, ElementRef, Inject, NgZone, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist';
import { getVersionSuffix, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';

export interface BookEditDialogData {
  mode?: 'create' | 'update';
  bookDetails: Omit<
    BookMetadataDto,
    'filename' | 'fileSizeInBytes' | 'fileType'
  >;
  bookFile?: File;
  thumbnailUrl?: string;
}

@Component({
  selector: 'app-book-edit-dialog',
  templateUrl: './book-edit-dialog.component.html',
  styleUrl: './book-edit-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    DigitOnlyModule,
    MatTooltipModule,
    MatDialogActions,
    MatButtonModule,
    MatListModule,
    LoadingSpinnerOverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookEditDialogComponent implements OnInit, OnDestroy {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление новой книги';
  protected readonly EDIT_DIALOG_TITLE = 'Обновление информации о книге';
  protected readonly PREVIEW_MAX_WIDTH = 320;
  protected readonly PREVIEW_MIN_WIDTH = 240;

  public previewCanvasElementRef = viewChild.required<ElementRef<HTMLCanvasElement>>("previewCanvas");

  public bookForm = this._fb.group({
    title: this._fb.control<string | null>(null),
    description: this._fb.control<string | null>(null),
    isbn: this._fb.control<string | null>(null, [
      Validators.pattern('^([0-9]{10}|[0-9]{13})|null$'),
    ]),
    publisherName: this._fb.control<string | null>(null),
    authors: this._fb.control<string[]>([]),
  });
  public isEditMode = signal<boolean>(false);
  public thumbnailUrl = signal<string | null>(null);
  public dialogTitle = computed(() => {
    return this.isEditMode()
      ? this.EDIT_DIALOG_TITLE
      : this.CREATION_DIALOG_TITLE;
  });
  public isPreviewLoading = signal<boolean>(false);
  public authorNameInputControl = this._fb.control<string | null>(null);

  private _pdf?: PDFDocumentProxy;
  private _pdfLoadingTask?: PDFDocumentLoadingTask;
  private _script?: HTMLScriptElement;

  constructor(
    private readonly _ngZone: NgZone,
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: BookEditDialogData,
  ) {
    this._initForm();
  }

  public ngOnInit(): void {
    this.isEditMode.set(this.dialogData?.mode === 'update');
    if (!this.isEditMode()) {
      this._loadPdfJs();
    }
  }

  public ngOnDestroy(): void {
    this._pdf?.destroy();
    this._pdfLoadingTask?.destroy();
    if (this._script) {
      document.querySelector('head')?.removeChild(this._script);
    }
  }

  public addAuthor(): void {
    if (this.authorNameInputControl.invalid || !this.authorNameInputControl.value) return;
    this.bookForm.patchValue({
      authors: [
        ...this.bookForm.value.authors ?? [],
        this.authorNameInputControl.value,
      ],
    });
    this.authorNameInputControl.reset();
  }

  public deleteAuthor(index: number): void {
    this.bookForm.patchValue({
      authors: this.bookForm.value.authors?.filter((_, i) => i !== index)
    });
  }

  public saveBook(): void {
    const values = this.bookForm.value;

    if (this.bookForm.invalid) return;
    const formData: BookEditDialogData = {
      bookDetails: {
        title: values.title ?? undefined,
        description: values.description ?? undefined,
        isbn: values.isbn ?? undefined,
        publisherName: values.publisherName ?? undefined,
        authors: values.authors ?? undefined,
      },
    };
    this._dialogRef.close(formData);
  }

  public close(): void {
    this._dialogRef.close();
  }

  private _initForm(): void {
    const details = this.dialogData?.bookDetails;
    if (!details) return;
    this.bookForm.setValue({
      title: details.title ?? null,
      description: details.description ?? null,
      isbn: details.isbn ?? null,
      publisherName: details.publisherName ?? null,
      authors: details.authors ?? [],
    });
    if (this.dialogData.thumbnailUrl) {
      this.thumbnailUrl.set(this.dialogData.thumbnailUrl);
    }
  }

  private _clamp(value: number, max: number, min: number): number {
    return value > max ? max : (value < min ? min : value);
  }

  // Code from https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/main/projects/ngx-extended-pdf-viewer/src/lib/ngx-extended-pdf-viewer.component.ts
  private _getPdfJsPath(artifact: 'pdf' | 'viewer') {
    let suffix = 'min.js';
    const assets = pdfDefaultOptions.assetsFolder;
    const versionSuffix = getVersionSuffix(assets);
    if (versionSuffix.startsWith('4')) {
      suffix = suffix.replace('.js', '.mjs');
    }
    const artifactPath = `/${artifact}-`;

    return assets + artifactPath + versionSuffix + '.' + suffix;
  }

  // Code from https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/main/projects/ngx-extended-pdf-viewer/src/lib/ngx-extended-pdf-viewer.component.ts
  private _createScriptElement(sourcePath: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.async = true;
    script.type = sourcePath.endsWith('.mjs') ? 'module' : 'text/javascript';
    script.className = 'ngx-extended-pdf-viewer-script';
    script.src = sourcePath;
    return script;
  }

  // Code from https://github.com/stephanrauh/ngx-extended-pdf-viewer/blob/main/projects/ngx-extended-pdf-viewer/src/lib/ngx-extended-pdf-viewer.component.ts
  private _loadPdfJs() {
    (globalThis as any)['ngxZone'] = this._ngZone;

    this._ngZone.runOutsideAngular(() => {
      let src = pdfDefaultOptions.workerSrc();
      if (!src.endsWith('.min.mjs')) {
        src = src.replace('.mjs', '.min.mjs');
      }
      const pdfJsPath = this._getPdfJsPath('pdf');
      if (pdfJsPath.endsWith('.mjs')) {
        if (src.endsWith('.js')) {
          src = src.substring(0, src.length - 3) + '.mjs';
        }
      }
      src = src.replace('/assets', '');
      this._script = this._createScriptElement(pdfJsPath);
      const head = document.querySelector('head');
      if ((globalThis as any).pdfjsLib) {
        (globalThis as any).pdfjsLib.GlobalWorkerOptions.workerSrc = src;
        this._loadPreview();
      } else {
        this._script.onload = () => {
          if (!(globalThis as any).webViewerLoad) {
            (globalThis as any).pdfjsLib.GlobalWorkerOptions.workerSrc = src;
            this._loadPreview();
          }
        };
      }
      head?.appendChild(this._script);
    });
  }

  private _loadPreview(): void {
    if (this.isEditMode() || !this.dialogData.bookFile) return;
    const pdfjsLib = (globalThis as any)['pdfjsLib'] as any;
    if (pdfjsLib) {
      const fileReader = new FileReader();
      this.isPreviewLoading.set(true);
      fileReader.addEventListener('load', async () => {
        if (!this.previewCanvasElementRef()) return;
        this._pdfLoadingTask = pdfjsLib.getDocument({ data: fileReader.result });
        this._pdf = await this._pdfLoadingTask!.promise;
        const previewPage = await this._pdf!.getPage(1);
        const scale = 1;
        const viewport = previewPage.getViewport({ scale });
        const canvas = this.previewCanvasElementRef().nativeElement;
        const context = canvas.getContext("2d");
        if (!context) return;
        const heightToWidthRatio = viewport.height / viewport.width;
        const canvasWidth = this._clamp(viewport.width, this.PREVIEW_MAX_WIDTH, this.PREVIEW_MIN_WIDTH);
        const canvasHeight = canvasWidth * heightToWidthRatio;
        const transformScale = canvasWidth / viewport.width;
        canvas.width = Math.floor(canvasWidth);
        canvas.height = Math.floor(canvasHeight);
        canvas.style.width = Math.floor(canvasWidth) + "px";
        canvas.style.height = Math.floor(canvasHeight) + "px";

        // 2D transform scale matrix (column-major)
        const transform = [transformScale, 0, 0, transformScale, 0, 0]

        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };
        previewPage.render(renderContext);
        this.isPreviewLoading.set(false);
      });
      fileReader.readAsArrayBuffer(this.dialogData.bookFile);
    }
  }

}
