import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

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

  public sortOptionChange = output<SortOption>();

  public onSortOptionSelected(option: SortOption): void {
    this.sortOptionChange.emit(option);
  }

}
