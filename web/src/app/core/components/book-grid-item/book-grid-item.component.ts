import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';

@Component({
  selector: 'app-book-grid-item',
  templateUrl: './book-grid-item.component.html',
  styleUrl: './book-grid-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookGridItemComponent {
  public bookItem = input.required<BookDto>();
}
