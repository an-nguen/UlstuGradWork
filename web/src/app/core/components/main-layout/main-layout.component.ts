import { Component, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MenuItem } from '@core/components/titlebar-menu-button/titlebar-menu.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  protected readonly fileMenuItems: MenuItem[] = [
    {
      id: 'open-document',
      name: 'Open document...',
      routerLink: '',
    },
    {
      id: 'close-app',
      name: 'Exit',
    },
  ];

  @Output()
  public minimizeButtonClickEvent = new EventEmitter<void>();

  @Output()
  public toggleMaximizeButtonClickEvent = new EventEmitter<void>();

  @Output()
  public closeButtonClickEvent = new EventEmitter<void>();

  constructor(public readonly title: Title) {}

  public handleCloseBtnEvent(): void {
    this.closeButtonClickEvent.emit();
  }

  public handleMinimizeBtnEvent(): void {
    this.minimizeButtonClickEvent.emit();
  }

  public handleToggleMaximizeBtnEvent(): void {
    this.toggleMaximizeButtonClickEvent.emit();
  }
}
