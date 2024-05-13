import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {

  protected readonly SIDENAV_COLLAPSED_WIDTH = 48;
  protected readonly SIDENAV_EXPANDED_WIDTH = 240;

  public routeLinks = [
    {
      iconCode: 'library_books',
      name: 'Все книги',
      link: '/'
    },
    {
      iconCode: 'schedule',
      name: 'Недавние',
      link: 'recent'
    }
  ];

  public isExpanded = false;

  public toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

}
