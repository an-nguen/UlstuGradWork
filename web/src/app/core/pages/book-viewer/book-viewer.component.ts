import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslationDialogComponent } from '@core/dialogs/translation-dialog/translation-dialog.component';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { AuthState } from '@core/stores/auth.state';
import {
  IPDFViewerApplication,
  NgxExtendedPdfViewerComponent,
  pdfDefaultOptions,
} from 'ngx-extended-pdf-viewer';
import { catchError, mergeMap, of, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrl: './book-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewerComponent implements OnInit, OnDestroy {
  protected readonly DEFAULT_TARGET_LANG_CODE = 'ru';

  @ViewChild(NgxExtendedPdfViewerComponent)
  public pdfViewer!: NgxExtendedPdfViewerComponent;

  public documentSource = signal<ArrayBuffer | Uint8Array | URL>(
    new ArrayBuffer(0)
  );
  
  public bearerToken?: string;
  public sidebarVisible = false;

  private _currentBook?: BookDto;
  private _page?: number;
  private _zoom?: string | number = 100;

  constructor(
    private readonly _service: BookService,
    private readonly _authState: AuthState,
    private readonly _route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _title: Title,
    private readonly _clipboard: Clipboard,
    private readonly _destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    pdfDefaultOptions.externalLinkTarget = 2;
    pdfDefaultOptions.enableScripting = false;

    this._subscribeToParamMap();
    if (this._authState.accessToken) {
      this.bearerToken = `Bearer ${this._authState.accessToken}`;
    }
  }

  public ngOnDestroy(): void {
    this._updateLastViewedPage();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(): void {
    this._updateLastViewedPage();
  }

  public set page(value: number | undefined) {
    this._page = value;
  }

  public set zoom(value: string | number | undefined) {
    this._zoom = value;
  }

  public get page(): number | undefined {
    return this._page;
  }

  public get zoom(): string | number | undefined {
    return this._zoom;
  }

  public toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  public zoomIn(): void {
    this._dispatchEventBus('zoomin');
  }

  public zoomOut(): void {
    this._dispatchEventBus('zoomout');
  }

  public goToNextPage(): void {
    this._dispatchEventBus('nextpage');
  }

  public goToPrevPage(): void {
    this._dispatchEventBus('previouspage');
  }

  public goToFirstPage(): void {
    this._dispatchEventBus('firstpage');
  }

  public goToLastPage(): void {
    this._dispatchEventBus('lastpage');
  }

  public copyText(selectedText: string): void {
    this._clipboard.copy(selectedText);
    this._snackBar.open('Текст скопирован', 'OK', { duration: 3000 });
  }

  public openTranslationDialog(selectedText: string): void {
    if (!selectedText) return;

    this._dialog.open(TranslationDialogComponent, {
      data: {
        sourceText: selectedText,
        targetLanguageCode: this.DEFAULT_TARGET_LANG_CODE,
      },
    });
  }

  private _dispatchEventBus(
    eventName: string,
    options: unknown | undefined = undefined
  ): void {
    const pdfViewerApplication: IPDFViewerApplication = (window as any)
      .PDFViewerApplication;
    pdfViewerApplication.eventBus.dispatch(eventName, options);
  }

  private _subscribeToParamMap(): void {
    this._route.paramMap
      .pipe(
        mergeMap((params) => {
          const id = params.get('id');
          if (!id)
            return throwError(() => new Error('The book ID is not provided.'));
          this.documentSource.set(this._service.getBookDownloadUrl(id));
          return this._service.getBookById(id);
        }),
        tap((book) => {
          this._currentBook = book;
          if (book.documentDetails.title)
            this._title.setTitle(book.documentDetails.title);
          if (book.stats?.lastViewedPage) this.page = book.stats.lastViewedPage;
        }),
        catchError((error: Error) => {
          console.error(error);
          this._snackBar.open(
            `Failed to open book or fetch book details: ${error}`,
            'OK'
          );
          return of(new Uint8Array());
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe();
  }

  private _updateLastViewedPage(): void {
    if (this._currentBook && this._page) {
      this._service
        .updateLastViewedPage(this._currentBook.documentDetails.id, this._page)
        .subscribe();
    }
  }
}
