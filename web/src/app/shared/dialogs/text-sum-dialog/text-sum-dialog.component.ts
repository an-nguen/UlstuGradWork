import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { TextSumDialogStateService } from '@core/stores/text-sum-dialog.state';

@Component({
  selector: 'app-text-sum-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatSnackBarModule, LoadingSpinnerOverlayComponent],
  templateUrl: './text-sum-dialog.component.html',
  styleUrl: './text-sum-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextSumDialogComponent {

  public readonly state = this._state.stateSignal;

  constructor(
    private readonly _state: TextSumDialogStateService,
    private readonly _dialogRef: MatDialogRef<TextSumDialogComponent>
  ) {
  }

  public close(): void {
    this._dialogRef.close();
  }

}
