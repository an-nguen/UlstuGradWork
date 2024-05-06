import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { AuthState } from '@core/stores/auth.state';
import { IPDFViewerApplication, NgxExtendedPdfViewerComponent, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { catchError, mergeMap, of, tap, throwError } from 'rxjs';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrl: './book-viewer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewerComponent implements OnInit, OnDestroy {

  @ViewChild(NgxExtendedPdfViewerComponent)
  public pdfViewer!: NgxExtendedPdfViewerComponent;

  public bearerToken?: string;

  public documentSource = signal<ArrayBuffer | Uint8Array | URL>(new ArrayBuffer(0));

  public sidebarVisible = false;

  private _currentBook?: BookDto;

  private _page?: number;

  private _zoom?: string | number = 100;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _service: BookService,
    private readonly _snackBar: MatSnackBar,
    private readonly _authState: AuthState,
    private readonly _window: Window,
    private readonly _title: Title,
    private readonly _clipboard: Clipboard,
    private destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this.subscribeToParamMap();
    if (this._authState.accessToken) {
      this.bearerToken = `Bearer ${this._authState.accessToken}`;
    }
    pdfDefaultOptions.externalLinkTarget = 2;
    pdfDefaultOptions.enableScripting = false;
  }

  public ngOnDestroy(): void {
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

  public subscribeToParamMap(): void {
    this._route.paramMap
      .pipe(
        mergeMap((params) => {
          const id = params.get('id');
          if (!id) return throwError(() => new Error('The book ID is not provided.'));
          this.documentSource.set(this._service.getBookDownloadUrl(id));
          return this._service.getBookById(id);
        }),
        tap((book) => {
          this._currentBook = book;
          if (book.documentDetails.title) this._title.setTitle(book.documentDetails.title);
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
      .subscribe();
  }

  public copyText(): void {
    const selection = this._window.getSelection();
    if (!selection || !selection.toString()) return;
    this._clipboard.copy(selection.toString());
    this._snackBar.open('Текст скопирован!', undefined, { duration: 2000 });
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
