import { Clipboard } from '@angular/cdk/clipboard';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
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
import { catchError, finalize, mergeMap, of, tap, throwError } from 'rxjs';
import { TooltipMenuComponent } from '@core/components/tooltip-menu/tooltip-menu.component';
import { CONSTANTS } from '@core/constants';
import { TextSumDialogComponent } from '@core/dialogs/text-sum-dialog/text-sum-dialog.component';
import { DictionaryService } from '@core/services/dictionary.service';
import { FormsModule } from '@angular/forms';
import { TooltipMenuEventService } from '@core/services/tooltip-menu-event.service';
import { TooltipMenuStateService } from '@core/stores/tooltip-menu.state';

@Component({
  selector: 'app-book-viewer',
  templateUrl: './book-viewer.component.html',
  styleUrl: './book-viewer.component.scss',
  standalone: true,
  imports: [
    NgxExtendedPdfViewerModule,
    TooltipMenuComponent,
    TranslationDialogComponent,
    FormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookViewerComponent implements OnInit, AfterViewInit, OnDestroy {

  protected readonly DEFAULT_TARGET_LANG_CODE = 'ru';
  private readonly SELECTED_DEFINITION_PROVIDER_SESSION_STORAGE_KEY = 'selected_definition_provider';

  @ViewChild(NgxExtendedPdfViewerComponent)
  public pdfViewer!: NgxExtendedPdfViewerComponent;

  public documentSource = signal<ArrayBuffer | Uint8Array | URL>(
    new ArrayBuffer(0),
  );

  public bearerToken?: string;

  public selectedWord?: string;
  public foundWordsInDict: string[] = [];

  private _dictionaryWordRegex = new RegExp(CONSTANTS.REGEX_PATTERN.DICTIONARY_WORD, 'u');
  private _currentBook?: BookDto;
  private _page?: number;
  private _totalTimeInSec = 0;
  private _openPageDateTime!: Date;

  private readonly _tooltipMenuState = inject(TooltipMenuStateService);

  constructor(
    private readonly _service: BookService,
    private readonly _tooltipMenuEventService: TooltipMenuEventService,
    private readonly _dictionaryService: DictionaryService,
    private readonly _cdr: ChangeDetectorRef,
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
    this._loadDefinitionProviders();
    this._subscribeToTooltipMenuEvents();
  }

  public ngAfterViewInit(): void {
    this._openPageDateTime = new Date();
    this._loadSettings();
  }

  public ngOnDestroy(): void {
    this._updateLastViewedPage();
    this._updateTotalTime();
    this._saveSettings();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(): void {
    this._updateLastViewedPage();
    this._updateTotalTime();
    this._saveSettings();
  }

  @HostListener('document:visibilitychange')
  public onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this._openPageDateTime = new Date();
    } else {
      this._updateTotalTime();
    }
    this._updateLastViewedPage();
  }

  public set page(value: number | undefined) {
    this._page = value;
  }

  public get page(): number | undefined {
    return this._page;
  }

  public copyText(selectedText: string): void {
    this._clipboard.copy(selectedText);
    this._snackBar.open('Текст скопирован', 'OK', { duration: 3000 });
  }

  public openTranslationDialog(selectedText: string): void {
    if (!selectedText) return;
    if (selectedText.length > CONSTANTS.TRANSLATION_TEXT_MAX_LENGTH) {
      this._snackBar.open('Размер текста не должна превышать больше 1000 символов.');
      return;
    }

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

  public openDefinitionMenu(word: string): void {
    this._tooltipMenuState.isDefinitionPanelOpen = true;
    this._cdr.markForCheck();
    this.showDefinition(word);
  }

  public showDefinition(word: string): void {
    const normalizedWord = word.trim()
      .toLowerCase();
    this.selectedWord = normalizedWord;
    if (!this._dictionaryWordRegex.test(normalizedWord)) return;
    this._tooltipMenuState.isDefinitionLoading = true;
    this._dictionaryService.find(normalizedWord)
      .pipe(
        mergeMap((savedWords) => {
          const definitionProvider = this._tooltipMenuState.currentDefinitionProvider;
          this._tooltipMenuState.savedWords = savedWords.map(w => w.word);
          return (!savedWords.length && !!definitionProvider)
            ? this._dictionaryService.findInExtDict(normalizedWord, definitionProvider)
            : of(savedWords);
        }),
        finalize(() => {
          this._tooltipMenuState.isDefinitionLoading = false;
          this._cdr.markForCheck();
        }),
      )
      .subscribe((foundWords) => {
        if (!foundWords.length) {
          this._snackBar.open('Нет результатов.', 'OK');
          return;
        }
        this._tooltipMenuState.definitionEntries = foundWords;
        this._cdr.markForCheck();
      });
  }

  public clearWordEntries(): void {
    this._tooltipMenuState.definitionEntries = [];
    this._tooltipMenuState.isDefinitionPanelOpen = false;
    this._cdr.markForCheck();
  }

  public saveDefinition(word: WordDto): void {
    this._dictionaryService.addWord(word)
      .subscribe(() => {
        this.foundWordsInDict.push(word.word);
        this._cdr.markForCheck();
        this._snackBar.open(`Успешно добавлено '${word.word}' слов(а).`, 'OK');
      });
  }

  public changeDefinitionProvider(providerName: string | null): void {
    this._tooltipMenuState.currentDefinitionProvider = providerName;
    if (!providerName || !this.selectedWord) return;
    this.showDefinition(this.selectedWord);
  }

  public deleteDefinition(word: WordDto) {
    this._dictionaryService.deleteWord(word.word)
      .subscribe(() => {
        const index = this.foundWordsInDict.indexOf(word.word)
        this.foundWordsInDict.splice(index, 1);
        this.foundWordsInDict = [...this.foundWordsInDict];
        this._cdr.markForCheck();
        this._snackBar.open(`Слово '${word.word}' успешно удалена из словаря.`, 'OK');
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

  private _saveSettings(): void {
    const selectedDefProvider = this._tooltipMenuState.currentDefinitionProviderSignal();
    if (selectedDefProvider) {
      sessionStorage.setItem(this.SELECTED_DEFINITION_PROVIDER_SESSION_STORAGE_KEY, selectedDefProvider);
    }
  }

  private _loadSettings(): void {
    const selectedDefProvider = sessionStorage.getItem(this.SELECTED_DEFINITION_PROVIDER_SESSION_STORAGE_KEY);
    if (selectedDefProvider) {
      this._tooltipMenuState.currentDefinitionProvider = selectedDefProvider;
    }
  }

  private _loadDefinitionProviders(): void {
    this._dictionaryService.listThirdPartyProviders()
      .subscribe((providers) => {
        this._tooltipMenuState.definitionProviders = providers;
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

  private _subscribeToTooltipMenuEvents(): void {
    const tmes = this._tooltipMenuEventService;
    tmes.selectionEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.clearWordEntries());
    tmes.textCopyEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((selectedText) => this.copyText(selectedText));
    tmes.defineEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((word) => this.openDefinitionMenu(word))
    tmes.translationEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((selectedText) => this.openTranslationDialog(selectedText));
    tmes.textSummarizationEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((selectedText) => this.openTextSummarizationDialog(selectedText));
    tmes.addDefinitionEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((wordDto) => this.saveDefinition(wordDto));
    tmes.deleteDefinitionEvent$.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((wordDto) => this.deleteDefinition(wordDto));
  }

}
