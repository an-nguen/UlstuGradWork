import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  Inject, OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { BookCollectionDto, BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
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
import { CONSTANTS } from '@core/constants';

interface DialogData {
  mode?: 'create' | 'update';
  allBookCollections: BookCollectionDto[];
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
export class BookCollectionEditDialogComponent implements OnInit, AfterViewInit {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление новой коллекции книг';
  protected readonly EDIT_DIALOG_TITLE = 'Изменить коллекцию книг';
  protected readonly UNIQUENESS_ERROR_MESSAGE = 'Коллекция с данным названием уже существует!';

  @ViewChild(MatPaginator)
  public paginator!: MatPaginator;

  public nameFormControl = this._fb.nonNullable.control<string>(
    '',
    [
      Validators.required,
    ],
  );

  public isEditMode = signal<boolean>(false);
  public dialogTitle = computed(() => {
    return this.isEditMode()
      ? this.EDIT_DIALOG_TITLE
      : this.CREATION_DIALOG_TITLE;
  });
  public isBooksLoading = signal<boolean>(false);

  public itemCount = 0;
  public pageSizeOptions = [10, 25, 50];
  public displayedColumns = ['select', 'title', 'authors'];
  public books: BookDto[] = [];
  public selection = new SelectionModel<BookDto>(true,
    [],
    undefined,
    (a, b) => a.documentDetails.id === b.documentDetails.id);
  public errorMessage = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly _data: DialogData,
    private readonly _booksService: BookService,
    private readonly _cdr: ChangeDetectorRef,
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookCollectionEditDialogComponent>,
    private readonly _destroyRef: DestroyRef,
  ) {
    this._initForm();
    this.isEditMode.set(this._data.mode === 'update');
  }

  public ngOnInit(): void {
    this.nameFormControl.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this._updateErrorMessage());
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
    if (this._data.allBookCollections && this._data.allBookCollections.length) {
      this.nameFormControl.addValidators(this._createValueExistsValidator(this._data.allBookCollections.map(c => c.name)));
    }
    if (this._data.bookCollection?.books) {
      this.selection.select(...this._data.bookCollection.books);
    }
  }

  private _updateErrorMessage(): void {
    if (this.nameFormControl.hasError('isNotUnique')) {
      this.errorMessage = this.UNIQUENESS_ERROR_MESSAGE;
    } else if (this.nameFormControl.hasError('required')) {
      this.errorMessage = CONSTANTS.TEXTS.FORM_REQUIRED_ERROR_MESSAGE;
    } else {
      this.errorMessage = '';
    }
    this._cdr.markForCheck();
  }

  private _createValueExistsValidator(values: string[]): ValidatorFn {
    return (control) => {
      if (values.includes(control.value)) {
        return { isNotUnique: true };
      }
      return null;
    };
  }

}
