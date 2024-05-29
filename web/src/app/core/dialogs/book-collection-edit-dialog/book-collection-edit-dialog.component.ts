import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Inject,
  signal,
  ViewChild,
} from '@angular/core';
import { BookCollectionDto, BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { BookService } from '@core/services/book.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { startWith, switchMap } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatProgressBar } from '@angular/material/progress-bar';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface DialogData {
  mode?: 'create' | 'update';
  bookCollection?: Omit<BookCollectionDto, 'id'>;
}

@Component({
  selector: 'app-book-collection-edit-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    DigitOnlyModule,
    MatTooltipModule,
    MatDialogActions,
    MatButtonModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckbox,
    MatProgressBar,
    LoadingSpinnerOverlayComponent,
  ],
  templateUrl: './book-collection-edit-dialog.component.html',
  styleUrl: './book-collection-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCollectionEditDialogComponent implements AfterViewInit {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление новой коллекции книг';
  protected readonly EDIT_DIALOG_TITLE = 'Изменить коллекцию книг';

  @ViewChild(MatPaginator)
  public paginator!: MatPaginator;

  public nameFormControl = this._fb.nonNullable.control<string>('', [Validators.required]);

  public isEditMode = signal<boolean>(false);
  public dialogTitle = computed(() => {
    return this.isEditMode()
      ? this.EDIT_DIALOG_TITLE
      : this.CREATION_DIALOG_TITLE;
  });

  public itemCount = 0;
  public pageSizeOptions = [10, 25, 50];
  public displayedColumns = ['select', 'title', 'authors'];
  public books: BookDto[] = [];
  public selection = new SelectionModel<BookDto>(true, 
    [], 
    undefined, 
    (a, b) => a.documentDetails.id === b.documentDetails.id);
  public isBooksLoading = signal<boolean>(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly _data: DialogData,
    private readonly _booksService: BookService,
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookCollectionEditDialogComponent>,
    private readonly _destroyRef: DestroyRef,
  ) {
    this._initForm();
    this.isEditMode.set(this._data.mode === 'update');
  }

  public ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isBooksLoading.set(true);
          return this._booksService.getPage(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe((page) => {
        this.books = page.items;
        this.itemCount = page.totalItemCount;
        this.isBooksLoading.set(false);
      });
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.itemCount;
    return numSelected === numRows;
  }

  public toggleAllRows() {
    if (!this.selection.selected.length) {
      this.selection.select(...this.books);
    } else {
      this.selection.clear();
    }
  }

  public checkboxLabel(index: number, row?: BookDto): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${index + 1}`;
  }

  public toggleBookItem(row: BookDto): void {
    this.selection.toggle(row);
  }

  public isBookSelected(row: BookDto): boolean {
    return this.selection.isSelected(row);
  }

  public save(): void {
    if (this.nameFormControl.invalid) return;
    const request = {
      name: this.nameFormControl.value,
      books: this.selection.selected,
    };

    this._dialogRef.close(request);
  }

  public close(): void {
    this._dialogRef.close();
  }

  private _initForm(): void {
    this.nameFormControl.patchValue(this._data.bookCollection?.name ?? '');
    if (this._data.bookCollection?.books) {
      this.selection.select(...this._data.bookCollection.books);
    }
  }

}
