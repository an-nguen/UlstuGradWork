import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BookDocumentService } from '@core/interfaces/book-document-service';
import { TrackerService } from '@core/interfaces/tracker-service';
import { WindowService } from '@core/interfaces/window-service';
import { proto } from 'common';
import { IPDFViewerApplication, NgxExtendedPdfViewerComponent, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { catchError, from, mergeMap, of, throwError } from 'rxjs';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrl: './book-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewerComponent implements OnInit, OnDestroy {

  @ViewChild(NgxExtendedPdfViewerComponent)
  public pdfViewer!: NgxExtendedPdfViewerComponent;

  public documentSource = signal<ArrayBuffer | Uint8Array>(new ArrayBuffer(0));

  public sidebarVisible = false;

  private _currentBook?: proto.book_document.BookReply;

  private _page?: number;

  private _zoom?: string | number = 100;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _service: BookDocumentService,
    private readonly _windowService: WindowService,
    private readonly _trackerService: TrackerService,
    private readonly _snackBar: MatSnackBar,
    private readonly _window: Window,
    private readonly _title: Title,
    private readonly _cdr: ChangeDetectorRef,
    private destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this.subscribeToParamMap();
    pdfDefaultOptions.externalLinkTarget = 2;
    pdfDefaultOptions.enableScripting = false;
  }

  public ngOnDestroy(): void {
    this.logCloseAction();
  }

  @HostListener("window:beforeunload")
  public logCloseAction(): void {
    if (!this._currentBook) return;
    this._trackerService.logUserAction({
      bookId: this._currentBook.id,
      pageNumber: this.page,
      action: proto.tracker.UserAction.CLOSE,
      payload: JSON.stringify({ zoom: this._zoom }),
    });
  }


  @HostListener("window:focus")
  public logFocusAction(): void {
    if (!this._currentBook) return;
    this._trackerService.logUserAction({
      bookId: this._currentBook.id,
      action: proto.tracker.UserAction.FOCUS,
      pageNumber: this.page,
    });
  }

  @HostListener("window:blur")
  public logBlurAction(): void {
    if (!this._currentBook) return;
    this._trackerService.logUserAction({
      bookId: this._currentBook.id,
      action: proto.tracker.UserAction.BLUR,
      pageNumber: this.page,
    });
  }

  public set page(value: number | undefined) {
    this._page = value;
    if (this._currentBook) {
      this._trackerService.logUserAction({
        pageNumber: value,
        bookId: this._currentBook.id,
        action: proto.tracker.UserAction.PAGE_CHANGE,
      });
    }
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

  public subscribeToParamMap(): void {
    this._route.paramMap
      .pipe(
        mergeMap((params) => {
          const id = params.get('id');
          if (!id) return throwError(() => new Error('The book ID is not provided.'));
          return from(this._service.getBookDocumentById(id));
        }),
        mergeMap((book) => {
          this._currentBook = book;
          if (book.title) this._title.setTitle(book.title);
          this._trackerService.logUserAction({
            bookId: book.id,
            action: proto.tracker.UserAction.OPEN,
          });
          return from(this._service.openBook(book.id));
        }),
        catchError((error: Error) => {
          console.error(error);
          this._snackBar.open(
            `Failed to open book or fetch book details: ${error}`,
            'OK'
          );
          return of(new Uint8Array());
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((fileData: Uint8Array) => {
        this.documentSource.set(fileData);
        this._setLastViewedPage(this._currentBook!.id);
      });
  }

  public copyText(): void {
    const selection = this._window.getSelection();
    if (!selection || !selection.toString()) return;
    this._windowService.copyTextToClipboard(selection.toString());
    this._snackBar.open('Text copied!', undefined, { duration: 2000 });
  }

  private _setLastViewedPage(bookId: string): void {
    this._trackerService.getLastViewedPage({ bookId }).then((response) => {
      this.page = response.pageNumber;
    });
  }

  private _dispatchEventBus(eventName: string, options: unknown | undefined = undefined): void {
    const pdfViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
    pdfViewerApplication.eventBus.dispatch(eventName, options);
  }

  private _addListenerToEventBus(eventName: string, listener: (event: any) => void) {
    const pdfViewerApplication: IPDFViewerApplication = (window as any).PDFViewerApplication;
    pdfViewerApplication.eventBus.on(eventName, listener);
  }

}
