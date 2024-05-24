import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  Input,
  input, output,
  Output,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { format } from 'date-fns';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

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

  public readonly infoClickEvent = output();
  public readonly editClickEvent = output();
  public readonly deleteClickEvent = output();

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
  
  public isHandset = toSignal(this._breakpointObserver.observe([Breakpoints.Handset])
    .pipe(map((result) => result.matches)));
  
  constructor(
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _domSanitizer: DomSanitizer
  ) {}

  public handleEditEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.editClickEvent.emit();
  }

  public handleDeleteEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteClickEvent.emit();
  }

  public handleInfoClickEvent(event: MouseEvent): void {
    event.stopPropagation();
    this.infoClickEvent.emit()
  }

}
