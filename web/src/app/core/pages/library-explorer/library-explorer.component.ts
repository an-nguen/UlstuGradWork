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
import { ActivatedRoute, Router } from '@angular/router';
import { getBookFileType } from '@core/book-file-type';
import { BookAddDialogComponent, BookAddDialogFormData } from '@core/components/book-add-dialog/book-add-dialog.component';
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { CONSTANTS } from '@core/constants';
import { BookDto, BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { AuthService } from '@core/services/auth.service';
import { BookService } from '@core/services/book.service';
import { NEVER, debounceTime, finalize, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit {

  protected readonly PAGE_SIZE = CONSTANTS.PAGE_SIZE;

  public fileInputElement = viewChild<ElementRef<HTMLInputElement>>('bookFileInput');

  public loading = signal<boolean>(false);

  public books = signal<BookDto[]>([]);

  public pageNumber = signal<number>(1);
  public pageCount = signal<number>(0);

  public search = new FormControl<string | null>(null);

  public isSidenavOpened = false;

  constructor(
    private readonly _bookService: BookService,
    private readonly _authService: AuthService,
    private readonly _dialog: MatDialog,
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _snackBar: MatSnackBar,
    private readonly _destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this._loadBookDocuments();
  }

  public onFileInputChange(e: Event) {
    if (!this.fileInputElement()?.nativeElement.files || !this.fileInputElement()?.nativeElement.files?.length) {
      return;
    }
    const files = this.fileInputElement()!.nativeElement.files!;
    const file = files[0];
    if (!file || !(file instanceof File)) {
      return;
    }

    this.openBookAddDialog(file);
  }

  public openBookAddDialog(file: File): void {
    this._dialog.open(BookAddDialogComponent, { minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH_PX })
      .afterClosed()
      .pipe(
        mergeMap(
          (data: BookAddDialogFormData | undefined) => {
            if (!data) return NEVER;
            const bookMetadata: BookMetadataDto = {
              ...data.bookMetadata,
              filename: file.name,
              fileSizeInBytes: file.size,
              fileType: getBookFileType(file.type),
            };
            return this._bookService.addBook(bookMetadata, file);
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

  public toggleSidenav(): void {
    this.isSidenavOpened = !this.isSidenavOpened;
  }

  public signOut(): void {
    this._authService.signOut()
      .subscribe(() => {
        this._snackBar.open('Вы вышли из системы.', 'OK', { duration: 1500 });
        this._router.navigate([CONSTANTS.ENDPOINTS.AUTH.PATH, CONSTANTS.ENDPOINTS.AUTH.SIGN_IN]);
      });
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
    this._bookService.getPage(this.pageNumber(), this.PAGE_SIZE)
      .pipe(
        finalize(() => this.loading.set(false)),
      )
      .subscribe((books) => {
        this.books.set(books.items);
        this.pageCount.set(books.pageCount);
      });
  }

}
