import { ChangeDetectionStrategy, Component, computed, EventEmitter, input, Output, output, SecurityContext } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BookTextDto, FullTextSearchTreeEntryDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookListItemComponent } from '../book-list-item/book-list-item.component';

@Component({
  selector: 'app-full-text-search-list-item',
  standalone: true,
  imports: [
    MatListModule,
    BookListItemComponent,
  ],
  templateUrl: './full-text-search-list-item.component.html',
  styleUrl: './full-text-search-list-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullTextSearchListItemComponent {

  public entry = input.required<FullTextSearchTreeEntryDto>()
  public texts = computed(() => this.entry().texts.sort((a, b) => (a.pageNumber ?? 0) - (b.pageNumber ?? 0)));

  @Output()
  public selectedEvent = new EventEmitter<BookTextDto>();

  constructor(
    private readonly _domSanitizer: DomSanitizer,
  ) {
  }

  public getSanitizedHtml(htmlStr: string): string | null {
    return this._domSanitizer.sanitize(SecurityContext.HTML, htmlStr);
  }

  public emitSelectedEvent(bookText: BookTextDto): void {
    this.selectedEvent.emit(bookText);
  }

}
