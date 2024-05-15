import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  input,
  Output,
} from '@angular/core';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';

@Component({
  selector: 'app-book-list-view',
  templateUrl: './book-list-view.component.html',
  styleUrl: './book-list-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListViewComponent {

  @Input()
  public showEditButton: boolean = true;
  @Input()
  public showDeleteButton: boolean = true;

  @Output()
  public readonly openItemEvent = new EventEmitter<BookDto>();
  @Output()
  public readonly editItemEvent = new EventEmitter<BookDto>();
  @Output()
  public readonly deleteItemEvent = new EventEmitter<BookDto>();

  public books = input.required<BookDto[]>();

  public handleOpenItemEvent(book: BookDto): void {
    this.openItemEvent.emit(book);
  }

  public handleDeleteItemEvent(book: BookDto): void {
    this.deleteItemEvent.emit(book);
  }

  public handleEditItemEvent(book: BookDto) {
    this.editItemEvent.emit(book);
  }
}
