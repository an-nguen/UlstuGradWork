import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { BookCollectionDto, BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookCollectionListItemComponent } from '@core/components/book-collection-list-item/book-collection-list-item.component';

@Component({
  selector: 'app-book-collection-list',
  standalone: true,
  imports: [
    BookCollectionListItemComponent,
  ],
  templateUrl: './book-collection-list.component.html',
  styleUrl: './book-collection-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookCollectionListComponent {

  public bookCollections = input.required<BookCollectionDto[]>();

  public bookInfoClickEvent = output<BookDto>();
  public bookOpenClickEvent = output<BookDto>();
  public collectionEditClickEvent = output<BookCollectionDto>();
  public collectionDeleteClickEvent = output<BookCollectionDto>();
  
  public emitEditEvent(collection: BookCollectionDto): void {
    this.collectionEditClickEvent.emit(collection);
  }

  public emitDeleteEvent(collection: BookCollectionDto): void {
    this.collectionDeleteClickEvent.emit(collection);
  }
  
  public emitBookInfoClickEvent(book: BookDto): void {
    this.bookInfoClickEvent.emit(book);
  }

  public emitBookOpenClickEvent(book: BookDto): void {
    this.bookOpenClickEvent.emit(book);
  }
  
}
