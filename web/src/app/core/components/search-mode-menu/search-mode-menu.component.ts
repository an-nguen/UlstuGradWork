import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SearchMode } from '@core/enums/search-mode';

@Component({
  selector: 'app-search-mode-menu',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: './search-mode-menu.component.html',
  styleUrl: './search-mode-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchModeMenuComponent {

  public readonly searchMode = input<SearchMode>(SearchMode.Metadata);
  public readonly searchModeChange = output<SearchMode>();
  public readonly isOpen = output<boolean>();

  public menuItems = [
    {
      name: 'По метаданным',
      value: SearchMode.Metadata
    },
    {
      name: 'По тексту книг',
      value: SearchMode.FullText
    }
  ]

  public setOpen(value: boolean): void {
    this.isOpen.emit(value);
  }

  public setSearchMode(value: SearchMode): void {
    this.searchModeChange.emit(value);
  }

}
