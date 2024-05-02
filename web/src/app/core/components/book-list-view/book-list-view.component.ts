import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Output,
} from '@angular/core';
import { BookReply } from '@core/interfaces/book-document-service';

@Component({
  selector: 'app-book-list-view',
  templateUrl: './book-list-view.component.html',
  styleUrl: './book-list-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListViewComponent {
  @Output()
  public readonly openItemEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly shareItemEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly editItemEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly deleteItemsEvent = new EventEmitter<BookReply[]>();

  public books = input.required<BookReply[]>();

  public handleOpenItemEvent(book: BookReply): void {
    this.openItemEvent.emit(book);
  }

  public handleShareItemEvent(book: BookReply): void {
    this.shareItemEvent.emit(book);
  }

  public handleDeleteItemEvent(book: BookReply): void {
    this.deleteItemsEvent.emit([book]);
  }

  public handleEditItemEvent(book: BookReply) {
    this.editItemEvent.emit(book);
  }
}
