import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteConfirmationDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
  ) { }

  public confirm(): void {
    this._dialogRef.close(true);
  }

  public cancel(): void {
    this._dialogRef.close(false);
  }
}
