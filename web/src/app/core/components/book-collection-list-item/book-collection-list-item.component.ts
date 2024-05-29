import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BookCollectionDto, BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookGridItemComponent } from '@core/components/book-grid-item/book-grid-item.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-book-collection-list-item',
  standalone: true,
  imports: [
    BookGridItemComponent,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './book-collection-list-item.component.html',
  styleUrl: './book-collection-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookCollectionListItemComponent {

  public bookCollection = input.required<BookCollectionDto>();
  
  public bookOpenBtnClickEvent = output<BookDto>();
  public bookInfoBtnClickEvent = output<BookDto>();
  public editBtnClickEvent = output<void>();
  public deleteBtnClickEvent = output<void>();
  
  public emitBookOpenBtnClickEvent(book: BookDto): void {
    this.bookOpenBtnClickEvent.emit(book);
  }

  public emitBookInfoBtnClickEvent(book: BookDto): void {
    this.bookInfoBtnClickEvent.emit(book);
  }
  
  public emitEditBtnClickEvent(): void {
    this.editBtnClickEvent.emit();
  }

  public emitDeleteBtnClickEvent(): void {
    this.deleteBtnClickEvent.emit();
  }
  
}
