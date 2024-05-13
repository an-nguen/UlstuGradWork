import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SortOrder } from '@core/dtos/BookManager.Application.Common.DTOs';

export interface SortOption {
  value: string,
  name: string;
}

@Component({
  selector: 'app-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrl: './sort-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortMenuComponent {

  public sortOptions = input.required<SortOption[]>();

  public sortOption = input<SortOption>();

  public sortOrder = input<SortOrder>(SortOrder.Asc);

  public sortOptionChange = output<SortOption>();

  public sortOrderChange = output<SortOrder>();

  public onSortOptionSelected(option: SortOption): void {
    this.sortOptionChange.emit(option);
  }

  public changeSortOrder(): void {
    this.sortOrderChange.emit(this.sortOrder() === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
  }

}
