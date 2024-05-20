import {
  ChangeDetectionStrategy,
  Component, computed,
  DestroyRef,
  ElementRef,
  OnDestroy,
  OnInit, Signal,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { getBookFileType } from '@core/book-file-type';
import { SortMenuComponent, SortOption } from '@core/components/sort-menu/sort-menu.component';
import { CONSTANTS } from '@core/constants';
import {
  BookEditDialogComponent,
  BookEditDialogData,
} from '@core/dialogs/book-edit-dialog/book-edit-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import {
  BookDetailsUpdateDto,
  BookDto,
  BookMetadataDto, SearchRequestDto,
  SortOrder,
} from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { debounceTime, finalize, mergeMap, of, tap } from 'rxjs';
import { MatSort } from '@angular/material/sort';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { BookGridViewComponent } from '@core/components/book-grid-view/book-grid-view.component';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';
import { MatLabel } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';

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
    InfiniteScrollModule,
    LoadingSpinnerOverlayComponent,
    MatFormField,
    MatIcon,
    MatButton,
    MatIconButton,
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
  public readonly SORT_OPTIONS: SortOption[] = [
    { value: 'title', name: 'По названию' },
    { value: 'isbn', name: 'По ISBN' },
    { value: 'recent_access', name: 'По посл. открытию' },
  ];
  protected readonly DEFAULT_PAGE_SIZE = CONSTANTS.PAGE_SIZE;
  protected readonly DEFAULT_SORT_OPTION = {
    value: 'recent_access',
    name: 'По посл. открытию',
  };
  protected readonly DEFAULT_SORT_ORDER = SortOrder.Asc;
  protected readonly SORT_OPTION_KEY = 'library-explorer-sort-option';
  protected readonly SORT_ORDER_KEY = 'library-explorer-sort-order';
  protected readonly VIEW_MODE_KEY = 'library-explorer-view-mode';

  public fileInputElement = viewChild<ElementRef<HTMLInputElement>>('bookFileInput');

  public books = signal<BookDto[]>([]);

  public currentPageNumber = signal<number>(1);
  public pageSize = signal<number>(this.DEFAULT_PAGE_SIZE);
  public selectedViewMode = signal<ViewMode>(ViewMode.List);

  public isLoading = signal<boolean>(false);

  public searchFormControl = new FormControl<string | null>(null, [Validators.minLength(3)]);
  public isSearchInFocus = signal<boolean>(false);
  public isInSearchMode: Signal<boolean> = computed(() => {
    const isInFocus = this.isSearchInFocus();
    return isInFocus || !!this.searchFormControl.value;
  });

  private _selectedSortOption = this.DEFAULT_SORT_OPTION;
  private _selectedSortOrder = this.DEFAULT_SORT_ORDER;
  private _pageCount = 0;

  constructor(
    private readonly _bookService: BookService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef,
  ) {
  }

  public ngOnInit(): void {
    this._loadViewSettings();
    this._subscribeToSearchChanges();
  }

  public ngOnDestroy(): void {
    this._saveViewSettings();
  }

  public get selectedSortOption(): SortOption {
    return this._selectedSortOption;
  }

  public get selectedSortOrder(): SortOrder {
    return this._selectedSortOrder;
  }

  public set selectedSortOption(value: SortOption) {
    this._selectedSortOption = value;
    this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
  }

  public set selectedSortOrder(value: SortOrder) {
    this._selectedSortOrder = value;
    this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
  }

  public onSearchInputFocus(): void {
    this.isSearchInFocus.set(true);
  }

  public onSearchInputBlur(): void {
    this.isSearchInFocus.set(false);
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

  public openBookAddDialog(file: File): void {
    this._dialog
      .open(BookEditDialogComponent, { minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH })
      .afterClosed()
      .pipe(
        mergeMap((data: BookEditDialogData | undefined) => {
          this.isLoading.set(true);
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
          this.isLoading.set(false);
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
    };
    this._dialog
      .open(BookEditDialogComponent, {
        data,
        minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH,
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
    const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        mergeMap((isConfirmed: boolean) => {
          if (!isConfirmed) return of(null);
          this.books.update((value) =>
            value.filter((v) => v.documentDetails.id !== book.documentDetails.id),
          );
          return this._bookService.deleteBook(book.documentDetails.id);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  public async openBook(book: BookDto): Promise<void> {
    await this._router.navigate(['viewer', book.documentDetails.id]);
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
    this.searchFormControl.valueChanges
      .pipe(
        tap(() => this.searchFormControl.markAsTouched()),
        debounceTime(500),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => {
        if (this.searchFormControl.invalid) return;
        this.currentPageNumber.set(1);
        this._loadPageOfBookList(1, this.pageSize());
      });
  }

  private _loadViewSettings(): void {
    const sortOptionName = sessionStorage.getItem(this.SORT_OPTION_KEY);
    const sortOption = this.SORT_OPTIONS.find(
      (option) => option.name === sortOptionName,
    );
    if (sortOption) this._selectedSortOption = sortOption;

    const sortOrderStringNumber = sessionStorage.getItem(this.SORT_ORDER_KEY);
    if (sortOrderStringNumber)
      this._selectedSortOrder = parseInt(sortOrderStringNumber);

    const viewModeStringNumber = sessionStorage.getItem(this.VIEW_MODE_KEY);
    if (viewModeStringNumber)
      this.selectedViewMode.set(parseInt(viewModeStringNumber));
  }

  private _saveViewSettings(): void {
    sessionStorage.setItem(this.SORT_OPTION_KEY, this.selectedSortOption.name);
    sessionStorage.setItem(this.SORT_ORDER_KEY, `${this._selectedSortOrder}`);
    sessionStorage.setItem(this.VIEW_MODE_KEY, `${this.selectedViewMode()}`);
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
