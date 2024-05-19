import { ChangeDetectionStrategy, Component, computed, Inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DigitOnlyModule } from '@uiowa/digit-only';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIcon, MatIconModule } from '@angular/material/icon';

export interface BookEditDialogData {
  mode?: 'create' | 'update';
  bookDetails: Omit<
    BookMetadataDto,
    'filename' | 'fileSizeInBytes' | 'fileType'
  >;
}

@Component({
  selector: 'app-book-edit-dialog',
  templateUrl: './book-edit-dialog.component.html',
  styleUrl: './book-edit-dialog.component.scss',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookEditDialogComponent implements OnInit {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление новой книги';
  protected readonly EDIT_DIALOG_TITLE = 'Обновление информации о книге';
  
  public isEditMode = signal<boolean>(false);
  
  public bookForm = this._fb.group({
    title: this._fb.control<string | null>(null),
    description: this._fb.control<string | null>(null),
    isbn: this._fb.control<string | null>(null, [
      Validators.pattern('^([0-9]{10}|[0-9]{13})|null$'),
    ]),
    publisherName: this._fb.control<string | null>(null),
    authors: this._fb.control<string[]>([]),
  });

  public authorNameInputControl = this._fb.control<string | null>(null);

  public dialogTitle = computed(() => {
    return this.isEditMode()
      ? this.EDIT_DIALOG_TITLE
      : this.CREATION_DIALOG_TITLE;
  });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: BookEditDialogData,
  ) {
    this._initForm();
  }

  public ngOnInit(): void {
    this.isEditMode.set(this.dialogData?.mode === 'update');
  }

  public addAuthor(): void {
    if (this.authorNameInputControl.invalid || !this.authorNameInputControl.value) return;
    this.bookForm.patchValue({
      authors: [
        ...this.bookForm.value.authors ?? [],
        this.authorNameInputControl.value,
      ],
    });
    this.authorNameInputControl.reset();
  }
  
  public deleteAuthor(index: number): void {
    this.bookForm.patchValue({
      authors: this.bookForm.value.authors?.filter((_, i) => i !== index)
    });
  }
  
  public saveBook(): void {
    const values = this.bookForm.value;

    if (this.bookForm.invalid) return;
    const formData: BookEditDialogData = {
      bookDetails: {
        title: values.title ?? undefined,
        description: values.description ?? undefined,
        isbn: values.isbn ?? undefined,
        publisherName: values.publisherName ?? undefined,
        authors: values.authors ?? undefined,
      },
    };
    this._dialogRef.close(formData);
  }

  public close(): void {
    this._dialogRef.close();
  }

  private _initForm(): void {
    const dialogData = this.dialogData?.bookDetails;
    if (!dialogData) return;
    this.bookForm.setValue({
      title: dialogData.title ?? null,
      description: dialogData.description ?? null,
      isbn: dialogData.isbn ?? null,
      publisherName: dialogData.publisherName ?? null,
      authors: dialogData.authors ?? [],
    });
  }
  
}
