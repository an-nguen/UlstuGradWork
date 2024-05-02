import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface MenuItem {
  id: string;
  name: string;
  routerLink?: string;
}

@Component({
  selector: 'app-titlebar-menu',
  templateUrl: './titlebar-menu.component.html',
  styleUrl: './titlebar-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitlebarMenuComponent {
  @Input({ required: true })
  public name: string = '';

  @Input()
  public menuItems: MenuItem[] = [];

  @Output()
  public menuItemClickEvent = new EventEmitter<MenuItem>();

  public handleMenuItemClick(_: MouseEvent, menuItem: MenuItem) {
    this.menuItemClickEvent.emit(menuItem);
  }
}
