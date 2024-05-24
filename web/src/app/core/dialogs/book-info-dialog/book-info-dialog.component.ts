import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { B } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface DialogData {
  book: BookDto
}

@Component({
  selector: 'app-book-info-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, DatePipe],
  templateUrl: './book-info-dialog.component.html',
  styleUrl: './book-info-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookInfoDialogComponent {
  
  public book: BookDto;
  
  public bookAuthors: string;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private readonly _dialogRef: MatDialogRef<BookInfoDialogComponent>
  ) {
    this.book = dialogData.book;
    this.bookAuthors = dialogData.book.documentDetails.authors?.join('\n') ?? '-'
  }

  public close(): void {
    this._dialogRef.close();
  }
  
}
