import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { getBookFileType } from '@core/book-file-type';
import { SortOption } from '@core/components/sort-menu/sort-menu.component';
import { CONSTANTS } from '@core/constants';
import { BookEditDialogComponent, BookEditDialogData } from '@core/dialogs/book-edit-dialog/book-edit-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { BookDetailsUpdateDto, BookDto, BookMetadataDto, SortOrder } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { debounceTime, finalize, mergeMap, of } from 'rxjs';

enum ViewMode {
  List,
  Grid
}

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit {

  protected readonly DEFAULT_PAGE_SIZE = CONSTANTS.PAGE_SIZE;
  protected readonly DEFAULT_SORT_OPTION = { value: 'recent_access', name: 'По посл. открытию' };
  protected readonly DEFAULT_SORT_ORDER = SortOrder.Asc;

  public readonly SORT_OPTIONS: SortOption[] = [
    { value: 'title', name: 'По названию' },
    { value: 'isbn', name: 'По ISBN' },
    this.DEFAULT_SORT_OPTION
  ];

  private _selectedSortOption = this.DEFAULT_SORT_OPTION;
  private _selectedSortOrder = this.DEFAULT_SORT_ORDER;

  public ViewMode = ViewMode;

  public fileInputElement = viewChild<ElementRef<HTMLInputElement>>('bookFileInput');

  public loading = signal<boolean>(false);

  public books = signal<BookDto[]>([]);

  public currentPageNumber = signal<number>(1);
  public pageSize = signal<number>(this.DEFAULT_PAGE_SIZE);

  public search = new FormControl<string | null>(null);

  public selectedViewMode = signal<ViewMode>(ViewMode.List);

  constructor(
    private readonly _bookService: BookService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this._loadPageOfBookList(this.currentPageNumber());
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
    this._dialog.open(BookEditDialogComponent, { minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH_PX })
      .afterClosed()
      .pipe(
        mergeMap(
          (data: BookEditDialogData | undefined) => {
            this.loading.set(true);
            if (!data) return of(null);
            const bookMetadata: BookMetadataDto = {
              ...data.bookDetails,
              filename: file.name,
              fileSizeInBytes: file.size,
              fileType: getBookFileType(file.type),
            };
            return this._bookService.addBook(bookMetadata, file);
          }
        ),
        finalize(() => {
          this._resetFileInput();
          this.loading.set(false);
        }),
        takeUntilDestroyed(this._destroyRef))
      .subscribe((book) => {
        if (!book) return;
        this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
        this._snackBar.open(`Добавлена новая книга "${book.documentDetails.title}"`, 'OK', { duration: 3000 });
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
        publisherName: details.publisherName
      }
    };
    this._dialog.open(BookEditDialogComponent, { data })
      .afterClosed()
      .pipe(
        mergeMap((dialogReturnData: BookEditDialogData) => {
          this.loading.set(true);
          if (!dialogReturnData) return of(null);
          const modifiedDetails = dialogReturnData.bookDetails;
          const request: BookDetailsUpdateDto = {
            title: modifiedDetails.title,
            isbn: modifiedDetails.isbn,
            description: modifiedDetails.description,
            publisherName: modifiedDetails.publisherName
          };
          return this._bookService.updateBookDetails(book.documentDetails.id, request);
        }),
        finalize(() => {
          this._resetFileInput();
          this.loading.set(false);
        }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe((book) => {
        if (!book) return;
        this._loadPageOfBookList(1, this.pageSize() * this.currentPageNumber());
        this._snackBar.open(`Обновлены данные о книге "${book.documentDetails.title}"`, 'OK', { duration: 3000 });
      });
  }

  public deleteBook(book: BookDto): void {
    const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent);
    dialogRef.afterClosed()
      .pipe(
        mergeMap((isConfirmed: boolean) => {
          if (!isConfirmed) return of(null);
          this.books.update((value) => value.filter((v) => v.documentDetails.id !== book.documentDetails.id));
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
    const nextPage = this.currentPageNumber() + 1;
    this.currentPageNumber.set(nextPage);
    this._loadPageOfBookList(nextPage, this.DEFAULT_PAGE_SIZE, false);
  }

  private _loadPageOfBookList(pageNumber: number, pageSize: number = this.pageSize(), shouldReset: boolean = true): void {
    this.loading.set(true);
    this._bookService.getPage(pageNumber, pageSize, this.selectedSortOption.value, this.selectedSortOrder)
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe((books) => {
        if (!shouldReset) {
          this.books.update(prevItems => [...prevItems, ...books.items]);
        } else {
          this.books.set(books.items);
        }
      });
  }

  private _subscribeToSearchChanges(): void {
    this.search.valueChanges.pipe(
      debounceTime(500),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((value) => {

    });
  }

  private _resetFileInput(): void {
    this.fileInputElement()!.nativeElement.value = '';
  }

}
