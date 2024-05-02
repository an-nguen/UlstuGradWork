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
import { DeleteConfirmationDialogComponent } from '@core/components/delete-confirmation-dialog/delete-confirmation-dialog.component';
import {
  BookDocumentService,
  BookReply,
} from '@core/interfaces/book-document-service';
import { DeviceReply, DeviceService } from '@core/interfaces/device-service';
import { WindowService } from '@core/interfaces/window-service';
import { catchError, finalize, from, mergeMap, of, throwError } from 'rxjs';
import { DeviceListDialogComponent } from '../../components/device-list-dialog/device-list-dialog.component';

@Component({
  selector: 'app-library-explorer',
  templateUrl: './library-explorer.component.html',
  styleUrl: './library-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryExplorerComponent implements OnInit {
  public loading = signal<boolean>(false);

  public books = signal<BookReply[]>([]);

  constructor(
    private readonly _bookDocumentService: BookDocumentService,
    private readonly _deviceService: DeviceService,
    private readonly _windowService: WindowService,
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
    from(this._bookDocumentService.getBookDocuments())
      .pipe(
        catchError(err => {
          console.log(err);
          this._snackBar.open(`Error: ${err}`, 'OK');
          return throwError(() => err);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((books) => {
        this.books.set(books);
      });
  }

  public async openSelectFileDialog(): Promise<void> {
    const selectedFilepaths = await this._windowService.showOpenDialog();
    if (selectedFilepaths.length === 0) return;
    const added =
      await this._bookDocumentService.addBookDocuments(selectedFilepaths);
    this.books.update(books => [
      ...books,
      ...added,
    ]);
  }

  public editBookDetails(book: BookReply): void {
    this._router.navigate(['edit', book.id], { relativeTo: this._route });
  }

  public async deleteBooks(bookDocuments: BookReply[]): Promise<void> {
    const dialogRef = this._dialog.open(DeleteConfirmationDialogComponent);
    dialogRef.afterClosed()
      .pipe(
        mergeMap((isConfirmed: boolean) => {
          if (!isConfirmed) return of(null);
          this.books.update((value) =>
            value.filter((v) => !bookDocuments.includes(v))
          );
          return from(this._bookDocumentService.deleteBookDocuments(
            bookDocuments.map((doc) => doc.id)
          ));
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  public async shareBook(bookDocument: BookReply): Promise<void> {
    const devices = await this._deviceService.getDeviceList();
    const dialog = this._dialog.open(DeviceListDialogComponent, {
      data: {
        devices,
      },
    });
    dialog
      .afterClosed()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((selectedDevice: DeviceReply) => {
        if (!selectedDevice) return;
        const request = {
          bookId: bookDocument.id,
          deviceId: selectedDevice.id,
          pageNumber: 0,
        };
        this._bookDocumentService
          .shareBook(request)
          .then(() => console.log('Share book request'));
      });
  }

  public async openBook(bookDocument: BookReply): Promise<void> {
    await this._router.navigate(['viewer', bookDocument.id], {
      relativeTo: this._route,
    });
  }
}
