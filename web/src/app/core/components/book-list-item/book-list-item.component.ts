import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  HostListener,
  input,
  Output,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { format } from 'date-fns';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {

  protected readonly EMPTY_PLACEHOLDER = '-';

  public bookItem = input.required<BookDto>();

  public image = computed(() => {
    return this._domSanitizer.bypassSecurityTrustResourceUrl(
      `${this.bookItem().documentDetails.thumbnailUrl}`
    );
  });

  public recentAccessTime = computed(() => {
    const item = this.bookItem();
    if (!item.stats || !item.stats.recentAccessTime) return this.EMPTY_PLACEHOLDER;
    return format(item.stats.recentAccessTime, 'dd-MM-yyyy HH:mm');
  });

  constructor(private readonly _domSanitizer: DomSanitizer) { }

  @Output()
  public readonly clickEvent = new EventEmitter<BookDto>();

  @Output()
  public readonly editEvent = new EventEmitter<BookDto>();

  @Output()
  public readonly deleteEvent = new EventEmitter<BookDto>();

  @HostListener('click')
  public handleClickEvent(): void {
    this.clickEvent.emit(this.bookItem());
  }

  public handleEditEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.editEvent.emit(this.bookItem());
  }

  public handleDeleteEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteEvent.emit(this.bookItem());
  }
}
