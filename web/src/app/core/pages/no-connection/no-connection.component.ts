import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-no-connection',
  standalone: true,
  imports: [],
  templateUrl: './no-connection.component.html',
  styleUrl: './no-connection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoConnectionComponent {}
