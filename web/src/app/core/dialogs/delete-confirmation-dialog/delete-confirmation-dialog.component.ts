import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-delete-confirmation-dialog',
  templateUrl: './delete-confirmation-dialog.component.html',
  styleUrl: './delete-confirmation-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatDialogActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
