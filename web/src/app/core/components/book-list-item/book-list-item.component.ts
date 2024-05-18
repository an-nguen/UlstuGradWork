import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  input,
  Output,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { format } from 'date-fns';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-book-list-item',
  templateUrl: './book-list-item.component.html',
  styleUrl: './book-list-item.component.scss',
  standalone: true,
  imports: [
    MatProgressBar,
    MatIconButton,
    MatIcon,
    NgOptimizedImage,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListItemComponent {
  
  protected readonly EMPTY_PLACEHOLDER = '-';

  @Input()
  public showEditButton: boolean = true;
  @Input()
  public showDeleteButton: boolean = true;
  @Input()
  public showProgression: boolean = true;

  @Output()
  public readonly editEvent = new EventEmitter<BookDto>();
  @Output()
  public readonly deleteEvent = new EventEmitter<BookDto>();

  public bookItem = input.required<BookDto>();

  public image = computed(() => {
    return (
      this._domSanitizer.bypassSecurityTrustResourceUrl(
        `${this.bookItem().documentDetails.thumbnailUrl}`
      ) ?? '/assets/images/noimage.png'
    );
  });

  public progressionValue = computed(() => {
    const item = this.bookItem();
    const lastViewedPage = item.stats?.lastViewedPage ?? 0;
    const pageCount = item.documentDetails.pageCount ?? 0;
    return Math.round((lastViewedPage / pageCount) * 100);
  });

  public recentAccessTime = computed(() => {
    const item = this.bookItem();
    if (!item.stats || !item.stats.recentAccessTime)
      return this.EMPTY_PLACEHOLDER;
    return format(item.stats.recentAccessTime, 'dd-MM-yyyy HH:mm');
  });

  constructor(private readonly _domSanitizer: DomSanitizer) {}

  public handleEditEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.editEvent.emit(this.bookItem());
  }

  public handleDeleteEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteEvent.emit(this.bookItem());
  }
  
}
