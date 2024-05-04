import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BookAddDialogComponent, BookAddDialogFormData } from '@core/components/book-add-dialog/book-add-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CONSTANTS } from '@core/constants';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { NEVER, catchError, finalize, mergeMap, of, throwError } from 'rxjs';

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit {

  public loading = signal<boolean>(false);

  public books = signal<BookDto[]>([]);

  public pageNumber = signal<number>(0);
  public pageSize = signal<number>(10);

  constructor(
    private readonly _bookService: BookService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this.loadBookDocuments();
  }

  public loadBookDocuments(): void {
    this.loading.set(true);
    this._bookService.getBooks(this.pageNumber(), this.pageSize())
      .pipe(
        catchError(err => {
          console.log(err);
          this._snackBar.open(`Error: ${err}`, 'OK');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((books) => {
        this.books.set(books);
      });
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
        this.books.update(books => [...books, book]);
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
}
