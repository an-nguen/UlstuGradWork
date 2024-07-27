import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef, EnvironmentInjector, HostListener,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { getBookFileType } from '@core/book-file-type';
import { SortMenuComponent, SortOption } from '@core/components/sort-menu/sort-menu.component';
import { Defaults, Dimensions, StorageKeyStrings, Strings } from '@core/constants';
import {
  BookEditDialogComponent,
  BookEditDialogData,
} from '@core/dialogs/book-edit-dialog/book-edit-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import {
  BookDetailsUpdateDto,
  BookDto,
  BookMetadataDto,
  BookTextDto,
  FullTextSearchTreeEntryDto,
  SearchRequestDto,
  SortOrder,
} from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { combineLatest, debounceTime, finalize, map, mergeMap, of, tap } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { BookGridViewComponent } from '@core/components/book-grid-view/book-grid-view.component';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';
import { MatLabel } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { BookInfoDialogComponent } from '@core/dialogs/book-info-dialog/book-info-dialog.component';
import { SearchModeMenuComponent } from '@core/components/search-mode-menu/search-mode-menu.component';
import { SearchMode } from '@core/types/search-mode';
import { FullTextSearchListComponent } from '@core/components/full-text-search-list/full-text-search-list.component';

enum ViewMode {
  List,
  Grid,
}

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  standalone: true,
  imports: [
    InfiniteScrollDirective,
    LoadingSpinnerOverlayComponent,
    MatFormField,
    MatIcon,
    MatButtonModule,
    MatInput,
    MatLabel,
    MatSort,
    ReactiveFormsModule,
    SortMenuComponent,
    BookGridViewComponent,
    BookListViewComponent,
    BookEditDialogComponent,
    DeleteConfirmationDialogComponent,
    MatPrefix,
    MatSuffix,
    AsyncPipe,
    SearchModeMenuComponent,
    FullTextSearchListComponent,
  ],
  animations: [
    trigger('searchFocus', [
      state('true', style({ width: '100%' })),
      state('false', style({ width: '240px' })),
      transition('false => true', animate('400ms')),
      transition('true => false', animate('200ms')),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit, OnDestroy {

  public ViewMode = ViewMode;
  public SearchMode = SearchMode;

  public readonly SORT_OPTIONS: SortOption[] = [
    { value: 'title', name: 'По названию' },
    { value: 'isbn', name: 'По ISBN' },
    { value: 'recent_access', name: 'По посл. открытию' },
  ];

  public fileInputElement = viewChild<ElementRef<HTMLInputElement>>('bookFileInput');

  public books = signal<BookDto[]>([]);
  public isBooksEmpty = computed(() => {
    return this.books().length === 0;
  });

  public currentPageNumber = signal<number>(1);
  public pageSize = signal<number>(Defaults.PAGE_SIZE);
  public selectedViewMode = signal<ViewMode>(ViewMode.List);

  public isLoading = signal<boolean>(false);

  public fullTextSearchResults = signal<FullTextSearchTreeEntryDto[]>([]);
  public searchMode = signal<SearchMode>(SearchMode.Metadata);
  public searchFormControl = new FormControl<string | null>(null, [Validators.minLength(3)]);
  public isSearchInFocus = signal<boolean>(false);
  public isInSearchMode: Signal<boolean> = computed(() => {
    const isInFocus = this.isSearchInFocus();
    const isSearchModeMenuOpen = this._isSearchModeMenuOpen();
    return isInFocus || !!this.searchFormControl.value || isSearchModeMenuOpen;
  });

  public isHandset = toSignal(this._breakpointObserver.observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches)));

  private _selectedSortOption = Defaults.SORT_OPTION;
  private _selectedSortOrder = Defaults.SORT_ORDER;
  private _pageCount = 0;
  private _isSearchModeMenuOpen = signal<boolean>(false);

  constructor(
    private readonly _bookService: BookService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _environmentInjector: EnvironmentInjector
  ) {
  }

  public ngOnInit(): void {
    this._loadViewSettings();
    this._subscribeToSearchChanges();
  }

  public ngOnDestroy(): void {
    this._saveViewSettings();
  }

  @HostListener('window:beforeunload', ['$event'])
  public onBeforeUnload(): void {
    this._saveViewSettings();
  }

  public get selectedSortOption(): SortOption {
    return this._selectedSortOption;
  }

  public get selectedSortOrder(): SortOrder {
    return this._selectedSortOrder;
  }

  public get loading(): boolean {
    return this.isLoading();
  }

  public set selectedSortOption(value: SortOption) {
    this._selectedSortOption = value;
    this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
  }

  public set selectedSortOrder(value: SortOrder) {
    this._selectedSortOrder = value;
    this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
  }

  public set loading(value: boolean) {
    this.isLoading.set(value);
    if (!value) {
      this.searchFormControl.disable();
    } else {
      this.searchFormControl.enable();
    }
  }

  public onSearchInputFocus(): void {
    this.isSearchInFocus.set(true);
  }

  public onSearchInputBlur(): void {
    this.isSearchInFocus.set(false);
  }

  public setSearchModeMenuOpen(value: boolean): void {
    this._isSearchModeMenuOpen.set(value);
  }

  public handleNumOfVisibleItemsChange(numOfVisibleItems: number) {
    this.pageSize.set(Math.round(numOfVisibleItems * 2));
    this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
  }

  public onFileInputChange() {
    const files = this.fileInputElement()!.nativeElement.files!;
    const file = files[0];
    if (!file || !(file instanceof File)) {
      return;
    }

    this.openBookAddDialog(file);
  }

  public setViewMode(mode: ViewMode): void {
    this.selectedViewMode.set(mode);
  }

  public openBookInfoDialog(book: BookDto): void {
    this._dialog.open(BookInfoDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: 'fullscreen',
      data: {
        book,
      },
    });
  }

  public openBookAddDialog(file: File): void {
    this._dialog
      .open(
        BookEditDialogComponent,
        {
          minWidth: Dimensions.DIALOG_MIN_WIDTH,
          data: {
            bookFile: file,
          }
        })
      .afterClosed()
      .pipe(
        mergeMap((data: BookEditDialogData | undefined) => {
          this.loading = true;
          if (!data) return of(null);
          const bookMetadata: BookMetadataDto = {
            ...data.bookDetails,
            filename: file.name,
            fileSizeInBytes: file.size,
            fileType: getBookFileType(file.type),
          };
          return this._bookService.addBook(bookMetadata, file);
        }),
        finalize(() => {
          this._resetFileInput();
          this.loading = false;
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((book) => {
        if (!book) return;
        this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
        this._snackBar.open(
          `Добавлена новая книга "${book.documentDetails.title}"`,
          'OK',
          { duration: 3000 },
        );
      });
  }

  public editBook(book: BookDto): void {
    const details = book.documentDetails;
    const data: BookEditDialogData = {
      mode: 'update',
      bookDetails: {
        title: details.title,
        description: details.description,
        isbn: details.isbn,
        publisherName: details.publisherName,
        authors: details.authors,
        tags: details.tags,
      },
      thumbnailUrl: details.thumbnailUrl,
    };
    this._dialog
      .open(BookEditDialogComponent, {
        data,
        minWidth: Dimensions.DIALOG_MIN_WIDTH,
      })
      .afterClosed()
      .pipe(
        mergeMap((dialogReturnData: BookEditDialogData) => {
          this.isLoading.set(true);
          if (!dialogReturnData) return of(null);
          const modifiedDetails = dialogReturnData.bookDetails;
          const request: BookDetailsUpdateDto = {
            title: modifiedDetails.title,
            isbn: modifiedDetails.isbn,
            description: modifiedDetails.description,
            publisherName: modifiedDetails.publisherName,
            authors: modifiedDetails.authors,
            tags: modifiedDetails.tags,
          };
          return this._bookService.updateBookDetails(
            book.documentDetails.id,
            request,
          );
        }),
        finalize(() => {
          this._resetFileInput();
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((book) => {
        if (!book) return;
        this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
        this._snackBar.open(
          `Обновлены данные о книге "${book.documentDetails.title}"`,
          'OK',
          { duration: 3000 },
        );
      });
  }

  public deleteBook(book: BookDto): void {
    const dialogRef = this._dialog.open(
      DeleteConfirmationDialogComponent,
      {
        data: {
          message: Strings.BOOK_DELETE_CONFIRMATION,
        },
      },
    );
    dialogRef
      .afterClosed()
      .pipe(
        mergeMap((isConfirmed: boolean) => {
          if (!isConfirmed) return of(null);
          return this._bookService.deleteBook(book.documentDetails.id);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
        this._snackBar.open(
          `Книга "${book.documentDetails.title} успешно удалена."`,
          'OK',
          { duration: 3000 },
        );
      });
  }

  public async openBook(book: BookDto): Promise<void> {
    await this._router.navigate(['viewer', book.documentDetails.id]);
  }

  public openBookByBookText(bookText: BookTextDto): void {
    this._router.navigate(
      ['viewer', bookText.bookDocumentId],
      {
        queryParams: { pageNumber: bookText.pageNumber }
      }
    );
  }

  public loadNextPage(): void {
    if (this.currentPageNumber() > this._pageCount - 1) return;
    const nextPage = this.currentPageNumber() + 1;
    this.currentPageNumber.set(nextPage);
    this._loadPageOfBookList(nextPage, this.pageSize(), false);
  }

  private _loadPageOfBookList(
    pageNumber: number,
    pageSize: number = this.pageSize(),
    shouldReset: boolean = true,
  ): void {
    this.isLoading.set(true);
    const searchValue = this.searchFormControl.value;
    const page$ = !searchValue ?
      this._bookService.getPage(
        pageNumber,
        pageSize,
        this.selectedSortOption.value,
        this.selectedSortOrder,
      )
      : this._bookService.searchByBookDetails(this._createSearchRequest(pageNumber, pageSize, searchValue));
    page$
      .pipe(
        tap((page) => (this._pageCount = page.pageCount)),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((page) => {
        if (!shouldReset) {
          this.books.update((prevItems) => [...prevItems, ...page.items]);
        } else {
          this.books.set(page.items);
        }
      });
  }

  private _subscribeToSearchChanges(): void {
    combineLatest([this.searchFormControl.valueChanges, toObservable(this.searchMode, { injector: this._environmentInjector })])
      .pipe(
        tap(() => this.searchFormControl.markAsTouched()),
        debounceTime(500),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        if (this.searchFormControl.invalid) return;
        if (this.searchMode() === SearchMode.Metadata) {
          this.currentPageNumber.set(1);
          this._loadPageOfBookList(1, this.pageSize());
        }
        if (this.searchMode() === SearchMode.FullText) {
          this._runFullTextSearch();
        }
      });
  }

  private _runFullTextSearch(): void {
    this.isLoading.set(true);
    this._bookService.searchByBookTexts({ pattern: this.searchFormControl.value! })
      .pipe(
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((results) => {
        this.fullTextSearchResults.set(results);
      });
  }

  private _loadViewSettings(): void {
    const sortOptionName = sessionStorage.getItem(StorageKeyStrings.SORT_OPTION);
    const sortOption = this.SORT_OPTIONS.find(
      (option) => option.name === sortOptionName,
    );
    if (sortOption) this._selectedSortOption = sortOption;

    const sortOrderStringNumber = sessionStorage.getItem(StorageKeyStrings.SORT_ORDER);
    if (sortOrderStringNumber)
      this._selectedSortOrder = parseInt(sortOrderStringNumber);

    const viewModeStringNumber = sessionStorage.getItem(StorageKeyStrings.VIEW_MODE);
    if (viewModeStringNumber)
      this.selectedViewMode.set(parseInt(viewModeStringNumber));
  }

  private _saveViewSettings(): void {
    sessionStorage.setItem(StorageKeyStrings.SORT_OPTION, this.selectedSortOption.name);
    sessionStorage.setItem(StorageKeyStrings.SORT_ORDER, `${this._selectedSortOrder}`);
    sessionStorage.setItem(StorageKeyStrings.VIEW_MODE, `${this.selectedViewMode()}`);
  }

  private _resetFileInput(): void {
    this.fileInputElement()!.nativeElement.value = '';
  }

  private _createSearchRequest(pageNumber: number, pageSize: number, value: string): SearchRequestDto {
    return {
      pageNumber,
      pageSize,
      sortProperty: this._selectedSortOption.value,
      sortOrder: this._selectedSortOrder,
      title: value,
      description: value,
      publisherName: value,
      authors: [value],
    };
  }

}
