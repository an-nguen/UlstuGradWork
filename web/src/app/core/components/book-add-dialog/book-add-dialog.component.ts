import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { BookMetadataDto } from '@core/dtos/BookManager.Application.Common.DTOs';

export interface BookAddDialogFormData {
  bookMetadata: Omit<BookMetadataDto, 'filename' | 'fileSizeInBytes' | 'fileType'>;
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
    publisherName: this._fb.control<string | null>(null)
  });

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<BookAddDialogComponent>,
  ) { }

  public addBook(): void {
    const values = this.bookForm.value;

    if (this.bookForm.invalid) return;
    const formData: BookAddDialogFormData = {
      bookMetadata: {
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

}
