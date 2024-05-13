import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'button[app-icon-button]',
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  standalone: true,
  imports: [MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [MatRipple]
})
export class IconButtonComponent {
  public active = input<boolean>(false);
}
