import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

interface DialogData {
  message?: string;
}

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

  public message?: string;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly _dialogData: DialogData,
    private readonly _dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
  ) { 
    this.message = this._dialogData.message;
  }
  
  public confirm(): void {
    this._dialogRef.close(true);
  }

  public cancel(): void {
    this._dialogRef.close(false);
  }

}
