import { ChangeDetectionStrategy, Component, Inject, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';

export interface BookEditDialogData {
  mode?: 'create' | 'update';
  bookDetails: Omit<BookMetadataDto, 'filename' | 'fileSizeInBytes' | 'fileType'>;
}

@Component({
  selector: 'app-book-edit-dialog',
  templateUrl: './book-edit-dialog.component.html',
  styleUrl: './book-edit-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookEditDialogComponent implements OnInit {

  protected readonly CREATION_DIALOG_TITLE = 'Добавление новой книги';
  protected readonly EDIT_DIALOG_TITLE = 'Обновление информации о книге';

  public bookForm = this._fb.group({
    title: this._fb.control<string | null>(null),
    description: this._fb.control<string | null>(null),
    isbn: this._fb.control<string | null>(null, [Validators.pattern('^([0-9]{10}|[0-9]{13})|null$')]),
    publisherName: this._fb.control<string | null>(null)
  });

  public isEditMode = signal<boolean>(false);

  public dialogTitle = computed(() => {
    return this.isEditMode() ? this.EDIT_DIALOG_TITLE : this.CREATION_DIALOG_TITLE;
  });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: BookEditDialogData
  ) { }

  public ngOnInit(): void {
    this.isEditMode.set(this.dialogData?.mode === 'update');
    this._initForm();
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
      }
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
    });
  }

}
