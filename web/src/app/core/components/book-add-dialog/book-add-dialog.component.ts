import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { getBookFileType } from '@core/dtos/book-file-type';
import { map } from 'rxjs';

export interface BookAddDialogFormData {
  bookMetadata: BookMetadataDto;
  file: File;
}

@Component({
  selector: 'app-book-add-dialog',
  templateUrl: './book-add-dialog.component.html',
  styleUrl: './book-add-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookAddDialogComponent {

  public bookForm = this._fb.group({
    title: this._fb.control<string | null>(null),
    description: this._fb.control<string | null>(null),
    isbn: this._fb.control<string | null>(null, [Validators.pattern('^([0-9]{10}|[0-9]{13})|null$')]),
    publisherName: this._fb.control<string | null>(null),
    file: this._fb.control<File | null>(null, [Validators.required])
  });

  public bookFileName = this.bookForm.valueChanges.pipe(map((data) => data.file?.name ?? 'Файл книги не выбран'));

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookAddDialogComponent>,
  ) { }

  public addBook(): void {
    const values = this.bookForm.value;

    if (this.bookForm.invalid || !values.file) return;
    const file = values.file;
    const formData: BookAddDialogFormData = {
      bookMetadata: {
        title: values.title ?? undefined,
        description: values.description ?? undefined,
        isbn: values.isbn ?? undefined,
        publisherName: values.publisherName ?? undefined,
        filename: file.name,
        fileSizeInBytes: file.size,
        fileType: getBookFileType(file.type)
      },
      file
    };
    this._dialogRef.close(formData);
  }

  public close(): void {
    this._dialogRef.close();
  }

  public setFileInForm(event: Event): void {
    if (!(event.target instanceof HTMLInputElement) || !event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    if (!(file instanceof File)) {
      return;
    }
    this.bookForm.patchValue({ file });
  }

}
