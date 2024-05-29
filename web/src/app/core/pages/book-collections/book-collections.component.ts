import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, signal } from '@angular/core';
import { BookCollectionService } from '@core/services/book-collection.service';
import { BookCollectionDto, BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BookCollectionEditDialogComponent } from '@core/dialogs/book-collection-edit-dialog/book-collection-edit-dialog.component';
import { CONSTANTS } from '@core/constants';
import { BookCollectionListComponent } from '@core/components/book-collection-list/book-collection-list.component';
import { DeleteConfirmationDialogComponent } from '@core/dialogs/delete-confirmation-dialog/delete-confirmation-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, mergeMap, NEVER, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { BookInfoDialogComponent } from '@core/dialogs/book-info-dialog/book-info-dialog.component';

@Component({
  selector: 'app-book-collections',
  standalone: true,
  imports: [
    MatButton,
    MatIconModule,
    BookCollectionListComponent,
  ],
  templateUrl: './book-collections.component.html',
  styleUrl: './book-collections.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCollectionsComponent implements OnInit {

  public bookCollections = signal<BookCollectionDto[]>([]);

  constructor(
    private readonly _service: BookCollectionService,
    private readonly _router: Router,
    private readonly _snackBar: MatSnackBar,
    private readonly _dialog: MatDialog,
    private readonly _destroyRef: DestroyRef,
  ) {
  }

  public ngOnInit(): void {
    this._loadCollections();
  }

  private _loadCollections(): void {
    this._service.getAll()
      .subscribe((collections) => {
        this.bookCollections.set(collections);
      });
  }

  public openBookCollectionEditDialog(collection?: BookCollectionDto): void {
    const dialogRef = this._dialog.open(BookCollectionEditDialogComponent, {
      minWidth: CONSTANTS.SIZE.DIALOG_MIN_WIDTH,
      data: {
        mode: !collection ? 'create' : 'update',
        bookCollection: collection,
      },
    });
    dialogRef.afterClosed()
      .pipe(
        mergeMap((requestObject) => {
          if (!requestObject) return NEVER;
          return !collection
            ? this._service.create(requestObject)
            : this._service.update(collection.id, requestObject);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((newOrModCollection) => this._handleDialogResponse(collection, newOrModCollection));
  }

  public openDeleteConfirmationDialog(collection: BookCollectionDto): void {
    const dialogRef = this._dialog.open(
      DeleteConfirmationDialogComponent,
      {
        data: {
          message: CONSTANTS.TEXTS.BOOK_COLLECTION_DEL_CONFIRM_MESSAGE,
        },
      },
    );
    dialogRef.afterClosed()
      .pipe(
        mergeMap((isConfirmed) => {
          if (!isConfirmed) return of(null);
          return this._service.delete(collection.id)
            .pipe(
              finalize(() => {
                this.bookCollections.update((value) =>
                  value.filter((bc) => bc.id !== collection.id),
                );
                this._snackBar.open(`Коллекция ${collection.name} успешно удалена`, 'OK');
              }),
            );
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _handleDialogResponse(collection?: BookCollectionDto, newOrModCollection?: BookCollectionDto) {
    if (!newOrModCollection) {
      return;
    }

    let message = `Коллекция ${newOrModCollection.name} успешно создана.`;
    if (!collection) {
      this.bookCollections.update((value) => [...value, newOrModCollection]);
    } else {
      this.bookCollections.update((value) => {
        const copy = [...value];
        const index = copy.findIndex(bc => bc.id === newOrModCollection.id);
        if (index === -1) {
          console.error('Failed to find a book collection');
          return copy;
        } else {
          copy[index] = newOrModCollection;
        }
        return copy;
      });
      message = `Коллекция ${newOrModCollection.name} успешно изменена.`;
    }
    this._snackBar.open(message, 'OK');
  }

  public openBook(book: BookDto): void {
    this._router.navigate(['viewer', book.documentDetails.id]);
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
  
}
