import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BookAddDialogComponent, BookAddDialogFormData } from '@core/components/book-add-dialog/book-add-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CONSTANTS } from '@core/constants';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { NEVER, catchError, debounceTime, finalize, mergeMap, of, throwError } from 'rxjs';

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit {

  public readonly pageSizeOptions = [5, 10, 25];

  public loading = signal<boolean>(false);

  public books = signal<BookDto[]>([]);

  public pageNumber = signal<number>(1);
  public pageCount = signal<number>(0);
  public _pageSize = this.pageSizeOptions[0];

  public search = new FormControl<string | null>(null);

  constructor(
    private readonly _bookService: BookService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this._loadBookDocuments();
  }

  public set pageSize(value: number) {
    this._pageSize = value;
    this._loadBookDocuments();
  }

  public get pageSize(): number {
    return this._pageSize;
  }

  public openBookAddDialog(): void {
    this._dialog.open(BookAddDialogComponent, { minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH_PX })
      .afterClosed()
      .pipe(
        mergeMap(
          (data: BookAddDialogFormData | undefined) => {
            if (!data) return NEVER;

            return this._bookService.addBook(data.bookMetadata, data.file);
          }
        ),
        takeUntilDestroyed(this._destroyRef))
      .subscribe((book) => {
        this._loadBookDocuments();
        this._snackBar.open(`Добавлена новая книга ${book.documentDetails.title}`, 'OK', { duration: 3000 });
      });
  }

  public editBookDetails(book: BookDto): void {
    this._router.navigate(['edit', book.documentDetails.id], { relativeTo: this._route });
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
    await this._router.navigate(['viewer', book.documentDetails.id], {
      relativeTo: this._route,
    });
  }

  public goToPrevPage(): void {
    const previousPage = this.pageNumber() - 1;
    if (previousPage < 0 || previousPage > this.pageCount()) {
      return;
    }

    this.pageNumber.set(previousPage);
    this._loadBookDocuments();
  }

  public goToNextPage(): void {
    const nextPage = this.pageNumber() + 1;
    if (nextPage < 0 || nextPage > this.pageCount()) {
      return;
    }

    this.pageNumber.set(nextPage);
    this._loadBookDocuments();
  }

  private _subscribeToSearchChanges(): void {
    this.search.valueChanges.pipe(
      debounceTime(500),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((value) => {

    });
  }

  private _loadBookDocuments(): void {
    this.loading.set(true);
    this._bookService.getPage(this.pageNumber(), this._pageSize)
      .pipe(
        catchError(err => {
          console.log(err);
          this._snackBar.open(`Error: ${err}`, 'OK');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((books) => {
        this.books.set(books.items);
        this.pageCount.set(books.pageCount);
      });
  }
}
