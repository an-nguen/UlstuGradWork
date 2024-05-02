import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'button[app-titlebar-window-button]',
  templateUrl: './titlebar-window-button.component.html',
  styleUrl: './titlebar-window-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitlebarWindowButtonComponent {}
