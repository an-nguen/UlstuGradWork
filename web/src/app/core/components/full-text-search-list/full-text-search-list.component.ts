import { ChangeDetectionStrategy, Component, EventEmitter, input, Output, output } from '@angular/core';
import { BookTextDto, FullTextSearchTreeEntryDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { FullTextSearchListItemComponent } from '../full-text-search-list-item/full-text-search-list-item.component';

@Component({
  selector: 'app-full-text-search-list',
  standalone: true,
  imports: [
    FullTextSearchListItemComponent,
  ],
  templateUrl: './full-text-search-list.component.html',
  styleUrl: './full-text-search-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullTextSearchListComponent {

  public entries = input<FullTextSearchTreeEntryDto[]>([]);

  @Output()
  public pageTextItemSelectedEvent = new EventEmitter<BookTextDto>();

  public emitSelectedEvent(event: BookTextDto): void {
    this.pageTextItemSelectedEvent.emit(event);
  }
}
