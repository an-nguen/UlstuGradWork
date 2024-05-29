import { Clipboard } from '@angular/cdk/clipboard';
import {
  AfterViewInit,
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
import { BookDto, WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { AuthState } from '@core/stores/auth.state';
import { NgxExtendedPdfViewerComponent, NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { catchError, combineLatest, finalize, mergeMap, of, tap, throwError } from 'rxjs';
import { TooltipMenuComponent } from '@core/components/tooltip-menu/tooltip-menu.component';
import { CONSTANTS } from '@core/constants';
import { TextSumDialogComponent } from '@core/dialogs/text-sum-dialog/text-sum-dialog.component';
import { DictionaryService } from '@core/services/dictionary.service';
import { getSeconds } from 'date-fns';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrl: './book-viewer.component.scss',
  standalone: true,
  imports: [
    NgxExtendedPdfViewerModule,
    TooltipMenuComponent,
    TranslationDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  protected readonly DICTIONARY_PROVIDER_NAME = 'MerriamWebster';
  protected readonly DEFAULT_TARGET_LANG_CODE = 'ru';

  @ViewChild(NgxExtendedPdfViewerComponent)
  public pdfViewer!: NgxExtendedPdfViewerComponent;

  public documentSource = signal<ArrayBuffer | Uint8Array | URL>(
    new ArrayBuffer(0),
  );
  public wordEntries = signal<WordDto[]>([]);

  public bearerToken?: string;
  public sidebarVisible = false;
  public isDefinitionLoading = false;

  private _dictionaryWordRegex = new RegExp(CONSTANTS.REGEX_PATTERN.DICTIONARY_WORD, 'u');
  private _currentBook?: BookDto;
  private _page?: number;
  private _zoom?: string | number = 100;
  private _totalTimeInSec = 0;
  private _openPageDateTime!: Date;

  constructor(
    private readonly _service: BookService,
    private readonly _dictionaryService: DictionaryService,
    private readonly _authState: AuthState,
    private readonly _route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _title: Title,
    private readonly _clipboard: Clipboard,
    private readonly _destroyRef: DestroyRef,
  ) {
  }

  public ngOnInit(): void {
    pdfDefaultOptions.externalLinkTarget = 2;
    pdfDefaultOptions.enableScripting = false;
    this._subscribeToParamMap();
    if (this._authState.accessToken) {
      this.bearerToken = `Bearer ${this._authState.accessToken}`;
    }
  }

  public ngAfterViewInit(): void {
    this._openPageDateTime = new Date();
  }

  public ngOnDestroy(): void {
    this._updateLastViewedPage();
    this._updateTotalTime();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(): void {
    this._updateLastViewedPage();
    this._updateTotalTime();
  }

  @HostListener('document:visibilitychange')
  public onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this._openPageDateTime = new Date();
    } else {
      this._updateTotalTime();
    }
    console.log(new Date(), 'visibilitychange', document.visibilityState, this._totalTimeInSec, this._getCurrentTimeIntervalInSec());
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

  public copyText(selectedText: string): void {
    this._clipboard.copy(selectedText);
    this._snackBar.open('Текст скопирован', 'OK', { duration: 3000 });
  }

  public openTranslationDialog(selectedText: string): void {
    if (!selectedText) return;

    this._dialog.open(TranslationDialogComponent, {
      minWidth: CONSTANTS.SIZE.TRANSLATION_DIALOG_MIN_WIDTH,
      minHeight: CONSTANTS.SIZE.TRANSLATION_DIALOG_MIN_HEIGHT,
      data: {
        sourceText: selectedText,
        targetLanguageCode: this.DEFAULT_TARGET_LANG_CODE,
      },
    });
  }

  public openTextSummarizationDialog(selectedText: string): void {
    if (!selectedText) return;
    if (selectedText.length > CONSTANTS.SIZE.TEXT_SUM_MAX_SIZE) {
      this._snackBar.open(
        `Максимальная длина текста для обобщения (больше ${CONSTANTS.SIZE.TEXT_SUM_MAX_SIZE})`,
        'OK',
      );
      return;
    }

    this._dialog.open(TextSumDialogComponent, {
      minWidth: CONSTANTS.SIZE.TRANSLATION_DIALOG_MIN_WIDTH,
      minHeight: CONSTANTS.SIZE.TRANSLATION_DIALOG_MIN_HEIGHT,
      data: {
        inputText: selectedText,
      },
    });
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
          if (book.stats?.totalReadingTime) this._totalTimeInSec = book.stats.totalReadingTime;
        }),
        catchError((error: Error) => {
          console.error(error);
          this._snackBar.open(
            `Failed to open book or fetch book details: ${error}`,
            'OK',
          );
          return of(new Uint8Array());
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  public showWordDefinition(word: string): void {
    const normalizedWord = word.trim().toLowerCase();
    if (!this._dictionaryWordRegex.test(normalizedWord)) return;
    this.isDefinitionLoading = true;
    this._dictionaryService.find(normalizedWord)
      .pipe(
        mergeMap((foundWords) =>
          (foundWords.length === 0)
            ? this._dictionaryService.findInExtDict(normalizedWord, this.DICTIONARY_PROVIDER_NAME)
            : of(foundWords)),
        finalize(() => this.isDefinitionLoading = false),
      )
      .subscribe((foundWords) => {
        if (foundWords.length === 0) return;
        this.wordEntries.set(foundWords);
      });
  }

  public clearWordEntries(): void {
    this.wordEntries.set([]);
  }

  public addWordsToDictionary(words: WordDto[]): void {
    const requests = words.map((word) => this._dictionaryService.addWord(word));
    combineLatest(requests)
      .subscribe((results) => {
        this._snackBar.open(`Успешно добавлены ${results.length} слов(а).`, 'OK');
      });
  }

  private _updateTotalTime(): void {
    if (this._currentBook) {
      this._totalTimeInSec += this._getCurrentTimeIntervalInSec();
      this._service
        .updateTotalTime(this._currentBook.documentDetails.id, this._totalTimeInSec)
        .subscribe();
    }
  }

  private _getCurrentTimeIntervalInSec(): number {
    const currentTime = new Date();
    return Math.round((currentTime.getTime() - this._openPageDateTime.getTime()) / 1000);
  }

  private _updateLastViewedPage(): void {
    if (this._currentBook && this._page) {
      this._service
        .updateLastViewedPage(this._currentBook.documentDetails.id, this._page)
        .subscribe();
    }
  }

}
