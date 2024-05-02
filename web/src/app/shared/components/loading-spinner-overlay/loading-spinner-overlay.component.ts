import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner-overlay',
  standalone: true,
  imports: [MatProgressSpinner],
  templateUrl: './loading-spinner-overlay.component.html',
  styleUrl: './loading-spinner-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerOverlayComponent {
  public loading = input.required<boolean>();
}
