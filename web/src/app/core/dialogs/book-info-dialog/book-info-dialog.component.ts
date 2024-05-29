import { ChangeDetectionStrategy, Component, computed, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { B } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { formatDuration, intervalToDuration } from 'date-fns';
import { ru } from 'date-fns/locale';

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

  public totalReadingTime = '-'
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData,
    private readonly _dialogRef: MatDialogRef<BookInfoDialogComponent>
  ) {
    this.book = dialogData.book;
    this.bookAuthors = dialogData.book.documentDetails.authors?.join('\n') ?? '-'
    const totalReadingTimeInSec = this.book.stats?.totalReadingTime ?? 0;
    if (totalReadingTimeInSec !== 0) {   
      const duration = intervalToDuration({ start: 0, end: totalReadingTimeInSec * 1000 });
      this.totalReadingTime = formatDuration(duration, { zero: true, locale: ru });
    }
  }

  public close(): void {
    this._dialogRef.close();
  }
  
}
