import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';

@Component({
  selector: 'app-book-grid-view',
  templateUrl: './book-grid-view.component.html',
  styleUrl: './book-grid-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookGridViewComponent {
  public books = input.required<BookDto[]>();
}
