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
import { BookReply } from '@core/interfaces/book-document-service';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {
  private readonly imageMimeType = 'data:image/jpg';

  public bookItem = input.required<BookReply>();

  public image = computed(() => {
    return this._domSanitizer.bypassSecurityTrustResourceUrl(
      `${this.imageMimeType};base64,${this.bookItem().thumbnailBase64}`
    );
  });

  constructor(private readonly _domSanitizer: DomSanitizer) {}

  @Output()
  public readonly shareEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly clickEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly editEvent = new EventEmitter<BookReply>();

  @Output()
  public readonly deleteEvent = new EventEmitter<BookReply>();

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

  public handleShareEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.shareEvent.emit(this.bookItem());
  }
}
